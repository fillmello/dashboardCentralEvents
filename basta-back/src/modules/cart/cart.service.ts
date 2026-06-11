import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from 'src/common/entities/cart.entity';
import { CartItem } from 'src/common/entities/cart-item.entity';
import { ProductRelease } from 'src/common/entities/product-release.entity';
import { Release } from 'src/common/entities/release.entity';
import { AddCartItemDto } from 'src/common/dtos/cart/add-item.dto';
import { UpdateCartItemDto } from 'src/common/dtos/cart/update-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(ProductRelease)
    private productReleaseRepository: Repository<ProductRelease>,
  ) {}

  private async getOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: { items: { productRelease: { releases: true } } },
    });

    if (!cart) {
      cart = this.cartRepository.create({
        user: { id: userId },
        items: [],
        total: 0,
      });
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  private async recalculateTotal(cart: Cart): Promise<Cart> {
    const total = cart.items.reduce(
      (acc, item) => acc + Number(item.price) * item.quantity,
      0,
    );
    return this.cartRepository.save({ ...cart, total });
  }

  private assertStockAvailable(
    cart: Cart,
    productRelease: ProductRelease,
    additionalQty: number,
    replaceItemId?: number,
  ): void {
    const releaseQtyMap = new Map<number, { release: Release; qty: number }>();

    for (const item of cart.items) {
      if (replaceItemId !== undefined && item.id === replaceItemId) continue;
      for (const release of item.productRelease.releases ?? []) {
        const entry = releaseQtyMap.get(release.id);
        if (entry) {
          entry.qty += item.quantity;
        } else {
          releaseQtyMap.set(release.id, { release, qty: item.quantity });
        }
      }
    }

    for (const release of productRelease.releases ?? []) {
      const entry = releaseQtyMap.get(release.id);
      if (entry) {
        entry.qty += additionalQty;
      } else {
        releaseQtyMap.set(release.id, { release, qty: additionalQty });
      }
    }

    for (const [, { release, qty }] of releaseQtyMap) {
      if (release.soldQuantity + qty > release.quantity) {
        throw new BadRequestException(
          `Lote "${release.name}" esgotado ou sem estoque suficiente`,
        );
      }
    }
  }

  async getCart(userId: number): Promise<Cart> {
    return this.getOrCreateCart(userId);
  }

  async addItem(userId: number, dto: AddCartItemDto): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    const productRelease = await this.productReleaseRepository.findOne({
      where: { id: dto.productReleaseId },
      relations: { releases: true },
    });
    if (!productRelease) throw new NotFoundException('Produto não encontrado');

    this.assertStockAvailable(cart, productRelease, dto.quantity);

    const existingItem = cart.items.find(
      (item) =>
        item.productRelease.id === dto.productReleaseId &&
        item.size === dto.size &&
        item.color === dto.color &&
        item.gender === dto.gender,
    );

    if (existingItem) {
      existingItem.quantity += dto.quantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        productRelease: { id: dto.productReleaseId },
        size: dto.size,
        gender: dto.gender,
        color: dto.color,
        quantity: dto.quantity,
        price: productRelease.price,
        cart,
      });
      await this.cartItemRepository.save(newItem);
    }

    const updatedCart = await this.getOrCreateCart(userId);
    return this.recalculateTotal(updatedCart);
  }

  async updateItem(
    userId: number,
    itemId: number,
    dto: UpdateCartItemDto,
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('Item não encontrado');

    this.assertStockAvailable(cart, item.productRelease, dto.quantity, itemId);

    item.quantity = dto.quantity;
    await this.cartItemRepository.save(item);

    const updatedCart = await this.getOrCreateCart(userId);
    return this.recalculateTotal(updatedCart);
  }

  async removeItem(userId: number, itemId: number): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('Item não encontrado');

    await this.cartItemRepository.remove(item);

    const updatedCart = await this.getOrCreateCart(userId);
    return this.recalculateTotal(updatedCart);
  }

  async clearCart(userId: number): Promise<void> {
    const cart = await this.getOrCreateCart(userId);
    await this.cartItemRepository.remove(cart.items);
    await this.cartRepository.save({ ...cart, total: 0 });
  }

  async syncCart(userId: number, items: AddCartItemDto[]): Promise<Cart> {
    await this.clearCart(userId);
    for (const item of items) {
      await this.addItem(userId, item);
    }
    return this.getCart(userId);
  }
}
