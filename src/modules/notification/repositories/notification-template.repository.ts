import { NotificationTemplate } from "../../../models/notification-extended.model";
import { NotificationType } from "../../../models/notification.model";
import { BaseRepository } from "../../../core/repositories/base.repository";

export class NotificationTemplateRepository extends BaseRepository<NotificationTemplate> {
  constructor() {
    super(NotificationTemplate);
  }

  /**
   * Encuentra una plantilla por su código
   * @param code Código único de la plantilla
   * @returns Plantilla encontrada o null
   */
  async findByCode(code: string): Promise<NotificationTemplate | null> {
    return await this.repository.findOne({
      where: { code, is_active: true }
    });
  }

  /**
   * Encuentra plantillas por tipo de notificación
   * @param type Tipo de notificación
   * @returns Lista de plantillas
   */
  async findByType(type: NotificationType): Promise<NotificationTemplate[]> {
    return await this.repository.find({
      where: { type, is_active: true }
    });
  }
}