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

Initialize local secrets once per checkout:

```powershell
dotnet user-secrets init --project backend/src/ECommerce.Api
dotnet user-secrets set "ConnectionStrings:ECommerce" "Server=localhost;Database=ECommerce;Trusted_Connection=True;TrustServerCertificate=True" --project backend/src/ECommerce.Api
dotnet user-secrets set "Jwt:Key" "replace-with-a-local-key-of-at-least-32-characters" --project backend/src/ECommerce.Api
```

The shown values are local examples. Use a suitable SQL Server connection and a unique development-only signing key. Never commit real connection strings, JWT keys, or tokens.

Run the API:

```powershell
dotnet run --project backend/src/ECommerce.Api --launch-profile http
```

Verify:

- Health: `http://localhost:5296/api/health`
- OpenAPI document in Development: `http://localhost:5296/openapi/v1.json`

The baseline does not query SQL Server yet. `User`, `Category`, and `Product` entities and the first migration belong to their approved Sprint 1 tasks.

When a Sprint task introduces EF Core tooling and models, create and apply a reviewed migration from the repository root:

```powershell
dotnet ef migrations add <MigrationName> --project backend/src/ECommerce.Api
dotnet ef database update --project backend/src/ECommerce.Api
```

Replace `<MigrationName>` with a descriptive task-specific name such as `AddProductCatalog`; do not run these commands for the empty baseline.

## Frontend Setup

Install, test, and build:

```powershell
npm --prefix frontend ci
npm --prefix frontend test
npm --prefix frontend run build
```

Copy the example environment file for local development:

```powershell
Copy-Item frontend/.env.example frontend/.env.local
```

`frontend/.env.example` points to `http://localhost:5000`. For the provided backend HTTP launch profile, set:

```dotenv
VITE_API_BASE_URL=http://localhost:5296
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

