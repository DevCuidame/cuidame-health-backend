"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const condition_controller_1 = require("./condition.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validator_middleware_1 = require("../../middlewares/validator.middleware");
const condition_dto_1 = require("./condition.dto");
const router = (0, express_1.Router)();
const conditionController = new condition_controller_1.ConditionController();
/**
 * Rutas que requieren autenticación
 */
router.use(auth_middleware_1.authMiddleware);
/**
 * @route POST /api/medical-info/condition
 * @desc Crear o actualizar la condición de un paciente
 * @access Private
 */
router.post('/', (0, validator_middleware_1.validateDto)(condition_dto_1.ConditionDto), conditionController.saveCondition);
/**
 * @route GET /api/medical-info/condition/:patientId
 * @desc Obtener la condición de un paciente
 * @access Private
 */
router.get('/:patientId', conditionController.getConditionByPatient);
exports.default = router;
