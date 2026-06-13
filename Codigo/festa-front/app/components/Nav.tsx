"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  type AuthState,
  getAuthState,
  subscribeToAuthChanges,
} from "@/src/lib/auth-client";
import { authService } from "@/src/services/auth.service";
import { RoleBadge } from "./RoleBadge";
import { Wordmark } from "./Wordmark";

function navLinkClass(active: boolean): string {
  return active
    ? "micro pb-1 border-b border-black text-black"
    : "micro pb-1 text-[#6a6a6a] hover:text-black transition-colors";
}

export function Nav() {
  const pathname = usePathname();
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => {
    const sync = () => setAuth(getAuthState());
    sync();
    return subscribeToAuthChanges(sync);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // logout always clears the local token; ignore network errors
    }
  };

  if (auth === null) return <NavShell />;

  return (
    <NavShell>
      <div className="flex items-center gap-7">
        {auth.isLoggedIn ? (
          <>
            {auth.isIndividual ? (
              <Link
                href="/tarefas"
                className={navLinkClass(pathname === "/tarefas")}
              >
                MINHAS TAREFAS
              </Link>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className={navLinkClass(pathname === "/dashboard")}
                >
                  MAPA DE POSTS
                </Link>
                <Link
                  href="/cronograma"
                  className={navLinkClass(pathname === "/cronograma")}
                >
                  CRONOGRAMA
                </Link>
                <Link
                  href="/painel"
                  className={navLinkClass(pathname === "/painel")}
                >
                  PAINEL
                </Link>
                {auth.isGestao && (
                  <Link
                    href="/team"
                    className={navLinkClass(pathname === "/team")}
                  >
                    EQUIPE
                  </Link>
                )}
              </>
            )}
            {auth.role && <RoleBadge role={auth.role} />}
            <button
              type="button"
              onClick={handleLogout}
              className={navLinkClass(false)}
            >
              SAIR
            </button>
          </>
        ) : (
          <Link href="/login" className={navLinkClass(pathname === "/login")}>
            ENTRAR
          </Link>
        )}
      </div>
    </NavShell>
  );
}

function NavShell({ children }: { children?: React.ReactNode }) {
  return (
    <nav className="sticky top-0 z-40 border-b border-black bg-white">
      <div className="relative flex h-[64px] items-center justify-between px-8">
        <Link href="/dashboard" className="inline-flex">
          <Wordmark size={20} />
        </Link>
        {children}
      </div>
    </nav>
  );
}
