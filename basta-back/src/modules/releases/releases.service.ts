import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ArrayContains,
  ILike,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Release } from 'src/common/entities/release.entity';
import { ProductRelease } from 'src/common/entities/product-release.entity';
import { Product } from 'src/common/entities/product.entity';
import { Collection } from 'src/common/entities/collection.entity';
import { CollectionsService } from '../collections/collections.service';
import { CreateReleaseDto } from 'src/common/dtos/release/create.dto';
import { UpdateReleaseDto } from 'src/common/dtos/release/update.dto';
import { UpdateProductReleaseDto } from 'src/common/dtos/release/update-item.dto';
import { ReleaseQueryDto } from 'src/common/dtos/release/query.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class ReleasesService {
  constructor(
    @InjectRepository(Release)
    private releasesRepository: Repository<Release>,
    @InjectRepository(ProductRelease)
    private productReleaseRepository: Repository<ProductRelease>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Collection)
    private collectionRepo: Repository<Collection>,
    private collectionsService: CollectionsService,
    private storageService: StorageService,
  ) {}

  findOne(id: number): Promise<Release | null> {
    return this.releasesRepository.findOne({
      where: { id },
      relations: ['productReleases'],
    });
  }

  async findAll(query: ReleaseQueryDto): Promise<PaginatedResult<Release>> {
    const { page, limit, search, status } = query;
    const today = new Date();
    const where: Record<string, unknown> = {};
    if (search) where.name = ILike(`%${search}%`);
    if (status === 'active') {
      where.startDate = LessThanOrEqual(today);
      where.endDate = MoreThanOrEqual(today);
    } else if (status === 'upcoming') {
      where.startDate = MoreThan(today);
    } else if (status === 'inactive') {
      where.endDate = LessThan(today);
    }
    const [items, total] = await this.releasesRepository.findAndCount({
      where,
      relations: ['productReleases'],
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findActive(): Promise<Release[]> {
    const today = new Date();
    return this.releasesRepository
      .createQueryBuilder('release')
      .leftJoinAndSelect('release.productReleases', 'productReleases')
      .where('release.startDate <= :today', { today })
      .andWhere('release.endDate >= :today', { today })
      .andWhere('release.soldQuantity < release.quantity')
      .getMany();
  }

  async findItemActive(id: number): Promise<ProductRelease> {
    const today = new Date();
    const item = await this.findItem(id);
    const release = item.releases[0];
    if (release.startDate < today && release.endDate > today) {
      return item;
    }
    throw new NotFoundException('Produto do lote não encontrado');
  }

  async findItem(id: number): Promise<ProductRelease> {
      const item = await this.productReleaseRepository.findOne({
        where: { id },
        relations: ['releases', 'feedbacks', 'feedbacks.usr'],
      });
      if (!item) throw new NotFoundException('Produto do lote não encontrado');
      return item;
  }

  private assertDateOrder(start: Date, end: Date): void {
    if (!(start instanceof Date) || Number.isNaN(start.getTime())) {
      throw new BadRequestException('Data de início inválida');
    }
    if (!(end instanceof Date) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Data de fim inválida');
    }
    if (start.getTime() >= end.getTime()) {
      throw new BadRequestException(
        'Data de início deve ser anterior à data de fim',
      );
    }
  }

  private assertCollectionReleasable(collection: Collection): void {
    if (!collection.imageUrl) {
      throw new BadRequestException(
        `Coleção "${collection.name}" não possui imagem`,
      );
    }
    if (!collection.products || collection.products.length === 0) {
      throw new BadRequestException(
        `Coleção "${collection.name}" não possui produtos`,
      );
    }
    const missing = collection.products.filter(
      (p) =>
        !p.imageFrontUrl ||
        !p.imageBackUrl ||
        !p.colors ||
        p.colors.length === 0,
    );
    if (missing.length > 0) {
      const names = missing.map((p) => `"${p.name}"`).join(', ');
      throw new BadRequestException(
        `Produtos sem imagem frontal, traseira ou cores: ${names}`,
      );
    }
  }

  async create(dto: CreateReleaseDto): Promise<void> {
    const collection = await this.collectionsService.findOne(dto.collectionId);
    if (!collection) throw new NotFoundException('Coleção não encontrada');

    this.assertDateOrder(dto.startDate, dto.endDate);
    this.assertCollectionReleasable(collection);

    const productReleases = await Promise.all(
      collection.products.map((product) =>
        this.productReleaseRepository.save(
          this.productReleaseRepository.create({
            name: product.name,
            price: product.price,
            size: product.size,
            gender: product.gender,
            description: product.description,
            colors: product.colors ?? [],
            imageFrontUrl: product.imageFrontUrl,
            imageBackUrl: product.imageBackUrl,
            additionalImageUrls: product.additionalImageUrls ?? [],
          }),
        ),
      ),
    );

    const release = this.releasesRepository.create({
      name: dto.name ?? collection.name,
      description: dto.description ?? collection.description,
      imageUrl: collection.imageUrl,
      quantity: dto.quantity,
      soldQuantity: 0,
      startDate: dto.startDate,
      endDate: dto.endDate,
      productReleases,
    });

    await this.releasesRepository.save(release);
  }

  async update(id: number, dto: UpdateReleaseDto): Promise<void> {
    const exists = await this.findOne(id);
    if (!exists) throw new NotFoundException('Lote não encontrado');
    const { collectionId: _collectionId, ...patch } = dto;
    if (patch.startDate !== undefined || patch.endDate !== undefined) {
      this.assertDateOrder(
        patch.startDate ?? exists.startDate,
        patch.endDate ?? exists.endDate,
      );
    }
    await this.releasesRepository.update(id, patch);
  }

  async delete(id: number): Promise<void> {
    const exists = await this.findOne(id);
    if (!exists) throw new NotFoundException('Lote não encontrado');

    // Collect all image URLs before DB delete
    const releaseImageUrl = exists.imageUrl;
    const itemImageUrls = (exists.productReleases ?? []).flatMap((item) => [
      item.imageFrontUrl,
      item.imageBackUrl,
      ...(item.additionalImageUrls ?? []),
    ]);

    await this.releasesRepository.delete(id);

    for (const url of itemImageUrls) {
      await this.safeDeleteProductReleaseImage(url);
    }
    await this.safeDeleteReleaseImage(releaseImageUrl);
  }

  async updateItem(id: number, dto: UpdateProductReleaseDto): Promise<void> {
    const item = await this.productReleaseRepository.findOneBy({ id });
    if (!item) throw new NotFoundException('Produto do lote não encontrado');
    await this.productReleaseRepository.update(id, dto);
  }

  async uploadItemFrontImage(
    id: number,
    file: Express.Multer.File,
  ): Promise<void> {
    const item = await this.productReleaseRepository.findOneBy({ id });
    if (!item) throw new NotFoundException('Produto do lote não encontrado');
    const oldUrl = item.imageFrontUrl;
    const url = await this.storageService.upload(file, 'releases');
    await this.productReleaseRepository.update(id, { imageFrontUrl: url });
    await this.safeDeleteProductReleaseImage(oldUrl);
  }

  async uploadItemBackImage(
    id: number,
    file: Express.Multer.File,
  ): Promise<void> {
    const item = await this.productReleaseRepository.findOneBy({ id });
    if (!item) throw new NotFoundException('Produto do lote não encontrado');
    const oldUrl = item.imageBackUrl;
    const url = await this.storageService.upload(file, 'releases');
    await this.productReleaseRepository.update(id, { imageBackUrl: url });
    await this.safeDeleteProductReleaseImage(oldUrl);
  }

  async addItemAdditionalImage(
    id: number,
    file: Express.Multer.File,
  ): Promise<string[]> {
    const item = await this.productReleaseRepository.findOneBy({ id });
    if (!item) throw new NotFoundException('Produto do lote não encontrado');
    const url = await this.storageService.upload(file, 'releases');
    item.additionalImageUrls = [...(item.additionalImageUrls ?? []), url];
    await this.productReleaseRepository.save(item);
    return item.additionalImageUrls;
  }

  async removeItemAdditionalImage(id: number, url: string): Promise<string[]> {
    const item = await this.productReleaseRepository.findOneBy({ id });
    if (!item) throw new NotFoundException('Produto do lote não encontrado');
    if (!item.additionalImageUrls?.includes(url)) {
      throw new BadRequestException(
        'Imagem não encontrada neste produto do lote',
      );
    }
    item.additionalImageUrls = item.additionalImageUrls.filter(
      (u) => u !== url,
    );
    await this.productReleaseRepository.save(item);
    await this.safeDeleteProductReleaseImage(url);
    return item.additionalImageUrls;
  }

  // ProductRelease images may have been copied from a Product — check Product before deleting
  private async safeDeleteProductReleaseImage(
    url: string | null | undefined,
  ): Promise<void> {
    if (!url) return;
    const count = await this.productRepo.count({
      where: [
        { imageFrontUrl: url },
        { imageBackUrl: url },
        { additionalImageUrls: ArrayContains([url]) },
      ],
    });
    if (count > 0) return;
    await this.storageService.delete(url);
  }

  // Release imageUrl was copied from Collection and may be shared by other Releases
  private async safeDeleteReleaseImage(
    url: string | null | undefined,
  ): Promise<void> {
    if (!url) return;
    const [collectionCount, releaseCount] = await Promise.all([
      this.collectionRepo.count({ where: { imageUrl: url } }),
      this.releasesRepository.count({ where: { imageUrl: url } }),
    ]);
    if (collectionCount + releaseCount > 0) return;
    await this.storageService.delete(url);
  }
}
