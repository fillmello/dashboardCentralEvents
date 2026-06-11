import api from '@/src/lib/api';
import { AxiosResponse } from 'axios';

export type AddCartItemDto = {
    productReleaseId: number;
    quantity: number;
    size: string;
    gender: string;
    color: string;
};

export type UpdateCartItemDto = {
    quantity?: number;
    size?: string;
    color?: string;
};

export type CartItem = {
    id: number;
    quantity: number;
    price: number;
    size: string;
    gender: string;
    color: string;
    productRelease: {
        id: number;
        name: string;
        imageFrontUrl?: string;
    };
};

export type Cart = {
    id: number;
    total: number;
    items: CartItem[];
};

export const cartService = {
    // 🛒 Get full cart
    getCart: (): Promise<AxiosResponse<Cart>> =>
        api.get('/cart'),

    // ➕ Add item
    addItem: (dto: AddCartItemDto): Promise<AxiosResponse<Cart>> =>
        api.post('/cart/items', dto),

    // ✏️ Update item
    updateItem: (
        itemId: number,
        dto: UpdateCartItemDto
    ): Promise<AxiosResponse<Cart>> =>
        api.put(`/cart/items/${itemId}`, dto),

    // ❌ Remove item
    removeItem: (itemId: number): Promise<AxiosResponse<Cart>> =>
        api.delete(`/cart/items/${itemId}`),

    // 🔄 Sync (useful later for guest → user)
    syncCart: (items: AddCartItemDto[]): Promise<AxiosResponse<Cart>> =>
        api.post('/cart/sync', { items }),
};