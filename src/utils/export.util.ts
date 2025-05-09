// src/utils/export.util.ts
import { Appointment } from '../models/appointment.model';

/**
 * Clase de utilidad para exportar datos
 */
export class ExportUtils {
  /**
   * Convierte una lista de citas a formato CSV
   * @param appointments Lista de citas
   * @returns String en formato CSV
   */
  static appointmentsToCSV(appointments: Appointment[]): string {
    if (!appointments || appointments.length === 0) {
      return '';
    }

    // Definir encabezados
    const headers = [
      'ID',
      'Estado',
      'Fecha',
      'Hora Inicio',
      'Hora Fin',
      'Paciente',
      'ID Paciente',
      'Profesional',
      'ID Profesional',
      'Tipo de Cita',
      'ID Tipo de Cita',
      'Notas',
      'Motivo Cancelación',
      'Fecha Creación',
      'Última Actualización'
    ];

    // Crear línea de encabezados
    let csv = headers.join(',') + '\n';

    // Agregar filas de datos
    appointments.forEach(appointment => {
      // Formatear fecha y hora
      const date = appointment.start_time!.toISOString().split('T')[0];
      const startTime = appointment.start_time!.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
      const endTime = appointment.end_time?.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) || '';
      
      // Obtener nombres de paciente y profesional
      const patientName = appointment.patient ? 
        `${appointment.patient.nombre} ${appointment.patient.apellido}`.replace(/,/g, ' ') : 
        '';
      
      const professionalName = appointment.professional?.user ? 
        `${appointment.professional.user.name} ${appointment.professional.user.lastname}`.replace(/,/g, ' ') : 
        '';
      
      // Obtener nombre del tipo de cita
      const appointmentTypeName = appointment.appointmentType?.name || '';
      
      // Escapar notas y motivo de cancelación para evitar problemas con comas
      const notes = appointment.notes ? `"${appointment.notes.replace(/"/g, '""')}"` : '';
      const cancellationReason = appointment.cancellation_reason ? `"${appointment.cancellation_reason.replace(/"/g, '""')}"` : '';
      
      // Crear fila
      const row = [
        appointment.id,
        appointment.status,
        date,
        startTime,
        endTime,
        `"${patientName}"`,
        appointment.patient_id,
        `"${professionalName}"`,
        appointment.professional_id,
        `"${appointmentTypeName}"`,
        appointment.appointment_type_id,
        notes,
        cancellationReason,
        appointment.created_at?.toISOString().replace('T', ' ').substring(0, 19) || '',
        appointment.updated_at?.toISOString().replace('T', ' ').substring(0, 19) || ''
      ];
      
      csv += row.join(',') + '\n';
    });
    
    return csv;
  }
  
  /**
   * Convierte una lista de citas a formato JSON
   * @param appointments Lista de citas
   * @returns String en formato JSON
   */
  static appointmentsToJSON(appointments: Appointment[]): string {
    if (!appointments || appointments.length === 0) {
      return '[]';
    }
    
    // Mapear citas a un formato más amigable
    const mappedAppointments = appointments.map(appointment => {
      const startDate = appointment.start_time!.toISOString();
      const endDate = appointment.end_time?.toISOString() || '';
      
      return {
        id: appointment.id,
        status: appointment.status,
        startTime: startDate,
        endTime: endDate,
        patient: {
          id: appointment.patient_id,
          name: appointment.patient ? `${appointment.patient.nombre} ${appointment.patient.apellido}` : ''
        },
        professional: {
          id: appointment.professional_id,
          name: appointment.professional?.user ? 
            `${appointment.professional.user.name} ${appointment.professional.user.lastname}` : ''
        },
        appointmentType: {
          id: appointment.appointment_type_id,
          name: appointment.appointmentType?.name || ''
        },
        notes: appointment.notes || '',
        cancellationReason: appointment.cancellation_reason || '',
        createdAt: appointment.created_at?.toISOString() || '',
        updatedAt: appointment.updated_at?.toISOString() || ''
      };
    });
    
    return JSON.stringify(mappedAppointments, null, 2);
  }
  
  /**
   * Genera un informe de resumen en formato de texto
   * @param appointments Lista de citas
   * @returns String con resumen de citas
   */
  static generateAppointmentSummary(appointments: Appointment[]): string {
    if (!appointments || appointments.length === 0) {
      return 'No hay citas para mostrar en el informe.';
    }
    
    // Contar citas por estado
    const statusCount: Record<string, number> = {};
    appointments.forEach(appointment => {
      statusCount[appointment.status] = (statusCount[appointment.status] || 0) + 1;
    });
    
    // Obtener fechas mínima y máxima
    const dates = appointments.map(a => a.start_time!.getTime());
    const minDate = new Date(Math.min(...dates)).toLocaleDateString();
    const maxDate = new Date(Math.max(...dates)).toLocaleDateString();
    
    // Contar citas por profesional
    const professionalCount: Record<string, number> = {};
    appointments.forEach(appointment => {
      const profName = appointment.professional?.user ? 
        `${appointment.professional.user.name} ${appointment.professional.user.lastname}` : 
        `ID: ${appointment.professional_id}`;
      
      professionalCount[profName] = (professionalCount[profName] || 0) + 1;
    });
    
    // Contar citas por tipo
    const typeCount: Record<string, number> = {};
    appointments.forEach(appointment => {
      const typeName = appointment.appointmentType?.name || `ID: ${appointment.appointment_type_id}`;
      typeCount[typeName] = (typeCount[typeName] || 0) + 1;
    });
    
    // Generar informe
    let summary = '===============================================\n';
    summary += '              RESUMEN DE CITAS                  \n';
    summary += '===============================================\n\n';
    
    summary += `Período: ${minDate} - ${maxDate}\n`;
    summary += `Total de citas: ${appointments.length}\n\n`;
    
    summary += '--------------- POR ESTADO ----------------\n';
    Object.entries(statusCount).forEach(([status, count]) => {
      summary += `${status}: ${count} (${(count / appointments.length * 100).toFixed(1)}%)\n`;
    });
    
    summary += '\n------------ POR PROFESIONAL -------------\n';
    Object.entries(professionalCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([name, count]) => {
        summary += `${name}: ${count}\n`;
      });
    
    summary += '\n------------- POR TIPO DE CITA -----------\n';
    Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => {
        summary += `${name}: ${count}\n`;
      });
    
    summary += '\n===============================================\n';
    summary += `Informe generado el ${new Date().toLocaleString()}\n`;
    summary += '===============================================\n';
    
    return summary;
  }
  
  /**
   * Convierte datos genéricos a formato Excel (XML)
   * @param data Datos para exportar
   * @param headers Encabezados de columnas
   * @returns String en formato XML de Excel
   */
  static dataToExcelXML(data: any[], headers: string[]): string {
    if (!data || data.length === 0 || !headers || headers.length === 0) {
      return '';
    }
    
    let xml = '<?xml version="1.0"?>\n';
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
    xml += '<Worksheet ss:Name="Sheet1">\n';
    xml += '<Table>\n';
    
    // Agregar fila de encabezados
    xml += '<Row>\n';
    headers.forEach(header => {
      xml += `<Cell><Data ss:Type="String">${header}</Data></Cell>\n`;
    });
    xml += '</Row>\n';
    
    // Agregar filas de datos
    data.forEach(row => {
      xml += '<Row>\n';
      headers.forEach(header => {
        const value = row[header] !== undefined ? row[header] : '';
        
        // Determinar el tipo de dato
        let type = 'String';
        if (typeof value === 'number') {
          type = 'Number';
        } else if (value instanceof Date) {
          type = 'DateTime';
        }
        
        // Formatear el valor según el tipo
        let formattedValue = value;
        if (type === 'DateTime' && value) {
          formattedValue = value.toISOString();
        }
        
        xml += `<Cell><Data ss:Type="${type}">${formattedValue}</Data></Cell>\n`;
      });
      xml += '</Row>\n';
    });
    
    xml += '</Table>\n';
    xml += '</Worksheet>\n';
    xml += '</Workbook>';
    
    return xml;
  }
}