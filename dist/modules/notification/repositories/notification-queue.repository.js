"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationQueueRepository = void 0;
// src/modules/notification/repositories/notification-queue.repository.ts
const notification_extended_model_1 = require("../../../models/notification-extended.model");
const base_repository_1 = require("../../../core/repositories/base.repository");
const typeorm_1 = require("typeorm");
class NotificationQueueRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(notification_extended_model_1.NotificationQueue);
    }
    /**
     * Encuentra elementos pendientes en la cola
     * @param limit Límite de elementos a recuperar
     * @returns Lista de elementos pendientes
     */
    async findPending(limit = 10) {
        return await this.repository.find({
            where: [
                { status: 'pending' },
                {
                    status: 'failed',
                    retries: (0, typeorm_1.LessThan)({ max_retries: true }),
                    next_retry: (0, typeorm_1.LessThan)(new Date())
                }
            ],
            order: { created_at: 'ASC' },
            take: limit
        });
    }
    /**
     * Actualiza el estado de un elemento de la cola
     * @param id ID del elemento
     * @param status Nuevo estado
     * @param error Mensaje de error (opcional)
     * @returns Elemento actualizado
     */
    async updateStatus(id, status, error) {
        const item = await this.findByIdOrFail(id, 'NotificationQueue');
        const updateData = { status };
        if (error) {
            updateData.error = error;
        }
        if (status === 'failed') {
            // Incrementar conteo de reintentos y programar próximo intento
            updateData.retries = item.retries + 1;
            if (updateData.retries < item.max_retries) {
                // Programar reintento con backoff exponencial (5min, 25min, 125min)
                const delayMinutes = Math.pow(5, updateData.retries);
                const nextRetry = new Date();
                nextRetry.setMinutes(nextRetry.getMinutes() + delayMinutes);
                updateData.next_retry = nextRetry;
                updateData.status = 'pending'; // Volver a marcar como pendiente para futuro reintento
            }
        }
        return await this.update(id, updateData, 'NotificationQueue');
    }
}
exports.NotificationQueueRepository = NotificationQueueRepository;
