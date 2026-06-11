'use client';

import { useEffect, useState, useCallback } from 'react';
import { Post, postsService } from '@/src/services/posts.service';
import { useUser } from './useUser';

export interface PostFilters {
  status?: string;
  platform?: string;
  type?: string;
  responsibleId?: string;
}

export function usePosts(filters?: PostFilters) {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const queryFilters: Record<string, any> = {
        ...filters,
      };

      // Se não for gestor, só vê seus próprios posts
      if (user.role !== 'gestor') {
        queryFilters.responsibleId = user.id;
      }

      const data = await postsService.list(queryFilters);
      setPosts(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar posts',
      );
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const refetch = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch };
}
