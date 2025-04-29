// src/modules/appointment/appointment-request.routes.ts
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { Router } from 'express';
import { AppointmentRequestController } from '../controllers/appointment-request.controller';

const router = Router();
const appointmentRequestController = new AppointmentRequestController();

/**
 * Rutas públicas para consulta de disponibilidad
 */
router.get('/available-days/:professionalId/:year/:month', appointmentRequestController.getAvailableDays);
router.get('/available-slots/:professionalId/:date', appointmentRequestController.getAvailableTimeSlots);

/**
 * Rutas protegidas para solicitud de citas
 */
router.use(authMiddleware);
router.post('/', appointmentRequestController.requestAppointment);

export default router;