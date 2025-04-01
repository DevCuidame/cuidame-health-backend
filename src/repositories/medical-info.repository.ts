import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Allergy } from '../models/allergy.model';
import { Condition } from '../models/condition.model';
import { Background, FamilyBackground, Vaccine } from '../models/background.model';
import { NotFoundError } from '../utils/error-handler';

/**
 * Repositorio para gestionar la información médica complementaria de los pacientes
 */
export class MedicalInfoRepository {
  private allergyRepository: Repository<Allergy>;
  private conditionRepository: Repository<Condition>;
  private backgroundRepository: Repository<Background>;
  private familyBackgroundRepository: Repository<FamilyBackground>;
  private vaccineRepository: Repository<Vaccine>;

  constructor() {
    this.allergyRepository = AppDataSource.getRepository(Allergy);
    this.conditionRepository = AppDataSource.getRepository(Condition);
    this.backgroundRepository = AppDataSource.getRepository(Background);
    this.familyBackgroundRepository = AppDataSource.getRepository(FamilyBackground);
    this.vaccineRepository = AppDataSource.getRepository(Vaccine);
  }

  // Métodos para alergias
  async createAllergy(data: Partial<Allergy>): Promise<Allergy> {
    const allergy = this.allergyRepository.create(data);
    return await this.allergyRepository.save(allergy);
  }

  async getAllergyById(id: number): Promise<Allergy | null> {
    return await this.allergyRepository.findOne({
      where: { id },
      relations: ['patient']
    });
  }

  async getAllergiesByPatient(patientId: number): Promise<Allergy[]> {
    return await this.allergyRepository.find({
      where: { id_paciente: patientId },
      order: { created_at: 'DESC' }
    });
  }

  async updateAllergy(id: number, data: Partial<Allergy>): Promise<Allergy> {
    const allergy = await this.getAllergyById(id);
    if (!allergy) {
      throw new NotFoundError(`Alergia con ID ${id} no encontrada`);
    }
    
    await this.allergyRepository.update(id, data);
    return await this.getAllergyById(id) as Allergy;
  }

  async deleteAllergy(id: number): Promise<boolean> {
    const allergy = await this.getAllergyById(id);
    if (!allergy) {
      throw new NotFoundError(`Alergia con ID ${id} no encontrada`);
    }
    
    const result = await this.allergyRepository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  // Métodos para condiciones médicas
  async createCondition(data: Partial<Condition>): Promise<Condition> {
    const condition = this.conditionRepository.create(data);
    return await this.conditionRepository.save(condition);
  }

  async getConditionById(id: number): Promise<Condition | null> {
    return await this.conditionRepository.findOne({
      where: { id },
      relations: ['patient']
    });
  }

  async getConditionByPatient(patientId: number): Promise<Condition | null> {
    return await this.conditionRepository.findOne({
      where: { id_paciente: patientId }
    });
  }

  async updateCondition(id: number, data: Partial<Condition>): Promise<Condition> {
    const condition = await this.getConditionById(id);
    if (!condition) {
      throw new NotFoundError(`Condición médica con ID ${id} no encontrada`);
    }
    
    await this.conditionRepository.update(id, data);
    return await this.getConditionById(id) as Condition;
  }

  // Métodos para antecedentes médicos
  async createBackground(data: Partial<Background>): Promise<Background> {
    const background = this.backgroundRepository.create(data);
    return await this.backgroundRepository.save(background);
  }

  async getBackgroundById(id: number): Promise<Background | null> {
    return await this.backgroundRepository.findOne({
      where: { id },
      relations: ['patient']
    });
  }

  async getBackgroundsByPatient(patientId: number): Promise<Background[]> {
    return await this.backgroundRepository.find({
      where: { id_paciente: patientId },
      order: { created_at: 'DESC' }
    });
  }

  async updateBackground(id: number, data: Partial<Background>): Promise<Background> {
    const background = await this.getBackgroundById(id);
    if (!background) {
      throw new NotFoundError(`Antecedente médico con ID ${id} no encontrado`);
    }
    
    await this.backgroundRepository.update(id, data);
    return await this.getBackgroundById(id) as Background;
  }

  async deleteBackground(id: number): Promise<boolean> {
    const background = await this.getBackgroundById(id);
    if (!background) {
      throw new NotFoundError(`Antecedente médico con ID ${id} no encontrado`);
    }
    
    const result = await this.backgroundRepository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  // Métodos para antecedentes familiares
  async createFamilyBackground(data: Partial<FamilyBackground>): Promise<FamilyBackground> {
    const familyBackground = this.familyBackgroundRepository.create(data);
    return await this.familyBackgroundRepository.save(familyBackground);
  }

  async getFamilyBackgroundById(id: number): Promise<FamilyBackground | null> {
    return await this.familyBackgroundRepository.findOne({
      where: { id },
      relations: ['patient']
    });
  }

  async getFamilyBackgroundsByPatient(patientId: number): Promise<FamilyBackground[]> {
    return await this.familyBackgroundRepository.find({
      where: { id_paciente: patientId },
      order: { created_at: 'DESC' }
    });
  }

  async updateFamilyBackground(id: number, data: Partial<FamilyBackground>): Promise<FamilyBackground> {
    const familyBackground = await this.getFamilyBackgroundById(id);
    if (!familyBackground) {
      throw new NotFoundError(`Antecedente familiar con ID ${id} no encontrado`);
    }
    
    await this.familyBackgroundRepository.update(id, data);
    return await this.getFamilyBackgroundById(id) as FamilyBackground;
  }

  async deleteFamilyBackground(id: number): Promise<boolean> {
    const familyBackground = await this.getFamilyBackgroundById(id);
    if (!familyBackground) {
      throw new NotFoundError(`Antecedente familiar con ID ${id} no encontrado`);
    }
    
    const result = await this.familyBackgroundRepository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  // Métodos para vacunas
  async createVaccine(data: Partial<Vaccine>): Promise<Vaccine> {
    const vaccine = this.vaccineRepository.create(data);
    return await this.vaccineRepository.save(vaccine);
  }

  async getVaccineById(id: number): Promise<Vaccine | null> {
    return await this.vaccineRepository.findOne({
      where: { id },
      relations: ['patient']
    });
  }

  async getVaccinesByPatient(patientId: number): Promise<Vaccine[]> {
    return await this.vaccineRepository.find({
      where: { id_paciente: patientId },
      order: { created_at: 'DESC' }
    });
  }

  async updateVaccine(id: number, data: Partial<Vaccine>): Promise<Vaccine> {
    const vaccine = await this.getVaccineById(id);
    if (!vaccine) {
      throw new NotFoundError(`Vacuna con ID ${id} no encontrada`);
    }
    
    await this.vaccineRepository.update(id, data);
    return await this.getVaccineById(id) as Vaccine;
  }

  async deleteVaccine(id: number): Promise<boolean> {
    const vaccine = await this.getVaccineById(id);
    if (!vaccine) {
      throw new NotFoundError(`Vacuna con ID ${id} no encontrada`);
    }
    
    const result = await this.vaccineRepository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  // Métodos para obtener todo el historial médico de un paciente
  async getAllMedicalInfo(patientId: number): Promise<{
    allergies: Allergy[];
    condition: Condition | null;
    backgrounds: Background[];
    familyBackgrounds: FamilyBackground[];
    vaccines: Vaccine[];
  }> {
    const [allergies, condition, backgrounds, familyBackgrounds, vaccines] = await Promise.all([
      this.getAllergiesByPatient(patientId),
      this.getConditionByPatient(patientId),
      this.getBackgroundsByPatient(patientId),
      this.getFamilyBackgroundsByPatient(patientId),
      this.getVaccinesByPatient(patientId)
    ]);

    return {
      allergies,
      condition,
      backgrounds,
      familyBackgrounds,
      vaccines
    };
  }
}