'use client';

import { useState, useCallback, useEffect } from 'react';
import { useUser, canAdvanceTo } from '@/src/hooks/useUser';
import { usePosts, PostFilters } from '@/src/hooks/usePosts';
import { Post, postsService } from '@/src/services/posts.service';
import { FilterBar } from '@/app/components/FilterBar';
import { StatusColumn } from '@/app/components/StatusColumn';
import { Toast } from '@/app/components/Toast';

const STATUSES = [
  { value: 'nao_iniciado', label: 'Não Iniciado' },
  { value: 'captando', label: 'Captando' },
  { value: 'editando', label: 'Editando' },
  { value: 'criando', label: 'Criando' },
  { value: 'aprovacao', label: 'Aprovação' },
  { value: 'copy_capa', label: 'Capa/Copy' },
  { value: 'em_publicacao', label: 'Em Publicação' },
  { value: 'publicado', label: 'Publicado' },
];

export default function KanbanPage() {
  const { user, loading: userLoading } = useUser();
  const [filters, setFilters] = useState<PostFilters>({});
  const { posts, loading, error, refetch } = usePosts(filters);
  const [draggedPost, setDraggedPost] = useState<Post | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    variant: 'success' | 'error';
    message: string;
  } | null>(null);

  if (userLoading || loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-gray-600">Carregando posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  const handleDragStart = (post: Post) => {
    setDraggedPost(post);
  };

  const handleDragOver = (status: string) => {
    setDragOverStatus(status);
  };

  const handleDrop = async (status: string) => {
    if (!draggedPost || !user) {
      setDragOverStatus(null);
      return;
    }

    // Verificar se o usuário tem permissão para avançar para este status
    if (!canAdvanceTo(user.role, status)) {
      setToast({
        variant: 'error',
        message: 'Você não tem permissão para avançar para este status',
      });
      setDragOverStatus(null);
      return;
    }

    try {
      await postsService.advanceStatus(draggedPost.id, {
        newStatus: status,
      });

      setToast({
        variant: 'success',
        message: `Post "${draggedPost.title}" movido com sucesso`,
      });

      refetch();
    } catch (err) {
      setToast({
        variant: 'error',
        message: 'Erro ao mover post',
      });
    } finally {
      setDraggedPost(null);
      setDragOverStatus(null);
    }
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <header>
        <h1 className="text-3xl font-bold">Kanban - Pipeline de Produção</h1>
        <p className="mt-2 text-gray-600">
          Arraste os posts entre as colunas para avançar no processo
        </p>
      </header>

      <FilterBar filters={filters} onFilterChange={setFilters} />

      {/* Kanban Board */}
      <div className="overflow-x-auto">
        <div className="flex min-w-full gap-4 pb-4">
          {STATUSES.map((status) => {
            const statusPosts = posts.filter((p) => p.status === status.value);
            return (
              <StatusColumn
                key={status.value}
                status={status.value}
                label={status.label}
                posts={statusPosts}
                count={statusPosts.length}
                onDrop={() => handleDrop(status.value)}
                onDragStart={(e, post) => {
                  handleDragStart(post);
                  handleDragOver(status.value);
                }}
                isDraggingOver={dragOverStatus === status.value}
              />
            );
          })}
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          Total: <strong>{posts.length}</strong> posts |
          Publicados:{' '}
          <strong>
            {posts.filter((p) => p.status === 'publicado').length}
          </strong>{' '}
          |
          Em andamento:{' '}
          <strong>
            {posts.filter((p) => p.status !== 'publicado' && p.status !== 'nao_iniciado').length}
          </strong>
        </p>
      </div>

      {toast && (
        <Toast
          variant={toast.variant}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
