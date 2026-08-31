# Sprint 1 Remediation Design

## 1. Purpose and scope

This design repairs the Sprint 1 increment so it can meet the documented Product Catalog and Authentication scope without expanding Cart or Checkout behavior. It follows the approved React -> REST API -> Controller -> Service -> EF Core / AppDbContext -> SQL Server architecture.

The remediation covers US-2, US-3, US-7, US-8, US-17, US-18, US-19, and US-20. It preserves the existing Cart, Address, Order, and related database mappings as an explicitly approved technical foundation for Sprint 2. Existing Cart UI/state is also retained unchanged, but this work adds no Cart endpoint, route, state wiring, persistence behavior, Checkout, or ordering behavior.

## 2. Decisions confirmed by the Product Owner

1. The committed JWT key was used only locally. It must be rotated locally and removed from tracked configuration; Git history will not be rewritten.
2. Existing Cart, Order, and Address database mappings remain as approved Sprint 2 technical foundation.
3. Public registration always creates a `Customer`. `Admin` and `Customer` roles are seeded. The first Admin can be created only in Development from User Secrets or environment variables.
4. Deleting a Category with Products or child Categories is blocked with `409 Conflict`; no records are deleted or reassigned.
5. Product deletion remains a soft delete. Inactive Products are hidden from all Customer/anonymous catalog, search, filter, and detail requests; Admin can see and reactivate them through the existing update operation.
6. Existing Cart UI/state remains unchanged and is not expanded in this remediation.
7. Five initial Brands are seeded through an EF Core data migration: Apple, ASUS, Lenovo, Dell, and Sony. Brand management remains out of Sprint 1 scope.
8. Sprint 1 logout clears browser authentication state and redirects to login. There is no server-side access-token revocation; JWT lifetime remains two hours.

## 3. Architecture and security design

### 3.1 Configuration and startup

Tracked `appsettings.json` and `appsettings.Development.json` contain only safe, non-secret configuration. The tracked JWT key and developer-specific connection string are removed. The API project receives a `UserSecretsId`; local development uses User Secrets or environment variables for:

- `ConnectionStrings__ECommerce`
- `Jwt__Key`
- `BootstrapAdmin__Email`
- `BootstrapAdmin__Password`
- `BootstrapAdmin__FullName`

Startup validates a non-empty issuer/audience and a JWT signing key of at least 32 UTF-8 bytes. A missing or invalid value fails startup without logging or returning the value. Test hosts inject a test-only key and connection string so health and authorization tests do not depend on a developer secret.

`DevelopmentAdminBootstrapper` is a small infrastructure helper invoked only in `Development`, after DI is built. It is a no-op when all bootstrap values are absent, fails safely when they are partially supplied, and never runs in Testing or Production. It creates one hashed Admin only if none exists. A configured email that already belongs to a Customer causes a safe startup failure rather than account promotion. It does not run migrations automatically.

### 3.2 Roles, Brands, and migrations

`RoleConfiguration` seeds deterministic role rows with fixed identifiers and timestamps: `1 = Customer`, `2 = Admin`. `BrandConfiguration` seeds the five approved Brands with stable identifiers. EF Core generates one task-specific migration for this data; the existing `InitialCreate` migration is never edited.

The migration does not alter Cart, Order, Address, or other approved Sprint 2 foundation tables. Before a shared database receives the migration, the team inspects existing Role/Brand rows for identifier or unique-name conflicts and resolves them through a reviewed migration strategy, not manual untracked changes.

### 3.3 Authentication and expected failures

`AuthService` assigns the seeded Customer role during registration and removes all email-derived role logic. Passwords remain BCrypt hashes and response DTOs never expose password hashes.

Controllers delegate success responses only. Narrow domain exceptions are mapped centrally by `ExceptionHandlingMiddleware` to safe RFC 7807 Problem Details:

| Condition | HTTP result |
| --- | --- |
| Invalid DTO | 400 validation problem |
| Missing resource | 404 problem |
| Duplicate/conflicting state | 409 problem |
| Invalid or inactive login | 401 generic problem |
| Unexpected error | 500 generic problem |

This keeps credentials, SQL errors, and stack traces out of client responses. Valid registration returns `201 Created` with the existing authentication response payload; valid login remains `200 OK` with the existing payload.

### 3.4 Authorization and catalog behavior

Category reads remain public because the customer catalog consumes them. Category `POST`, `PUT`, and `DELETE` require `Admin`; anonymous callers receive `401`, authenticated Customers receive `403`.

Before deleting a Category, the service checks for Products and child Categories. Either dependency raises a conflict; an empty Category is removed with `204`, and a nonexistent Category returns `404`.

Product create, update, and delete remain Admin-only. Delete continues to set `IsActive = false`. At the controller boundary, Admin requests pass `includeInactive = true` to product service reads; anonymous and Customer requests query only active Products. Public inactive detail reads are indistinguishable from missing resources (`404`). Admin list/detail responses include inactive Products and existing Admin `PUT` can set `IsActive = true` to reactivate them. `ProductDto` gains the additive `isActive` field.

Product create/update validates Category and Brand references and maps duplicate SKU conflicts to a safe client response rather than a database exception. This remediation does not redefine guest catalog access, search matching, pagination, price-range semantics, or Category `IsActive` visibility because the Sprint documents do not define them.

## 4. Frontend design

### 4.1 API configuration and errors

`VITE_API_BASE_URL` becomes the single frontend API base URL. `.env.example`, `src/config/env.ts`, and documentation use `http://localhost:5296/api` for the supplied backend HTTP profile. `apiClient` imports the normalized config value and no longer owns an unrelated fallback. CORS continues to allow the Vite browser origin such as `http://localhost:5173`, not the API URL.

`apiClient` maps safe API error bodies into a typed client error containing status, message, and optional validation details. It does not expose raw server internals or imperatively redirect pages.

### 4.2 Authentication state and routes

`AuthContext` owns the authenticated user, token/session persistence, and logout. Typed `LoginRequest`, `RegisterRequest`, `UserInfo`, and `AuthResponse` replace `any`. It restores only a valid stored session and clears malformed session data.

`RequireAdmin` wraps the existing `/admin/categories` and `/admin/products` parent route without changing its URLs. An anonymous visitor is sent to login; a known Customer is sent home; an Admin sees the existing child route. This is defense in depth only: API authorization remains authoritative.

Header and admin pages use `AuthContext` for logout. A `401` clears the auth session through the context; `403` is rendered as a friendly error. Login and registration retain inline errors but use typed error handling. The Header Cart affordance, CartContext, stored `ecommerce_cart`, and existing product Cart controls remain untouched.

### 4.3 User-visible resilience

Product list and detail pages display an accessible error state and retry path for request failures rather than presenting a network failure as an empty/not-found result. Admin Category/Product pages display save/delete/load errors in their page or modal context rather than only alerts or console output. Existing loading and empty states remain. The Category form uses a non-null textarea value so the TypeScript build succeeds.

Admin product UI displays `isActive` and sends the existing update field for reactivation. Public UI relies on API filtering and continues to render a missing/inactive Product as not found.

## 5. Test and acceptance strategy

No new test framework or package is added. Backend uses xUnit and `Microsoft.AspNetCore.Mvc.Testing`; frontend uses Vitest and React Testing Library.

Automated backend tests use test-only configuration, generated test JWTs, and handwritten service fakes for startup, status-code, authorization, and Problem Details behavior. Frontend tests mock `fetch`/services and assert observable route, form, error, and retry behavior.

Because no relational test provider or disposable SQL Server exists in CI, EF persistence guarantees are verified in a documented local SQL Server functional-test gate after applying the reviewed migration. EF InMemory is not introduced because it would not reliably verify SQL Server foreign key and unique-constraint behavior.

Minimum automated regression coverage includes:

- JWT configuration failure without secret disclosure; Development-only Admin bootstrap restrictions.
- Customer-only registration, duplicate registration, safe invalid login, JWT role claims, and frontend logout.
- Anonymous/Customer/Admin authorization outcomes for Category and Product mutations.
- Category delete `404`, `409` with Products/children, and `204` when empty.
- Public inactive Product filtering/detail `404`, Admin visibility, and reactivation.
- Unified API base URL, AuthContext restoration, admin route guard, and frontend error/retry states.
- Replacement of the obsolete baseline App test and the current frontend TypeScript build failure.

The local functional checklist verifies role/brand seed data, category/product constraints, Customer catalog/search/filter/detail behavior, and Customer/Admin demo flows. It records the exact database used, migration applied, and results for Sprint review; it does not run against a shared production database.

## 6. Expected file impact

Likely backend changes are `Program.cs`, tracked settings, API project configuration, role/brand EF configurations, a generated migration/snapshot, auth/category/product controllers and services, DTOs, exception middleware, a Development bootstrap helper, and backend tests.

Likely frontend changes are `.env.example`, configuration, API/auth services, `AuthContext`, `RequireAdmin`, router, Header, auth/product/admin pages, product types, and focused tests. `CartContext.tsx` and Cart behavior remain unchanged.

Documentation changes cover local secret/bootstrap setup, API/status behavior, functional acceptance evidence, and the remediation decision record. The user's existing modification to `.agents/skills/architecture/SKILL.md` is out of scope and remains untouched.

## 7. Non-goals and follow-up limits

- No Cart/Checkout/Order behavior, Cart API, payment flow, or order-history feature is added.
- No server-side access-token revocation, password reset, password-policy expansion, email-normalization schema redesign, Category active-visibility redesign, or Brand management feature is added.
- No existing migration is edited and no shared database is manually changed.
- No public route is renamed or removed. Status corrections and additive `isActive` are documented public contract changes and require review before merge.

## 8. Completion criteria

The remediation is complete only after the EF migration is reviewed and applied to a local test database, all automated backend/frontend checks pass, the functional checklist passes for Customer and Admin flows, no tracked secret remains, and the Product Owner reviews the resulting increment. Work is delivered through a reviewed pull request from `feature/sprint1-remediation` into `develop`.
