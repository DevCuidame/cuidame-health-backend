import { Request, Response } from 'express';
import { TwilioService } from '../services/twilio.service';
import { MultiChannelNotificationService } from '../services/multi-channel-notification.service';
import { 
  CreateMultiChannelNotificationDto, 
  SmsConfig, 
  WhatsAppConfig 
} from '../notification.interface';
import { BadRequestError, NotFoundError } from '../../../utils/error-handler';
import { validatePhoneNumber } from '../../../utils/validators';
import logger from '../../../utils/logger';

/**
 * Controlador para las funcionalidades de Twilio
 * Maneja endpoints para SMS, WhatsApp y notificaciones multicanal
 */
export class TwilioController {
  private twilioService: TwilioService;
  private multiChannelService: MultiChannelNotificationService;

  constructor() {
    this.twilioService = TwilioService.getInstance();
    this.multiChannelService = new MultiChannelNotificationService();
  }

  /**
   * Envía un SMS
   * POST /api/notifications/sms
   */
  sendSMS = async (req: Request, res: Response): Promise<void> => {
    try {
      const { to, message, templateType, templateData }: {
        to: string;
        message: string;
        templateType?: string;
        templateData?: any;
      } = req.body;

      // Validaciones
      if (!to || !message) {
        throw new BadRequestError('Los campos "to" y "message" son requeridos');
      }

      if (!validatePhoneNumber(to)) {
        throw new BadRequestError('Número de teléfono inválido');
      }

      logger.info(`📱 Solicitud de envío de SMS a ${to}`);

      // Enviar SMS usando el servicio multicanal para aprovechar las plantillas
      const result = await this.multiChannelService.sendSMS(
        to, 
        message, 
        templateType, 
        templateData
      );

      logger.info('✅ SMS enviado exitosamente');
      
      res.status(200).json({
        success: true,
        message: 'SMS enviado exitosamente',
        data: result
      });
      
    } catch (error) {
      logger.error('❌ Error al enviar SMS:', error);
      
      if (error instanceof BadRequestError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor al enviar SMS'
        });
      }
    }
  };

  /**
   * Envía un mensaje de WhatsApp
   * POST /api/notifications/whatsapp
   */
  sendWhatsApp = async (req: Request, res: Response): Promise<void> => {
    try {
      const { to, message, mediaUrl, templateType, templateData }: {
        to: string;
        message: string;
        mediaUrl?: string | string[];
        templateType?: string;
        templateData?: any;
      } = req.body;

      // Validaciones
      if (!to || !message) {
        throw new BadRequestError('Los campos "to" y "message" son requeridos');
      }

      if (!validatePhoneNumber(to)) {
        throw new BadRequestError('Número de teléfono inválido');
      }

      logger.info(`📱 Solicitud de envío de WhatsApp a ${to}`);

      // Enviar WhatsApp usando el servicio multicanal
      const result = await this.multiChannelService.sendWhatsApp(
        to, 
        message, 
        mediaUrl,
        templateType, 
        templateData
      );

      logger.info('✅ WhatsApp enviado exitosamente');
      
      res.status(200).json({
        success: true,
        message: 'WhatsApp enviado exitosamente',
        data: result
      });
      
    } catch (error) {
      logger.error('❌ Error al enviar WhatsApp:', error);
      
      if (error instanceof BadRequestError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor al enviar WhatsApp'
        });
      }
    }
  };

  /**
   * Envía notificación multicanal
   * POST /api/notifications/multi-channel
   */
  sendMultiChannelNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const notificationData: CreateMultiChannelNotificationDto = req.body;

      // Validaciones básicas
      if (!notificationData.user_id || !notificationData.type || !notificationData.message) {
        throw new BadRequestError('Los campos "user_id", "type" y "message" son requeridos');
      }

      logger.info(`📢 Solicitud de notificación multicanal para usuario ${notificationData.user_id}`);

      const result = await this.multiChannelService.sendMultiChannelNotification(notificationData);

      logger.info('✅ Notificación multicanal procesada');
      
      res.status(200).json({
        success: true,
        message: 'Notificación multicanal enviada',
        data: result
      });
      
    } catch (error) {
      logger.error('❌ Error en notificación multicanal:', error);
      
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        res.status(error instanceof BadRequestError ? 400 : 404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor en notificación multicanal'
        });
      }
    }
  };

  /**
   * Valida un número de teléfono
   * POST /api/notifications/validate-phone
   */
  validatePhoneNumber = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phoneNumber }: { phoneNumber: string } = req.body;

      if (!phoneNumber) {
        throw new BadRequestError('El campo "phoneNumber" es requerido');
      }

      logger.info(`🔍 Validando número de teléfono: ${phoneNumber}`);

      const result = await this.multiChannelService.validatePhoneNumber(phoneNumber);

      res.status(200).json({
        success: true,
        message: 'Número validado',
        data: result
      });
      
    } catch (error) {
      logger.error('❌ Error al validar número:', error);
      
      if (error instanceof BadRequestError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor al validar número'
        });
      }
    }
  };

  /**
   * Obtiene el estado de un mensaje
   * GET /api/notifications/message-status/:messageSid
   */
  getMessageStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { messageSid } = req.params;

      if (!messageSid) {
        throw new BadRequestError('El parámetro "messageSid" es requerido');
      }

      logger.info(`🔍 Consultando estado del mensaje: ${messageSid}`);

      const result = await this.multiChannelService.getMessageStatus(messageSid);

      res.status(200).json({
        success: true,
        message: 'Estado del mensaje obtenido',
        data: result
      });
      
    } catch (error) {
      logger.error('❌ Error al obtener estado del mensaje:', error);
      
      if (error instanceof BadRequestError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor al obtener estado del mensaje'
        });
      }
    }
  };

  /**
   * Obtiene el estado de los servicios
   * GET /api/notifications/service-status
   */
  getServiceStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('🔍 Consultando estado de los servicios');

      const result = await this.multiChannelService.getServiceStatus();

      res.status(200).json({
        success: true,
        message: 'Estado de los servicios obtenido',
        data: result
      });
      
    } catch (error) {
      logger.error('❌ Error al obtener estado de los servicios:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener estado de los servicios'
      });
    }
  };

  /**
   * Envía recordatorio de cita
   * POST /api/notifications/appointment-reminder
   */
  sendAppointmentReminder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, appointmentData, channels } = req.body;

      if (!userId || !appointmentData) {
        throw new BadRequestError('Los campos "userId" y "appointmentData" son requeridos');
      }

      logger.info(`📅 Enviando recordatorio de cita para usuario ${userId}`);

      const result = await this.multiChannelService.sendAppointmentReminder(
        userId, 
        appointmentData, 
        channels
      );

      logger.info('✅ Recordatorio de cita enviado');
      
      res.status(200).json({
        success: true,
        message: 'Recordatorio de cita enviado',
        data: result
      });
      
    } catch (error) {
      logger.error('❌ Error al enviar recordatorio de cita:', error);
      
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        res.status(error instanceof BadRequestError ? 400 : 404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor al enviar recordatorio de cita'
        });
      }
    }
  };

  /**
   * Envía confirmación de cita
   * POST /api/notifications/appointment-confirmation
   */
  sendAppointmentConfirmation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, appointmentData, channels } = req.body;

      if (!userId || !appointmentData) {
        throw new BadRequestError('Los campos "userId" y "appointmentData" son requeridos');
      }

      logger.info(`📅 Enviando confirmación de cita para usuario ${userId}`);

      const result = await this.multiChannelService.sendAppointmentConfirmation(
        userId, 
        appointmentData, 
        channels
      );

      logger.info('✅ Confirmación de cita enviada');
      
      res.status(200).json({
        success: true,
        message: 'Confirmación de cita enviada',
        data: result
      });
      
    } catch (error) {
      logger.error('❌ Error al enviar confirmación de cita:', error);
      
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        res.status(error instanceof BadRequestError ? 400 : 404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor al enviar confirmación de cita'
        });
      }
    }
  };
}