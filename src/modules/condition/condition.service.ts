import { PatientRepository } from '../patient/patient.repository';
import { ForbiddenError } from '../../utils/error-handler';
import { Condition } from '../../models/condition.model';
import { ConditionDto } from './condition.dto';
import { MedicalInfoRepository } from '../../modules/medical-info/medical-info.repository';

export class ConditionService {
  private medicalInfoRepository: MedicalInfoRepository;
  private patientRepository: PatientRepository;

  constructor() {
    this.medicalInfoRepository = new MedicalInfoRepository();
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
   * Crea o actualiza la condición de un paciente
   * @param data Datos de la condición
   * @param caregiverId ID del cuidador (si aplica)
   * @returns Condición creada o actualizada
   */
  async saveCondition(data: ConditionDto, caregiverId?: number): Promise<Condition> {
    // Verificar permisos
    await this.verifyAccess(data.id_paciente, caregiverId);
    
    // Verificar si ya existe una condición para este paciente
    const existingCondition = await this.medicalInfoRepository.getConditionByPatient(data.id_paciente);
    
    if (existingCondition) {
      // Actualizar condición existente
      return await this.medicalInfoRepository.updateCondition(existingCondition.id, {
        ...data,
        updated_at: new Date()
      });
    } else {
      // Crear nueva condición
      return await this.medicalInfoRepository.createCondition({
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  }

  /**
   * Obtiene la condición de un paciente
   * @param patientId ID del paciente
   * @param caregiverId ID del cuidador (si aplica)
   * @returns Condición del paciente o null si no existe
   */
  async getConditionByPatient(patientId: number, caregiverId?: number): Promise<Condition | null> {
    // Verificar permisos
    await this.verifyAccess(patientId, caregiverId);
    
    // Obtener condición del paciente
    return await this.medicalInfoRepository.getConditionByPatient(patientId);
  }
}