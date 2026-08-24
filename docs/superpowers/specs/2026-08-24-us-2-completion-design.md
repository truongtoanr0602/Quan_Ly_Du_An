# US-2 Completion Design

## 1. Purpose

This design completes US-2 — Category Management as an end-to-end Sprint 1 capability. It repairs the current backend and test gaps, creates the required SQL Server migration, adds an Admin Category Management interface, and implements the minimum US-8 login/logout behavior required for a real Admin to use that interface.

The work remains inside Sprint 1. Account registration, password recovery, cart, checkout, orders, payment, inventory administration, and reporting are not included.

## 2. Approved Decisions

- The canonical US-2 Acceptance Criteria are the detailed criteria approved by Product Owner Toản in commit `13541ef`.
- Category read endpoints remain public; create, update, and delete remain Admin-only.
- The frontend uses JWT Bearer authentication and stores the active session in `sessionStorage`.
- The minimum US-8 scope includes Admin login, JWT session restoration for the current tab, logout, and Admin route protection.
- Initial Admin credentials come from User Secrets or environment variables and are seeded only in Development. No password or signing secret is committed.
- Password hashing uses ASP.NET Core `PasswordHasher<User>` without introducing the full ASP.NET Core Identity schema.
- The existing simple Controller → Service → EF Core architecture remains unchanged.

## 3. Scope

### 3.1 In Scope

- Repair automatic JWT configuration for backend integration tests and CI.
- Add login API, JWT generation, password verification, and role claims.
- Add Development-only Admin seeding from configuration.
- Generate and review the initial EF Core migration for `Users`, `Categories`, and `Products`.
- Complete Category API conflict handling and automated tests.
- Add Login and Admin Category Management frontend routes.
- Add Category list, create, update, delete, validation, loading, empty, error, and confirmation behavior.
- Add frontend authentication session and protected Admin routing.
- Restore the approved detailed US-2 Acceptance Criteria.
- Verify backend, frontend, migration, and repository skill checks.

### 3.2 Out of Scope

- Customer registration and general Customer account UI.
- Refresh tokens, password reset, remember-me, multi-device session management, and account locking.
- Full ASP.NET Core Identity.
- Category hierarchy, images, manual ordering, archive/soft-delete, pagination, and bulk operations.
- Product management UI or Product Catalog implementation beyond the persistence model required by US-2.
- Any Sprint 2 or Sprint 3 capability.

## 4. Architecture

The approved request flow remains:

```text
React UI
  → REST API client
  → ASP.NET Core Controller
  → Service
  → EF Core / AppDbContext
  → SQL Server
```

Authentication follows:

```text
LoginPage
  → POST /api/auth/login
  → AuthController
  → AuthService
  → AppDbContext.Users
  → PasswordHasher<User>.VerifyHashedPassword
  → JwtTokenService
  → JWT with user id, email, and role
  → sessionStorage
  → Authorization: Bearer <token>
  → AdminRoute and Category admin endpoints
```

Controllers own HTTP mapping only. Services own credential verification, JWT creation, Category rules, and DTO mapping. EF Core owns persistence and migrations. React components consume centralized services and never access SQL Server.

## 5. Backend Design

### 5.1 Authentication Contract

The minimum public endpoint is:

```http
POST /api/auth/login
Content-Type: application/json
```

Request:

```json
{
  "email": "admin@example.com",
  "password": "example-only"
}
```

Successful response (`200 OK`):

```json
{
  "accessToken": "<jwt>",
  "expiresAt": "2026-08-24T10:00:00Z",
  "user": {
    "id": 1,
    "fullName": "Administrator",
    "email": "admin@example.com",
    "role": "Admin"
  }
}
```

Missing or invalid fields return `400 Bad Request`. Invalid credentials return `401 Unauthorized` with a generic message that does not reveal whether the email exists. The JWT contains name identifier, email, full name, and role claims and uses the configured issuer, audience, signing key, and expiration.

### 5.2 Password Storage

`PasswordHasher<User>` hashes the Development Admin password before persistence and verifies it during login. Plaintext passwords never enter an Entity, response, log, tracked settings file, or migration seed record.

### 5.3 Development Admin Seeder

The seeder runs only when `IHostEnvironment.IsDevelopment()` is true. It reads:

- `AdminSeed:Email`
- `AdminSeed:Password`
- `AdminSeed:FullName`

Equivalent environment variables use `AdminSeed__Email`, `AdminSeed__Password`, and `AdminSeed__FullName`. When all values are absent, the application starts without seeding. When only some values are supplied, startup fails with a safe, actionable configuration error. When all values are supplied, the seeder normalizes the email, creates the Admin only if it does not exist, and never resets an existing password automatically.

### 5.4 Category Completion

The existing Category routes and DTO shapes remain unchanged. The service continues to trim input, enforce lengths, preserve `CreatedAt`, reject duplicate names, and block deletion while Products reference the Category.

The database unique index remains the final concurrency guard. Create and update save operations catch an applicable unique-constraint `DbUpdateException`, confirm that the conflicting Category name exists, clear or restore the failed tracked state as needed, and return the existing `409 Conflict` result. Unrelated database exceptions continue to the centralized error middleware.

### 5.5 Test Host Repair

Backend tests must not depend on developer secrets. The test factory supplies the JWT key, issuer, and audience before top-level application startup reads them, while keeping the values test-only. Running the documented `dotnet test` command on a clean machine must not require environment variables or User Secrets.

## 6. Database Design

An EF Core migration creates only the Sprint 1 persistence tables required by the current implementation:

- `Users`
- `Categories`
- `Products`

The migration includes:

- Primary keys and required columns.
- Unique, case-insensitive indexes for User email and Category name.
- Explicit lengths and `datetime2` mappings.
- `decimal(18,2)` Product price.
- Non-negative Product price and stock constraints.
- Required Product-to-Category foreign key with restricted deletion.

The migration contains no Admin credential data. The migration and `docs/database-erd.md` must agree.

## 7. Frontend Design

### 7.1 Authentication Session

`authService` performs login. `authSession` validates the stored response shape, reads and writes it under one versioned `sessionStorage` key, exposes the current user and token, and clears the session on logout or invalid stored data.

The centralized API client adds the Bearer token when a session exists. A `401` response clears the invalid session and directs the user to login. A `403` response preserves the session and displays an insufficient-permission state.

### 7.2 Routes

- `/login` — public Login page.
- `/admin/categories` — Admin-only Category Management page.

`AdminRoute` redirects Guests to `/login` and shows or routes to an access-denied state for authenticated non-Admin users. Successful Admin login directs the user to `/admin/categories`. Logout clears `sessionStorage` and returns to `/login`.

No routing or state-management framework is added unless the existing project already contains it. For this small MVP, route selection can use the browser History API and focused React state if that remains the smallest implementation.

### 7.3 Category Management UI

The page owns page-level loading and operation state. Focused components provide:

- Category table with name, description, and actions.
- Empty state when the API returns an empty array.
- Create/edit form shared between both operations.
- Field-level validation after trimming: Name 2–100 characters; Description at most 500.
- Delete confirmation before sending the request.
- User-readable responses for `400`, `401`, `403`, `404`, `409`, and network/unexpected failures.

The UI updates only after successful API responses. A rejected delete or duplicate-name conflict does not remove or mutate the visible Category incorrectly.

## 8. Error Handling and Security

- API errors use Problem Details or Validation Problem Details.
- Invalid login responses remain generic.
- JWT signing keys, SQL credentials, Admin seed passwords, and real tokens are never committed or logged.
- The frontend treats `sessionStorage` as browser-visible storage and places no server secret in Vite variables.
- All Admin mutations require backend role authorization even when the frontend route is protected.
- Unexpected exceptions use the existing centralized middleware without exposing stack traces.

## 9. Testing Strategy

Implementation follows red-green-refactor TDD.

### 9.1 Backend

- Regression test proving the normal test command starts without external JWT configuration.
- Login success and generic invalid-credential tests.
- JWT claim and role authorization tests.
- Development Admin Seeder tests for absent, partial, new, and existing configuration.
- Category service and endpoint tests for all approved server-side ACs.
- A database-conflict mapping test proving an applicable unique violation becomes `409` while unrelated database failures are not swallowed.
- Migration generation and model snapshot review.

### 9.2 Frontend

- Login success, invalid credentials, and visible validation.
- Session save, restore, invalid-data cleanup, and logout.
- Guest and Customer Admin-route protection.
- Category loading, list, empty, and failure states.
- Create/update validation and successful refresh/update behavior.
- Duplicate-name and in-use delete conflicts.
- Delete confirmation and cancellation.

### 9.3 Final Verification

```powershell
dotnet restore backend/ECommerce.slnx
dotnet build backend/ECommerce.slnx --configuration Release --no-restore
dotnet test backend/ECommerce.slnx --configuration Release --no-build
npm --prefix frontend ci
npm --prefix frontend test
npm --prefix frontend run build
powershell.exe -NoProfile -File .agents/tests/validate-skills.ps1
```

Migration verification includes listing the generated migration and reviewing the SQL/model snapshot. Applying it requires an available SQL Server connection configured through User Secrets or environment variables.

## 10. Git and Delivery

Work occurs on `feature/US-2-completion`, based on the current `main` because PR #1 was already merged there while `develop` remains behind. The completed change should be reviewed into `develop` first so the documented branch flow can resume; later integration from `develop` to `main` will include only the completion commits not already present on `main`.

Commits remain focused: test-host/authentication, migration/category conflict handling, frontend authentication, Category UI, and documentation/verification. No direct push to `main` or `develop` occurs.

## 11. Acceptance and Completion

US-2 is ready for Product Owner acceptance only when:

- The approved detailed US-2 document is restored.
- Category API behavior satisfies AC-01 through AC-10.
- Login and Admin session allow real use of the management UI.
- Category UI satisfies AC-11.
- The EF Core migration is present and reviewed.
- Backend and frontend tests/builds pass without developer-specific secrets.
- Code review and CI succeed.
- Run and seed instructions are documented.

Product Owner acceptance remains required before marking US-2 Done.
