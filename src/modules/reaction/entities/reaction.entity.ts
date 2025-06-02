import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Post } from 'src/modules/post/entities/post.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { PostReaction } from 'src/common/enum/post-reaction';

@Entity('reactions')
export class Reaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Post, (post) => post.reactions, {
    eager: true,
    onDelete: 'CASCADE',
    nullable: false,
  })
  post: Post;

  @ManyToOne(() => User, (user) => user.reactions, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: 'enum', enum: PostReaction, default: PostReaction.LIKE })
  type: PostReaction; // 'like', 'love', 'haha', 'sad', 'angry'

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
