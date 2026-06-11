# basta-back — Claude Code Guide

NestJS 11 REST API for Basta Fabric. See the repo-root [CLAUDE.md](../../CLAUDE.md) for project-wide rules (pnpm, commits, guardrails, Artefatos/).

## Stack

- **NestJS 11** with TypeORM 0.3 + `pg`
- **PostgreSQL** (local via `Codigo/docker-compose.yml`)
- **Auth:** JWT access token + refresh token (HttpOnly cookie). TTLs configurable via `JWT_EXPIRATION` and `JWT_REFRESH_EXPIRATION` env vars (defaults: 1 hour access, 3 days refresh)
- **RBAC** via `@Roles()` + global `RolesGuard`
- **Validation:** `class-validator` / `class-transformer` through a global `ValidationPipe` (`whitelist: true, forbidNonWhitelisted: true`)
- **Storage:** Cloudflare R2 through `@aws-sdk/client-s3` (`src/storage/`)
- **Rate limiting:** `@nestjs/throttler` (short + long buckets)
- **Hardening:** `helmet`, `cookie-parser`, CORS locked to `http://localhost:3000`
- **Response shape:** global `ResponseInterceptor` wraps every response in `{ data: ... }`
- **Errors:** global `HttpExceptionFilter`

## Folder layout

```
src/
  main.ts                Bootstrap (helmet, cookies, CORS, global pipes/filters/interceptors)
  app.module.ts          Wires global guards (JwtAuthGuard, RolesGuard, ThrottlerGuard)
  auth/
    auth.{controller,service,module}.ts
    jwt-payload.type.ts   JwtPayload + AuthenticatedRequest (typed req.user)
    decorators/   @Public, @Roles
    guards/       jwt.guard, roles.guard
  common/
    dtos/         Per-endpoint DTOs (class-validator decorators)
    entities/     TypeORM entities — base.entity (id/createdAt/updatedAt),
                  catalog-item-fields.entity (shared schema for Product / ProductRelease),
                  plus User, Product, Collection, Cart, CartItem, Address,
                  Release, ProductRelease, Order, OrderItem, Payment
    enums/        Role, Size, Gender, OrderStatus, PaymentStatus
    filters/      HttpExceptionFilter
    interceptors/ ResponseInterceptor
  data/
    database.config.ts   TypeORM connection (reads .env)
  modules/        One feature per folder: address, cart, collections, products, releases, users, orders, payments
  storage/        Cloudflare R2 client + service
postman/          Postman collection for manual API testing
```

## Domain model — catalog primitives vs. sellable items

The catalog has two layers and they are **not interchangeable**:

- **`Product` / `Collection`** are admin-only catalog primitives. They describe what *could* exist in a drop (base name, gender, available sizes/colors, default images). Customers never see them directly. `ProductsController` and `CollectionsController` carry `@Roles(Role.ADMIN)` at the class level on purpose — that's not a leak, it's the design.
- **`Release` / `ProductRelease`** are the actual sellable units. A `Release` is a time-bound drop (start/end dates, total quantity, sold quantity); a `ProductRelease` is the snapshot of a product as it ships inside that release, with its own `name`, `price`, `size[]`, `gender`, `colors[]`, and image URLs. Customers browse, cart and check out against these. `ReleasesController` exposes its read routes to `Role.USER`.

Why the split: it matches how the brand operates (limited drops, not an always-on catalog) and keeps the admin workbench (`Product` / `Collection`) decoupled from anything customers can touch.

Consequences when writing code:

- If you find yourself wanting to expose `Product` or `Collection` data on a non-admin route, stop — route it through a `Release` / `ProductRelease` instead.
- `CartItem` and `OrderItem` reference `ProductRelease`, never `Product`. Keep it that way.
- Editing a `Product` after a `Release` is live does **not** mutate the existing `ProductRelease` — the snapshot is deliberate. Use `PUT /release/item/:id` (admin) to fix a live drop.

## Conventions for new endpoints (MVC + REST)

Follow the existing pattern in `src/modules/*`:

1. **Controller** in `src/modules/<feature>/<feature>.controller.ts`
   - Route prefix matches the resource (`@Controller('products')`).
   - Use `@Roles(Role.ADMIN)` for admin-only routes; `@Public()` to skip auth entirely.
   - Inject the service; keep controllers thin.
   - For the authenticated user: import `AuthenticatedRequest` from `src/auth/jwt-payload.type` and type `@Req()` / `@Request()` with it. **Never** type `req` as `any`. Access via `req.user.sub` / `req.user.role`.
   - Don't add `@HttpCode(HttpStatus.OK)` to GET/PUT/DELETE — NestJS already defaults to 200. Only override when the semantic differs (e.g., a POST that doesn't create a resource and should return 200, like `/auth/login`).
   - When a route takes a user/owner id from the URL, verify ownership against `req.user.sub` (see `address.controller.ts:ensureSelf`) — don't trust route params.
2. **Service** in `src/modules/<feature>/<feature>.service.ts`
   - Inject repositories via `@InjectRepository(Entity)`.
   - Throw `NestJS` HTTP exceptions (`NotFoundException`, `BadRequestException`, …); the global filter formats them.
3. **DTOs** in `src/common/dtos/`
   - One DTO per endpoint (prefer composition / `PartialType` over reusing one DTO everywhere — see `../enhancements.md`).
   - Decorate every field with `class-validator`. Use `@IsEnum(MyEnum)` for closed-domain values, not `@IsString()`. Add `@IsNotEmpty()` and `@MaxLength()` on strings. Use `@IsPositive()` / `@Min()` on numeric inputs. For arrays of enums use `@IsEnum(MyEnum, { each: true })`.
   - For date inputs, pair `@Type(() => Date)` (class-transformer) with `@IsDate()` so JSON ISO strings are auto-converted.
4. **Entities** in `src/common/entities/`
   - Every entity extends `BaseEntity` (provides `id`, `createdAt`, `updatedAt`). Don't re-declare those columns.
   - `Product` and `ProductRelease` extend `CatalogItemFields` (the 9 shared columns: `name`, `price`, `size[]`, `gender`, `description`, `colors[]`, `imageFrontUrl`, `imageBackUrl`, `additionalImageUrls`). Add new shared catalog fields there, not in each entity.
   - Mark secrets with `{ select: false }` (`password`, `refreshToken`).
   - Use enum columns where the domain is closed (`Size`, `Gender`, `Role`). Syntax: `@Column({ type: 'enum', enum: X })` — not the legacy `@Column('enum', { enum: X })` form.
   - When a column is `nullable: true`, type the TS field as `T | null`. Don't lie to the compiler.
   - Use `@JoinColumn()` explicitly on `@ManyToOne` / `@OneToOne` owning sides so FK column names are predictable.
   - For dates, use `@Column({ type: 'timestamptz' })` typed as `Date` — not `string`.
5. **Module** in `src/modules/<feature>/<feature>.module.ts` — register entities with `TypeOrmModule.forFeature([...])` and import into `AppModule`.

Authentication is global: every route is protected by `JwtAuthGuard` unless marked `@Public()`. Roles are checked after JWT.

## RFs and Artefatos

When implementing a requirement, first read the matching artefact in [Artefatos/](../../Artefatos/) (use case, UI mockup, Obsidian note). The Obsidian notes capture decisions that are not obvious from code — e.g. RF01 documents the access/refresh token split.

## Scripts (pnpm)

```bash
pnpm install              # install
pnpm start:dev            # nest start --watch
pnpm build                # nest build
pnpm test                 # jest
pnpm test:e2e             # jest --config test/jest-e2e.json
pnpm lint                 # eslint --fix
pnpm format               # prettier --write
```

## Environment

Copy `.env.example` to `.env` inside `Codigo/basta-back/`. Key variables:

- `DATABASE_URL` — single Postgres connection string, parsed in `src/data/database.config.ts`. Local default points at the docker-compose Postgres (user `postgres`, password `basta123`, db `basta_fabric`). On Railway, set to `${{Postgres.DATABASE_URL}}` to use the internal hop.
- `DB_SYNCHRONIZE` — set to `true` to let TypeORM auto-create/update the schema from entities. Use `true` for local dev. In prod, set `true` only for a one-shot first deploy, then remove the variable and redeploy.
- `CORS_ORIGIN` — comma-separated list of allowed origins. Defaults to `http://localhost:3000` if unset.
- `NODE_ENV` — `development` locally, `production` on Railway. Controls cookie `Secure` flag, DB SSL, and seed-data gating.
- `JWT_SECRET` — JWT signing secret.
- `JWT_EXPIRATION` — access-token TTL in seconds (default `3600` = 1 hour).
- `JWT_REFRESH_EXPIRATION` — refresh-token TTL in seconds (default `259200` = 3 days). Same value is reused for the refresh cookie `maxAge`.
- `R2_*` — Cloudflare R2 credentials and public URL.
- `MP_ACCESS_TOKEN` — MercadoPago access token. Use `TEST-...` for local dev (sandbox), `APP_USR-...` for production. Required in production (startup validation crashes without it).
- `MP_WEBHOOK_SECRET` — Secret set when creating the webhook in the MP dashboard. Used for HMAC-SHA256 signature verification on incoming webhooks. Optional but strongly recommended in production.

The API listens on `process.env.PORT ?? 5000`.

## Guardrails specific to the backend

- **Do not run TypeORM migrations or flip `DB_SYNCHRONIZE=true` in production** without asking. Migration strategy is open work (see [../enhancements.md](../enhancements.md)).
- **Do not add packages** to `package.json` without confirming first.
- When deleting a product/collection/release, remember its image in Cloudflare R2 must be removed too (open item in `../enhancements.md`).
- The `User` entity class is named `User`, but its DB table is overridden to `usr` via `@Entity('usr')` because `user` is a reserved word in Postgres. Keep both: don't rename the class back to `Usr`, and don't drop the table-name override.

## Open tech debt

Tracked in [../enhancements.md](../enhancements.md): API pagination & search, migrations, unit tests, per-endpoint DTOs in subfolders, Dockerfile, color/size lookup tables, release versioning, R2 cleanup on delete.
