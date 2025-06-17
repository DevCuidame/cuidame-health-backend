import { Router } from 'express';
import { TwilioController } from '../controllers/twilio.controller';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { validateDto } from '../../../middlewares/validator.middleware';
import {
  SendSmsDto,
  SendWhatsAppDto,
  SendMultiChannelNotificationDto,
  ValidatePhoneNumberDto,
  MessageStatusParamsDto,
  SendAppointmentReminderDto,
  SendAppointmentConfirmationDto
} from '../dto/twilio.dto';

const router = Router();
const twilioController = new TwilioController();

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

/**
 * @route POST /api/notifications/sms
 * @desc Envía un SMS
 * @access Private
 */
router.post('/sms', 
  validateDto(SendSmsDto, 'body'), 
  twilioController.sendSMS
);

/**
 * @route POST /api/notifications/whatsapp
 * @desc Envía un mensaje de WhatsApp
 * @access Private
 */
router.post('/whatsapp', 
  validateDto(SendWhatsAppDto, 'body'), 
  twilioController.sendWhatsApp
);

/**
 * @route POST /api/notifications/multi-channel
 * @desc Envía una notificación multicanal
 * @access Private
 */
router.post('/multi-channel', 
  validateDto(SendMultiChannelNotificationDto, 'body'), 
  twilioController.sendMultiChannelNotification
);

/**
 * @route POST /api/notifications/validate-phone
 * @desc Valida un número de teléfono
 * @access Private
 */
router.post('/validate-phone', 
  validateDto(ValidatePhoneNumberDto, 'body'), 
  twilioController.validatePhoneNumber
);

/**
 * @route GET /api/notifications/message-status/:messageSid
 * @desc Obtiene el estado de un mensaje
 * @access Private
 */
router.get('/message-status/:messageSid', 
  validateDto(MessageStatusParamsDto, 'params'), 
  twilioController.getMessageStatus
);

/**
 * @route GET /api/notifications/service-status
 * @desc Obtiene el estado de los servicios
 * @access Private
 */
router.get('/service-status', twilioController.getServiceStatus);

/**
 * @route POST /api/notifications/appointment-reminder
 * @desc Envía recordatorio de cita
 * @access Private
 */
router.post('/appointment-reminder', 
  validateDto(SendAppointmentReminderDto, 'body'), 
  twilioController.sendAppointmentReminder
);

/**
 * @route POST /api/notifications/appointment-confirmation
 * @desc Envía confirmación de cita
 * @access Private
 */
router.post('/appointment-confirmation', 
  validateDto(SendAppointmentConfirmationDto, 'body'), 
  twilioController.sendAppointmentConfirmation
);

export default router;