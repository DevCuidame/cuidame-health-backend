import { PatientRepository } from '../../modules/patient/patient.repository';
import { 
  CreateAllergyDto, 
  UpdateAllergyDto, 
  CreateConditionDto, 
  UpdateConditionDto,
  CreateBackgroundDto,
  UpdateBackgroundDto,
  CreateFamilyBackgroundDto,
  UpdateFamilyBackgroundDto,
  CreateVaccineDto,
  UpdateVaccineDto
} from '../health/health.dto';
import { MedicalInfoRepository } from './medical-info.repository';
import { ForbiddenError, NotFoundError } from '../../utils/error-handler';
import { Allergy } from '../../models/allergy.model';
import { Background, FamilyBackground, Vaccine } from '../../models/background.model';
import { Condition } from '../../models/condition.model';

export class MedicalInfoService {
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

  // Métodos para alergias
  async createAllergy(data: CreateAllergyDto, caregiverId?: number): Promise<Allergy> {
    await this.verifyAccess(data.id_paciente, caregiverId);
    
    return await this.medicalInfoRepository.createAllergy({
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  async getAllergyById(id: number, caregiverId?: number): Promise<Allergy> {
    const allergy = await this.medicalInfoRepository.getAllergyById(id);
    
    if (!allergy) {
      throw new NotFoundError(`Alergia con ID ${id} no encontrada`);
    }
    
    await this.verifyAccess(allergy.id_paciente, caregiverId);
    
    return allergy;
  }

  async getAllergiesByPatient(patientId: number, caregiverId?: number): Promise<Allergy[]> {
    await this.verifyAccess(patientId, caregiverId);
    
    return await this.medicalInfoRepository.getAllergiesByPatient(patientId);
  }

  async updateAllergy(id: number, data: UpdateAllergyDto, caregiverId?: number): Promise<Allergy> {
    const allergy = await this.getAllergyById(id, caregiverId);
    
    return await this.medicalInfoRepository.updateAllergy(id, {
      ...data,
      updated_at: new Date()
    });
  }

  async deleteAllergy(id: number, caregiverId?: number): Promise<{ success: boolean, message: string }> {
    const allergy = await this.getAllergyById(id, caregiverId);
    
    const result = await this.medicalInfoRepository.deleteAllergy(id);
    
    return {
      success: result,
      message: result ? 'Alergia eliminada correctamente' : 'No se pudo eliminar la alergia'
    };
  }

  // Métodos para condiciones médicas
  async createOrUpdateCondition(data: CreateConditionDto, caregiverId?: number): Promise<Condition> {
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

  async getConditionByPatient(patientId: number, caregiverId?: number): Promise<Condition | null> {
    await this.verifyAccess(patientId, caregiverId);
    
    return await this.medicalInfoRepository.getConditionByPatient(patientId);
  }

  // Métodos para antecedentes médicos
  async createBackground(data: CreateBackgroundDto, caregiverId?: number): Promise<Background> {
    await this.verifyAccess(data.id_paciente, caregiverId);
    
    return await this.medicalInfoRepository.createBackground({
      ...data,
      fecha_antecedente: data.fecha_antecedente ? new Date(data.fecha_antecedente) : undefined,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  async getBackgroundById(id: number, caregiverId?: number): Promise<Background> {
    const background = await this.medicalInfoRepository.getBackgroundById(id);
    
    if (!background) {
      throw new NotFoundError(`Antecedente médico con ID ${id} no encontrado`);
    }
    
    await this.verifyAccess(background.id_paciente, caregiverId);
    
    return background;
  }

  async getBackgroundsByPatient(patientId: number, caregiverId?: number): Promise<Background[]> {
    await this.verifyAccess(patientId, caregiverId);
    
    return await this.medicalInfoRepository.getBackgroundsByPatient(patientId);
  }

  async updateBackground(id: number, data: UpdateBackgroundDto, caregiverId?: number): Promise<Background> {
    const background = await this.getBackgroundById(id, caregiverId);
    
    return await this.medicalInfoRepository.updateBackground(id, {
      ...data,
      fecha_antecedente: data.fecha_antecedente ? new Date(data.fecha_antecedente) : undefined,
      updated_at: new Date()
    });
  }

  async deleteBackground(id: number, caregiverId?: number): Promise<{ success: boolean, message: string }> {
    const background = await this.getBackgroundById(id, caregiverId);
    
    const result = await this.medicalInfoRepository.deleteBackground(id);
    
    return {
      success: result,
      message: result ? 'Antecedente médico eliminado correctamente' : 'No se pudo eliminar el antecedente médico'
    };
  }

  // Métodos para antecedentes familiares
  async createFamilyBackground(data: CreateFamilyBackgroundDto, caregiverId?: number): Promise<FamilyBackground> {
    await this.verifyAccess(data.id_paciente, caregiverId);
    
    return await this.medicalInfoRepository.createFamilyBackground({
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  async getFamilyBackgroundById(id: number, caregiverId?: number): Promise<FamilyBackground> {
    const familyBackground = await this.medicalInfoRepository.getFamilyBackgroundById(id);
    
    if (!familyBackground) {
      throw new NotFoundError(`Antecedente familiar con ID ${id} no encontrado`);
    }
    
    await this.verifyAccess(familyBackground.id_paciente, caregiverId);
    
    return familyBackground;
  }

  async getFamilyBackgroundsByPatient(patientId: number, caregiverId?: number): Promise<FamilyBackground[]> {
    await this.verifyAccess(patientId, caregiverId);
    
    return await this.medicalInfoRepository.getFamilyBackgroundsByPatient(patientId);
  }

  async updateFamilyBackground(id: number, data: UpdateFamilyBackgroundDto, caregiverId?: number): Promise<FamilyBackground> {
    const familyBackground = await this.getFamilyBackgroundById(id, caregiverId);
    
    return await this.medicalInfoRepository.updateFamilyBackground(id, {
      ...data,
      updated_at: new Date()
    });
  }

  async deleteFamilyBackground(id: number, caregiverId?: number): Promise<{ success: boolean, message: string }> {
    const familyBackground = await this.getFamilyBackgroundById(id, caregiverId);
    
    const result = await this.medicalInfoRepository.deleteFamilyBackground(id);
    
    return {
      success: result,
      message: result ? 'Antecedente familiar eliminado correctamente' : 'No se pudo eliminar el antecedente familiar'
    };
  }

  // Métodos para vacunas
  async createVaccine(data: CreateVaccineDto, caregiverId?: number): Promise<Vaccine> {
    await this.verifyAccess(data.id_paciente, caregiverId);
    
    return await this.medicalInfoRepository.createVaccine({
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  async getVaccineById(id: number, caregiverId?: number): Promise<Vaccine> {
    const vaccine = await this.medicalInfoRepository.getVaccineById(id);
    
    if (!vaccine) {
      throw new NotFoundError(`Vacuna con ID ${id} no encontrada`);
    }
    
    await this.verifyAccess(vaccine.id_paciente, caregiverId);
    
    return vaccine;
  }

  async getVaccinesByPatient(patientId: number, caregiverId?: number): Promise<Vaccine[]> {
    await this.verifyAccess(patientId, caregiverId);
    
    return await this.medicalInfoRepository.getVaccinesByPatient(patientId);
  }

  async updateVaccine(id: number, data: UpdateVaccineDto, caregiverId?: number): Promise<Vaccine> {
    const vaccine = await this.getVaccineById(id, caregiverId);
    
    return await this.medicalInfoRepository.updateVaccine(id, {
      ...data,
      updated_at: new Date()
    });
  }

  async deleteVaccine(id: number, caregiverId?: number): Promise<{ success: boolean, message: string }> {
    const vaccine = await this.getVaccineById(id, caregiverId);
    
    const result = await this.medicalInfoRepository.deleteVaccine(id);
    
    return {
      success: result,
      message: result ? 'Vacuna eliminada correctamente' : 'No se pudo eliminar la vacuna'
    };
  }

  // Método para obtener todo el historial médico de un paciente
  async getAllMedicalInfo(patientId: number, caregiverId?: number): Promise<{
    allergies: Allergy[];
    condition: Condition | null;
    backgrounds: Background[];
    familyBackgrounds: FamilyBackground[];
    vaccines: Vaccine[];
  }> {
    await this.verifyAccess(patientId, caregiverId);
    
    return await this.medicalInfoRepository.getAllMedicalInfo(patientId);
  }
}