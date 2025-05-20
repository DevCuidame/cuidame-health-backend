"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vitals_controller_1 = require("./vitals.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validator_middleware_1 = require("../../middlewares/validator.middleware");
const health_dto_1 = require("../health/health.dto");
const router = (0, express_1.Router)();
const vitalsController = new vitals_controller_1.VitalsController();
/**
 * Rutas que requieren autenticación
 */
router.use(auth_middleware_1.authMiddleware);
/**
 * Rutas para frecuencia cardíaca (heart-rate)
 */
router.get('/heart-rate/patient/:patientId', vitalsController.getHeartRatesByPatient);
router.post('/heart-rate', (0, validator_middleware_1.validateDto)(health_dto_1.CreateHeartRateDto), vitalsController.createHeartRate);
router.put('/heart-rate/:id', vitalsController.updateHeartRate);
router.delete('/heart-rate/:id', vitalsController.deleteHeartRate);
/**
 * Rutas para presión arterial (blood-pressure)
 */
router.get('/blood-pressure/patient/:patientId', vitalsController.getBloodPressuresByPatient);
router.post('/blood-pressure', (0, validator_middleware_1.validateDto)(health_dto_1.CreateBloodPressureDto), vitalsController.createBloodPressure);
router.put('/blood-pressure/:id', vitalsController.updateBloodPressure);
router.delete('/blood-pressure/:id', vitalsController.deleteBloodPressure);
/**
 * Rutas para glucosa en sangre (blood-glucose)
 */
router.get('/blood-glucose/patient/:patientId', vitalsController.getBloodGlucosesByPatient);
router.post('/blood-glucose', (0, validator_middleware_1.validateDto)(health_dto_1.CreateBloodGlucoseDto), vitalsController.createBloodGlucose);
router.put('/blood-glucose/:id', vitalsController.updateBloodGlucose);
router.delete('/blood-glucose/:id', vitalsController.deleteBloodGlucose);
/**
 * Rutas para oxígeno en sangre (blood-oxygen)
 */
router.get('/blood-oxygen/patient/:patientId', vitalsController.getBloodOxygensByPatient);
router.post('/blood-oxygen', (0, validator_middleware_1.validateDto)(health_dto_1.CreateBloodOxygenDto), vitalsController.createBloodOxygen);
router.put('/blood-oxygen/:id', vitalsController.updateBloodOxygen);
router.delete('/blood-oxygen/:id', vitalsController.deleteBloodOxygen);
/**
 * Rutas para frecuencia respiratoria (respiratory-rate)
 */
router.get('/respiratory-rate/patient/:patientId', vitalsController.getRespiratoryRatesByPatient);
router.post('/respiratory-rate', (0, validator_middleware_1.validateDto)(health_dto_1.CreateRespiratoryRateDto), vitalsController.createRespiratoryRate);
router.put('/respiratory-rate/:id', vitalsController.updateRespiratoryRate);
router.delete('/respiratory-rate/:id', vitalsController.deleteRespiratoryRate);
exports.default = router;
