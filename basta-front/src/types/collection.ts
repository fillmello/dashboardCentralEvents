import type { Product } from './product';

export type Collection = {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  products?: Product[];
};
