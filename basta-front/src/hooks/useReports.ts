'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  DashboardMetrics,
  UserMetrics,
  reportsService,
} from '@/src/services/reports.service';

export function useReports() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await reportsService.getDashboard();
      setMetrics(data || null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar métricas',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Atualizar a cada 5s

    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return { metrics, loading, error, refetch: fetchMetrics };
}

export function useUserMetrics(userId: string) {
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await reportsService.getUserMetrics(userId);
        setMetrics(data || null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar métricas',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [userId]);

  return { metrics, loading, error };
}
