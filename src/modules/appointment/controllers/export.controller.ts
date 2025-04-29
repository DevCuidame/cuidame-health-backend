// src/modules/appointment/controllers/export.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { ExportUtils } from '../../../utils/export.util';
import { BadRequestError } from '../../../utils/error-handler';
import { AppointmentStatus } from '../../../models/appointment.model';
import { Between, FindOptionsWhere, In } from 'typeorm';

export class ExportController {
  private appointmentRepository: AppointmentRepository;

  constructor() {
    this.appointmentRepository = new AppointmentRepository();
  }

  /**
   * Exportar citas a CSV
   * @route GET /api/admin/export/appointments/csv
   */
  exportAppointmentsToCSV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Construir filtros basados en los parámetros de consulta
      const whereOptions: FindOptionsWhere<any> = {};
      
      // Filtrar por profesional
      if (req.query.professionalId) {
        whereOptions.professional_id = parseInt(req.query.professionalId as string);
      }
      
      // Filtrar por paciente
      if (req.query.patientId) {
        whereOptions.patient_id = parseInt(req.query.patientId as string);
      }
      
      // Filtrar por tipo de cita
      if (req.query.appointmentTypeId) {
        whereOptions.appointment_type_id = parseInt(req.query.appointmentTypeId as string);
      }
      
      // Filtrar por estado
      if (req.query.status) {
        if (Array.isArray(req.query.status)) {
          whereOptions.status = In(req.query.status as AppointmentStatus[]);
        } else {
          whereOptions.status = req.query.status as AppointmentStatus;
        }
      }
      
      // Filtrar por rango de fechas
      if (req.query.startDate && req.query.endDate) {
        whereOptions.start_time = Between(
          new Date(req.query.startDate as string),
          new Date(req.query.endDate as string)
        );
      } else if (req.query.startDate) {
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1); // Por defecto, un año desde la fecha de inicio
        whereOptions.start_time = Between(
          new Date(req.query.startDate as string),
          endDate
        );
      } else if (req.query.endDate) {
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1); // Por defecto, un año antes de la fecha de fin
        whereOptions.start_time = Between(
          startDate,
          new Date(req.query.endDate as string)
        );
      }
      
      // Buscar citas que coincidan con los filtros
      const appointments = await this.appointmentRepository.findAll({
        where: whereOptions,
        relations: ['patient', 'professional', 'professional.user', 'appointmentType'],
        order: { start_time: 'DESC' }
      });
      
      // Generar CSV
      const csv = ExportUtils.appointmentsToCSV(appointments);
      
      // Configurar encabezados para descarga
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=citas.csv');
      
      // Enviar respuesta
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Exportar citas a JSON
   * @route GET /api/admin/export/appointments/json
   */
  exportAppointmentsToJSON = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Construir filtros basados en los parámetros de consulta
      const whereOptions: FindOptionsWhere<any> = {};
      
      // Filtrar por profesional
      if (req.query.professionalId) {
        whereOptions.professional_id = parseInt(req.query.professionalId as string);
      }
      
      // Filtrar por paciente
      if (req.query.patientId) {
        whereOptions.patient_id = parseInt(req.query.patientId as string);
      }
      
      // Filtrar por tipo de cita
      if (req.query.appointmentTypeId) {
        whereOptions.appointment_type_id = parseInt(req.query.appointmentTypeId as string);
      }
      
      // Filtrar por estado
      if (req.query.status) {
        if (Array.isArray(req.query.status)) {
          whereOptions.status = In(req.query.status as AppointmentStatus[]);
        } else {
          whereOptions.status = req.query.status as AppointmentStatus;
        }
      }
      
      // Filtrar por rango de fechas
      if (req.query.startDate && req.query.endDate) {
        whereOptions.start_time = Between(
          new Date(req.query.startDate as string),
          new Date(req.query.endDate as string)
        );
      } else if (req.query.startDate) {
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
        whereOptions.start_time = Between(
          new Date(req.query.startDate as string),
          endDate
        );
      } else if (req.query.endDate) {
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        whereOptions.start_time = Between(
          startDate,
          new Date(req.query.endDate as string)
        );
      }
      
      // Buscar citas que coincidan con los filtros
      const appointments = await this.appointmentRepository.findAll({
        where: whereOptions,
        relations: ['patient', 'professional', 'professional.user', 'appointmentType'],
        order: { start_time: 'DESC' }
      });
      
      // Generar JSON
      const json = ExportUtils.appointmentsToJSON(appointments);
      
      // Configurar encabezados para descarga
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=citas.json');
      
      // Enviar respuesta
      res.status(200).send(json);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Exportar resumen de citas
   * @route GET /api/admin/export/appointments/summary
   */
  exportAppointmentsSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Construir filtros basados en los parámetros de consulta
      const whereOptions: FindOptionsWhere<any> = {};
      
      // Filtrar por profesional
      if (req.query.professionalId) {
        whereOptions.professional_id = parseInt(req.query.professionalId as string);
      }
      
      // Filtrar por rango de fechas
      if (req.query.startDate && req.query.endDate) {
        whereOptions.start_time = Between(
          new Date(req.query.startDate as string),
          new Date(req.query.endDate as string)
        );
      } else {
        // Por defecto, último mes
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        
        whereOptions.start_time = Between(startDate, endDate);
      }
      
      // Buscar citas que coincidan con los filtros
      const appointments = await this.appointmentRepository.findAll({
        where: whereOptions,
        relations: ['patient', 'professional', 'professional.user', 'appointmentType'],
        order: { start_time: 'DESC' }
      });
      
      // Generar resumen
      const summary = ExportUtils.generateAppointmentSummary(appointments);
      
      // Configurar encabezados para descarga
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename=resumen_citas.txt');
      
      // Enviar respuesta
      res.status(200).send(summary);
    } catch (error) {
      next(error);
    }
  };
}