"use client";

import { useState } from "react";
import { Alert } from "@/app/components/Alert";
import { IconClose } from "@/app/components/icons";
import {
  PLATFORM_LABELS,
  PLATFORMS,
  POST_FORMAT_LABELS,
  POST_FORMATS,
  POST_TYPE_LABELS,
  POST_TYPES,
} from "@/src/lib/domain";
import { type Post, postService } from "@/src/services/post.service";
import type { UserProfile } from "@/src/services/user.service";

type Props = {
  post: Post | null; // null → create
  users: UserProfile[];
  onClose: () => void;
  onSaved: () => void;
};

const fieldClass =
  "w-full border border-black bg-white px-3 py-2 text-sm text-black focus:outline-none";
const labelClass = "text-xs font-medium text-black";

export function PostFormModal({ post, users, onClose, onSaved }: Props) {
  const isEdit = post !== null;
  // RF-20: Painel accounts can't be made responsible for a post.
  const assignableUsers = users.filter((u) => u.role !== "painel");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const responsibleRaw = fd.get("responsibleId") as string;
    const dto = {
      name: (fd.get("name") as string).trim(),
      description:
        ((fd.get("description") as string) || "").trim() || undefined,
      responsibleId: responsibleRaw ? Number(responsibleRaw) : undefined,
      platform: fd.get("platform") as Post["platform"],
      type: fd.get("type") as Post["type"],
      format: fd.get("format") as Post["format"],
    };
    if (!dto.name) {
      setError("O nome do post é obrigatório");
      return;
    }

    setError(null);
    setSaving(true);
    try {
      if (isEdit) await postService.update(post.id, dto);
      else await postService.create(dto);
      onSaved();
    } catch (err: unknown) {
      setError(Array.isArray(err) ? err[0] : "Erro ao salvar o post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg border border-black bg-white">
        <header className="flex items-center justify-between border-b border-black px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            {isEdit ? "Editar post" : "Novo post"}
          </h2>
          <button type="button" aria-label="Fechar" onClick={onClose}>
            <IconClose size={16} />
          </button>
        </header>

        <form className="space-y-4 px-5 py-5" onSubmit={handleSubmit}>
          {error && <Alert message={error} />}

          <div className="space-y-1.5">
            <label htmlFor="name" className={labelClass}>
              Nome / descrição
            </label>
            <input
              id="name"
              name="name"
              defaultValue={post?.name ?? ""}
              maxLength={150}
              className={fieldClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className={labelClass}>
              Detalhes (opcional)
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={post?.description ?? ""}
              maxLength={2000}
              rows={2}
              className={fieldClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="responsibleId" className={labelClass}>
              Responsável
            </label>
            <select
              id="responsibleId"
              name="responsibleId"
              defaultValue={post?.responsible?.id ?? ""}
              className={fieldClass}
            >
              <option value="">Sem responsável</option>
              {assignableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="platform" className={labelClass}>
                Plataforma
              </label>
              <select
                id="platform"
                name="platform"
                defaultValue={post?.platform ?? PLATFORMS[0]}
                className={fieldClass}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {PLATFORM_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="type" className={labelClass}>
                Tipo
              </label>
              <select
                id="type"
                name="type"
                defaultValue={post?.type ?? POST_TYPES[0]}
                className={fieldClass}
              >
                {POST_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {POST_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="format" className={labelClass}>
                Formato
              </label>
              <select
                id="format"
                name="format"
                defaultValue={post?.format ?? POST_FORMATS[0]}
                className={fieldClass}
              >
                {POST_FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {POST_FORMAT_LABELS[f]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="micro border border-black px-4 py-2 text-black hover:bg-black hover:text-white"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              disabled={saving}
              className="micro bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "SALVANDO..." : "SALVAR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
