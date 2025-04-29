// src/modules/appointment/services/admin-appointment.service.ts
import { AppointmentService } from './appointment.service';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { Appointment, AppointmentStatus } from '../../../models/appointment.model';
import { NotificationService } from '../../notification/notification.service';
import { NotificationType } from '../../../models/notification.model';
import { BadRequestError, NotFoundError } from '../../../utils/error-handler';
import { Between, FindOptionsWhere, In, Like } from 'typeorm';
import { PaginatedResult, PaginationParams } from '../../../core/interfaces/response.interface';

/**
 * Interfaz para filtros de búsqueda de citas
 */
export interface AppointmentFilterOptions {
  professionalId?: number;
  patientId?: number;
  appointmentTypeId?: number;
  status?: AppointmentStatus | AppointmentStatus[];
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
}

/**
 * Servicio administrativo para gestión avanzada de citas
 */
export class AdminAppointmentService {
  private appointmentService: AppointmentService;
  private appointmentRepository: AppointmentRepository;
  private notificationService: NotificationService;

  constructor() {
    this.appointmentService = new AppointmentService();
    this.appointmentRepository = new AppointmentRepository();
    this.notificationService = new NotificationService();
  }

  /**
   * Buscar citas con filtros avanzados y paginación
   * @param filters Filtros de búsqueda
   * @param pagination Parámetros de paginación
   * @returns Resultado paginado de citas
   */
  async searchAppointmentsWithPagination(
    filters: AppointmentFilterOptions,
    pagination: PaginationParams
  ): Promise<PaginatedResult<Appointment>> {
    const whereOptions: FindOptionsWhere<Appointment> = {};
    
    // Aplicar filtros
    if (filters.professionalId) {
      whereOptions.professional_id = filters.professionalId;
    }
    
    if (filters.patientId) {
      whereOptions.patient_id = filters.patientId;
    }
    
    if (filters.appointmentTypeId) {
      whereOptions.appointment_type_id = filters.appointmentTypeId;
    }
    
    if (filters.status) {
      whereOptions.status = Array.isArray(filters.status) 
        ? In(filters.status) 
        : filters.status;
    }
    
    if (filters.startDate && filters.endDate) {
      whereOptions.start_time = Between(filters.startDate, filters.endDate);
    } else if (filters.startDate) {
      // Si solo hay fecha de inicio, buscar citas desde esa fecha
      whereOptions.start_time = Between(
        filters.startDate,
        new Date(new Date().setFullYear(new Date().getFullYear() + 10)) // +10 años como máximo
      );
    } else if (filters.endDate) {
      // Si solo hay fecha de fin, buscar citas hasta esa fecha
      whereOptions.start_time = Between(
        new Date(new Date().setFullYear(new Date().getFullYear() - 10)), // -10 años como mínimo
        filters.endDate
      );
    }
    
    return await this.appointmentRepository.findWithPagination(
      pagination,
      {
        where: whereOptions,
        relations: ['patient', 'professional', 'professional.user', 'appointmentType']
      }
    );
  }

  /**
   * Obtener métricas de citas para el dashboard
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @returns Métricas de citas
   */
  async getAppointmentMetrics(startDate: Date, endDate: Date): Promise<any> {
    // Obtener todas las citas en el rango
    const appointments = await this.appointmentRepository.findByDateRange(startDate, endDate);
    
    // Calcular métricas
    const metrics = {
      total: appointments.length,
      byStatus: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      byProfessional: {} as Record<string, number>,
      dailyDistribution: {} as Record<string, number>
    };
    
    // Conteo por estado
    appointments.forEach(appointment => {
      // Por estado
      if (!metrics.byStatus[appointment.status]) {
        metrics.byStatus[appointment.status] = 0;
      }
      metrics.byStatus[appointment.status]++;
      
      // Por tipo de cita
      const typeId = appointment.appointment_type_id.toString();
      if (!metrics.byType[typeId]) {
        metrics.byType[typeId] = 0;
      }
      metrics.byType[typeId]++;
      
      // Por profesional
      const professionalId = appointment.professional_id.toString();
      if (!metrics.byProfessional[professionalId]) {
        metrics.byProfessional[professionalId] = 0;
      }
      metrics.byProfessional[professionalId]++;
      
      // Distribución diaria
      const dateKey = appointment.start_time.toISOString().split('T')[0]; // YYYY-MM-DD
      if (!metrics.dailyDistribution[dateKey]) {
        metrics.dailyDistribution[dateKey] = 0;
      }
      metrics.dailyDistribution[dateKey]++;
    });
    
    return metrics;
  }

  /**
   * Procesar aprobación/rechazo en masa de citas
   * @param appointmentIds IDs de las citas a procesar
   * @param action Acción a realizar ('confirm' o 'reject')
   * @param reason Motivo en caso de rechazo
   * @param userId ID del usuario que realiza la acción
   * @returns Resultado de la operación
   */
  async bulkProcessAppointments(
    appointmentIds: number[],
    action: 'confirm' | 'reject',
    reason: string | undefined,
    userId: number
  ): Promise<{ success: boolean; processed: number; failed: number; message: string }> {
    let processed = 0;
    let failed = 0;
    
    // Validar que haya IDs de citas
    if (!appointmentIds || appointmentIds.length === 0) {
      throw new BadRequestError('No se especificaron citas para procesar');
    }
    
    // Procesar cada cita
    for (const id of appointmentIds) {
      try {
        const appointment = await this.appointmentRepository.findById(id);
        
        if (!appointment) {
          failed++;
          continue;
        }
        
        // Solo procesar citas en estado 'solicitada'
        if (appointment.status !== AppointmentStatus.REQUESTED) {
          failed++;
          continue;
        }
        
        // Actualizar estado según la acción
        const newStatus = action === 'confirm' 
          ? AppointmentStatus.CONFIRMED 
          : AppointmentStatus.CANCELLED;
        
        // Actualizar appointment y enviar notificación
        await this.appointmentService.changeAppointmentStatus(id, newStatus, reason, userId);
        
        // Enviar notificación al paciente
        const notificationType = action === 'confirm' 
          ? NotificationType.APPOINTMENT_CONFIRMED 
          : NotificationType.APPOINTMENT_CANCELLED;
        
        const title = action === 'confirm' 
          ? 'Cita confirmada' 
          : 'Cita rechazada';
        
        const message = action === 'confirm'
          ? `Tu cita para el ${appointment.start_time.toLocaleDateString()} a las ${appointment.start_time.toLocaleTimeString()} ha sido confirmada.`
          : `Tu cita para el ${appointment.start_time.toLocaleDateString()} a las ${appointment.start_time.toLocaleTimeString()} ha sido rechazada. ${reason ? `Motivo: ${reason}` : ''}`;
        
        await this.notificationService.createNotification({
          user_id: appointment.patient_id,
          appointment_id: appointment.id,
          type: notificationType,
          title,
          message
        });
        
        processed++;
      } catch (error) {
        failed++;
      }
    }
    
    return {
      success: processed > 0,
      processed,
      failed,
      message: `Proceso completado. ${processed} citas procesadas, ${failed} fallidas.`
    };
  }

  /**
   * Reasignar una cita a otro profesional
   * @param appointmentId ID de la cita
   * @param newProfessionalId ID del nuevo profesional
   * @param userId ID del usuario que realiza la acción
   * @returns Cita actualizada
   */
  async reassignAppointment(
    appointmentId: number,
    newProfessionalId: number,
    userId: number
  ): Promise<Appointment> {
    // Obtener la cita
    const appointment = await this.appointmentService.getAppointmentById(appointmentId);
    
    // Verificar que la cita no esté en estado completada o cancelada
    if (
      appointment.status === AppointmentStatus.COMPLETED ||
      appointment.status === AppointmentStatus.CANCELLED
    ) {
      throw new BadRequestError(
        'No se puede reasignar una cita que ya ha sido completada o cancelada'
      );
    }
    
    // Verificar que el nuevo profesional existe y está disponible en ese horario
    // Reutilizamos la lógica de verificación de conflictos
    const hasConflict = await this.appointmentRepository.hasConflictingAppointments(
      newProfessionalId,
      appointment.start_time,
      appointment.end_time
    );
    
    if (hasConflict) {
      throw new BadRequestError(
        'El profesional seleccionado no está disponible en este horario'
      );
    }
    
    // Actualizar la cita
    const updatedAppointment = await this.appointmentService.updateAppointment(
      appointmentId,
      { 
        professional_id: newProfessionalId,
        status: AppointmentStatus.CONFIRMED, // Al reasignar, confirmamos la cita
        modified_by_id: userId
      },
      userId
    );
    
    // Notificar al paciente sobre la reasignación
    await this.notificationService.createNotification({
      user_id: appointment.patient_id,
      appointment_id: appointment.id,
      type: NotificationType.APPOINTMENT_RESCHEDULED,
      title: 'Cita reasignada',
      message: `Tu cita para el ${appointment.start_time.toLocaleDateString()} a las ${appointment.start_time.toLocaleTimeString()} ha sido reasignada a un nuevo profesional.`
    });
    
    return updatedAppointment;
  }

  /**
   * Obtener la carga de trabajo de los profesionales
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @returns Métricas de carga de trabajo por profesional
   */
  async getProfessionalWorkload(startDate: Date, endDate: Date): Promise<any[]> {
    const appointments = await this.appointmentRepository.findByDateRange(startDate, endDate);
    
    // Agrupar por profesional
    const workloadByProfessional: Record<number, {
      professionalId: number;
      professionalName: string;
      total: number;
      confirmed: number;
      completed: number;
      cancelled: number;
      noShow: number;
      requested: number;
      averageDuration: number;
      totalHours: number;
    }> = {};
    
    // Procesar citas
    appointments.forEach(appointment => {
      const professionalId = appointment.professional_id;
      
      // Inicializar si no existe
      if (!workloadByProfessional[professionalId]) {
        const professionalName = appointment.professional?.user?.name 
          ? `${appointment.professional.user.name} ${appointment.professional.user.lastname}`
          : `Profesional ID ${professionalId}`;
          
        workloadByProfessional[professionalId] = {
          professionalId,
          professionalName,
          total: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
          noShow: 0,
          requested: 0,
          averageDuration: 0,
          totalHours: 0
        };
      }
      
      // Incrementar contadores
      workloadByProfessional[professionalId].total++;
      
      // Contar por estado
      switch (appointment.status) {
        case AppointmentStatus.CONFIRMED:
          workloadByProfessional[professionalId].confirmed++;
          break;
        case AppointmentStatus.COMPLETED:
          workloadByProfessional[professionalId].completed++;
          break;
        case AppointmentStatus.CANCELLED:
          workloadByProfessional[professionalId].cancelled++;
          break;
        case AppointmentStatus.NO_SHOW:
          workloadByProfessional[professionalId].noShow++;
          break;
        case AppointmentStatus.REQUESTED:
          workloadByProfessional[professionalId].requested++;
          break;
      }
      
      // Calcular duración y horas totales
      if (appointment.end_time && appointment.start_time) {
        const durationMs = appointment.end_time.getTime() - appointment.start_time.getTime();
        const durationMinutes = durationMs / (1000 * 60);
        
        // Solo contar citas completadas o confirmadas para el promedio
        if (
          appointment.status === AppointmentStatus.COMPLETED ||
          appointment.status === AppointmentStatus.CONFIRMED
        ) {
          // Actualizar duración promedio
          const currentTotal = workloadByProfessional[professionalId].averageDuration * 
                              (workloadByProfessional[professionalId].completed + 
                               workloadByProfessional[professionalId].confirmed - 1);
          
          workloadByProfessional[professionalId].averageDuration = 
            (currentTotal + durationMinutes) / 
            (workloadByProfessional[professionalId].completed + 
             workloadByProfessional[professionalId].confirmed);
          
          // Añadir al total de horas
          workloadByProfessional[professionalId].totalHours += durationMinutes / 60;
        }
      }
    });
    
    // Convertir el objeto a un array para la respuesta
    return Object.values(workloadByProfessional);
  }
}