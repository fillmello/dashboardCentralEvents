// Values are kept stable for back-compat; display names ("Coordenação",
// "Operativo") live in ROLE_LABELS. `head` is the team-lead role.
export type Role = "gestao" | "head" | "painel" | "individual";

export type AuthState = {
  isLoggedIn: boolean;
  isGestao: boolean;
  isHead: boolean;
  isPainel: boolean;
  isIndividual: boolean;
  role: Role | null;
};

// Where each role lands after login.
export function homePathForRole(role: Role | null): string {
  return role === "individual" ? "/tarefas" : "/dashboard";
}

type TokenPayload = {
  role?: string;
  sub?: number | string;
  exp?: number;
  iat?: number;
};

export function parseTokenPayload(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    return JSON.parse(atob(parts[1])) as TokenPayload;
  } catch {
    return null;
  }
}

export function getAuthState(): AuthState {
  const empty: AuthState = {
    isLoggedIn: false,
    isGestao: false,
    isHead: false,
    isPainel: false,
    isIndividual: false,
    role: null,
  };
  if (typeof window === "undefined") return empty;
  const token = window.localStorage.getItem("access_token");
  if (!token) return empty;
  const payload = parseTokenPayload(token);
  const role = (payload?.role as Role | undefined) ?? null;
  return {
    isLoggedIn: true,
    isGestao: role === "gestao",
    isHead: role === "head",
    isPainel: role === "painel",
    isIndividual: role === "individual",
    role,
  };
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("access_token");
}

// Current user id (JWT `sub`) — used to tell which responsável the logged-in
// Individual is on a post (produção, copy or capa).
export function getUserId(): number | null {
  const token = getAccessToken();
  if (!token) return null;
  const sub = parseTokenPayload(token)?.sub;
  if (sub === undefined || sub === null) return null;
  const id = Number(sub);
  return Number.isFinite(id) ? id : null;
}

export function subscribeToAuthChanges(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("auth-change", cb);
  return () => window.removeEventListener("auth-change", cb);
}

export function emitAuthChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("auth-change"));
}

// Only allow internal paths as post-login redirect targets — rejects
// absolute (`https://evil.com`) and protocol-relative (`//evil.com`) URLs.
export function getSafeRedirectPath(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}
