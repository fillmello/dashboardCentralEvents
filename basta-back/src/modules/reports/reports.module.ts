import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Post, PostStatusHistory } from 'src/common/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostStatusHistory])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
