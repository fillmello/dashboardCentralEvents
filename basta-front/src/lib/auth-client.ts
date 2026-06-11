export type AuthState = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  role: string | null;
};

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
  if (typeof window === "undefined") {
    return { isLoggedIn: false, isAdmin: false, role: null };
  }
  const token = window.localStorage.getItem("access_token");
  if (!token) return { isLoggedIn: false, isAdmin: false, role: null };
  const payload = parseTokenPayload(token);
  const role = payload?.role ?? null;
  return {
    isLoggedIn: true,
    isAdmin: role === "admin",
    role,
  };
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
