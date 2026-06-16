"use client";

import { IconEdit, IconTrash } from "@/app/components/icons";
import type { Role } from "@/src/lib/auth-client";
import {
  canAdvance,
  canRevert,
  isApprovalStage,
  managesBoard,
  nextStatus,
  PLATFORM_LABELS,
  POST_FORMAT_LABELS,
  POST_TYPE_LABELS,
  prevStatus,
  STATUS_LABELS,
} from "@/src/lib/domain";
import type { Post } from "@/src/services/post.service";

type Props = {
  post: Post;
  role: Role;
  busy: boolean;
  onAdvance: (post: Post) => void;
  onRevert: (post: Post) => void;
  onApprove: (post: Post) => void;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
};

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="micro border border-[#ddd] px-1.5 py-0.5 text-[#555]">
      {children}
    </span>
  );
}

export function PostCard({
  post,
  role,
  busy,
  onAdvance,
  onRevert,
  onApprove,
  onEdit,
  onDelete,
}: Props) {
  const next = nextStatus(post.status, post.type);
  const prev = prevStatus(post.status, post.type);
  const canManage = managesBoard(role);
  const showApprove = canManage && isApprovalStage(post.status);
  const showAdvance = canAdvance(role, post.status, post.type) && next;
  const showRevert = canRevert(role) && prev;
  const inCopyCapa = post.status === "copy_capa";

  return (
    <article className="flex flex-col gap-2 border border-black bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug text-black">
          {post.name}
        </h3>
        {canManage && (
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              aria-label="Editar"
              onClick={() => onEdit(post)}
              className="text-[#6a6a6a] hover:text-black"
            >
              <IconEdit size={14} />
            </button>
            <button
              type="button"
              aria-label="Remover"
              onClick={() => onDelete(post)}
              className="text-[#6a6a6a] hover:text-red-600"
            >
              <IconTrash size={14} />
            </button>
          </div>
        )}
      </div>

      {post.description && (
        <p className="line-clamp-2 text-xs text-[#6a6a6a]">
          {post.description}
        </p>
      )}

      <div className="flex flex-wrap gap-1">
        <Chip>{PLATFORM_LABELS[post.platform]}</Chip>
        <Chip>{POST_TYPE_LABELS[post.type]}</Chip>
        <Chip>{POST_FORMAT_LABELS[post.format]}</Chip>
      </div>

      <div className="mono text-[#888]">
        {post.responsible ? post.responsible.fullName : "Sem responsável"}
      </div>

      {(post.copyResponsible || post.capaResponsible) && (
        <div className="mono flex flex-col gap-0.5 text-[#888]">
          {post.copyResponsible && (
            <span>Copy: {post.copyResponsible.fullName}</span>
          )}
          {post.capaResponsible && (
            <span>Capa: {post.capaResponsible.fullName}</span>
          )}
        </div>
      )}

      {/* In Copy & Capa, show whether each task was delivered. */}
      {inCopyCapa && (
        <div className="flex flex-wrap gap-1">
          {post.needsCopy && (
            <span
              className={`micro border px-1.5 py-0.5 ${
                post.copyDelivered
                  ? "border-green-700 text-green-700"
                  : "border-[#c58a00] text-[#c58a00]"
              }`}
            >
              Copy {post.copyDelivered ? "✓ entregue" : "• pendente"}
            </span>
          )}
          {post.needsCapa && (
            <span
              className={`micro border px-1.5 py-0.5 ${
                post.capaDelivered
                  ? "border-green-700 text-green-700"
                  : "border-[#c58a00] text-[#c58a00]"
              }`}
            >
              Capa {post.capaDelivered ? "✓ entregue" : "• pendente"}
            </span>
          )}
        </div>
      )}

      {(showApprove || showAdvance || showRevert) && (
        <div className="flex gap-1.5 pt-1">
          {showRevert && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onRevert(post)}
              className="micro border border-black px-2 py-1 text-black hover:bg-black hover:text-white disabled:opacity-50"
            >
              ← {prev && STATUS_LABELS[prev]}
            </button>
          )}
          {showApprove && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onApprove(post)}
              className="micro flex-1 bg-black px-2 py-1 text-white hover:opacity-90 disabled:opacity-50"
            >
              Aprovar →
            </button>
          )}
          {showAdvance && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onAdvance(post)}
              className="micro flex-1 bg-black px-2 py-1 text-white hover:opacity-90 disabled:opacity-50"
            >
              {next && STATUS_LABELS[next]} →
            </button>
          )}
        </div>
      )}
    </article>
  );
}
