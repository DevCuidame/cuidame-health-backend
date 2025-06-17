import { 
  IsString, 
  IsNotEmpty, 
  IsMobilePhone, 
  Length, 
  IsOptional, 
  IsObject, 
  IsArray, 
  IsUrl, 
  IsEnum, 
  IsBoolean, 
  IsDateString, 
  ValidateNested,
  IsInt,
  Min
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { NotificationChannels } from '../notification.interface';

/**
 * DTO para envío de SMS
 */
export class SendSmsDto {
  @IsString({ message: 'El número de teléfono debe ser una cadena' })
  @IsNotEmpty({ message: 'El número de teléfono es requerido' })
  @IsMobilePhone('es-ES', {}, { message: 'Formato de número de teléfono inválido' })
  to!: string;

  @IsString({ message: 'El mensaje debe ser una cadena' })
  @IsNotEmpty({ message: 'El mensaje es requerido' })
  @Length(1, 1600, { message: 'El mensaje debe tener entre 1 y 1600 caracteres' })
  message!: string;

  @IsOptional()
  @IsString({ message: 'El tipo de plantilla debe ser una cadena' })
  templateType?: string;

  @IsOptional()
  @IsObject({ message: 'Los datos de plantilla deben ser un objeto' })
  templateData?: any;
}

/**
 * DTO para envío de WhatsApp
 */
export class SendWhatsAppDto {
  @IsString({ message: 'El número de WhatsApp debe ser una cadena' })
  @IsNotEmpty({ message: 'El número de WhatsApp es requerido' })
  @IsMobilePhone('es-ES', {}, { message: 'Formato de número de teléfono inválido' })
  to!: string;

  @IsString({ message: 'El mensaje debe ser una cadena' })
  @IsNotEmpty({ message: 'El mensaje es requerido' })
  @Length(1, 1600, { message: 'El mensaje debe tener entre 1 y 1600 caracteres' })
  message!: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return [value];
    return value;
  })
  @IsArray({ message: 'Las URLs de media deben ser un array' })
  @IsUrl({}, { each: true, message: 'Cada URL de media debe ser válida' })
  mediaUrl?: string[];

  @IsOptional()
  @IsString({ message: 'El tipo de plantilla debe ser una cadena' })
  templateType?: string;

  @IsOptional()
  @IsObject({ message: 'Los datos de plantilla deben ser un objeto' })
  templateData?: any;
}

/**
 * DTO para canales de notificación
 */
export class NotificationChannelsDto {
  @IsOptional()
  @IsBoolean({ message: 'El canal email debe ser un booleano' })
  email?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'El canal SMS debe ser un booleano' })
  sms?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'El canal WhatsApp debe ser un booleano' })
  whatsapp?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'El canal push debe ser un booleano' })
  push?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'El canal in-app debe ser un booleano' })
  inapp?: boolean;
}

/**
 * DTO para notificación multicanal
 */
export class SendMultiChannelNotificationDto {
  @IsInt({ message: 'El ID de usuario debe ser un número entero' })
  @Min(1, { message: 'El ID de usuario debe ser un número positivo' })
  @Type(() => Number)
  user_id!: number;

  @IsString({ message: 'El tipo de notificación debe ser una cadena' })
  @IsNotEmpty({ message: 'El tipo de notificación es requerido' })
  type!: string;

  @IsOptional()
  @IsString({ message: 'El título debe ser una cadena' })
  title?: string;

  @IsString({ message: 'El mensaje debe ser una cadena' })
  @IsNotEmpty({ message: 'El mensaje es requerido' })
  @Length(1, 1600, { message: 'El mensaje debe tener entre 1 y 1600 caracteres' })
  message!: string;

  @IsOptional()
  @Type(() => NotificationChannelsDto)
  channels?: NotificationChannelsDto;

  @IsOptional()
  @IsString({ message: 'El número de teléfono debe ser una cadena' })
  @IsMobilePhone('es-ES', {}, { message: 'Formato de número de teléfono inválido' })
  phoneNumber?: string;

  @IsOptional()
  @IsString({ message: 'El número de WhatsApp debe ser una cadena' })
  @IsMobilePhone('es-ES', {}, { message: 'Formato de número de WhatsApp inválido' })
  whatsappNumber?: string;

  @IsOptional()
  @IsInt({ message: 'El ID de cita debe ser un número entero' })
  @Min(1, { message: 'El ID de cita debe ser un número positivo' })
  @Type(() => Number)
  appointment_id?: number;
}

/**
 * DTO para validación de número de teléfono
 */
export class ValidatePhoneNumberDto {
  @IsString({ message: 'El número de teléfono debe ser una cadena' })
  @IsNotEmpty({ message: 'El número de teléfono es requerido' })
  phoneNumber!: string;
}

/**
 * DTO para parámetros de mensaje
 */
export class MessageStatusParamsDto {
  @IsString({ message: 'El SID del mensaje debe ser una cadena' })
  @IsNotEmpty({ message: 'El SID del mensaje es requerido' })
  @Length(34, 34, { message: 'El SID debe tener exactamente 34 caracteres' })
  messageSid!: string;
}

/**
 * DTO para datos de cita en recordatorios
 */
export class AppointmentDataDto {
  @IsInt({ message: 'El ID de la cita debe ser un número entero' })
  @Min(1, { message: 'El ID de la cita debe ser un número positivo' })
  @Type(() => Number)
  id!: number;

  @IsString({ message: 'La hora de inicio es requerida' })
  @IsNotEmpty({ message: 'La hora de inicio no puede estar vacía' })
  start_time!: string;

  @IsOptional()
  @IsString({ message: 'El teléfono del paciente debe ser una cadena' })
  @IsMobilePhone('es-ES', {}, { message: 'Formato de teléfono del paciente inválido' })
  patient_phone?: string;

  @IsOptional()
  @IsString({ message: 'El WhatsApp del paciente debe ser una cadena' })
  @IsMobilePhone('es-ES', {}, { message: 'Formato de WhatsApp del paciente inválido' })
  patient_whatsapp?: string;
}

/**
 * DTO para recordatorio de cita
 */
export class SendAppointmentReminderDto {
  @IsInt({ message: 'El ID de usuario debe ser un número entero' })
  @Min(1, { message: 'El ID de usuario debe ser un número positivo' })
  @Type(() => Number)
  userId!: number;

  @Type(() => AppointmentDataDto)
  appointmentData!: AppointmentDataDto;

  @IsOptional()
  @Type(() => NotificationChannelsDto)
  channels?: NotificationChannelsDto;
}

/**
 * DTO para confirmación de cita
 */
export class SendAppointmentConfirmationDto {
  @IsInt({ message: 'El ID de usuario debe ser un número entero' })
  @Min(1, { message: 'El ID de usuario debe ser un número positivo' })
  @Type(() => Number)
  userId!: number;

  @Type(() => AppointmentDataDto)
  appointmentData!: AppointmentDataDto;

  @IsOptional()
  @Type(() => NotificationChannelsDto)
  channels?: NotificationChannelsDto;
}