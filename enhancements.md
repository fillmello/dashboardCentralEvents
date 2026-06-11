## Pending

#### Database

- **Migration strategy** — TypeORM `synchronize` is now opt-in via `DB_SYNCHRONIZE=true` (decoupled from `NODE_ENV`). Safe in local dev; in prod it should only be flipped on for the one-shot first deploy, then removed. A proper migration workflow (TypeORM `migration:generate`/`migration:run`) is still the long-term plan for handling breaking schema changes.

backup of the database

#### Backend

- **Release versioning** — `CatalogItemFields` deduplicates the *schema* between `Product` and `ProductRelease`, but every release still copies the full row data at create time. Consider versioning products/collections instead so a release can reference a versioned snapshot rather than carry its own copy.

logs

async of payments and race conditions for limited itens

#### Quality

- **Unit tests** — No backend tests exist yet. Start with service-layer unit tests for the core modules (products, users, auth).

### Frontend

#### Features

I NEED TO REFINE THIS BEHAVIOR
desired behaviour: 
collections page = the admin can add items, remove them and have the edit button to send the admin in the product edit page with the correct id(same as release today)
relesease page = the admin can add items(we should fetch products and productsRelease(add a filter so the user can choose to see products, productsReleased or both at the same time, default is only productsReleased), if the user add an normal product, we should copy the product to the productRelease and add this new productReleased to the current release), he can remove any item and have the edit button to send the admin in the product edit page with the correct id(dont know if we have a productReleased page, so if not created it)

admin should be able to add an image to the status change(like an image to the release status, and when he changes then
all of the orders trigger the email with the text and image, should be able to change multiple status at the same time)

- **Admin orders as Kanban board** — Replace the current list view in `app/admin/page.tsx` with a Trello-style board: one column per `OrderStatus` (`RESERVADO`, `PAGO`, `EM_SEPARACAO`, `ENVIADO`, `ENTREGUE`, `CANCELADO`), each rendering its order cards. Admin should be able to drag a card from one column to another to change its status, calling `PATCH /orders/:id/status` on drop. Keep the existing filters (search, month) and the stats cards above the board. Admin must not be able to move an order from `PAGO` back to `RESERVADO` — that transition only happens via the payment webhook, and reversing it would desync the order from its payment.
