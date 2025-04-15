import { Router } from 'express';
import { VitalsController } from './vitals.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateDto } from '../../middlewares/validator.middleware';
import {
  CreateHeartRateDto,
  CreateBloodPressureDto,
  CreateBloodGlucoseDto,
  CreateBloodOxygenDto,
  CreateRespiratoryRateDto
} from '../health/health.dto';

const router = Router();
const vitalsController = new VitalsController();

/**
 * Rutas que requieren autenticación
 */
router.use(authMiddleware);

/**
 * Rutas para frecuencia cardíaca (heart-rate)
 */
router.get('/heart-rate/patient/:patientId', vitalsController.getHeartRatesByPatient);
router.post('/heart-rate', validateDto(CreateHeartRateDto), vitalsController.createHeartRate);
router.put('/heart-rate/:id', vitalsController.updateHeartRate);
router.delete('/heart-rate/:id', vitalsController.deleteHeartRate);

/**
 * Rutas para presión arterial (blood-pressure)
 */
router.get('/blood-pressure/patient/:patientId', vitalsController.getBloodPressuresByPatient);
router.post('/blood-pressure', validateDto(CreateBloodPressureDto), vitalsController.createBloodPressure);
router.put('/blood-pressure/:id', vitalsController.updateBloodPressure);
router.delete('/blood-pressure/:id', vitalsController.deleteBloodPressure);

/**
 * Rutas para glucosa en sangre (blood-glucose)
 */
router.get('/blood-glucose/patient/:patientId', vitalsController.getBloodGlucosesByPatient);
router.post('/blood-glucose', validateDto(CreateBloodGlucoseDto), vitalsController.createBloodGlucose);
router.put('/blood-glucose/:id', vitalsController.updateBloodGlucose);
router.delete('/blood-glucose/:id', vitalsController.deleteBloodGlucose);

/**
 * Rutas para oxígeno en sangre (blood-oxygen)
 */
router.get('/blood-oxygen/patient/:patientId', vitalsController.getBloodOxygensByPatient);
router.post('/blood-oxygen', validateDto(CreateBloodOxygenDto), vitalsController.createBloodOxygen);
router.put('/blood-oxygen/:id', vitalsController.updateBloodOxygen);
router.delete('/blood-oxygen/:id', vitalsController.deleteBloodOxygen);

/**
 * Rutas para frecuencia respiratoria (respiratory-rate)
 */
router.get('/respiratory-rate/patient/:patientId', vitalsController.getRespiratoryRatesByPatient);
router.post('/respiratory-rate', validateDto(CreateRespiratoryRateDto), vitalsController.createRespiratoryRate);
router.put('/respiratory-rate/:id', vitalsController.updateRespiratoryRate);
router.delete('/respiratory-rate/:id', vitalsController.deleteRespiratoryRate);

export default router;