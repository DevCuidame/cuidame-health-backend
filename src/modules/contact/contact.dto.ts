import { IsNotEmpty, IsOptional, IsString, IsNumber, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContactDto {
  @IsOptional()
  @IsString({ message: 'El nombre del primer contacto debe ser una cadena de texto' })
  nombre1?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono del primer contacto debe ser una cadena de texto' })
  @Matches(/^\d{7,15}$/, { message: 'El teléfono debe contener entre 7 y 15 dígitos numéricos' })
  telefono1?: string;

  @IsOptional()
  @IsString({ message: 'El nombre del segundo contacto debe ser una cadena de texto' })
  nombre2?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono del segundo contacto debe ser una cadena de texto' })
  @Matches(/^\d{7,15}$/, { message: 'El teléfono debe contener entre 7 y 15 dígitos numéricos' })
  telefono2?: string;

  @IsOptional()
  @IsString({ message: 'El nombre del tercer contacto debe ser una cadena de texto' })
  nombre3?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono del tercer contacto debe ser una cadena de texto' })
  @Matches(/^\d{7,15}$/, { message: 'El teléfono debe contener entre 7 y 15 dígitos numéricos' })
  telefono3?: string;
}

export class UpdateContactDto extends CreateContactDto {
  @IsOptional()
  @IsNumber({}, { message: 'El ID del contacto debe ser un número' })
  @Type(() => Number)
  id?: number;
}