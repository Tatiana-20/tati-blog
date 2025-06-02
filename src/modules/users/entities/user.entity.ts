import { Role } from 'src/common/enum/roles.enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Post } from 'src/modules/post/entities/post.entity';
import { Reaction } from 'src/modules/reaction/entities/reaction.entity';
import { Comment } from 'src/modules/comment/entities/comment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  lastname: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  email: string;

  @Column({ type: 'text', nullable: false, select: false })
  password: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  user_secret: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ type: 'boolean', default: false })
  is_active: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  activation_token: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  password_reset_token: string;

  @Column({ type: 'timestamp', nullable: true })
  password_reset_token_expires_at: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Reaction, (reaction) => reaction.user)
  reactions: Reaction[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}
