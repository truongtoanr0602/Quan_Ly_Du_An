# Sprint 1 Remediation Functional Checklist

This checklist is the local SQL/UX acceptance gate for the Sprint 1 remediation (US-2, US-3, US-7, US-8, US-17, US-18, US-19, and US-20). It must be run against a non-shared local SQL Server database after the reviewed `SeedRolesAndBrands` migration is applied.

## Execution status

- Evidence review date: 2026-08-30.
- Live SQL/UX functional gate: **NOT RUN / externally pending**.
- Database alias: **Not supplied in this execution context**.
- User Secrets: **Not supplied in this execution context**.
- No migration was applied, and no API or Vite process was started here.

The status is intentionally not marked as passed. The functional gate requires a developer-provided, non-shared local SQL Server connection and local User Secrets. Do not substitute a shared, production, or unknown database.

## Scenarios

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

## Evidence status

| Scenario | Evidence status |
| --- | --- |
| Seed data | NOT RUN / externally pending |
| Development Admin | NOT RUN / externally pending |
| Customer registration | NOT RUN / externally pending |
| Category authorization | NOT RUN / externally pending |
| Category dependencies | NOT RUN / externally pending |
| Product lifecycle | NOT RUN / externally pending |
| Customer catalog | NOT RUN / externally pending |
| Frontend auth | NOT RUN / externally pending |

## Safe prerequisites and reproduction

A developer must first provide or create all of the following locally:

1. .NET 10 SDK, Node.js 24 LTS, and a running local SQL Server instance.
2. A new, non-shared test database and its connection string. Do not record the connection string or database credentials in this file.
3. Local User Secrets for the API. Use the secret-safe commands in the [README](../../README.md), including all three `BootstrapAdmin` values. Do not print or commit secret values.
4. A clean checkout of `feature/sprint1-remediation` with dependencies restored.

From the repository root, use the documented Development configuration and apply the migration only to that supplied local test database:

```powershell
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet ef database update --project backend/src/ECommerce.Api --startup-project backend/src/ECommerce.Api
```

Then run the API and Vite app in separate terminals:

```powershell
dotnet run --project backend/src/ECommerce.Api --launch-profile http
npm --prefix frontend run dev
```

Exercise each scenario through the API/Swagger UI and the browser. Record the run date, the developer-supplied non-shared database alias (not its credentials), migration result, API/UX result, and any safe supporting evidence in this file. Stop both local processes after recording evidence. If any prerequisite is unavailable, leave the affected status as **NOT RUN / externally pending**.

## Automated verification evidence

The commands below are safe repository checks and are separate from the pending live SQL/UX gate. Record their exact exit status in the Task 8 handoff after running them; they do not authorize applying a migration or starting an application without the prerequisites above.

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

The tracked-secret check is boolean-only and must never print a matched value:

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
