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
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
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

@ApiTags('Comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @Auth([Role.ADMIN, Role.USER])
  @ApiOperation({ summary: 'Crear un nuevo comentario en una publicación' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'El comentario ha sido creado exitosamente.',
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
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: User,
  ) {
    return await this.commentService.create({
      ...createCommentDto,
      userId: user.id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los comentarios' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de comentarios obtenida exitosamente.',
  })
  async findAll() {
    return await this.commentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un comentario por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comentario obtenido exitosamente.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Comentario no encontrado.',
  })
  async findOne(@Param('id') id: string) {
    return await this.commentService.findOne(+id);
  }

  @Patch(':id')
  @Auth([Role.USER, Role.ADMIN])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un comentario existente' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comentario actualizado exitosamente.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Comentario no encontrado.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado o no es el autor del comentario.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser() user: User,
  ) {
    const comment = await this.commentService.findOne(+id);
    if (comment.user.id !== user.id && user.role !== Role.ADMIN) {
      throw new HttpException(
        'No tienes permiso para actualizar este comentario.',
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.commentService.update(+id, updateCommentDto);
  }

  @Delete(':id')
  @Auth([Role.USER, Role.ADMIN])
  @ApiOperation({ summary: 'Eliminar un comentario' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Comentario eliminado exitosamente.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Comentario no encontrado.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tienes permisos para eliminar este comentario.',
  })
  async remove(@Param('id') id: string, @GetUser() user: User) {
    const comment = await this.commentService.findOne(+id);
    if (comment.user.id !== user.id && user.role !== Role.ADMIN) {
      throw new HttpException(
        'No tienes permiso para eliminar este comentario.',
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.commentService.remove(+id);
  }
}
