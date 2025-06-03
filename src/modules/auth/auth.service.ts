import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MailService } from 'src/mails/mail.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { PasswordRecoveryDto } from './dto/recovery-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    const frontendUrl = process.env.URL_FRONTEND;
    const activationUrl = `${frontendUrl}/auth/activate/${user.activation_token}`;

    await this.mailService.sendMail(
      user.email,
      'Activación de cuenta',
      'activation',
      {
        activationUrl,
      },
    );

    return 'Usuario registrado con éxito, por favor revisa tu correo para activar tu cuenta';
  }

  async activate(token: string) {
    await this.usersService.activateUser(token);
    return 'Cuenta activada con éxito';
  }

  async passwordRecovery(passwordRecoveryDto: PasswordRecoveryDto) {
    const token = await this.usersService.passwordRecovery(
      passwordRecoveryDto.email,
    );

    const frontendUrl = process.env.URL_FRONTEND;
    const resetPasswordUrl = `${frontendUrl}/auth/password-recovery/${token}`;

    await this.mailService.sendMail(
      passwordRecoveryDto.email,
      'Recuperación de contraseña',
      'reset-password',
      {
        resetPasswordUrl,
      },
    );

    return 'Por favor revisa tu correo para restablecer tu contraseña';
  }

  async passwordRecoveryToken(
    token: string,
    resetPasswordDto: ResetPasswordDto,
  ) {
    const { password, repeatPassword } = resetPasswordDto;

    if (password !== repeatPassword)
      throw new BadRequestException('Las contraseñas no coinciden');

    await this.usersService.passwordRecoveryToken(
      token,
      resetPasswordDto.password,
    );

    return 'Contraseña restablecida con éxito';
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findOneByEmail(email);

    if (!user)
      throw new UnauthorizedException('El usuario no se encuentra registrado');

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      throw new UnauthorizedException('La contraseña es incorrecta');

    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: process.env.JWT_ACCESS_EXPIRATION_MINUTES,
        secret: process.env.JWT_SECRET + user.user_secret,
      }),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: process.env.JWT_REFRESH_EXPIRATION_DAYS,
        secret: process.env.JWT_REFRESH_SECRET,
      }),
      email: user.email,
      user: user.name + user.lastname,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException('Acceso no autorizado');
    }
    const { sub } = this.jwtService.decode(refreshToken);
    const user = await this.usersService.findOne(sub);

    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.role,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION_MINUTES,
      secret: process.env.JWT_SECRET + user.user_secret,
    });

    return {
      access_token: token,
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.decode(token) as {
        sub: number;
        email: string;
        rol: string;
      };
      if (!decoded || !decoded.sub) {
        throw new UnauthorizedException(
          'Token inválido: no se pudo decodificar el ID de usuario.',
        );
      }

      const user = await this.usersService.findOne(decoded.sub);
      if (!user) {
        throw new UnauthorizedException(
          'Token inválido: usuario no encontrado.',
        );
      }

      const verified = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET + user.user_secret,
      });

      return verified;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(`Token inválido: ${error.message}`);
    }
  }
}
