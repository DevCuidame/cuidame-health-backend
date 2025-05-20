"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationTemplateRepository = void 0;
const notification_extended_model_1 = require("../../../models/notification-extended.model");
const base_repository_1 = require("../../../core/repositories/base.repository");
class NotificationTemplateRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(notification_extended_model_1.NotificationTemplate);
    }
    /**
     * Encuentra una plantilla por su código
     * @param code Código único de la plantilla
     * @returns Plantilla encontrada o null
     */
    async findByCode(code) {
        return await this.repository.findOne({
            where: { code, is_active: true }
        });
    }
    /**
     * Encuentra plantillas por tipo de notificación
     * @param type Tipo de notificación
     * @returns Lista de plantillas
     */
    async findByType(type) {
        return await this.repository.find({
            where: { type, is_active: true }
        });
    }
}
exports.NotificationTemplateRepository = NotificationTemplateRepository;
