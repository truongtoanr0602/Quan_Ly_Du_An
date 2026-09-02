# Sprint 2 — Shopping & Ordering Design

**Status:** Approved in conversation on 2026-09-01  
**Source of scope:** `docs/Sprint_backlog.md`  
**Target branch:** `develop` through a reviewed feature branch

## 1. Goal and approved scope

Sprint 2 completes the authenticated customer purchase journey:

> Browse products → add to cart → adjust quantities → checkout → enter or select a shipping address → choose COD → place an order → view order history.

The approved stories are:

- US-9 — Manage personal information.
- US-12 — Manage the shopping cart.
- US-13 — Place one order containing multiple products.
- US-14 — Manage shipping addresses and select the supported payment method.
- US-15 — View order history and order details.

The Product Owner approved using the “Expected results” in `docs/Sprint_backlog.md` as the Acceptance Criteria for these stories.

Online payment, order cancellation, administrative order management, inventory administration, reporting, password recovery, and password changes remain outside Sprint 2.

## 2. Delivery strategy

Work is delivered as vertical slices in dependency order:

1. US-9 customer profile.
2. US-12 server-backed cart.
3. US-14 shipping addresses and COD selection.
4. US-13 transactional checkout.
5. US-15 customer order history.

Each slice includes its backend contract, service behavior, persistence, frontend flow, and automated tests before the next slice begins. This keeps every completed slice runnable and limits late integration risk.

## 3. Architecture

The approved architecture remains unchanged:

```text
React + TypeScript
        ↓ REST/JSON + JWT
ASP.NET Core Controller
        ↓
Service Layer
        ↓
EF Core / AppDbContext
        ↓
SQL Server
```

Controllers own HTTP and authorization concerns. Services own validation, calculations, ownership checks, and transactions. DTOs isolate public contracts from EF Core entities. The frontend never connects directly to SQL Server.

All Sprint 2 endpoints require an authenticated `Customer`. The backend derives the user identity from validated JWT claims; clients cannot select an arbitrary `UserID`.

## 4. Customer profile — US-9

The customer can retrieve and update the non-sensitive profile fields already supported by the approved user model. The API never returns password hashes, role mutation fields, refresh tokens, or other authentication secrets.

Validation is performed on the server and mirrored in the frontend for usability. Email uniqueness and any immutable identity fields follow the existing authentication rules. A customer can only access their own profile.

## 5. Shopping cart — US-12

The authenticated cart is persisted in `Cart` and `CartItem`. At most one active cart belongs to a customer, and a product appears at most once in that cart.

Supported behavior:

- Retrieve the current cart.
- Add an active product with a positive quantity.
- Increase or replace an existing item quantity.
- Remove one item.
- Clear the cart.

The service verifies product existence, active status, positive quantity, and current available stock. Product price and totals returned for display come from current server data. The existing browser-only `localStorage` cart is replaced for authenticated customers so cart state is consistent across sessions and devices.

Concurrent updates must not create duplicate cart lines. Database uniqueness and service-level handling enforce one `(CartID, ProductID)` pair.

## 6. Shipping addresses and payment — US-14

Customers can list, create, update, delete, and choose their own shipping addresses. They cannot read or mutate another customer’s address.

An address includes receiver name, receiver phone, location fields, full address, and default status according to the existing entity. Setting one address as default clears the previous default for the same customer in the same transaction. Deleting or changing an address never changes the shipping snapshot of an existing order.

Sprint 2 supports `COD` only. The checkout UI presents COD as the supported method, and the backend rejects unsupported payment methods instead of silently accepting them.

## 7. Checkout and order creation — US-13

Checkout accepts a selected customer-owned address, `COD`, and an optional note. Cart contents, prices, totals, and customer ownership are resolved on the server.

The service executes order creation in one database transaction:

1. Load the customer cart and product rows.
2. Reject an empty cart, missing/inactive products, invalid quantities, or insufficient stock.
3. Copy receiver and address values into the order shipping snapshot.
4. Copy product name, SKU, unit price, and quantity into order details.
5. Calculate subtotal and total using server-side decimal arithmetic.
6. Create the initial order state and payment state for COD.
7. Clear the cart only after order creation succeeds.

The initial order and payment status values must use a single centralized set of constants. Stock administration belongs to Sprint 3; Sprint 2 validates available stock but does not add inventory-management screens or inventory reporting. Any decision to decrement stock during checkout must follow the current entity constraints and be captured explicitly in the implementation plan and tests.

Failures roll back the complete transaction, including order rows and cart clearing. The API returns validation/problem responses without stack traces or internal exception details.

## 8. Order history — US-15

Customers can view a newest-first paginated list of their own orders and retrieve the details of one owned order. Responses include order status, payment method/status, totals, creation time, shipping snapshot, and item snapshots.

An order owned by another customer is not exposed. The endpoint follows the repository’s established authorization/error convention so ownership information cannot be inferred from private data.

Cancellation and status transitions are excluded because they belong to Sprint 3.

## 9. Frontend experience

Authenticated routes are added for profile, cart, checkout/address selection, order history, and order details. Existing catalog and authentication routes remain compatible.

Every screen provides loading, empty, validation, success, and API-error states. Cart actions expose recoverable errors instead of browser `alert` calls. Checkout prevents accidental duplicate submission while the request is pending and navigates to the created order only after the API confirms success.

The layout remains responsive and uses the existing visual system; no new UI framework or major dependency is introduced without separate approval.

## 10. API and database impact

New authenticated API surfaces are expected for the current customer profile, cart, addresses, checkout, and orders. Exact routes and DTO fields will be frozen in the implementation plan after inspecting the current route and naming conventions.

Existing Sprint 2 entities and configurations are reused. Schema changes are allowed only when required to enforce the approved behavior and must be implemented through an EF Core migration. Likely validation includes uniqueness of cart products and indexes used for customer-owned lookups. No manual schema drift is allowed.

Public API and schema changes will be recorded in the completion report.

## 11. Testing and Definition of Done

Development follows test-first vertical slices. Coverage includes:

- Authorization and cross-customer isolation.
- DTO validation and invalid identifiers.
- Cart add/update/remove/clear behavior and stock limits.
- Default-address invariants.
- COD-only payment validation.
- Multi-item price snapshots and server-calculated totals.
- Transaction rollback and cart retention on failed checkout.
- Cart clearing after successful checkout.
- Paginated order history and owned order details.
- Frontend loading, empty, success, validation, and error behavior.

Completion requires all approved Acceptance Criteria, backend and frontend integration, functional testing, no serious related defects, successful builds/tests, a runnable demo, review, CI, and Product Owner acceptance.

## 12. Documentation and transition

Implementation updates repository context so Sprint 2 is the active Sprint while preserving Sprint 1 as the completed technical foundation. Canonical architecture, ERD, run instructions, and API documentation are updated only where the implementation changes them.

The user-owned uncommitted change in `.agents/skills/architecture/SKILL.md` is not modified or reverted.
