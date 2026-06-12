import api from "@/src/lib/api";
import type {
  Platform,
  PostFormat,
  PostStatus,
  PostType,
} from "@/src/lib/domain";

export type PostResponsible = {
  id: number;
  fullName: string;
  email: string;
};

export type Post = {
  id: number;
  name: string;
  description: string | null;
  platform: Platform;
  type: PostType;
  format: PostFormat;
  status: PostStatus;
  responsible: PostResponsible | null;
  createdAt: string;
  updatedAt: string;
};

export type PostFilters = {
  platform?: Platform;
  type?: PostType;
  format?: PostFormat;
  status?: PostStatus;
  responsibleId?: number;
};

export type CreatePostDto = {
  name: string;
  description?: string;
  responsibleId?: number;
  platform: Platform;
  type: PostType;
  format: PostFormat;
};

export type UpdatePostDto = Partial<CreatePostDto>;

export const postService = {
  list: (filters: PostFilters = {}) =>
    api.get("/post", { params: filters }) as unknown as Promise<Post[]>,
  create: (dto: CreatePostDto) =>
    api.post("/post", dto) as unknown as Promise<Post>,
  update: (id: number, dto: UpdatePostDto) =>
    api.put(`/post/${id}`, dto) as unknown as Promise<Post>,
  setStatus: (id: number, status: PostStatus) =>
    api.patch(`/post/${id}/status`, { status }) as unknown as Promise<Post>,
  remove: (id: number) => api.delete(`/post/${id}`),
};
