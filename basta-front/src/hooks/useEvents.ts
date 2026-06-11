'use client';

import { useEffect, useState, useCallback } from 'react';
import { Evento, eventosService } from '@/src/services/eventos.service';

export function useEvents() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await eventosService.list();
      setEventos(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar eventos',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  const refetch = useCallback(() => {
    fetchEventos();
  }, [fetchEventos]);

  return { eventos, loading, error, refetch };
}

export function useEvento(id: string) {
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchEvento = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await eventosService.get(id);
        setEvento(data || null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar evento',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvento();
  }, [id]);

  return { evento, loading, error };
}

export function useEventoTimer(eventoId: string) {
  const [elapsed, setElapsed] = useState(0);
  const { evento } = useEvento(eventoId);

  useEffect(() => {
    if (!evento || evento.status !== 'ao_vivo') {
      setElapsed(evento?.tempoDecorridoMs || 0);
      return;
    }

    const startTime = new Date(evento.horaInicioReal || Date.now()).getTime();
    const baseElapsed = evento.tempoDecorridoMs || 0;

    const interval = setInterval(() => {
      const now = Date.now();
      const current = baseElapsed + (now - startTime);
      setElapsed(current);
    }, 100);

    return () => clearInterval(interval);
  }, [evento]);

  return { elapsed };
}
