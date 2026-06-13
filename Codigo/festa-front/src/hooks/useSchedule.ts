"use client";

import { useCallback, useEffect, useState } from "react";
import { getSocket } from "@/src/lib/socket";
import {
  type ScheduleItem,
  scheduleService,
} from "@/src/services/schedule.service";

const CACHE_KEY = "praca:schedule:cache";

function readCache(): ScheduleItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(
      localStorage.getItem(CACHE_KEY) ?? "[]",
    ) as ScheduleItem[];
  } catch {
    return [];
  }
}

// RF-10..13 list, kept live via the `schedule:changed` socket signal (RNF-03)
// and cached for offline viewing (RNF-08).
export function useSchedule() {
  const [items, setItems] = useState<ScheduleItem[]>(readCache);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const data = await scheduleService.list();
      setItems(data);
      setError(null);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      } catch {
        // best-effort cache
      }
    } catch (e) {
      setError(Array.isArray(e) ? e[0] : "Erro ao carregar o cronograma");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    const socket = getSocket();
    const onChange = () => void reload();
    socket.on("schedule:changed", onChange);
    return () => {
      socket.off("schedule:changed", onChange);
    };
  }, [reload]);

  return { items, isLoading, error, reload };
}
