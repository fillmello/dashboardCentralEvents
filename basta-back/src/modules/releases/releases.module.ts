import { Module } from '@nestjs/common';
import { ReleasesService } from './releases.service';
import { ReleasesController } from './releases.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Release } from 'src/common/entities/release.entity';
import { ProductRelease } from 'src/common/entities/product-release.entity';
import { Product } from 'src/common/entities/product.entity';
import { Collection } from 'src/common/entities/collection.entity';
import { CollectionsModule } from '../collections/collections.module';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Release, ProductRelease, Product, Collection]),
    CollectionsModule,
    StorageModule,
  ],
  providers: [ReleasesService],
  controllers: [ReleasesController],
  exports: [ReleasesService],
})
export class ReleasesModule {}
