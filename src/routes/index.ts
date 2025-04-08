import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/user/user.routes';
import patientRoutes from '../modules/patient/patient.routes';
import locationRoutes from '../modules/location/location.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/patients', patientRoutes);
router.use('/locations', locationRoutes);

export default router;