'use client';

import { Post } from '@/src/services/posts.service';
import { PostCard } from './PostCard';
import { ReactNode } from 'react';

interface StatusColumnProps {
  status: string;
  label: string;
  posts: Post[];
  count: number;
  onDrop?: (e: React.DragEvent, status: string) => void;
  onDragStart?: (e: React.DragEvent, post: Post) => void;
  isDraggingOver?: boolean;
}

export function StatusColumn({
  status,
  label,
  posts,
  count,
  onDrop,
  onDragStart,
  isDraggingOver = false,
}: StatusColumnProps) {
  const statusColors: Record<string, string> = {
    nao_iniciado: 'bg-gray-50 border-gray-200',
    captando: 'bg-blue-50 border-blue-200',
    editando: 'bg-purple-50 border-purple-200',
    criando: 'bg-indigo-50 border-indigo-200',
    aprovacao: 'bg-yellow-50 border-yellow-200',
    copy_capa: 'bg-orange-50 border-orange-200',
    em_publicacao: 'bg-green-50 border-green-200',
    publicado: 'bg-emerald-50 border-emerald-200',
  };

  return (
    <div
      onDrop={onDrop ? (e) => onDrop(e, status) : undefined}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => e.preventDefault()}
      className={`
        flex-1 min-w-0 rounded-lg border-2 p-4 transition-all
        ${isDraggingOver ? 'border-blue-500 bg-blue-50 shadow-lg' : statusColors[status] || 'bg-gray-50'}
      `}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
          <p className="text-xs text-gray-600 mt-1">{count} posts</p>
        </div>
      </div>

      <div className="space-y-3">
        {posts.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <p className="text-sm text-gray-500">Nenhum post</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
}
