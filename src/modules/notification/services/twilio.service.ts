import { Twilio } from 'twilio';
import config from '../../../core/config/environment';
import logger from '../../../utils/logger';
import { SmsConfig, WhatsAppConfig, TwilioMessageResponse } from '../notification.interface';

/**
 * Servicio para el envío de SMS y WhatsApp a través de Twilio
 * Implementa el patrón Singleton para garantizar una única instancia
 */
export class TwilioService {
  private client!: Twilio;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;
  
  // Instancia única de TwilioService
  private static instance: TwilioService | null = null;

  /**
   * Constructor privado para evitar crear instancias directamente
   * Use TwilioService.getInstance() en su lugar
   */
  private constructor() {
    // Inicializar el cliente Twilio pero sin esperar
    this.initializeClient();
    
    logger.debug('📱 TwilioService constructor llamado');
  }

  /**
   * Método para obtener la instancia única del servicio
   */
  public static getInstance(): TwilioService {
    if (!TwilioService.instance) {
      logger.debug('📱 Creando nueva instancia de TwilioService');
      TwilioService.instance = new TwilioService();
    }
    return TwilioService.instance;
  }

  /**
   * Inicializa el cliente de Twilio
   */
  private initializeClient(): Promise<void> {
    // Si ya hay una inicialización en curso, devolver esa promesa
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  /**
   * Realiza la inicialización del cliente Twilio
   */
  private async performInitialization(): Promise<void> {
    try {
      // Validar configuración
      if (!config.twilio.accountSid || !config.twilio.authToken) {
        throw new Error('Configuración de Twilio incompleta: accountSid y authToken son requeridos');
      }

      // Crear cliente Twilio
      this.client = new Twilio(config.twilio.accountSid, config.twilio.authToken);
      
      // Verificar la conexión haciendo una llamada simple
      await this.client.api.accounts(config.twilio.accountSid).fetch();
      
      this.isInitialized = true;
      logger.info('📱 Cliente Twilio inicializado correctamente');
      
    } catch (error) {
      logger.error('❌ Error al inicializar cliente Twilio:', error);
      this.isInitialized = false;
      logger.warn('⚠️ Twilio deshabilitado debido a error de configuración');
    }
  }

  /**
   * Verifica si el servicio está inicializado
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeClient();
    }
  }

  /**
   * Envía un SMS
   * @param smsConfig Configuración del SMS
   * @returns Respuesta de Twilio
   */
  async sendSMS(smsConfig: SmsConfig): Promise<TwilioMessageResponse> {
    try {
      await this.ensureInitialized();
      
      logger.info(`📱 Enviando SMS a ${smsConfig.to}`);
      
      const messageOptions: any = {
        body: smsConfig.message,
        to: smsConfig.to,
      };

      // Usar Messaging Service SID si está configurado, sino usar número de teléfono
      if (config.twilio.messagingServiceSid) {
        messageOptions.messagingServiceSid = config.twilio.messagingServiceSid;
      } else {
        messageOptions.from = config.twilio.phoneNumber;
      }

      const message = await this.client.messages.create(messageOptions);
      
      logger.info(`✅ SMS enviado exitosamente. SID: ${message.sid}`);
      
      return {
        sid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
        body: message.body,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent,
        dateUpdated: message.dateUpdated,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
        price: message.price,
        priceUnit: message.priceUnit
      };
      
    } catch (error) {
      logger.error('❌ Error al enviar SMS:', error);
      throw new Error(`Error al enviar SMS: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Envía un mensaje de WhatsApp
   * @param whatsAppConfig Configuración del mensaje de WhatsApp
   * @returns Respuesta de Twilio
   */
  async sendWhatsApp(whatsAppConfig: WhatsAppConfig): Promise<TwilioMessageResponse> {
    try {
      await this.ensureInitialized();
      
      logger.info(`📱 Enviando WhatsApp a ${whatsAppConfig.to}`);
      
      // Formatear números para WhatsApp (deben incluir 'whatsapp:' como prefijo)
      const toNumber = whatsAppConfig.to.startsWith('whatsapp:') 
        ? whatsAppConfig.to 
        : `whatsapp:${whatsAppConfig.to}`;
      
      const fromNumber = whatsAppConfig.from?.startsWith('whatsapp:') 
        ? whatsAppConfig.from 
        : `whatsapp:${whatsAppConfig.from || config.twilio.phoneNumber}`;

      const messageOptions: any = {
        body: whatsAppConfig.message,
        to: toNumber,
        from: fromNumber
      };

      // Agregar media si está presente
      if (whatsAppConfig.mediaUrl) {
        messageOptions.mediaUrl = Array.isArray(whatsAppConfig.mediaUrl) 
          ? whatsAppConfig.mediaUrl 
          : [whatsAppConfig.mediaUrl];
      }

      const message = await this.client.messages.create(messageOptions);
      
      logger.info(`✅ WhatsApp enviado exitosamente. SID: ${message.sid}`);
      
      return {
        sid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
        body: message.body,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent,
        dateUpdated: message.dateUpdated,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
        price: message.price,
        priceUnit: message.priceUnit
      };
      
    } catch (error) {
      logger.error('❌ Error al enviar WhatsApp:', error);
      throw new Error(`Error al enviar WhatsApp: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtiene el estado de un mensaje
   * @param messageSid SID del mensaje
   * @returns Estado del mensaje
   */
  async getMessageStatus(messageSid: string): Promise<any> {
    try {
      await this.ensureInitialized();
      
      const message = await this.client.messages(messageSid).fetch();
      
      return {
        sid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent,
        dateUpdated: message.dateUpdated,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage
      };
      
    } catch (error) {
      logger.error(`❌ Error al obtener estado del mensaje ${messageSid}:`, error);
      throw new Error(`Error al obtener estado del mensaje: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Valida un número de teléfono
   * @param phoneNumber Número de teléfono a validar
   * @returns Información del número validado
   */
  async validatePhoneNumber(phoneNumber: string): Promise<any> {
    try {
      await this.ensureInitialized();
      
      const lookup = await this.client.lookups.v1.phoneNumbers(phoneNumber).fetch();
      
      return {
        phoneNumber: lookup.phoneNumber,
        countryCode: lookup.countryCode,
        nationalFormat: lookup.nationalFormat,
        valid: true
      };
      
    } catch (error) {
      logger.error(`❌ Error al validar número ${phoneNumber}:`, error);
      return {
        phoneNumber,
        valid: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene información de la cuenta Twilio
   * @returns Información de la cuenta
   */
  async getAccountInfo(): Promise<any> {
    try {
      await this.ensureInitialized();
      
      const account = await this.client.api.accounts(config.twilio.accountSid).fetch();
      
      return {
        sid: account.sid,
        friendlyName: account.friendlyName,
        status: account.status,
        type: account.type,
        dateCreated: account.dateCreated,
        dateUpdated: account.dateUpdated
      };
      
    } catch (error) {
      logger.error('❌ Error al obtener información de la cuenta:', error);
      throw new Error(`Error al obtener información de la cuenta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Verifica si el servicio está disponible
   * @returns true si el servicio está disponible
   */
  async isServiceAvailable(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      return this.isInitialized;
    } catch (error) {
      logger.error('❌ Servicio Twilio no disponible:', error);
      return false;
    }
  }

  /**
   * Reinicia la conexión del cliente
   */
  async reconnect(): Promise<void> {
    this.isInitialized = false;
    this.initializationPromise = null;
    await this.initializeClient();
  }
}