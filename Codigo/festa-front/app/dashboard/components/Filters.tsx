"use client";

import { Select } from "@/app/components/Select";
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
        <Select
          className="min-w-[150px]"
          ariaLabel="Filtrar por status"
          value={filters.status ?? ""}
          onChange={(v) =>
            set({ status: (v || undefined) as PostFilters["status"] })
          }
          options={[
            { value: "", label: "Todos os status" },
            ...PIPELINE.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
          ]}
        />
      )}

      <Select
        className="min-w-[150px]"
        ariaLabel="Filtrar por plataforma"
        value={filters.platform ?? ""}
        onChange={(v) =>
          set({ platform: (v || undefined) as PostFilters["platform"] })
        }
        options={[
          { value: "", label: "Todas as plataformas" },
          ...PLATFORMS.map((p) => ({ value: p, label: PLATFORM_LABELS[p] })),
        ]}
      />

      <Select
        className="min-w-[150px]"
        ariaLabel="Filtrar por tipo"
        value={filters.type ?? ""}
        onChange={(v) => set({ type: (v || undefined) as PostFilters["type"] })}
        options={[
          { value: "", label: "Todos os tipos" },
          ...POST_TYPES.map((t) => ({ value: t, label: POST_TYPE_LABELS[t] })),
        ]}
      />

      {canFilterResponsible && (
        <Select
          className="min-w-[150px]"
          ariaLabel="Filtrar por responsável"
          value={
            filters.responsibleId != null ? String(filters.responsibleId) : ""
          }
          onChange={(v) => set({ responsibleId: v ? Number(v) : undefined })}
          options={[
            { value: "", label: "Todos os responsáveis" },
            ...users.map((u) => ({ value: String(u.id), label: u.fullName })),
          ]}
        />
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
