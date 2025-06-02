import { IsNumber, IsNotEmpty, IsEnum } from 'class-validator';
import { PostReaction } from 'src/common/enum/post-reaction';

export class CreateReactionDto {
  @IsNumber()
  @IsNotEmpty()
  postId: number; // Para la relación ManyToOne con Post

  @IsNumber()
  @IsNotEmpty()
  userId: number; // Para la relación ManyToOne con User

  @IsEnum(PostReaction)
  @IsNotEmpty()
  type: PostReaction; // Tipo de reacción (ej. 'like', 'love')
}
