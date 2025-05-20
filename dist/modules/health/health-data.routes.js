"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/health-data/health-data.routes.ts
const express_1 = require("express");
const health_data_controller_1 = require("./health-data.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const healthDataController = new health_data_controller_1.HealthDataController();
/**
 * Rutas que requieren autenticación
 */
router.use(auth_middleware_1.authMiddleware);
/**
 * @route GET /api/health-data/:id
 * @desc Obtener todos los datos de salud de un paciente por ID
 * @access Private
 */
router.get('/:id', healthDataController.getHealthDataById);
exports.default = router;
