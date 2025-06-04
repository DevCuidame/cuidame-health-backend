"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const patient_controller_1 = require("./patient.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const patient_dto_1 = require("./patient.dto");
const validator_middleware_1 = require("../../middlewares/validator.middleware");
const router = (0, express_1.Router)();
const patientController = new patient_controller_1.PatientController();
/**
 * Routes that require authentication
 */
router.use(auth_middleware_1.authMiddleware);
/**
 * @route GET /api/patients/my-patients
 * @desc Get all patients for current user
 * @access Private
 */
router.get('/my-patients', patientController.getMyPatients);
/**
 * @route GET /api/patients/identification/identificationType/identificationNumber
 * @desc Get patient by identification type and number
 * @access Private
 */
router.get('/identification/:identificationType/:identificationNumber', patientController.getPatientByIdAndNum);
/**
 * @route GET /api/patients/:id/health-data
 * @desc Obtener un paciente con todos sus datos de salud
 * @access Private
 */
router.get('/:id/health-data', patientController.getPatientWithHealthData);
/**
 * @route GET /api/patients/search
 * @desc Search patients by name, lastname, or ID
 * @access Private
 */
router.get('/search', patientController.searchPatients);
/**
 * @route POST /api/patients
 * @desc Create a new patient
 * @access Private
 */
router.post('/', (0, validator_middleware_1.validateDto)(patient_dto_1.CreatePatientDto), patientController.createPatient);
/**
 * @route GET /api/patients/:id
 * @desc Get patient by ID
 * @access Private
 */
router.get('/:id', patientController.getPatientById);
/**
 * @route GET /api/patients/:id/details
 * @desc Get full patient details including medical info
 * @access Private
 */
router.get('/:id/details', patientController.getPatientFullDetails);
/**
 * @route PUT /api/patients/:id
 * @desc Update patient
 * @access Private
 */
router.put('/:id', (0, validator_middleware_1.validateDto)(patient_dto_1.UpdatePatientDto), patientController.updatePatient);
/**
 * @route PUT /api/patients/:id/image
 * @desc Update patient image
 * @access Private
 */
router.put('/:id/image', patientController.updatePatientImage);
/**
 * @route DELETE /api/patients/:id
 * @desc Delete patient
 * @access Private
 */
router.delete('/:id', patientController.deletePatient);
/**
 * Routes that require admin role
 */
router.use((0, auth_middleware_1.restrictTo)('admin'));
/**
 * @route GET /api/patients
 * @desc Get all patients with pagination (admin only)
 * @access Private (Admin only)
 */
router.get('/', patientController.getAllPatients);
exports.default = router;
