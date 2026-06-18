"use client";

import { useState } from "react";
import { Alert } from "@/app/components/Alert";
import { IconClose } from "@/app/components/icons";
import { Select } from "@/app/components/Select";
import {
  formatsFor,
  isAssignableUser,
  PLATFORM_LABELS,
  PLATFORMS,
  type Platform,
  POST_FORMAT_LABELS,
  POST_TYPE_LABELS,
  POST_TYPES,
  type PostType,
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

// Busca tolerante a acento/maiúscula: "fil" casa com "Filipe", "joao" com "João".
const normalizeName = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

export function PostFormModal({ post, users, onClose, onSaved }: Props) {
  const isEdit = post !== null;
  // Only Head and Operativo can be made responsible (not Coordenação/Painel),
  // and never the demo/seed accounts.
  const assignableUsers = users.filter(isAssignableUser);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Responsável é um typeahead: digita-se parte do nome e as opções vão sendo
  // filtradas. O id selecionado vai num input oculto (responsibleId) para o
  // handleSubmit continuar lendo via FormData.
  const [responsibleId, setResponsibleId] = useState<number | null>(
    post?.responsible?.id ?? null,
  );
  const [respQuery, setRespQuery] = useState(post?.responsible?.fullName ?? "");
  const [respOpen, setRespOpen] = useState(false);
  const respMatches = assignableUsers.filter((u) =>
    normalizeName(u.fullName).includes(normalizeName(respQuery)),
  );

  // Platform/type/format are linked: the available formats depend on the chosen
  // platform + type, so we control them and reset the format when either change.
  const [platform, setPlatform] = useState<Platform>(
    post?.platform ?? PLATFORMS[0],
  );
  const [type, setType] = useState<PostType>(post?.type ?? POST_TYPES[0]);
  const formatOptions = formatsFor(platform, type);
  const [format, setFormat] = useState(
    post && formatsFor(post.platform, post.type).includes(post.format)
      ? post.format
      : formatOptions[0],
  );

  const changePlatform = (next: Platform) => {
    setPlatform(next);
    setFormat(formatsFor(next, type)[0]);
  };
  const changeType = (next: PostType) => {
    setType(next);
    setFormat(formatsFor(platform, next)[0]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const responsibleRaw = fd.get("responsibleId") as string;
    const dto = {
      name: (fd.get("name") as string).trim(),
      description:
        ((fd.get("description") as string) || "").trim() || undefined,
      responsibleId: responsibleRaw ? Number(responsibleRaw) : undefined,
      platform,
      type,
      format,
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
            <label htmlFor="responsible-search" className={labelClass}>
              Responsável
            </label>
            <input
              type="hidden"
              name="responsibleId"
              value={responsibleId ?? ""}
            />
            <div className="relative">
              <input
                id="responsible-search"
                type="text"
                autoComplete="off"
                placeholder="Sem responsável"
                value={respQuery}
                onChange={(e) => {
                  setRespQuery(e.target.value);
                  setResponsibleId(null);
                  setRespOpen(true);
                }}
                onFocus={() => setRespOpen(true)}
                onBlur={() => setRespOpen(false)}
                className={fieldClass}
              />
              {respQuery && (
                <button
                  type="button"
                  aria-label="Limpar responsável"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setResponsibleId(null);
                    setRespQuery("");
                    setRespOpen(false);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-black"
                >
                  <IconClose size={14} />
                </button>
              )}
              {respOpen && respMatches.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto border border-black bg-white">
                  {respMatches.map((u) => (
                    <li key={u.id}>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setResponsibleId(u.id);
                          setRespQuery(u.fullName);
                          setRespOpen(false);
                        }}
                        className="block w-full px-3 py-2 text-left text-sm text-black hover:bg-black hover:text-white"
                      >
                        {u.fullName}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {respOpen && respQuery && respMatches.length === 0 && (
                <div className="absolute z-10 mt-1 w-full border border-black bg-white px-3 py-2 text-sm text-black">
                  Nenhum responsável encontrado
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="platform" className={labelClass}>
                Plataforma
              </label>
              <Select
                id="platform"
                value={platform}
                onChange={(v) => changePlatform(v as Platform)}
                options={PLATFORMS.map((p) => ({
                  value: p,
                  label: PLATFORM_LABELS[p],
                }))}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="type" className={labelClass}>
                Tipo
              </label>
              <Select
                id="type"
                value={type}
                onChange={(v) => changeType(v as PostType)}
                options={POST_TYPES.map((t) => ({
                  value: t,
                  label: POST_TYPE_LABELS[t],
                }))}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="format" className={labelClass}>
                Formato
              </label>
              <Select
                id="format"
                value={format}
                onChange={(v) => setFormat(v as (typeof formatOptions)[number])}
                options={formatOptions.map((f) => ({
                  value: f,
                  label: POST_FORMAT_LABELS[f],
                }))}
              />
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
