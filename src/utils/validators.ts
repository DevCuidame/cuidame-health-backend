/**
 * Utilidades de validación para la aplicación
 */

/**
 * Valida si un número de teléfono tiene un formato básico válido
 * @param phoneNumber Número de teléfono a validar
 * @returns true si el formato es válido, false en caso contrario
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return false;
  }

  // Remover espacios y caracteres especiales comunes
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
  
  // Verificar que solo contenga dígitos y tenga una longitud razonable
  const phoneRegex = /^\d{7,15}$/;
  
  return phoneRegex.test(cleanNumber);
};

/**
 * Valida si un email tiene un formato válido
 * @param email Email a validar
 * @returns true si el formato es válido, false en caso contrario
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida si una URL tiene un formato válido
 * @param url URL a validar
 * @returns true si el formato es válido, false en caso contrario
 */
export const validateUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valida si un string no está vacío después de hacer trim
 * @param value Valor a validar
 * @returns true si no está vacío, false en caso contrario
 */
export const validateNotEmpty = (value: string): boolean => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Valida si un número está dentro de un rango específico
 * @param value Valor a validar
 * @param min Valor mínimo (inclusive)
 * @param max Valor máximo (inclusive)
 * @returns true si está en el rango, false en caso contrario
 */
export const validateNumberRange = (value: number, min: number, max: number): boolean => {
  return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
};

/**
 * Valida si un string tiene una longitud específica
 * @param value Valor a validar
 * @param minLength Longitud mínima
 * @param maxLength Longitud máxima
 * @returns true si está en el rango de longitud, false en caso contrario
 */
export const validateStringLength = (value: string, minLength: number, maxLength: number): boolean => {
  return typeof value === 'string' && value.length >= minLength && value.length <= maxLength;
};

/**
 * Valida si un valor es un entero positivo
 * @param value Valor a validar
 * @returns true si es un entero positivo, false en caso contrario
 */
export const validatePositiveInteger = (value: any): boolean => {
  return Number.isInteger(value) && value > 0;
};

/**
 * Valida si un array contiene solo URLs válidas
 * @param urls Array de URLs a validar
 * @returns true si todas las URLs son válidas, false en caso contrario
 */
export const validateUrlArray = (urls: string[]): boolean => {
  if (!Array.isArray(urls)) {
    return false;
  }

  return urls.every(url => validateUrl(url));
};

/**
 * Valida si un SID de Twilio tiene el formato correcto
 * @param sid SID a validar
 * @returns true si el formato es válido, false en caso contrario
 */
export const validateTwilioSid = (sid: string): boolean => {
  if (!sid || typeof sid !== 'string') {
    return false;
  }

  // Los SIDs de Twilio tienen 34 caracteres y empiezan con letras específicas
  const sidRegex = /^[A-Z]{2}[a-f0-9]{32}$/;
  return sidRegex.test(sid);
};

/**
 * Valida si un objeto tiene las propiedades requeridas
 * @param obj Objeto a validar
 * @param requiredProps Array de propiedades requeridas
 * @returns true si tiene todas las propiedades, false en caso contrario
 */
export const validateRequiredProperties = (obj: any, requiredProps: string[]): boolean => {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  return requiredProps.every(prop => obj.hasOwnProperty(prop) && obj[prop] !== undefined && obj[prop] !== null);
};

/**
 * Valida si una fecha está en formato ISO válido
 * @param dateString Fecha en string a validar
 * @returns true si es una fecha válida, false en caso contrario
 */
export const validateISODate = (dateString: string): boolean => {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }

  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString === date.toISOString();
};

/**
 * Valida si un valor es un booleano
 * @param value Valor a validar
 * @returns true si es booleano, false en caso contrario
 */
export const validateBoolean = (value: any): boolean => {
  return typeof value === 'boolean';
};