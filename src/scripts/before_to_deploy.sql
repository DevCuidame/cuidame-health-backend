-- Eliminar la restricción existente
ALTER TABLE IF EXISTS public.blood_glucose DROP CONSTRAINT IF EXISTS fk_patient;

-- Agregar la nueva restricción con ON DELETE CASCADE
ALTER TABLE IF EXISTS public.blood_glucose
    ADD CONSTRAINT fk_patient FOREIGN KEY (patient_id)
    REFERENCES public.pacientes (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

    -- Eliminar la restricción existente
ALTER TABLE IF EXISTS public.blood_oxygen DROP CONSTRAINT IF EXISTS fk_patient;

-- Agregar la nueva restricción con ON DELETE CASCADE
ALTER TABLE IF EXISTS public.blood_oxygen
    ADD CONSTRAINT fk_patient FOREIGN KEY (patient_id)
    REFERENCES public.pacientes (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;



    -- Agregar restricción para tabla alergias
ALTER TABLE IF EXISTS public.alergias
    ADD CONSTRAINT fk_alergias_paciente FOREIGN KEY (id_paciente)
    REFERENCES public.pacientes (id)
    ON DELETE CASCADE;

-- Agregar restricción para tabla antecedentes_familiares
ALTER TABLE IF EXISTS public.antecedentes_familiares
    ADD CONSTRAINT fk_antecedentes_familiares_paciente FOREIGN KEY (id_paciente)
    REFERENCES public.pacientes (id)
    ON DELETE CASCADE;

-- Agregar restricción para tabla antecedentes
ALTER TABLE IF EXISTS public.antecedentes
    ADD CONSTRAINT fk_antecedentes_paciente FOREIGN KEY (id_paciente)
    REFERENCES public.pacientes (id)
    ON DELETE CASCADE;

-- Agregar restricción para tabla condicion
ALTER TABLE IF EXISTS public.condicion
    ADD CONSTRAINT fk_condicion_paciente FOREIGN KEY (id_paciente)
    REFERENCES public.pacientes (id)
    ON DELETE CASCADE;

-- Agregar restricción para tabla vacunas
ALTER TABLE IF EXISTS public.vacunas
    ADD CONSTRAINT fk_vacunas_paciente FOREIGN KEY (id_paciente)
    REFERENCES public.pacientes (id)
    ON DELETE CASCADE;

-- Agregar restricción para tabla enfermedades
ALTER TABLE IF EXISTS public.enfermedades
    ADD CONSTRAINT fk_enfermedades_paciente FOREIGN KEY (id_paciente)
    REFERENCES public.pacientes (id)
    ON DELETE CASCADE;