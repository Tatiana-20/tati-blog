import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { PasswordRecoveryDto } from './dto/recovery-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';
// import { Auth } from './decorators/auth.decorator';
// import { Role } from 'src/common/enum/roles.enum';
import { CreateUserDto } from '../users/dto/create-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 200, description: 'Usuario registrado con éxito' })
  @ApiResponse({ status: 400, description: 'Error al registrar el usuario' })
  @ApiResponse({ status: 404, description: 'Invitación no encontrada' })
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @Get('activate/:token')
  @ApiOperation({ summary: 'Activar una cuenta' })
  @ApiResponse({ status: 200, description: 'Cuenta activada con éxito' })
  @ApiResponse({ status: 400, description: 'Error al activar la cuenta' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  async activate(@Param('token') token: string) {
    return await this.authService.activate(token);
  }

  @Post('password-recovery')
  @ApiOperation({ summary: 'Recuperar contraseña' })
  @ApiResponse({
    status: 200,
    description: 'Enlace de recuperación enviado con éxito',
  })
  @ApiResponse({
    status: 400,
    description: 'Error al enviar el enlace de recuperación',
  })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  async passwordRecovery(@Body() passwordRecoveryDto: PasswordRecoveryDto) {
    return await this.authService.passwordRecovery(passwordRecoveryDto);
  }

  @Post('password-recovery/:token')
  @ApiOperation({ summary: 'Recuperar contraseña' })
  @ApiResponse({ status: 200, description: 'Contraseña recuperada con éxito' })
  @ApiResponse({ status: 400, description: 'Error al recuperar la contraseña' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  async passwordRecoveryToken(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return await this.authService.passwordRecoveryToken(
      token,
      resetPasswordDto,
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Sesión iniciada con éxito' })
  @ApiResponse({ status: 400, description: 'Error al iniciar sesión' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Get('refresh-token/:token')
  @ApiOperation({ summary: 'Renovar token' })
  @ApiResponse({ status: 200, description: 'Token renovado con éxito' })
  @ApiResponse({ status: 400, description: 'Error al renovar el token' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  async refreshToken(@Param('token') token: string) {
    return await this.authService.refreshToken(token);
  }

  // @Get('profile')
  // //   @Auth()
  // async profile() {
  //   return 'Profile';
  // }
}
