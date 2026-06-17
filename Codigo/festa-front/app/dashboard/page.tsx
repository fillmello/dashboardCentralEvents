"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/app/components/Alert";
import { ConfirmModal } from "@/app/components/ConfirmModal";
import { IconPlus } from "@/app/components/icons";
import { OwnTasksView } from "@/app/components/OwnTasksView";
import { useHeadView } from "@/src/hooks/useHeadView";
import { usePosts } from "@/src/hooks/usePosts";
import { useRouteGuard } from "@/src/hooks/useRouteGuard";
import { getAuthState, getUserId, type Role } from "@/src/lib/auth-client";
import {
  managesBoard,
  nextStatus,
  PIPELINE,
  prevStatus,
} from "@/src/lib/domain";
import { getSocket } from "@/src/lib/socket";
import {
  type GeneralKpis,
  metricsService,
} from "@/src/services/metrics.service";
import {
  type Post,
  type PostFilters,
  postService,
} from "@/src/services/post.service";
import { type UserProfile, userService } from "@/src/services/user.service";
import { ApprovalModal } from "./components/ApprovalModal";
import { Filters } from "./components/Filters";
import { PipelineColumn } from "./components/PipelineColumn";
import { PostFormModal } from "./components/PostFormModal";
import { PostList } from "./components/PostList";
import { PublishedProgress } from "./components/PublishedProgress";
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
  const [approving, setApproving] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState<Post | null>(null);
  const [general, setGeneral] = useState<GeneralKpis | null>(null);
  // Head is a team lead who may also be assigned demands, so they pick how to
  // view the board (kanban / lista / minhas) via the MODO HEAD badge dropdown.
  const headView = useHeadView();

  const { posts, isLoading, error, reload } = usePosts(filters);

  useEffect(() => {
    setRole(getAuthState().role);
  }, []);

  // Coordenação + Head manage the board (create/edit/delete/move). Painel is
  // read-only and gets a list + published-progress bar instead of the kanban.
  const canManage = managesBoard(role);
  const isPainel = role === "painel";
  const isHead = role === "head";
  // Effective layout: Coordenação → kanban, Painel → list, Head → their choice.
  const view: "kanban" | "lista" | "minhas" = isHead
    ? headView
    : isPainel
      ? "lista"
      : "kanban";
  const uid = getUserId();
  const myPosts =
    view === "minhas" && uid !== null
      ? posts.filter(
          (p) =>
            p.responsible?.id === uid ||
            p.copyResponsible?.id === uid ||
            p.capaResponsible?.id === uid,
        )
      : posts;

  // Coordenação + Head + Painel: keep the published-progress figure live. Load
  // once, then refetch the global KPIs on the same post events the board listens to.
  useEffect(() => {
    if (role !== "painel" && role !== "head" && role !== "gestao") return;
    const loadGeneral = () => {
      metricsService
        .general()
        .then(setGeneral)
        .catch(() => setGeneral(null));
    };
    loadGeneral();
    const socket = getSocket();
    const events = ["post:created", "post:updated", "post:deleted"] as const;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onChange = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(loadGeneral, 200);
    };
    events.forEach((evt) => {
      socket.on(evt, onChange);
    });
    return () => {
      if (timer) clearTimeout(timer);
      events.forEach((evt) => {
        socket.off(evt, onChange);
      });
    };
  }, [role]);

  useEffect(() => {
    if (!canManage && role !== "painel") return;
    userService
      .list()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, [role, canManage]);

  const byStatus = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const status of PIPELINE) map.set(status, []);
    for (const post of posts) map.get(post.status)?.push(post);
    return map;
  }, [posts]);

  const runStatusChange = async (
    post: Post,
    target: ReturnType<typeof nextStatus>,
  ) => {
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

  const confirmDelete = async () => {
    const post = deleting;
    if (!post) return;
    setDeleting(null);
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
        <h1 className="display text-xl">MAPA DE POSTS</h1>
        {(isPainel || canManage) && (
          <PublishedProgress
            published={general?.published ?? 0}
            total={general?.total ?? 0}
            pct={general?.publishedPct ?? 0}
          />
        )}
        {view !== "minhas" && (
          <>
            {/* A esteira já é visível nas colunas do Kanban; a legenda só ajuda na Lista. */}
            {view !== "kanban" && <StatusLegend />}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Filters
                filters={filters}
                onChange={setFilters}
                canFilterResponsible
                users={users}
              />
              {canManage && view === "kanban" && (
                <button
                  type="button"
                  onClick={openCreate}
                  className="micro inline-flex items-center gap-1.5 bg-black px-3 py-2 text-white hover:opacity-90"
                >
                  <IconPlus size={12} /> NOVO POST
                </button>
              )}
            </div>
          </>
        )}
        {(error || actionError) && (
          <Alert message={error ?? actionError ?? ""} />
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Programação à esquerda do quadro (não no modo "minhas tarefas") */}
        {view !== "minhas" && <SchedulePanel />}

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <p className="mono p-10 text-[#6a6a6a]">Carregando...</p>
          ) : view === "minhas" ? (
            <div className="p-4">
              <OwnTasksView
                posts={myPosts}
                userId={uid ?? -1}
                isLoading={false}
                error={null}
                onChanged={reload}
                emptyText="Você não tem tarefas atribuídas."
                layout="rows"
              />
            </div>
          ) : posts.length === 0 ? (
            <p className="mono p-10 text-[#6a6a6a]">
              Nenhum post encontrado.
              {canManage ? " Crie o primeiro com “Novo post”." : ""}
            </p>
          ) : view === "lista" ? (
            <PostList posts={posts} />
          ) : (
            <div className="flex h-full gap-3 p-4">
              {PIPELINE.map((status) => (
                <PipelineColumn
                  key={status}
                  status={status}
                  posts={byStatus.get(status) ?? []}
                  role={role}
                  busyId={busyId}
                  onAdvance={(p) =>
                    runStatusChange(p, nextStatus(p.status, p.type, p.format))
                  }
                  onRevert={(p) =>
                    runStatusChange(p, prevStatus(p.status, p.type, p.format))
                  }
                  onApprove={setApproving}
                  onEdit={openEdit}
                  onDelete={setDeleting}
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

      {approving && (
        <ApprovalModal
          post={approving}
          users={users}
          onClose={() => setApproving(null)}
          onApproved={() => {
            setApproving(null);
            void reload();
          }}
        />
      )}

      <ConfirmModal
        isOpen={deleting !== null}
        title="Remover post"
        message={`Remover o post "${deleting?.name ?? ""}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
