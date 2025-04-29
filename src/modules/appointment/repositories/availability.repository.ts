// src/modules/appointment/availability.repository.ts
import { BaseRepository } from '../../../core/repositories/base.repository';
import { Availability, DayOfWeek } from '../../../models/availability.model';

export class AvailabilityRepository extends BaseRepository<Availability> {
  constructor() {
    super(Availability);
  }

  /**
   * Obtener disponibilidad de un profesional por día de la semana
   * @param professionalId ID del profesional
   * @param dayOfWeek Día de la semana
   * @returns Lista de horarios disponibles para ese día
   */
  async findByProfessionalAndDay(
    professionalId: number,
    dayOfWeek: DayOfWeek
  ): Promise<Availability[]> {
    return await this.repository.find({
      where: { 
        professional_id: professionalId,
        day_of_week: dayOfWeek,
        is_active: true
      },
      order: { start_time: 'ASC' }
    });
  }

  /**
   * Obtener toda la disponibilidad de un profesional
   * @param professionalId ID del profesional
   * @returns Lista de horarios disponibles
   */
  async findByProfessional(professionalId: number): Promise<Availability[]> {
    return await this.repository.find({
      where: { 
        professional_id: professionalId,
        is_active: true
      },
      order: { day_of_week: 'ASC', start_time: 'ASC' }
    });
  }
}