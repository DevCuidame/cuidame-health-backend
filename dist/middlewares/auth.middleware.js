"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.refreshTokenMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_handler_1 = require("../utils/error-handler");
const environment_1 = __importDefault(require("../core/config/environment"));
const user_session_repository_1 = require("../modules/auth/user-session.repository");
/**
 * Middleware que verifica el token JWT y añade el usuario a la petición
 */
const authMiddleware = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return next(new error_handler_1.UnauthorizedError('No ha iniciado sesión. Por favor inicie sesión para acceder.'));
        }
        // 2) Verificar token JWT
        const decoded = jsonwebtoken_1.default.verify(token, environment_1.default.jwt.secret);
        // Rechazar refresh tokens en rutas protegidas
        if (decoded.type === 'refresh') {
            return next(new error_handler_1.UnauthorizedError('Tipo de token inválido. Use un token de acceso para esta operación.'));
        }
        // 3) Verificar que la sesión existe y está activa
        const userSessionRepository = new user_session_repository_1.UserSessionRepository();
        const session = await userSessionRepository.findByAccessToken(token);
        if (!session) {
            return next(new error_handler_1.UnauthorizedError('Sesión no encontrada. Por favor inicie sesión de nuevo.'));
        }
        // 4) Verificar que la sesión no haya expirado
        if (session.expires_at < new Date()) {
            // Desactivar sesión expirada
            await userSessionRepository.deactivateSession(session.id);
            return next(new error_handler_1.UnauthorizedError('Su sesión ha expirado. Por favor inicie sesión de nuevo.'));
        }
        // 5) Verificar que la sesión esté activa
        if (!session.is_active) {
            return next(new error_handler_1.UnauthorizedError('Sesión inactiva. Por favor inicie sesión de nuevo.'));
        }
        // 6) Actualizar última vez usado
        await userSessionRepository.updateLastUsed(session.id);
        // 7) Añadir el usuario a req
        req.user = session.user;
        next();
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new error_handler_1.UnauthorizedError('Token inválido. Por favor inicie sesión de nuevo.'));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new error_handler_1.UnauthorizedError('Su sesión ha expirado. Por favor inicie sesión de nuevo.'));
        }
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
/**
 * Middleware que verifica que un token es un refresh token válido
 */
const refreshTokenMiddleware = async (req, res, next) => {
    try {
        const { refresh_token } = req.body;
        if (!refresh_token) {
            return next(new error_handler_1.UnauthorizedError('Refresh token no proporcionado.'));
        }
        // Verificar que la sesión existe por refresh token
        const userSessionRepository = new user_session_repository_1.UserSessionRepository();
        const session = await userSessionRepository.findByRefreshToken(refresh_token);
        if (!session) {
            return next(new error_handler_1.UnauthorizedError('Refresh token inválido o sesión no encontrada.'));
        }
        // Verificar que el refresh token no haya expirado
        if (session.refresh_expires_at < new Date()) {
            // Desactivar sesión expirada
            await userSessionRepository.deactivateSession(session.id);
            return next(new error_handler_1.UnauthorizedError('El refresh token ha expirado.'));
        }
        // Verificar que la sesión esté activa
        if (!session.is_active) {
            return next(new error_handler_1.UnauthorizedError('Sesión inactiva.'));
        }
        // Verificar token JWT
        const decoded = jsonwebtoken_1.default.verify(refresh_token, environment_1.default.jwt.secret);
        // Verificar que sea un refresh token
        if (decoded.type !== 'refresh') {
            return next(new error_handler_1.UnauthorizedError('Token inválido. Se requiere un refresh token.'));
        }
        // Añadir el usuario a req
        req.user = session.user;
        next();
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new error_handler_1.UnauthorizedError('Token inválido.'));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new error_handler_1.UnauthorizedError('El refresh token ha expirado.'));
        }
        next(error);
    }
};
exports.refreshTokenMiddleware = refreshTokenMiddleware;
/**
 * Middleware que restringe acceso a ciertos roles
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new error_handler_1.UnauthorizedError('No tiene permiso para realizar esta acción'));
        }
        // if (!roles.includes(req.user.role)) {
        //   return next(
        //     new UnauthorizedError('No tiene permiso para realizar esta acción')
        //   );
        // }
        next();
    };
};
exports.restrictTo = restrictTo;
