@AGENTS.md

# basta-front — Claude Code Guide

Next.js 16 + React 19 web app for Basta Fabric. See the repo-root [CLAUDE.md](../../CLAUDE.md) for project-wide rules (pnpm, commits, guardrails, Artefatos/).

> The `@AGENTS.md` import above is intentional: **this is not the Next.js you know from your training data.** Read `node_modules/next/dist/docs/` before writing Next code, and heed deprecation notices.

## Stack

- **Next.js 16** (App Router under `app/`)
- **React 19** + Server/Client components
- **Tailwind CSS v4** (PostCSS pipeline via `@tailwindcss/postcss`)
- **Biome 2** for lint + format (no ESLint/Prettier here)
- **axios** with a single configured instance + auth interceptor (`src/lib/api.ts`)
- **lucide-react** for icons

## Folder layout

```
app/                Next.js App Router (routes, layouts, route-level components)
  layout.tsx        Root layout: fonts, Header, Footer, page <main>
  page.tsx          Home
  not-found.tsx
  login/            RF01
  product/          RF02, RF09, RF10 (manage/register/edit + listing)
  collection/       RF03 (manage/register/edit + listing)
  cart/             RF11
  my-area/          RF19 — nested layout for profile + address
  components/       Cross-route UI (Header, Footer, Sidebar, ProductCard, CartIcon, BannerPreview)
src/
  lib/api.ts        axios instance with refresh-token interceptor
  services/         One file per backend resource: auth, user, product, collection, cart, address, release
public/             Static assets
```

## Auth model (must understand before touching anything)

Matches the backend (see [Artefatos/obsidian/RF01-Usuario-realiza-login.md](../../Artefatos/obsidian/RF01-Usuario-realiza-login.md)):

- `access_token` is stored in **`localStorage`** and attached as `Authorization: Bearer …` by the request interceptor in `src/lib/api.ts`. TTL is set by the backend via `JWT_EXPIRATION` (default 1 hour).
- `refresh_token` is set by the backend in an **HttpOnly cookie**. The frontend never reads it. TTL is set via `JWT_REFRESH_EXPIRATION` (default 3 days).
- On a `401`, `api.ts` calls `POST /auth/refresh`, queues parallel requests, and retries them. On refresh failure it clears `access_token` and redirects to `/login`.
- The user `role` is in the JWT payload — the frontend may use it for navigation gating, but security is enforced server-side. A user tampering with their local role just gets blocked by the API.

Because token logic lives in `localStorage` + `window.location`, the auth-aware parts must run on the client (`"use client"` files).

## Conventions

- **API calls go through `src/services/*`**, never directly through axios in a component. Services use the configured `api` instance from `src/lib/api.ts`.
- The response interceptor unwraps `{ data: ... }` already — services return the inner `data` directly.
- Environment variable for the API base URL: `NEXT_PUBLIC_API_URL` (loaded via the `dotenv` package; ensure `.env.local` is set).
- **Tailwind v4**: utility-first; no global theme file beyond `app/globals.css`. Existing pages use the brand palette `bg-[#f4f3ef]` / `text-[#171717]` (see `app/layout.tsx`).
- **Components named in PascalCase**, files match the export name (`Header.tsx`, `ProductCard.jsx`). A few legacy `.jsx` files exist; new components should be `.tsx`.
- **Routes are folders** under `app/` with a `page.tsx`. Nested layouts (`my-area/layout.tsx`) are encouraged for shared chrome.
- **No client-only code in Server Components.** Add `"use client"` at the top of files that use hooks, browser APIs, or the axios instance.
- **All user-facing copy in Portuguese (pt-BR).** Every string the end user reads — labels, buttons, headings, placeholders, error messages, toasts, confirm dialogs, empty states — must be in Portuguese, for both the customer-facing routes and the admin area. Keep code identifiers, comments and console logs in English. When editing an existing screen, flag and fix any English copy you encounter (e.g. "Colors" → "Cores", "Sizes" → "Tamanhos", "Add to Cart" → "Adicionar ao carrinho", "Loading..." → "Carregando...").

## RFs and Artefatos

Before building or changing a screen, read the matching UI mockup in [Artefatos/documento-interface-de-usuario/](../../Artefatos/documento-interface-de-usuario/) (filenames embed the RF number) and the use-case diagram in [Artefatos/casos-de-uso/](../../Artefatos/casos-de-uso/).

## Scripts (pnpm)

```bash
pnpm install
pnpm dev        # next dev — http://localhost:3000
pnpm build      # next build
pnpm start      # next start
pnpm lint       # biome check
pnpm format     # biome format --write
```

## Guardrails specific to the frontend

- **Do not add packages** to `package.json` without confirming first. The dependency list is intentionally small.
- **Do not assume Next.js APIs from your training data exist.** Next 16 has breaking changes — verify in `node_modules/next/dist/docs/` (e.g. router APIs, caching, request APIs, metadata).
- **Do not put `access_token` in cookies** or `refresh_token` in `localStorage` — the split is intentional.
- **Do not bypass `src/lib/api.ts`** with raw `fetch`/`axios` calls; the refresh logic must run for every authenticated request.
