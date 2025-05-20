"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/medical-info/batch-medical-info.routes.ts
const express_1 = require("express");
const batch_medical_info_controller_1 = require("./batch-medical-info.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validator_middleware_1 = require("../../middlewares/validator.middleware");
const batch_health_dto_1 = require("../health/batch-health.dto");
const router = (0, express_1.Router)();
const batchMedicalInfoController = new batch_medical_info_controller_1.BatchMedicalInfoController();
/**
 * Rutas que requieren autenticación
 */
router.use(auth_middleware_1.authMiddleware);
/**
 * @route POST /api/medical-info/batch/vaccines
 * @desc Crear múltiples vacunas para un paciente
 * @access Private
 */
router.post('/vaccines', (0, validator_middleware_1.validateDto)(batch_health_dto_1.BatchVaccinesDto), batchMedicalInfoController.createBatchVaccines);
/**
 * @route POST /api/medical-info/batch/allergies
 * @desc Crear múltiples alergias para un paciente
 * @access Private
 */
router.post('/allergies', (0, validator_middleware_1.validateDto)(batch_health_dto_1.BatchAllergiesDto), batchMedicalInfoController.createBatchAllergies);
/**
 * @route POST /api/medical-info/batch/backgrounds
 * @desc Crear múltiples antecedentes para un paciente
 * @access Private
 */
router.post('/backgrounds', (0, validator_middleware_1.validateDto)(batch_health_dto_1.BatchBackgroundsDto), batchMedicalInfoController.createBatchBackgrounds);
/**
 * @route POST /api/medical-info/batch/family-backgrounds
 * @desc Crear múltiples antecedentes familiares para un paciente
 * @access Private
 */
router.post('/family-backgrounds', (0, validator_middleware_1.validateDto)(batch_health_dto_1.BatchFamilyBackgroundsDto), batchMedicalInfoController.createBatchFamilyBackgrounds);
/**
 * @route POST /api/medical-info/batch/diseases
 * @desc Crear múltiples enfermedades para un paciente
 * @access Private
 */
router.post('/diseases', (0, validator_middleware_1.validateDto)(batch_health_dto_1.BatchDiseasesDto), batchMedicalInfoController.createBatchDiseases);
exports.default = router;
