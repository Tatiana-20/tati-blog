import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'El campo "email" es obligatorio' })
  @IsString({ message: 'El campo "email" debe ser una cadena de texto' })
  @IsEmail({}, { message: 'El campo "email" debe ser un email válido' })
  @Transform(({ value }) => value.trim())
  email: string;

  @IsNotEmpty({ message: 'El campo "password" es obligatorio' })
  @IsString({ message: 'El campo "password" debe ser una cadena de texto' })
  @Transform(({ value }) => value.trim())
  password: string;
}
