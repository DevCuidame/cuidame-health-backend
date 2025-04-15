import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString, Matches } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido' })
  email!: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;
}

export class RegisterDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name!: string;

  @IsNotEmpty({ message: 'El apellido es requerido' })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  lastname!: string;

  @IsNotEmpty({ message: 'El tipo de identificación es requerido' })
  @IsString({ message: 'El tipo de identificación debe ser una cadena de texto' })
  typeid!: string;

  @IsNotEmpty({ message: 'El número de identificación es requerido' })
  @IsString({ message: 'El número de identificación debe ser una cadena de texto' })
  numberid!: string;

  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @Matches(/^\d{7,15}$/, { message: 'El teléfono debe contener entre 7 y 15 dígitos numéricos' })
  phone!: string;

  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido' })
  email!: string;

  @IsOptional()
  @IsString({ message: 'El género debe ser una cadena de texto' })
  gender!: string;  

  @IsOptional()
  @IsString({ message: 'La fecha de nacimiento debe ser una cadena de texto' })
  birth_date!: string;  


  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

  @IsNotEmpty({ message: 'La ciudad es requerida' })
  city_id!: number;

  @IsNotEmpty({ message: 'La dirección es requerida' })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  address!: string;

  @IsOptional()
  @IsString({ message: 'El nombre público debe ser una cadena de texto' })
  pubname?: string;

  @IsOptional()
  imagebs64?: string;
}

export class ForgotPasswordDto {
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido' })
  email!: string;
}

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'El token es requerido' })
  @IsString({ message: 'El token debe ser una cadena de texto' })
  token!: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

  @IsNotEmpty({ message: 'La confirmación de contraseña es requerida' })
  @MinLength(6, { message: 'La confirmación de contraseña debe tener al menos 6 caracteres' })
  confirmPassword!: string;
}


export class RefreshTokenDto {
  @IsNotEmpty({ message: 'El refresh token es requerido' })
  @IsString({ message: 'El refresh token debe ser una cadena de texto' })
  refresh_token!: string;
}