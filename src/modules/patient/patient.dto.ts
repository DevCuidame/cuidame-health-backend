import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsNumber,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePatientDto {
  @IsOptional()
  @IsString({ message: 'El ID debe ser un número' })
  id?: number;

  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre!: string;

  @IsNotEmpty({ message: 'El apellido es requerido' })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  apellido!: string;

  @IsOptional()
  @IsString({ message: 'El código debe ser una cadena de texto' })
  code?: string;

  @IsNotEmpty({ message: 'El tipo de identificación es requerido' })
  @IsString({
    message: 'El tipo de identificación debe ser una cadena de texto',
  })
  tipoid!: string;

  @IsNotEmpty({ message: 'El número de identificación es requerido' })
  @IsString({
    message: 'El número de identificación debe ser una cadena de texto',
  })
  numeroid!: string;

  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  telefono!: string;

  @IsOptional()
  @IsISO8601(
    {},
    {
      message:
        'La fecha de nacimiento debe tener un formato válido (YYYY-MM-DD)',
    }
  )
  fecha_nacimiento?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El ID de la ciudad debe ser un número' })
  city_id?: number;

  @IsNotEmpty({ message: 'El género es requerido' })
  @IsString({ message: 'El género debe ser una cadena de texto' })
  genero!: string;

  @IsOptional()
  @IsString({ message: 'La ciudad debe ser una cadena de texto' })
  ciudad?: string;

  @IsOptional({ message: 'El departamento es requerido' })
  @IsString({ message: 'El departamento debe ser una cadena de texto' })
  departamento?: string;

  @IsNotEmpty({ message: 'La dirección es requerida' })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  direccion!: string;

  @IsOptional()
  @IsString({ message: 'El grupo sanguíneo (RH) debe ser una cadena de texto' })
  rh?: string;

  @IsOptional()
  @IsString({ message: 'La EPS debe ser una cadena de texto' })
  eps?: string;

  @IsOptional()
  @IsString({ message: 'La medicina prepagada debe ser una cadena de texto' })
  prepagada?: string;

  @IsOptional()
  @IsString({ message: 'La ARL debe ser una cadena de texto' })
  arl?: string;

  @IsOptional()
  @IsString({ message: 'El seguro funerario debe ser una cadena de texto' })
  seguro_funerario?: string;

  @IsNotEmpty({ message: 'El ID del cuidador a cargo es requerido' })
  @IsNumber({}, { message: 'El ID del cuidador a cargo debe ser un número' })
  @Type(() => Number)
  a_cargo_id!: number;

  @IsOptional()
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  image?: string;

  @IsOptional()
  @IsString({ message: 'El NIT debe ser una cadena de texto' })
  nit?: string;

  @IsOptional()
  @IsString({ message: 'La URL de la foto debe ser una cadena de texto' })
  photourl?: string;

  @IsOptional()
  @IsString({ message: 'La URL de la foto debe ser una cadena de texto' })
  public_name?: string;

  @IsOptional()
  imagebs64?: string | null;
}

export class UpdatePatientDto {
  @IsNotEmpty()
  @IsNumber({}, { message: 'El id debe ser un número' })
  id?: any;

  @IsOptional()
  @IsString({ message: 'El código debe ser una cadena de texto' })
  code?: string;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  apellido?: string;

  @IsOptional()
  @IsString({
    message: 'El tipo de identificación debe ser una cadena de texto',
  })
  tipoid?: string;

  @IsNotEmpty({ message: 'El número de identificación es requerido' })
  @IsString({
    message: 'El número de identificación debe ser una cadena de texto',
  })
  numeroid!: string;

  @IsOptional()
  @IsNumber({}, { message: 'El ID de la ciudad debe ser un número' })
  city_id?: number;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  telefono?: string;

  @IsOptional()
  @IsISO8601(
    {},
    {
      message:
        'La fecha de nacimiento debe tener un formato válido (YYYY-MM-DD)',
    }
  )
  fecha_nacimiento?: string;

  @IsOptional()
  @IsString({ message: 'El género debe ser una cadena de texto' })
  genero?: string;

  @IsOptional()
  @IsString({ message: 'La ciudad debe ser una cadena de texto' })
  ciudad?: string;

  @IsOptional()
  @IsString({ message: 'El departamento debe ser una cadena de texto' })
  departamento?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  direccion?: string;

  @IsOptional()
  @IsString({ message: 'El grupo sanguíneo (RH) debe ser una cadena de texto' })
  rh?: string;

  @IsOptional()
  @IsString({ message: 'La EPS debe ser una cadena de texto' })
  eps?: string;

  @IsOptional()
  @IsString({ message: 'La medicina prepagada debe ser una cadena de texto' })
  prepagada?: string;

  @IsOptional()
  @IsString({ message: 'La ARL debe ser una cadena de texto' })
  arl?: string;

  @IsOptional()
  @IsString({ message: 'El seguro funerario debe ser una cadena de texto' })
  seguro_funerario?: string;

  @IsOptional()
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  image?: string;

  @IsOptional()
  @IsString({ message: 'La URL de la foto debe ser una cadena de texto' })
  public_name?: string;

  @IsOptional()
  @IsString({ message: 'La URL de la foto debe ser una cadena de texto' })
  photourl?: string;

  @IsOptional()
  imagebs64?: string;
}
