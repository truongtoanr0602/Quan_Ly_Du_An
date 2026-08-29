# ECommerce MVP

Technical baseline for a six-week e-commerce MVP developed by a five-person Scrum Team. The current Sprint is **Sprint 1 — Product Catalog & Authentication**.

This repository currently provides shared project rules, a runnable .NET 10 API baseline, a runnable React/Vite baseline, tests, engineering documentation, and GitHub CI. It intentionally does not implement Sprint 1 business User Stories yet.

## Team

- Toản — Product Owner.
- Quang — Scrum Master.
- Bá Nam — Developer, Integration and Full-stack.
- Tùng — Developer, Backend and Database.
- Năng — Developer, Frontend and UI.

## Architecture

```text
React + TypeScript + Vite
            |
       HTTP / JSON
            |
ASP.NET Core Web API
            |
 Controller -> Service -> EF Core / AppDbContext -> SQL Server
```

See [architecture](docs/architecture.md), [database ERD](docs/database-erd.md), [coding conventions](docs/coding-conventions.md), and [Git workflow](docs/git-workflow.md).

Coding agents must start with [AGENTS.md](AGENTS.md) and load applicable repository skills from [.agents](.agents/README.md).

## Prerequisites

- Git.
- .NET 10 SDK, verified with `dotnet --version`.
- Node.js 24 LTS and npm, verified with `node --version` and `npm --version`.
- Microsoft SQL Server for Sprint database tasks.
- Optional: SQL Server Management Studio or Azure Data Studio.

## Clone and Branch

```powershell
git clone <repository-url>
Set-Location QLDA
git switch develop
```

If the remote repository has not been published yet, use the existing local checkout and follow `docs/git-workflow.md`.

## Backend Setup

Restore, build, and test:

```powershell
dotnet restore backend/ECommerce.slnx
dotnet build backend/ECommerce.slnx --configuration Release --no-restore
dotnet test backend/ECommerce.slnx --configuration Release --no-build --no-restore
```

Configure the Development environment and initialize local secrets once per checkout. Replace only the angle-bracket placeholders with developer-provided local values; never commit those values:

```powershell
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet user-secrets init --project backend/src/ECommerce.Api
dotnet user-secrets set "ConnectionStrings:ECommerce" "<local SQL Server connection string>" --project backend/src/ECommerce.Api
dotnet user-secrets set "Jwt:Key" "<unique development key of at least 32 bytes>" --project backend/src/ECommerce.Api
dotnet user-secrets set "BootstrapAdmin:Email" "admin@example.test" --project backend/src/ECommerce.Api
dotnet user-secrets set "BootstrapAdmin:Password" "<local development password>" --project backend/src/ECommerce.Api
dotnet user-secrets set "BootstrapAdmin:FullName" "Development Admin" --project backend/src/ECommerce.Api
```

The `BootstrapAdmin` keys may be removed after the first local Admin exists. Never commit real connection strings, JWT keys, passwords, tokens, or User Secrets values.

Run the API:

```powershell
dotnet run --project backend/src/ECommerce.Api --launch-profile http
```

Verify:

- Health: `http://localhost:5296/api/health`
- OpenAPI document in Development: `http://localhost:5296/openapi/v1.json`

Apply the reviewed Sprint 1 migration to a new, non-shared local test database from the repository root. Confirm that the connection string points only to that local database before running the update:

```powershell
dotnet ef database update --project backend/src/ECommerce.Api --startup-project backend/src/ECommerce.Api
```

Do not apply migrations to a shared or production database. The generated migration is named `SeedRolesAndBrands` and must not be replaced by an unreviewed migration.

## Frontend Setup

Install, test, and build:

```powershell
npm --prefix frontend ci
npm --prefix frontend test
npm --prefix frontend run build
```

Copy the example environment file for local development, then ensure the untracked `.env.local` contains the supplied backend HTTP API URL:

```powershell
Copy-Item frontend/.env.example frontend/.env.local
```

Set `frontend/.env.local` to:

```dotenv
VITE_API_BASE_URL=http://localhost:5296/api
```

Run the frontend:

```powershell
npm --prefix frontend run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

## Validate Project Skills

```powershell
powershell.exe -NoProfile -File .agents/tests/validate-skills.ps1
```

Expected output: `Validated 7 project skills.`

## Pull Requests and CI

Use branches named `feature/SCRUM-XX-description` from `develop`. Before a Pull Request, synchronize with `develop`, run the affected local checks, complete the PR template, and provide test evidence.

GitHub Actions runs independent `backend` and `frontend` checks for Pull Requests into `main` or `develop` and pushes to `develop`. Repository owners must separately enable the branch protection documented in `docs/git-workflow.md`.

## Common Problems

- **Wrong SDK:** install .NET 10 and confirm `dotnet --list-sdks` includes a stable `10.0.x` entry.
- **Wrong Node version:** use Node.js 24; `frontend/package.json` rejects other major versions through its `engines` declaration.
- **NuGet/npm network failure:** verify proxy, TLS, registry access, and retry restore/install without changing lock files or disabling certificate checks.
- **CORS error:** ensure frontend origin is listed under `Cors:AllowedOrigins` for the active backend environment.
- **SQL connection failure:** confirm SQL Server is running and the local User Secrets connection string matches its authentication mode.

## License

No open-source license has been selected. Reuse or redistribution requires permission from the project owners.

