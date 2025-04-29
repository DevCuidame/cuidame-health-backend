// src/modules/appointment/routes/export.routes.ts
import { Router } from 'express';
import { ExportController } from '../controllers/export.controller';
import { authMiddleware, restrictTo } from '../../../middlewares/auth.middleware';

const router = Router();
const exportController = new ExportController();

// Todas las rutas son protegidas y requieren rol de administrador
router.use(authMiddleware);
router.use(restrictTo('admin'));

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

export default router;