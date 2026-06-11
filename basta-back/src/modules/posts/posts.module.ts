import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post, PostStatusHistory } from 'src/common/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostStatusHistory])],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
