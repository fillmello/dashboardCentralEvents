import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/common/entities/post.entity';
import { PostStatusLog } from 'src/common/entities/post-status-log.entity';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsGateway } from './posts.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostStatusLog])],
  providers: [PostsService, PostsGateway],
  controllers: [PostsController],
})
export class PostsModule {}
