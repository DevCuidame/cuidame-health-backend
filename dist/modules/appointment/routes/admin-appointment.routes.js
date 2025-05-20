"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/appointment/routes/admin-appointment.routes.ts
const express_1 = require("express");
const admin_appointment_controller_1 = require("../controllers/admin-appointment.controller");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const adminAppointmentController = new admin_appointment_controller_1.AdminAppointmentController();
// Todas las rutas son protegidas y requieren rol de administrador
router.use(auth_middleware_1.authMiddleware);
router.use((0, auth_middleware_1.restrictTo)('admin'));
/**
 * @route GET /api/admin/appointments/search
 * @desc Buscar citas con filtros avanzados y paginación
 * @access Private (Admin only)
 */
router.get('/search', adminAppointmentController.searchAppointments);
/**
 * @route POST /api/admin/appointments/bulk-process
 * @desc Procesar citas en masa (aprobar/rechazar)
 * @access Private (Admin only)
 */
router.post('/bulk-process', adminAppointmentController.bulkProcessAppointments);
/**
 * @route PUT /api/admin/appointments/:id/reassign
 * @desc Reasignar una cita a otro profesional
 * @access Private (Admin only)
 */
router.put('/:id/reassign', adminAppointmentController.reassignAppointment);
/**
 * @route GET /api/admin/appointments/metrics
 * @desc Obtener métricas para el dashboard
 * @access Private (Admin only)
 */
router.get('/metrics', adminAppointmentController.getAppointmentMetrics);
/**
 * @route GET /api/admin/appointments/workload
 * @desc Obtener carga de trabajo de los profesionales
 * @access Private (Admin only)
 */
router.get('/workload', adminAppointmentController.getProfessionalWorkload);
exports.default = router;
