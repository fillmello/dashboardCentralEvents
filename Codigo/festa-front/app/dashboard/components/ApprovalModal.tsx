"use client";

import { useState } from "react";
import { Alert } from "@/app/components/Alert";
import { IconClose } from "@/app/components/icons";
import { isAssignableUser } from "@/src/lib/domain";
import { type Post, postService } from "@/src/services/post.service";
import type { UserProfile } from "@/src/services/user.service";

type Props = {
  post: Post;
  users: UserProfile[];
  onClose: () => void;
  onApproved: () => void;
};

const fieldClass =
  "w-full border border-black bg-white px-3 py-2 text-sm text-black focus:outline-none disabled:bg-[#f3f3f3] disabled:text-[#aaa]";
const labelClass = "text-xs font-medium text-black";

// Approval (RF-06): the Gestão decides whether Copy and Capa are needed and who
// does each. Assignees are Head or Operativo — they complete the step in "Minhas
// Tarefas".
export function ApprovalModal({ post, users, onClose, onApproved }: Props) {
  const assignableUsers = users.filter(isAssignableUser);
  const [needsCopy, setNeedsCopy] = useState(true);
  const [needsCapa, setNeedsCapa] = useState(true);
  const [copyId, setCopyId] = useState("");
  const [capaId, setCapaId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (needsCopy && !copyId) {
      setError("Selecione um responsável pela copy");
      return;
    }
    if (needsCapa && !capaId) {
      setError("Selecione um responsável pela capa");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await postService.approve(post.id, {
        needsCopy,
        copyResponsibleId: needsCopy ? Number(copyId) : undefined,
        needsCapa,
        capaResponsibleId: needsCapa ? Number(capaId) : undefined,
      });
      onApproved();
    } catch (err: unknown) {
      setError(Array.isArray(err) ? err[0] : "Erro ao aprovar o post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md border border-black bg-white">
        <header className="flex items-center justify-between border-b border-black px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            Aprovar post
          </h2>
          <button type="button" aria-label="Fechar" onClick={onClose}>
            <IconClose size={16} />
          </button>
        </header>

        <form className="space-y-5 px-5 py-5" onSubmit={handleSubmit}>
          <p className="text-sm text-[#555]">
            Aprovando{" "}
            <span className="font-semibold text-black">{post.name}</span>.
            Defina as etapas de Copy e Capa.
          </p>

          {error && <Alert message={error} />}

          {/* Copy */}
          <div className="space-y-2 border border-[#ddd] p-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-black">
              <input
                type="checkbox"
                checked={needsCopy}
                onChange={(e) => setNeedsCopy(e.target.checked)}
                className="h-4 w-4 accent-black"
              />
              Precisa de Copy
            </label>
            <div className="space-y-1.5">
              <label htmlFor="copyId" className={labelClass}>
                Responsável pela copy
              </label>
              <select
                id="copyId"
                value={copyId}
                disabled={!needsCopy}
                onChange={(e) => setCopyId(e.target.value)}
                className={fieldClass}
              >
                <option value="">Selecione…</option>
                {assignableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Capa */}
          <div className="space-y-2 border border-[#ddd] p-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-black">
              <input
                type="checkbox"
                checked={needsCapa}
                onChange={(e) => setNeedsCapa(e.target.checked)}
                className="h-4 w-4 accent-black"
              />
              Precisa de Capa
            </label>
            <div className="space-y-1.5">
              <label htmlFor="capaId" className={labelClass}>
                Responsável pela capa
              </label>
              <select
                id="capaId"
                value={capaId}
                disabled={!needsCapa}
                onChange={(e) => setCapaId(e.target.value)}
                className={fieldClass}
              >
                <option value="">Selecione…</option>
                {assignableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!needsCopy && !needsCapa && (
            <p className="mono text-[#888]">
              Sem Copy nem Capa — o post vai direto para Em publicação.
            </p>
          )}

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
              {saving ? "APROVANDO..." : "APROVAR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
