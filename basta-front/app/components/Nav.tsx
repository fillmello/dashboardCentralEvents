"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  type AuthState,
  getAuthState,
  subscribeToAuthChanges,
} from "@/src/lib/auth-client";
import { authService } from "@/src/services/auth.service";
import { IconCart } from "./icons";
import { Wordmark } from "./Wordmark";

type AdminLink = { href: string; label: string };

const ADMIN_LINKS: AdminLink[] = [
  { href: "/product/manage", label: "PRODUTOS" },
  { href: "/collection/manage", label: "COLEÇÕES" },
  { href: "/release/manage", label: "LOTES" },
  { href: "/admin", label: "PEDIDOS" },
  { href: "/feedback", label: "FEEDBACK" },
];

function navLinkClass(active: boolean): string {
  return active
    ? "micro pb-1 border-b border-black text-black"
    : "micro pb-1 text-[color:var(--gray-500)] hover:text-black transition-colors";
}

export function Nav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
      // logout always clears local token; ignore network errors
    }
  };

  if (auth === null) {
    // SSR / pre-hydration: render a stable skeleton so the nav doesn't jump
    return <NavShell />;
  }

  const loginMode = searchParams.get("mode") ?? "login";
  const isLoginPage = pathname === "/login";

  return (
    <NavShell>
      {auth.isAdmin ? (
        <>
          {ADMIN_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={navLinkClass(pathname === link.href)}
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className={navLinkClass(false)}
          >
            SAIR
          </button>
        </>
      ) : auth.isLoggedIn ? (
        <>
          <Link
            href="/my-area/profile"
            className={navLinkClass(pathname.startsWith("/my-area"))}
          >
            MINHA ÁREA
          </Link>
          <Link
            href="/cart"
            className={`${navLinkClass(pathname === "/cart")} inline-flex items-center gap-2`}
          >
            <IconCart size={14} />
            <span>CARRINHO</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className={navLinkClass(false)}
          >
            SAIR
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login?mode=login"
            className={navLinkClass(isLoginPage && loginMode === "login")}
          >
            ENTRAR
          </Link>
          <Link
            href="/login?mode=register"
            className={navLinkClass(isLoginPage && loginMode === "register")}
          >
            CADASTRAR-SE
          </Link>
        </>
      )}
    </NavShell>
  );
}

function NavShell({ children }: { children?: React.ReactNode }) {
  return (
    <nav className="sticky top-0 z-40 border-b border-black bg-white">
      <div className="flex h-[72px] items-center justify-between px-8">
        <Link href="/" className="inline-flex">
          <Wordmark size={22} />
        </Link>
        <div className="flex items-center justify-end gap-7">{children}</div>
      </div>
    </nav>
  );
}
