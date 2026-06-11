import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Payment } from 'src/common/entities/payment.entity';
import { Order } from 'src/common/entities/order.entity';
import { OrderItem } from 'src/common/entities/order-item.entity';
import { Release } from 'src/common/entities/release.entity';
import { PaymentStatus } from 'src/common/enums/payment-status.enum';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PaymentsService {
  private readonly apiUrl = 'https://api.mercadopago.com';

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Release)
    private releaseRepository: Repository<Release>,
    private httpService: HttpService,
    private configService: ConfigService,
    private ordersService: OrdersService,
  ) {}

  async createPix(
    orderId: number,
    userId: number,
  ): Promise<{
    qrCode: string;
    qrCodeBase64: string;
    paymentId: number;
    ticketUrl: string | null;
  }> {
    const existing = await this.paymentRepository.findOne({
      where: { order: { id: orderId } },
    });
    if (existing) {
      return {
        qrCode: existing.qrCode ?? '',
        qrCodeBase64: existing.qrCodeBase64 ?? '',
        paymentId: existing.id,
        ticketUrl: existing.ticketUrl,
      };
    }

    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: { user: true },
    });
    if (!order) throw new NotFoundException('Pedido não encontrado');

    const accessToken = this.configService.get<string>('MP_ACCESS_TOKEN');

    const body = {
      transaction_amount: Number(order.total),
      description: `Basta Fabric - Pedido #${order.id}`,
      payment_method_id: 'pix',
      payer: {
        email: order.user?.email ?? 'cliente@bastafabric.com',
      },
      external_reference: String(orderId),
    };

    let chargeData: Record<string, unknown>;
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/v1/payments`, body, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': `order-${orderId}`,
          },
        }),
      );
      chargeData = response.data as Record<string, unknown>;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Erro ao criar pagamento Pix';
      throw new BadRequestException(msg);
    }

    const txData =
      (
        (chargeData.point_of_interaction as Record<string, unknown>)
          ?.transaction_data as Record<string, unknown>
      ) ?? {};

    const payment = this.paymentRepository.create({
      providerPaymentId: String(chargeData.id),
      status: PaymentStatus.PENDING,
      qrCode: (txData.qr_code as string) ?? '',
      qrCodeBase64: (txData.qr_code_base64 as string) ?? '',
      ticketUrl: (txData.ticket_url as string) ?? null,
      order: { id: orderId },
    });

    const saved = await this.paymentRepository.save(payment);

    return {
      qrCode: saved.qrCode ?? '',
      qrCodeBase64: saved.qrCodeBase64 ?? '',
      paymentId: saved.id,
      ticketUrl: saved.ticketUrl,
    };
  }

  async getStatus(
    orderId: number,
  ): Promise<{ status: PaymentStatus; paymentId: number | null }> {
    const payment = await this.paymentRepository.findOne({
      where: { order: { id: orderId } },
    });
    if (!payment) return { status: PaymentStatus.PENDING, paymentId: null };
    return { status: payment.status, paymentId: payment.id };
  }

  async handleWebhook(
    rawBody: Buffer,
    signature: string,
    requestId: string,
  ): Promise<void> {
    let event: Record<string, unknown>;
    try {
      event = JSON.parse(rawBody.toString()) as Record<string, unknown>;
    } catch {
      return;
    }

    const webhookSecret = this.configService.get<string>('MP_WEBHOOK_SECRET') ?? '';
    if (webhookSecret) {
      if (!signature) return;

      const parts: Record<string, string> = {};
      for (const pair of signature.split(',')) {
        const idx = pair.indexOf('=');
        if (idx > 0) parts[pair.slice(0, idx)] = pair.slice(idx + 1);
      }
      const ts = parts['ts'];
      const v1 = parts['v1'];
      if (!ts || !v1) return;

      const dataId = String(
        (event?.data as Record<string, unknown>)?.id ?? '',
      );
      const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
      const expected = crypto
        .createHmac('sha256', webhookSecret)
        .update(manifest)
        .digest('hex');

      if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1))) return;
    }

    if (event?.action !== 'payment.updated' || event?.type !== 'payment')
      return;

    const mpPaymentId = String(
      (event?.data as Record<string, unknown>)?.id ?? '',
    );
    if (!mpPaymentId) return;

    const accessToken = this.configService.get<string>('MP_ACCESS_TOKEN');
    let mpPayment: Record<string, unknown>;
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/v1/payments/${mpPaymentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      mpPayment = response.data as Record<string, unknown>;
    } catch {
      return;
    }

    if (mpPayment?.status !== 'approved') return;

    const payment = await this.paymentRepository.findOne({
      where: { providerPaymentId: mpPaymentId },
      relations: { order: { user: true, items: { productRelease: { releases: true } } } },
    });

    if (!payment || payment.status === PaymentStatus.APPROVED) return;

    payment.status = PaymentStatus.APPROVED;
    await this.paymentRepository.save(payment);

    if (payment.order) {
      await this.orderRepository.update(payment.order.id, {
        status: OrderStatus.PAGO,
      });
      await this.incrementSoldQuantity(payment.order.items ?? []);
      if (payment.order.user?.id) {
        await this.ordersService.clearCartForUser(payment.order.user.id);
      }
    }
  }

  private async incrementSoldQuantity(items: OrderItem[]): Promise<void> {
    const releaseQtyMap = new Map<number, { release: Release; qty: number }>();

    for (const item of items) {
      for (const release of item.productRelease?.releases ?? []) {
        const entry = releaseQtyMap.get(release.id);
        if (entry) {
          entry.qty += item.quantity;
        } else {
          releaseQtyMap.set(release.id, { release, qty: item.quantity });
        }
      }
    }

    for (const [releaseId, { qty }] of releaseQtyMap) {
      const release = await this.releaseRepository.findOneBy({ id: releaseId });
      if (release) {
        release.soldQuantity += qty;
        await this.releaseRepository.save(release);
      }
    }
  }
}
