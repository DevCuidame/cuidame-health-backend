"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/appointment/routes/recurring-appointment.routes.ts
const express_1 = require("express");
const recurring_appointment_controller_1 = require("../controllers/recurring-appointment.controller");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const recurringAppointmentController = new recurring_appointment_controller_1.RecurringAppointmentController();
/**
 * Rutas que requieren autenticación
 */
router.use(auth_middleware_1.authMiddleware);
/**
 * Rutas para pacientes y profesionales
 */
router.get('/patient/:id', recurringAppointmentController.getRecurringAppointmentsByPatient);
router.get('/professional/:id', recurringAppointmentController.getRecurringAppointmentsByProfessional);
router.get('/:id', recurringAppointmentController.getRecurringAppointmentById);
router.post('/', recurringAppointmentController.createRecurringAppointment);
/**
 * Rutas solo para administradores y profesionales
 */
router.use((0, auth_middleware_1.restrictTo)('admin', 'professional'));
router.get('/', recurringAppointmentController.getAllRecurringAppointments);
router.put('/:id', recurringAppointmentController.updateRecurringAppointment);
router.delete('/:id', recurringAppointmentController.deactivateRecurringAppointment);
exports.default = router;
