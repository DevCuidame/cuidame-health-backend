"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/appointment/routes/patient-appointment.routes.ts
const express_1 = require("express");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const patient_appointment_controller_1 = require("./patient-appointment.controller");
const patientAppointmentController = new patient_appointment_controller_1.PatientAppointmentController();
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
/**
 * @route GET /api/patient/appointments/upcoming
 * @desc Obtener próximas citas del paciente
 * @access Private
 */
router.get('/upcoming', patientAppointmentController.getUpcomingAppointments);
/**
 * @route GET /api/patient/appointments/all
 * @desc Obtener todas las citas del paciente
 * @access Private
 */
router.get('/all', patientAppointmentController.getAllPatientsAppointments);
/**
 * @route GET /api/patient/appointments/past
 * @desc Obtener citas pasadas del paciente
 * @access Private
 */
router.get('/past', patientAppointmentController.getPastAppointments);
/**
 * @route GET /api/patient/appointments/history
 * @desc Obtener historial completo de citas con paginación y filtros
 * @access Private
 */
router.get('/history', patientAppointmentController.getAppointmentHistory);
/**
 * @route GET /api/patient/appointments/:id
 * @desc Obtener detalles de una cita específica
 * @access Private
 */
router.get('/:id', patientAppointmentController.getAppointmentDetails);
/**
 * @route POST /api/patient/appointments/:id/cancel
 * @desc Cancelar una cita
 * @access Private
 */
router.post('/:id/cancel', patientAppointmentController.cancelAppointment);
/**
 * @route POST /api/patient/appointments/:id/reschedule
 * @desc Solicitar reprogramación de una cita
 * @access Private
 */
router.post('/:id/reschedule', patientAppointmentController.requestReschedule);
/**
 * @route POST /api/patient/appointments/:id/confirm-attendance
 * @desc Confirmar asistencia a una cita
 * @access Private
 */
router.post('/:id/confirm-attendance', patientAppointmentController.confirmAttendance);
exports.default = router;
