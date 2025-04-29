// src/routes.ts
import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import patientRoutes from './modules/patient/patient.routes';
import appointmentRoutes from './modules/appointment/routes/appointment.routes';
import appointmentTypeRoutes from './modules/appointment/routes/appointment-type.routes';
import availabilityRoutes from './modules/appointment/routes/availability.routes';
import timeBlockRoutes from './modules/appointment/routes/time-block.routes';
import healthProfessionalRoutes from './modules/appointment/routes/health-professional.routes';
import adminAppointmentRoutes from './modules/appointment/routes/admin-appointment.routes';
import patientAppointmentRoutes from './modules/appointment/patient/patient-appointment.routes';
import appointmentRequestRoutes from './modules/appointment/routes/appointment-request.routes';
import professionalStatsRoutes from './modules/appointment/routes/professional-stats.routes';
import exportRoutes from './modules/appointment/routes/export.routes';
import recurringAppointmentRoutes from './modules/appointment/routes/recurring-appointment.routes';
import questionnaireRoutes from './modules/appointment/routes/questionnaire.routes';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de usuarios
router.use('/users', userRoutes);

// Rutas de pacientes
router.use('/patients', patientRoutes);

// Rutas de citas
router.use('/appointments', appointmentRoutes);
router.use('/appointment-types', appointmentTypeRoutes);
router.use('/availability', availabilityRoutes);
router.use('/time-blocks', timeBlockRoutes);
router.use('/health-professionals', healthProfessionalRoutes);
router.use('/admin/appointments', adminAppointmentRoutes);
router.use('/patient/appointments', patientAppointmentRoutes);
router.use('/appointment-requests', appointmentRequestRoutes);
router.use('/professional-stats', professionalStatsRoutes);
router.use('/export', exportRoutes);

// Nuevas rutas para citas recurrentes y cuestionarios
router.use('/recurring-appointments', recurringAppointmentRoutes);
router.use('/questionnaires', questionnaireRoutes);

export default router;