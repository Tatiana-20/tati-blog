import { Module } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { ReactionController } from './reaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reaction } from './entities/reaction.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reaction]), AuthModule, UsersModule],
  controllers: [ReactionController],
  providers: [ReactionService],
  exports: [TypeOrmModule],
})
export class ReactionModule {}
