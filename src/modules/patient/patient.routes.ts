import { Router } from 'express';
import { PatientController } from './patient.controller';
import { authMiddleware, restrictTo } from '../../middlewares/auth.middleware';
import { CreatePatientDto, UpdatePatientDto } from './patient.dto';
import { validateDto } from '../../middlewares/validator.middleware';

const router = Router();
const patientController = new PatientController();

/**
 * Routes that require authentication
 */
router.use(authMiddleware);

/**
 * @route GET /api/patients/my-patients
 * @desc Get all patients for current user
 * @access Private
 */
router.get('/my-patients', patientController.getMyPatients);

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
router.post('/', validateDto(CreatePatientDto), patientController.createPatient);

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
router.put('/:id', validateDto(UpdatePatientDto), patientController.updatePatient);

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
router.use(restrictTo('admin'));

/**
 * @route GET /api/patients
 * @desc Get all patients with pagination (admin only)
 * @access Private (Admin only)
 */
router.get('/', patientController.getAllPatients);

export default router;