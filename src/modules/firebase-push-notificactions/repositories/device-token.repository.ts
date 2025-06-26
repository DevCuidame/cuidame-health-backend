import { BaseRepository } from '../../../core/repositories/base.repository';
import { DeviceToken, DevicePlatform } from '../../../models/device-token.model';

export class DeviceTokenRepository extends BaseRepository<DeviceToken> {
  constructor() {
    super(DeviceToken);
  }

  /**
   * Encuentra tokens activos por usuario
   */
  async findActiveTokensByUserId(userId: number): Promise<DeviceToken[]> {
    return await this.repository.find({
      where: { 
        user_id: userId, 
        is_active: true 
      }
    });
  }

  /**
   * Encuentra un token específico
   */
  async findByToken(token: string): Promise<DeviceToken | null> {
    return await this.repository.findOne({
      where: { token }
    });
  }

  /**
   * Desactiva un token
   */
  async deactivateToken(token: string): Promise<void> {
    await this.repository.update(
      { token },
      { is_active: false }
    );
  }

  /**
   * Registra o actualiza un token de dispositivo
   */
  async upsertToken(userId: number, token: string, platform: DevicePlatform, deviceInfo?: string): Promise<DeviceToken> {
    const existingToken = await this.findByToken(token);
    
    if (existingToken) {
      // Actualizar token existente
      await this.repository.update(
        { id: existingToken.id },
        { 
          user_id: userId,
          is_active: true,
          device_info: deviceInfo,
          updated_at: new Date()
        }
      );
      return await this.findById(existingToken.id) as DeviceToken;
    } else {
      // Crear nuevo token
      return await this.create({
        user_id: userId,
        token,
        platform,
        device_info: deviceInfo,
        is_active: true
      });
    }
  }
}