CREATE TABLE IF NOT EXISTS public.codes
(
    id bigint NOT NULL ,
    code character varying(100)  NOT NULL,
    hashcode character varying(100)  NOT NULL,
    license character varying(50)  NOT NULL,
    agreement character varying(50),
    created_at timestamp(0) without time zone NOT NULL,
    status character varying(20),
    CONSTRAINT codes_pkey PRIMARY KEY (id),
    CONSTRAINT codes_code_key UNIQUE (code),
    CONSTRAINT codes_hashcode_key UNIQUE (hashcode)
);


CREATE TABLE IF NOT EXISTS public.role
(
    id integer NOT NULL,
    name character varying(50)  NOT NULL,
    status boolean NOT NULL,
    CONSTRAINT role_pkey PRIMARY KEY (id)
);


CREATE TABLE IF NOT EXISTS public.users
(
    id bigint NOT NULL ,
    code character varying(100),
    hashcode character varying(200),
    name character varying(100)  NOT NULL,
    lastname character varying(100)  NOT NULL,
    typeperson character varying(100),
    typeid character varying(100)  NOT NULL,
    numberid character varying(80),
    address character varying(100),
    city_id bigint,
    phone character varying(80)  NOT NULL,
    email character varying(255)  NOT NULL,
    parentesco character varying(100),
    notificationid character varying(255),
    password character varying(255),
    session_token character varying(255),
    verificado boolean NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    pubname character varying(100),
    privname character varying(100),
    imagebs64 text,
    path character varying(255),
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_code_key UNIQUE (code),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_hashcode_key UNIQUE (hashcode),
    CONSTRAINT users_notificationid_key UNIQUE (notificationid)
);

CREATE TABLE IF NOT EXISTS public.townships
(
    id bigint NOT NULL,
    department_id bigint NOT NULL,
    code character varying(255)  NOT NULL,
    name character varying(255)  NOT NULL,
    CONSTRAINT townships_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.userrole
(
    id integer NOT NULL,
    user_id integer NOT NULL,
    role_id integer NOT NULL,
    CONSTRAINT userrole_pkey PRIMARY KEY (id)
);


CREATE TABLE IF NOT EXISTS public.contactos
(
    id bigint NOT NULL ,
    id_usuario bigint NOT NULL,
    nombre1 character varying(100),
    telefono1 character varying(50),
    nombre2 character varying(100),
    telefono2 character varying(50),
    nombre3 character varying(100),
    telefono3 character varying(50),
    created_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    CONSTRAINT contactos_pkey PRIMARY KEY (id)
);


--Cared Person

CREATE TABLE IF NOT EXISTS public.pacientes
(
    id bigint NOT NULL,
    code character varying(100)  NOT NULL,
    nombre character varying(255)  NOT NULL,
    apellido character varying(255)  NOT NULL,
    tipoid character varying(80)  NOT NULL,
    numeroid character varying(80)  NOT NULL,
    telefono character varying(30)  NOT NULL,
    fecha_nacimiento date,
    genero character varying(30)  NOT NULL,
    ciudad character varying(50)  NOT NULL,
    city_id bigint NOT NULL,
    departamento character varying(50)  NOT NULL,
    direccion character varying(255)  NOT NULL,
    rh character varying(35)  NOT NULL,
    eps character varying(50),
    prepagada character varying(50),
    arl character varying(50),
    seguro_funerario character varying(50),
    a_cargo_id bigint NOT NULL,
    image character varying(255),
    enterprise character varying(255),
    nit character varying(255),
    created_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    photourl character varying(255),
    imagebs64 text,
    CONSTRAINT pacientes_pkey PRIMARY KEY (id),
    CONSTRAINT pacientes_code_key UNIQUE (code)
);


CREATE TABLE IF NOT EXISTS public.alergias
(
    FOREIGN KEY (id_paciente) REFERENCES public.pacientes(id),
    id bigint NOT NULL ,
    id_paciente bigint NOT NULL,
    tipo_alergia character varying(100),
    descripcion character varying(1000),
    created_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    CONSTRAINT alergias_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.respiratory_rate
(
    id integer NOT NULL,
    patient_id integer NOT NULL,
    rate integer NOT NULL,
    date timestamp without time zone NOT NULL,
    created_at timestamp without time zone,
    CONSTRAINT respiratory_rate_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.blood_glucose
(
    id integer NOT NULL ,
    patient_id integer NOT NULL,
    rate integer NOT NULL,
    date timestamp without time zone NOT NULL,
    CONSTRAINT blood_glucose_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.blood_oxygen
(
    id integer NOT NULL ,
    patient_id integer NOT NULL,
    rate integer NOT NULL,
    date timestamp without time zone NOT NULL,
    CONSTRAINT blood_oxygen_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.blood_pressure
(
    id integer NOT NULL ,
    patient_id integer NOT NULL,
    systolic integer NOT NULL,
    diastolic integer NOT NULL,
    date timestamp without time zone NOT NULL,
    created_at timestamp without time zone,
    CONSTRAINT blood_pressure_pkey PRIMARY KEY (id)
);


CREATE TABLE IF NOT EXISTS public.condicion
(
    id bigint NOT NULL ,
    id_paciente bigint NOT NULL,
    discapacidad character varying(100),
    embarazada character varying(10),
    cicatrices_descripcion character varying(1000),
    tatuajes_descripcion character varying(1000),
    created_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    CONSTRAINT condicion_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.vacunas
(
    id bigint NOT NULL,
    id_paciente bigint NOT NULL,
    vacuna character varying(100),
    updated_at timestamp(0) without time zone NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    CONSTRAINT vacunas_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.enfermedades
(
    id bigint NOT NULL ,
    id_paciente bigint NOT NULL,
    enfermedad character varying(200),
    created_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    CONSTRAINT enfermedades_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.antecedentes_familiares
(
    FOREIGN KEY (id_paciente) REFERENCES public.pacientes(id),
    id bigint NOT NULL ,
    id_paciente bigint NOT NULL,
    tipo_antecedente character varying(50),
    parentesco character varying(100),
    descripcion_antecedente character varying(1000),
    created_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    CONSTRAINT antecedentes_familiares_pkey PRIMARY KEY (id)
);



CREATE TABLE IF NOT EXISTS public.antecedentes
(
    FOREIGN KEY (id_paciente) REFERENCES public.pacientes(id),
    id bigint NOT NULL ,
    id_paciente bigint NOT NULL,
    tipo_antecedente character varying(50),
    descripcion_antecedente character varying(1000),
    fecha_antecedente date,
    created_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    CONSTRAINT antecedentes_pkey PRIMARY KEY (id)
);


CREATE TABLE IF NOT EXISTS public.heart_rate
(
    id integer NOT NULL ,
    patient_id integer NOT NULL,
    rate integer NOT NULL,
    date timestamp without time zone NOT NULL,
    created_at timestamp without time zone,
    CONSTRAINT heart_rate_pkey PRIMARY KEY (id)
);


ALTER TABLE IF EXISTS public.blood_glucose
    ADD CONSTRAINT fk_patient FOREIGN KEY (patient_id)
    REFERENCES public.pacientes (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.blood_oxygen
    ADD CONSTRAINT fk_patient FOREIGN KEY (patient_id)
    REFERENCES public.pacientes (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.blood_pressure
    ADD CONSTRAINT blood_pressure_patient_id_fkey FOREIGN KEY (patient_id)
    REFERENCES public.pacientes (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_blood_pressure_patient_id
    ON public.blood_pressure(patient_id);

ALTER TABLE IF EXISTS public.heart_rate
    ADD CONSTRAINT heart_rate_patient_id_fkey FOREIGN KEY (patient_id)
    REFERENCES public.pacientes (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_heart_rate_patient_id
    ON public.heart_rate(patient_id);

ALTER TABLE IF EXISTS public.respiratory_rate
    ADD CONSTRAINT respiratory_rate_patient_id_fkey FOREIGN KEY (patient_id)
    REFERENCES public.pacientes (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_respiratory_rate_patient_id
    ON public.respiratory_rate(patient_id);


CREATE TABLE controlMedicines (
    id SERIAL PRIMARY KEY, -- Identificador único
    medicament_name VARCHAR(50) NOT NULL, -- Nombre del Medicamento
    date_order DATE NOT NULL, -- Fecha de la Orden
    duration VARCHAR(100), -- Duración
    dose VARCHAR(100), -- Dosis
    frequency VARCHAR(100), -- Frecuencia
    quantity VARCHAR(100), -- Cantidad
    authorized BOOLEAN DEFAULT FALSE, -- No autorizado
    mipres BOOLEAN DEFAULT FALSE, -- Checkbox Mipres
    controlled_substances BOOLEAN DEFAULT FALSE, -- Checkbox Estupefacientes
    eps_authorization BOOLEAN DEFAULT FALSE, -- Checkbox Autorización EPS
    pharmacy VARCHAR(100), -- Farmacia o institución
    date_auth DATE, -- Fecha Autorización
    phone VARCHAR(15), -- Teléfono
    address TEXT, -- Dirección
    description TEXT, -- ¿Por qué no se autorizó?
    delivery_status VARCHAR(50), -- Estado de la entrega
    delivery_date DATE, -- Fecha Entrega
    comments TEXT, -- Observaciones
    id_patient INT NOT NULL,

    FOREIGN KEY (id_patient) REFERENCES pacientes(id) ON DELETE CASCADE
);

CREATE TABLE filemedicine (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,           -- Nombre de la imagen
    path TEXT NOT NULL,                   -- Ruta de almacenamiento
    category VARCHAR(50) NOT NULL,            -- Nombre de la imagen
	id_order INT NOT NULL,                -- ID de la orden de medicamentos
    created_at TIMESTAMP DEFAULT NOW(),   -- Fecha de creación

    FOREIGN KEY (id_order) REFERENCES controlMedicines(id) ON DELETE CASCADE
);

ALTER TABLE	imagesmedicine ADD COLUMN base64 TEXT DEFAULT '';


CREATE TABLE medicine_changes_history (
    id SERIAL PRIMARY KEY,               -- Identificador único
    table_name VARCHAR(50) NOT NULL,     -- Nombre de la tabla afectada
    record_id INT NOT NULL,              -- ID del registro afectado
    change_type VARCHAR(10) NOT NULL,    -- Tipo de cambio (INSERT, UPDATE, DELETE)
    changed_at TIMESTAMP DEFAULT NOW(),  -- Fecha y hora del cambio
    user_name VARCHAR(100),              -- Usuario que realizó el cambio (opcional)
    old_data JSONB,                      -- Datos anteriores (para UPDATE/DELETE)
    new_data JSONB                       -- Datos nuevos (para INSERT/UPDATE)
);




-- TRIGGER

CREATE OR REPLACE FUNCTION log_control_medicines_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO medicine_changes_history (table_name, record_id, change_type, changed_at, old_data)
        VALUES ('controlMedicines', OLD.id, 'DELETE', NOW(), ROW_TO_JSON(OLD));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO medicine_changes_history (table_name, record_id, change_type, changed_at, old_data, new_data)
        VALUES ('controlMedicines', OLD.id, 'UPDATE', NOW(), ROW_TO_JSON(OLD), ROW_TO_JSON(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO medicine_changes_history (table_name, record_id, change_type, changed_at, new_data)
        VALUES ('controlMedicines', NEW.id, 'INSERT', NOW(), ROW_TO_JSON(NEW));
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_control_medicines_changes
AFTER INSERT OR UPDATE OR DELETE ON controlMedicines
FOR EACH ROW EXECUTE FUNCTION log_control_medicines_changes();




---

--Agregar campos a user, pacientes y modificar not null


-- Create chat_sessions table
CREATE TABLE chat_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    patient_id INTEGER,
    document_number VARCHAR(20),
    current_step VARCHAR(50) NOT NULL DEFAULT 'validateDocument',
    chat_data JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    appointment_id INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_interaction_at TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES pacientes(id)
);

-- Create an index on session_id for faster lookups
CREATE INDEX idx_chat_sessions_session_id ON chat_sessions(session_id);

-- Create an index on patient_id for faster lookups
CREATE INDEX idx_chat_sessions_patient_id ON chat_sessions(patient_id);

-- Create chat_messages table
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
    message_content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE
);

-- Create an index on session_id for faster lookups
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);

-- Create an index on created_at for faster sorting
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- Create enum types for ChatStepType
CREATE TYPE chat_step_type AS ENUM (
    'validateDocument',
    'selectCity',
    'selectSpecialty',
    'selectProfessional',
    'selectDate',
    'selectTime',
    'confirmAppointment',
    'completed'
);

-- Create enum types for ChatSessionStatus
CREATE TYPE chat_session_status AS ENUM (
    'active',
    'completed',
    'abandoned'
);

-- Alter chat_sessions table to use the enum types
-- Step 1: Drop the default values for both columns
ALTER TABLE chat_sessions 
    ALTER COLUMN current_step DROP DEFAULT,
    ALTER COLUMN status DROP DEFAULT;

-- Step 2: Change the column types
ALTER TABLE chat_sessions 
    ALTER COLUMN current_step TYPE chat_step_type USING current_step::chat_step_type,
    ALTER COLUMN status TYPE chat_session_status USING status::chat_session_status;

-- Step 3: Set the default values again using the enum types
ALTER TABLE chat_sessions 
    ALTER COLUMN current_step SET DEFAULT 'validateDocument'::chat_step_type,
    ALTER COLUMN status SET DEFAULT 'active'::chat_session_status;


-- Alter chat_messages table to use enum type
CREATE TYPE message_direction AS ENUM ('incoming', 'outgoing');

ALTER TABLE chat_messages
    ALTER COLUMN direction TYPE message_direction USING direction::message_direction;

-- Tabla de profesionales de salud
CREATE TABLE IF NOT EXISTS health_professionals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    bio TEXT,
    consultation_fee NUMERIC(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    default_appointment_duration INTEGER DEFAULT 30,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de tipos de cita
CREATE TABLE IF NOT EXISTS appointment_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    default_duration INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    color_code VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de citas
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    professional_id INTEGER NULL,
    appointment_type_id INTEGER NULL,
    recurring_appointment_id INTEGER, 
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    status VARCHAR(20) DEFAULT 'requested',
    notes TEXT,
    cancellation_reason TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    modified_by_id INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (patient_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (professional_id) REFERENCES health_professionals(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_type_id) REFERENCES appointment_types(id) ON DELETE CASCADE
);

-- Tabla de disponibilidad
CREATE TABLE IF NOT EXISTS availabilities (
    id SERIAL PRIMARY KEY,
    professional_id INTEGER NOT NULL,
    day_of_week VARCHAR(10) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (professional_id) REFERENCES health_professionals(id) ON DELETE CASCADE
);

-- Tabla de bloqueos de tiempo
CREATE TABLE IF NOT EXISTS time_blocks (
    id SERIAL PRIMARY KEY,
    professional_id INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    reason VARCHAR(255) NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (professional_id) REFERENCES health_professionals(id) ON DELETE CASCADE
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    appointment_id INTEGER,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_professional ON appointments(professional_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_dates ON appointments(start_time, end_time);
CREATE INDEX idx_availabilities_professional ON availabilities(professional_id);
CREATE INDEX idx_time_blocks_professional ON time_blocks(professional_id);
CREATE INDEX idx_time_blocks_dates ON time_blocks(start_time, end_time);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);



-- Create table for appointment history
CREATE TABLE IF NOT EXISTS appointment_history (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER NOT NULL,
  change_type VARCHAR(20) NOT NULL, -- 'create', 'update', 'cancel', 'reschedule', 'status_change'
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  previous_start_time TIMESTAMP,
  new_start_time TIMESTAMP,
  previous_end_time TIMESTAMP,
  new_end_time TIMESTAMP,
  reason TEXT,
  user_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_appointment_history_appointment
    FOREIGN KEY (appointment_id)
    REFERENCES appointments(id)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_appointment_history_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE SET NULL
);

-- Create index for faster queries
CREATE INDEX idx_appointment_history_appointment_id ON appointment_history(appointment_id);
CREATE INDEX idx_appointment_history_user_id ON appointment_history(user_id);
CREATE INDEX idx_appointment_history_change_type ON appointment_history(change_type);
CREATE INDEX idx_appointment_history_created_at ON appointment_history(created_at);

-- Add column for related appointments (like previous appointment in a reschedule)
ALTER TABLE appointment_history ADD COLUMN IF NOT EXISTS related_appointment_id INTEGER;
ALTER TABLE appointment_history 
  ADD CONSTRAINT fk_appointment_history_related_appointment
  FOREIGN KEY (related_appointment_id)
  REFERENCES appointments(id)
  ON DELETE SET NULL;

-- Create index for the related appointment
CREATE INDEX idx_appointment_history_related_appointment_id ON appointment_history(related_appointment_id);

-- Add a comment to describe the table
COMMENT ON TABLE appointment_history IS 'Tracks all changes to appointments, including creations, cancellations, and rescheduling';




-- Migration: Fase 5 - Sistema de Notificaciones Avanzado
-- Fecha: 29/04/2025

-- Actualizar tipos de notificaciones
-- (Esta modificación requiere una comprobación previa, ya que el enumerado ya existe)

-- First, create the NotificationType enum
CREATE TYPE NotificationType AS ENUM (
    'appointment_confirmed',
    'appointment_reminder',
    'appointment_cancelled',
    'appointment_rescheduled',
    'appointment_summary',
    'system_alert',
    'payment_confirmation',
    'payment_due',
    'system_maintenance',
    'survey_invitation'
);

DO $$
BEGIN
    -- Verificar si se necesita actualizar el tipo enum
    IF EXISTS (
        SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE t.typname = 'notificationtype' AND n.nspname = 'public'
    ) THEN
        -- Actualizar el tipo enum solo si no contiene todos los nuevos valores
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum WHERE enumtypid = (
                SELECT oid FROM pg_type WHERE typname = 'notificationtype'
            ) AND enumlabel = 'appointment_summary'
        ) THEN
            -- Agregar los nuevos tipos de notificación
            ALTER TYPE NotificationType ADD VALUE IF NOT EXISTS 'appointment_summary';
            ALTER TYPE NotificationType ADD VALUE IF NOT EXISTS 'system_alert';
            ALTER TYPE NotificationType ADD VALUE IF NOT EXISTS 'payment_confirmation';
            ALTER TYPE NotificationType ADD VALUE IF NOT EXISTS 'payment_due';
            ALTER TYPE NotificationType ADD VALUE IF NOT EXISTS 'system_maintenance';
            ALTER TYPE NotificationType ADD VALUE IF NOT EXISTS 'survey_invitation';
        END IF;
    END IF;
END
$$;

-- Crear tabla de plantillas de notificación
CREATE TABLE IF NOT EXISTS notification_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    type NotificationType NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body_template TEXT NOT NULL,
    variables JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Crear tabla de preferencias de notificación
CREATE TABLE IF NOT EXISTS notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type NotificationType NOT NULL,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    inapp_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, notification_type)
);

-- Crear tabla de cola de notificaciones
CREATE TABLE IF NOT EXISTS notification_queue (
    id SERIAL PRIMARY KEY,
    notification_id INTEGER NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    delivery_type VARCHAR(20) NOT NULL CHECK (delivery_type IN ('email', 'push', 'inapp')),
    payload JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    retries INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    next_retry TIMESTAMP,
    error TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_notification_id ON notification_queue(notification_id);

-- Crear tabla de registro de entregas de notificaciones
CREATE TABLE IF NOT EXISTS notification_delivery_logs (
    id SERIAL PRIMARY KEY,
    notification_id INTEGER NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    delivery_type VARCHAR(20) NOT NULL CHECK (delivery_type IN ('email', 'push', 'inapp')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failure')),
    details TEXT,
    recipient VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_notification_id ON notification_delivery_logs(notification_id);

-- Insertar algunas plantillas predeterminadas
INSERT INTO notification_templates (name, code, type, subject, body_template, variables, is_active)
VALUES
    ('Confirmación de Cita', 'appointment_confirmation', 'appointment_confirmed', 
     'Confirmación de su cita médica', 
     '<p>Estimado/a {{patientName}},</p>
      <p>Su cita ha sido confirmada para el <strong>{{appointmentDate}}</strong> a las <strong>{{appointmentTime}}</strong> con el profesional <strong>{{professionalName}}</strong>.</p>
      <p>Tipo de cita: {{appointmentType}}</p>
      <p>Si necesita cancelar o reprogramar su cita, por favor hágalo con al menos 24 horas de anticipación.</p>
      <p>Gracias por confiar en nosotros.</p>',
     '["patientName", "appointmentDate", "appointmentTime", "professionalName", "appointmentType"]',
     TRUE),
     
    ('Recordatorio de Cita', 'appointment_reminder', 'appointment_reminder', 
     'Recordatorio de su cita médica', 
     '<p>Estimado/a {{patientName}},</p>
      <p>Le recordamos que tiene una cita programada para <strong>mañana {{appointmentDate}}</strong> a las <strong>{{appointmentTime}}</strong> con el profesional <strong>{{professionalName}}</strong>.</p>
      <p>Tipo de cita: {{appointmentType}}</p>
      <p>Por favor, llegue con 15 minutos de anticipación.</p>
      <p>Gracias por confiar en nosotros.</p>',
     '["patientName", "appointmentDate", "appointmentTime", "professionalName", "appointmentType"]',
     TRUE),
     
    ('Cancelación de Cita', 'appointment_cancellation', 'appointment_cancelled', 
     'Cancelación de su cita médica', 
     '<p>Estimado/a {{patientName}},</p>
      <p>Lamentamos informarle que su cita programada para el <strong>{{appointmentDate}}</strong> a las <strong>{{appointmentTime}}</strong> con el profesional <strong>{{professionalName}}</strong> ha sido cancelada.</p>
      <p>Motivo: {{cancellationReason}}</p>
      <p>Por favor, contacte con nosotros para reprogramar su cita.</p>
      <p>Lamentamos las molestias ocasionadas.</p>',
     '["patientName", "appointmentDate", "appointmentTime", "professionalName", "cancellationReason"]',
     TRUE),
     
    ('Reprogramación de Cita', 'appointment_rescheduled', 'appointment_rescheduled', 
     'Reprogramación de su cita médica', 
     '<p>Estimado/a {{patientName}},</p>
      <p>Su cita ha sido reprogramada.</p>
      <p><strong>Fecha/hora anterior:</strong> {{previousDate}} a las {{previousTime}}</p>
      <p><strong>Nueva fecha/hora:</strong> {{newDate}} a las {{newTime}}</p>
      <p><strong>Profesional:</strong> {{professionalName}}</p>
      <p><strong>Tipo de cita:</strong> {{appointmentType}}</p>
      <p>Si esta nueva fecha no le conviene, por favor contáctenos para encontrar una alternativa.</p>
      <p>Gracias por su comprensión.</p>',
     '["patientName", "previousDate", "previousTime", "newDate", "newTime", "professionalName", "appointmentType"]',
     TRUE),
     
    ('Resumen Semanal', 'weekly_summary', 'appointment_summary', 
     'Resumen semanal de sus citas', 
     '<p>Estimado/a {{professionalName}},</p>
      <p>Aquí está el resumen de sus citas para la próxima semana:</p>
      <div>{{appointmentsList}}</div>
      <p>Puede ver más detalles en su panel de control.</p>',
     '["professionalName", "appointmentsList"]',
     TRUE);

-- Inicializar preferencias para usuarios existentes
INSERT INTO notification_preferences (user_id, notification_type, email_enabled, push_enabled, inapp_enabled)
SELECT u.id, t.type, TRUE, TRUE, TRUE
FROM users u CROSS JOIN (
    SELECT unnest(enum_range(NULL::NotificationType)) AS type
) t
WHERE NOT EXISTS (
    SELECT 1 FROM notification_preferences np
    WHERE np.user_id = u.id AND np.notification_type = t.type
);

-- Actualizar la tabla de notificaciones para nuevos campos
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS template_id INTEGER REFERENCES notification_templates(id) ON DELETE SET NULL;

-- Crear una función para limpiar automáticamente notificaciones y logs antiguos
CREATE OR REPLACE FUNCTION clean_old_notifications()
RETURNS integer AS $$
DECLARE
    deleted_count integer;
BEGIN
    -- Eliminar registros de más de 90 días (personalizable)
    WITH deleted AS (
        DELETE FROM notifications
        WHERE status = 'read' AND read_at < NOW() - INTERVAL '90 days'
        RETURNING id
    )
    SELECT count(*) INTO deleted_count FROM deleted;
    
    -- Eliminar elementos de cola completados antiguos
    DELETE FROM notification_queue
    WHERE status = 'completed' AND updated_at < NOW() - INTERVAL '30 days';
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Agregar índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_status ON notifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for ON notifications(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Crear una vista para notificaciones con estadísticas de entrega
CREATE OR REPLACE VIEW notification_delivery_stats AS
SELECT 
    n.id,
    n.user_id,
    n.type,
    n.title,
    n.created_at,
    n.sent_at,
    n.status,
    COUNT(DISTINCT CASE WHEN nq.delivery_type = 'email' AND nq.status = 'completed' THEN nq.id END) AS email_sent,
    COUNT(DISTINCT CASE WHEN nq.delivery_type = 'push' AND nq.status = 'completed' THEN nq.id END) AS push_sent,
    COUNT(DISTINCT CASE WHEN nq.delivery_type = 'inapp' AND nq.status = 'completed' THEN nq.id END) AS inapp_sent,
    COUNT(DISTINCT CASE WHEN ndl.status = 'failure' THEN ndl.id END) AS delivery_failures
FROM 
    notifications n
LEFT JOIN 
    notification_queue nq ON n.id = nq.notification_id
LEFT JOIN 
    notification_delivery_logs ndl ON n.id = ndl.notification_id
GROUP BY 
    n.id, n.user_id, n.type, n.title, n.created_at, n.sent_at, n.status;

-- Agregar trigger para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar el trigger a las tablas relevantes
DROP TRIGGER IF EXISTS update_notification_templates_modtime ON notification_templates;
CREATE TRIGGER update_notification_templates_modtime
BEFORE UPDATE ON notification_templates
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_notification_preferences_modtime ON notification_preferences;
CREATE TRIGGER update_notification_preferences_modtime
BEFORE UPDATE ON notification_preferences
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_notification_queue_modtime ON notification_queue;
CREATE TRIGGER update_notification_queue_modtime
BEFORE UPDATE ON notification_queue
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Comentarios sobre la migración
COMMENT ON TABLE notification_templates IS 'Almacena plantillas de notificación para distintos tipos de mensajes';
COMMENT ON TABLE notification_preferences IS 'Almacena preferencias de notificación por usuario y tipo';
COMMENT ON TABLE notification_queue IS 'Cola de procesamiento para envío asíncrono de notificaciones';
COMMENT ON TABLE notification_delivery_logs IS 'Registro de entregas de notificaciones para auditoría y estadísticas';
COMMENT ON FUNCTION clean_old_notifications() IS 'Función de mantenimiento para eliminar notificaciones antiguas';
COMMENT ON VIEW notification_delivery_stats IS 'Vista para estadísticas de entrega de notificaciones';


-- Actualizar el tipo enum en PostgreSQL
ALTER TYPE chat_step_type ADD VALUE 'selectAppointmentType' AFTER 'selectSpecialty';