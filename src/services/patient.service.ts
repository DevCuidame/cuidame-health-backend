import { PatientRepository } from '../repositories/patient.repository';
import { MedicalInfoRepository } from '../repositories/medical-info.repository';
import { HealthRepository } from '../repositories/health.repository';
import { Patient } from '../models/patient.model';
import { PaginationParams, PaginatedResult } from '../interfaces/response.interface';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/error-handler';
import { CreatePatientDto, UpdatePatientDto } from '../dto/patient.dto';

export class PatientService {
  private patientRepository: PatientRepository;
  private medicalInfoRepository: MedicalInfoRepository;
  private healthRepository: HealthRepository;

  constructor() {
    this.patientRepository = new PatientRepository();
    this.medicalInfoRepository = new MedicalInfoRepository();
    this.healthRepository = new HealthRepository();
  }

  /**
   * Crear un nuevo paciente
   * @param patientData Datos del paciente
   * @param caregiverId ID del cuidador que crea el paciente
   * @returns Paciente creado
   */
  async createPatient(patientData: CreatePatientDto, caregiverId: number): Promise<Patient> {
    // Generar un código único para el paciente
    const code = await this.patientRepository.generateUniqueCode();
    
    // Crear el paciente
    const patient = await this.patientRepository.create({
      ...patientData,
      code,
      a_cargo_id: caregiverId,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    return patient;
  }

  /**
   * Obtener un paciente por ID
   * @param patientId ID del paciente
   * @param caregiverId ID del cuidador (para verificar permisos)
   * @returns Paciente encontrado
   */
  async getPatientById(patientId: number, caregiverId?: number): Promise<Patient> {
    const patient = await this.patientRepository.findById(patientId);
    
    if (!patient) {
      throw new NotFoundError(`Paciente con ID ${patientId} no encontrado`);
    }
    
    // Si se proporciona el ID del cuidador, verificar que tenga permisos
    if (caregiverId && patient.a_cargo_id !== caregiverId) {
      throw new ForbiddenError('No tienes permiso para acceder a este paciente');
    }
    
    return patient;
  }

  /**
   * Obtener detalles completos de un paciente
   * @param patientId ID del paciente
   * @param caregiverId ID del cuidador (para verificar permisos)
   * @returns Todos los datos del paciente y su información médica
   */
  async getPatientFullDetails(patientId: number, caregiverId?: number): Promise<any> {
    // Verificar permisos
    const patient = await this.getPatientById(patientId, caregiverId);
    
    // Obtener información médica completa
    const medicalInfo = await this.medicalInfoRepository.getAllMedicalInfo(patientId);
    
    // Obtener últimos signos vitales
    const latestVitals = await this.healthRepository.getLatestVitals(patientId);
    
    return {
      ...patient,
      medicalInfo,
      vitals: latestVitals
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
  async searchPatients(search: string, caregiverId?: number): Promise<Patient[]> {
    return await this.patientRepository.findBySearchCriteria(search, caregiverId);
  }

  /**
   * Obtener pacientes con paginación
   * @param params Parámetros de paginación
   * @returns Resultado paginado de pacientes
   */
  async getPatientsWithPagination(params: PaginationParams): Promise<PaginatedResult<Patient>> {
    return await this.patientRepository.findWithPagination(params, {
      relations: ['caregiver']
    });
  }

  /**
   * Actualizar datos de un paciente
   * @param patientId ID del paciente
   * @param patientData Datos a actualizar
   * @param caregiverId ID del cuidador (para verificar permisos)
   * @returns Paciente actualizado
   */
  async updatePatient(patientId: number, patientData: UpdatePatientDto, caregiverId?: number): Promise<Patient> {
    // Verificar permisos
    await this.getPatientById(patientId, caregiverId);
    
    // Actualizar paciente
    const updatedPatient = await this.patientRepository.update(patientId, {
      ...patientData,
      updated_at: new Date()
    }, 'Paciente');
    
    return updatedPatient;
  }

  /**
   * Actualizar imagen de perfil de un paciente
   * @param patientId ID del paciente
   * @param imageData Datos de la imagen (base64)
   * @param caregiverId ID del cuidador (para verificar permisos)
   * @returns Paciente actualizado
   */
  async updatePatientImage(patientId: number, imageData: string, caregiverId?: number): Promise<Patient> {
    // Verificar permisos
    await this.getPatientById(patientId, caregiverId);
    
    // Actualizar imagen
    const updatedPatient = await this.patientRepository.update(patientId, {
      imagebs64: imageData,
      updated_at: new Date()
    }, 'Paciente');
    
    return updatedPatient;
  }

  /**
   * Eliminar un paciente
   * @param patientId ID del paciente
   * @param caregiverId ID del cuidador (para verificar permisos)
   * @returns Confirmación de eliminación
   */
  async deletePatient(patientId: number, caregiverId?: number): Promise<{ success: boolean, message: string }> {
    // Verificar permisos
    await this.getPatientById(patientId, caregiverId);
    
    // Eliminar paciente
    const result = await this.patientRepository.delete(patientId, 'Paciente');
    
    if (!result) {
      throw new BadRequestError('No se pudo eliminar el paciente');
    }
    
    return {
      success: true,
      message: 'Paciente eliminado correctamente'
    };
  }

  /**
   * Verificar si un paciente pertenece a un cuidador
   * @param patientId ID del paciente
   * @param caregiverId ID del cuidador
   * @returns True si el paciente pertenece al cuidador
   */
  async verifyPatientBelongsToCaregiver(patientId: number, caregiverId: number): Promise<boolean> {
    return await this.patientRepository.belongsToCaregiver(patientId, caregiverId);
  }
}