"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/appointment/appointment-type.routes.ts
const express_1 = require("express");
const appointment_type_controller_1 = require("../controllers/appointment-type.controller");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const appointmentTypeController = new appointment_type_controller_1.AppointmentTypeController();
/**
 * Rutas públicas
 */
router.get('/', appointmentTypeController.getAllTypes);
router.get('/:id', appointmentTypeController.getTypeById);
/**
 * Rutas protegidas (solo para administradores)
 */
router.use(auth_middleware_1.authMiddleware);
router.use((0, auth_middleware_1.restrictTo)('admin'));
router.post('/', appointmentTypeController.createType);
router.put('/:id', appointmentTypeController.updateType);
router.delete('/:id', appointmentTypeController.deleteType);
exports.default = router;
