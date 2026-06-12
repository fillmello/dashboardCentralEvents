"use client";

import { useState } from "react";
import { Alert } from "@/app/components/Alert";
import {
  canDeliver,
  canStart,
  DELIVERED_STATUS,
  PLATFORM_LABELS,
  POST_FORMAT_LABELS,
  POST_TYPE_LABELS,
  STARTED_STATUS,
} from "@/src/lib/domain";
import { usePosts } from "@/src/hooks/usePosts";
import { useRouteGuard } from "@/src/hooks/useRouteGuard";
import { type Post, postService } from "@/src/services/post.service";

// Simplified 3-state label for the Individual view.
function simpleStatus(post: Post): { text: string; tone: string } {
  if (post.status === "nao_iniciado")
    return { text: "Não iniciada", tone: "text-[#6a6a6a]" };
  if (post.status === "publicado")
    return { text: "Entregue", tone: "text-green-700" };
  return { text: "Em andamento", tone: "text-[#c58a00]" };
}

export default function TarefasPage() {
  const { isChecking } = useRouteGuard("individual-only");
  const { posts, isLoading, error, reload } = usePosts({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const act = async (post: Post, target: typeof STARTED_STATUS) => {
    setBusyId(post.id);
    setActionError(null);
    try {
      await postService.setStatus(post.id, target);
      await reload();
    } catch (e) {
      setActionError(Array.isArray(e) ? e[0] : "Não foi possível atualizar");
    } finally {
      setBusyId(null);
    }
  };

  const deliver = async (post: Post) => {
    if (!window.confirm(`Confirmar a entrega de "${post.name}"?`)) return;
    await act(post, DELIVERED_STATUS);
  };

  if (isChecking) return null;

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <h1 className="display mb-1 text-xl">MINHAS TAREFAS</h1>
      <p className="mono mb-5 text-[#6a6a6a]">Suas demandas atribuídas</p>

      {(error || actionError) && (
        <Alert message={error ?? actionError ?? ""} className="mb-4" />
      )}

      {isLoading ? (
        <p className="mono text-[#6a6a6a]">Carregando...</p>
      ) : posts.length === 0 ? (
        <p className="mono text-[#6a6a6a]">Nenhuma tarefa atribuída a você.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => {
            const status = simpleStatus(post);
            const busy = busyId === post.id;
            return (
              <article
                key={post.id}
                className="flex flex-col gap-3 border border-black bg-white p-4"
              >
                <div>
                  <h2 className="text-base font-semibold leading-snug text-black">
                    {post.name}
                  </h2>
                  <p className="mono mt-1 text-[#888]">
                    {PLATFORM_LABELS[post.platform]} ·{" "}
                    {POST_TYPE_LABELS[post.type]} ·{" "}
                    {POST_FORMAT_LABELS[post.format]}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`mono ${status.tone}`}>{status.text}</span>

                  {canStart(post.status) && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => act(post, STARTED_STATUS)}
                      className="bg-black px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                    >
                      Começar
                    </button>
                  )}
                  {canDeliver(post.status) && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => deliver(post)}
                      className="border border-black px-5 py-2.5 text-sm font-semibold text-black hover:bg-black hover:text-white disabled:opacity-50"
                    >
                      Entregar
                    </button>
                  )}
                  {post.status === "publicado" && (
                    <span className="mono text-green-700">✓ Entregue</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
