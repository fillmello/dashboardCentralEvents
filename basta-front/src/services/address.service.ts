import api from '@/src/lib/api';

export type CreateAddressDto = {
  cep: string;
  neighborhood: string;
  street: string;
  state: string;
  city: string;
  number: string;
  complement?: string;
};

export const addressService = {
  getAll: () => api.get('/address'),
  getOne: (addressId: number) => api.get(`/address/${addressId}`),
  create: (dto: CreateAddressDto) => api.post('/address', dto),
  update: (addressId: number, dto: Partial<CreateAddressDto>) =>
    api.put(`/address/${addressId}`, dto),
  remove: (addressId: number) => api.delete(`/address/${addressId}`),
};
