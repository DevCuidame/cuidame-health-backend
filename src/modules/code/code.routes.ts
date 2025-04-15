import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { CodeController } from './code.controller';

const router = Router();
const controller = new CodeController();

/**
 * Routes that require authentication
 */
// router.use(authMiddleware);

/**
 * @route GET /api/code/agreements
 * @desc Get all agreements
 * @access Private
 */
router.get('/agreements', controller.getAgreements);

/**
 * @route GET /api/code/authenticate
 * @desc Auth Code
 * @access Private
 */
router.post('/authenticate', controller.authenticateBand);

export default router;