import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/user/user.routes';
import patientRoutes from '../modules/patient/patient.routes';
import locationRoutes from '../modules/location/location.routes';
import batchMedicalInfoRoutes from '../modules/medical-info/batch-medical-info.routes';
import syncMedicalInfoRoutes from '../modules/medical-info/sync-medical-info.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/patients', patientRoutes);
router.use('/locations', locationRoutes);
router.use('/medical-info/batch', batchMedicalInfoRoutes);
router.use('/medical-info/sync', syncMedicalInfoRoutes);

export default router;