import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import patientRoutes from './patient.routes';
// Importar otras rutas aquí cuando se creen

const router = Router();

// Registrar todas las rutas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/patients', patientRoutes);

export default router;