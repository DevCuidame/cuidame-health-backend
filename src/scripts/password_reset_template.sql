-- Script para insertar la plantilla de restablecimiento de contraseña

-- Verificar si la plantilla ya existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE code = 'password_reset') THEN
        -- Insertar la plantilla si no existe
        INSERT INTO notification_templates (
            name, 
            code, 
            type, 
            subject, 
            body_template, 
            variables, 
            is_active, 
            created_at, 
            updated_at
        ) VALUES (
            'Restablecimiento de contraseña', 
            'password_reset', 
            'email', 
            'Restablecimiento de contraseña - Cuidame Health', 
            '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #4a90e2;">Restablecimiento de contraseña</h1>
                </div>
                <div style="margin-bottom: 30px;">
                    <p>Hola {{userName}},</p>
                    <p>Has solicitado restablecer tu contraseña en Cuidame Health. Para continuar con el proceso, haz clic en el siguiente botón:</p>
                </div>
                <div style="text-align: center; margin-bottom: 30px;">
                    <a href="{{resetUrl}}" style="background-color: #4a90e2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Restablecer contraseña</a>
                </div>
                <div style="margin-bottom: 20px;">
                    <p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
                    <p style="word-break: break-all; color: #4a90e2;">{{resetUrl}}</p>
                </div>
                <div style="margin-bottom: 20px;">
                    <p><strong>Importante:</strong> Este enlace expirará en {{expirationTime}}.</p>
                    <p>Si no solicitaste este cambio, puedes ignorar este correo. Tu cuenta sigue segura.</p>
                </div>
                <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 12px; color: #666;">
                    <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                    <p>© Cuidame Health. Todos los derechos reservados.</p>
                </div>
            </div>', 
            ARRAY['userName', 'resetUrl', 'expirationTime'], 
            true, 
            NOW(), 
            NOW()
        );
    END IF;
END
$$;