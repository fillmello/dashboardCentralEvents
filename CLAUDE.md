# Festa de Multiplicação — Claude Code Guide

College capstone project (PUC Minas, ES 2026/1). A real-time **operations dashboard** for the **Festa de Multiplicação** event: a "Central de Posts" where distributed teams move content demands through a production pipeline ("esteira"), with role-scoped visibility, an event schedule (cronograma), KPIs and an event clock/timer. **No e-commerce** — there are no products, cart, payments or storefront. (The repo started as an e-commerce template and was repurposed.)

This file is the project-wide guide. App-specific guidance lives in [Codigo/festa-back/CLAUDE.md](Codigo/festa-back/CLAUDE.md) and [Codigo/festa-front/CLAUDE.md](Codigo/festa-front/CLAUDE.md) — Claude auto-loads the nearest one when working inside those folders.

## Repository layout

```
/Artefatos        Project documentation (READ-ONLY for Claude). NOTE: still being
                  migrated from the old e-commerce project — treat as historical
                  until refreshed for the dashboard.
/Codigo
  /festa-back     NestJS 11 + TypeORM + PostgreSQL REST API + Socket.IO gateway
  /festa-front    Next.js 16 + React 19 + Tailwind v4 web app
  docker-compose.yml          Local Postgres only
/Divulgacao       Presentation assets (videos, slides)
```

## Domain at a glance

- **Roles (RBAC, exact-match, no hierarchy):** `GESTOR` (full control), `DESIGNER` (own posts, advance pipeline up to Aprovação), `SOCIAL` (own posts, advance from Aprovação onward). Self-registration creates a **Designer**; a Gestor reassigns roles and creates other Gestores.
- **Post** = a demanda on the "mapa de posts" (name, platform, type, format, status, responsável). **PostStatusLog** = audit row written on every status change (powers stage-time KPIs).
- **Pipeline (RF-05):** `NAO_INICIADO → CAPTANDO → EDITANDO → CRIANDO → APROVACAO → CAPA_COPY → EM_PUBLICACAO → PUBLICADO`.
- **ScheduleItem** = a cronograma "momento" (planned vs. real start/end, RF-10–13).
- **Real-time (RNF-03):** changes pushed to all clients via Socket.IO (`post:*`, `schedule:changed`).

## Requirements (RF-01..RF-21 / RNF)

Requirements come from the "Levantamento de Requisitos — Dashboard Comunicação Praça" spec. When implementing one, check the matching module/route and keep the role matrix (RF-20) and pipeline permissions (RF-06) intact.

## Cross-cutting rules

**Package manager: pnpm only.** Both apps ship `pnpm-lock.yaml`. Never run `npm install` or `yarn`. Use `pnpm install`, `pnpm <script>`, `pnpm add` (only after confirmation).

**Conventional Commits:** `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`.

**Branch naming:** `{type}/{RF}-{short-description}` — e.g. `feat/RF05-pipeline`, `fix/RF11-schedule-delay`.

## Guardrails — do NOT do these without explicit permission

- **Never `git commit` or `git push`** automatically. Stage and propose, then wait.
- **Never run DB migrations or destructive SQL.** TypeORM `synchronize` is fine for local dev; a migration strategy is still open.
- **Never add a new dependency** to either `package.json` without first asking.
- **Never modify anything under `Artefatos/`** — submitted academic / signed documents. Read-only.

## Stack at a glance

| Layer        | Choice                                            |
|--------------|---------------------------------------------------|
| Frontend     | Next.js 16, React 19, Tailwind v4, Biome, axios, socket.io-client |
| Backend      | NestJS 11, TypeORM, class-validator, JWT (RBAC), Socket.IO |
| Database     | PostgreSQL 18 (local via docker-compose)          |
| Hosting (planned) | Railway/Render (back), Vercel (front)        |

Local dev: `docker compose -f Codigo/docker-compose.yml up -d` starts Postgres on `localhost:5432` (user `postgres`, password `festa123`, db `festa_multiplicacao`).

> **First Gestor bootstrap:** self-registration only creates Designers. Promote the first Gestor manually: `UPDATE usr SET role='gestor' WHERE email='...';` (no seed/CLI yet).
