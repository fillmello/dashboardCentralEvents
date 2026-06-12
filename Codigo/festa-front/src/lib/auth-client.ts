export type Role = "gestao" | "painel" | "individual";

export type AuthState = {
  isLoggedIn: boolean;
  isGestao: boolean;
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
    isPainel: role === "painel",
    isIndividual: role === "individual",
    role,
  };
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("access_token");
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
