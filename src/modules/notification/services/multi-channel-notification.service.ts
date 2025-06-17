import { TwilioService } from './twilio.service';
import { EmailService } from './email.service';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationPreferenceService } from './notification-preference.service';
import { UserRepository } from '../../user/user.repository';
import { 
  CreateMultiChannelNotificationDto, 
  NotificationChannels, 
  SmsConfig, 
  WhatsAppConfig,
  TwilioMessageResponse,
  TemplateData
} from '../notification.interface';
import { NotificationType } from '../../../models/notification.model';
import { NotFoundError } from '../../../utils/error-handler';
import logger from '../../../utils/logger';

/**
 * Servicio para envío de notificaciones a través de múltiples canales
 * Integra SMS, WhatsApp, Email y notificaciones push
 */
export class MultiChannelNotificationService {
  private twilioService: TwilioService;
  private emailService: EmailService;
  private templateService: NotificationTemplateService;
  private preferenceService: NotificationPreferenceService;
  private userRepository: UserRepository;

  constructor() {
    this.twilioService = TwilioService.getInstance();
    this.emailService = EmailService.getInstance();
    this.templateService = new NotificationTemplateService();
    this.preferenceService = new NotificationPreferenceService();
    this.userRepository = new UserRepository();
  }

  /**
   * Envía una notificación a través de múltiples canales
   * @param data Datos de la notificación multicanal
   * @returns Resultados del envío por cada canal
   */
  async sendMultiChannelNotification(data: CreateMultiChannelNotificationDto): Promise<{
    email?: any;
    sms?: TwilioMessageResponse;
    whatsapp?: TwilioMessageResponse;
    errors?: string[];
  }> {
    const results: any = {};
    const errors: string[] = [];

    try {
      // Verificar que el usuario existe
      const user = await this.userRepository.findById(data.user_id);
      if (!user) {
        throw new NotFoundError(`Usuario con ID ${data.user_id} no encontrado`);
      }

      // Obtener preferencias del usuario si no se especifican canales
      let channels = data.channels;
      if (!channels) {
        const preferences = await this.preferenceService.getUserPreferences(data.user_id);
        const typePreference = preferences.find(p => p.notification_type === data.type);
        
        channels = {
          email: typePreference?.email_enabled ?? true,
          sms: false, // Por defecto deshabilitado hasta que se configure
          whatsapp: false, // Por defecto deshabilitado hasta que se configure
          push: typePreference?.push_enabled ?? false,
          inapp: typePreference?.inapp_enabled ?? true
        };
      }

      // Preparar datos de plantilla
      const templateData: TemplateData = {
        user_name: user.name || user.email,
        user_email: user.email,
        ...data
      };

      // Enviar por email si está habilitado
      if (channels.email && user.email) {
        try {
          logger.info(`📧 Enviando notificación por email a ${user.email}`);
          
          // Renderizar plantilla para email
          const emailContent = await this.templateService.renderTemplate(
            `${data.type}_email`,
            templateData
          );

          const emailResult = await this.emailService.sendEmail({
            to: user.email,
            subject: data.title,
            html: emailContent?.body || data.message,
            text: data.message
          });
          
          results.email = emailResult;
          logger.info('✅ Email enviado exitosamente');
          
        } catch (error) {
          const errorMsg = `Error al enviar email: ${error instanceof Error ? error.message : 'Error desconocido'}`;
          logger.error('❌ ' + errorMsg);
          errors.push(errorMsg);
        }
      }

      // Enviar por SMS si está habilitado
      if (channels.sms && (data.phoneNumber || user.phone)) {
        try {
          const phoneNumber = data.phoneNumber || user.phone;
          if (!phoneNumber) {
            throw new Error('Número de teléfono no disponible');
          }

          logger.info(`📱 Enviando notificación por SMS a ${phoneNumber}`);
          
          // Renderizar plantilla para SMS (más corta)
          let smsMessage = data.message;
          try {
            const smsContent = await this.templateService.renderTemplate(
              `${data.type}_sms`,
              templateData
            );
            if (smsContent) {
              smsMessage = smsContent.body;
            }
          } catch (templateError) {
            // Si no hay plantilla específica para SMS, usar el mensaje original
            logger.debug('No hay plantilla específica para SMS, usando mensaje original');
          }

          const smsConfig: SmsConfig = {
            to: phoneNumber,
            message: smsMessage
          };

          const smsResult = await this.twilioService.sendSMS(smsConfig);
          results.sms = smsResult;
          logger.info('✅ SMS enviado exitosamente');
          
        } catch (error) {
          const errorMsg = `Error al enviar SMS: ${error instanceof Error ? error.message : 'Error desconocido'}`;
          logger.error('❌ ' + errorMsg);
          errors.push(errorMsg);
        }
      }

      // Enviar por WhatsApp si está habilitado
      if (channels.whatsapp && (data.whatsappNumber || data.phoneNumber || user.phone)) {
        try {
          const whatsappNumber = data.whatsappNumber || data.phoneNumber || user.phone;
          if (!whatsappNumber) {
            throw new Error('Número de WhatsApp no disponible');
          }

          logger.info(`📱 Enviando notificación por WhatsApp a ${whatsappNumber}`);
          
          // Renderizar plantilla para WhatsApp
          let whatsappMessage = data.message;
          try {
            const whatsappContent = await this.templateService.renderTemplate(
              `${data.type}_whatsapp`,
              templateData
            );
            if (whatsappContent) {
              whatsappMessage = whatsappContent.body;
            }
          } catch (templateError) {
            // Si no hay plantilla específica para WhatsApp, usar el mensaje original
            logger.debug('No hay plantilla específica para WhatsApp, usando mensaje original');
          }

          const whatsappConfig: WhatsAppConfig = {
            to: whatsappNumber,
            message: whatsappMessage
          };

          const whatsappResult = await this.twilioService.sendWhatsApp(whatsappConfig);
          results.whatsapp = whatsappResult;
          logger.info('✅ WhatsApp enviado exitosamente');
          
        } catch (error) {
          const errorMsg = `Error al enviar WhatsApp: ${error instanceof Error ? error.message : 'Error desconocido'}`;
          logger.error('❌ ' + errorMsg);
          errors.push(errorMsg);
        }
      }

      // Agregar errores al resultado si los hay
      if (errors.length > 0) {
        results.errors = errors;
      }

      return results;
      
    } catch (error) {
      logger.error('❌ Error en envío multicanal:', error);
      throw error;
    }
  }

  /**
   * Envía un SMS simple
   * @param phoneNumber Número de teléfono
   * @param message Mensaje
   * @param templateType Tipo de plantilla (opcional)
   * @param templateData Datos para la plantilla (opcional)
   * @returns Respuesta de Twilio
   */
  async sendSMS(
    phoneNumber: string, 
    message: string, 
    templateType?: string, 
    templateData?: TemplateData
  ): Promise<TwilioMessageResponse> {
    try {
      let finalMessage = message;
      
      // Renderizar plantilla si se proporciona
      if (templateType && templateData) {
        try {
          const renderedMessage = await this.templateService.renderTemplate(templateType, templateData);
          if (renderedMessage) {
            finalMessage = renderedMessage.body;
          }
        } catch (templateError) {
          logger.warn('No se pudo renderizar plantilla para SMS, usando mensaje original');
        }
      }

      const smsConfig: SmsConfig = {
        to: phoneNumber,
        message: finalMessage
      };

      return await this.twilioService.sendSMS(smsConfig);
      
    } catch (error) {
      logger.error('❌ Error al enviar SMS:', error);
      throw error;
    }
  }

  /**
   * Envía un mensaje de WhatsApp simple
   * @param phoneNumber Número de WhatsApp
   * @param message Mensaje
   * @param mediaUrl URL de media (opcional)
   * @param templateType Tipo de plantilla (opcional)
   * @param templateData Datos para la plantilla (opcional)
   * @returns Respuesta de Twilio
   */
  async sendWhatsApp(
    phoneNumber: string, 
    message: string, 
    mediaUrl?: string | string[],
    templateType?: string, 
    templateData?: TemplateData
  ): Promise<TwilioMessageResponse> {
    try {
      let finalMessage = message;
      
      // Renderizar plantilla si se proporciona
      if (templateType && templateData) {
        try {
          const renderedMessage = await this.templateService.renderTemplate(templateType, templateData);
          if (renderedMessage) {
            finalMessage = renderedMessage.body;
          }
        } catch (templateError) {
          logger.warn('No se pudo renderizar plantilla para WhatsApp, usando mensaje original');
        }
      }

      const whatsappConfig: WhatsAppConfig = {
        to: phoneNumber,
        message: finalMessage,
        mediaUrl
      };

      return await this.twilioService.sendWhatsApp(whatsappConfig);
      
    } catch (error) {
      logger.error('❌ Error al enviar WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Valida un número de teléfono
   * @param phoneNumber Número a validar
   * @returns Información de validación
   */
  async validatePhoneNumber(phoneNumber: string): Promise<any> {
    return await this.twilioService.validatePhoneNumber(phoneNumber);
  }

  /**
   * Obtiene el estado de un mensaje
   * @param messageSid SID del mensaje
   * @returns Estado del mensaje
   */
  async getMessageStatus(messageSid: string): Promise<any> {
    return await this.twilioService.getMessageStatus(messageSid);
  }

  /**
   * Verifica si los servicios están disponibles
   * @returns Estado de los servicios
   */
  async getServiceStatus(): Promise<{
    twilio: boolean;
    email: boolean;
  }> {
    const [twilioAvailable, emailAvailable] = await Promise.all([
      this.twilioService.isServiceAvailable(),
      this.emailService.verifyConnection ? await this.emailService.verifyConnection() : true
    ]);

    return {
      twilio: twilioAvailable,
      email: emailAvailable
    };
  }

  /**
   * Envía notificación de recordatorio de cita
   * @param userId ID del usuario
   * @param appointmentData Datos de la cita
   * @param channels Canales a utilizar
   * @returns Resultado del envío
   */
  async sendAppointmentReminder(
    userId: number,
    appointmentData: any,
    channels?: NotificationChannels
  ): Promise<any> {
    const notificationData: CreateMultiChannelNotificationDto = {
      user_id: userId,
      appointment_id: appointmentData.id,
      type: NotificationType.APPOINTMENT_REMINDER,
      title: 'Recordatorio de Cita',
      message: `Tienes una cita programada para ${appointmentData.start_time}`,
      channels: channels || { email: true, sms: true },
      phoneNumber: appointmentData.patient_phone,
      whatsappNumber: appointmentData.patient_whatsapp
    };

    return await this.sendMultiChannelNotification(notificationData);
  }

  /**
   * Envía notificación de confirmación de cita
   * @param userId ID del usuario
   * @param appointmentData Datos de la cita
   * @param channels Canales a utilizar
   * @returns Resultado del envío
   */
  async sendAppointmentConfirmation(
    userId: number,
    appointmentData: any,
    channels?: NotificationChannels
  ): Promise<any> {
    const notificationData: CreateMultiChannelNotificationDto = {
      user_id: userId,
      appointment_id: appointmentData.id,
      type: NotificationType.APPOINTMENT_CONFIRMED,
      title: 'Confirmación de Cita',
      message: `Tu cita ha sido confirmada para ${appointmentData.start_time}`,
      channels: channels || { email: true, sms: true, whatsapp: true },
      phoneNumber: appointmentData.patient_phone,
      whatsappNumber: appointmentData.patient_whatsapp
    };

    return await this.sendMultiChannelNotification(notificationData);
  }
}