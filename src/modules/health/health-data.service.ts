// src/modules/health-data/health-data.service.ts
import { HealthDataRepository } from './health-data.repository';
import { PatientRepository } from '../patient/patient.repository';
import { ForbiddenError, NotFoundError } from '../../utils/error-handler';

export class HealthDataService {
  private healthDataRepository: HealthDataRepository;
  private patientRepository: PatientRepository;

  constructor() {
    this.healthDataRepository = new HealthDataRepository();
    this.patientRepository = new PatientRepository();
  }

  /**
   * Verificar permisos para acceder a los datos de un paciente
   * @param patientId ID del paciente
   * @param caregiverId ID del cuidador (si aplica)
   */
  private async verifyAccess(patientId: number, caregiverId?: number): Promise<void> {
    // Si no se proporciona ID de cuidador, no verificar permisos
    if (!caregiverId) return;
    
    const hasAccess = await this.patientRepository.belongsToCaregiver(patientId, caregiverId);
    if (!hasAccess) {
      throw new ForbiddenError('No tienes permiso para acceder a los datos de este paciente');
    }
  }

  /**
   * Obtiene todos los datos de salud de un paciente por su ID
   * @param patientId ID del paciente
   * @param caregiverId ID del cuidador (opcional, para verificar permisos)
   * @returns Datos de salud del paciente
   */
  async getHealthDataById(patientId: number, caregiverId?: number): Promise<any> {
    // Verificar que el paciente existe
    const patientExists = await this.patientRepository.exists({ id: patientId } as any);
    if (!patientExists) {
      throw new NotFoundError(`Paciente con ID ${patientId} no encontrado`);
    }

    // Verificar permisos
    await this.verifyAccess(patientId, caregiverId);
    
    // Obtener datos de salud
    const healthData = await this.healthDataRepository.getHealthDataById(patientId);
    
    if (!healthData) {
      throw new NotFoundError(`No se encontraron datos de salud para el paciente con ID ${patientId}`);
    }
    
    return healthData;
  }
}