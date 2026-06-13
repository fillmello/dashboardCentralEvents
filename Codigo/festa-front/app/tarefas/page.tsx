"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/app/components/Alert";
import { ConfirmModal } from "@/app/components/ConfirmModal";
import { usePosts } from "@/src/hooks/usePosts";
import { useRouteGuard } from "@/src/hooks/useRouteGuard";
import { getUserId } from "@/src/lib/auth-client";
import {
  CAPA_NEXT_STATUS,
  copyNextStatus,
  PLATFORM_LABELS,
  POST_FORMAT_LABELS,
  POST_TYPE_LABELS,
  type PostStatus,
  statusIndex,
} from "@/src/lib/domain";
import { type Post, postService } from "@/src/services/post.service";

const GRAY = "text-[#6a6a6a]";
const AMBER = "text-[#c58a00]";
const GREEN = "text-green-700";

// What the logged-in Individual can do on a given post, based on which
// responsável they are (produção / copy / capa) and the current stage. The
// production flow advances one stage at a time: Começar → Avançar → Entregar.
type TaskAction = {
  kind: "start" | "advance" | "deliver" | "copy" | "capa";
  label: string;
  target: PostStatus;
  // Confirmation is skipped for "start"/"advance"; the rest confirm first.
  confirm?: string;
};

function actionFor(post: Post, userId: number): TaskAction | null {
  const isMain = post.responsible?.id === userId;
  const isCopy = post.copyResponsible?.id === userId;
  const isCapa = post.capaResponsible?.id === userId;

  if (isMain) {
    if (post.status === "nao_iniciado")
      return { kind: "start", label: "Começar", target: "captando" };
    if (post.status === "captando")
      return { kind: "advance", label: "Avançar", target: "editando" };
    if (post.status === "editando")
      return {
        kind: "deliver",
        label: "Entregar",
        target: "aprovacao",
        confirm: `Confirmar a entrega de "${post.name}"? Ela irá para aprovação.`,
      };
  }
  if (isCopy && post.status === "copy")
    return {
      kind: "copy",
      label: "Concluir copy",
      target: copyNextStatus(post.needsCapa),
      confirm: `Concluir a copy de "${post.name}"?`,
    };
  if (isCapa && post.status === "capa")
    return {
      kind: "capa",
      label: "Concluir capa",
      target: CAPA_NEXT_STATUS,
      confirm: `Concluir a capa de "${post.name}"?`,
    };
  return null;
}

// Label for the post's current stage, from this user's perspective. While the
// user has a pending action it names the stage that action is on (Não iniciado →
// Captando → Editando → Entregue); otherwise it reflects a done/waiting state.
function statusView(
  post: Post,
  userId: number,
  action: TaskAction | null,
): { text: string; tone: string } {
  if (action?.kind === "start") return { text: "Não iniciado", tone: GRAY };
  if (action?.kind === "advance") return { text: "Captando", tone: AMBER };
  if (action?.kind === "deliver") return { text: "Editando", tone: AMBER };
  if (action?.kind === "copy") return { text: "Copy", tone: AMBER };
  if (action?.kind === "capa") return { text: "Capa", tone: AMBER };

  const isMain = post.responsible?.id === userId;
  const isCopy = post.copyResponsible?.id === userId;
  const isCapa = post.capaResponsible?.id === userId;
  const idx = statusIndex(post.status);

  if (post.status === "publicado") return { text: "Publicado", tone: GREEN };
  if (isMain && idx >= statusIndex("aprovacao"))
    return { text: "Entregue", tone: GREEN };
  if (isCopy && idx > statusIndex("copy"))
    return { text: "Copy concluída", tone: GREEN };
  if (isCapa && idx > statusIndex("capa"))
    return { text: "Capa concluída", tone: GREEN };
  return { text: "Aguardando", tone: AMBER };
}

// Tag describing the user's role on this post (a person may hold more than one).
function roleTags(post: Post, userId: number): string[] {
  const tags: string[] = [];
  if (post.responsible?.id === userId) tags.push("Produção");
  if (post.copyResponsible?.id === userId) tags.push("Copy");
  if (post.capaResponsible?.id === userId) tags.push("Capa");
  return tags;
}

export default function TarefasPage() {
  const { isChecking } = useRouteGuard("individual-only");
  const { posts, isLoading, error, reload } = usePosts({});
  const [userId, setUserId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pending, setPending] = useState<{
    post: Post;
    action: TaskAction;
  } | null>(null);

  useEffect(() => {
    setUserId(getUserId());
  }, []);

  const runAction = async (post: Post, action: TaskAction) => {
    setBusyId(post.id);
    setActionError(null);
    try {
      await postService.setStatus(post.id, action.target);
      await reload();
    } catch (e) {
      setActionError(Array.isArray(e) ? e[0] : "Não foi possível atualizar");
    } finally {
      setBusyId(null);
    }
  };

  // Actions with a confirm message open the modal; the rest run immediately.
  const trigger = (post: Post, action: TaskAction) => {
    if (action.confirm) setPending({ post, action });
    else void runAction(post, action);
  };

  if (isChecking || userId === null) return null;

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
            const action = actionFor(post, userId);
            const view = statusView(post, userId, action);
            const tags = roleTags(post, userId);
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
                  {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="micro border border-[#ddd] px-1.5 py-0.5 text-[#555]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className={`mono ${view.tone}`}>{view.text}</span>

                  {action ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => trigger(post, action)}
                      className={
                        action.kind === "start" || action.kind === "advance"
                          ? "bg-black px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                          : "border border-black px-5 py-2.5 text-sm font-semibold text-black hover:bg-black hover:text-white disabled:opacity-50"
                      }
                    >
                      {action.label}
                    </button>
                  ) : (
                    view.tone === GREEN && (
                      <span className="mono text-green-700">✓</span>
                    )
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={pending !== null}
        title={pending?.action.label ?? "Confirmar"}
        message={pending?.action.confirm ?? ""}
        confirmLabel="Confirmar"
        onConfirm={() => {
          if (pending) void runAction(pending.post, pending.action);
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
