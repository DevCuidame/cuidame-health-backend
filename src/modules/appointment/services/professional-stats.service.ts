// src/modules/appointment/services/professional-stats.service.ts
import { HealthProfessionalRepository } from '../repositories/health-professional.repository';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { AppointmentStatus } from '../../../models/appointment.model';
import { Between } from 'typeorm';

/**
 * Servicio para obtener estadísticas de profesionales
 */
export class ProfessionalStatsService {
  private healthProfessionalRepository: HealthProfessionalRepository;
  private appointmentRepository: AppointmentRepository;

  constructor() {
    this.healthProfessionalRepository = new HealthProfessionalRepository();
    this.appointmentRepository = new AppointmentRepository();
  }

  /**
   * Obtener estadísticas detalladas de un profesional
   * @param professionalId ID del profesional
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @returns Estadísticas del profesional
   */

  async getProfessionalStats(
    professionalId: number,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    // Obtener información del profesional
    const professional = await this.healthProfessionalRepository.findById(professionalId, {
      relations: ['user']
    });

    if (!professional) {
      return null;
    }

    // Obtener citas en el rango de fechas
    const appointments = await this.appointmentRepository.findAll({
      where: {
        professional_id: professionalId,
        start_time: Between(startDate, endDate)
      },
      relations: ['patient', 'appointmentType']
    });

    // Inicializar estadísticas
    const stats = {
      professionalId,
      professionalName: professional.user ? `${professional.user.name} ${professional.user.lastname}` : `Profesional ID ${professionalId}`,
      specialty: professional.specialty,
      appointments: {
        total: appointments.length,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        noShow: 0,
        requested: 0
      },
      metrics: {
        completionRate: 0, // Completadas / (Confirmadas + Completadas + No-show)
        cancellationRate: 0, // Canceladas / Total
        averageDuration: 0, // Duración promedio en minutos
        busyDays: [] as any[], // Días con más citas
        patientDistribution: {} as Record<number, number>, // Distribución por paciente
        appointmentTypeDistribution: {} as Record<number, number> // Distribución por tipo de cita
      },
      timeSlots: {
        morning: 0, // 6:00 - 12:00
        afternoon: 0, // 12:00 - 18:00
        evening: 0 // 18:00 - 23:59
      }
    };

    // Si no hay citas, devolver las estadísticas iniciales
    if (appointments.length === 0) {
      return stats;
    }

    // Procesamiento de citas para estadísticas
    let totalDuration = 0;
    const appointmentsByDay: Record<string, number> = {};

    appointments.forEach(appointment => {
      // Contar por estado
      switch (appointment.status) {
        case AppointmentStatus.CONFIRMED:
          stats.appointments.confirmed++;
          break;
        case AppointmentStatus.COMPLETED:
          stats.appointments.completed++;
          break;
        case AppointmentStatus.CANCELLED:
          stats.appointments.cancelled++;
          break;
        case AppointmentStatus.NO_SHOW:
          stats.appointments.noShow++;
          break;
        case AppointmentStatus.REQUESTED:
          stats.appointments.requested++;
          break;
      }

      // Calcular duración para citas completadas
      if (
        appointment.status === AppointmentStatus.COMPLETED &&
        appointment.end_time &&
        appointment.start_time
      ) {
        const durationMs = appointment.end_time.getTime() - appointment.start_time.getTime();
        const durationMinutes = durationMs / (1000 * 60);
        totalDuration += durationMinutes;
      }

      // Contar por franja horaria
      const hour = appointment.start_time!.getHours();
      if (hour >= 6 && hour < 12) {
        stats.timeSlots.morning++;
      } else if (hour >= 12 && hour < 18) {
        stats.timeSlots.afternoon++;
      } else {
        stats.timeSlots.evening++;
      }

      // Contar por día
      const dateKey = appointment.start_time!.toISOString().split('T')[0]; // YYYY-MM-DD
      appointmentsByDay[dateKey] = (appointmentsByDay[dateKey] || 0) + 1;

      // Contar por paciente
      const patientId = appointment.patient_id;
      stats.metrics.patientDistribution[patientId] = (stats.metrics.patientDistribution[patientId] || 0) + 1;

      // Contar por tipo de cita
      const appointmentTypeId = appointment.appointment_type_id;
      stats.metrics.appointmentTypeDistribution[appointmentTypeId!] = 
        (stats.metrics.appointmentTypeDistribution[appointmentTypeId!] || 0) + 1;
    });

    // Calcular métricas
    const completedAndNoShow = stats.appointments.completed + stats.appointments.confirmed + stats.appointments.noShow;
    if (completedAndNoShow > 0) {
      stats.metrics.completionRate = stats.appointments.completed / completedAndNoShow;
    }

    if (stats.appointments.total > 0) {
      stats.metrics.cancellationRate = stats.appointments.cancelled / stats.appointments.total;
    }

    if (stats.appointments.completed > 0) {
      stats.metrics.averageDuration = totalDuration / stats.appointments.completed;
    }

    // Encontrar los días más ocupados
    stats.metrics.busyDays = Object.entries(appointmentsByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 días más ocupados

    return stats;
  }

  /**
   * Obtener un ranking de profesionales por número de citas completadas
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @param limit Límite de resultados (por defecto 10)
   * @returns Lista de profesionales con sus estadísticas básicas
   */
  async getProfessionalsRanking(
    startDate: Date,
    endDate: Date,
    limit: number = 10
  ): Promise<any[]> {
    // Obtener todos los profesionales
    const professionals = await this.healthProfessionalRepository.findAll({
      where: { is_active: true },
      relations: ['user']
    });

    if (!professionals || professionals.length === 0) {
      return [];
    }

    // Inicializar array de resultados
    const ranking: Array<{
      professionalId: number;
      professionalName: string;
      specialty: string;
      completedAppointments: number;
      cancelledAppointments: number;
      totalAppointments: number;
      completionRate: number;
    }> = [];

    // Obtener estadísticas para cada profesional
    for (const professional of professionals) {
      // Obtener citas del profesional en el rango de fechas
      const appointments = await this.appointmentRepository.findAll({
        where: {
          professional_id: professional.id,
          start_time: Between(startDate, endDate)
        }
      });

      // Contar citas por estado
      let completedCount = 0;
      let cancelledCount = 0;

      appointments.forEach(appointment => {
        if (appointment.status === AppointmentStatus.COMPLETED) {
          completedCount++;
        } else if (appointment.status === AppointmentStatus.CANCELLED) {
          cancelledCount++;
        }
      });

      // Calcular tasa de finalización
      const completionRate = appointments.length > 0
        ? completedCount / appointments.length
        : 0;

      // Añadir al ranking
      ranking.push({
        professionalId: professional.id,
        professionalName: professional.user 
          ? `${professional.user.name} ${professional.user.lastname}`
          : `Profesional ID ${professional.id}`,
        specialty: professional.specialty,
        completedAppointments: completedCount,
        cancelledAppointments: cancelledCount,
        totalAppointments: appointments.length,
        completionRate
      });
    }

    // Ordenar por número de citas completadas (descendente)
    ranking.sort((a, b) => b.completedAppointments - a.completedAppointments);

    // Limitar resultados
    return ranking.slice(0, limit);
  }

  /**
   * Obtener estadísticas comparativas entre profesionales
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @returns Estadísticas comparativas
   */
  async getComparativeStats(startDate: Date, endDate: Date): Promise<any> {
    // Obtener todos los profesionales activos
    const professionals = await this.healthProfessionalRepository.findAll({
      where: { is_active: true },
      relations: ['user']
    });

    // Obtener todas las citas en el rango de fechas
    const appointments = await this.appointmentRepository.findByDateRange(startDate, endDate);

    // Inicializar estadísticas comparativas
    const stats = {
      professionalComparison: [] as any[],
      specialtyComparison: {} as Record<string, {
        specialty: string;
        appointmentCount: number;
        completionRate: number;
        averageDuration: number;
      }>,
      topPerformers: {
        highestCompletionRate: null as any,
        lowestCancellationRate: null as any,
        mostAppointments: null as any
      }
    };

    // Información temporal por especialidad para cálculos
    const specialtyTempData: Record<string, {
      professionals: number;
      totalCompleted: number;
      totalDuration: number;
    }> = {};

    // Agrupar citas por profesional
    const appointmentsByProfessional: Record<number, any[]> = {};
    appointments.forEach(appointment => {
      if (!appointmentsByProfessional[appointment.professional_id!]) {
        appointmentsByProfessional[appointment.professional_id!] = [];
      }
      appointmentsByProfessional[appointment.professional_id!].push(appointment);
    });

    // Calcular estadísticas por profesional
    for (const professional of professionals) {
      const proAppointments = appointmentsByProfessional[professional.id] || [];
      
      // Inicializar contadores
      let completed = 0;
      let cancelled = 0;
      let totalDuration = 0;

      // Contar citas por estado
      proAppointments.forEach(appointment => {
        if (appointment.status === AppointmentStatus.COMPLETED) {
          completed++;
          
          // Calcular duración para citas completadas
          if (appointment.end_time && appointment.start_time) {
            const durationMs = appointment.end_time.getTime() - appointment.start_time.getTime();
            const durationMinutes = durationMs / (1000 * 60);
            totalDuration += durationMinutes;
          }
        } else if (appointment.status === AppointmentStatus.CANCELLED) {
          cancelled++;
        }
      });

      // Calcular tasas
      const completionRate = proAppointments.length > 0
        ? completed / proAppointments.length
        : 0;
      
      const cancellationRate = proAppointments.length > 0
        ? cancelled / proAppointments.length
        : 0;
      
      const averageDuration = completed > 0
        ? totalDuration / completed
        : 0;

      // Añadir a la comparación de profesionales
      const professionalStats = {
        professionalId: professional.id,
        professionalName: professional.user 
          ? `${professional.user.name} ${professional.user.lastname}`
          : `Profesional ID ${professional.id}`,
        specialty: professional.specialty,
        appointmentCount: proAppointments.length,
        completedCount: completed,
        cancelledCount: cancelled,
        completionRate,
        cancellationRate,
        averageDuration
      };
      
      stats.professionalComparison.push(professionalStats);

      // Inicializar o actualizar datos temporales de la especialidad
      if (!specialtyTempData[professional.specialty]) {
        specialtyTempData[professional.specialty] = {
          professionals: 0,
          totalCompleted: 0,
          totalDuration: 0
        };
      }

      // Inicializar o actualizar estadísticas por especialidad en el resultado final
      if (!stats.specialtyComparison[professional.specialty]) {
        stats.specialtyComparison[professional.specialty] = {
          specialty: professional.specialty,
          appointmentCount: 0,
          completionRate: 0,
          averageDuration: 0
        };
      }

      // Actualizar datos temporales de la especialidad
      const tempSpecialtyData = specialtyTempData[professional.specialty];
      tempSpecialtyData.professionals++;
      tempSpecialtyData.totalCompleted += completed;
      tempSpecialtyData.totalDuration += totalDuration;

      // Actualizar el contador de citas en el resultado final
      stats.specialtyComparison[professional.specialty].appointmentCount += proAppointments.length;
    }

    // Calcular promedios por especialidad usando los datos temporales
    Object.keys(stats.specialtyComparison).forEach(specialty => {
      const specialtyStats = stats.specialtyComparison[specialty];
      const tempData = specialtyTempData[specialty];
      
      specialtyStats.completionRate = specialtyStats.appointmentCount > 0
        ? tempData.totalCompleted / specialtyStats.appointmentCount
        : 0;
      
      specialtyStats.averageDuration = tempData.totalCompleted > 0
        ? tempData.totalDuration / tempData.totalCompleted
        : 0;
    });

    // Determinar los mejores rendimientos
    if (stats.professionalComparison.length > 0) {
      // Profesional con mayor tasa de finalización
      stats.topPerformers.highestCompletionRate = [...stats.professionalComparison]
        .filter(p => p.appointmentCount > 0) // Solo considerar profesionales con citas
        .sort((a, b) => b.completionRate - a.completionRate)[0];

      // Profesional con menor tasa de cancelación
      stats.topPerformers.lowestCancellationRate = [...stats.professionalComparison]
        .filter(p => p.appointmentCount > 0)
        .sort((a, b) => a.cancellationRate - b.cancellationRate)[0];

      // Profesional con más citas
      stats.topPerformers.mostAppointments = [...stats.professionalComparison]
        .sort((a, b) => b.appointmentCount - a.appointmentCount)[0];
    }

    return stats;
  }
}