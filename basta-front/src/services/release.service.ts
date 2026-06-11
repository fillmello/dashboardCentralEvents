import type { AxiosResponse } from "axios";
import api from "@/src/lib/api";
import type { PaginatedResult } from "@/src/types/pagination";

export type Release = {
  id: number;
  name: string;
  description: string;
  quantity: number;
  soldQuantity: number;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  productReleases: ProductReleased[];
};

export type ProductReleased = {
  id: number;
  name: string;
  price: number;
  size: string[];
  gender: string;
  description: string;
  colors: string[];
  imageFrontUrl?: string;
  imageBackUrl?: string;
  additionalImageUrls?: string[];
};

export type CreateReleaseDto = {
  name?: string;
  description?: string;
  collectionId: number;
  quantity: number;
  startDate: string;
  endDate: string;
};

export type UpdateReleaseDto = Partial<CreateReleaseDto>;

export type UpdateProductReleaseDto = {
  name?: string;
  price?: number;
  size?: string[];
  gender?: string;
  description?: string;
  colors?: string[];
};

export type ReleaseListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "upcoming" | "inactive";
};

export const releaseService = {
  getAll: (params?: ReleaseListParams): Promise<PaginatedResult<Release>> =>
    api.get("/release", { params }) as Promise<PaginatedResult<Release>>,

  getActive: (): Promise<Release[]> => api.get("/release/active"),

  getOne: (id: number): Promise<Release> => api.get(`/release/${id}`),

  getItem: (id: number): Promise<ProductReleased> =>
    api.get(`/release/active/item/${id}`),

  // ================= RELEASE CRUD =================

  create: (dto: CreateReleaseDto): Promise<AxiosResponse<void>> =>
    api.post("/release", dto),

  update: (id: number, dto: UpdateReleaseDto): Promise<AxiosResponse<void>> =>
    api.put(`/release/${id}`, dto),

  delete: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/release/${id}`),

  // ================= PRODUCT (INSIDE RELEASE) =================

  updateItem: (
    id: number,
    dto: UpdateProductReleaseDto,
  ): Promise<AxiosResponse<void>> => api.put(`/release/item/${id}`, dto),

  // ================= IMAGES =================

  uploadFrontImage: (id: number, file: File): Promise<AxiosResponse<void>> => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post(`/release/item/${id}/image/front`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadBackImage: (id: number, file: File): Promise<AxiosResponse<void>> => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post(`/release/item/${id}/image/back`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  addAdditionalImage: (
    id: number,
    file: File,
  ): Promise<AxiosResponse<string[]>> => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post(`/release/item/${id}/image/additional`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  removeAdditionalImage: (
    id: number,
    url: string,
  ): Promise<AxiosResponse<string[]>> =>
    api.delete(`/release/item/${id}/image/additional`, {
      data: { url },
    }),
};
