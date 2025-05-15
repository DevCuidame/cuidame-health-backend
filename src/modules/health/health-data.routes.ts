// src/modules/health-data/health-data.routes.ts
import { Router } from 'express';
import { HealthDataController } from './health-data.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const healthDataController = new HealthDataController();

/**
 * Rutas que requieren autenticación
 */
router.use(authMiddleware);

/**
 * @route GET /api/health-data/:id
 * @desc Obtener todos los datos de salud de un paciente por ID
 * @access Private
 */
router.get('/:id', healthDataController.getHealthDataById);

export default router;