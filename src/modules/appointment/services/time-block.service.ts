// src/modules/appointment/services/time-block.service.ts
import { TimeBlockRepository } from '../repositories/time-block.repository';
import { TimeBlock } from '../../../models/time-block.model';
import { HealthProfessionalService } from './health-professional.service';
import { NotFoundError, BadRequestError } from '../../../utils/error-handler';

export class TimeBlockService {
  private timeBlockRepository: TimeBlockRepository;
  private healthProfessionalService: HealthProfessionalService;

  constructor() {
    this.timeBlockRepository = new TimeBlockRepository();
    this.healthProfessionalService = new HealthProfessionalService();
  }

  /**
   * Crear un nuevo bloque de tiempo
   * @param data Datos del bloque de tiempo
   * @param userId ID del usuario que crea el bloque
   */
  async createTimeBlock(data: Partial<TimeBlock>, userId?: number): Promise<TimeBlock> {
    // Verificar que el profesional existe
    await this.healthProfessionalService.getProfessionalById(data.professional_id as number);
    
    // Verificar que las fechas sean válidas
    if (data.start_time && data.end_time) {
      const start = new Date(data.start_time);
      const end = new Date(data.end_time);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestError('Formato de fecha inválido');
      }
      
      if (start >= end) {
        throw new BadRequestError('La hora de inicio debe ser anterior a la hora de fin');
      }
      
      // Si la fecha de inicio es en el pasado
      if (start < new Date()) {
        throw new BadRequestError('No se pueden crear bloques de tiempo en el pasado');
      }
    }
    
    return await this.timeBlockRepository.createTimeBlock(data);
  }

  /**
   * Obtener un bloque de tiempo por ID
   */
  async getTimeBlockById(id: number): Promise<TimeBlock> {
    const timeBlock = await this.timeBlockRepository.getTimeBlockById(id);
    
    if (!timeBlock) {
      throw new NotFoundError(`Bloque de tiempo con ID ${id} no encontrado`);
    }
    
    return timeBlock;
  }

  /**
   * Obtener bloques de tiempo por profesional
   */
  async getTimeBlocksByProfessional(professionalId: number): Promise<TimeBlock[]> {
    // Verificar que el profesional existe
    await this.healthProfessionalService.getProfessionalById(professionalId);
    
    return await this.timeBlockRepository.getTimeBlocksByProfessional(professionalId);
  }

  /**
   * Actualizar un bloque de tiempo
   */
  async updateTimeBlock(id: number, data: Partial<TimeBlock>, userId?: number): Promise<TimeBlock> {
    // Verificar que el bloque existe
    await this.getTimeBlockById(id);
    
    // Verificar que las fechas sean válidas si se están actualizando
    if (data.start_time && data.end_time) {
      const start = new Date(data.start_time);
      const end = new Date(data.end_time);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestError('Formato de fecha inválido');
      }
      
      if (start >= end) {
        throw new BadRequestError('La hora de inicio debe ser anterior a la hora de fin');
      }
    }
    
    return await this.timeBlockRepository.updateTimeBlock(id, data);
  }

  /**
   * Eliminar un bloque de tiempo
   */
  async deleteTimeBlock(id: number): Promise<{ success: boolean; message: string }> {
    // Verificar que el bloque existe
    await this.getTimeBlockById(id);
    
    const result = await this.timeBlockRepository.deleteTimeBlock(id);
    
    return {
      success: result,
      message: result ? 'Bloque de tiempo eliminado correctamente' : 'No se pudo eliminar el bloque de tiempo'
    };
  }
}