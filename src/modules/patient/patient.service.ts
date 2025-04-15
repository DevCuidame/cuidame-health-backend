import { MedicalInfoRepository } from '../../modules/medical-info/medical-info.repository';
import { PatientRepository } from './patient.repository';
import { HealthRepository } from '../../modules/health/health.repository';
import { CreatePatientDto, UpdatePatientDto } from './patient.dto';
import { Patient } from '../../models/patient.model';
import { FileUploadService } from '../../utils/file-upload.util';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../utils/error-handler';
import {
  PaginatedResult,
  PaginationParams,
} from '../../core/interfaces/response.interface';
import { CodeRepository } from '../code/code.repository';

export class PatientService {
  private patientRepository: PatientRepository;
  private medicalInfoRepository: MedicalInfoRepository;
  private healthRepository: HealthRepository;
  private codeRepository: CodeRepository;

  constructor() {
    this.patientRepository = new PatientRepository();
    this.medicalInfoRepository = new MedicalInfoRepository();
    this.healthRepository = new HealthRepository();
    this.codeRepository = new CodeRepository();
  }

  /**
   * Crear un nuevo paciente
   * @param patientData Datos del paciente
   * @param caregiverId ID del cuidador que crea el paciente
   * @returns Paciente creado
   */
  async createPatient(
    patientData: CreatePatientDto,
    caregiverId: number
  ): Promise<Patient> {
    console.log('🚀 ~ PatientService ~ patientData:', patientData);
    try {
      // Verificar si ya existe un paciente con el mismo número de identificación
      const patientExists = await this.patientRepository.existsByNumeroid(
        patientData.numeroid
      );
      if (patientExists) {
        throw new BadRequestError(
          `Ya existe un paciente con el número de identificación`
        );
      }

      // Obtener un código disponible desde la tabla codes
      if (!patientData.code) {
        const hashcode = await this.codeRepository.getAvailableCodeForPatient();
        patientData.code = hashcode;
      } else {
        const code = await this.codeRepository.findByCode(patientData.code);
        patientData.code = code!.hashcode;
      }

      const {
        id, // Eliminamos cualquier id que venga
        public_name, // Eliminamos esta propiedad que no está en la entidad
        departamento: departamentoParam,
        ...cleanedData
      } = patientData as any;

      // Convertimos departamento a string si viene como número
      const departamento =
        typeof departamentoParam === 'number'
          ? departamentoParam.toString()
          : departamentoParam;

      // Extraer imagen base64 si existe
      const imageBase64 = patientData.imagebs64;

      const patient = await this.patientRepository.create({
        ...cleanedData,
        departamento,
        a_cargo_id: caregiverId,
        photourl: '',
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Si hay imagen, guardarla y actualizar la URL de la foto
      let photoUrl = '';
      if (imageBase64) {
        try {
          // Guardar imagen usando el servicio de utilidad
          photoUrl = await FileUploadService.saveBase64Image(
            imageBase64,
            'patients', // Carpeta: patients
            'profile' // Nombre base: profile
          );

          if (photoUrl) {
            // Actualizar la URL en la base de datos
            await this.patientRepository.update(
              patient.id,
              {
                photourl: photoUrl,
                updated_at: new Date(),
              },
              'Paciente'
            );

            await this.patientRepository.update(
              patient.id,
              {
                imagebs64: null,
                updated_at: new Date(),
              },
              'Paciente	'
            );

            // Actualizar el objeto del paciente antes de devolverlo
            patient.photourl = photoUrl;
          }
        } catch (error) {
          console.error('Error al guardar imagen de paciente:', error);
          // No fallamos el proceso completo si hay error en la imagen
        }
      }

      return patient;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new BadRequestError(
          'No hay códigos disponibles para asignar al paciente. Por favor, contacte al administrador.'
        );
      }
      throw error;
    }
  }

  /**
   * Obtener un paciente por ID
   * @param patientId ID del paciente
   * @param caregiverId ID del cuidador (para verificar permisos)
   * @returns Paciente encontrado
   */
  async getPatientById(
    patientId: number,
    caregiverId?: number
  ): Promise<Patient> {
    const patient = await this.patientRepository.findById(patientId);

    if (!patient) {
      throw new NotFoundError(`Paciente con ID ${patientId} no encontrado`);
    }

    // Si se proporciona el ID del cuidador, verificar que tenga permisos
    if (caregiverId && patient.a_cargo_id !== caregiverId) {
      throw new ForbiddenError(
        'No tienes permiso para acceder a este paciente'
      );
    }

    return patient;
  }

  /**
   * Obtener detalles completos de un paciente
   * @param patientId ID del paciente
   * @param caregiverId ID del cuidador (para verificar permisos)
   * @returns Todos los datos del paciente y su información médica
   */
  async getPatientFullDetails(
    patientId: number,
    caregiverId?: number
  ): Promise<any> {
    // Verificar permisos
    const patient = await this.getPatientById(patientId, caregiverId);

    // Obtener información médica completa
    const medicalInfo = await this.medicalInfoRepository.getAllMedicalInfo(
      patientId
    );

    // Obtener últimos signos vitales
    const latestVitals = await this.healthRepository.getLatestVitals(patientId);

    return {
      ...patient,
      medicalInfo,
      vitals: latestVitals,
    };
  }

  /**
   * Obtener pacientes por cuidador
   * @param caregiverId ID del cuidador
   * @returns Lista de pacientes a cargo del cuidador
   */
  async getPatientsByCaregiver(caregiverId: number): Promise<Patient[]> {
    return await this.patientRepository.findByCaregiverId(caregiverId);
  }

  /**
   * Buscar pacientes por criterios
   * @param search Texto de búsqueda
   * @param caregiverId ID del cuidador (opcional)
   * @returns Lista de pacientes que coinciden con los criterios
   */
  async searchPatients(
    search: string,
    caregiverId?: number
  ): Promise<Patient[]> {
    return await this.patientRepository.findBySearchCriteria(
      search,
      caregiverId
    );
  }

  /**
   * Obtener pacientes con paginación
   * @param params Parámetros de paginación
   * @returns Resultado paginado de pacientes
   */
  async getPatientsWithPagination(
    params: PaginationParams
  ): Promise<PaginatedResult<Patient>> {
    return await this.patientRepository.findWithPagination(params, {
      relations: ['caregiver'],
    });
  }

  /**
   * Actualizar datos de un paciente
   * @param patientId ID del paciente
   * @param patientData Datos a actualizar
   * @param caregiverId ID del cuidador (para verificar permisos)
   * @returns Paciente actualizado
   */
  async updatePatient(
    patientId: number,
    patientData: UpdatePatientDto,
    caregiverId?: number
  ): Promise<Patient> {
    // Verificar permisos
    await this.getPatientById(patientId, caregiverId);

    // Si se está actualizando el número de identificación, verificar que no exista otro paciente con ese número
    if (patientData.numeroid) {
      const patientExists = await this.patientRepository.existsByNumeroid(
        patientData.numeroid,
        patientId
      );
      if (patientExists) {
        throw new BadRequestError(
          `Ya existe un paciente con el número de identificación ${patientData.numeroid}`
        );
      }
    }

    // Actualizar paciente
    const updatedPatient = await this.patientRepository.update(
      patientId,
      {
        ...patientData,
        updated_at: new Date(),
      },
      'Paciente'
    );

    return updatedPatient;
  }

  /**
   * Actualizar imagen de perfil de un paciente
   * @param patientId ID del paciente
   * @param imageData Datos de la imagen (base64)
   * @param caregiverId ID del cuidador (para verificar permisos)
   * @returns Paciente actualizado
   */

  async updatePatientImage(
    patientId: number,
    imageData: string,
    caregiverId?: number
  ): Promise<Patient> {
    // Verificar permisos
    const patient = await this.getPatientById(patientId, caregiverId);

    // Verificar si existe una imagen previa y eliminarla
    if (patient.photourl) {
      await FileUploadService.deleteFile(patient.photourl);
    }

    // Guardar nueva imagen
    let photoUrl = '';
    if (imageData) {
      photoUrl = await FileUploadService.saveBase64Image(
        imageData,
        'patients',
        `patient_${patientId}`,
        'profile'
      );
    }

    // Actualizar imagen en la base de datos
    const updatedPatient = await this.patientRepository.update(
      patientId,
      {
        imagebs64: imageData,
        photourl: photoUrl,
        updated_at: new Date(),
      },
      'Paciente'
    );

    return updatedPatient;
  }

  /**
   * Eliminar un paciente
   * @param patientId ID del paciente
   * @param caregiverId ID del cuidador (para verificar permisos)
   * @returns Confirmación de eliminación
   */
  async deletePatient(
    patientId: number,
    caregiverId?: number
  ): Promise<{ success: boolean; message: string }> {
    // Verificar permisos
    const patient = await this.getPatientById(patientId, caregiverId);

    // Si el paciente tiene un hashcode, liberarlo para su reutilización
    if (patient.code) {
      await this.codeRepository.releaseCode(patient.code);
    }

    // Eliminar paciente
    const result = await this.patientRepository.delete(patientId, 'Paciente');

    if (!result) {
      throw new BadRequestError('No se pudo eliminar el paciente');
    }

    return {
      success: true,
      message: 'Paciente eliminado correctamente',
    };
  }

  /**
   * Verificar si un paciente pertenece a un cuidador
   * @param patientId ID del paciente
   * @param caregiverId ID del cuidador
   * @returns True si el paciente pertenece al cuidador
   */
  async verifyPatientBelongsToCaregiver(
    patientId: number,
    caregiverId: number
  ): Promise<boolean> {
    return await this.patientRepository.belongsToCaregiver(
      patientId,
      caregiverId
    );
  }
}
