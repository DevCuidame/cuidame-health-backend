"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/appointment/appointment-request.routes.ts
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const express_1 = require("express");
const appointment_request_controller_1 = require("../controllers/appointment-request.controller");
const router = (0, express_1.Router)();
const appointmentRequestController = new appointment_request_controller_1.AppointmentRequestController();
/**
 * Rutas públicas para consulta de disponibilidad
 */
router.get('/available-days/:professionalId/:year/:month', appointmentRequestController.getAvailableDays);
router.get('/available-slots/:professionalId/:date', appointmentRequestController.getAvailableTimeSlots);
/**
 * Rutas protegidas para solicitud de citas
 */
router.use(auth_middleware_1.authMiddleware);
router.post('/', appointmentRequestController.requestAppointment);
exports.default = router;
