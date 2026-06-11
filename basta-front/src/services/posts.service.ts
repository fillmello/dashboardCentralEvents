import api from '@/src/lib/api';

export interface Post {
  id: string;
  title: string;
  description?: string;
  platform: 'instagram' | 'whatsapp' | 'youtube';
  type: 'criativo' | 'video';
  format: 'feed' | 'story' | 'reels' | 'capa';
  status:
    | 'nao_iniciado'
    | 'captando'
    | 'editando'
    | 'criando'
    | 'aprovacao'
    | 'copy_capa'
    | 'em_publicacao'
    | 'publicado';
  responsibleId: string;
  responsible?: {
    id: string;
    fullName: string;
    email: string;
  };
  createdById: string;
  createdBy?: {
    id: string;
    fullName: string;
  };
  updatedById: string;
  updatedBy?: {
    id: string;
    fullName: string;
  };
  statusHistory?: PostStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface PostStatusHistory {
  id: string;
  previousStatus: string;
  newStatus: string;
  changedById: string;
  changedBy: {
    id: string;
    fullName: string;
  };
  reason?: string;
  createdAt: string;
}

export interface CreatePostDto {
  title: string;
  description?: string;
  platform: 'instagram' | 'whatsapp' | 'youtube';
  type: 'criativo' | 'video';
  format: 'feed' | 'story' | 'reels' | 'capa';
  responsibleId: string;
  eventoId?: string;
}

export interface UpdatePostDto {
  title?: string;
  description?: string;
  platform?: 'instagram' | 'whatsapp' | 'youtube';
  type?: 'criativo' | 'video';
  format?: 'feed' | 'story' | 'reels' | 'capa';
}

export interface AdvanceStatusDto {
  newStatus: string;
  reason?: string;
}

export const postsService = {
  create: (data: CreatePostDto) => api.post<Post>('/posts', data),
  list: (filters?: Record<string, any>) =>
    api.get<Post[]>('/posts', { params: filters }),
  get: (id: string) => api.get<Post>(`/posts/${id}`),
  update: (id: string, data: UpdatePostDto) =>
    api.patch<Post>(`/posts/${id}`, data),
  delete: (id: string) => api.delete<void>(`/posts/${id}`),
  advanceStatus: (id: string, data: AdvanceStatusDto) =>
    api.patch<Post>(`/posts/${id}/advance-status`, data),
  getHistory: (id: string) =>
    api.get<Post>(`/posts/${id}/history`),
};
