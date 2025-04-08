import { Router } from 'express';
import { ConditionController } from './condition.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateDto } from '../../middlewares/validator.middleware';
import { ConditionDto } from './condition.dto';

const router = Router();
const conditionController = new ConditionController();

/**
 * Rutas que requieren autenticación
 */
router.use(authMiddleware);

/**
 * @route POST /api/medical-info/condition
 * @desc Crear o actualizar la condición de un paciente
 * @access Private
 */
router.post('/', validateDto(ConditionDto), conditionController.saveCondition);

/**
 * @route GET /api/medical-info/condition/:patientId
 * @desc Obtener la condición de un paciente
 * @access Private
 */
router.get('/:patientId', conditionController.getConditionByPatient);

export default router;