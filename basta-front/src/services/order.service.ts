import api from '@/src/lib/api';
import type { PaginatedResult } from '@/src/types/pagination';

export type OrderStatus =
  | 'RESERVADO'
  | 'PAGO'
  | 'EM_SEPARACAO'
  | 'ENVIADO'
  | 'ENTREGUE'
  | 'CANCELADO';

export type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  size: string;
  gender: string;
  color: string;
  productRelease?: {
    id: number;
    name: string;
    imageFrontUrl?: string;
  };
};

export type Order = {
  id: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  emSeparacaoAt: string | null;
  enviadoAt: string | null;
  entregueAt: string | null;
  canceladoAt: string | null;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
  };
  items: OrderItem[];
  payment?: {
    status: string;
  };
  user?: {
    fullName: string;
    email: string;
  };
};

export type OrderStats = {
  totalOrdersThisMonth: number;
  revenueThisMonth: number;
  byStatus: Record<string, number>;
};

export type OrderListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  month?: string;
};

export type OrderMineParams = {
  page?: number;
  limit?: number;
  status?: OrderStatus;
};

export const orderService = {
  create: (addressId: number) =>
    api.post<Order>('/orders', { addressId }),

  getMine: (params?: OrderMineParams): Promise<PaginatedResult<Order>> =>
    api.get('/orders/me', { params }) as Promise<PaginatedResult<Order>>,

  getOne: (id: number) =>
    api.get<Order>(`/orders/${id}`),

  getAll: (params?: OrderListParams): Promise<PaginatedResult<Order>> =>
    api.get('/orders', { params }) as Promise<PaginatedResult<Order>>,

  getStats: () =>
    api.get<OrderStats>('/admin/stats'),

  updateStatus: (id: number, status: OrderStatus) =>
    api.put<Order>(`/orders/${id}/status`, { status }),
};
