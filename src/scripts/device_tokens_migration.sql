-- Crear tabla para tokens de dispositivos
CREATE TABLE IF NOT EXISTS device_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
    is_active BOOLEAN DEFAULT true,
    device_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_token ON device_tokens(token);
CREATE INDEX IF NOT EXISTS idx_device_tokens_active ON device_tokens(is_active);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_device_tokens_modtime
    BEFORE UPDATE ON device_tokens
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();