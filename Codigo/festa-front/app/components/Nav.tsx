"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  type AuthState,
  getAuthState,
  subscribeToAuthChanges,
} from "@/src/lib/auth-client";
import {
  HEAD_VIEW_LABELS,
  type HeadView,
  setHeadView,
} from "@/src/lib/headView";
import { authService } from "@/src/services/auth.service";
import { HeadViewBadge } from "./HeadViewBadge";
import { RoleBadge } from "./RoleBadge";
import { Wordmark } from "./Wordmark";

function navLinkClass(active: boolean): string {
  return active
    ? "micro pb-1 border-b border-black text-black"
    : "micro pb-1 text-[#6a6a6a] hover:text-black transition-colors";
}

type NavLink = { href: string; label: string };

function linksFor(auth: AuthState): NavLink[] {
  if (!auth.isLoggedIn) return [];
  if (auth.isIndividual) return [{ href: "/tarefas", label: "MINHAS TAREFAS" }];
  return [
    { href: "/dashboard", label: "MAPA DE POSTS" },
    { href: "/cronograma", label: "CRONOGRAMA" },
    { href: "/painel", label: "PAINEL" },
    ...(auth.isGestao ? [{ href: "/team", label: "EQUIPE" }] : []),
  ];
}

export function Nav() {
  const pathname = usePathname();
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const links = auth ? linksFor(auth) : [];
  // The mobile hamburger only makes sense with more than one section. The
  // Individual (single page) just gets a "Sair" button inline.
  const hasMenu = links.length > 1;

  return (
    <nav className="sticky top-0 z-40 border-b border-black bg-white">
      <div className="relative flex h-[64px] items-center justify-between px-4 sm:px-8">
        <Link href="/dashboard" className="inline-flex shrink-0">
          <Wordmark size={18} />
        </Link>

        {auth === null ? null : !auth.isLoggedIn ? (
          <Link href="/login" className={navLinkClass(pathname === "/login")}>
            ENTRAR
          </Link>
        ) : (
          <>
            {/* Desktop bar */}
            <div className="hidden items-center gap-7 sm:flex">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={navLinkClass(pathname === l.href)}
                >
                  {l.label}
                </Link>
              ))}
              {auth.isHead ? (
                <HeadViewBadge />
              ) : (
                auth.role && <RoleBadge role={auth.role} />
              )}
              <button
                type="button"
                onClick={handleLogout}
                className={navLinkClass(false)}
              >
                SAIR
              </button>
            </div>

            {/* Mobile: hamburger for multi-section roles, inline "Sair" for the
                Individual (single page). Role badge is desktop-only. */}
            {hasMenu ? (
              <button
                type="button"
                aria-label="Abrir menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
                className="text-black sm:hidden"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className={`${navLinkClass(false)} sm:hidden`}
              >
                SAIR
              </button>
            )}
          </>
        )}
      </div>

      {/* Mobile dropdown (multi-section roles only) */}
      {hasMenu && menuOpen && (
        <div className="flex flex-col items-start gap-4 border-t border-black px-4 py-4 sm:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={navLinkClass(pathname === l.href)}
            >
              {l.label}
            </Link>
          ))}
          {auth?.isHead && (
            <div className="flex flex-col items-start gap-3 border-t border-[#eee] pt-3">
              <span className="micro text-[#888]">VISUALIZAÇÃO</span>
              {(["kanban", "lista", "minhas"] as HeadView[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setHeadView(v);
                    setMenuOpen(false);
                  }}
                  className={navLinkClass(false)}
                >
                  {HEAD_VIEW_LABELS[v]}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className={navLinkClass(false)}
          >
            SAIR
          </button>
        </div>
      )}
    </nav>
  );
}
