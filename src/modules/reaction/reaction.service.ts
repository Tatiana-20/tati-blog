import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  // ConflictException, // Eliminado si no se usa
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { Reaction } from './entities/reaction.entity';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class ReactionService {
  constructor(
    @InjectRepository(Reaction)
    private readonly reactionRepository: Repository<Reaction>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(createReactionDto: CreateReactionDto): Promise<Reaction> {
    try {
      // Verificar si ya existe una reacción del mismo usuario en el mismo post
      const existingReaction = await this.reactionRepository.findOne({
        // Cambiado a const
        where: {
          user: { id: createReactionDto.userId }, // Acceder al ID del usuario a través de la relación
          post: { id: createReactionDto.postId }, // Acceder al ID del post a través de la relación
        },
      });

      if (existingReaction) {
        // Si ya existe, actualizar la reacción existente
        existingReaction.type = createReactionDto.type;
        return await this.reactionRepository.save(existingReaction);
      } else {
        // Si no existe, crear una nueva reacción
        const newReaction = this.reactionRepository.create(createReactionDto);
        const savedReaction = await this.reactionRepository.save(newReaction);
        this.notificationsGateway.sendPostUpdate(
          savedReaction.post.id.toString(),
          {
            type: 'reactionAdded',
            reaction: savedReaction,
            postId: savedReaction.post.id,
          },
        );
        return savedReaction;
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear/actualizar la reacción: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<Reaction[]> {
    try {
      return await this.reactionRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener las reacciones: ${error.message}`,
      );
    }
  }

  async findOne(id: number): Promise<Reaction> {
    try {
      const reaction = await this.reactionRepository.findOne({ where: { id } });
      if (!reaction) {
        throw new NotFoundException(`Reacción con ID ${id} no encontrada.`);
      }
      return reaction;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al obtener la reacción: ${error.message}`,
      );
    }
  }

  async update(
    id: number,
    updateReactionDto: UpdateReactionDto,
  ): Promise<Reaction> {
    try {
      const reaction = await this.findOne(id); // Reutiliza findOne para verificar existencia
      Object.assign(reaction, updateReactionDto);
      return await this.reactionRepository.save(reaction);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al actualizar la reacción: ${error.message}`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.reactionRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Reacción con ID ${id} no encontrada.`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al eliminar la reacción: ${error.message}`,
      );
    }
  }
}
