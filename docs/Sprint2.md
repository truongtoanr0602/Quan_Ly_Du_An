# Sprint 2 - Shopping & Ordering

## Status

Sprint 2 implements US-9, US-12, US-13, US-14, and US-15 on top of the approved Sprint 1 catalog/authentication foundation.

All Sprint 2 APIs require an authenticated JWT with role `Customer`. Controllers derive `UserID` from the validated token; clients never submit a customer identifier.

## Delivered acceptance evidence

| Story | Expected result | API and UI evidence | Automated evidence |
| --- | --- | --- | --- |
| US-9 | Customer updates personal information | `GET/PUT /api/profile`, `/profile` | Profile service, controller, page, and route tests |
| US-12 | Add, remove, and change cart quantities | `GET /api/cart`; item add/update/remove; `/cart` | Cart service/controller/context/page tests |
| US-13 | Place multiple products in one order | `POST /api/orders`, `/checkout` | Transactional checkout and checkout page tests |
| US-14 | Manage shipping addresses and choose supported payment | `/api/addresses`, `/addresses`; COD-only checkout | Address service/controller/form/page tests |
| US-15 | View owned order history | `GET /api/orders`, `GET /api/orders/{id}`; `/orders`, `/orders/:id` | Ownership, pagination, history, and detail tests |

## Checkout rules

- Payment method is exactly `COD`.
- The selected address must belong to the authenticated customer.
- The server revalidates cart quantities, active products, and current stock.
- Product price/name/SKU and shipping fields are copied into immutable order snapshots.
- Order and payment states start at `PENDING`.
- Shipping fee is `0`; total is calculated on the server.
- Creating the order and clearing cart items occurs in one EF Core transaction.
- Checkout validates stock but does not decrement it. Inventory mutation belongs to Sprint 3.

## Database result

`dotnet ef migrations has-pending-model-changes` reports no pending model changes. Existing reviewed migrations already contain the Sprint 2 schema, so no empty migration was created.

## Local run and demo

Configure a non-shared SQL Server database and User Secrets as described in the root README, then run:

```powershell
dotnet ef database update --project backend/src/ECommerce.Api --startup-project backend/src/ECommerce.Api
dotnet run --project backend/src/ECommerce.Api --launch-profile http
npm --prefix frontend ci
npm --prefix frontend run dev
```

Set `frontend/.env.local` to:

```dotenv
VITE_API_BASE_URL=http://localhost:5296/api
```

Demo flow:

1. Register or sign in as a Customer.
2. Add products to the cart and adjust quantities at `/cart`.
3. Create a default address at `/addresses`.
4. Review `/checkout`, keep COD selected, and place the order.
5. Verify the cart is empty and inspect `/orders/{id}`.
6. Confirm the newest order appears first at `/orders`.
7. Update customer information at `/profile`.

## Verification commands

```powershell
dotnet clean backend/ECommerce.slnx --configuration Release
dotnet restore backend/ECommerce.slnx
dotnet build backend/ECommerce.slnx --configuration Release --no-restore
dotnet test backend/ECommerce.slnx --configuration Release --no-build
npm --prefix frontend ci
npm --prefix frontend run lint
npm --prefix frontend test
npm --prefix frontend run build
powershell.exe -NoProfile -File .agents/tests/validate-skills.ps1
git diff --check
```

## Sprint 3 exclusions

Sprint 2 does not implement online payments, order cancellation, admin order/status management, inventory administration or stock mutation, revenue reporting, password reset, or password change.
