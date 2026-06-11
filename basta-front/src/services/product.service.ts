import api from '@/src/lib/api';
import type { PaginatedResult } from '@/src/types/pagination';
import type { Product } from '@/src/types/product';

export type CreateProductDto = {
  name: string;
  price: number;
  size: string[];
  gender: string;
  description: string;
  colors: string[];
};

export type ProductListParams = {
  page?: number;
  limit?: number;
  search?: string;
  gender?: string;
};

export const productService = {
  getAll: (params?: ProductListParams): Promise<PaginatedResult<Product>> =>
    api.get('/product', { params }) as unknown as Promise<PaginatedResult<Product>>,
  getOne: (id: number) => api.get(`/product/${id}`),
  create: (dto: CreateProductDto) => api.post('/product', dto),
  update: (id: number, dto: Partial<CreateProductDto>) => api.put(`/product/${id}`, dto),
  delete: (id: number) => api.delete(`/product/${id}`),
  uploadFrontImage: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/product/${id}/image/front`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadBackImage: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/product/${id}/image/back`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadAdditionalImage: (id: number, file: File): Promise<string[]> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/product/${id}/image/additional`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }) as unknown as Promise<string[]>;
  },
  removeAdditionalImage: (id: number, url: string): Promise<string[]> =>
    api.delete(`/product/${id}/image/additional`, {
      data: { url },
    }) as unknown as Promise<string[]>,
};