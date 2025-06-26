import { Router } from 'express';
import logger from '../utils/logger';

// Import statements
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/user/user.routes';
import patientRoutes from '../modules/patient/patient.routes';
import locationRoutes from '../modules/location/location.routes';
import batchMedicalInfoRoutes from '../modules/medical-info/batch-medical-info.routes';
import syncMedicalInfoRoutes from '../modules/medical-info/sync-medical-info.routes';
import conditionRoutes from '../modules/condition/condition.routes';
import codeRoutes from '../modules/code/code.routes';
import vitalsRoutes from '../modules/vitals/vitals.routes';
import contactRoutes from '../modules/contact/contact.routes';
import healthDataRoutes from '../modules/health/health-data.routes';
import firebasePushRoutes from '../modules/firebase-push-notificactions/routes/firebase-push.routes';

import healthProfessionalRoutes from '../modules/appointment/routes/health-professional.routes';
import appointmentTypeRoutes from '../modules/appointment/routes/appointment-type.routes';
import availabilityRoutes from '../modules/appointment/routes/availability.routes';
import appointmentRoutes from '../modules/appointment/routes/appointment.routes';
import appointmentRequestRoutes from '../modules/appointment/routes/appointment-request.routes';
import timeBlockRoutes from '../modules/appointment/routes/time-block.routes';
import adminAppointmentRoutes from '../modules/appointment/routes/admin-appointment.routes';
import professionalStatsRoutes from '../modules/appointment/routes/professional-stats.routes';
import exportRoutes from '../modules/appointment/routes/export.routes';
import patientAppointmentRoutes from '../modules/appointment/patient/patient-appointment.routes';

import chatRoutes from '../modules/chat/chat.routes';

import recurringAppointmentRoutes from '../modules/appointment/routes/recurring-appointment.routes';
import questionnaireRoutes from '../modules/appointment/routes/questionnaire.routes';
import medicalSpecialtiesRoutes from '../modules/medical-specialty/medical-specialty.routes';

import {
  notificationRoutes,
  adminNotificationRoutes,
} from '../modules/notification/notification.routes';
import whatsAppRoutes from '../modules/whatsapp/whatsapp.routes';

const router = Router();

//Index
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/patients', patientRoutes);
router.use('/locations', locationRoutes);
router.use('/medical-info/batch', batchMedicalInfoRoutes);
router.use('/medical-info/sync', syncMedicalInfoRoutes);
router.use('/medical-info/condition', conditionRoutes);
router.use('/health-data', healthDataRoutes);
router.use('/code', codeRoutes);
router.use('/contacts', contactRoutes);
router.use('/patient/appointments', patientAppointmentRoutes);
router.use('/specialties', medicalSpecialtiesRoutes)

router.use('/chat', chatRoutes);
router.use('/professionals', healthProfessionalRoutes);
router.use('/appointment-types', appointmentTypeRoutes);
router.use('/availability', availabilityRoutes);
router.use('/appointments', appointmentRoutes);

router.use('/appointment-requests', appointmentRequestRoutes);
router.use('/time-blocks', timeBlockRoutes);

router.use('/admin/appointments', adminAppointmentRoutes);
router.use('/admin/professionals', professionalStatsRoutes);
router.use('/admin/export', exportRoutes);

router.use('/recurring-appointments', recurringAppointmentRoutes);
router.use('/questionnaires', questionnaireRoutes);

// Rutas de notificación actualizadas
router.use('/notifications', notificationRoutes);
router.use('/admin/notifications', adminNotificationRoutes);

// Rutas de WhatsApp
router.use('/whatsapp', whatsAppRoutes);

// Rutas de Firebase Push Notifications
router.use('/firebase-push', firebasePushRoutes);

router.use('/', vitalsRoutes);


export default router;
