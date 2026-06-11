'use client';

import { useEffect, useState } from 'react';

export enum Role {
  GESTOR = 'gestor',
  DESIGNER = 'designer',
  SOCIAL_MEDIA = 'social_media',
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = () => {
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (err) {
        setError('Erro ao carregar usuário');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return { user, loading, error };
}

export function canAdvanceTo(role: Role, targetStatus: string): boolean {
  const statusOrder = [
    'nao_iniciado',
    'captando',
    'editando',
    'criando',
    'aprovacao',
    'copy_capa',
    'em_publicacao',
    'publicado',
  ];

  if (role === Role.GESTOR) {
    return true;
  }

  if (role === Role.DESIGNER) {
    const designerLimit = statusOrder.indexOf('aprovacao');
    return statusOrder.indexOf(targetStatus) <= designerLimit;
  }

  if (role === Role.SOCIAL_MEDIA) {
    const socialMediaStart = statusOrder.indexOf('aprovacao');
    return statusOrder.indexOf(targetStatus) >= socialMediaStart;
  }

  return false;
}

export function canEditPost(role: Role): boolean {
  return role === Role.GESTOR;
}

export function canViewAllPosts(role: Role): boolean {
  return role === Role.GESTOR;
}
