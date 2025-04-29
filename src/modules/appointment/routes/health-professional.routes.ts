// src/modules/appointment/health-professional.routes.ts
import { Router } from 'express';
import { HealthProfessionalController } from '../controllers/health-professional.controller';
import { authMiddleware, restrictTo } from '../../../middlewares/auth.middleware';

const router = Router();
const healthProfessionalController = new HealthProfessionalController();

/**
 * Rutas públicas
 */
router.get('/', healthProfessionalController.getAllProfessionals);
router.get('/:id', healthProfessionalController.getProfessionalById);
router.get('/specialty/:specialty', healthProfessionalController.findBySpecialty);

/**
 * Rutas protegidas (solo para administradores)
 */
router.use(authMiddleware);
router.use(restrictTo('admin'));

router.post('/', healthProfessionalController.createProfessional);
router.put('/:id', healthProfessionalController.updateProfessional);
router.delete('/:id', healthProfessionalController.deleteProfessional);

export default router;