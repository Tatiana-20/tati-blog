import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class PasswordRecoveryDto {
  @IsNotEmpty({ message: 'El campo "email" es obligatorio' })
  @IsString({ message: 'El campo "email" debe ser una cadena de texto' })
  @IsEmail({}, { message: 'El campo "email" debe ser un email valido' })
  @Transform(({ value }) => value.trim())
  email: string;
}
