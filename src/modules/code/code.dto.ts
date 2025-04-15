import { IsNotEmpty, IsString } from 'class-validator';

export class BandAuthDto {
  @IsNotEmpty({ message: 'El código es requerido' })
  @IsString({ message: 'El código debe ser una cadena de texto' })
  code!: string;

  @IsNotEmpty({ message: 'El acuerdo es requerido' })
  @IsString({ message: 'El acuerdo debe ser una cadena de texto' })
  agreement!: string;

}