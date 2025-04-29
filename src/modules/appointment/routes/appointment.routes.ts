// src/modules/appointment/appointment.routes.ts
import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { authMiddleware, restrictTo } from '../../../middlewares/auth.middleware';

const router = Router();
const appointmentController = new AppointmentController();

/**
 * Rutas que requieren autenticación
 */
router.use(authMiddleware);

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
router.use(restrictTo('admin'));
router.get('/', appointmentController.getAllAppointments);
router.put('/:id', appointmentController.updateAppointment);

export default router;