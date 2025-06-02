import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'El campo "nombre" es obligatorio' })
  @IsString({ message: 'El campo "nombre" debe ser una cadena de texto' })
  @MaxLength(50, {
    message: 'El campo "nombre" debe tener máximo 50 caracteres',
  })
  name: string;

  @IsNotEmpty({ message: 'El campo "apellido" es obligatorio' })
  @IsString({ message: 'El campo "apellido" debe ser una cadena de texto' })
  @MaxLength(50, {
    message: 'El campo "apellido" debe tener máximo 50 caracteres',
  })
  lastname: string;

  @IsNotEmpty({ message: 'El campo "email" es obligatorio' })
  @IsString({ message: 'El campo "email" debe ser una cadena de texto' })
  @IsEmail({}, { message: 'El campo "email" debe ser un email válido' })
  @MaxLength(50, {
    message: 'El campo "email" debe tener máximo 50 caracteres',
  })
  email: string;

  @IsNotEmpty({ message: 'El campo "contraseña" es obligatorio' })
  @IsString({ message: 'El campo "contraseña" debe ser una cadena de texto' })
  @Transform(({ value }) => value.trim())
  @MinLength(8, {
    message: 'El campo "contraseña" debe tener al menos 8 caracteres',
  })
  @MaxLength(18, {
    message: 'El campo "contraseña" debe tener máximo 18 caracteres',
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'La contraseña debe contener al menos una letra minúscula',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'La contraseña debe contener al menos una letra mayúscula',
  })
  @Matches(/(?=.*\d)/, {
    message: 'La contraseña debe contener al menos un número',
  })
  @Matches(/(?=.*[.,!@#$%^&*()_+\-=[\]{};':"\\|<>/?])/, {
    message:
      'La contraseña debe contener al menos un carácter especial (como .,!@# etc.)',
  })
  password: string;
}
