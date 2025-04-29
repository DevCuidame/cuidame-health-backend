// src/modules/notification/routes/notification.routes.ts
import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const notificationController = new NotificationController();

/**
 * Rutas que requieren autenticación
 */
router.use(authMiddleware);

/**
 * @route GET /api/notifications
 * @desc Obtener notificaciones del usuario actual
 * @access Private
 */
router.get('/', notificationController.getUserNotifications);

/**
 * @route PATCH /api/notifications/:id/read
 * @desc Marcar notificación como leída
 * @access Private
 */
router.patch('/:id/read', notificationController.markAsRead);

export default router;