import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user.entity';
import { UsersController } from './users.controller';
import { SeedService } from 'src/data/seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, SeedService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
