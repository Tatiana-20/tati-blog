import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from 'src/common/enum/roles.enum';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Reactions')
@Controller('reactions') // Cambiado a 'reactions' para ser más RESTful
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @Post()
  @Auth(Role.USER) // Solo usuarios autenticados pueden crear reacciones
  @ApiBearerAuth() // Documenta que este endpoint requiere un token JWT
  @ApiOperation({ summary: 'Crear una nueva reacción a una publicación' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'La reacción ha sido creada/actualizada exitosamente.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos.',
  })
  async create(
    @Body() createReactionDto: CreateReactionDto,
    @GetUser() user: User,
  ) {
    return await this.reactionService.create({
      ...createReactionDto,
      userId: user.id, // Asigna el ID del usuario autenticado
    });
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las reacciones' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de reacciones obtenida exitosamente.',
  })
  async findAll() {
    return await this.reactionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una reacción por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reacción obtenida exitosamente.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reacción no encontrada.',
  })
  async findOne(@Param('id') id: string) {
    return await this.reactionService.findOne(+id);
  }

  @Patch(':id')
  @Auth(Role.USER) // Solo usuarios autenticados pueden actualizar sus reacciones
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una reacción existente' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reacción actualizada exitosamente.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reacción no encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado o no es el autor de la reacción.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateReactionDto: UpdateReactionDto,
    @GetUser() user: User,
  ) {
    const reaction = await this.reactionService.findOne(+id);
    if (reaction.user.id !== user.id && user.role !== Role.ADMIN) {
      // Corregido a reaction.user.id
      throw new HttpException(
        'No tienes permiso para actualizar esta reacción.',
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.reactionService.update(+id, updateReactionDto);
  }

  @Delete(':id')
  @Auth(Role.USER) // Solo el autor o un administrador pueden eliminar la reacción
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una reacción' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Reacción eliminada exitosamente.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reacción no encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tienes permisos para eliminar esta reacción.',
  })
  async remove(@Param('id') id: string, @GetUser() user: User) {
    const reaction = await this.reactionService.findOne(+id);
    if (reaction.user.id !== user.id && user.role !== Role.ADMIN) {
      // Corregido a reaction.user.id
      throw new HttpException(
        'No tienes permiso para eliminar esta reacción.',
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.reactionService.remove(+id);
  }
}
