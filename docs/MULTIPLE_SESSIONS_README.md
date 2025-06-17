# Sistema de Sesiones Múltiples - CuidameHealth Backend

## Descripción

Este documento describe la implementación del sistema de sesiones múltiples que permite a los usuarios iniciar sesión desde múltiples dispositivos simultáneamente.

## Cambios Implementados

### 1. Nuevo Modelo de Sesión de Usuario

**Archivo:** `src/models/user-session.model.ts`

Se creó una nueva entidad `UserSession` que reemplaza el campo único `session_token` en la tabla `users`. Esta entidad incluye:

- `id`: Identificador único de la sesión (UUID)
- `user_id`: Referencia al usuario propietario
- `access_token` y `refresh_token`: Tokens JWT
- Información del dispositivo (`device_name`, `device_type`, `ip_address`, `user_agent`)
- Fechas de expiración para ambos tokens
- Estado de la sesión (`is_active`)
- Timestamps de creación y última actividad

### 2. Repositorio de Sesiones

**Archivo:** `src/modules/auth/user-session.repository.ts`

Nuevo repositorio que maneja todas las operaciones CRUD de las sesiones:

- Crear nuevas sesiones
- Buscar sesiones por tokens
- Gestionar sesiones activas por usuario
- Desactivar sesiones (individual o masiva)
- Limpiar sesiones expiradas
- Limitar número de sesiones por usuario

### 3. Interfaces Actualizadas

**Archivo:** `src/modules/auth/auth.interface.ts`

Se agregaron nuevas interfaces:

- `IDeviceInfo`: Información del dispositivo
- `ISessionData`: Datos de la sesión
- `ISessionResponse`: Respuesta con información de sesión
- `ILogoutSessionData`: Datos para logout selectivo
- `IActiveSession`: Información de sesiones activas

### 4. Servicio de Autenticación Actualizado

**Archivo:** `src/modules/auth/auth.service.ts`

#### Métodos Modificados:

- **`login()`**: Ahora acepta información del dispositivo y crea una nueva sesión en lugar de actualizar un token único
- **`refreshToken()`**: Utiliza el sistema de sesiones para validar y renovar tokens
- **`logout()`**: Desactiva todas las sesiones del usuario

#### Nuevos Métodos:

- **`createUserSession()`**: Crea una nueva sesión con tokens y información del dispositivo
- **`getActiveSessions()`**: Obtiene todas las sesiones activas de un usuario
- **`logoutSession()`**: Permite logout selectivo de sesiones específicas
- **`cleanupSessions()`**: Limpia sesiones expiradas e inactivas

### 5. Controlador Actualizado

**Archivo:** `src/modules/auth/auth.controller.ts`

#### Métodos Modificados:

- **`login()`**: Extrae información del dispositivo del request

#### Nuevos Endpoints:

- **`GET /api/auth/sessions`**: Obtener sesiones activas del usuario
- **`POST /api/auth/logout-session`**: Cerrar sesión específica o todas
- **`POST /api/auth/cleanup-sessions`**: Limpiar sesiones expiradas

### 6. Middleware de Autenticación Actualizado

**Archivo:** `src/middlewares/auth.middleware.ts`

- **`authMiddleware`**: Ahora valida sesiones usando el nuevo sistema
- **`refreshTokenMiddleware`**: Actualizado para trabajar con sesiones

Ambos middlewares ahora:
- Verifican que la sesión existe y está activa
- Validan fechas de expiración
- Actualizan automáticamente el timestamp de última actividad
- Desactivan sesiones expiradas automáticamente

### 7. Migración de Base de Datos

**Archivo:** `src/scripts/user_sessions_migration.sql`

Script SQL para crear la nueva tabla `user_sessions` con:
- Estructura completa de la tabla
- Índices para optimizar consultas
- Claves foráneas y restricciones
- Comentarios de documentación

### 8. Rutas Actualizadas

**Archivo:** `src/modules/auth/auth.routes.ts`

Se agregaron las nuevas rutas para gestión de sesiones:
- `GET /sessions`
- `POST /logout-session`
- `POST /cleanup-sessions`

## Funcionalidades del Sistema

### 1. Login Múltiple
- Los usuarios pueden iniciar sesión desde múltiples dispositivos
- Cada sesión tiene su propio par de tokens (access/refresh)
- Se almacena información del dispositivo para identificación

### 2. Gestión de Sesiones
- Visualizar todas las sesiones activas
- Cerrar sesiones específicas por ID
- Cerrar todas las sesiones (logout completo)
- Información detallada de cada sesión (dispositivo, IP, última actividad)

### 3. Seguridad Mejorada
- Tokens únicos por sesión
- Expiración automática de sesiones
- Límite configurable de sesiones por usuario (máximo 5)
- Limpieza automática de sesiones expiradas

### 4. Renovación de Tokens
- Cada sesión maneja su propia renovación de tokens
- Los refresh tokens son únicos por sesión
- Rotación de tokens para mayor seguridad

## Uso de la API

### Login con Información de Dispositivo

```json
POST /api/auth/login
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña",
  "deviceName": "iPhone de Juan",
  "deviceType": "mobile"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_jwt_token",
    "session_id": "uuid-session-id",
    "user": { /* datos del usuario */ }
  }
}
```

### Obtener Sesiones Activas

```json
GET /api/auth/sessions
Authorization: Bearer {access_token}
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "session-uuid",
      "deviceName": "iPhone de Juan",
      "deviceType": "mobile",
      "ipAddress": "192.168.1.100",
      "lastUsedAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T09:00:00Z",
      "isCurrent": true
    }
  ]
}
```

### Logout Selectivo

```json
POST /api/auth/logout-session
Authorization: Bearer {access_token}
{
  "sessionId": "uuid-to-close", // Opcional: sesión específica
  "logoutAll": false // true para cerrar todas las sesiones
}
```

## Migración desde el Sistema Anterior

1. **Ejecutar la migración SQL** para crear la tabla `user_sessions`
2. **Desplegar el código actualizado**
3. **Los usuarios existentes** deberán iniciar sesión nuevamente
4. **Opcional:** Eliminar el campo `session_token` de la tabla `users` después de confirmar que todo funciona correctamente

## Configuración

### Límites de Sesión

En `UserSessionRepository.limitUserSessions()`, el límite está configurado a 5 sesiones por usuario. Esto se puede ajustar según las necesidades.

### Limpieza Automática

Se recomienda configurar un cron job para ejecutar periódicamente:
```bash
POST /api/auth/cleanup-sessions
```

## Beneficios

1. **Experiencia de Usuario Mejorada**: Los usuarios pueden usar la aplicación desde múltiples dispositivos sin interrupciones
2. **Seguridad Mejorada**: Cada sesión es independiente y puede ser revocada individualmente
3. **Trazabilidad**: Información detallada de cada sesión para auditoría
4. **Escalabilidad**: Sistema preparado para manejar múltiples sesiones eficientemente
5. **Flexibilidad**: Logout selectivo y gestión granular de sesiones

## Consideraciones de Rendimiento

- Se agregaron índices en la tabla `user_sessions` para optimizar consultas
- La limpieza automática de sesiones expiradas mantiene la tabla optimizada
- El middleware actualiza el `last_used_at` de forma eficiente

## Próximos Pasos

1. Implementar notificaciones push cuando se detecten nuevas sesiones
2. Agregar geolocalización para mostrar ubicación aproximada de las sesiones
3. Implementar alertas de seguridad para sesiones sospechosas
4. Considerar implementar sesiones "recordarme" con mayor duración