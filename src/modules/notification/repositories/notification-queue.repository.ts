
// src/modules/notification/repositories/notification-queue.repository.ts
import { NotificationQueue } from '../../../models/notification-extended.model';
import { BaseRepository } from '../../../core/repositories/base.repository';
import { LessThan } from 'typeorm';

export class NotificationQueueRepository extends BaseRepository<NotificationQueue> {
  constructor() {
    super(NotificationQueue);
  }

  /**
   * Encuentra elementos pendientes en la cola
   * @param limit Límite de elementos a recuperar
   * @returns Lista de elementos pendientes
   */
  async findPending(limit: number = 10): Promise<NotificationQueue[]> {
    return await this.repository.find({
      where: [
        { status: 'pending' },
        { 
          status: 'failed', 
          retries: LessThan(({ max_retries: true } as any)),
          next_retry: LessThan(new Date())
        }
      ],
      order: { created_at: 'ASC' },
      take: limit
    });
  }

  /**
   * Actualiza el estado de un elemento de la cola
   * @param id ID del elemento
   * @param status Nuevo estado
   * @param error Mensaje de error (opcional)
   * @returns Elemento actualizado
   */
  async updateStatus(id: number, status: string, error?: string): Promise<NotificationQueue> {
    const item = await this.findByIdOrFail(id, 'NotificationQueue');
    
    const updateData: any = { status };
    
    if (error) {
      updateData.error = error;
    }
    
    if (status === 'failed') {
      // Incrementar conteo de reintentos y programar próximo intento
      updateData.retries = item.retries + 1;
      
      if (updateData.retries < item.max_retries) {
        // Programar reintento con backoff exponencial (5min, 25min, 125min)
        const delayMinutes = Math.pow(5, updateData.retries);
        const nextRetry = new Date();
        nextRetry.setMinutes(nextRetry.getMinutes() + delayMinutes);
        updateData.next_retry = nextRetry;
        updateData.status = 'pending'; // Volver a marcar como pendiente para futuro reintento
      }
    }
    
    return await this.update(id, updateData, 'NotificationQueue');
  }
}
