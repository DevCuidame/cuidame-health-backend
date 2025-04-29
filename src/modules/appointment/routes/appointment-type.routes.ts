// src/modules/appointment/appointment-type.routes.ts
import { Router } from 'express';
import { AppointmentTypeController } from '../controllers/appointment-type.controller';
import { authMiddleware, restrictTo } from '../../../middlewares/auth.middleware';

const router = Router();
const appointmentTypeController = new AppointmentTypeController();

/**
 * Rutas públicas
 */
router.get('/', appointmentTypeController.getAllTypes);
router.get('/:id', appointmentTypeController.getTypeById);

/**
 * Rutas protegidas (solo para administradores)
 */
router.use(authMiddleware);
router.use(restrictTo('admin'));

router.post('/', appointmentTypeController.createType);
router.put('/:id', appointmentTypeController.updateType);
router.delete('/:id', appointmentTypeController.deleteType);

export default router;