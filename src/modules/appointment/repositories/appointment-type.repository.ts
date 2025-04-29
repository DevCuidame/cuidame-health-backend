// src/modules/appointment/appointment-type.repository.ts
import { BaseRepository } from '../../../core/repositories/base.repository';
import { AppointmentType } from '../../../models/appointment-type.model';

export class AppointmentTypeRepository extends BaseRepository<AppointmentType> {
  constructor() {
    super(AppointmentType);
  }

  /**
   * Obtener todos los tipos de cita activos
   */
  async getActiveTypes(): Promise<AppointmentType[]> {
    return await this.repository.find({
      where: { is_active: true },
      order: { name: 'ASC' }
    });
  }
}