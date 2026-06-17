"use client";

import { KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert } from "@/app/components/Alert";
import { ConfirmModal } from "@/app/components/ConfirmModal";
import { IconClose, IconTrash } from "@/app/components/icons";
import { useRouteGuard } from "@/src/hooks/useRouteGuard";
import type { Role } from "@/src/lib/auth-client";
import { ROLE_LABELS } from "@/src/lib/domain";
import { type UserProfile, userService } from "@/src/services/user.service";

const ROLES: Role[] = ["gestao", "head", "painel", "individual"];
const fieldClass =
  "border border-black bg-white px-3 py-2 text-sm text-black focus:outline-none";

export default function TeamPage() {
  const { isChecking } = useRouteGuard("gestao-only");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [removingUser, setRemovingUser] = useState<UserProfile | null>(null);
  const [resettingUser, setResettingUser] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = () => {
    userService
      .list()
      .then(setUsers)
      .catch((e) => setError(Array.isArray(e) ? e[0] : "Erro ao carregar"));
  };

  useEffect(() => {
    if (!isChecking) load();
  }, [isChecking]);

  const changeRole = async (id: number, role: Role) => {
    setError(null);
    try {
      await userService.updateRole(id, role);
      load();
    } catch (e: unknown) {
      setError(Array.isArray(e) ? e[0] : "Erro ao alterar o nível de acesso");
    }
  };

  const openReset = (u: UserProfile) => {
    setResettingUser(u);
    setNewPassword("");
    setError(null);
    setNotice(null);
  };

  const submitReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resettingUser) return;
    setError(null);
    setResetting(true);
    try {
      await userService.resetPassword(resettingUser.id, newPassword);
      setNotice(`Senha de ${resettingUser.fullName} redefinida com sucesso.`);
      setResettingUser(null);
      setNewPassword("");
    } catch (e: unknown) {
      setError(Array.isArray(e) ? e[0] : "Erro ao redefinir a senha");
    } finally {
      setResetting(false);
    }
  };

  const confirmRemoveUser = async () => {
    const u = removingUser;
    if (!u) return;
    setRemovingUser(null);
    setError(null);
    try {
      await userService.remove(u.id);
      load();
    } catch (e: unknown) {
      setError(Array.isArray(e) ? e[0] : "Erro ao remover");
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setError(null);
    setCreating(true);
    try {
      await userService.createManaged({
        fullName: (fd.get("fullName") as string).trim(),
        email: (fd.get("email") as string).trim(),
        password: fd.get("password") as string,
        role: fd.get("role") as Role,
      });
      form.reset();
      load();
    } catch (e: unknown) {
      setError(Array.isArray(e) ? e[0] : "Erro ao criar conta");
    } finally {
      setCreating(false);
    }
  };

  if (isChecking) return null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="display mb-6 text-xl">EQUIPE</h1>
      {error && <Alert message={error} className="mb-4" />}
      {notice && (
        <p className="mb-4 border border-green-700 px-3 py-2 text-sm text-green-700">
          {notice}
        </p>
      )}

      <div className="mb-8 border border-black">
        {users.map((u) => {
          // Keep the "at least one gestor" invariant: lock the last gestor's
          // role/removal in the UI (the backend enforces it too).
          const isLastGestor =
            u.role === "gestao" &&
            users.filter((x) => x.role === "gestao").length <= 1;
          return (
            <div
              key={u.id}
              className="flex items-center justify-between gap-3 border-b border-[#eee] px-4 py-3 last:border-b-0"
            >
              <div>
                <div className="text-sm font-medium text-black">
                  {u.fullName}
                </div>
                <div className="mono text-[#888]">{u.email}</div>
              </div>
              <div className="flex items-center gap-2">
                {isLastGestor && (
                  <span className="micro text-[#888]">único gestor</span>
                )}
                <select
                  value={u.role}
                  disabled={isLastGestor}
                  onChange={(e) => changeRole(u.id, e.target.value as Role)}
                  className={`${fieldClass} disabled:opacity-50`}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  aria-label="Redefinir senha"
                  title="Redefinir senha"
                  onClick={() => openReset(u)}
                  className="text-[#6a6a6a] hover:text-black"
                >
                  <KeyRound size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Remover"
                  disabled={isLastGestor}
                  onClick={() => setRemovingUser(u)}
                  className="text-[#6a6a6a] hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-[#6a6a6a]"
                >
                  <IconTrash size={16} />
                </button>
              </div>
            </div>
          );
        })}
        {users.length === 0 && (
          <p className="mono px-4 py-6 text-[#888]">Nenhum usuário.</p>
        )}
      </div>

      <h2 className="micro mb-3 text-black">CRIAR CONTA</h2>
      <form
        onSubmit={handleCreate}
        className="grid grid-cols-1 gap-3 border border-black p-4 sm:grid-cols-2"
      >
        <input
          name="fullName"
          required
          placeholder="Nome completo"
          className={fieldClass}
        />
        <input
          name="email"
          required
          type="email"
          placeholder="E-mail"
          className={fieldClass}
        />
        <input
          name="password"
          required
          type="password"
          placeholder="Senha"
          className={fieldClass}
        />
        <select name="role" defaultValue="gestao" className={fieldClass}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={creating}
          className="micro bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-50 sm:col-span-2"
        >
          {creating ? "CRIANDO..." : "CRIAR CONTA"}
        </button>
      </form>

      <ConfirmModal
        isOpen={removingUser !== null}
        title="Remover usuário"
        message={`Remover ${removingUser?.fullName ?? ""}? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        onConfirm={confirmRemoveUser}
        onCancel={() => setRemovingUser(null)}
      />

      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm border border-black bg-white">
            <header className="flex items-center justify-between border-b border-black px-5 py-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide">
                Redefinir senha
              </h2>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setResettingUser(null)}
              >
                <IconClose size={16} />
              </button>
            </header>
            <form className="space-y-4 px-5 py-5" onSubmit={submitReset}>
              <p className="text-sm text-[#555]">
                Nova senha para{" "}
                <span className="font-semibold text-black">
                  {resettingUser.fullName}
                </span>{" "}
                ({resettingUser.email}).
              </p>
              {error && <Alert message={error} />}
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full ${fieldClass}`}
              />
              <p className="mono text-xs text-[#888]">
                Mínimo 8 caracteres, com 1 maiúscula, 1 número e 1 símbolo.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="micro border border-black px-4 py-2 text-black hover:bg-black hover:text-white"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={resetting || newPassword.length === 0}
                  className="micro bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
                >
                  {resetting ? "SALVANDO..." : "REDEFINIR"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
