# US-2 Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete US-2 end to end with a tested Category API, SQL Server migration, minimum Admin JWT login/logout, protected Category Management UI, canonical Acceptance Criteria, and clean CI commands.

**Architecture:** Preserve React → REST API → Controller → Service → EF Core/AppDbContext → SQL Server. Add focused authentication services and a Development-only Admin seeder; use centralized frontend service modules and `sessionStorage` without introducing full ASP.NET Identity, React Router, or a state-management framework.

**Tech Stack:** .NET 10, ASP.NET Core Web API, EF Core 10, SQL Server, JWT Bearer, `PasswordHasher<User>`, xUnit, React 19, TypeScript 6, Vite 8, Vitest, Testing Library, Node.js 24.

**Spec:** `docs/superpowers/specs/2026-08-24-us-2-completion-design.md`

## Global Constraints

- Canonical US-2 requirements come from the Product Owner-approved commit `13541ef`.
- Keep routes `/api/categories`, `/api/auth/login`, `/login`, and `/admin/categories` exactly as specified.
- Store JWT sessions in `sessionStorage`; never commit credentials, JWT keys, passwords, connection strings, or real tokens.
- Seed Admin only in Development from `AdminSeed:Email`, `AdminSeed:Password`, and `AdminSeed:FullName`.
- Do not implement registration, password recovery, refresh tokens, Cart, Checkout, Order, Payment, Inventory administration, or Reporting.
- Controllers handle HTTP only; Services own business rules; database changes use EF Core migrations.
- Every behavior change follows red-green-refactor; generated migrations are the only TDD exception.
- Work only on `feature/US-2-completion`; do not push or merge without review and successful CI.

---

### Task 1: Restore the Canonical US-2 Contract and Repair the Test Host

**Files:**
- Modify: `docs/acceptance-criteria/US-2-category-management.md`
- Modify: `backend/tests/ECommerce.Api.Tests/ApiWebApplicationFactory.cs`
- Modify: `backend/tests/ECommerce.Api.Tests/HealthEndpointTests.cs`
- Test: `backend/tests/ECommerce.Api.Tests/HealthEndpointTests.cs`

**Interfaces:**
- Consumes: approved AC content from Git object `13541ef:docs/acceptance-criteria/US-2-category-management.md`.
- Produces: a test host that supplies `Jwt:Key`, `Jwt:Issuer`, and `Jwt:Audience` before `Program.cs` reads configuration.

- [ ] **Step 1: Restore the approved AC document without merging the old feature branch**

Use the exact blob from the approved commit:

```powershell
git show 13541ef:docs/acceptance-criteria/US-2-category-management.md
```

Replace the current shortened document with that exact approved content. Verify the restored file contains AC-01 through AC-11, TC-01 through TC-16, and the Product Owner conclusion.

- [ ] **Step 2: Add a regression assertion for secret-free test startup**

Keep `GetHealthReturnsHealthyStatus` as the observable regression. Ensure the test clears process-level JWT variables before constructing `ApiWebApplicationFactory`, then calls `/api/health` and expects `200 OK` plus the healthy payload. The production change that must make this test fail is removing the test host's pre-start JWT settings.

- [ ] **Step 3: Run the regression test and verify RED**

```powershell
dotnet test backend/ECommerce.slnx --configuration Release --filter "FullyQualifiedName~HealthEndpointTests.GetHealthReturnsHealthyStatus"
```

Expected: FAIL at `Program.cs` with `Configuration 'Jwt:Key' is not configured`.

- [ ] **Step 4: Supply JWT values before application startup**

In `ApiWebApplicationFactory`, set host settings before `WebApplication.CreateBuilder` consumes them. Use `builder.UseSetting` for:

```csharp
builder.UseSetting("Jwt:Key", TestJwt.SigningKey);
builder.UseSetting("Jwt:Issuer", TestJwt.Issuer);
builder.UseSetting("Jwt:Audience", TestJwt.Audience);
```

Remove the ineffective late `ConfigureAppConfiguration` JWT block. Keep `UseEnvironment("Testing")`, in-memory EF configuration, and test-only values.

- [ ] **Step 5: Run Backend tests and verify GREEN**

```powershell
dotnet test backend/ECommerce.slnx --configuration Release
```

Expected: all current Backend tests PASS without User Secrets or JWT environment variables.

- [ ] **Step 6: Commit the contract and regression repair**

```powershell
git add -- docs/acceptance-criteria/US-2-category-management.md backend/tests/ECommerce.Api.Tests/ApiWebApplicationFactory.cs backend/tests/ECommerce.Api.Tests/HealthEndpointTests.cs
git commit -m "fix: restore US-2 contract and test configuration"
```

---

### Task 2: Implement Minimum Admin Login and JWT Issuance

**Files:**
- Create: `backend/src/ECommerce.Api/DTOs/Auth/LoginRequest.cs`
- Create: `backend/src/ECommerce.Api/DTOs/Auth/LoginResponse.cs`
- Create: `backend/src/ECommerce.Api/DTOs/Auth/AuthenticatedUserResponse.cs`
- Create: `backend/src/ECommerce.Api/Services/Interfaces/IAuthService.cs`
- Create: `backend/src/ECommerce.Api/Services/Interfaces/IJwtTokenService.cs`
- Create: `backend/src/ECommerce.Api/Services/AuthService.cs`
- Create: `backend/src/ECommerce.Api/Services/JwtTokenService.cs`
- Create: `backend/src/ECommerce.Api/Controllers/AuthController.cs`
- Modify: `backend/src/ECommerce.Api/Services/ServiceResult.cs`
- Modify: `backend/src/ECommerce.Api/Program.cs`
- Create: `backend/tests/ECommerce.Api.Tests/AuthServiceTests.cs`
- Create: `backend/tests/ECommerce.Api.Tests/AuthEndpointTests.cs`
- Create: `backend/tests/ECommerce.Api.Tests/JwtTokenServiceTests.cs`

**Interfaces:**
- Consumes: `AppDbContext.Users`, `User`, `UserRoles`, configuration section `Jwt`.
- Produces: `IAuthService.LoginAsync(LoginRequest, CancellationToken)`, `IJwtTokenService.CreateToken(User)`, and `POST /api/auth/login`.

- [ ] **Step 1: Write failing service tests for login**

Cover these observable results:

```csharp
LoginAsyncReturnsInvalidForMissingEmailOrPassword
LoginAsyncReturnsUnauthorizedForUnknownEmail
LoginAsyncReturnsUnauthorizedForWrongPassword
LoginAsyncReturnsTokenAndSafeUserForValidCredentials
LoginAsyncMatchesEmailCaseInsensitivelyAfterTrimming
```

Extend `ServiceStatus` with `Unauthorized`, and expect invalid credentials to use one generic detail: `"Email or password is incorrect."`.

- [ ] **Step 2: Run the service tests and verify RED**

```powershell
dotnet test backend/ECommerce.slnx --configuration Release --filter "FullyQualifiedName~AuthServiceTests"
```

Expected: FAIL because Auth DTOs/services do not exist.

- [ ] **Step 3: Add DTOs and service interfaces**

Define:

```csharp
public sealed record LoginRequest(string? Email, string? Password);
public sealed record AuthenticatedUserResponse(int Id, string FullName, string Email, string Role);
public sealed record LoginResponse(string AccessToken, DateTime ExpiresAt, AuthenticatedUserResponse User);
public sealed record JwtTokenResult(string AccessToken, DateTime ExpiresAt);
```

`IAuthService.LoginAsync` returns `Task<ServiceResult<LoginResponse>>`. `IJwtTokenService.CreateToken(User user)` returns `JwtTokenResult`.

- [ ] **Step 4: Implement `JwtTokenService` and tests**

Write failing tests proving the token contains name identifier, email, full name, and role and uses the configured expiration. Implement HMAC SHA-256 JWT creation using `Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience`, and `Jwt:ExpirationMinutes` with a documented safe default of 60 minutes when the setting is absent or invalid.

- [ ] **Step 5: Implement `AuthService` minimally**

Trim and normalize email, query `Users` case-insensitively, verify with `IPasswordHasher<User>`, and return only the safe user DTO plus JWT. Do not expose `PasswordHash`. Treat `Failed` and `SuccessRehashNeeded` correctly; login succeeds for both success values but does not add unrelated password-upgrade behavior in this task.

- [ ] **Step 6: Run Auth service/JWT tests and verify GREEN**

```powershell
dotnet test backend/ECommerce.slnx --configuration Release --filter "FullyQualifiedName~AuthServiceTests|FullyQualifiedName~JwtTokenServiceTests"
```

Expected: PASS.

- [ ] **Step 7: Write failing endpoint tests**

Cover `400` for missing fields, generic `401` for invalid credentials, and `200` with token plus safe Admin data for a valid login. Seed a hashed Admin through the factory's scoped `AppDbContext`; never place plaintext password in an Entity.

- [ ] **Step 8: Add `AuthController` and DI registrations**

`AuthController.Login` delegates to `IAuthService` and maps `Success`, `Invalid`, and `Unauthorized` to `200`, Validation Problem Details `400`, and generic Problem Details `401`. Register `IPasswordHasher<User>`, `IAuthService`, and `IJwtTokenService` in `Program.cs`.

- [ ] **Step 9: Run endpoint and full Backend tests**

```powershell
dotnet test backend/ECommerce.slnx --configuration Release --filter "FullyQualifiedName~AuthEndpointTests"
dotnet test backend/ECommerce.slnx --configuration Release
```

Expected: PASS without external secrets.

- [ ] **Step 10: Commit authentication**

```powershell
git add -- backend/src/ECommerce.Api backend/tests/ECommerce.Api.Tests
git commit -m "feat: add minimum Admin JWT login"
```

---

### Task 3: Add the Development Admin Seeder

**Files:**
- Create: `backend/src/ECommerce.Api/Configuration/AdminSeedOptions.cs`
- Create: `backend/src/ECommerce.Api/Data/DevelopmentAdminSeeder.cs`
- Modify: `backend/src/ECommerce.Api/Program.cs`
- Create: `backend/tests/ECommerce.Api.Tests/DevelopmentAdminSeederTests.cs`

**Interfaces:**
- Consumes: `AdminSeed:Email`, `AdminSeed:Password`, `AdminSeed:FullName`, `AppDbContext`, and `IPasswordHasher<User>`.
- Produces: `DevelopmentAdminSeeder.SeedAsync(CancellationToken)` and Development-only startup invocation.

- [ ] **Step 1: Write failing seeder tests**

Cover:

```csharp
SeedAsyncDoesNothingWhenAllValuesAreAbsent
SeedAsyncRejectsPartiallyConfiguredCredentials
SeedAsyncCreatesAdminWithHashedPassword
SeedAsyncDoesNotReplaceExistingAdminOrPassword
SeedAsyncNormalizesEmailAndUsesAdminRole
```

Assert the stored hash is not the plaintext password and verifies through `PasswordHasher<User>`.

- [ ] **Step 2: Run tests and verify RED**

```powershell
dotnet test backend/ECommerce.slnx --configuration Release --filter "FullyQualifiedName~DevelopmentAdminSeederTests"
```

Expected: FAIL because the seeder does not exist.

- [ ] **Step 3: Implement options validation and idempotent seeding**

Use a focused options record with nullable strings. All absent means no-op; partially present means `InvalidOperationException` naming only the missing configuration keys. Normalize email with trim plus lowercase for lookup/storage, hash the password, set `Role = UserRoles.Admin`, and stamp `CreatedAt = DateTime.UtcNow`. Never reset an existing user's password.

- [ ] **Step 4: Invoke only in Development**

After `app` is built and before `app.Run`, create a scope and call the seeder only under `app.Environment.IsDevelopment()`. Testing and Production must not seed.

- [ ] **Step 5: Run focused and full tests**

```powershell
dotnet test backend/ECommerce.slnx --configuration Release --filter "FullyQualifiedName~DevelopmentAdminSeederTests"
dotnet test backend/ECommerce.slnx --configuration Release
```

Expected: PASS.

- [ ] **Step 6: Commit the seeder**

```powershell
git add -- backend/src/ECommerce.Api/Configuration backend/src/ECommerce.Api/Data/DevelopmentAdminSeeder.cs backend/src/ECommerce.Api/Program.cs backend/tests/ECommerce.Api.Tests/DevelopmentAdminSeederTests.cs
git commit -m "feat: seed Development Admin securely"
```

---

### Task 4: Complete Database Delivery and Category Conflict Mapping

**Files:**
- Create: `backend/src/ECommerce.Api/Data/ISqlServerErrorClassifier.cs`
- Create: `backend/src/ECommerce.Api/Data/SqlServerErrorClassifier.cs`
- Modify: `backend/src/ECommerce.Api/Services/CategoryService.cs`
- Modify: `backend/src/ECommerce.Api/Program.cs`
- Modify: `backend/tests/ECommerce.Api.Tests/CategoryServiceTests.cs`
- Create: `backend/tests/ECommerce.Api.Tests/SqlServerErrorClassifierTests.cs`
- Create: `backend/src/ECommerce.Api/Data/Migrations/*_CreateSprint1Catalog.cs` (generated)
- Create: `backend/src/ECommerce.Api/Data/Migrations/*_CreateSprint1Catalog.Designer.cs` (generated)
- Create: `backend/src/ECommerce.Api/Data/Migrations/AppDbContextModelSnapshot.cs` (generated)
- Delete: `backend/src/ECommerce.Api/Data/Migrations/.gitkeep`

**Interfaces:**
- Consumes: SQL Server duplicate key numbers `2601` and `2627`, existing Category conflict response, EF Core model.
- Produces: `ISqlServerErrorClassifier.IsUniqueConstraintViolation(DbUpdateException)` and initial Sprint 1 migration.

- [ ] **Step 1: Write failing conflict-classifier tests**

Use a testable classifier boundary so service tests can distinguish an applicable unique violation from an unrelated `DbUpdateException`. Tests must prove create/update return the existing duplicate-name conflict only when the classifier returns true and rethrow unrelated database errors.

- [ ] **Step 2: Run tests and verify RED**

```powershell
dotnet test backend/ECommerce.slnx --configuration Release --filter "FullyQualifiedName~CategoryServiceTests|FullyQualifiedName~SqlServerErrorClassifierTests"
```

Expected: new tests FAIL because the classifier and exception mapping do not exist.

- [ ] **Step 3: Implement minimal SQL Server classification and Category handling**

Recursively inspect `DbUpdateException.InnerException` for `Microsoft.Data.SqlClient.SqlException` numbers `2601` or `2627`. In Category create/update, catch only classified unique violations, detach failed added state or reload modified state as appropriate, and return the existing `409` detail. Rethrow every other database exception.

- [ ] **Step 4: Run Category tests and verify GREEN**

```powershell
dotnet test backend/ECommerce.slnx --configuration Release --filter "FullyQualifiedName~CategoryServiceTests|FullyQualifiedName~SqlServerErrorClassifierTests"
```

Expected: PASS.

- [ ] **Step 5: Generate the initial migration**

Generated code is exempt from test-first but must be reviewed:

```powershell
dotnet ef migrations add CreateSprint1Catalog --project backend/src/ECommerce.Api --output-dir Data/Migrations
```

Do not apply the migration unless a local SQL Server connection has been configured.

- [ ] **Step 6: Review migration contents**

Verify Users/Categories/Products only; unique email/name indexes; restricted Category delete; decimal precision; non-negative checks; field lengths; no credentials or later-Sprint tables.

- [ ] **Step 7: Verify model and Backend**

```powershell
dotnet ef migrations list --project backend/src/ECommerce.Api
dotnet build backend/ECommerce.slnx --configuration Release
dotnet test backend/ECommerce.slnx --configuration Release --no-build
```

Expected: migration listed; build and tests PASS.

- [ ] **Step 8: Commit database completion**

```powershell
git add -- backend/src/ECommerce.Api/Data backend/src/ECommerce.Api/Services/CategoryService.cs backend/src/ECommerce.Api/Program.cs backend/tests/ECommerce.Api.Tests
git commit -m "fix: complete Category persistence rules"
```

---

### Task 5: Add Frontend API Client, Auth Session, and Login Page

**Files:**
- Create: `frontend/src/types/api.ts`
- Create: `frontend/src/types/auth.ts`
- Create: `frontend/src/services/apiClient.ts`
- Create: `frontend/src/services/authService.ts`
- Create: `frontend/src/services/authSession.ts`
- Create: `frontend/src/services/authSession.test.ts`
- Create: `frontend/src/pages/LoginPage.tsx`
- Create: `frontend/src/pages/LoginPage.test.tsx`
- Modify: `frontend/src/test/setup.ts`

**Interfaces:**
- Consumes: `POST /api/auth/login`, `VITE_API_BASE_URL`, browser `sessionStorage`.
- Produces: `apiRequest<T>()`, `login(credentials)`, `getSession()`, `saveSession()`, `clearSession()`, and `LoginPage`.

- [ ] **Step 1: Write failing auth-session tests**

Cover save/read, malformed JSON cleanup, invalid response-shape cleanup, and logout. Use one key: `ecommerce.auth.v1`.

- [ ] **Step 2: Run and verify RED**

```powershell
npm --prefix frontend test -- src/services/authSession.test.ts
```

Expected: FAIL because modules do not exist.

- [ ] **Step 3: Implement frontend auth types and session**

Define `AuthUser`, `AuthSession`, and `LoginCredentials` with no `any`. Validate unknown stored JSON before casting. Export focused functions rather than a global mutable singleton.

- [ ] **Step 4: Write failing Login page tests**

Cover required email/password, disabled submit while pending, generic invalid-credential message, successful session save, and callback/navigation request after success. Mock only the service boundary, not component internals.

- [ ] **Step 5: Implement centralized API/auth services and Login page**

`apiClient` parses successful JSON and Problem Details, attaches Bearer token when present, clears session on `401`, and throws a typed `ApiError(status, title, detail, errors)`. `LoginPage` uses labeled controls, visible error summary/field errors, and no hardcoded credentials.

- [ ] **Step 6: Run focused tests and verify GREEN**

```powershell
npm --prefix frontend test -- src/services/authSession.test.ts src/pages/LoginPage.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit frontend authentication**

```powershell
git add -- frontend/src/types frontend/src/services frontend/src/pages/LoginPage.tsx frontend/src/pages/LoginPage.test.tsx frontend/src/test/setup.ts
git commit -m "feat: add Admin login session"
```

---

### Task 6: Add Minimal Routing and Admin Protection

**Files:**
- Create: `frontend/src/routes/appRoute.ts`
- Create: `frontend/src/routes/AdminRoute.tsx`
- Create: `frontend/src/routes/AdminRoute.test.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/App.test.tsx`

**Interfaces:**
- Consumes: `window.location.pathname`, History API, and `authSession.getSession()`.
- Produces: navigation between `/login` and `/admin/categories` without a routing dependency.

- [ ] **Step 1: Write failing route tests**

Cover Guest redirect to `/login`, Customer access-denied output, Admin Category route rendering, successful-login navigation, logout session clearing, and unknown-route fallback.

- [ ] **Step 2: Run and verify RED**

```powershell
npm --prefix frontend test -- src/App.test.tsx src/routes/AdminRoute.test.tsx
```

Expected: FAIL because route helpers and guard do not exist.

- [ ] **Step 3: Implement minimal History API routing**

Export `navigate(path)` that calls `history.pushState` and dispatches one `popstate` event. `App` listens for `popstate`, renders Login or the guarded Category page, and does not add `react-router-dom`.

- [ ] **Step 4: Run and verify GREEN**

```powershell
npm --prefix frontend test -- src/App.test.tsx src/routes/AdminRoute.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit routing**

```powershell
git add -- frontend/src/App.tsx frontend/src/App.test.tsx frontend/src/routes
git commit -m "feat: protect Admin frontend routes"
```

---

### Task 7: Implement Category Management UI

**Files:**
- Create: `frontend/src/types/category.ts`
- Create: `frontend/src/services/categoryService.ts`
- Create: `frontend/src/services/categoryService.test.ts`
- Create: `frontend/src/components/categories/CategoryForm.tsx`
- Create: `frontend/src/components/categories/CategoryForm.test.tsx`
- Create: `frontend/src/components/categories/CategoryTable.tsx`
- Create: `frontend/src/components/categories/ConfirmDialog.tsx`
- Create: `frontend/src/pages/CategoryManagementPage.tsx`
- Create: `frontend/src/pages/CategoryManagementPage.test.tsx`
- Modify: `frontend/src/App.css`
- Modify: `frontend/src/index.css`

**Interfaces:**
- Consumes: Category API DTOs and Admin JWT session.
- Produces: end-to-end Admin Category list/create/update/delete UI satisfying AC-11.

- [ ] **Step 1: Write failing Category service tests**

Cover exact methods and routes:

```typescript
listCategories(): Promise<Category[]>
createCategory(input: CategoryInput): Promise<Category>
updateCategory(id: number, input: CategoryInput): Promise<Category>
deleteCategory(id: number): Promise<void>
```

Assert JSON bodies, URL encoding, HTTP methods, and typed `ApiError` propagation.

- [ ] **Step 2: Run service tests and verify RED**

```powershell
npm --prefix frontend test -- src/services/categoryService.test.ts
```

Expected: FAIL because Category service/types do not exist.

- [ ] **Step 3: Implement Category types and service**

Define `Category { id, name, description, createdAt }` and `CategoryInput { name, description }`. All calls delegate to `apiRequest`; no component constructs API URLs.

- [ ] **Step 4: Write failing form/component tests**

Cover trimmed Name length 2–100, Description maximum 500, field errors, create/edit initial values, pending state, delete confirmation/cancel, and accessible labels/buttons.

- [ ] **Step 5: Implement focused form/table/dialog components**

Keep Category validation in one frontend function reused by create/edit. Confirmation must not call delete until explicitly accepted.

- [ ] **Step 6: Write failing page behavior tests**

Cover loading, empty, loaded list, load failure/retry, successful create/update/delete, duplicate-name `409`, in-use delete `409`, rejected mutation preserving current UI, and logout.

- [ ] **Step 7: Implement `CategoryManagementPage` minimally**

Load once on mount; use explicit operation state; update the list only from successful API responses; keep errors user-readable; clear stale form errors after a successful operation. Do not introduce global state.

- [ ] **Step 8: Add responsive accessible styling**

Replace baseline demo styles only where necessary. Provide visible focus, readable tables/forms, mobile stacking, error/success colors with text labels, and dialog semantics. Do not add a UI framework or unrelated redesign.

- [ ] **Step 9: Run frontend quality checks**

```powershell
npm --prefix frontend run lint
npm --prefix frontend test
npm --prefix frontend run build
```

Expected: lint, all tests, TypeScript, and Vite build PASS.

- [ ] **Step 10: Commit Category UI**

```powershell
git add -- frontend/src
git commit -m "feat: add Category management UI"
```

---

### Task 8: Update Setup Documentation and Run Final Verification

**Files:**
- Modify: `README.md`
- Modify: `backend/src/ECommerce.Api/ECommerce.Api.http`
- Verify: `.github/workflows/ci.yml`
- Verify: `docs/database-erd.md`
- Verify: all files changed by Tasks 1–7

**Interfaces:**
- Consumes: final API routes, migration name, secret keys, frontend routes, and run commands.
- Produces: reproducible local setup and evidence for Pull Request review.

- [ ] **Step 1: Update README from the actual implementation**

Document:

```powershell
dotnet user-secrets set "ConnectionStrings:ECommerce" "Server=(localdb)\MSSQLLocalDB;Database=ECommerce;Trusted_Connection=True;TrustServerCertificate=True" --project backend/src/ECommerce.Api
dotnet user-secrets set "Jwt:Key" "development-only-jwt-signing-key-2026" --project backend/src/ECommerce.Api
dotnet user-secrets set "AdminSeed:Email" "admin@example.com" --project backend/src/ECommerce.Api
dotnet user-secrets set "AdminSeed:Password" "ChangeMe-Development-Only-2026!" --project backend/src/ECommerce.Api
dotnet user-secrets set "AdminSeed:FullName" "Administrator" --project backend/src/ECommerce.Api
dotnet ef database update --project backend/src/ECommerce.Api
```

State clearly that example credentials are placeholders, seeding is Development-only, and the application no longer represents an empty technical baseline.

- [ ] **Step 2: Update the HTTP request examples**

Add login, public Category reads, and Admin mutation examples using a placeholder `{{jwt}}`. Do not put a working token or password in the tracked file.

- [ ] **Step 3: Verify documentation and CI compatibility**

Confirm CI needs no secret after the test-host fix. Confirm ERD matches the generated migration. Scan for stale claims that Sprint 1 endpoints/entities do not exist.

- [ ] **Step 4: Run the full clean verification suite**

```powershell
dotnet clean backend/ECommerce.slnx --configuration Release
dotnet restore backend/ECommerce.slnx
dotnet build backend/ECommerce.slnx --configuration Release --no-restore
dotnet test backend/ECommerce.slnx --configuration Release --no-build --no-restore
npm --prefix frontend ci
npm --prefix frontend run lint
npm --prefix frontend test
npm --prefix frontend run build
powershell.exe -NoProfile -File .agents/tests/validate-skills.ps1
git diff --check
git status --short
```

Expected: every command exits `0`; all tests PASS; only intended documentation changes remain before the final commit.

- [ ] **Step 5: Perform security and scope scans**

```powershell
rg -n -i "password=|pwd=|api[_-]?key|jwt.*key.*[A-Za-z0-9]{16}" --glob '!docs/superpowers/**' --glob '!README.md'
rg -n "CartController|OrderController|PaymentController|PasswordReset" backend frontend
git diff main...HEAD --stat
```

Expected: no real secret and no out-of-Sprint implementation.

- [ ] **Step 6: Commit final documentation**

```powershell
git add -- README.md backend/src/ECommerce.Api/ECommerce.Api.http docs/database-erd.md .github/workflows/ci.yml
git commit -m "docs: document US-2 setup and verification"
```

- [ ] **Step 7: Review branch readiness without merging**

```powershell
git status --short --branch
git log --oneline main..HEAD
git diff --check main...HEAD
```

Expected: clean feature branch with focused conventional commits. Prepare a Pull Request targeting `develop`, explain that `develop` is behind PR #1, include AC/test/migration evidence, and do not claim US-2 Done until Product Owner acceptance.
