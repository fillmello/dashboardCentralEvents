# Postman — Basta Fabric

Single Postman v2.1.0 collection. In Postman: **Import → File → `BastaFabric.postman_collection.json`**.

## Collection variables (set on import)

- `baseUrl` — defaults to `http://localhost:5000`. Change in *Variables* tab if you run the API elsewhere.
- `accessToken` / `refreshToken` — populated automatically by **auth → Login**.

## How auth works

- Default auth is `Bearer {{accessToken}}` at the collection level.
- **auth → Login** runs a test script that saves `accessToken` (from JSON body) and `refreshToken` (parsed from the `Set-Cookie` header) into collection variables.
- A pre-request script on every request checks if `accessToken` is expired and silently refreshes it before sending.
- Public endpoints (Login, Refresh Token, Create User) override auth to `noauth`.

## Folder order (matches the natural test flow)

1. **auth** — login / refresh / logout.
2. **user** — register (public), get profile, update, delete.
3. **address** — full CRUD nested under `/users/:userId/address`.
4. **product** — admin template CRUD + image uploads (front, back, additional). Buyers do NOT hit `/product` — they only see what's inside an active release.
5. **collection** — admin curates collections of products.
6. **release** — admin creates a release from a collection (snapshots each Product into a `ProductRelease`). Buyer reads `/release/active` and `/release/active/item/:id`. Includes per-item edit + per-item image uploads.
7. **cart** — buyer cart against `productReleaseId`.

## Suggested smoke run

`auth/Login → product/Create Product → product/Upload Front Image → collection/Create Collection → collection/Add Product to Collection → release/Create Release → release/Get Active Releases → cart/Add Cart Item → cart/Get Cart`.
