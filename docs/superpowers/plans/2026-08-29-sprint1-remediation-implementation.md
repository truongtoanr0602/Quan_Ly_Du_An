# Sprint 1 Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Sprint 1 Product Catalog and Authentication increment secure, testable, and demo-ready without adding Cart, Checkout, or Order behavior.

**Architecture:** Preserve the approved React -> REST API -> Controller -> Service -> EF Core / `AppDbContext` -> SQL Server flow. Configuration and bootstrap remain infrastructure concerns, controllers retain HTTP concerns, services own catalog/auth rules, and centralized middleware maps expected domain failures to safe Problem Details. The existing Cart/Order/Address model and inactive Cart UI remain unchanged as approved Sprint 2 foundation.

**Tech Stack:** .NET 10, ASP.NET Core Web API, EF Core 10/SQL Server, JWT, xUnit, React 19, TypeScript, Vite, Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-29-sprint1-remediation-design.md`

## Global Constraints

- Work only on `feature/sprint1-remediation`; do not touch the user's separate `.agents/skills/architecture/SKILL.md` modification in the original checkout.
- Do not add Cart, Checkout, Order, payment, password-reset, or Brand-management behavior.
- Keep existing Cart UI/state, `CartContext.tsx`, and `ecommerce_cart` persistence unchanged.
- Do not edit `InitialCreate`; database changes use a new reviewed EF Core migration.
- Do not add a package, test provider, repository layer, or new framework.
- Do not track a connection string, usable JWT key, bootstrap password, or other secret.
- Preserve public route paths and response fields. Document status-code corrections and the additive product `isActive` field.
- Run the focused test before each implementation step; run full backend/frontend checks before every commit that changes either application.

---

## File structure and contracts

| Path | Responsibility |
| --- | --- |
| `backend/src/ECommerce.Api/Configuration/BootstrapAdminOptions.cs` | Reads and validates the three Development Admin bootstrap values. |
| `backend/src/ECommerce.Api/Data/DevelopmentAdminBootstrapper.cs` | Creates at most one hashed Development Admin after migrations have been applied manually. |
| `backend/src/ECommerce.Api/Exceptions/*.cs` | Declares expected resource/conflict/credential/configuration failures. |
| `backend/src/ECommerce.Api/Middleware/ExceptionHandlingMiddleware.cs` | Converts expected failures and unexpected errors to safe RFC 7807 responses. |
| `backend/src/ECommerce.Api/Data/Configurations/*.cs` | Seeds deterministic Role and Brand data. |
| `backend/src/ECommerce.Api/Services/*` | Implements registration, Category dependencies, Product visibility, and reference validation. |
| `backend/tests/ECommerce.Api.Tests/TestApiFactory.cs` | Supplies a test-only JWT/configuration and test JWT clients without a developer secret. |
| `frontend/src/config/env.ts` | Exposes the one normalized API base URL. |
| `frontend/src/services/authSession.ts` | Owns browser auth storage and session-change notification. |
| `frontend/src/contexts/AuthContext.tsx` | Exposes typed session state and login/register/logout operations to React. |
| `frontend/src/routes/RequireAdmin.tsx` | Performs client-side Admin routing guard only; backend remains authoritative. |

## Task 1: Establish safe startup configuration and a reusable API test host

**Files:**
- Create: `backend/tests/ECommerce.Api.Tests/TestApiFactory.cs`
- Modify: `backend/src/ECommerce.Api/ECommerce.Api.csproj`
- Modify: `backend/src/ECommerce.Api/Program.cs`
- Modify: `backend/src/ECommerce.Api/appsettings.json`
- Modify: `backend/src/ECommerce.Api/appsettings.Development.json`
- Modify: `backend/tests/ECommerce.Api.Tests/HealthEndpointTests.cs`
- Test: `backend/tests/ECommerce.Api.Tests/StartupConfigurationTests.cs`

**Interfaces:**
- Consumes: configuration keys `ConnectionStrings:ECommerce`, `Jwt:Key`, `Jwt:Issuer`, and `Jwt:Audience`.
- Produces: `TestApiFactory` with a 40-byte non-secret test key, and API startup that accepts only a nonblank >=32-byte signing key.

- [ ] **Step 1: Write failing startup/configuration tests.**

```csharp
[Fact]
public void CreateClientWithoutJwtKeyFailsWithoutEchoingConfiguration()
{
    using var factory = new TestApiFactory(withJwtKey: false);

    var exception = Assert.ThrowsAny<Exception>(() => factory.CreateClient());

    Assert.DoesNotContain("test-signing-key", exception.ToString(), StringComparison.OrdinalIgnoreCase);
}

[Fact]
public async Task HealthEndpointStartsWhenTestConfigurationSuppliesJwtKey()
{
    using var factory = new TestApiFactory();
    using var client = factory.CreateClient();

    using var response = await client.GetAsync("/api/health");

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
}
```

- [ ] **Step 2: Run the new tests to verify the missing-key assertion fails against the current configuration behavior.**

Run:

```powershell
dotnet test backend/tests/ECommerce.Api.Tests --configuration Release --filter "FullyQualifiedName~StartupConfigurationTests"
```

Expected: at least one failing assertion because the current host takes its usable key from tracked configuration rather than the factory's in-memory configuration.

- [ ] **Step 3: Add a stable User Secrets identifier and remove tracked values.**

Add this property to `ECommerce.Api.csproj`:

```xml
<UserSecretsId>ECommerce.Api-0b6e7ea9-3e3b-4f65-a7b2-8a91bb6e515b</UserSecretsId>
```

Keep issuer/audience and CORS settings in tracked files, but replace only sensitive values with blank strings:

```json
"ConnectionStrings": { "ECommerce": "" },
"Jwt": {
  "Key": "",
  "Issuer": "ECommerce.Api",
  "Audience": "ECommerce.Frontend"
}
```

Do not put a sample usable key or a local SQL Server value in either tracked settings file.

- [ ] **Step 4: Add explicit startup validation in `Program.cs`.**

Use a local helper before `AddAuthentication`:

```csharp
static string RequireConfigurationValue(IConfiguration configuration, string key)
{
    var value = configuration[key];
    if (string.IsNullOrWhiteSpace(value))
    {
        throw new InvalidOperationException($"Required configuration '{key}' is missing.");
    }

    return value;
}

var connectionString = RequireConfigurationValue(builder.Configuration, "ConnectionStrings:ECommerce");
var issuer = RequireConfigurationValue(builder.Configuration, "Jwt:Issuer");
var audience = RequireConfigurationValue(builder.Configuration, "Jwt:Audience");
var secretKey = RequireConfigurationValue(builder.Configuration, "Jwt:Key");

if (Encoding.UTF8.GetByteCount(secretKey) < 32)
{
    throw new InvalidOperationException("JWT signing key must be at least 32 bytes.");
}
```

Pass `connectionString`, `issuer`, `audience`, and `secretKey` into the existing DbContext/JWT registrations. Do not include their values in exceptions or logs.

- [ ] **Step 5: Implement `TestApiFactory` and update the health test to use it.**

```csharp
public sealed class TestApiFactory(
    bool withJwtKey = true,
    Action<IServiceCollection>? configureTestServices = null) : WebApplicationFactory<Program>
{
    public const string TestJwtKey = "test-signing-key-that-is-at-least-32-bytes-long";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, configuration) =>
        {
            var values = new Dictionary<string, string?>
            {
                ["ConnectionStrings:ECommerce"] = "Server=(localdb)\\MSSQLLocalDB;Database=ECommerce_Test;Trusted_Connection=True;TrustServerCertificate=True",
                ["Jwt:Issuer"] = "ECommerce.Api.Tests",
                ["Jwt:Audience"] = "ECommerce.Frontend.Tests"
            };

            if (withJwtKey)
            {
                values["Jwt:Key"] = TestJwtKey;
            }

            configuration.AddInMemoryCollection(values);
        });

        builder.ConfigureTestServices(services => configureTestServices?.Invoke(services));
    }
}
```

Use `TestApiFactory` in `HealthEndpointTests`; it must still call the existing health route without opening a SQL connection.

For endpoint tests, pass `configureTestServices` to replace the target service with `services.RemoveAll<IService>(); services.AddScoped<IService>(_ => testDouble);`; this keeps controller and middleware contracts testable without EF or a SQL connection.

Expose `CreateClientWithRole(string? role)`: it creates a short-lived JWT signed by `TestJwtKey` with the test issuer/audience and a `ClaimTypes.Role` claim when `role` is non-null; null leaves the request unauthenticated. Each test owns and disposes its factory and client.

- [ ] **Step 6: Run focused and full backend verification.**

Run:

```powershell
dotnet test backend/tests/ECommerce.Api.Tests --configuration Release --filter "FullyQualifiedName~StartupConfigurationTests|FullyQualifiedName~HealthEndpointTests"
dotnet build backend/ECommerce.slnx --configuration Release
dotnet test backend/ECommerce.slnx --configuration Release --no-build
```

Expected: all startup/health tests pass and no tracked secret is required by test startup.

- [ ] **Step 7: Commit the configuration/test-host deliverable.**

```powershell
git add -- backend/src/ECommerce.Api/ECommerce.Api.csproj backend/src/ECommerce.Api/Program.cs backend/src/ECommerce.Api/appsettings.json backend/src/ECommerce.Api/appsettings.Development.json backend/tests/ECommerce.Api.Tests/TestApiFactory.cs backend/tests/ECommerce.Api.Tests/HealthEndpointTests.cs backend/tests/ECommerce.Api.Tests/StartupConfigurationTests.cs
git commit -m "fix: secure API startup configuration"
```

## Task 2: Seed Role and Brand data and add Development-only Admin bootstrap

**Files:**
- Create: `backend/src/ECommerce.Api/Configuration/BootstrapAdminOptions.cs`
- Create: `backend/src/ECommerce.Api/Data/DevelopmentAdminBootstrapper.cs`
- Modify: `backend/src/ECommerce.Api/Data/Configurations/RoleConfiguration.cs`
- Modify: `backend/src/ECommerce.Api/Data/Configurations/BrandConfiguration.cs`
- Modify: `backend/src/ECommerce.Api/Program.cs`
- Create: `backend/src/ECommerce.Api/Migrations/<timestamp>_SeedRolesAndBrands.cs`
- Create: `backend/src/ECommerce.Api/Migrations/<timestamp>_SeedRolesAndBrands.Designer.cs`
- Modify: `backend/src/ECommerce.Api/Migrations/AppDbContextModelSnapshot.cs`
- Test: `backend/tests/ECommerce.Api.Tests/BootstrapAdminOptionsTests.cs`

**Interfaces:**
- Consumes: `BootstrapAdmin:Email`, `BootstrapAdmin:Password`, `BootstrapAdmin:FullName` from Development User Secrets/environment.
- Produces: fixed Role IDs `1 Customer`, `2 Admin`; fixed Brand IDs `1 Apple`, `2 ASUS`, `3 Lenovo`, `4 Dell`, `5 Sony`; a Development-only bootstrap operation.

- [ ] **Step 1: Write failing options validation tests.**

```csharp
[Theory]
[InlineData(null, null, null, false)]
[InlineData("admin@example.test", "password", null, true)]
[InlineData("admin@example.test", "password", "Development Admin", false)]
public void BootstrapOptionsReportsOnlyPartialConfigurationAsInvalid(
    string? email,
    string? password,
    string? fullName,
    bool expectedInvalid)
{
    var options = new BootstrapAdminOptions(email, password, fullName);

    Assert.Equal(expectedInvalid, options.IsPartiallyConfigured);
}
```

- [ ] **Step 2: Run the focused test to verify it fails because `BootstrapAdminOptions` does not exist.**

Run:

```powershell
dotnet test backend/tests/ECommerce.Api.Tests --configuration Release --filter "FullyQualifiedName~BootstrapAdminOptionsTests"
```

Expected: compile failure for the missing `BootstrapAdminOptions` type.

- [ ] **Step 3: Implement the options value object.**

```csharp
namespace ECommerce.Api.Configuration;

public sealed record BootstrapAdminOptions(string? Email, string? Password, string? FullName)
{
    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(Email) &&
        !string.IsNullOrWhiteSpace(Password) &&
        !string.IsNullOrWhiteSpace(FullName);

    public bool IsPartiallyConfigured =>
        !IsConfigured && new[] { Email, Password, FullName }.Any(value => !string.IsNullOrWhiteSpace(value));
}
```

- [ ] **Step 4: Seed deterministic Role and Brand rows in their existing configurations.**

Add `HasData` after each table's property/index configuration. Use a fixed UTC timestamp rather than `DateTime.UtcNow`:

```csharp
var seedTimestamp = new DateTime(2026, 8, 29, 0, 0, 0, DateTimeKind.Utc);

builder.HasData(
    new Role { RoleID = 1, RoleName = "Customer", Description = "Customer role", CreatedAt = seedTimestamp },
    new Role { RoleID = 2, RoleName = "Admin", Description = "Administrator role", CreatedAt = seedTimestamp });
```

```csharp
builder.HasData(
    new Brand { BrandID = 1, BrandName = "Apple", IsActive = true, CreatedAt = seedTimestamp },
    new Brand { BrandID = 2, BrandName = "ASUS", IsActive = true, CreatedAt = seedTimestamp },
    new Brand { BrandID = 3, BrandName = "Lenovo", IsActive = true, CreatedAt = seedTimestamp },
    new Brand { BrandID = 4, BrandName = "Dell", IsActive = true, CreatedAt = seedTimestamp },
    new Brand { BrandID = 5, BrandName = "Sony", IsActive = true, CreatedAt = seedTimestamp });
```

- [ ] **Step 5: Implement Development-only bootstrap behavior.**

`DevelopmentAdminBootstrapper.EnsureCreatedAsync` must:

```csharp
public async Task EnsureCreatedAsync(CancellationToken cancellationToken)
{
    if (_options.IsPartiallyConfigured)
        throw new InvalidOperationException("BootstrapAdmin configuration must provide Email, Password, and FullName together.");
    if (!_options.IsConfigured)
        return;

    var existingEmail = await _context.Users
        .Include(user => user.Role)
        .FirstOrDefaultAsync(user => user.Email == _options.Email, cancellationToken);
    if (existingEmail is not null)
    {
        if (existingEmail.Role.RoleName == "Admin")
            return;

        throw new InvalidOperationException("BootstrapAdmin email is already assigned to a non-admin account.");
    }

    var existingAdmin = await _context.Users
        .Include(user => user.Role)
        .AnyAsync(user => user.Role.RoleName == "Admin", cancellationToken);
    if (existingAdmin)
        return;

    var adminRole = await _context.Roles.SingleAsync(role => role.RoleName == "Admin", cancellationToken);
    _context.Users.Add(new User { Email = _options.Email!, FullName = _options.FullName!, PasswordHash = BCrypt.Net.BCrypt.HashPassword(_options.Password!), RoleID = adminRole.RoleID, IsActive = true });
    await _context.SaveChangesAsync(cancellationToken);
}
```

Register it in DI, bind options from `BootstrapAdmin`, and call it only under `app.Environment.IsDevelopment()` with a scoped service. Do not call it from Testing or Production and do not call `Database.Migrate()`.

- [ ] **Step 6: Generate and inspect the migration.**

After local User Secrets contain a non-secret development JWT key and SQL connection string, run:

```powershell
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet ef migrations add SeedRolesAndBrands --project backend/src/ECommerce.Api --startup-project backend/src/ECommerce.Api
dotnet ef migrations script --idempotent --project backend/src/ECommerce.Api --startup-project backend/src/ECommerce.Api --output backend/SeedRolesAndBrands.sql
```

Inspect `backend/SeedRolesAndBrands.sql` for five `Brands` inserts and two `Roles` inserts only. Delete the generated SQL artifact after inspection because it is not a tracked deliverable:

```powershell
Remove-Item -LiteralPath backend/SeedRolesAndBrands.sql
```

- [ ] **Step 7: Run focused and full backend checks.**

Run:

```powershell
dotnet test backend/tests/ECommerce.Api.Tests --configuration Release --filter "FullyQualifiedName~BootstrapAdminOptionsTests"
dotnet build backend/ECommerce.slnx --configuration Release
dotnet test backend/ECommerce.slnx --configuration Release --no-build
```

Expected: options tests pass, migration compiles, and no existing Cart/Order/Address migration operation appears in the new migration.

- [ ] **Step 8: Commit the data/bootstrap deliverable.**

```powershell
git add -- backend/src/ECommerce.Api/Configuration/BootstrapAdminOptions.cs backend/src/ECommerce.Api/Data/DevelopmentAdminBootstrapper.cs backend/src/ECommerce.Api/Data/Configurations/RoleConfiguration.cs backend/src/ECommerce.Api/Data/Configurations/BrandConfiguration.cs backend/src/ECommerce.Api/Program.cs backend/src/ECommerce.Api/Migrations backend/tests/ECommerce.Api.Tests/BootstrapAdminOptionsTests.cs
git commit -m "feat: seed catalog roles and brands"
```

## Task 3: Centralize expected API failures and secure registration/login

**Files:**
- Create: `backend/src/ECommerce.Api/Exceptions/ResourceNotFoundException.cs`
- Create: `backend/src/ECommerce.Api/Exceptions/DomainConflictException.cs`
- Create: `backend/src/ECommerce.Api/Exceptions/InvalidCredentialsException.cs`
- Create: `backend/src/ECommerce.Api/Exceptions/DomainValidationException.cs`
- Modify: `backend/src/ECommerce.Api/Middleware/ExceptionHandlingMiddleware.cs`
- Modify: `backend/src/ECommerce.Api/Controllers/AuthController.cs`
- Modify: `backend/src/ECommerce.Api/Services/Auth/AuthService.cs`
- Modify: `backend/src/ECommerce.Api/Services/Auth/IAuthService.cs`
- Test: `backend/tests/ECommerce.Api.Tests/ExceptionHandlingMiddlewareTests.cs`
- Test: `backend/tests/ECommerce.Api.Tests/AuthControllerTests.cs`

**Interfaces:**
- Produces: `ResourceNotFoundException -> 404`, `DomainConflictException -> 409`, `InvalidCredentialsException -> 401`, `DomainValidationException -> 400`, all as `application/problem+json`.
- Produces: `POST /api/auth/register -> 201`, `POST /api/auth/login -> 200/401` while preserving `AuthResponseDto` fields.

- [ ] **Step 1: Extend middleware tests with expected domain failures.**

```csharp
[Theory]
[InlineData(typeof(ResourceNotFoundException), HttpStatusCode.NotFound, "Resource was not found.")]
[InlineData(typeof(DomainConflictException), HttpStatusCode.Conflict, "The request conflicts with existing state.")]
[InlineData(typeof(InvalidCredentialsException), HttpStatusCode.Unauthorized, "Invalid email or password.")]
[InlineData(typeof(DomainValidationException), HttpStatusCode.BadRequest, "The request is invalid.")]
public async Task InvokeAsyncMapsExpectedFailureToProblemDetails(Type exceptionType, HttpStatusCode status, string title)
{
    RequestDelegate next = _ => Task.FromException((Exception)Activator.CreateInstance(exceptionType)!);
    // invoke the existing middleware with DefaultHttpContext and assert status/title/content type
}
```

- [ ] **Step 2: Run the middleware test to verify it fails because all exceptions currently return 500.**

Run:

```powershell
dotnet test backend/tests/ECommerce.Api.Tests --configuration Release --filter "FullyQualifiedName~ExceptionHandlingMiddlewareTests"
```

Expected: failures for expected 400/401/404/409 mappings.

- [ ] **Step 3: Add the four focused exception classes and map them in middleware.**

Use this shape for each exception so no request data is embedded in an error title:

```csharp
namespace ECommerce.Api.Exceptions;

public sealed class DomainConflictException() : Exception("The request conflicts with existing state.");
```

Map exception type to exact status/title in a private `CreateProblemDetails` method. Continue logging only unexpected exceptions at error level; expected domain exceptions return their fixed Problem Details without a stack trace or SQL message.

- [ ] **Step 4: Write failing auth controller/service contract tests with a fake `IAuthService`.**

```csharp
[Fact]
public async Task RegisterReturnsCreatedWhenServiceReturnsAuthenticationResponse()
{
    var controller = new AuthController(new StubAuthService(registerResult: AuthResponse()));

    var result = await controller.Register(new RegisterDto { Email = "customer@example.test", Password = "password", FullName = "Customer" }, CancellationToken.None);

    Assert.IsType<CreatedResult>(result);
}

[Fact]
public async Task LoginLetsInvalidCredentialsReachMiddleware()
{
    // Host the controller with a stub that throws InvalidCredentialsException;
    // assert 401 application/problem+json instead of a raw { message } body.
}
```

- [ ] **Step 5: Remove controller catch-all blocks and make service outcomes explicit.**

Change the public contract to accept `CancellationToken`:

```csharp
Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto, CancellationToken cancellationToken = default);
Task<AuthResponseDto> LoginAsync(LoginDto loginDto, CancellationToken cancellationToken = default);
```

`RegisterAsync` must query the seeded `Customer` role by its exact name and throw `DomainConflictException` when an email exists. It must never inspect email text to select a role. `LoginAsync` must throw `InvalidCredentialsException` for missing, inactive, or password-mismatched users. `AuthController.Register` returns `Created("/api/auth/register", result)`; `Login` returns `Ok(result)` and neither action catches `Exception`.

- [ ] **Step 6: Run focused and full backend verification.**

Run:

```powershell
dotnet test backend/tests/ECommerce.Api.Tests --configuration Release --filter "FullyQualifiedName~ExceptionHandlingMiddlewareTests|FullyQualifiedName~AuthControllerTests"
dotnet build backend/ECommerce.slnx --configuration Release
dotnet test backend/ECommerce.slnx --configuration Release --no-build
```

Expected: fixed Problem Details errors, no raw exception message response, and unchanged health behavior.

- [ ] **Step 7: Commit the auth/error deliverable.**

```powershell
git add -- backend/src/ECommerce.Api/Exceptions backend/src/ECommerce.Api/Middleware/ExceptionHandlingMiddleware.cs backend/src/ECommerce.Api/Controllers/AuthController.cs backend/src/ECommerce.Api/Services/Auth backend/tests/ECommerce.Api.Tests/ExceptionHandlingMiddlewareTests.cs backend/tests/ECommerce.Api.Tests/AuthControllerTests.cs
git commit -m "fix: secure authentication error handling"
```

## Task 4: Protect Category mutations and enforce dependency-aware deletion

**Files:**
- Modify: `backend/src/ECommerce.Api/Controllers/CategoriesController.cs`
- Modify: `backend/src/ECommerce.Api/Services/Categories/ICategoryService.cs`
- Modify: `backend/src/ECommerce.Api/Services/Categories/CategoryService.cs`
- Test: `backend/tests/ECommerce.Api.Tests/CategoriesControllerTests.cs`

**Interfaces:**
- Produces: public `GET /api/categories` and `GET /api/categories/{id}`; Admin-only `POST`, `PUT`, `DELETE`.
- Produces: `DeleteCategoryAsync(int, CancellationToken)` that throws `ResourceNotFoundException` or `DomainConflictException`, and completes only for an empty leaf Category.

- [ ] **Step 1: Write failing route authorization and delete-outcome tests.**

```csharp
[Theory]
[InlineData(HttpStatusCode.Unauthorized, null)]
[InlineData(HttpStatusCode.Forbidden, "Customer")]
public async Task CategoryMutationRejectsNonAdmin(HttpStatusCode expected, string? role)
{
    using var factory = new TestApiFactory();
    using var client = factory.CreateClientWithRole(role);
    using var response = await client.PostAsJsonAsync("/api/categories", new { categoryName = "Audio", isActive = true });
    Assert.Equal(expected, response.StatusCode);
}

[Fact]
public async Task DeleteCategoryWithDependenciesReturnsConflictProblem()
{
    // Replace ICategoryService with a test double that throws DomainConflictException.
    // Send an Admin DELETE and assert 409 application/problem+json.
}
```

For the dependency-delete test, construct `TestApiFactory(configureTestServices: ...)`, replace `ICategoryService` with a `ThrowingCategoryService` whose delete method throws `DomainConflictException`, then send the DELETE with `factory.CreateClientWithRole("Admin")`. Stub the interface's unrelated members; do not use EF or a database.

Run the Anonymous/Customer matrix against all three mutation methods (`POST`, `PUT`, `DELETE`), not only POST. With Admin test doubles, cover delete `ResourceNotFoundException -> 404`, `DomainConflictException -> 409`, and successful empty-leaf deletion -> `204`. The local SQL functional gate separately proves that both a Product dependency and a child dependency follow the `409` path.

- [ ] **Step 2: Run focused tests to verify mutations are currently accessible without an Admin claim.**

Run:

```powershell
dotnet test backend/tests/ECommerce.Api.Tests --configuration Release --filter "FullyQualifiedName~CategoriesControllerTests"
```

Expected: anonymous mutation fails the expected 401 assertion before the authorization attribute exists.

- [ ] **Step 3: Add Admin authorization at the controller boundary.**

Apply `[Authorize(Roles = "Admin")]` to `CreateCategory`, `UpdateCategory`, and `DeleteCategory`, leaving both read actions unchanged. Add `using Microsoft.AspNetCore.Authorization;` and use the short attribute name.

- [ ] **Step 4: Make Category service deletion explicit and safe.**

Replace the bool result with this interface and service behavior:

```csharp
Task DeleteCategoryAsync(int id, CancellationToken cancellationToken = default);
```

```csharp
var category = await _context.Categories.SingleOrDefaultAsync(c => c.CategoryID == id, cancellationToken)
    ?? throw new ResourceNotFoundException();

var hasProducts = await _context.Products.AnyAsync(product => product.CategoryID == id, cancellationToken);
var hasChildren = await _context.Categories.AnyAsync(child => child.ParentID == id, cancellationToken);
if (hasProducts || hasChildren)
    throw new DomainConflictException();

_context.Categories.Remove(category);
await _context.SaveChangesAsync(cancellationToken);
```

Map the controller's successful delete to `NoContent()` and rely on middleware for expected failures.

For consistency, change `GetCategoryByIdAsync` and `UpdateCategoryAsync` from nullable outcomes to `ResourceNotFoundException` outcomes when the row is absent; remove the Category controller's manual null/`NotFound()` branches. Every expected Category 404/409 then has the same safe Problem Details shape.

- [ ] **Step 5: Add duplicate Category conflict handling in create/update.**

Trim `dto.CategoryName`, reject blank/one-character values with `DomainValidationException`, and use a case-normalized query excluding the current ID on update:

```csharp
var normalizedName = dto.CategoryName.Trim().ToUpperInvariant();
var duplicate = await _context.Categories.AnyAsync(category =>
    category.CategoryName.ToUpper() == normalizedName && category.CategoryID != id,
    cancellationToken);
if (duplicate)
    throw new DomainConflictException();
```

Persist the trimmed original-casing value. Preserve existing `ParentID`, `Description`, and `IsActive` fields; this task does not redefine Category visibility.

- [ ] **Step 6: Run focused and full backend verification.**

Run:

```powershell
dotnet test backend/tests/ECommerce.Api.Tests --configuration Release --filter "FullyQualifiedName~CategoriesControllerTests"
dotnet build backend/ECommerce.slnx --configuration Release
dotnet test backend/ECommerce.slnx --configuration Release --no-build
```

Expected: 401/403/409/404 outcomes are covered without exposing a database exception.

- [ ] **Step 7: Commit the Category deliverable.**

```powershell
git add -- backend/src/ECommerce.Api/Controllers/CategoriesController.cs backend/src/ECommerce.Api/Services/Categories backend/tests/ECommerce.Api.Tests/CategoriesControllerTests.cs
git commit -m "fix: secure category management"
```

## Task 5: Enforce Product visibility, references, and reactivation semantics

**Files:**
- Modify: `backend/src/ECommerce.Api/Controllers/ProductsController.cs`
- Modify: `backend/src/ECommerce.Api/Services/Products/IProductService.cs`
- Modify: `backend/src/ECommerce.Api/Services/Products/ProductService.cs`
- Modify: `backend/src/ECommerce.Api/DTOs/Products/ProductDto.cs`
- Test: `backend/tests/ECommerce.Api.Tests/ProductsControllerTests.cs`
- Test: `backend/tests/ECommerce.Api.Tests/ProductContractTests.cs`

**Interfaces:**
- Changes `SearchProductsAsync` to accept `bool includeInactive` and `GetProductByIdAsync` to accept `bool includeInactive`.
- Produces an additive `bool IsActive` field in `ProductDto` and preserves existing `/api/products` routes.

- [ ] **Step 1: Write failing API contract tests.**

```csharp
[Fact]
public async Task PublicInactiveDetailReturnsNotFound()
{
    var service = new ThrowingProductService(new ResourceNotFoundException());
    using var factory = CreateProductFactory(service);
    using var client = factory.CreateClient();
    using var response = await client.GetAsync("/api/products/42");
    Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
}

[Fact]
public async Task AdminDetailPassesIncludeInactiveToProductService()
{
    var service = new RecordingProductService();
    using var factory = CreateProductFactory(service);
    using var client = factory.CreateClientWithRole("Admin");
    await client.GetAsync("/api/products/42");
    Assert.True(service.LastIncludeInactive);
}
```

Define `CreateProductFactory(IProductService service)` in the test file with `configureTestServices` replacing `IProductService`. The recording double returns a fixed valid `ProductDto` and captures `includeInactive`; the throwing double throws only from the detail call. Stub unrelated interface members and do not connect to SQL.

Add the parallel collection test for `GET /api/products`: Anonymous/Customer must pass `includeInactive: false`, while Admin passes `true`. The local SQL functional gate remains responsible for proving that the query predicate actually excludes persisted inactive rows.

Also run the Anonymous/Customer authorization matrix against Product `POST`, `PUT`, and `DELETE` (`401`/`403`); use an Admin recording double to prove the request reaches each existing Admin-only mutation without needing SQL.

- [ ] **Step 2: Run focused tests to verify the current interface cannot distinguish Admin and public reads.**

Run:

```powershell
dotnet test backend/tests/ECommerce.Api.Tests --configuration Release --filter "FullyQualifiedName~ProductsControllerTests|FullyQualifiedName~ProductContractTests"
```

Expected: compile or behavior failure because `includeInactive` and `ProductDto.IsActive` do not yet exist.

- [ ] **Step 3: Change the DTO and service signatures together.**

Use this record shape so the new field is explicit and additive:

```csharp
public record ProductDto(
    int ProductID,
    int CategoryID,
    string CategoryName,
    string ProductName,
    string SKU,
    string? Description,
    decimal Price,
    int BrandID,
    string? BrandName,
    string? ImageUrl,
    int StockQuantity,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
```

Change both reads to receive `bool includeInactive` immediately before the optional cancellation token, update every projection, and preserve current parameter names and return types otherwise:

```csharp
Task<PagedResult<ProductDto>> SearchProductsAsync(ProductSearchRequestDto request, bool includeInactive, CancellationToken cancellationToken = default);
Task<ProductDto> GetProductByIdAsync(int id, bool includeInactive, CancellationToken cancellationToken = default);
```

After persistence, `CreateProductAsync` and `UpdateProductAsync` must return `GetProductByIdAsync(product.ProductID, includeInactive: true, cancellationToken: cancellationToken)` so an Admin can receive a newly inactive/updated row and all service/test-double callers compile.

- [ ] **Step 4: Apply visibility at the service query boundary.**

At the top of product search:

```csharp
IQueryable<Product> query = _context.Products
    .AsNoTracking()
    .Include(product => product.Category)
    .Include(product => product.Brand)
    .Include(product => product.Images);

if (!includeInactive)
    query = query.Where(product => product.IsActive);
```

Apply the same predicate before public detail lookup. In `ProductsController`, calculate `var includeInactive = User.IsInRole("Admin");` and pass it into both read service calls. Do not add a query-string privilege flag.

Replace the Product service's current `KeyNotFoundException` outcomes for read/update/delete with `ResourceNotFoundException`, and remove the three controller `try/catch (KeyNotFoundException)` blocks. That ensures all Product 404s use the centralized safe Problem Details contract.

- [ ] **Step 5: Validate Product references and SKU conflicts before save.**

For create/update, verify the requested Category and Brand exist before mutation. Use `ResourceNotFoundException` for missing references and `DomainConflictException` for an existing SKU (exclude the product being updated). Keep DTO `[Range]` validation for price/stock and map expected failures through middleware. `DeleteProductAsync` continues setting `IsActive = false`; update may set `IsActive = true` for an Admin reactivation.

- [ ] **Step 6: Run focused and full backend verification.**

Run:

```powershell
dotnet test backend/tests/ECommerce.Api.Tests --configuration Release --filter "FullyQualifiedName~ProductsControllerTests|FullyQualifiedName~ProductContractTests"
dotnet build backend/ECommerce.slnx --configuration Release
dotnet test backend/ECommerce.slnx --configuration Release --no-build
```

Expected: controller contract tests prove public/Admin separation; all projection callers compile with the new `IsActive` field.

- [ ] **Step 7: Commit the Product deliverable.**

```powershell
git add -- backend/src/ECommerce.Api/Controllers/ProductsController.cs backend/src/ECommerce.Api/Services/Products backend/src/ECommerce.Api/DTOs/Products/ProductDto.cs backend/tests/ECommerce.Api.Tests/ProductsControllerTests.cs backend/tests/ECommerce.Api.Tests/ProductContractTests.cs
git commit -m "fix: enforce product visibility rules"
```

## Task 6: Consolidate frontend configuration, typed session storage, and Admin routing

**Files:**
- Create: `frontend/src/services/authSession.ts`
- Create: `frontend/src/contexts/AuthContext.tsx`
- Create: `frontend/src/routes/RequireAdmin.tsx`
- Create: `frontend/src/services/apiClient.test.ts`
- Create: `frontend/src/contexts/AuthContext.test.tsx`
- Create: `frontend/src/routes/RequireAdmin.test.tsx`
- Modify: `frontend/.env.example`
- Modify: `frontend/src/config/env.ts`
- Modify: `frontend/src/config/env.test.ts`
- Modify: `frontend/src/services/apiClient.ts`
- Modify: `frontend/src/services/authService.ts`
- Modify: `frontend/src/routes/AppRouter.tsx`
- Modify: `frontend/src/components/Header.tsx`
- Modify: `frontend/src/pages/LoginPage.tsx`
- Modify: `frontend/src/pages/RegisterPage.tsx`

**Interfaces:**
- Produces `apiBaseUrl = 'http://localhost:5296/api'` when no environment value is supplied.
- Produces `ApiError extends Error` with `status` and optional `validationErrors`.
- Produces `useAuth(): { user, isAuthenticated, login, register, logout }` and `RequireAdmin` route guard.

- [ ] **Step 1: Write failing API configuration/error tests.**

```tsx
it('normalizes one configured API base URL', async () => {
  const { apiBaseUrl } = await import('../config/env')
  expect(apiBaseUrl).toBe('http://localhost:5296/api')
})

it('clears the auth session after a 401 Problem Details response', async () => {
  localStorage.setItem('token', 'old-token')
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ title: 'Invalid email or password.' }), { status: 401, headers: { 'Content-Type': 'application/problem+json' } })))

  await expect(apiClient('/auth/login')).rejects.toMatchObject({ status: 401 })
  expect(localStorage.getItem('token')).toBeNull()
})
```

- [ ] **Step 2: Run the focused tests to verify the current duplicate URL/default and session handling fail.**

Run:

```powershell
npm --prefix frontend test -- src/config/env.test.ts src/services/apiClient.test.ts
```

Expected: environment test still asserts `http://localhost:5000`, and `apiClient` has no typed 401/session behavior.

- [ ] **Step 3: Implement a single configuration authority and session module.**

Set `.env.example` to:

```dotenv
VITE_API_BASE_URL=http://localhost:5296/api
```

Implement `authSession.ts` with these exact exported functions:

```ts
import type { UserInfo } from './authService'

export type StoredSession = { token: string; user: UserInfo }

const tokenStorageKey = 'token'
const userStorageKey = 'user'
const sessionChangedEvent = 'ecommerce:auth-session-changed'

const isUserInfo = (value: unknown): value is UserInfo => {
  if (typeof value !== 'object' || value === null) return false

  const user = value as Record<string, unknown>
  return typeof user.id === 'number'
    && typeof user.email === 'string'
    && typeof user.fullName === 'string'
    && (user.role === 'Admin' || user.role === 'Customer')
}

const notifySessionChange = (): void => {
  window.dispatchEvent(new Event(sessionChangedEvent))
}

export const saveSession = (session: StoredSession): void => {
  localStorage.setItem(tokenStorageKey, session.token)
  localStorage.setItem(userStorageKey, JSON.stringify(session.user))
  notifySessionChange()
}

export const clearSession = (): void => {
  localStorage.removeItem(tokenStorageKey)
  localStorage.removeItem(userStorageKey)
  notifySessionChange()
}

export const readSession = (): StoredSession | null => {
  const token = localStorage.getItem(tokenStorageKey)
  const rawUser = localStorage.getItem(userStorageKey)
  if (!token || !rawUser) {
    if (token || rawUser) clearSession()
    return null
  }

  try {
    const user: unknown = JSON.parse(rawUser)
    if (!isUserInfo(user)) {
      clearSession()
      return null
    }

    return { token, user }
  } catch {
    clearSession()
    return null
  }
}

export const subscribeToSessionChanges = (listener: () => void): (() => void) => {
  window.addEventListener(sessionChangedEvent, listener)
  return () => window.removeEventListener(sessionChangedEvent, listener)
}
```

Use the fixed event name `ecommerce:auth-session-changed`. `apiClient` imports `apiBaseUrl`, `readSession`, and `clearSession`; it gets the Bearer token only from `readSession()?.token`, parses both Problem Details `title` and legacy `message`, and calls `clearSession()` only on HTTP 401.

```ts
export class ApiError extends Error {
  constructor(public readonly status: number, message: string, public readonly validationErrors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
  }
}
```

- [ ] **Step 4: Implement typed auth and route guard.**

Define request and role types in `authService.ts`:

```ts
export type UserRole = 'Admin' | 'Customer'
export interface LoginRequest { email: string; password: string }
export interface RegisterRequest { fullName: string; email: string; phone?: string; password: string }
export interface UserInfo { id: number; email: string; fullName: string; role: UserRole }
export interface AuthResponse { token: string; user: UserInfo }
```

Make `authService.login/register` API-only. `AuthContext` calls them, then `saveSession`, and exposes `logout` as `clearSession`. Wrap `<Routes>` in `<AuthProvider>` inside the existing `BrowserRouter`.

Use the exact guard behavior:

```tsx
export default function RequireAdmin() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (user.role !== 'Admin') return <Navigate to="/" replace />
  return <Outlet />
}
```

Nest the existing `/admin` parent layout under `<Route element={<RequireAdmin />}>` without changing child paths.

- [ ] **Step 5: Make Header and auth pages use the context.**

Header displays the existing Cart button unchanged. When `user` is null it retains the Login link; when user exists it renders a logout button that calls `logout()` and `navigate('/login', { replace: true })`. Login/Register catches `unknown`, uses `ApiError` message fallback, calls context `login/register`, and retains current role-based post-login routing. Do not modify Cart storage on logout.

- [ ] **Step 6: Add and run focused context/guard tests.**

```tsx
it('redirects an anonymous visitor from an Admin route to login', () => {
  render(<MemoryRouter initialEntries={['/admin/products']}><AuthProvider><Routes><Route element={<RequireAdmin />}><Route path="/admin/products" element={<p>Admin products</p>} /></Route><Route path="/login" element={<p>Login</p>} /></Routes></AuthProvider></MemoryRouter>)
  expect(screen.getByText('Login')).toBeInTheDocument()
})

it('redirects a Customer from an Admin route home', () => {
  saveSession({ token: 'token', user: { id: 1, email: 'customer@example.test', fullName: 'Customer', role: 'Customer' } })
  // render the same router and assert the home element
})
```

Run:

```powershell
npm --prefix frontend test -- src/config/env.test.ts src/services/apiClient.test.ts src/contexts/AuthContext.test.tsx src/routes/RequireAdmin.test.tsx
```

Expected: base URL, 401 clearing, session restore, role guard, and logout behavior pass.

- [ ] **Step 7: Commit the frontend infrastructure deliverable.**

```powershell
git add -- frontend/.env.example frontend/src/config/env.ts frontend/src/config/env.test.ts frontend/src/services/apiClient.ts frontend/src/services/apiClient.test.ts frontend/src/services/authService.ts frontend/src/services/authSession.ts frontend/src/contexts/AuthContext.tsx frontend/src/contexts/AuthContext.test.tsx frontend/src/routes/RequireAdmin.tsx frontend/src/routes/RequireAdmin.test.tsx frontend/src/routes/AppRouter.tsx frontend/src/components/Header.tsx frontend/src/pages/LoginPage.tsx frontend/src/pages/RegisterPage.tsx
git commit -m "fix: protect frontend admin routes"
```

## Task 7: Repair frontend page resilience and align Product administration with the contract

**Files:**
- Create: `frontend/src/pages/ProductListPage.test.tsx`
- Create: `frontend/src/pages/ProductDetailPage.test.tsx`
- Create: `frontend/src/pages/admin/CategoryManagementPage.test.tsx`
- Create: `frontend/src/pages/admin/ProductManagementPage.test.tsx`
- Modify: `frontend/src/App.test.tsx`
- Modify: `frontend/src/services/productService.ts`
- Modify: `frontend/src/pages/ProductListPage.tsx`
- Modify: `frontend/src/pages/ProductDetailPage.tsx`
- Modify: `frontend/src/pages/admin/CategoryManagementPage.tsx`
- Modify: `frontend/src/pages/admin/ProductManagementPage.tsx`

**Interfaces:**
- Updates frontend `Product` with `isActive: boolean`.
- Produces visible `role="alert"` request errors with retry actions for catalog/detail/admin workflows.
- Leaves Cart buttons, CartContext, and their storage behavior unchanged.

- [ ] **Step 1: Replace the obsolete baseline App test with a user-visible route assertion.**

```tsx
it('renders the ElectroTech public home route', () => {
  render(<App />)
  expect(screen.getByRole('link', { name: 'ElectroTech' })).toBeInTheDocument()
})
```

Run:

```powershell
npm --prefix frontend test -- src/App.test.tsx
```

Expected: it fails before replacing the stale `ECommerce`/`Technical baseline ready` assertions.

- [ ] **Step 2: Add failing page failure/retry tests using mocked services.**

```tsx
it('shows a retryable catalog error instead of an empty state', async () => {
  vi.mocked(productService.searchProducts).mockRejectedValueOnce(new ApiError(500, 'Unable to load products'))
  render(<MemoryRouter><ProductListPage /></MemoryRouter>)
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load products')
  expect(screen.getByRole('button', { name: /thử lại/i })).toBeInTheDocument()
})

it('shows a Category conflict after failed admin delete', async () => {
  vi.mocked(categoryService.delete).mockRejectedValueOnce(new ApiError(409, 'The request conflicts with existing state.'))
  // render with one Category, confirm deletion, then assert the row remains and role=alert is visible
})
```

- [ ] **Step 3: Add `isActive` to frontend Product requests and fix query serialization.**

```ts
export interface Product {
  // retain existing fields
  isActive: boolean
}

if (params.minPrice !== undefined) searchParams.append('MinPrice', params.minPrice.toString())
if (params.maxPrice !== undefined) searchParams.append('MaxPrice', params.maxPrice.toString())
```

The two `undefined` tests preserve an intentional filter value of `0`. Keep the existing Brand name query and static five-brand UI, but change the UI value/label from `Asus` to `ASUS` so it matches the approved seed data and the current exact backend brand filter. This task does not add a Brand endpoint.

- [ ] **Step 4: Implement accessible error and retry UI.**

In Product List/Detail, add `const [loadError, setLoadError] = useState<string | null>(null)`; reset it before fetch; catch `unknown` through the typed error helper; display a `role="alert"` panel with a retry button that invokes the same fetch function. Preserve the distinction between request failure and a `404` product not found.

In Category/Product admin pages, replace `alert`/console-only failures with stateful `role="alert"` text. Preserve the row/modal after a failed save/delete. Set category textarea `value={formData.description ?? ''}`. Replace direct raw-storage logout with `useAuth().logout()` plus navigation. In the Product edit modal set `isActive: product.isActive`, render an active/inactive status, and leave Cart controls untouched.

- [ ] **Step 5: Run focused frontend tests and the production build.**

Run:

```powershell
npm --prefix frontend test -- src/App.test.tsx src/pages/ProductListPage.test.tsx src/pages/ProductDetailPage.test.tsx src/pages/admin/CategoryManagementPage.test.tsx src/pages/admin/ProductManagementPage.test.tsx
npm --prefix frontend run build
```

Expected: all focused page tests pass and `tsc -b && vite build` exits 0 with the Category textarea type error removed.

- [ ] **Step 6: Commit the page resiliency deliverable.**

```powershell
git add -- frontend/src/App.test.tsx frontend/src/services/productService.ts frontend/src/pages/ProductListPage.tsx frontend/src/pages/ProductListPage.test.tsx frontend/src/pages/ProductDetailPage.tsx frontend/src/pages/ProductDetailPage.test.tsx frontend/src/pages/admin/CategoryManagementPage.tsx frontend/src/pages/admin/CategoryManagementPage.test.tsx frontend/src/pages/admin/ProductManagementPage.tsx frontend/src/pages/admin/ProductManagementPage.test.tsx
git commit -m "fix: improve catalog and admin error states"
```

## Task 8: Document local setup, execute the SQL functional gate, and complete verification

**Files:**
- Create: `docs/acceptance-evidence/sprint1-remediation-functional-checklist.md`
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-08-29-sprint1-remediation-design.md` only if implementation reveals an approved design correction
- Verify: all changed backend/frontend files and the generated migration

**Interfaces:**
- Consumes: User Secrets values, generated `SeedRolesAndBrands` migration, Admin bootstrap rules, and the public API/UX contract from the spec.
- Produces: repeatable local setup/functional evidence without storing a secret or shared database value.

- [ ] **Step 1: Write the functional checklist before running it.**

Create a Markdown table with these exact scenarios and expected outcomes:

| Scenario | Setup/action | Expected result |
| --- | --- | --- |
| Seed data | Apply `SeedRolesAndBrands` migration to a local test database | Roles Customer/Admin and Brands Apple/ASUS/Lenovo/Dell/Sony exist once each |
| Development Admin | Set all three `BootstrapAdmin` User Secrets and run API twice | One BCrypt-hashed Admin exists; no duplicate is created |
| Customer registration | Register `someone-admin@example.test` | Account role is Customer, never Admin |
| Category authorization | Anonymous and Customer mutate Category | 401 and 403 respectively |
| Category dependencies | Delete Category with Product or child | 409; no dependent record is changed |
| Product lifecycle | Soft delete, public fetch, Admin fetch, Admin update `isActive=true` | public 404, Admin sees inactive, reactivated Product returns publicly |
| Customer catalog | Search/filter active products and open detail | inactive Products never appear; zero results is a valid empty state |
| Frontend auth | Customer/Admin login then logout | route guard works; logout clears auth only and leaves Cart storage unchanged |

- [ ] **Step 2: Update README with secret-safe setup and run instructions.**

Document these commands using developer-provided local values, never values copied into the repository:

```powershell
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet user-secrets init --project backend/src/ECommerce.Api
dotnet user-secrets set "ConnectionStrings:ECommerce" "<local SQL Server connection string>" --project backend/src/ECommerce.Api
dotnet user-secrets set "Jwt:Key" "<unique development key of at least 32 bytes>" --project backend/src/ECommerce.Api
dotnet user-secrets set "BootstrapAdmin:Email" "admin@example.test" --project backend/src/ECommerce.Api
dotnet user-secrets set "BootstrapAdmin:Password" "<local development password>" --project backend/src/ECommerce.Api
dotnet user-secrets set "BootstrapAdmin:FullName" "Development Admin" --project backend/src/ECommerce.Api
dotnet ef database update --project backend/src/ECommerce.Api --startup-project backend/src/ECommerce.Api
```

State that BootstrapAdmin keys may be removed after the first local Admin exists. Set frontend `.env.local` to `VITE_API_BASE_URL=http://localhost:5296/api`; do not track `.env.local`.

- [ ] **Step 3: Execute the local SQL functional gate on a non-shared test database.**

Run the documented migration command, start the API, run the Vite app, and record pass/fail plus date/database alias in `docs/acceptance-evidence/sprint1-remediation-functional-checklist.md`. Stop the API/Vite process after recording evidence. Do not apply migrations to a shared or production database.

- [ ] **Step 4: Run the complete automated verification suite.**

Run:

```powershell
dotnet restore backend/ECommerce.slnx
dotnet build backend/ECommerce.slnx --configuration Release --no-restore
dotnet test backend/ECommerce.slnx --configuration Release --no-build --no-restore
npm --prefix frontend ci
npm --prefix frontend test
npm --prefix frontend run build
powershell.exe -NoProfile -File .agents/tests/validate-skills.ps1
git diff --check
git status --short
```

Expected: all commands exit 0; no tracked secret scan finds a credential value; status contains only intended remediation files before staging.

- [ ] **Step 5: Run a redacted tracked-secret scan.**

Use a boolean-only PowerShell check so a matched value is never printed:

```powershell
$settingsFiles = @(
  'backend/src/ECommerce.Api/appsettings.json',
  'backend/src/ECommerce.Api/appsettings.Development.json'
)

$hasTrackedSecret = $false
foreach ($settingsFile in $settingsFiles) {
  $settings = Get-Content -LiteralPath $settingsFile -Raw | ConvertFrom-Json
  if (
    -not [string]::IsNullOrWhiteSpace([string]$settings.Jwt.Key) -or
    -not [string]::IsNullOrWhiteSpace([string]$settings.ConnectionStrings.ECommerce) -or
    -not [string]::IsNullOrWhiteSpace([string]$settings.BootstrapAdmin.Password)
  ) {
    $hasTrackedSecret = $true
    break
  }
}
if ($hasTrackedSecret) { throw 'Tracked sensitive API configuration detected.' }
```

Expected: no output and exit 0. If the check fails, remove/rotate the tracked secret and rerun the affected verification; never paste the matched value into a commit, issue, or test output.

- [ ] **Step 6: Commit documentation and evidence.**

```powershell
git add -- README.md docs/acceptance-evidence/sprint1-remediation-functional-checklist.md
git commit -m "docs: record Sprint 1 remediation verification"
```

- [ ] **Step 7: Prepare the pull request handoff.**

Use branch `feature/sprint1-remediation` with target `develop`. The PR description must name US-2, US-3, US-7, US-8, US-17, US-18, US-19, and US-20; list status/API changes, the Role/Brand data migration, all test commands/results, functional checklist evidence, and the fact that Cart behavior was intentionally not implemented. Request at least one review and wait for CI before merging.
