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
