-- Migración para crear la tabla user_sessions
-- Esta tabla reemplaza el campo session_token único por un sistema de múltiples sesiones

CREATE TABLE IF NOT EXISTS public.user_sessions
(
    id BIGSERIAL NOT NULL,
    user_id bigint NOT NULL,
    access_token text NOT NULL,
    refresh_token text NOT NULL,
    device_info text,
    device_name character varying(255),
    device_type character varying(100),
    ip_address character varying(45),
    user_agent text,
    expires_at timestamp(0) without time zone NOT NULL,
    refresh_expires_at timestamp(0) without time zone NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    last_used_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(0) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_sessions_pkey PRIMARY KEY (id),
    CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_access_token ON public.user_sessions(access_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON public.user_sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON public.user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_expires_at ON public.user_sessions(refresh_expires_at);

-- Comentarios para documentar la tabla
COMMENT ON TABLE public.user_sessions IS 'Tabla para gestionar múltiples sesiones de usuario por dispositivo';
COMMENT ON COLUMN public.user_sessions.id IS 'Identificador único de la sesión (auto-incremental)';
COMMENT ON COLUMN public.user_sessions.user_id IS 'ID del usuario propietario de la sesión';
COMMENT ON COLUMN public.user_sessions.access_token IS 'Token de acceso JWT';
COMMENT ON COLUMN public.user_sessions.refresh_token IS 'Token de renovación JWT';
COMMENT ON COLUMN public.user_sessions.device_info IS 'Información del dispositivo en formato JSON';
COMMENT ON COLUMN public.user_sessions.device_name IS 'Nombre del dispositivo (ej: iPhone de Juan)';
COMMENT ON COLUMN public.user_sessions.device_type IS 'Tipo de dispositivo (mobile, desktop, tablet)';
COMMENT ON COLUMN public.user_sessions.ip_address IS 'Dirección IP desde donde se inició la sesión';
COMMENT ON COLUMN public.user_sessions.user_agent IS 'User agent del navegador/aplicación';
COMMENT ON COLUMN public.user_sessions.expires_at IS 'Fecha de expiración del access token';
COMMENT ON COLUMN public.user_sessions.refresh_expires_at IS 'Fecha de expiración del refresh token';
COMMENT ON COLUMN public.user_sessions.is_active IS 'Indica si la sesión está activa';
COMMENT ON COLUMN public.user_sessions.last_used_at IS 'Última vez que se usó la sesión';
COMMENT ON COLUMN public.user_sessions.created_at IS 'Fecha de creación de la sesión';
COMMENT ON COLUMN public.user_sessions.updated_at IS 'Fecha de última actualización de la sesión';

-- Nota: El campo session_token en la tabla users puede ser eliminado en una migración posterior
-- una vez que se confirme que el nuevo sistema funciona correctamente
-- ALTER TABLE public.users DROP COLUMN session_token;