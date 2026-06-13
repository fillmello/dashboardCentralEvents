"use client";

import type { Role } from "@/src/lib/auth-client";
import { type PostStatus, STATUS_COLOR, STATUS_LABELS } from "@/src/lib/domain";
import type { Post } from "@/src/services/post.service";
import { PostCard } from "./PostCard";

type Props = {
  status: PostStatus;
  posts: Post[];
  role: Role;
  busyId: number | null;
  onAdvance: (post: Post) => void;
  onRevert: (post: Post) => void;
  onApprove: (post: Post) => void;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
};

export function PipelineColumn({
  status,
  posts,
  role,
  busyId,
  onAdvance,
  onRevert,
  onApprove,
  onEdit,
  onDelete,
}: Props) {
  return (
    <section className="flex w-[260px] shrink-0 flex-col">
      <header
        className="flex items-center justify-between border-b-2 px-2 py-2"
        style={{ borderColor: STATUS_COLOR[status] }}
      >
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: STATUS_COLOR[status] }}
          />
          <span className="micro text-black">{STATUS_LABELS[status]}</span>
        </span>
        <span className="mono text-[#888]">{posts.length}</span>
      </header>

      <div className="flex flex-1 flex-col gap-2 bg-[#fafafa] p-2">
        {posts.length === 0 ? (
          <p className="mono py-6 text-center text-[#c0c0c0]">—</p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              role={role}
              busy={busyId === post.id}
              onAdvance={onAdvance}
              onRevert={onRevert}
              onApprove={onApprove}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </section>
  );
}
