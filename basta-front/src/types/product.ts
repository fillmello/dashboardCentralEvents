export type Product = {
  id: number;
  name: string;
  price: number;
  gender: string;
  description?: string;
  size?: string[];
  colors?: string[];
  imageFrontUrl?: string;
  imageBackUrl?: string;
  additionalImageUrls?: string[];
};
