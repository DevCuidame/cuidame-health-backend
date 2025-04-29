// src/modules/appointment/repositories/time-block.repository.ts
import { BaseRepository } from '../../../core/repositories/base.repository';
import { TimeBlock } from '../../../models/time-block.model';
import { Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

export class TimeBlockRepository extends BaseRepository<TimeBlock> {
  constructor() {
    super(TimeBlock);
  }

  /**
   * Buscar bloques de tiempo por profesional y rango de fechas
   * @param professionalId ID del profesional
   * @param startDate Fecha inicial
   * @param endDate Fecha final
   * @returns Lista de bloques de tiempo
   */
  async findByProfessionalAndDateRange(
    professionalId: number,
    startDate: Date,
    endDate: Date
  ): Promise<TimeBlock[]> {
    return await this.repository.find({
      where: {
        professional_id: professionalId,
        start_time: LessThanOrEqual(endDate),
        end_time: MoreThanOrEqual(startDate)
      },
      order: { start_time: 'ASC' }
    });
  }

  /**
   * Buscar bloques de tiempo que cubren un día completo
   * @param professionalId ID del profesional
   * @param date Fecha a verificar
   * @returns Lista de bloques de tiempo que cubren todo el día
   */
  async findFullDayBlocks(
    professionalId: number,
    date: Date
  ): Promise<TimeBlock[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await this.repository.find({
      where: {
        professional_id: professionalId,
        start_time: LessThanOrEqual(startOfDay),
        end_time: MoreThanOrEqual(endOfDay)
      }
    });
  }

  /**
   * Crear un nuevo bloque de tiempo
   * @param data Datos del bloque de tiempo
   * @returns Bloque de tiempo creado
   */
  async createTimeBlock(data: Partial<TimeBlock>): Promise<TimeBlock> {
    return await this.create(data);
  }

  /**
   * Obtener un bloque de tiempo por ID
   * @param id ID del bloque de tiempo
   * @returns Bloque de tiempo encontrado
   */
  async getTimeBlockById(id: number): Promise<TimeBlock | null> {
    return await this.findById(id);
  }

  /**
   * Actualizar un bloque de tiempo
   * @param id ID del bloque de tiempo
   * @param data Datos a actualizar
   * @returns Bloque de tiempo actualizado
   */
  async updateTimeBlock(id: number, data: Partial<TimeBlock>): Promise<TimeBlock> {
    return await this.update(id, data, 'Bloque de tiempo');
  }

  /**
   * Eliminar un bloque de tiempo
   * @param id ID del bloque de tiempo
   * @returns true si se eliminó correctamente
   */
  async deleteTimeBlock(id: number): Promise<boolean> {
    return await this.delete(id, 'Bloque de tiempo');
  }

  /**
   * Obtener bloques de tiempo por profesional
   * @param professionalId ID del profesional
   * @returns Lista de bloques de tiempo
   */
  async getTimeBlocksByProfessional(professionalId: number): Promise<TimeBlock[]> {
    return await this.repository.find({
      where: {
        professional_id: professionalId
      },
      order: { start_time: 'ASC' }
    });
  }

  /**
   * Obtener bloques de tiempo próximos
   * @param professionalId ID del profesional
   * @returns Lista de bloques de tiempo futuros
   */
  async getUpcomingTimeBlocks(professionalId: number): Promise<TimeBlock[]> {
    const now = new Date();
    
    return await this.repository.find({
      where: {
        professional_id: professionalId,
        end_time: MoreThanOrEqual(now)
      },
      order: { start_time: 'ASC' }
    });
  }
}