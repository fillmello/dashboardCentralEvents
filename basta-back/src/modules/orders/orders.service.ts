import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Order } from 'src/common/entities/order.entity';
import { OrderItem } from 'src/common/entities/order-item.entity';
import { Cart } from 'src/common/entities/cart.entity';
import { CartItem } from 'src/common/entities/cart-item.entity';
import { Release } from 'src/common/entities/release.entity';
import { CreateOrderDto } from 'src/common/dtos/order/create.dto';
import { UpdateOrderStatusDto } from 'src/common/dtos/order/update-status.dto';
import {
  OrderQueryDto,
  OrderMineQueryDto,
} from 'src/common/dtos/order/query.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { Role } from 'src/common/enums/role.enum';
import { AddressService } from '../address/address.service';
import { MailerService } from '../mailer/mailer.service';
import { emailTemplates } from '../mailer/templates/email-templates';
import { SendEmailDto } from 'src/common/interfaces/mail.interface';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    private addressService: AddressService,
    private mailerService: MailerService,
  ) {}

  async createFromCart(userId: number, dto: CreateOrderDto): Promise<Order> {
    await this.addressService.getOne(userId, dto.addressId);

    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: { items: { productRelease: { releases: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Carrinho vazio');
    }

    const releaseQtyMap = new Map<number, { release: Release; qty: number }>();
    for (const item of cart.items) {
      for (const release of item.productRelease.releases ?? []) {
        const entry = releaseQtyMap.get(release.id);
        if (entry) {
          entry.qty += item.quantity;
        } else {
          releaseQtyMap.set(release.id, { release, qty: item.quantity });
        }
      }
    }

    for (const [, { release, qty }] of releaseQtyMap) {
      if (release.soldQuantity + qty > release.quantity) {
        throw new BadRequestException(
          `Lote "${release.name}" esgotado ou sem estoque suficiente`,
        );
      }
    }

    const total = cart.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    const order = this.orderRepository.create({
      total,
      status: OrderStatus.RESERVADO,
      user: { id: userId },
      address: { id: dto.addressId },
      items: cart.items.map((item) =>
        this.orderItemRepository.create({
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          gender: item.gender,
          color: item.color,
          productRelease: { id: item.productRelease.id },
        }),
      ),
    });

    const saved = await this.orderRepository.save(order);

    const orderWithUser = await this.orderRepository.findOne({
      where: { id: saved.id },
      relations: { user: true },
    });

    if (orderWithUser?.user?.email) {
      const displayName =
        orderWithUser.user.fullName?.trim() ||
        orderWithUser.user.email.split('@')[0] ||
        'cliente';
      const html = await emailTemplates.orderStatus({
        userName: displayName,
        orderId: orderWithUser.id,
        title: 'Pedido reservado',
        message:
          'Recebemos o seu pedido e ele foi reservado. Assim que o pagamento for confirmado, seguimos com a separacao.',
      });
      const dto: SendEmailDto = {
        recipients: [
          {
            name: displayName,
            address: orderWithUser.user.email,
          },
        ],
        subject: `Pedido #${orderWithUser.id} · Pedido reservado · ${displayName}`,
        html,
      };
      try {
        await this.mailerService.sendEmail(dto);
      } catch {
        // Avoid blocking order creation if email fails.
      }
    }

    return saved;
  }

  async findAll(query: OrderQueryDto): Promise<PaginatedResult<Order>> {
    const { page, limit, search, status, month } = query;
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.productRelease', 'productRelease')
      .orderBy('order.createdAt', 'DESC');

    if (search) {
      qb.andWhere(
        'CAST(order.id AS TEXT) ILIKE :s OR user.fullName ILIKE :s OR user.email ILIKE :s',
        { s: `%${search}%` },
      );
    }
    if (status) {
      qb.andWhere('order.status = :status', { status });
    }
    if (month) {
      const [year, mon] = month.split('-').map(Number);
      const first = new Date(year, mon - 1, 1);
      const last = new Date(year, mon, 0, 23, 59, 59, 999);
      qb.andWhere('order.createdAt BETWEEN :first AND :last', { first, last });
    }

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findMine(
    userId: number,
    query: OrderMineQueryDto,
  ): Promise<PaginatedResult<Order>> {
    const { page, limit, status } = query;
    const where: Record<string, unknown> = { user: { id: userId } };
    if (status) where.status = status;
    const [items, total] = await this.orderRepository.findAndCount({
      where,
      relations: {
        address: true,
        items: { productRelease: true },
        payment: true,
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number, userId?: number, role?: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        user: true,
        address: true,
        items: { productRelease: true },
        payment: true,
      },
    });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    if (role !== Role.ADMIN && order.user?.id !== userId) {
      throw new ForbiddenException('Sem permissão');
    }
    return order;
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    order.status = dto.status;
    const now = new Date();
    if (dto.status === OrderStatus.EM_SEPARACAO && !order.emSeparacaoAt)
      order.emSeparacaoAt = now;
    if (dto.status === OrderStatus.ENVIADO && !order.enviadoAt)
      order.enviadoAt = now;
    if (dto.status === OrderStatus.ENTREGUE && !order.entregueAt)
      order.entregueAt = now;
    if (dto.status === OrderStatus.CANCELADO && !order.canceladoAt)
      order.canceladoAt = now;
    return this.orderRepository.save(order);
  }

  async clearCartForUser(userId: number): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: { items: true },
    });
    if (!cart || cart.items.length === 0) return;
    await this.cartItemRepository.remove(cart.items);
    await this.cartRepository.update({ id: cart.id }, { total: 0 });
  }

  async getStats(): Promise<{
    totalOrdersThisMonth: number;
    revenueThisMonth: number;
    byStatus: Record<string, number>;
  }> {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const orders = await this.orderRepository.find({
      where: { createdAt: Between(first, last) },
    });

    const totalOrdersThisMonth = orders.length;
    const paidStatuses: OrderStatus[] = [
      OrderStatus.PAGO,
      OrderStatus.EM_SEPARACAO,
      OrderStatus.ENVIADO,
      OrderStatus.ENTREGUE,
    ];
    const revenueThisMonth = orders
      .filter((o) => paidStatuses.includes(o.status))
      .reduce((sum, o) => sum + Number(o.total), 0);
    const byStatus: Record<string, number> = {};
    for (const o of orders) {
      byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
    }

    return { totalOrdersThisMonth, revenueThisMonth, byStatus };
  }
}
