import { Router } from 'express';
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


import healthProfessionalRoutes from '../modules/appointment/routes/health-professional.routes';
import appointmentTypeRoutes from '../modules/appointment/routes/appointment-type.routes';
import availabilityRoutes from '../modules/appointment/routes/availability.routes';
import appointmentRoutes from '../modules/appointment/routes/appointment.routes';
import appointmentRequestRoutes from '../modules/appointment/routes/appointment-request.routes';
import timeBlockRoutes from '../modules/appointment/routes/time-block.routes';
import notificationRoutes from '../modules/notification/notification.routes';




const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/patients', patientRoutes);
router.use('/locations', locationRoutes);
router.use('/medical-info/batch', batchMedicalInfoRoutes);
router.use('/medical-info/sync', syncMedicalInfoRoutes);
router.use('/medical-info/condition', conditionRoutes);
router.use('/code', codeRoutes);
router.use('/contacts', contactRoutes);
router.use('/', vitalsRoutes);

router.use('/professionals', healthProfessionalRoutes);
router.use('/appointment-types', appointmentTypeRoutes);
router.use('/availability', availabilityRoutes);
router.use('/appointments', appointmentRoutes);

router.use('/api/appointment-requests', appointmentRequestRoutes);
router.use('/api/time-blocks', timeBlockRoutes);
router.use('/api/notifications', notificationRoutes);

export default router;