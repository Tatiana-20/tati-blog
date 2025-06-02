import { Module } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { ReactionController } from './reaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reaction } from './entities/reaction.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reaction]), AuthModule],
  controllers: [ReactionController],
  providers: [ReactionService],
  exports: [TypeOrmModule],
})
export class ReactionModule {}
