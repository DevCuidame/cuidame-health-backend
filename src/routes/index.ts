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

import express from 'express';


const router = Router();

// Test router for CORS testing purposes only - remove in production 
// const testRouter = express.Router();

// testRouter.get('/cors-test', (req, res) => {
//   res.json({
//     success: true,
//     message: 'CORS is working correctly!',
//     headers: {
//       'access-control-allow-origin': res.getHeader('Access-Control-Allow-Origin'),
//       'access-control-allow-methods': res.getHeader('Access-Control-Allow-Methods'),
//       'access-control-allow-headers': res.getHeader('Access-Control-Allow-Headers')
//     },
//     origin: req.headers.origin,
//     date: new Date().toISOString()
//   });
// });

// testRouter.options('/cors-test', (req, res) => {
//   res.status(204).end();
// });

// router.use('/test', testRouter);

// ..............................................................................................

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