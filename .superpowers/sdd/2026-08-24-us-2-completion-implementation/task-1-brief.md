# Task 1: Restore the Canonical US-2 Contract and Repair the Test Host

## Files

- Modify: `docs/acceptance-criteria/US-2-category-management.md`
- Modify: `backend/tests/ECommerce.Api.Tests/ApiWebApplicationFactory.cs`
- Modify: `backend/tests/ECommerce.Api.Tests/HealthEndpointTests.cs`
- Test: `backend/tests/ECommerce.Api.Tests/HealthEndpointTests.cs`

## Interfaces

- Consumes: approved AC content from Git object `13541ef:docs/acceptance-criteria/US-2-category-management.md`.
- Produces: a test host that supplies `Jwt:Key`, `Jwt:Issuer`, and `Jwt:Audience` before `Program.cs` reads configuration.

## Steps

1. Restore the approved AC document without merging the old feature branch. Use the exact blob from `git show 13541ef:docs/acceptance-criteria/US-2-category-management.md`. Verify AC-01 through AC-11, TC-01 through TC-16, and the Product Owner conclusion.
2. Keep `GetHealthReturnsHealthyStatus` as the observable regression. Ensure the test clears process-level JWT variables before constructing `ApiWebApplicationFactory`, then calls `/api/health` and expects `200 OK` plus the healthy payload. The production change that must make this test fail is removing the test host's pre-start JWT settings.
3. Run `dotnet test backend/ECommerce.slnx --configuration Release --filter "FullyQualifiedName~HealthEndpointTests.GetHealthReturnsHealthyStatus"` and verify RED at `Program.cs` with `Configuration 'Jwt:Key' is not configured`.
4. In `ApiWebApplicationFactory`, set settings before `WebApplication.CreateBuilder` consumes them using `builder.UseSetting("Jwt:Key", TestJwt.SigningKey)`, `builder.UseSetting("Jwt:Issuer", TestJwt.Issuer)`, and `builder.UseSetting("Jwt:Audience", TestJwt.Audience)`. Remove the ineffective late `ConfigureAppConfiguration` JWT block. Keep `UseEnvironment("Testing")`, in-memory EF configuration, and test-only values.
5. Run `dotnet test backend/ECommerce.slnx --configuration Release`; all current Backend tests must pass without User Secrets or JWT environment variables.
6. Commit exactly the task files with subject `fix: restore US-2 contract and test configuration`.

## Binding global constraints

- Canonical US-2 requirements come from Product Owner-approved commit `13541ef`.
- Keep route `/api/categories` exactly as specified.
- Never commit credentials, JWT keys, passwords, connection strings, or real tokens; test-only values are allowed in the test host.
- Controllers handle HTTP only; Services own business rules; database changes use EF Core migrations.
- Every behavior change follows red-green-refactor.
- Work only on `feature/US-2-completion`; do not push or merge without review and successful CI.
