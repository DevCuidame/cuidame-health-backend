import { PatientRepository } from './patient.repository';
import { MedicalInfoRepository } from '../../modules/medical-info/medical-info.repository';
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
import { AppDataSource } from '../../core/config/database';
import { HealthDataService } from '../health/health-data.service';
import { ChatSessionRepository } from '../chat/chat-session.repository';

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
   * @returns familiar creado
   */
  async createPatient(
    patientData: CreatePatientDto,
    caregiverId: number
  ): Promise<Patient> {
    try {
      // Verificar si ya existe un familiar con el mismo número de identificación
      const patientExists = await this.patientRepository.existsByNumeroid(
        patientData.numeroid
      );
      if (patientExists) {
        throw new BadRequestError(
          `Ya existe un familiar con el número de identificación`
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
              'Paciente'
            );

            // Actualizar el objeto del familiar antes de devolverlo
            patient.photourl = photoUrl;
          }
        } catch (error) {
          console.error('Error al guardar imagen de paciente:', error);
          // No fallamos el proceso completo si hay error en la imagen
        }
      }

      // Obtener nombres reales de ciudad y departamento
      const { cityName, departmentName } = await this.getLocationInfo(
        patient.city_id
      );

      // Crear un objeto enriquecido para devolver al cliente
      const enrichedPatient = {
        ...patient,
        ciudad: cityName || patient.ciudad,
        department_name: departmentName || patient.departamento,
      };

      return enrichedPatient as Patient;
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
   * Obtiene la información completa de un paciente incluyendo datos de salud
   * @param id ID del paciente
   * @param caregiverId ID del cuidador (opcional)
   * @returns Información completa del paciente con datos de salud
   */
  async getPatientWithHealthData(
    id: number,
    caregiverId?: number
  ): Promise<any> {
    // Verificar que el paciente existe
    const patient = await this.getPatientById(id, caregiverId);

    // Obtener datos de salud
    const healthDataService = new HealthDataService();
    const healthData = await healthDataService.getHealthDataById(
      id,
      caregiverId
    );

    // Combinar la información
    return {
      ...patient,
      health_data: healthData,
    };
  }

  /**
   * Obtener un familiar por ID
   * @param patientId ID del paciente
   * @param caregiverId ID del cuidador (para verificar permisos)
   * @returns familiar encontrado
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
   * @returns Todos los datos del familiar y su información médica
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
  // Obtener pacientes a cargo del usuario
  let patients = await this.patientRepository.findByCaregiverId(caregiverId);

  // Añadir datos de salud y localización para cada paciente a cargo
  if (patients && patients.length > 0) {
    const enrichedPatients = await Promise.all(
      patients.map(async (patient) => {
        // Remove imagebs64 from patient object to reduce size
        const { ...patientWithoutImage } = patient;
        
        // Obtener datos de salud para el paciente
        const [
          latestVitals,
          medicalInfo
        ] = await Promise.all([
          this.healthRepository.getLatestVitals(patient.id),
          this.medicalInfoRepository.getAllMedicalInfo(patient.id)
        ]);

        // Obtener información detallada de ciudad y departamento
        let cityName = patient.ciudad || "";
        let departmentName = patient.departamento || "";

        // Si hay city_id, intentar obtener el nombre real de la ciudad y departamento
        if (patient.city_id) {
          try {
            // Obtener datos de la ciudad desde el repositorio de ubicaciones
            const locationRepository = AppDataSource.getRepository('townships');
            const cityData = await locationRepository.findOne({
              where: { id: patient.city_id },
              relations: ['department']
            });

            if (cityData) {
              cityName = cityData.name;
              if (cityData.department) {
                departmentName = cityData.department.name;
              }
            }
          } catch (error) {
            console.error('Error al obtener información de localización:', error);
            // Mantener los valores originales en caso de error
          }
        }

        // Crear un objeto que combine el paciente con sus datos de salud y localización
        return {
          ...patientWithoutImage,
          ciudad: cityName,
          department_name: departmentName,
          health_data: {
            vitals: latestVitals,
            medical_info: medicalInfo
          }
        };
      })
    );

    // Reemplazar la lista original con la enriquecida
    patients = enrichedPatients;
  }

  return patients;
}

  /**
   * Obtener pacientes por cuidador
   * @param caregiverId ID del cuidador
   * @returns Lista de pacientes a cargo del cuidador
   */
  async getPatientByIdAndNum( identificationType: string, identificationNumber: string): Promise<Patient[]> {
    // Obtener pacientes a cargo del usuario
    let patient = await this.patientRepository.findByIdAndNum(identificationType, identificationNumber);
  
    // Añadir datos de salud y localización para cada paciente a cargo
    if (patient && patient.length > 0) {
      const enrichedPatients = await Promise.all(
        patient.map(async (patient) => {
          // Remove imagebs64 from patient object to reduce size
          const { ...patientWithoutImage } = patient;
          
          // Obtener datos de salud para el paciente
          const [
            latestVitals,
            medicalInfo
          ] = await Promise.all([
            this.healthRepository.getLatestVitals(patient.id),
            this.medicalInfoRepository.getAllMedicalInfo(patient.id)
          ]);
  
          // Obtener información detallada de ciudad y departamento
          let cityName = patient.ciudad || "";
          let departmentName = patient.departamento || "";
  
          // Si hay city_id, intentar obtener el nombre real de la ciudad y departamento
          if (patient.city_id) {
            try {
              // Obtener datos de la ciudad desde el repositorio de ubicaciones
              const locationRepository = AppDataSource.getRepository('townships');
              const cityData = await locationRepository.findOne({
                where: { id: patient.city_id },
                relations: ['department']
              });
  
              if (cityData) {
                cityName = cityData.name;
                if (cityData.department) {
                  departmentName = cityData.department.name;
                }
              }
            } catch (error) {
              console.error('Error al obtener información de localización:', error);
              // Mantener los valores originales en caso de error
            }
          }
  
          // Crear un objeto que combine el paciente con sus datos de salud y localización
          return {
            ...patientWithoutImage,
            ciudad: cityName,
            department_name: departmentName,
            health_data: {
              vitals: latestVitals,
              medical_info: medicalInfo
            }
          };
        })
      );
  
      // Reemplazar la lista original con la enriquecida
      patient = enrichedPatients;
    }
  
    return patient;
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
   * @returns familiar actualizado
   */
  async updatePatient(
    patientId: number,
    patientData: UpdatePatientDto,
    caregiverId?: number
  ): Promise<Patient> {
    // Verificar permisos
    const patient = await this.getPatientById(patientId, caregiverId);

    // Si se está actualizando el número de identificación, verificar que no exista otro familiar con ese número
    if (patientData.numeroid) {
      const patientExists = await this.patientRepository.existsByNumeroid(
        patientData.numeroid,
        patientId
      );
      if (patientExists) {
        throw new BadRequestError(
          `Ya existe un familiar con el número de identificación ${patientData.numeroid}`
        );
      }
    }

    // Extraer datos de imagen si existe
    const { imagebs64, ...dataToUpdate } = patientData;

    // Preparar objeto con datos a actualizar
    const updateData = {
      ...dataToUpdate,
      updated_at: new Date(),
    };

    // Si se proporciona una nueva imagen, procesarla
    if (imagebs64) {
      // Verificar si existe una imagen previa y eliminarla
      if (patient.photourl) {
        await FileUploadService.deleteFile(patient.photourl);
      }

      // Guardar nueva imagen
      try {
        const photoUrl = await FileUploadService.saveBase64Image(
          imagebs64,
          'patients',
          'profile'
        );

        // Añadir URL de la foto al objeto de actualización
        updateData.photourl = photoUrl;
      } catch (error) {
        console.error('Error al guardar imagen de paciente:', error);
        // No fallamos el proceso completo si hay error en la imagen
      }
    }

    // Actualizar paciente
    const updatedPatient = await this.patientRepository.update(
      patientId,
      updateData,
      'Paciente'
    );

    // Obtener nombres reales de ciudad y departamento
    const cityId = updateData.city_id || updatedPatient.city_id;
    const { cityName, departmentName } = await this.getLocationInfo(cityId);

    // Crear un objeto enriquecido para devolver al cliente
    const enrichedPatient = {
      ...updatedPatient,
      ciudad: cityName || updatedPatient.ciudad,
      department_name: departmentName || updatedPatient.departamento,
    };

    return enrichedPatient as Patient;
  }

  /**
   * Actualizar imagen de perfil de un paciente
   * @param patientId ID del paciente
   * @param imageData Datos de la imagen (base64)
   * @param caregiverId ID del cuidador (para verificar permisos)
   * @returns familiar actualizado
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
  async deletePatient(patientId: number, caregiverId?: number): Promise<any> {
    const patient = await this.getPatientById(patientId, caregiverId);

    // Si el familiar tiene un hashcode, liberarlo para su reutilización
    if (patient.code) {
      await this.codeRepository.releaseCode(patient.code);
    }

    // Eliminar sesiones de chat relacionadas con el paciente
    const chatSessionRepository = new ChatSessionRepository();
    await chatSessionRepository.deleteByPatientId(patientId);

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
   * Verificar si un familiar pertenece a un cuidador
   * @param patientId ID del paciente
   * @param caregiverId ID del cuidador
   * @returns True si el familiar pertenece al cuidador
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

  /**
   * Obtener información de localización (ciudad y departamento) basado en el city_id
   * @param cityId ID de la ciudad
   * @returns Objeto con los nombres de ciudad y departamento
   */
  private async getLocationInfo(
    cityId?: number
  ): Promise<{ cityName: string; departmentName: string }> {
    let cityName = '';
    let departmentName = '';

    // Si hay city_id, intentar obtener el nombre real de la ciudad y departamento
    if (cityId) {
      try {
        // Obtener datos de la ciudad desde el repositorio de ubicaciones
        const locationRepository = AppDataSource.getRepository('townships');
        const cityData = await locationRepository.findOne({
          where: { id: cityId },
          relations: ['department'],
        });

        if (cityData) {
          cityName = cityData.name;
          if (cityData.department) {
            departmentName = cityData.department.name;
          }
        }
      } catch (error) {
        console.error('Error al obtener información de localización:', error);
        // Devolver valores por defecto en caso de error
      }
    }

    return { cityName, departmentName };
  }

  /**
   * Obtener un paciente por su código
   * @param code Código del paciente
   * @param caregiverId ID del cuidador (opcional, para verificar permisos)
   * @returns Paciente encontrado con toda su información
   */
  async getPatientByCode(
    code: string,
    caregiverId?: number
  ): Promise<Patient> {
    const patient = await this.patientRepository.findByCode(code);

    if (!patient) {
      throw new NotFoundError(`Paciente con código ${code} no encontrado`);
    }

    // Si se proporciona el ID del cuidador, verificar que tenga permisos
    if (caregiverId && patient.a_cargo_id !== caregiverId) {
      throw new ForbiddenError(
        'No tienes permiso para acceder a este paciente'
      );
    }

    // Obtener nombres reales de ciudad y departamento
    const { cityName, departmentName } = await this.getLocationInfo(
      patient.city_id
    );

    // Crear un objeto enriquecido para devolver al cliente
    const enrichedPatient = {
      ...patient,
      ciudad: cityName || patient.ciudad,
      department_name: departmentName || patient.departamento,
    };

    return enrichedPatient as Patient;
  }
}
