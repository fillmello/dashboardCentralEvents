'use client';

import { Post } from '@/src/services/posts.service';

interface PostCardProps {
  post: Post;
  onDragStart?: (e: React.DragEvent, post: Post) => void;
}

function formatTimeAgo(date: string): string {
  const now = new Date();
  const updated = new Date(date);
  const seconds = Math.floor((now.getTime() - updated.getTime()) / 1000);

  if (seconds < 60) return 'agora mesmo';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m atrás`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`;
  return `${Math.floor(seconds / 86400)}d atrás`;
}

export function PostCard({ post, onDragStart }: PostCardProps) {
  const statusLabels: Record<string, string> = {
    nao_iniciado: 'Não iniciado',
    captando: 'Captando',
    editando: 'Editando',
    criando: 'Criando',
    aprovacao: 'Aprovação',
    copy_capa: 'Capa/Copy',
    em_publicacao: 'Em publicação',
    publicado: 'Publicado',
  };

  const platformIcons: Record<string, string> = {
    instagram: '📷',
    whatsapp: '💬',
    youtube: '▶️',
  };

  const typeIcons: Record<string, string> = {
    criativo: '✨',
    video: '🎥',
  };

  const formatIcons: Record<string, string> = {
    feed: 'F',
    story: 'S',
    reels: 'R',
    capa: 'C',
  };

  return (
    <div
      draggable
      onDragStart={onDragStart ? (e) => onDragStart(e, post) : undefined}
      className="group relative rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md hover:border-blue-300 cursor-grab active:cursor-grabbing"
    >
      <div className="space-y-2">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600">
            {post.title}
          </h4>
          {post.description && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {post.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-lg">{platformIcons[post.platform] || '📱'}</span>
          <span className="text-lg">{typeIcons[post.type] || '📄'}</span>
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
            {formatIcons[post.format] || 'O'}
          </span>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <div>👤 {post.responsible?.fullName || 'Sem atribuição'}</div>
          {post.updatedAt && (
            <div>
              ⏱ {formatTimeAgo(post.updatedAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
