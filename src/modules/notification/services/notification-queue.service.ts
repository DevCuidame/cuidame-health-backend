// src/modules/notification/services/notification-queue.service.ts
import { NotificationQueueRepository } from '../repositories/notification-queue.repository';
import { NotificationDeliveryLogRepository } from '../repositories/notification-delivery-log.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationQueue } from '../../../models/notification-extended.model';
import { EmailService } from './email.service';
import { NotFoundError } from '../../../utils/error-handler';
import { UserRepository } from '../../user/user.repository';
import logger from '../../../utils/logger';
import { NotificationStatus } from '../../../models/notification.model';
import { LessThan } from 'typeorm';

/**
 * Servicio para la gestión de la cola de notificaciones
 */
export class NotificationQueueService {
  private queueRepository: NotificationQueueRepository;
  private deliveryLogRepository: NotificationDeliveryLogRepository;
  private notificationRepository: NotificationRepository;
  private userRepository: UserRepository;
  private emailService: EmailService;

  constructor() {
    this.queueRepository = new NotificationQueueRepository();
    this.deliveryLogRepository = new NotificationDeliveryLogRepository();
    this.notificationRepository = new NotificationRepository();
    this.userRepository = new UserRepository();
    this.emailService = EmailService.getInstance();
  }

  /**
   * Añade una notificación a la cola de envío
   * @param notificationId ID de la notificación
   * @param deliveryType Tipo de entrega ('email', 'push', 'inapp')
   * @param payload Datos específicos para la entrega
   * @returns Elemento añadido a la cola
   */
  async enqueueNotification(
    notificationId: number,
    deliveryType: 'email' | 'push' | 'inapp',
    payload: any
  ): Promise<NotificationQueue> {
    // Verificar que la notificación existe
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new NotFoundError(`Notificación con ID ${notificationId} no encontrada`);
    }
    
    // Crear elemento en la cola
    return await this.queueRepository.create({
      notification_id: notificationId,
      delivery_type: deliveryType,
      payload,
      status: 'pending',
      retries: 0,
      max_retries: 3,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  /**
   * Procesa elementos pendientes en la cola
   * @param limit Número máximo de elementos a procesar
   * @returns Número de elementos procesados
   */
  async processQueue(limit: number = 10): Promise<number> {
    // Obtener elementos pendientes
    const pendingItems = await this.queueRepository.findPending(limit);
    
    if (pendingItems.length === 0) {
      return 0;
    }
    
    let processedCount = 0;
    
    // Procesar cada elemento
    for (const item of pendingItems) {
      try {
        // Marcar como en procesamiento
        await this.queueRepository.updateStatus(item.id, 'processing');
        
        // Procesar según el tipo de entrega
        let success = false;
        let error = '';
        
        switch (item.delivery_type) {
          case 'email':
            const result = await this.processEmailDelivery(item);
            success = result.success;
            error = result.error || '';
            break;
          
          case 'push':
            // Implementar procesamiento de notificaciones push
            // Por ahora, simular éxito
            success = true;
            break;
          
          case 'inapp':
            // Para notificaciones in-app, simplemente marcar como entregada
            // ya que se mostrarán cuando el usuario consulte sus notificaciones
            success = true;
            break;
            
          default:
            error = `Tipo de entrega desconocido: ${item.delivery_type}`;
            success = false;
        }
        
        // Actualizar estado del elemento en la cola
        if (success) {
          await this.queueRepository.updateStatus(item.id, 'completed');
          await this.deliveryLogRepository.logSuccess(
            item.notification_id,
            item.delivery_type,
            item.payload.recipient
          );
          
          // Actualizar estado de la notificación si corresponde
          await this.notificationRepository.update(
            item.notification_id,
            { status: NotificationStatus.SENT, sent_at: new Date() },
            'Notificación'
          );
        } else {
          await this.queueRepository.updateStatus(item.id, 'failed', error);
          await this.deliveryLogRepository.logFailure(
            item.notification_id,
            item.delivery_type,
            error,
            item.payload.recipient
          );
        }
        
        processedCount++;
      } catch (error) {
        logger.error(`Error al procesar elemento de cola ${item.id}:`, error);
        
        // Registrar el error y continuar con el siguiente elemento
        await this.queueRepository.updateStatus(
          item.id,
          'failed',
          error instanceof Error ? error.message : 'Error desconocido'
        );
        
        await this.deliveryLogRepository.logFailure(
          item.notification_id,
          item.delivery_type,
          error instanceof Error ? error.message : 'Error desconocido',
          item.payload?.recipient
        );
      }
    }
    
    return processedCount;
  }

  /**
   * Procesa la entrega de una notificación por email
   * @param queueItem Elemento de la cola
   * @returns Resultado del envío
   */
  private async processEmailDelivery(queueItem: NotificationQueue): Promise<{ success: boolean; error?: string }> {
    try {
      const { payload } = queueItem;
      
      // Verificar datos mínimos
      if (!payload || !payload.to || !payload.subject) {
        return { 
          success: false, 
          error: 'Datos insuficientes para enviar email' 
        };
      }
      
      // Enviar email
      const result = await this.emailService.sendEmail({
        to: payload.to,
        cc: payload.cc,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
        attachments: payload.attachments
      });
      
      return {
        success: result.success,
        error: result.error ? (result.error.message || 'Error al enviar email') : undefined
      };
    } catch (error) {
      logger.error('Error al procesar entrega de email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Reintentar elementos fallidos en la cola
   * @param limit Número máximo de elementos a reintentar
   * @returns Número de elementos reintentados
   */
  async retryFailedItems(limit: number = 10): Promise<number> {
    // Buscar elementos fallidos que puedan reintentarse
    const failedItems = await this.queueRepository.findAll({
      where: {
        status: 'failed',
        retries: LessThan(3) // Menos de 3 intentos
      },
      order: { created_at: 'ASC' },
      take: limit
    });
    
    if (failedItems.length === 0) {
      return 0;
    }
    
    // Marcar elementos como pendientes para que sean procesados nuevamente
    let retriedCount = 0;
    
    for (const item of failedItems) {
      await this.queueRepository.update(
        item.id,
        { status: 'pending', updated_at: new Date() },
        'Cola de notificación'
      );
      retriedCount++;
    }
    
    return retriedCount;
  }

  /**
   * Limpia elementos completados antiguos de la cola
   * @param daysOld Eliminar elementos más antiguos que estos días
   * @returns Número de elementos eliminados
   */
  async cleanupCompletedItems(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    // Encontrar elementos completados antiguos
    const oldItems = await this.queueRepository.findAll({
      where: {
        status: 'completed',
        updated_at: LessThan(cutoffDate)
      }
    });
    
    if (oldItems.length === 0) {
      return 0;
    }
    
    // Eliminar elementos
    let deletedCount = 0;
    
    for (const item of oldItems) {
      await this.queueRepository.delete(item.id, 'Cola de notificación');
      deletedCount++;
    }
    
    return deletedCount;
  }
}