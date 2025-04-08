import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ConditionDto {
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