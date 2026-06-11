import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Collection } from 'src/common/entities/collection.entity';
import { Release } from 'src/common/entities/release.entity';
import { ProductsService } from '../products/products.service';
import { CreateCollectionDto } from 'src/common/dtos/collection/create.dto';
import { UpdateCollectionDto } from 'src/common/dtos/collection/update.dto';
import { CollectionQueryDto } from 'src/common/dtos/collection/query.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private collectionsRepository: Repository<Collection>,
    @InjectRepository(Release)
    private releaseRepo: Repository<Release>,
    private productService: ProductsService,
    private storageService: StorageService,
  ) {}

  findOne(id: number): Promise<Collection | null> {
    return this.collectionsRepository.findOne({
      where: { id },
      relations: ['products'],
    });
  }

  async findAll(
    query: CollectionQueryDto,
  ): Promise<PaginatedResult<Collection>> {
    const { page, limit, search } = query;
    const [items, total] = await this.collectionsRepository.findAndCount({
      where: search ? { name: ILike(`%${search}%`) } : {},
      relations: ['products'],
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(dto: CreateCollectionDto): Promise<Collection> {
    const newCollection = this.collectionsRepository.create(dto);
    return await this.collectionsRepository.save(newCollection);
  }

  async update(id: number, dto: UpdateCollectionDto): Promise<void> {
    const exists = await this.findOne(id);
    if (!exists) throw new NotFoundException('Coleção não encontrada');
    await this.collectionsRepository.update(id, dto);
  }

  async delete(id: number): Promise<void> {
    const exists = await this.findOne(id);
    if (!exists) throw new NotFoundException('Coleção não encontrada');
    const { imageUrl } = exists;
    await this.collectionsRepository.delete(id);
    await this.safeDeleteCollectionImage(imageUrl);
  }

  async addProduct(id: number, productId: number): Promise<void> {
    const collection = await this.findOne(id);
    if (!collection) throw new NotFoundException('Coleção não encontrada');
    const product = await this.productService.findOne(productId);
    if (!product) throw new NotFoundException('Produto não encontrado');
    collection.products.push(product);
    await this.collectionsRepository.save(collection);
  }

  async removeProduct(id: number, productId: number): Promise<void> {
    const collection = await this.findOne(id);
    if (!collection) throw new NotFoundException('Coleção não encontrada');
    const product = await this.productService.findOne(productId);
    if (!product) throw new NotFoundException('Produto não encontrado');
    collection.products = collection.products.filter((p) => p.id !== productId);
    await this.collectionsRepository.save(collection);
  }

  async uploadImage(id: number, file: Express.Multer.File): Promise<void> {
    const collection = await this.findOne(id);
    if (!collection) throw new NotFoundException('Coleção não encontrada');
    const oldUrl = collection.imageUrl;
    const url = await this.storageService.upload(file, 'collections');
    await this.collectionsRepository.update(id, { imageUrl: url });
    await this.safeDeleteCollectionImage(oldUrl);
  }

  private async safeDeleteCollectionImage(
    url: string | null | undefined,
  ): Promise<void> {
    if (!url) return;
    const count = await this.releaseRepo.count({ where: { imageUrl: url } });
    if (count > 0) return;
    await this.storageService.delete(url);
  }
}
