# Technical Baseline Design

## 1. Purpose

This design defines the shared technical baseline for the six-week e-commerce MVP. It prepares the repository, project instructions, application scaffolds, documentation, Git workflow, and continuous integration required before the Development Team starts implementing Sprint 1 user stories.

The baseline follows the project principle **consistency over complexity**. It must remain understandable, runnable, and reviewable by all five Scrum Team members.

## 2. Project Context

The Scrum Team consists of:

- Toản — Product Owner.
- Quang — Scrum Master.
- Bá Nam — Developer responsible primarily for Integration and Full-stack work.
- Tùng — Developer responsible primarily for Backend and Database work.
- Năng — Developer responsible primarily for Frontend and UI work.

The Product Goal is to deliver an e-commerce MVP covering product discovery, cart, checkout, ordering, and the administration of products, categories, inventory, and orders within three two-week Sprints.

The current Sprint is **Sprint 1 — Product Catalog & Authentication**. Its goal is to establish the website foundation so customers can register, sign in, and discover products while administrators can manage categories and products.

Sprint 1 contains User Stories 2, 3, 7, 8, 17, 18, 19, and 20. This baseline does not implement those stories; it only prepares the shared technical foundation.

## 3. Approved Technology Baseline

- Backend: .NET 10 LTS, C#, ASP.NET Core Web API, Entity Framework Core, JWT, and Swagger/OpenAPI.
- Frontend: React, TypeScript, Vite, and Node.js 24 LTS.
- Database: Microsoft SQL Server.
- Integration: HTTP/JSON REST API.
- Source control and automation: Git, GitHub, and GitHub Actions.

No Clean Architecture, microservices, Docker, external UI framework, or other major dependency is introduced by this baseline.

## 4. System Architecture

The system uses a simple client-server architecture:

```text
React + TypeScript + Vite
            |
       HTTP / JSON
            |
ASP.NET Core Web API
            |
        Controller
            |
          Service
            |
  EF Core / AppDbContext
            |
        SQL Server
```

The frontend never accesses SQL Server directly. Controllers handle HTTP concerns and delegate business operations to services. Business rules, Entity-to-DTO mapping, and orchestration belong in the Service Layer. EF Core and `AppDbContext` provide database access.

The API uses DTOs where returning an Entity would expose private fields or couple the client to the persistence model. Authentication uses JWT with the roles `Admin` and `Customer`.

## 5. Repository Structure

```text
QLDA/
|-- AGENTS.md
|-- .agents/
|   |-- README.md
|   `-- skills/
|       |-- project-context/SKILL.md
|       |-- architecture/SKILL.md
|       |-- backend/SKILL.md
|       |-- frontend/SKILL.md
|       |-- database/SKILL.md
|       |-- git-workflow/SKILL.md
|       `-- scrum/SKILL.md
|-- .github/
|   |-- workflows/ci.yml
|   `-- pull_request_template.md
|-- backend/
|   |-- ECommerce.sln
|   |-- src/ECommerce.Api/
|   `-- tests/ECommerce.Api.Tests/
|-- frontend/
|   |-- src/
|   `-- package.json
|-- docs/
|   |-- architecture.md
|   |-- Sprint_backlog.md
|   |-- Sprint1.md
|   |-- database-erd.md
|   |-- coding-conventions.md
|   `-- git-workflow.md
|-- .editorconfig
|-- .gitignore
|-- README.md
`-- LICENSE
```

`LICENSE` is created only after the team chooses a license. Until then, the README states that the project is not offered under an open-source license.

## 6. Shared Agent Instructions

`AGENTS.md` is the mandatory repository entry point for coding agents. It directs agents to:

1. Read all relevant files under `docs` before changing code.
2. Read the applicable repository skill under `.agents/skills`.
3. Identify the Jira User Story or task, when a Jira key exists.
4. Determine affected modules and validate the current architecture.
5. Report conflicting or ambiguous requirements instead of inventing a decision.
6. Avoid expanding the active Sprint scope.
7. Verify Acceptance Criteria and the Definition of Done before reporting completion.

Each `SKILL.md` owns one domain: project context, architecture, backend, frontend, database, Git workflow, or Scrum. Skills reference the canonical documents instead of copying large sections from them. The skills are committed with the repository so every developer machine receives the same rules.

## 7. Backend Scaffold

The solution contains one production project and one test project:

```text
backend/
|-- ECommerce.sln
|-- src/
|   `-- ECommerce.Api/
|       |-- Controllers/
|       |-- Services/
|       |   `-- Interfaces/
|       |-- Data/
|       |   |-- Configurations/
|       |   `-- Migrations/
|       |-- Entities/
|       |-- DTOs/
|       |-- Middleware/
|       |-- Helpers/
|       |-- Program.cs
|       |-- appsettings.json
|       `-- appsettings.Development.json
`-- tests/
    `-- ECommerce.Api.Tests/
```

The scaffold provides a runnable Web API, Swagger in Development, central exception handling, configuration binding, CORS configuration, and a minimal health endpoint. It does not provide category, product, authentication, cart, or order endpoints.

Connection strings and JWT secrets are loaded through environment variables or .NET User Secrets. Tracked settings contain only non-sensitive defaults or safe placeholders. Development stack traces may be logged locally but are not returned in public error responses.

## 8. Frontend Scaffold

```text
frontend/src/
|-- components/
|-- pages/
|-- layouts/
|-- services/
|-- hooks/
|-- types/
|-- routes/
|-- utils/
`-- assets/
```

The React application provides a runnable shell, TypeScript configuration, environment typing, a configurable API base URL, and baseline test tooling. It does not include login, registration, catalog, search, filter, product-detail, or administration screens.

Frontend API clients consume the backend REST contract. They do not invent mock endpoints when a real endpoint exists and do not bypass the API to access the database.

## 9. Database Scope

The canonical ERD documents `User`, `Category`, `Product`, `Address`, `Cart`, `CartItem`, `Order`, and `OrderItem` and their relationships. Sprint 1 implementation prioritizes `User`, `Category`, and `Product`.

The baseline documents the ERD but does not create domain entities or an initial business migration. Those artifacts belong to the corresponding Sprint 1 tasks after field constraints and Acceptance Criteria are confirmed. All later schema changes must use EF Core migrations; manual untracked database changes are prohibited.

## 10. API and Error Handling

REST resources use plural, lowercase routes such as `/api/products` and `/api/categories`. Authentication uses `/api/auth/register` and `/api/auth/login`. Public API changes require team agreement.

Validation failures, authentication failures, authorization failures, missing resources, conflicts, and unexpected failures use appropriate HTTP status codes and a consistent JSON error format. A central middleware maps unhandled exceptions to safe responses without exposing internal details.

## 11. Git Workflow

The branch flow is:

```text
main
  ^
develop
  ^
feature/SCRUM-XX-description
```

Direct pushes to `main` are prohibited. Direct pushes to `develop` are discouraged. Feature branches include a Jira key when one exists. Shared branches must not be force-pushed.

Commit subjects use `feat`, `fix`, `refactor`, `test`, `docs`, or `chore`. Pull requests require review, successful CI, Jira or task context, Acceptance Criteria coverage, and test evidence. The PR template records API and database impact.

GitHub branch protection is configured in repository settings. `main` requires a pull request, at least one approving review, and successful required checks. `develop` requires successful CI and should require a reviewed pull request. The repository documentation records the exact settings because workflow files cannot grant branch protection by themselves.

## 12. Continuous Integration

GitHub Actions runs for pull requests targeting `main` or `develop` and for pushes to `develop`.

The backend job performs:

```text
dotnet restore
dotnet build --no-restore
dotnet test --no-build
```

The frontend job performs:

```text
npm ci
npm test
npm run build
```

Backend and frontend jobs are independent so failures identify the affected application. Production deployment is outside this baseline.

## 13. Developer Setup

The root README documents prerequisites and exact commands for:

- Installing .NET 10 SDK, Node.js 24 LTS, and SQL Server.
- Restoring backend and frontend dependencies.
- Supplying local connection-string and JWT configuration safely.
- Building, testing, and running each application.
- Creating and applying EF Core migrations when a Sprint task introduces them.
- Verifying the frontend can reach the backend.

`.editorconfig` defines shared whitespace and language formatting basics. `.gitignore` excludes build output, dependency folders, local environment files, user secrets, and IDE-specific state.

## 14. Verification

The baseline is accepted when:

- All repository instructions and skills are discoverable from `AGENTS.md`.
- Backend restore, build, test, and local startup succeed with .NET 10.
- Frontend clean install, test, build, and local startup succeed with Node.js 24.
- No secrets are tracked.
- CI expresses the same build and test sequence used locally.
- Architecture, ERD, coding conventions, Git workflow, and setup instructions agree with one another.
- No Sprint 1 business endpoint or UI has been implemented.

## 15. Out of Scope

This baseline does not implement any Sprint 1 User Story. It does not create business entities or migrations, production deployment, Docker infrastructure, payment integration, cart and ordering behavior, reporting, password recovery, or other Sprint 2/3 functionality.
