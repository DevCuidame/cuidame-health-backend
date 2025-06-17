import { Router } from 'express';
import { AuthController } from '../auth/auth.controller';
import { SessionCleanupController } from '../auth/session-cleanup.controller';
import { validateDto } from '../../middlewares/validator.middleware';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto, VerifyPasswordDto, DeleteAccountDto, ChangePasswordDto } from '../auth/auth.dto';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();
const sessionCleanupController = new SessionCleanupController();

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 */
router.post('/login', validateDto(LoginDto), authController.login);

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', validateDto(RegisterDto), authController.register);

/**
 * @route POST /api/auth/refresh-token
 * @desc Refresh access token using a refresh token
 * @access Public
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post('/forgot-password', validateDto(ForgotPasswordDto), authController.forgotPassword);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post('/reset-password', validateDto(ResetPasswordDto), authController.resetPassword);

/**
 * @route GET /api/auth/verify-email/:token
 * @desc Verify email with token
 * @access Public
 */
router.get('/verify-email/:token', authController.verifyEmail);

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * @route POST /api/auth/verify-password
 * @desc Verificar contraseña para eliminación de cuenta
 * @access Private
 */
router.post('/verify-password', authMiddleware, validateDto(VerifyPasswordDto), authController.verifyPasswordForDeletion);

/**
 * @route GET /api/auth/account-deletion-info
 * @desc Obtener información para eliminación de cuenta
 * @access Private
 */
router.get('/account-deletion-info', authMiddleware, authController.getAccountDeletionInfo);

/**
 * @route DELETE /api/auth/delete-account
 * @desc Eliminar cuenta de usuario
 * @access Private
 */
router.delete('/delete-account', authMiddleware, validateDto(DeleteAccountDto), authController.deleteAccount);

/**
 * @route PUT /api/auth/change-password
 * @desc Cambiar contraseña de usuario
 * @access Private
 */
router.put('/change-password', authMiddleware, validateDto(ChangePasswordDto), authController.changePassword);

/**
 * @route GET /api/auth/sessions
 * @desc Obtener sesiones activas del usuario
 * @access Private
 */
router.get('/sessions', authMiddleware, authController.getActiveSessions);

/**
 * @route POST /api/auth/logout-session
 * @desc Cerrar sesión específica o todas las sesiones
 * @access Private
 */
router.post('/logout-session', authMiddleware, authController.logoutSession);

/**
 * @route POST /api/auth/cleanup-sessions
 * @desc Limpiar sesiones expiradas (endpoint administrativo)
 * @access Private
 */
router.post('/cleanup-sessions', authMiddleware, authController.cleanupSessions);

/**
 * @route POST /api/auth/admin/cleanup-full
 * @desc Ejecutar limpieza completa de sesiones inactivas
 * @access Private (Admin)
 */
router.post('/admin/cleanup-full', authMiddleware, sessionCleanupController.manualCleanup);

/**
 * @route POST /api/auth/admin/cleanup-light
 * @desc Ejecutar limpieza ligera (solo sesiones expiradas)
 * @access Private (Admin)
 */
router.post('/admin/cleanup-light', authMiddleware, sessionCleanupController.lightCleanup);

/**
 * @route GET /api/auth/admin/cleanup-stats
 * @desc Obtener estadísticas del servicio de limpieza
 * @access Private (Admin)
 */
router.get('/admin/cleanup-stats', authMiddleware, sessionCleanupController.getCleanupStats);

/**
 * @route POST /api/auth/admin/cleanup-configure
 * @desc Configurar parámetros de limpieza personalizada
 * @access Private (Admin)
 */
router.post('/admin/cleanup-configure', authMiddleware, sessionCleanupController.configureCleanup);

export default router;