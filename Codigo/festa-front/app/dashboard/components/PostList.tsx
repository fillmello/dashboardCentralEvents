"use client";

import {
  PLATFORM_LABELS,
  POST_FORMAT_LABELS,
  POST_TYPE_LABELS,
  STATUS_COLOR,
  STATUS_LABELS,
} from "@/src/lib/domain";
import type { Post } from "@/src/services/post.service";

// Painel-only: detailed, read-only table of every post (desktop layout). Replaces
// the kanban for Painel accounts — same data, but listed with the responsável
// shown explicitly per row.
type Props = {
  posts: Post[];
};

const TH = "micro px-4 py-2 text-[#6a6a6a] font-normal";
const TD = "px-4 py-3 align-top";

export function PostList({ posts }: Props) {
  return (
    <table className="w-full min-w-[820px] border-collapse text-sm">
      <thead>
        <tr className="border-b border-black text-left">
          <th className={TH}>POST</th>
          <th className={TH}>PLATAFORMA</th>
          <th className={TH}>TIPO</th>
          <th className={TH}>FORMATO</th>
          <th className={TH}>STATUS</th>
          <th className={TH}>RESPONSÁVEL</th>
        </tr>
      </thead>
      <tbody>
        {posts.map((post) => (
          <tr
            key={post.id}
            className="border-b border-[#eee] hover:bg-[#fafafa]"
          >
            <td className={TD}>
              <div className="font-semibold leading-snug text-black">
                {post.name}
              </div>
              {post.description && (
                <div className="mt-0.5 line-clamp-2 text-xs text-[#6a6a6a]">
                  {post.description}
                </div>
              )}
            </td>
            <td className={`${TD} text-[#555]`}>
              {PLATFORM_LABELS[post.platform]}
            </td>
            <td className={`${TD} text-[#555]`}>
              {POST_TYPE_LABELS[post.type]}
            </td>
            <td className={`${TD} text-[#555]`}>
              {POST_FORMAT_LABELS[post.format]}
            </td>
            <td className={TD}>
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: STATUS_COLOR[post.status] }}
                />
                {STATUS_LABELS[post.status]}
              </span>
            </td>
            <td className={`${TD} mono text-[#555]`}>
              {post.responsible ? post.responsible.fullName : "Sem responsável"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
