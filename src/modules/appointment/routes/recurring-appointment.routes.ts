// src/modules/appointment/routes/recurring-appointment.routes.ts
import { Router } from 'express';
import { RecurringAppointmentController } from '../controllers/recurring-appointment.controller';
import { authMiddleware, restrictTo } from '../../../middlewares/auth.middleware';

const router = Router();
const recurringAppointmentController = new RecurringAppointmentController();

/**
 * Rutas que requieren autenticación
 */
router.use(authMiddleware);

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
router.use(restrictTo('admin', 'professional'));
router.get('/', recurringAppointmentController.getAllRecurringAppointments);
router.put('/:id', recurringAppointmentController.updateRecurringAppointment);
router.delete('/:id', recurringAppointmentController.deactivateRecurringAppointment);

export default router;