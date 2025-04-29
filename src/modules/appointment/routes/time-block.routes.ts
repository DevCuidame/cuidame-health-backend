// src/modules/appointment/routes/time-block.routes.ts
import { Router } from 'express';
import { TimeBlockController } from '../controllers/time-block.controller';
import { authMiddleware, restrictTo } from '../../../middlewares/auth.middleware';

const router = Router();
const timeBlockController = new TimeBlockController();

/**
 * Rutas que requieren autenticación
 */
router.use(authMiddleware);

/**
 * Rutas para consulta
 */
router.get('/:id', timeBlockController.getTimeBlockById);
router.get('/professional/:id', timeBlockController.getTimeBlocksByProfessional);

/**
 * Rutas para administradores
 */
router.use(restrictTo('admin'));
router.post('/', timeBlockController.createTimeBlock);
router.put('/:id', timeBlockController.updateTimeBlock);
router.delete('/:id', timeBlockController.deleteTimeBlock);

export default router;