import { IsNotEmpty, IsOptional, IsNumber, IsISO8601, IsString, IsBoolean, IsDate, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMedicineDto {
  @IsNotEmpty({ message: 'El nombre del medicamento es requerido' })
  @IsString({ message: 'El nombre del medicamento debe ser una cadena de texto' })
  medicament_name!: string;

  @IsNotEmpty({ message: 'La fecha de orden es requerida' })
  @IsISO8601({}, { message: 'La fecha de orden debe tener un formato válido (YYYY-MM-DD)' })
  date_order!: string;

  @IsOptional()
  @IsString({ message: 'La duración debe ser una cadena de texto' })
  duration?: string;

  @IsOptional()
  @IsString({ message: 'La dosis debe ser una cadena de texto' })
  dose?: string;

  @IsOptional()
  @IsString({ message: 'La frecuencia debe ser una cadena de texto' })
  frequency?: string;

  @IsOptional()
  @IsString({ message: 'La cantidad debe ser una cadena de texto' })
  quantity?: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo autorizado debe ser un valor booleano' })
  authorized?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'El campo MIPRES debe ser un valor booleano' })
  mipres?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'El campo sustancias controladas debe ser un valor booleano' })
  controlled_substances?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'El campo autorización EPS debe ser un valor booleano' })
  eps_authorization?: boolean;

  @IsOptional()
  @IsString({ message: 'La farmacia debe ser una cadena de texto' })
  pharmacy?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'La fecha de autorización debe tener un formato válido (YYYY-MM-DD)' })
  date_auth?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'El estado de entrega debe ser una cadena de texto' })
  delivery_status?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'La fecha de entrega debe tener un formato válido (YYYY-MM-DD)' })
  delivery_date?: string;

  @IsOptional()
  @IsString({ message: 'Los comentarios deben ser una cadena de texto' })
  comments?: string;

  @IsNotEmpty({ message: 'El ID del paciente es requerido' })
  @IsNumber({}, { message: 'El ID del paciente debe ser un número' })
  @Type(() => Number)
  id_patient!: number;
}

export class UpdateMedicineDto {
  @IsOptional()
  @IsString({ message: 'El nombre del medicamento debe ser una cadena de texto' })
  medicament_name?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'La fecha de orden debe tener un formato válido (YYYY-MM-DD)' })
  date_order?: string;

  @IsOptional()
  @IsString({ message: 'La duración debe ser una cadena de texto' })
  duration?: string;

  @IsOptional()
  @IsString({ message: 'La dosis debe ser una cadena de texto' })
  dose?: string;

  @IsOptional()
  @IsString({ message: 'La frecuencia debe ser una cadena de texto' })
  frequency?: string;

  @IsOptional()
  @IsString({ message: 'La cantidad debe ser una cadena de texto' })
  quantity?: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo autorizado debe ser un valor booleano' })
  authorized?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'El campo MIPRES debe ser un valor booleano' })
  mipres?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'El campo sustancias controladas debe ser un valor booleano' })
  controlled_substances?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'El campo autorización EPS debe ser un valor booleano' })
  eps_authorization?: boolean;

  @IsOptional()
  @IsString({ message: 'La farmacia debe ser una cadena de texto' })
  pharmacy?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'La fecha de autorización debe tener un formato válido (YYYY-MM-DD)' })
  date_auth?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'El estado de entrega debe ser una cadena de texto' })
  delivery_status?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'La fecha de entrega debe tener un formato válido (YYYY-MM-DD)' })
  delivery_date?: string;

  @IsOptional()
  @IsString({ message: 'Los comentarios deben ser una cadena de texto' })
  comments?: string;
}

export class CreateFileMedicineDto {
  @IsNotEmpty({ message: 'El nombre del archivo es requerido' })
  @IsString({ message: 'El nombre del archivo debe ser una cadena de texto' })
  name!: string;

  @IsNotEmpty({ message: 'La ruta del archivo es requerida' })
  @IsString({ message: 'La ruta del archivo debe ser una cadena de texto' })
  path!: string;

  @IsNotEmpty({ message: 'La categoría del archivo es requerida' })
  @IsString({ message: 'La categoría del archivo debe ser una cadena de texto' })
  category!: string;

  @IsNotEmpty({ message: 'El ID de la orden es requerido' })
  @IsNumber({}, { message: 'El ID de la orden debe ser un número' })
  @Type(() => Number)
  id_order!: number;

  @IsOptional()
  @IsString({ message: 'El base64 debe ser una cadena de texto' })
  base64?: string;
}

export class UpdateFileMedicineDto {
  @IsOptional()
  @IsString({ message: 'El nombre del archivo debe ser una cadena de texto' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'La ruta del archivo debe ser una cadena de texto' })
  path?: string;

  @IsOptional()
  @IsString({ message: 'La categoría del archivo debe ser una cadena de texto' })
  category?: string;

  @IsOptional()
  @IsString({ message: 'El base64 debe ser una cadena de texto' })
  base64?: string;
}