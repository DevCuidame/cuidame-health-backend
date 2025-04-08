// src/modules/medical-info/batch-medical-info.routes.ts
import { Router } from 'express';
import { BatchMedicalInfoController } from './batch-medical-info.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateDto } from '../../middlewares/validator.middleware';
import { BatchVaccinesDto, BatchAllergiesDto, BatchBackgroundsDto, BatchFamilyBackgroundsDto, BatchDiseasesDto } from '../health/batch-health.dto';

const router = Router();
const batchMedicalInfoController = new BatchMedicalInfoController();

/**
 * Rutas que requieren autenticación
 */
router.use(authMiddleware);

/**
 * @route POST /api/medical-info/batch/vaccines
 * @desc Crear múltiples vacunas para un paciente
 * @access Private
 */
router.post('/vaccines', validateDto(BatchVaccinesDto), batchMedicalInfoController.createBatchVaccines);

/**
 * @route POST /api/medical-info/batch/allergies
 * @desc Crear múltiples alergias para un paciente
 * @access Private
 */
router.post('/allergies', validateDto(BatchAllergiesDto), batchMedicalInfoController.createBatchAllergies);

/**
 * @route POST /api/medical-info/batch/backgrounds
 * @desc Crear múltiples antecedentes para un paciente
 * @access Private
 */
router.post('/backgrounds', validateDto(BatchBackgroundsDto), batchMedicalInfoController.createBatchBackgrounds);

/**
 * @route POST /api/medical-info/batch/family-backgrounds
 * @desc Crear múltiples antecedentes familiares para un paciente
 * @access Private
 */
router.post('/family-backgrounds', validateDto(BatchFamilyBackgroundsDto), batchMedicalInfoController.createBatchFamilyBackgrounds);

/**
 * @route POST /api/medical-info/batch/diseases
 * @desc Crear múltiples enfermedades para un paciente
 * @access Private
 */
router.post('/diseases', validateDto(BatchDiseasesDto), batchMedicalInfoController.createBatchDiseases);

export default router;