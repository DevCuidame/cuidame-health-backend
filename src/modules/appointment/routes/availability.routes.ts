// src/modules/appointment/availability.routes.ts
import { Router } from 'express';
import { AvailabilityController } from '../controllers/availability.controller';
import { authMiddleware, restrictTo } from '../../../middlewares/auth.middleware';

const router = Router();
const availabilityController = new AvailabilityController();

/**
 * Rutas públicas
 */
router.get('/professional/:id', availabilityController.getProfessionalAvailability);

/**
 * Rutas protegidas (solo para administradores)
 */
router.use(authMiddleware);
router.use(restrictTo('admin'));

router.post('/', availabilityController.addAvailability);
router.put('/:id', availabilityController.updateAvailability);
router.delete('/:id', availabilityController.deleteAvailability);

export default router;