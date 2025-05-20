"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/appointment/appointment.routes.ts
const express_1 = require("express");
const appointment_controller_1 = require("../controllers/appointment.controller");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const appointmentController = new appointment_controller_1.AppointmentController();
/**
 * Rutas que requieren autenticación
 */
router.use(auth_middleware_1.authMiddleware);
/**
 * Rutas para pacientes y profesionales
 */
router.get('/patient/:id', appointmentController.getAppointmentsByPatient);
router.get('/professional/:id', appointmentController.getAppointmentsByProfessional);
router.get('/:id', appointmentController.getAppointmentById);
router.post('/', appointmentController.createAppointment);
router.patch('/:id/status', appointmentController.changeAppointmentStatus);
/**
 * Rutas solo para administradores
 */
router.use((0, auth_middleware_1.restrictTo)('admin'));
router.get('/', appointmentController.getAllAppointments);
router.put('/:id', appointmentController.updateAppointment);
exports.default = router;
