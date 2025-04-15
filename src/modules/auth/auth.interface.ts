/**
 * Interfaz para credenciales de inicio de sesión
 */
export interface ILoginCredentials {
  email: string;
  password: string;
}

/**
 * Interfaz para datos de refresh token
 */
export interface IRefreshTokenData {
  refresh_token: string;
}

/**
 * Interfaz para el payload del token JWT
 */
export interface JwtPayload {
  id: number;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Payload extendido para refresh token
 */
export interface RefreshTokenPayload extends JwtPayload {
  type: 'refresh';
  token_version: number;
}

/**
 * Interfaz para datos de registro de usuario
 */
export interface IRegisterData {
  name: string;
  lastname: string;
  typeid: string;
  numberid: string;
  phone: string;
  email: string;
  gender: string;
  birth_date: string;
  password: string;
  city_id: number;
  address: string;
  pubname?: string;
  imagebs64?: string;
}

/**
 * Interfaz para datos de restablecimiento de contraseña
 */
export interface IResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * Interfaz para la respuesta de autenticación
 */
export interface IAuthResponse {
  success: boolean;
  message: string;
  data?: any;
  user?: any;
  token?: string;
  refresh_token?: string;
}