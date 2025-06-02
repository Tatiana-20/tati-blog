import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
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
  repeatPassword: string;
}
