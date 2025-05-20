"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/appointment/routes/export.routes.ts
const express_1 = require("express");
const export_controller_1 = require("../controllers/export.controller");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const exportController = new export_controller_1.ExportController();
// Todas las rutas son protegidas y requieren rol de administrador
router.use(auth_middleware_1.authMiddleware);
router.use((0, auth_middleware_1.restrictTo)('admin'));
/**
 * @route GET /api/admin/export/appointments/csv
 * @desc Exportar citas a CSV
 * @access Private (Admin only)
 */
router.get('/appointments/csv', exportController.exportAppointmentsToCSV);
/**
 * @route GET /api/admin/export/appointments/json
 * @desc Exportar citas a JSON
 * @access Private (Admin only)
 */
router.get('/appointments/json', exportController.exportAppointmentsToJSON);
/**
 * @route GET /api/admin/export/appointments/summary
 * @desc Exportar resumen de citas
 * @access Private (Admin only)
 */
router.get('/appointments/summary', exportController.exportAppointmentsSummary);
exports.default = router;
