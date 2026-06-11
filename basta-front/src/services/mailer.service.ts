import api from '@/src/lib/api';
import type { OrderStatus } from '@/src/services/order.service';

export const mailerService = {
  sendOrderStatus: (orderId: number, status: OrderStatus) =>
    api.post('/mailer/order-status', { orderId, status }),
};
