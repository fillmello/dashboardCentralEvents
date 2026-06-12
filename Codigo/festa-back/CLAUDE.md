# festa-back — Claude Code Guide

NestJS 11 REST API + Socket.IO gateway for the **Festa de Multiplicação** dashboard. See the repo-root [CLAUDE.md](../../CLAUDE.md) for project-wide rules (pnpm, commits, guardrails, domain).

## Stack

- **NestJS 11** with TypeORM 0.3 + `pg`
- **PostgreSQL** (local via `Codigo/docker-compose.yml`)
- **Auth:** JWT access token + refresh token (HttpOnly cookie). TTLs via `JWT_EXPIRATION` / `JWT_REFRESH_EXPIRATION` (defaults 1h / 3d).
- **RBAC** via `@Roles()` + global `RolesGuard`. **Exact-match, no hierarchy.**
- **Real-time:** Socket.IO gateways (`PostsGateway`, `ScheduleGateway`), JWT-authenticated on handshake.
- **Validation:** `class-validator` / `class-transformer` via global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`).
- **Rate limiting:** `@nestjs/throttler`. **Hardening:** `helmet`, `cookie-parser`, CORS from `CORS_ORIGIN`.
- **Response shape:** global `ResponseInterceptor` wraps responses in `{ success, data }`. Routes that set a non-JSON `Content-Type` (e.g. CSV export) stream raw, bypassing the wrap.
- **Errors:** global `AllExceptionsFilter` + `process.on` guards in `main.ts`.

## Folder layout

```
src/
  main.ts                Bootstrap (helmet, cookies, CORS, global pipes/filters/interceptors)
  app.module.ts          Wires global guards (JwtAuthGuard, RolesGuard, ThrottlerGuard)
  auth/                  auth controller/service/module, jwt-payload.type, @Public/@Roles, guards
  common/
    dtos/                Per-endpoint DTOs (user, post, schedule, auth, shared)
    entities/            base.entity (id/createdAt/updatedAt), User, Post, PostStatusLog, ScheduleItem
    enums/               Role, Platform, PostType, PostFormat, PostStatus (+ PIPELINE_ORDER)
    filters/             AllExceptionsFilter
    interceptors/        ResponseInterceptor
  data/                  database.config.ts, env.validation.ts
  modules/
    users/               self-register→Designer, Gestor role mgmt + managed-account creation
    posts/               CRUD (Gestor), status pipeline (role-gated), visibility scoping, PostsGateway
    schedule/            cronograma CRUD + start/conclude, ScheduleGateway
    metrics/             KPIs (general/collaborators/stage-times) + CSV export (Gestor-only)
    clock/              server-time endpoint (synchronized official clock)
```

## Domain model

- **Post** (`@Entity('post')`) — the demanda. `responsible` is a nullable `@ManyToOne(User)` (`onDelete: 'SET NULL'`); per-account visibility (RF-08/09) is scoped against it. Status defaults to `NAO_INICIADO`.
- **PostStatusLog** — written on every status change (RF-07). `fromStatus` is null on creation. `changedBy` is `SET NULL`. Powers stage-time KPIs (RF-16).
- **Pipeline transitions (RF-06)** live in `posts.service.ts` (`assertCanTransition`): Designer advances one step up to `APROVACAO`; Social one step from `APROVACAO` onward; Gestor moves freely any direction. Non-Gestores can only touch their **own** posts (scoped find returns 404 otherwise).
- **ScheduleItem** — ordered by `plannedTime` (RF-13); `start`/`conclude` stamp `actualStartTime`/`actualEndTime` (RF-11/12).

## Conventions for new endpoints (MVC + REST)

1. **Controller** — thin; route prefix matches the resource. Use `@Roles(...)` (list every role that must reach a route, since there's no hierarchy); `@Public()` to skip auth. Type `@Req()` as `AuthenticatedRequest`, never `any`; read `req.user.sub` / `req.user.role`. Don't add redundant `@HttpCode(200)` to GET/PUT/DELETE.
2. **Service** — inject repos via `@InjectRepository`. Throw Nest HTTP exceptions. Scope owner-bound queries by `req.user.sub`.
3. **DTOs** in `src/common/dtos/<feature>/` — decorate every field. `@IsEnum` for closed domains; `@IsNotEmpty`/`@MaxLength` on strings; `@IsPositive`/`@IsInt` on numbers; `@Type(() => Date)` + `@IsDate` for dates.
4. **Entities** in `src/common/entities/` — extend `BaseEntity`. **Always pass an explicit `@Column({ type })`** (options-object form). `varchar` for short labels, `text` for long content. Mark secrets `{ select: false }` (`password`, `refreshToken`). Nullable column → type the field `T | null`. Dates → `timestamptz`. **Never initialize a to-many relation with `= []`** (TypeORM 0.3 throws `InitializedRelationError` at boot — not caught by `tsc`); declare bare and load via `relations` or guard with `?? []`. Use `@JoinColumn()` on owning `@ManyToOne`/`@OneToOne` sides. **Enum keys English, values may be Portuguese.**
5. **Module** — register entities with `TypeOrmModule.forFeature([...])`, import into `AppModule`.

Auth is global: every route is protected by `JwtAuthGuard` unless `@Public()`. Roles checked after JWT.

## Scripts (pnpm)

```bash
pnpm install
pnpm start:dev   # nest start --watch
pnpm build       # nest build
pnpm lint        # eslint --fix
pnpm format      # prettier --write
```

## Environment

Copy `.env.example` to `.env` inside `Codigo/festa-back/`. Key variables:

- `DATABASE_URL` — Postgres connection string. Local default: user `postgres`, password `festa123`, db `festa_multiplicacao`.
- `DB_SYNCHRONIZE` — `true` for local dev (auto-creates schema). In prod use only for a one-shot first deploy.
- `CORS_ORIGIN` — comma-separated allowed origins (also used by the WebSocket gateways). Defaults to `http://localhost:3000`.
- `NODE_ENV`, `JWT_SECRET`, `JWT_EXPIRATION`, `JWT_REFRESH_EXPIRATION`.

The API listens on `process.env.PORT ?? 5000` (local `.env` uses 5001).

## Guardrails specific to the backend

- **Do not flip `DB_SYNCHRONIZE=true` in production** or run migrations without asking.
- **Do not add packages** without confirming first.
- The `User` entity class is `User` but its table is `usr` (`@Entity('usr')`) because `user` is reserved in Postgres — keep both.
