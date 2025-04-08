// src/modules/medical-info/sync-medical-info.routes.ts
import { Router } from 'express';
import { SyncMedicalInfoController } from './sync-medical-info.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateDto } from '../../middlewares/validator.middleware';
import { BatchVaccinesDto, BatchAllergiesDto, BatchBackgroundsDto, BatchFamilyBackgroundsDto, BatchDiseasesDto } from '../health/batch-health.dto';

const router = Router();
const syncMedicalInfoController = new SyncMedicalInfoController();

/**
 * Rutas que requieren autenticación
 */
router.use(authMiddleware);

/**
 * @route POST /api/medical-info/sync/vaccines
 * @desc Sincronizar vacunas de un paciente
 * @access Private
 */
router.post('/vaccines', validateDto(BatchVaccinesDto), syncMedicalInfoController.syncVaccines);

/**
 * @route POST /api/medical-info/sync/allergies
 * @desc Sincronizar alergias de un paciente
 * @access Private
 */
router.post('/allergies', validateDto(BatchAllergiesDto), syncMedicalInfoController.syncAllergies);

/**
 * @route POST /api/medical-info/sync/backgrounds
 * @desc Sincronizar antecedentes médicos de un paciente
 * @access Private
 */
router.post('/backgrounds', validateDto(BatchBackgroundsDto), syncMedicalInfoController.syncBackgrounds);

/**
 * @route POST /api/medical-info/sync/family-backgrounds
 * @desc Sincronizar antecedentes familiares de un paciente
 * @access Private
 */
router.post('/family-backgrounds', validateDto(BatchFamilyBackgroundsDto), syncMedicalInfoController.syncFamilyBackgrounds);

/**
 * @route POST /api/medical-info/sync/diseases
 * @desc Sincronizar enfermedades de un paciente
 * @access Private
 */
router.post('/diseases', validateDto(BatchDiseasesDto), syncMedicalInfoController.syncDiseases);

export default router;