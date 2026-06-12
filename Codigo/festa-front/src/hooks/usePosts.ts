"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSocket } from "@/src/lib/socket";
import { type Post, type PostFilters, postService } from "@/src/services/post.service";

const SOCKET_EVENTS = ["post:created", "post:updated", "post:deleted"] as const;
const CACHE_KEY = "praca:posts:cache";

// RNF-08: keep the last board snapshot for offline viewing during instability.
function readCache(): Post[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "[]") as Post[];
  } catch {
    return [];
  }
}

/**
 * Loads the (server-filtered, visibility-scoped) post list and keeps it fresh.
 * Socket events are treated as a "something changed" signal: we refetch the
 * authoritative list so the server stays the single source of truth for both
 * filtering (RF-04) and per-account visibility (RF-08/09).
 */
export function usePosts(filters: PostFilters) {
  const [posts, setPosts] = useState<Post[]>(readCache);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const reload = useCallback(async () => {
    try {
      const data = await postService.list(filtersRef.current);
      setPosts(data);
      setError(null);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      } catch {
        // storage full / unavailable — ignore, cache is best-effort
      }
    } catch (e) {
      setError(Array.isArray(e) ? e[0] : "Erro ao carregar os posts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refetch whenever filters change.
  useEffect(() => {
    setIsLoading(true);
    void reload();
  }, [reload, JSON.stringify(filters)]);

  // Subscribe to live changes. The socket singleton is shared across pages and
  // only torn down on logout, so we just detach our listeners on unmount.
  useEffect(() => {
    const socket = getSocket();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onChange = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void reload(), 150);
    };
    SOCKET_EVENTS.forEach((evt) => socket.on(evt, onChange));
    return () => {
      if (timer) clearTimeout(timer);
      SOCKET_EVENTS.forEach((evt) => socket.off(evt, onChange));
    };
  }, [reload]);

  return { posts, isLoading, error, reload };
}
