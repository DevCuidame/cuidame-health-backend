import { IsString, IsOptional, IsObject, IsArray, IsEnum, IsNumber } from 'class-validator';
import { DevicePlatform } from '../../../models/device-token.model';

/**
 * DTO para registrar token de dispositivo Angular/Ionic
 */
export class RegisterTokenDto {
  @IsString()
  token!: string;

  @IsEnum(DevicePlatform)
  platform!: DevicePlatform;

  @IsOptional()
  @IsString()
  deviceInfo?: string;

  @IsOptional()
  @IsString()
  appVersion?: string;

  @IsOptional()
  @IsString()
  osVersion?: string;
}

/**
 * DTO para enviar notificación push
 */
export class SendPushNotificationDto {
  @IsString()
  title!: string;

  @IsString()
  body!: string;

  @IsOptional()
  @IsObject()
  data?: { [key: string]: string };

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  clickAction?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  sound?: string;

  @IsOptional()
  @IsNumber()
  badge?: number;
}

/**
 * DTO para notificación masiva
 */
export class BulkNotificationDto extends SendPushNotificationDto {
  @IsArray()
  @IsNumber({}, { each: true })
  userIds!: number[];
}

/**
 * DTO para notificación por topic
 */
export class TopicNotificationDto extends SendPushNotificationDto {
  @IsString()
  topic!: string;
}

/**
 * DTO para suscripción a topic
 */
export class SubscribeTopicDto {
  @IsString()
  topic!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tokens?: string[];
}

/**
 * DTO para notificación programada (Angular/Ionic)
 */
export class ScheduledNotificationDto extends SendPushNotificationDto {
  @IsString()
  scheduledTime!: string; // ISO string

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  userIds?: number[];

  @IsOptional()
  @IsString()
  topic?: string;
}

/**
 * DTO para respuesta de notificación
 */
export interface NotificationResponseDto {
  success: boolean;
  message: string;
  successCount?: number;
  failureCount?: number;
  invalidTokens?: string[];
}