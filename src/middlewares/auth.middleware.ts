import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/error-handler';
import config from '../core/config/environment';
import { AppDataSource } from '../core/config/database';
import { UserSessionRepository } from '../modules/auth/user-session.repository';

// Extender interface de Request para incluir usuario
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware que verifica el token JWT y añade el usuario a la petición
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new UnauthorizedError('No ha iniciado sesión. Por favor inicie sesión para acceder.'));
    }

    // 2) Verificar token JWT
    const decoded: any = jwt.verify(token, config.jwt.secret);

    // Rechazar refresh tokens en rutas protegidas
    if (decoded.type === 'refresh') {
      return next(
        new UnauthorizedError('Tipo de token inválido. Use un token de acceso para esta operación.')
      );
    }

    // 3) Verificar que la sesión existe y está activa
    const userSessionRepository = new UserSessionRepository();
    const session = await userSessionRepository.findByAccessToken(token);

    if (!session) {
      return next(
        new UnauthorizedError('Sesión no encontrada. Por favor inicie sesión de nuevo.')
      );
    }

    // 4) Verificar que la sesión no haya expirado
    // if (session.expires_at < new Date()) {
    //   // Desactivar sesión expirada
    //   await userSessionRepository.deactivateSession(session.id);
    //   return next(
    //     new UnauthorizedError('Su sesión ha expirado. Por favor inicie sesión de nuevo.')
    //   );
    // }

    // 5) Verificar que la sesión esté activa
    if (!session.is_active) {
      return next(
        new UnauthorizedError('Sesión inactiva. Por favor inicie sesión de nuevo.')
      );
    }

    // 6) Actualizar última vez usado
    await userSessionRepository.updateLastUsed(session.id);

    // 7) Añadir el usuario a req
    req.user = session.user;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Token inválido. Por favor inicie sesión de nuevo.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Su sesión ha expirado. Por favor inicie sesión de nuevo.'));
    }
    next(error);
  }
};

/**
 * Middleware que verifica que un token es un refresh token válido
 */
export const refreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return next(new UnauthorizedError('Refresh token no proporcionado.'));
    }

    // Verificar que la sesión existe por refresh token
    const userSessionRepository = new UserSessionRepository();
    const session = await userSessionRepository.findByRefreshToken(refresh_token);

    if (!session) {
      return next(
        new UnauthorizedError('Refresh token inválido o sesión no encontrada.')
      );
    }

    // Verificar que el refresh token no haya expirado
    if (session.refresh_expires_at < new Date()) {
      // Desactivar sesión expirada
      await userSessionRepository.deactivateSession(session.id);
      return next(
        new UnauthorizedError('El refresh token ha expirado.')
      );
    }

    // Verificar que la sesión esté activa
    if (!session.is_active) {
      return next(
        new UnauthorizedError('Sesión inactiva.')
      );
    }

    // Verificar token JWT
    const decoded: any = jwt.verify(refresh_token, config.jwt.secret);

    // Verificar que sea un refresh token
    if (decoded.type !== 'refresh') {
      return next(
        new UnauthorizedError('Token inválido. Se requiere un refresh token.')
      );
    }

    // Añadir el usuario a req
    req.user = session.user;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Token inválido.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('El refresh token ha expirado.'));
    }
    next(error);
  }
};

/**
 * Middleware que restringe acceso a ciertos roles
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('No tiene permiso para realizar esta acción'));
    }
    
    // if (!roles.includes(req.user.role)) {
    //   return next(
    //     new UnauthorizedError('No tiene permiso para realizar esta acción')
    //   );
    // }

    next();
  };
};