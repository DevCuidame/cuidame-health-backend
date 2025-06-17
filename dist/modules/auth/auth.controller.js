"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../auth/auth.service");
class AuthController {
    authService;
    constructor() {
        this.authService = new auth_service_1.AuthService();
    }
    /**
     * Iniciar sesión de usuario
     * @route POST /api/auth/login
     */
    login = async (req, res, next) => {
        try {
            const credentials = req.body;
            // Extraer información del dispositivo del request
            const deviceInfo = {
                deviceName: req.body.deviceName || 'Dispositivo desconocido',
                deviceType: req.body.deviceType || 'unknown',
                ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
                userAgent: req.get('User-Agent') || 'unknown'
            };
            const result = await this.authService.login(credentials, deviceInfo);
            const response = {
                success: result.success,
                message: result.message,
                data: result.data,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Refrescar token de acceso
     * @route POST /api/auth/refresh-token
     */
    refreshToken = async (req, res, next) => {
        try {
            const { refresh_token } = req.body;
            if (!refresh_token) {
                res.status(400).json({
                    success: false,
                    message: 'Refresh token no proporcionado',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const result = await this.authService.refreshToken({ refresh_token });
            const response = {
                success: result.success,
                message: result.message,
                data: result.data,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Registrar un nuevo usuario
     * @route POST /api/auth/register
     */
    register = async (req, res, next) => {
        try {
            const userData = req.body;
            const result = await this.authService.register(userData);
            const response = {
                success: result.success,
                message: result.message,
                data: result.data,
                timestamp: new Date().toISOString()
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Solicitar restablecimiento de contraseña
     * @route POST /api/auth/forgot-password
     */
    forgotPassword = async (req, res, next) => {
        try {
            const { email } = req.body;
            const result = await this.authService.forgotPassword(email);
            const response = {
                success: result.success,
                message: result.message,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Restablecer contraseña
     * @route POST /api/auth/reset-password
     */
    resetPassword = async (req, res, next) => {
        try {
            const { token, password, confirmPassword } = req.body;
            // Verificar que las contraseñas coincidan
            if (password !== confirmPassword) {
                res.status(400).json({
                    success: false,
                    message: 'Las contraseñas no coinciden',
                    timestamp: new Date().toISOString()
                });
            }
            const result = await this.authService.resetPassword(token, password);
            const response = {
                success: result.success,
                message: result.message,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Verificar correo electrónico
     * @route GET /api/auth/verify-email/:token
     */
    verifyEmail = async (req, res, next) => {
        try {
            const { token } = req.params;
            const result = await this.authService.verifyEmail(token);
            const response = {
                success: result.success,
                message: result.message,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Cerrar sesión
     * @route POST /api/auth/logout
     */
    logout = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(200).json({
                    success: true,
                    message: 'No hay sesión activa',
                    timestamp: new Date().toISOString()
                });
            }
            const result = await this.authService.logout(userId);
            const response = {
                success: result.success,
                message: result.message,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Verificar contraseña para eliminación de cuenta
     * @route POST /api/auth/verify-password
     */
    verifyPasswordForDeletion = async (req, res, next) => {
        try {
            const { password } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'No autorizado',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const result = await this.authService.verifyPasswordForDeletion(userId, password);
            const response = {
                success: result.success,
                message: result.message,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener información para eliminación de cuenta
     * @route GET /api/auth/account-deletion-info
     */
    getAccountDeletionInfo = async (req, res, next) => {
        try {
            const result = await this.authService.getAccountDeletionInfo();
            const response = {
                success: true,
                message: 'Información obtenida correctamente',
                data: result,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Eliminar cuenta de usuario
     * @route DELETE /api/auth/delete-account
     */
    deleteAccount = async (req, res, next) => {
        try {
            const deleteData = req.body;
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'No autorizado',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const result = await this.authService.deleteAccount(userId, deleteData);
            const response = {
                success: result.success,
                message: result.message,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Cambiar contraseña de usuario
     * @route PUT /api/auth/change-password
     */
    changePassword = async (req, res, next) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'No autorizado',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const result = await this.authService.changePassword(userId, currentPassword, newPassword);
            const response = {
                success: result.success,
                message: result.message,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener sesiones activas del usuario
     * @route GET /api/auth/sessions
     */
    getActiveSessions = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'No autorizado',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const sessions = await this.authService.getActiveSessions(userId);
            const response = {
                success: true,
                message: 'Sesiones activas obtenidas correctamente',
                data: sessions,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Cerrar sesión específica o todas las sesiones
     * @route POST /api/auth/logout-session
     */
    logoutSession = async (req, res, next) => {
        try {
            const { sessionId, logoutAll } = req.body;
            const accessToken = req.headers.authorization?.replace('Bearer ', '');
            if (!accessToken) {
                res.status(401).json({
                    success: false,
                    message: 'Token de acceso requerido',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const logoutData = {
                sessionId,
                accessToken,
                logoutAll: logoutAll || false
            };
            const result = await this.authService.logoutSession(logoutData);
            const response = {
                success: result.success,
                message: result.message,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Limpiar sesiones expiradas
     * @route POST /api/auth/cleanup-sessions
     */
    cleanupSessions = async (req, res, next) => {
        try {
            const result = await this.authService.cleanupSessions();
            const response = {
                success: true,
                message: `Limpieza completada: ${result.expired} sesiones expiradas y ${result.inactive} sesiones inactivas eliminadas`,
                data: result,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AuthController = AuthController;
