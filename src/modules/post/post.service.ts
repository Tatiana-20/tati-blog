import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import slugify from 'slugify';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { PostStatus } from 'src/common/enum/post-status';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly userService: UsersService,
  ) {}

  private async __prepareAndValidateDto(
    dto: CreatePostDto | UpdatePostDto,
    id?: number,
  ): Promise<Partial<Post>> {
    const author = await this.userService.findOne(dto.authorId);
    const postData: Partial<Post> = { ...dto, author };

    if (dto.title) {
      postData.slug = slugify(dto.title, { lower: true, strict: true });

      let uniqueSlug = postData.slug;
      let counter = 1;
      while (true) {
        const existingPost = await this.postRepository.findOne({
          where: { slug: uniqueSlug },
        });
        if (!existingPost || (id && existingPost.id === id)) {
          break;
        }
        uniqueSlug = `${postData.slug}-${counter++}`;
      }
      postData.slug = uniqueSlug;
    }

    return postData;
  }

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const postData = await this.__prepareAndValidateDto(createPostDto);
    const newPost = this.postRepository.create({
      ...postData,
      status: PostStatus.PUBLISHED,
    });
    console.log(newPost);
    try {
      const savedPost = await this.postRepository.save(newPost);
      this.notificationsGateway.sendNewPostNotification();
      return savedPost;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear la publicación: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<Post[]> {
    try {
      return await this.postRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener las publicaciones: ${error.message}`,
      );
    }
  }

  async findOne(id: number): Promise<Post> {
    try {
      const post = await this.postRepository.findOne({
        where: { id },
        relations: ['comments', 'comments.user', 'reactions', 'reactions.user'], // Incluir comentarios, sus usuarios, reacciones y sus usuarios
      });
      if (!post) {
        throw new NotFoundException(`Publicación con ID ${id} no encontrada.`);
      }
      return post;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al obtener la publicación: ${error.message}`,
      );
    }
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    try {
      const post = await this.findOne(id);
      const postData = await this.__prepareAndValidateDto(updatePostDto, id);

      Object.assign(post, postData);
      return await this.postRepository.save(post);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al actualizar la publicación: ${error.message}`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.postRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Publicación con ID ${id} no encontrada.`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al eliminar la publicación: ${error.message}`,
      );
    }
  }
}
