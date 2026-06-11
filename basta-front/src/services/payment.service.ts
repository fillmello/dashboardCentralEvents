import api from '@/src/lib/api';

export type PixResponse = {
  qrCode: string;
  qrCodeBase64: string;
  paymentId: number;
  ticketUrl: string | null;
};

export type PaymentStatusResponse = {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  paymentId: number | null;
};

export const paymentService = {
  createPix: (orderId: number) =>
    api.post<PixResponse>('/payments/pix', { orderId }),

  getStatus: (orderId: number) =>
    api.get<PaymentStatusResponse>(`/payments/order/${orderId}`),

};
