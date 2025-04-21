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

export default router;