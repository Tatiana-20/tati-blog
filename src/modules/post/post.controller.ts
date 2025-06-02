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
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from 'src/common/enum/roles.enum';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @Auth(Role.USER)
  @ApiOperation({ summary: 'Crear una nueva publicación' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'La publicación ha sido creada exitosamente.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos.',
  })
  async create(@Body() createPostDto: CreatePostDto, @GetUser() user: User) {
    return await this.postService.create({
      ...createPostDto,
      authorId: user.id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las publicaciones' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de publicaciones obtenida exitosamente.',
  })
  async findAll() {
    return await this.postService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una publicación por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Publicación obtenida exitosamente.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Publicación no encontrada.',
  })
  async findOne(@Param('id') id: number) {
    return await this.postService.findOne(id);
  }

  @Patch(':id')
  @Auth(Role.USER)
  @ApiOperation({ summary: 'Actualizar una publicación existente' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Publicación actualizada exitosamente.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Publicación no encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado o no es el autor de la publicación.',
  })
  async update(
    @Param('id') id: number,
    @Body() updatePostDto: UpdatePostDto,
    @GetUser() user: User,
  ) {
    const post = await this.postService.findOne(id);
    if (post.author.id !== user.id && user.role !== Role.ADMIN) {
      throw new HttpException(
        'No tienes permiso para actualizar esta publicación.',
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  @Auth(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar una publicación' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Publicación eliminada exitosamente.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Publicación no encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tienes permisos de administrador.',
  })
  async remove(@Param('id') id: number) {
    return await this.postService.remove(id);
  }
}
