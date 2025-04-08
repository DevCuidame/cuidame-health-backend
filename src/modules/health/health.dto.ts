import { IsNotEmpty, IsOptional, IsNumber, IsISO8601, IsString, Min, Max, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

// DTOs para signos vitales
export class CreateVitalDto {
  @IsNotEmpty({ message: 'El ID del paciente es requerido' })
  @IsNumber({}, { message: 'El ID del paciente debe ser un número' })
  @Type(() => Number)
  patient_id!: number;

  @IsNotEmpty({ message: 'La fecha es requerida' })
  @IsISO8601({}, { message: 'La fecha debe tener un formato válido (YYYY-MM-DD HH:MM:SS)' })
  date!: string;
}

export class CreateHeartRateDto extends CreateVitalDto {
  @IsNotEmpty({ message: 'La frecuencia cardíaca es requerida' })
  @IsNumber({}, { message: 'La frecuencia cardíaca debe ser un número' })
  @IsPositive({ message: 'La frecuencia cardíaca debe ser positiva' })
  @Min(30, { message: 'La frecuencia cardíaca mínima es 30 ppm' })
  @Max(220, { message: 'La frecuencia cardíaca máxima es 220 ppm' })
  @Type(() => Number)
  rate!: number;
}

export class CreateBloodPressureDto extends CreateVitalDto {
  @IsNotEmpty({ message: 'La presión sistólica es requerida' })
  @IsNumber({}, { message: 'La presión sistólica debe ser un número' })
  @IsPositive({ message: 'La presión sistólica debe ser positiva' })
  @Min(60, { message: 'La presión sistólica mínima es 60 mmHg' })
  @Max(250, { message: 'La presión sistólica máxima es 250 mmHg' })
  @Type(() => Number)
  systolic!: number;

  @IsNotEmpty({ message: 'La presión diastólica es requerida' })
  @IsNumber({}, { message: 'La presión diastólica debe ser un número' })
  @IsPositive({ message: 'La presión diastólica debe ser positiva' })
  @Min(40, { message: 'La presión diastólica mínima es 40 mmHg' })
  @Max(150, { message: 'La presión diastólica máxima es 150 mmHg' })
  @Type(() => Number)
  diastolic!: number;
}

export class CreateBloodGlucoseDto extends CreateVitalDto {
  @IsNotEmpty({ message: 'El nivel de glucosa es requerido' })
  @IsNumber({}, { message: 'El nivel de glucosa debe ser un número' })
  @IsPositive({ message: 'El nivel de glucosa debe ser positivo' })
  @Min(20, { message: 'El nivel de glucosa mínimo es 20 mg/dL' })
  @Max(600, { message: 'El nivel de glucosa máximo es 600 mg/dL' })
  @Type(() => Number)
  rate!: number;
}

export class CreateBloodOxygenDto extends CreateVitalDto {
  @IsNotEmpty({ message: 'El nivel de oxígeno es requerido' })
  @IsNumber({}, { message: 'El nivel de oxígeno debe ser un número' })
  @IsPositive({ message: 'El nivel de oxígeno debe ser positivo' })
  @Min(50, { message: 'El nivel de oxígeno mínimo es 50%' })
  @Max(100, { message: 'El nivel de oxígeno máximo es 100%' })
  @Type(() => Number)
  rate!: number;
}

export class CreateRespiratoryRateDto extends CreateVitalDto {
  @IsNotEmpty({ message: 'La frecuencia respiratoria es requerida' })
  @IsNumber({}, { message: 'La frecuencia respiratoria debe ser un número' })
  @IsPositive({ message: 'La frecuencia respiratoria debe ser positiva' })
  @Min(8, { message: 'La frecuencia respiratoria mínima es 8 respiraciones por minuto' })
  @Max(60, { message: 'La frecuencia respiratoria máxima es 60 respiraciones por minuto' })
  @Type(() => Number)
  rate!: number;
}

// DTOs para alergias
export class CreateAllergyDto {
  @IsNotEmpty({ message: 'El ID del paciente es requerido' })
  @IsNumber({}, { message: 'El ID del paciente debe ser un número' })
  @Type(() => Number)
  id_paciente!: number;

  @IsNotEmpty({ message: 'El tipo de alergia es requerido' })
  @IsString({ message: 'El tipo de alergia debe ser una cadena de texto' })
  tipo_alergia!: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;
}

export class UpdateAllergyDto {
  @IsOptional()
  @IsString({ message: 'El tipo de alergia debe ser una cadena de texto' })
  tipo_alergia?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;
}

// DTOs para condiciones médicas
export class CreateConditionDto {
  @IsNotEmpty({ message: 'El ID del paciente es requerido' })
  @IsNumber({}, { message: 'El ID del paciente debe ser un número' })
  @Type(() => Number)
  id_paciente!: number;

  @IsOptional()
  @IsString({ message: 'La discapacidad debe ser una cadena de texto' })
  discapacidad?: string;

  @IsOptional()
  @IsString({ message: 'El estado de embarazo debe ser una cadena de texto' })
  embarazada?: string;

  @IsOptional()
  @IsString({ message: 'La descripción de cicatrices debe ser una cadena de texto' })
  cicatrices_descripcion?: string;

  @IsOptional()
  @IsString({ message: 'La descripción de tatuajes debe ser una cadena de texto' })
  tatuajes_descripcion?: string;
}

export class UpdateConditionDto {
  @IsOptional()
  @IsString({ message: 'La discapacidad debe ser una cadena de texto' })
  discapacidad?: string;

  @IsOptional()
  @IsString({ message: 'El estado de embarazo debe ser una cadena de texto' })
  embarazada?: string;

  @IsOptional()
  @IsString({ message: 'La descripción de cicatrices debe ser una cadena de texto' })
  cicatrices_descripcion?: string;

  @IsOptional()
  @IsString({ message: 'La descripción de tatuajes debe ser una cadena de texto' })
  tatuajes_descripcion?: string;
}

// DTOs para antecedentes médicos
export class CreateBackgroundDto {
  @IsNotEmpty({ message: 'El ID del paciente es requerido' })
  @IsNumber({}, { message: 'El ID del paciente debe ser un número' })
  @Type(() => Number)
  id_paciente!: number;

  @IsNotEmpty({ message: 'El tipo de antecedente es requerido' })
  @IsString({ message: 'El tipo de antecedente debe ser una cadena de texto' })
  tipo_antecedente!: string;

  @IsOptional()
  @IsString({ message: 'La descripción del antecedente debe ser una cadena de texto' })
  descripcion_antecedente?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'La fecha del antecedente debe tener un formato válido (YYYY-MM-DD)' })
  fecha_antecedente?: string;
}

export class UpdateBackgroundDto {
  @IsOptional()
  @IsString({ message: 'El tipo de antecedente debe ser una cadena de texto' })
  tipo_antecedente?: string;

  @IsOptional()
  @IsString({ message: 'La descripción del antecedente debe ser una cadena de texto' })
  descripcion_antecedente?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'La fecha del antecedente debe tener un formato válido (YYYY-MM-DD)' })
  fecha_antecedente?: string;
}

// DTOs para antecedentes familiares
export class CreateFamilyBackgroundDto {
  @IsNotEmpty({ message: 'El ID del paciente es requerido' })
  @IsNumber({}, { message: 'El ID del paciente debe ser un número' })
  @Type(() => Number)
  id_paciente!: number;

  @IsNotEmpty({ message: 'El tipo de antecedente es requerido' })
  @IsString({ message: 'El tipo de antecedente debe ser una cadena de texto' })
  tipo_antecedente!: string;

  @IsNotEmpty({ message: 'El parentesco es requerido' })
  @IsString({ message: 'El parentesco debe ser una cadena de texto' })
  parentesco!: string;

  @IsOptional()
  @IsString({ message: 'La descripción del antecedente debe ser una cadena de texto' })
  descripcion_antecedente?: string;
}

export class UpdateFamilyBackgroundDto {
  @IsOptional()
  @IsString({ message: 'El tipo de antecedente debe ser una cadena de texto' })
  tipo_antecedente?: string;

  @IsOptional()
  @IsString({ message: 'El parentesco debe ser una cadena de texto' })
  parentesco?: string;

  @IsOptional()
  @IsString({ message: 'La descripción del antecedente debe ser una cadena de texto' })
  descripcion_antecedente?: string;
}

// DTOs para vacunas
export class CreateVaccineDto {
  @IsNotEmpty({ message: 'El ID del paciente es requerido' })
  @IsNumber({}, { message: 'El ID del paciente debe ser un número' })
  @Type(() => Number)
  id_paciente!: number;

  @IsNotEmpty({ message: 'El nombre de la vacuna es requerido' })
  @IsString({ message: 'El nombre de la vacuna debe ser una cadena de texto' })
  vacuna!: string;
}

export class UpdateVaccineDto {
  @IsOptional()
  @IsString({ message: 'El nombre de la vacuna debe ser una cadena de texto' })
  vacuna?: string;
}

export class CreateDiseaseDto {
  @IsNotEmpty({ message: 'El ID del paciente es requerido' })
  @IsNumber({}, { message: 'El ID del paciente debe ser un número' })
  @Type(() => Number)
  id_paciente!: number;

  @IsNotEmpty({ message: 'El nombre de la enfermedad es requerido' })
  @IsString({ message: 'El nombre de la enfermedad debe ser una cadena de texto' })
  enfermedad!: string;
}

export class UpdateDiseaseDto {
  @IsOptional()
  @IsString({ message: 'El nombre de la enfermedad debe ser una cadena de texto' })
  enfermedad?: string;
}