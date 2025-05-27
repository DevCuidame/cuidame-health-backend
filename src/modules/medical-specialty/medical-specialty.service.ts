import { MedicalSpecialties } from '../../models/medical-specialties.model';
import { MedicalSpecialtyRepository } from './medical-specialty.repository';
import { NotFoundError } from '../../utils/error-handler';

export class MedicalSpecialtyService {
  private medicalSpecialtyRepository: MedicalSpecialtyRepository;
  constructor() {
    this.medicalSpecialtyRepository = new MedicalSpecialtyRepository();
  }
  /**
   * Obtener solo los nombres de las especialidades médicas
   * @returns Lista de nombres de especialidades
   */
  async getAllSpecialtyNames(): Promise<string[]> {
    const specialties = await this.medicalSpecialtyRepository.findAll();
    return specialties.map((specialty) => specialty.name);
  }


  /**
   * Obtener todas las especialidades médicas
   * @returns Lista de especialidades médicas
   */
  async getAllSpecialties(): Promise<MedicalSpecialties[]> {
    const specialties = await this.medicalSpecialtyRepository.findAll();
    return specialties;
  }

  /**
   * Obtener una especialidad médica por su ID
   * @param id ID de la especialidad médica
   * @returns Especialidad médica
   */
  async getSpecialtyById(id: number): Promise<MedicalSpecialties> {
    const specialty = await this.medicalSpecialtyRepository.findByIdOrFail(id, 'Especialidad médica');
    return specialty;
  }

  /**
   * Obtener una especialidad médica por su nombre
   * @param name Nombre de la especialidad médica
   * @returns Especialidad médica o null si no existe
   */
  async getSpecialtyByName(name: string): Promise<MedicalSpecialties | null> {
    return await this.medicalSpecialtyRepository.findByName(name);
  }

  /**
   * Crear una nueva especialidad médica
   * @param name Nombre de la especialidad médica
   * @returns Especialidad médica creada
   */
  async createSpecialty(name: string): Promise<MedicalSpecialties> {
    // Verificar si ya existe una especialidad con ese nombre
    const existingSpecialty = await this.getSpecialtyByName(name);
    if (existingSpecialty) {
      throw new Error(`Ya existe una especialidad médica con el nombre '${name}'`);
    }

    // Crear la nueva especialidad
    const specialty = await this.medicalSpecialtyRepository.create({ name });
    return specialty;
  }

  /**
   * Actualizar una especialidad médica existente
   * @param id ID de la especialidad médica
   * @param name Nuevo nombre de la especialidad médica
   * @returns Especialidad médica actualizada
   */
  async updateSpecialty(id: number, name: string): Promise<MedicalSpecialties> {
    // Verificar si existe la especialidad
    await this.getSpecialtyById(id);

    // Verificar si ya existe otra especialidad con ese nombre
    const existingSpecialty = await this.getSpecialtyByName(name);
    if (existingSpecialty && existingSpecialty.id !== id) {
      throw new Error(`Ya existe otra especialidad médica con el nombre '${name}'`);
    }

    // Actualizar la especialidad
    const updatedSpecialty = await this.medicalSpecialtyRepository.update(id, { name }, 'Especialidad médica');
    return updatedSpecialty;
  }

  /**
   * Eliminar una especialidad médica
   * @param id ID de la especialidad médica
   * @returns true si se eliminó correctamente
   */
  async deleteSpecialty(id: number): Promise<boolean> {
    // Verificar si existe la especialidad
    await this.getSpecialtyById(id);

    // Eliminar la especialidad
    return await this.medicalSpecialtyRepository.delete(id, 'Especialidad médica');
  }
}
