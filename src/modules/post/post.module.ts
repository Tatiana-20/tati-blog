import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post } from './entities/post.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    AuthModule,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [TypeOrmModule, PostService],
})
export class PostModule {}
