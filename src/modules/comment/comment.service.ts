import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    try {
      const newComment = this.commentRepository.create(createCommentDto);
      const savedComment = await this.commentRepository.save(newComment);

      // Asumiendo que createCommentDto.postId existe o se puede obtener del savedComment
      // Necesitarás asegurarte de que el postId esté disponible aquí.
      // Si el Comment entity tiene una relación con Post, puedes acceder a savedComment.post.id
      this.notificationsGateway.sendPostUpdate(
        savedComment.post.id.toString(),
        {
          type: 'commentAdded',
          comment: savedComment,
          postId: savedComment.post.id,
        },
      );

      return savedComment;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear el comentario: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<Comment[]> {
    try {
      return await this.commentRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener los comentarios: ${error.message}`,
      );
    }
  }

  async findOne(id: number): Promise<Comment> {
    try {
      const comment = await this.commentRepository.findOne({ where: { id } });
      if (!comment) {
        throw new NotFoundException(`Comentario con ID ${id} no encontrado.`);
      }
      return comment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al obtener el comentario: ${error.message}`,
      );
    }
  }

  async update(
    id: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    try {
      const comment = await this.findOne(id); // Reutiliza findOne para verificar existencia
      Object.assign(comment, updateCommentDto);
      return await this.commentRepository.save(comment);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al actualizar el comentario: ${error.message}`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.commentRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Comentario con ID ${id} no encontrado.`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al eliminar el comentario: ${error.message}`,
      );
    }
  }
}
