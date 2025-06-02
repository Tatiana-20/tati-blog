import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { Role } from 'src/common/enum/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    let activation_token: string;
    do {
      activation_token = uuid();
    } while (
      await this.usersRepository.findOne({
        where: { activation_token },
      })
    );

    try {
      return await this.usersRepository.save({
        ...(await this.__PrepareAndValidateUserDto(createUserDto)),
        role: Role.USER,
        activation_token,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al crear el usuario ' + error,
      );
    }
  }

  async activateUser(activation_token: string) {
    const user = await this.usersRepository.findOneBy({ activation_token });
    if (!user) throw new NotFoundException('La url de activación no es válida');
    if (user && user.is_active)
      throw new BadRequestException('El usuario ya esta activo');
    try {
      await this.usersRepository.update(user.id, {
        is_active: true,
        activation_token: null,
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al activar el usuario');
    }
  }

  async findAll() {
    try {
      return await this.usersRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener los usuarios ' + error,
      );
    }
  }

  async findOne(id: number) {
    let user: User | null;
    try {
      user = await this.usersRepository.findOneBy({ id });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener el usuario' + error,
      );
    }
    if (!user) throw new NotFoundException(`El usuario con id ${id} no existe`);
    return user;
  }

  async findOneByEmail(email: string) {
    let user: User | null;
    try {
      user = await this.usersRepository.findOne({
        where: { email },
        select: [
          'id',
          'name',
          'lastname',
          'email',
          'role',
          'is_active',
          'createdAt',
          'updatedAt',
          'deletedAt',
          'password',
          'user_secret',
          'password_reset_token',
          'password_reset_token_expires_at',
          'activation_token',
        ],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener el usuario' + error,
      );
    }
    if (!user)
      throw new NotFoundException(
        `El usuario con email ${email} no se encuentra registrado`,
      );
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    try {
      await this.usersRepository.update(
        id,
        await this.__PrepareAndValidateUserDto(updateUserDto, id),
      );
      return await this.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al actualizar el usuario ' + error,
      );
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.usersRepository.softDelete(id);
    } catch (error) {
      throw new InternalServerErrorException('Error al eliminar el usuario');
    }
  }

  async passwordRecovery(email: string) {
    const user = await this.findOneByEmail(email);

    let password_reset_token: string;
    do {
      password_reset_token = uuid();
    } while (
      await this.usersRepository.findOne({
        where: { password_reset_token },
      })
    );

    const password_reset_token_expires_at = new Date(
      new Date().getTime() + 60 * 60 * 1000,
    );
    try {
      this.usersRepository.update(user.id, {
        password_reset_token,
        password_reset_token_expires_at,
      });
      return password_reset_token;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al generar el enlace de recuperación de contraseña ' + error,
      );
    }
  }

  async passwordRecoveryToken(token: string, password: string) {
    const user = await this.usersRepository.findOneBy({
      password_reset_token: token,
    });
    if (!user || (user && user.password_reset_token_expires_at < new Date()))
      throw new NotFoundException(`En enlace no es valido o ha expirado`);

    let user_secret: string;
    do {
      user_secret = uuid();
    } while (
      await this.usersRepository.findOne({
        where: { user_secret },
      })
    );

    try {
      await this.usersRepository.update(user.id, {
        user_secret,
        password: await bcrypt.hash(password, 15),
        password_reset_token: null,
        password_reset_token_expires_at: null,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al actualizar la contraseña ' + error,
      );
    }
  }

  private async __PrepareAndValidateUserDto(
    dto: CreateUserDto | UpdateUserDto,
    id?: number,
  ) {
    if (id) await this.findOne(id);

    const { email, password, ...rest } = dto;

    if (email) {
      const user = await this.usersRepository.findOneBy({ email });
      if (user)
        throw new NotFoundException(
          `Ya existe un usuario con el email ${email}`,
        );
    }

    let user_secret: string;
    do {
      user_secret = uuid();
    } while (
      await this.usersRepository.findOne({
        where: { user_secret },
      })
    );
    const encrypt_password = await bcrypt.hash(password, 15);
    return {
      ...rest,
      user_secret,
      password: encrypt_password,
      email,
    };
  }
}
