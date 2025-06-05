import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { Reaction } from './entities/reaction.entity';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { PostService } from '../post/post.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReactionService {
  constructor(
    @InjectRepository(Reaction)
    private readonly reactionRepository: Repository<Reaction>,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly userService: UsersService,
    private readonly postService: PostService,
  ) {}

  async create(createReactionDto: CreateReactionDto): Promise<Reaction> {
    const user = await this.userService.findOne(createReactionDto.userId);
    const post = await this.postService.findOne(createReactionDto.postId);
    try {
      const existingReaction = await this.reactionRepository.findOne({
        where: {
          user: { id: createReactionDto.userId },
          post: { id: createReactionDto.postId },
        },
      });

      if (existingReaction) {
        existingReaction.type = createReactionDto.type;
        return await this.reactionRepository.save(existingReaction);
      } else {
        const newReaction = this.reactionRepository.create({
          ...createReactionDto,
          user: user,
          post: post,
        });
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
      const reaction = await this.findOne(id);
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
