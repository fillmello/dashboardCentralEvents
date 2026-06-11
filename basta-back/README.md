# basta-back

Welcome to **basta-back**, our REST API built with NestJS.

---

## Project Setup

1. Create your `.env` file inside `/basta-back`
   - Use `.env.example` as a reference

2. Install dependencies (we use pnpm):
   pnpm install

3. Start the development server:
   pnpm run start:dev

4. (Optional) Import the Postman collection:
   - BastaFabric.postman_collection.json
   - Helps with testing and exploring the API endpoints

---

## Authentication

- Uses JWT with refresh tokens
- Authorization is role-based (RBAC)

---

## Project Architecture

/src
  /auth
    /decorators   -> Custom decorators (e.g. @Roles)
    /guards       -> Route protection and authorization
  /common         -> Shared utilities and modules
  /data           -> Database connection and config
  /modules        -> Main features (MVC + REST pattern)
  /storage        -> Cloud storage logic (Cloudflare R2)

---

## Contributing

### Branch naming convention

{type}/{requirement}-{short-description}

Example:
feat/RF01-user-backend

---

### Commit convention (Conventional Commits)

- feat: New feature
- fix: Bug fix
- refactor: Code changes without behavior modification
- chore: Maintenance tasks, tooling, and configuration changes (no impact on application logic)
- docs: Documentation changes
