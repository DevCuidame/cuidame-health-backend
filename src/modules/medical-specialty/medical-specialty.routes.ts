import { authMiddleware } from '../../middlewares/auth.middleware';
import { MedicalSpecialtyController } from './medical-specialty.conttroller';
import { Router } from "express";

const router = Router();
const medicalSpecialtyController = new MedicalSpecialtyController();

/**
 * Routes that require authentication
 */
router.use(authMiddleware);

/**
 * @route GET /api/specialties
 * @desc Get all medical specialties
 * @access Private
 */
router.get('/', medicalSpecialtyController.getAllSpecialties);

/**
 * @route GET /api/specialties/:id
 * @desc Get a medical specialty by ID
 * @access Private
 */
router.get('/:id', medicalSpecialtyController.getSpecialtyById);

/**
 * @route POST /api/specialties
 * @desc Create a new medical specialty
 * @access Private
 */
router.post('/', medicalSpecialtyController.createSpecialty);

/**
 * @route PUT /api/specialties/:id
 * @desc Update a medical specialty
 * @access Private
 */
router.put('/:id', medicalSpecialtyController.updateSpecialty);

/**
 * @route DELETE /api/specialties/:id
 * @desc Delete a medical specialty
 * @access Private
 */
router.delete('/:id', medicalSpecialtyController.deleteSpecialty);

export default router;
