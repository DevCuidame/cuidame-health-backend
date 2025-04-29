// src/modules/appointment/health-professional.repository.ts
import { BaseRepository } from '../../../core/repositories/base.repository';
import { HealthProfessional } from '../../../models/health-professional.model';
import { FindOptionsWhere, ILike } from 'typeorm';

export class HealthProfessionalRepository extends BaseRepository<HealthProfessional> {
  constructor() {
    super(HealthProfessional);
  }

  /**
   * Buscar profesionales por especialidad
   * @param specialty Especialidad médica
   * @returns Lista de profesionales con esa especialidad
   */
  async findBySpecialty(specialty: string): Promise<HealthProfessional[]> {
    return await this.repository.find({
      where: { 
        specialty: ILike(`%${specialty}%`),
        is_active: true 
      },
      relations: ['user']
    });
  }

  /**
   * Buscar profesionales disponibles en un horario específico
   * @param date Fecha para la búsqueda
   * @param specialtyId ID de la especialidad (opcional)
   * @returns Lista de profesionales disponibles
   */
  async findAvailableProfessionals(date: Date, specialtyId?: number): Promise<HealthProfessional[]> {
    // Consulta compleja que cruza con el horario de disponibilidad y citas existentes
    // Aquí una versión simplificada
    const query = this.repository.createQueryBuilder('professional')
      .leftJoinAndSelect('professional.user', 'user')
      .where('professional.is_active = :isActive', { isActive: true });

    if (specialtyId) {
      query.andWhere('professional.specialty_id = :specialtyId', { specialtyId });
    }

    // Esta es una simplificación. La consulta real debería verificar:
    // 1. Que el profesional tenga disponibilidad ese día de la semana
    // 2. Que no tenga bloques de tiempo que interfieran
    // 3. Que no tenga citas ya agendadas en ese horario

    return query.getMany();
  }
}