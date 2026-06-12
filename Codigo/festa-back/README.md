# festa-back

REST API + Socket.IO gateway for the **Festa de Multiplicação** dashboard, built with NestJS.

---

## Project Setup

1. Create your `.env` file inside `/festa-back` (use `.env.example` as a reference).
2. Start Postgres: `docker compose -f ../docker-compose.yml up -d`
3. Install dependencies: `pnpm install`
4. Start the dev server: `pnpm run start:dev`

---

## Authentication

- JWT access token (localStorage on the client) + refresh token (HttpOnly cookie).
- Role-based access control (RBAC): `gestor`, `designer`, `social` — exact-match, no hierarchy.

---

## Project Architecture

```
/src
  /auth      Decorators (@Roles/@Public), guards, JWT
  /common    DTOs, entities, enums, filters, interceptors
  /data      Database connection and env validation
  /modules   Features (MVC + REST): users, posts, schedule, metrics, clock
```

Real-time updates are pushed through Socket.IO gateways (`posts`, `schedule`).

---

## Contributing

- **Branch naming:** `{type}/{requirement}-{short-description}` — e.g. `feat/RF05-pipeline`
- **Commits (Conventional Commits):** `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
