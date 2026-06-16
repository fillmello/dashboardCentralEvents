"use client";

import { useState } from "react";
import { Alert } from "@/app/components/Alert";
import { ConfirmModal } from "@/app/components/ConfirmModal";
import {
  firstProductionStatus,
  PLATFORM_LABELS,
  POST_FORMAT_LABELS,
  POST_TYPE_LABELS,
  type PostStatus,
  STATUS_LABELS,
  statusIndex,
} from "@/src/lib/domain";
import { type Post, postService } from "@/src/services/post.service";

const GRAY = "text-[#6a6a6a]";
const AMBER = "text-[#c58a00]";
const GREEN = "text-green-700";

// What the logged-in user can do on a given post. The production responsible
// does "Começar" (→ Criando/Editando, by type) then "Entregar" (→ Aprovação);
// the Copy/Capa assignees each deliver their part in the combined Copy & Capa
// stage. "start"/"deliver" change the status; "copy"/"capa" call deliver().
type TaskAction = {
  kind: "start" | "deliver" | "copy" | "capa";
  label: string;
  target?: PostStatus; // present for status changes (start/deliver)
  confirm?: string; // confirmation is skipped only for "start"
};

function actionFor(post: Post, userId: number): TaskAction | null {
  const isMain = post.responsible?.id === userId;
  const isCopy = post.copyResponsible?.id === userId;
  const isCapa = post.capaResponsible?.id === userId;
  const production = firstProductionStatus(post.type);

  if (isMain) {
    if (post.status === "nao_iniciado")
      return { kind: "start", label: "Começar", target: production };
    if (post.status === production)
      return {
        kind: "deliver",
        label: "Entregar",
        target: "aprovacao",
        confirm: `Confirmar a entrega de "${post.name}"? Ela irá para aprovação.`,
      };
  }
  if (
    isCopy &&
    post.status === "copy_capa" &&
    post.needsCopy &&
    !post.copyDelivered
  )
    return {
      kind: "copy",
      label: "Entregar copy",
      confirm: `Entregar a copy de "${post.name}"?`,
    };
  if (
    isCapa &&
    post.status === "copy_capa" &&
    post.needsCapa &&
    !post.capaDelivered
  )
    return {
      kind: "capa",
      label: "Entregar capa",
      confirm: `Entregar a capa de "${post.name}"?`,
    };
  return null;
}

// Label for the post's current stage, from this user's perspective.
function statusView(
  post: Post,
  userId: number,
  action: TaskAction | null,
): { text: string; tone: string } {
  if (action?.kind === "start") return { text: "Não iniciado", tone: GRAY };
  if (action?.kind === "deliver")
    return { text: STATUS_LABELS[post.status], tone: AMBER };
  if (action?.kind === "copy") return { text: "Copy pendente", tone: AMBER };
  if (action?.kind === "capa") return { text: "Capa pendente", tone: AMBER };

  const isMain = post.responsible?.id === userId;
  const isCopy = post.copyResponsible?.id === userId;
  const isCapa = post.capaResponsible?.id === userId;

  if (post.status === "publicado") return { text: "Publicado", tone: GREEN };
  if (isMain && statusIndex(post.status) >= statusIndex("aprovacao"))
    return { text: "Entregue", tone: GREEN };
  if (isCopy && post.copyDelivered)
    return { text: "Copy entregue", tone: GREEN };
  if (isCapa && post.capaDelivered)
    return { text: "Capa entregue", tone: GREEN };
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

type Props = {
  posts: Post[];
  userId: number;
  isLoading: boolean;
  error: string | null;
  onChanged: () => void;
  emptyText?: string;
};

// Focused "my tasks" view (the Operativo task list, also offered to a Head who
// received demands). Responsive: one column on mobile, multiple on desktop.
export function OwnTasksView({
  posts,
  userId,
  isLoading,
  error,
  onChanged,
  emptyText = "Nenhuma tarefa atribuída a você.",
}: Props) {
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pending, setPending] = useState<{
    post: Post;
    action: TaskAction;
  } | null>(null);

  const runAction = async (post: Post, action: TaskAction) => {
    setBusyId(post.id);
    setActionError(null);
    try {
      if (action.kind === "copy" || action.kind === "capa")
        await postService.deliver(post.id, action.kind);
      else if (action.target)
        await postService.setStatus(post.id, action.target);
      onChanged();
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

  return (
    <div>
      {(error || actionError) && (
        <Alert message={error ?? actionError ?? ""} className="mb-4" />
      )}

      {isLoading ? (
        <p className="mono text-[#6a6a6a]">Carregando...</p>
      ) : posts.length === 0 ? (
        <p className="mono text-[#6a6a6a]">{emptyText}</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const action = actionFor(post, userId);
            const view = statusView(post, userId, action);
            const tags = roleTags(post, userId);
            const busy = busyId === post.id;
            return (
              <article
                key={post.id}
                className="flex flex-col justify-between gap-3 border border-black bg-white p-4"
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
                        action.kind === "start"
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
