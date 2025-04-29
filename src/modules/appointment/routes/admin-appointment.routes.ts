// src/modules/appointment/routes/admin-appointment.routes.ts
import { Router } from 'express';
import { AdminAppointmentController } from '../controllers/admin-appointment.controller';
import { authMiddleware, restrictTo } from '../../../middlewares/auth.middleware';

const router = Router();
const adminAppointmentController = new AdminAppointmentController();

// Todas las rutas son protegidas y requieren rol de administrador
router.use(authMiddleware);
router.use(restrictTo('admin'));

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

export default router;