"use client";

import {
  PIPELINE,
  PLATFORM_LABELS,
  PLATFORMS,
  POST_TYPE_LABELS,
  POST_TYPES,
  STATUS_LABELS,
} from "@/src/lib/domain";
import type { PostFilters } from "@/src/services/post.service";
import type { UserProfile } from "@/src/services/user.service";

const selectClass =
  "border border-black bg-white px-2.5 py-1.5 text-sm text-black focus:outline-none";

type Props = {
  filters: PostFilters;
  onChange: (next: PostFilters) => void;
  canFilterResponsible: boolean;
  users: UserProfile[];
  // The Kanban already groups by status in columns, so the status filter is
  // redundant there and hidden.
  showStatus?: boolean;
};

// RF-04: quick filters by type, status, plataforma and responsável.
export function Filters({
  filters,
  onChange,
  canFilterResponsible,
  users,
  showStatus = true,
}: Props) {
  const set = (patch: Partial<PostFilters>) =>
    onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showStatus && (
        <select
          className={selectClass}
          value={filters.status ?? ""}
          onChange={(e) =>
            set({
              status: (e.target.value || undefined) as PostFilters["status"],
            })
          }
        >
          <option value="">Todos os status</option>
          {PIPELINE.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      )}

      <select
        className={selectClass}
        value={filters.platform ?? ""}
        onChange={(e) =>
          set({
            platform: (e.target.value || undefined) as PostFilters["platform"],
          })
        }
      >
        <option value="">Todas as plataformas</option>
        {PLATFORMS.map((p) => (
          <option key={p} value={p}>
            {PLATFORM_LABELS[p]}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={filters.type ?? ""}
        onChange={(e) =>
          set({ type: (e.target.value || undefined) as PostFilters["type"] })
        }
      >
        <option value="">Todos os tipos</option>
        {POST_TYPES.map((t) => (
          <option key={t} value={t}>
            {POST_TYPE_LABELS[t]}
          </option>
        ))}
      </select>

      {canFilterResponsible && (
        <select
          className={selectClass}
          value={filters.responsibleId ?? ""}
          onChange={(e) =>
            set({
              responsibleId: e.target.value
                ? Number(e.target.value)
                : undefined,
            })
          }
        >
          <option value="">Todos os responsáveis</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.fullName}
            </option>
          ))}
        </select>
      )}

      <button
        type="button"
        onClick={() => onChange({})}
        className="micro border border-black px-3 py-1.5 text-black hover:bg-black hover:text-white"
      >
        LIMPAR
      </button>
    </div>
  );
}
