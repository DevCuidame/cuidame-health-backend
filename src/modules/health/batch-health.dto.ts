import { Type } from 'class-transformer';
import { IsArray, ValidateNested, IsNumber, IsString, IsOptional, IsISO8601 } from 'class-validator';

// DTO para múltiples vacunas
export class CreateVaccineItemDto {
  @IsString({ message: 'El nombre de la vacuna debe ser una cadena de texto' })
  vacuna!: string;
}

export class BatchVaccinesDto {
  @IsNumber({}, { message: 'El ID del paciente debe ser un número' })
  @Type(() => Number)
  id_paciente!: number;

  @IsArray({ message: 'Debe proporcionar un array de vacunas' })
  @ValidateNested({ each: true })
  @Type(() => CreateVaccineItemDto)
  vacunas!: CreateVaccineItemDto[];
}

// DTO para múltiples alergias
export class CreateAllergyItemDto {
  @IsString({ message: 'El tipo de alergia debe ser una cadena de texto' })
  tipo_alergia!: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;
}

export class BatchAllergiesDto {
  @IsNumber({}, { message: 'El ID del paciente debe ser un número' })
  @Type(() => Number)
  id_paciente!: number;

  @IsArray({ message: 'Debe proporcionar un array de alergias' })
  @ValidateNested({ each: true })
  @Type(() => CreateAllergyItemDto)
  alergias!: CreateAllergyItemDto[];
}

// DTO para múltiples antecedentes médicos
export class CreateBackgroundItemDto {
  @IsString({ message: 'El tipo de antecedente debe ser una cadena de texto' })
  tipo_antecedente!: string;

  @IsOptional()
  @IsString({ message: 'La descripción del antecedente debe ser una cadena de texto' })
  descripcion_antecedente?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'La fecha del antecedente debe tener un formato válido (YYYY-MM-DD)' })
  fecha_antecedente?: string;
}

export class BatchBackgroundsDto {
  @IsNumber({}, { message: 'El ID del paciente debe ser un número' })
  @Type(() => Number)
  id_paciente!: number;

  @IsArray({ message: 'Debe proporcionar un array de antecedentes' })
  @ValidateNested({ each: true })
  @Type(() => CreateBackgroundItemDto)
  antecedentes!: CreateBackgroundItemDto[];
}

// DTO para múltiples antecedentes familiares
export class CreateFamilyBackgroundItemDto {
  @IsString({ message: 'El tipo de antecedente debe ser una cadena de texto' })
  tipo_antecedente!: string;

  @IsString({ message: 'El parentesco debe ser una cadena de texto' })
  parentesco!: string;

  @IsOptional()
  @IsString({ message: 'La descripción del antecedente debe ser una cadena de texto' })
  descripcion_antecedente?: string;
}

export class BatchFamilyBackgroundsDto {
  @IsNumber({}, { message: 'El ID del paciente debe ser un número' })
  @Type(() => Number)
  id_paciente!: number;

  @IsArray({ message: 'Debe proporcionar un array de antecedentes familiares' })
  @ValidateNested({ each: true })
  @Type(() => CreateFamilyBackgroundItemDto)
  antecedentes_familiares!: CreateFamilyBackgroundItemDto[];
}