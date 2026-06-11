import api from '@/src/lib/api';
import type { PaginatedResult } from '@/src/types/pagination';
import type { Collection } from '@/src/types/collection';

export type CreateCollectionDto = {
  name: string;
  description: string;
};

export type CollectionListParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export const collectionService = {
  getAll: (params?: CollectionListParams): Promise<PaginatedResult<Collection>> =>
    api.get('/collection', { params }) as unknown as Promise<PaginatedResult<Collection>>,
  getOne: (id: number) => api.get(`/collection/${id}`),
  create: (dto: CreateCollectionDto) => api.post('/collection', dto),
  update: (id: number, dto: Partial<CreateCollectionDto>) => api.put(`/collection/${id}`, dto),
  delete: (id: number) => api.delete(`/collection/${id}`),
  addProduct: (id: number, productId: number) => api.put(`/collection/${id}/product/${productId}`),
  removeProduct: (id: number, productId: number) => api.delete(`/collection/${id}/product/${productId}`),
  uploadImage: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/collection/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};