"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/medical-info/sync-medical-info.routes.ts
const express_1 = require("express");
const sync_medical_info_controller_1 = require("./sync-medical-info.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validator_middleware_1 = require("../../middlewares/validator.middleware");
const batch_health_dto_1 = require("../health/batch-health.dto");
const router = (0, express_1.Router)();
const syncMedicalInfoController = new sync_medical_info_controller_1.SyncMedicalInfoController();
/**
 * Rutas que requieren autenticación
 */
router.use(auth_middleware_1.authMiddleware);
/**
 * @route POST /api/medical-info/sync/vaccines
 * @desc Sincronizar vacunas de un paciente
 * @access Private
 */
router.post('/vaccines', (0, validator_middleware_1.validateDto)(batch_health_dto_1.BatchVaccinesDto), syncMedicalInfoController.syncVaccines);
/**
 * @route POST /api/medical-info/sync/allergies
 * @desc Sincronizar alergias de un paciente
 * @access Private
 */
router.post('/allergies', (0, validator_middleware_1.validateDto)(batch_health_dto_1.BatchAllergiesDto), syncMedicalInfoController.syncAllergies);
/**
 * @route POST /api/medical-info/sync/backgrounds
 * @desc Sincronizar antecedentes médicos de un paciente
 * @access Private
 */
router.post('/backgrounds', (0, validator_middleware_1.validateDto)(batch_health_dto_1.BatchBackgroundsDto), syncMedicalInfoController.syncBackgrounds);
/**
 * @route POST /api/medical-info/sync/family-backgrounds
 * @desc Sincronizar antecedentes familiares de un paciente
 * @access Private
 */
router.post('/family-backgrounds', (0, validator_middleware_1.validateDto)(batch_health_dto_1.BatchFamilyBackgroundsDto), syncMedicalInfoController.syncFamilyBackgrounds);
/**
 * @route POST /api/medical-info/sync/diseases
 * @desc Sincronizar enfermedades de un paciente
 * @access Private
 */
router.post('/diseases', (0, validator_middleware_1.validateDto)(batch_health_dto_1.BatchDiseasesDto), syncMedicalInfoController.syncDiseases);
exports.default = router;
