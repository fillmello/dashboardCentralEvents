import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayContains, ILike, Repository } from 'typeorm';
import { Product } from 'src/common/entities/product.entity';
import { ProductRelease } from 'src/common/entities/product-release.entity';
import { CreateProductDto } from 'src/common/dtos/product/create.dto';
import { UpdateProductDto } from 'src/common/dtos/product/update.dto';
import { ProductQueryDto } from 'src/common/dtos/product/query.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductRelease)
    private productReleaseRepo: Repository<ProductRelease>,
    private storageService: StorageService,
  ) {}

  findOne(id: number): Promise<Product | null> {
    return this.productsRepository.findOneBy({ id });
  }

  async findAll(query: ProductQueryDto): Promise<PaginatedResult<Product>> {
    const { page, limit, search, gender } = query;
    const where: Record<string, unknown> = {};
    if (search) where.name = ILike(`%${search}%`);
    if (gender) where.gender = gender;
    const [items, total] = await this.productsRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(product: CreateProductDto): Promise<Product> {
    const newProduct = this.productsRepository.create(product);
    return await this.productsRepository.save(newProduct);
  }

  async update(
    id: number,
    product: UpdateProductDto,
  ): Promise<UpdateProductDto> {
    const exists = await this.findOne(id);
    if (exists == null) throw new NotFoundException('Produto não encontrado.');
    await this.productsRepository.update(+id, product);
    return product;
  }

  async delete(id: number): Promise<void> {
    const exists = await this.findOne(id);
    if (exists == null) throw new NotFoundException('Produto não encontrado.');
    const { imageFrontUrl, imageBackUrl, additionalImageUrls } = exists;
    await this.productsRepository.delete(id);
    await this.safeDeleteProductImage(imageFrontUrl);
    await this.safeDeleteProductImage(imageBackUrl);
    for (const url of additionalImageUrls ?? []) {
      await this.safeDeleteProductImage(url);
    }
  }

  async uploadFrontImage(id: number, file: Express.Multer.File): Promise<void> {
    const product = await this.findOne(id);
    if (!product) throw new NotFoundException('Produto não encontrado');
    const oldUrl = product.imageFrontUrl;
    const url = await this.storageService.upload(file, 'products');
    await this.productsRepository.update(id, { imageFrontUrl: url });
    await this.safeDeleteProductImage(oldUrl);
  }

  async uploadBackImage(id: number, file: Express.Multer.File): Promise<void> {
    const product = await this.findOne(id);
    if (!product) throw new NotFoundException('Produto não encontrado');
    const oldUrl = product.imageBackUrl;
    const url = await this.storageService.upload(file, 'products');
    await this.productsRepository.update(id, { imageBackUrl: url });
    await this.safeDeleteProductImage(oldUrl);
  }

  async addAdditionalImage(
    id: number,
    file: Express.Multer.File,
  ): Promise<string[]> {
    const product = await this.findOne(id);
    if (!product) throw new NotFoundException('Produto não encontrado');
    const url = await this.storageService.upload(file, 'products');
    product.additionalImageUrls = [...(product.additionalImageUrls ?? []), url];
    await this.productsRepository.save(product);
    return product.additionalImageUrls;
  }

  async removeAdditionalImage(id: number, url: string): Promise<string[]> {
    const product = await this.findOne(id);
    if (!product) throw new NotFoundException('Produto não encontrado');
    if (!product.additionalImageUrls?.includes(url)) {
      throw new BadRequestException('Imagem não encontrada neste produto');
    }
    product.additionalImageUrls = product.additionalImageUrls.filter(
      (u) => u !== url,
    );
    await this.productsRepository.save(product);
    await this.safeDeleteProductImage(url);
    return product.additionalImageUrls;
  }

  private async safeDeleteProductImage(
    url: string | null | undefined,
  ): Promise<void> {
    if (!url) return;
    const count = await this.productReleaseRepo.count({
      where: [
        { imageFrontUrl: url },
        { imageBackUrl: url },
        { additionalImageUrls: ArrayContains([url]) },
      ],
    });
    if (count > 0) return;
    await this.storageService.delete(url);
  }
}
