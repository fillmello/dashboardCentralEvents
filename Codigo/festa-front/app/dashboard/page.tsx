"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/app/components/Alert";
import { IconPlus } from "@/app/components/icons";
import { getAuthState, type Role } from "@/src/lib/auth-client";
import { nextStatus, PIPELINE, prevStatus } from "@/src/lib/domain";
import { usePosts } from "@/src/hooks/usePosts";
import { useRouteGuard } from "@/src/hooks/useRouteGuard";
import { type Post, type PostFilters, postService } from "@/src/services/post.service";
import { type UserProfile, userService } from "@/src/services/user.service";
import { Filters } from "./components/Filters";
import { PipelineColumn } from "./components/PipelineColumn";
import { PostFormModal } from "./components/PostFormModal";
import { SchedulePanel } from "./components/SchedulePanel";
import { StatusLegend } from "./components/StatusLegend";

export default function DashboardPage() {
  const { isChecking } = useRouteGuard("view-all");
  const [role, setRole] = useState<Role | null>(null);
  const [filters, setFilters] = useState<PostFilters>({});
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);

  const { posts, isLoading, error, reload } = usePosts(filters);

  useEffect(() => {
    setRole(getAuthState().role);
  }, []);

  // Gestão edits; both Gestão and Painel see everything (and can filter by
  // responsável). Painel is read-only.
  const isGestao = role === "gestao";

  useEffect(() => {
    if (role !== "gestao" && role !== "painel") return;
    userService
      .list()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, [role]);

  const byStatus = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const status of PIPELINE) map.set(status, []);
    for (const post of posts) map.get(post.status)?.push(post);
    return map;
  }, [posts]);

  const runStatusChange = async (post: Post, target: ReturnType<typeof nextStatus>) => {
    if (!target) return;
    setBusyId(post.id);
    setActionError(null);
    try {
      await postService.setStatus(post.id, target);
      await reload();
    } catch (e: unknown) {
      setActionError(Array.isArray(e) ? e[0] : "Não foi possível mover o post");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (post: Post) => {
    if (!window.confirm(`Remover o post "${post.name}"?`)) return;
    setBusyId(post.id);
    setActionError(null);
    try {
      await postService.remove(post.id);
      await reload();
    } catch (e: unknown) {
      setActionError(Array.isArray(e) ? e[0] : "Não foi possível remover");
    } finally {
      setBusyId(null);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (post: Post) => {
    setEditing(post);
    setModalOpen(true);
  };

  if (isChecking || role === null) return null;

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      <div className="flex flex-col gap-3 border-b border-black px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="display text-xl">MAPA DE POSTS</h1>
          {isGestao && (
            <button
              type="button"
              onClick={openCreate}
              className="micro inline-flex items-center gap-1.5 bg-black px-3 py-2 text-white hover:opacity-90"
            >
              <IconPlus size={12} /> NOVO POST
            </button>
          )}
        </div>
        <StatusLegend />
        <Filters
          filters={filters}
          onChange={setFilters}
          canFilterResponsible
          users={users}
        />
        {(error || actionError) && (
          <Alert message={error ?? actionError ?? ""} />
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Programação à esquerda do kanban (Gestão e Painel) */}
        <SchedulePanel />

        <div className="flex-1 overflow-x-auto">
          {isLoading ? (
            <p className="mono p-10 text-[#6a6a6a]">Carregando...</p>
          ) : posts.length === 0 ? (
            <p className="mono p-10 text-[#6a6a6a]">
              Nenhum post encontrado.
              {isGestao ? " Crie o primeiro com “Novo post”." : ""}
            </p>
          ) : (
            <div className="flex h-full gap-3 p-4">
              {PIPELINE.map((status) => (
                <PipelineColumn
                  key={status}
                  status={status}
                  posts={byStatus.get(status) ?? []}
                  role={role}
                  busyId={busyId}
                  onAdvance={(p) => runStatusChange(p, nextStatus(p.status))}
                  onRevert={(p) => runStatusChange(p, prevStatus(p.status))}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <PostFormModal
          post={editing}
          users={users}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            void reload();
          }}
        />
      )}
    </div>
  );
}
