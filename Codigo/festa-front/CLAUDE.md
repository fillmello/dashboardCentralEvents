@AGENTS.md

# festa-front — Claude Code Guide

Next.js 16 + React 19 web app for the **Festa de Multiplicação** dashboard. See the repo-root [CLAUDE.md](../../CLAUDE.md) for project-wide rules.

> The `@AGENTS.md` import above is intentional: **this is not the Next.js you know from your training data.** Read `node_modules/next/dist/docs/` before writing Next code, and heed deprecation notices.

## Stack

- **Next.js 16** (App Router under `app/`), **React 19**, **Tailwind v4**, **Biome 2**
- **axios** single instance + refresh-token interceptor (`src/lib/api.ts`)
- **socket.io-client** singleton (`src/lib/socket.ts`) for real-time board/schedule updates
- **lucide-react** for icons

## Folder layout

```
app/
  layout.tsx        Root layout: fonts, Nav, page <main>
  page.tsx          Auth-aware redirect (→ /dashboard or /login)
  login/            Login + self-register (new accounts = Designer)
  dashboard/        MAPA DE POSTS — the pipeline board (columns, filters, role badge)
  cronograma/       Schedule + EventClock + EventTimer
  painel/           KPIs (Gestor-only) + CSV export
  team/             Gestor: list/role-manage/create users
  components/        Nav, Wordmark, RoleBadge, Alert, icons, ...
src/
  lib/              api.ts, auth-client.ts (role helpers), socket.ts, domain.ts (enums/labels/transition rules)
  hooks/            useRouteGuard, usePosts, useSchedule
  services/         auth, user, post, schedule, metrics, clock
```

## Auth model (understand before touching anything)

- `access_token` in **localStorage**, attached as `Authorization: Bearer …` by `src/lib/api.ts`.
- `refresh_token` in an **HttpOnly cookie** (frontend never reads it). On `401`, `api.ts` calls `POST /auth/refresh`, queues parallel requests, retries; on failure clears the token and redirects to `/login`.
- `role` (`gestor`/`designer`/`social`) is read from the JWT payload for nav/UI gating only — **security is server-side**. Helpers in `src/lib/auth-client.ts`.
- Token logic uses `localStorage`/`window`, so auth-aware code must be `"use client"`.

## Real-time

`src/lib/socket.ts` exposes a **singleton** socket (token sent in the handshake). It stays connected across page navigations and is torn down only on logout (`disconnectSocket()` in `authService.logout`). Hooks attach/detach listeners but must **not** disconnect on unmount. `usePosts`/`useSchedule` treat socket events as a "refetch now" signal so the server stays the source of truth for filtering + visibility; both also cache the last snapshot in `localStorage` for offline viewing (RNF-08).

## Conventions

- **API calls go through `src/services/*`**, never raw axios in a component. The response interceptor already unwraps `{ data }`.
- Domain enums, labels and the client-side transition rules (mirror of the backend) live in `src/lib/domain.ts` — reuse them, don't redefine.
- API base URL: `NEXT_PUBLIC_API_URL` (set in `.env`); the socket connects to the same URL.
- **Tailwind v4** utility-first; brutalist black/white palette (`border-black`, `.mono`/`.micro`/`.display` helpers in `globals.css`).
- Components PascalCase; new files `.tsx`. Routes are folders with `page.tsx`.
- **All user-facing copy in Portuguese (pt-BR).** Code identifiers/comments in English.

## Scripts (pnpm)

```bash
pnpm dev      # next dev — http://localhost:3000
pnpm build    # next build
pnpm lint     # biome check
pnpm format   # biome format --write
```

## Guardrails specific to the frontend

- **Do not add packages** without confirming first.
- **Do not assume Next.js APIs from training data exist.** Verify in `node_modules/next/dist/docs/`.
- **Do not put `access_token` in cookies** or `refresh_token` in `localStorage` — the split is intentional.
- **Do not bypass `src/lib/api.ts`** with raw `fetch`/`axios` (the CSV export in `/painel` is the one deliberate exception — it needs the raw blob).
