// src/modules/appointment/health-professional.service.ts
import { HealthProfessionalRepository } from '../repositories/health-professional.repository';
import { HealthProfessional } from '../../../models/health-professional.model';
import { NotFoundError, BadRequestError } from '../../../utils/error-handler';
import { UserRepository } from '../../user/user.repository';

export class HealthProfessionalService {
  private healthProfessionalRepository: HealthProfessionalRepository;
  private userRepository: UserRepository;

  constructor() {
    this.healthProfessionalRepository = new HealthProfessionalRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Obtener todos los profesionales de salud
   */
  async getAllProfessionals(): Promise<HealthProfessional[]> {
    return await this.healthProfessionalRepository.findAll({
      relations: ['user'],
    });
  }

  /**
   * Obtener un profesional por ID
   */
  async getProfessionalById(id: number): Promise<HealthProfessional> {
    const professional = await this.healthProfessionalRepository.findById(id, {
      relations: ['user'],
    });

    if (!professional) {
      throw new NotFoundError(`Profesional con ID ${id} no encontrado`);
    }

    return professional;
  }

  /**
   * Crear un nuevo profesional de salud
   */

  async createProfessional(
    data: Partial<HealthProfessional>
  ): Promise<HealthProfessional> {
    // Verificar que el usuario existe
    const user = await this.userRepository.findById(data.user_id as number);
    if (!user) {
      throw new NotFoundError(`Usuario con ID ${data.user_id} no encontrado`);
    }

    // Verificar que no exista ya un profesional con ese usuario
    const existingProfessionals =
      await this.healthProfessionalRepository.findAll({
        where: { user_id: data.user_id as number },
      });

    if (existingProfessionals && existingProfessionals.length > 0) {
      throw new BadRequestError(
        'Este usuario ya está registrado como profesional de salud'
      );
    }

    return await this.healthProfessionalRepository.create(data);
  }

  /**
   * Actualizar un profesional de salud
   */
  async updateProfessional(
    id: number,
    data: Partial<HealthProfessional>
  ): Promise<HealthProfessional> {
    // Verificar que el profesional existe
    await this.getProfessionalById(id);

    return await this.healthProfessionalRepository.update(
      id,
      data,
      'Profesional de salud'
    );
  }

  /**
   * Eliminar un profesional de salud (o desactivarlo)
   */
  async deleteProfessional(
    id: number
  ): Promise<{ success: boolean; message: string }> {
    // Verificar que el profesional existe
    await this.getProfessionalById(id);

    // En lugar de eliminar, marcar como inactivo
    await this.healthProfessionalRepository.update(
      id,
      { is_active: false },
      'Profesional de salud'
    );

    return {
      success: true,
      message: 'Profesional de salud desactivado correctamente',
    };
  }

  /**
   * Buscar profesionales por especialidad
   */
  async findBySpecialty(specialty: string): Promise<HealthProfessional[]> {
    return await this.healthProfessionalRepository.findBySpecialty(specialty);
  }
}
