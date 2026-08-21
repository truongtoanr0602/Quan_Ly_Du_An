# ECommerce Project Instructions

## Required Workflow

Before changing code or configuration:

1. Read every relevant document under `docs/`. For project-wide or architectural work, read all documents.
2. Read the applicable skill under `.agents/skills/` as routed by `.agents/README.md`.
3. Identify the Jira User Story or task and its Acceptance Criteria when a Jira key exists.
4. Inspect the affected modules and confirm the current architecture before editing.
5. Report conflicting, missing, or ambiguous requirements instead of inventing a decision.
6. Propose and obtain team approval for changes to public APIs, the database model, architecture, or Sprint scope.
7. Make the smallest change that satisfies the task, then build and test it.

## Project Context

This repository contains a six-week e-commerce MVP delivered in three two-week Sprints.

- Toản — Product Owner.
- Quang — Scrum Master.
- Bá Nam — Developer, primarily Integration and Full-stack.
- Tùng — Developer, primarily Backend and Database.
- Năng — Developer, primarily Frontend and UI.

The Product Goal is to deliver a basic shopping journey from product discovery through ordering, together with administration for products, categories, inventory, and orders.

The current Sprint is **Sprint 1 — Product Catalog & Authentication**. Its Sprint Goal is to establish the website foundation so customers can register, sign in, and discover products while administrators can manage categories and products.

Sprint 1 contains:

- US-2: Category management.
- US-3: Product management.
- US-7: Account registration.
- US-8: Login and logout.
- US-17: Filter products by category.
- US-18: Search products.
- US-19: Filter products by price and brand.
- US-20: View product details.

Do not implement Cart, Checkout, Order, Payment, Inventory administration, reporting, or account-recovery behavior as part of Sprint 1 unless the Product Backlog and Sprint Backlog are explicitly updated.

## Approved Architecture

- Frontend: React, TypeScript, Vite, and Node.js 24 LTS.
- Backend: .NET 10 LTS, C#, ASP.NET Core Web API, Entity Framework Core, JWT, and Swagger/OpenAPI.
- Database: Microsoft SQL Server.
- Roles: `Admin` and `Customer`.
- Flow: React -> REST API -> Controller -> Service Layer -> EF Core / `AppDbContext` -> SQL Server.
- Frontend must never connect directly to the database.
- Controllers handle HTTP concerns; business logic belongs in Services.
- Use DTOs when returning an Entity would expose private data or couple clients to persistence.
- Database changes must use EF Core migrations.
- Use validation and centralized error handling; never expose stack traces or secrets to clients.
- Do not introduce Clean Architecture, microservices, Docker, major frameworks, or dependencies without team approval.
- Do not silently change a public API, entity/field name, or established folder structure.

## Engineering and Scrum Rules

- Follow the naming and layout rules in `docs/coding-conventions.md` once present.
- Do not duplicate business logic or bypass validation and error handling.
- Product Backlog is the business-requirement authority; Sprint Backlog is the active Sprint scope.
- Link coding work to its Jira issue when a Jira key exists.
- Completion requires the relevant Acceptance Criteria and Definition of Done.
- Branch flow is `main <- develop <- feature/SCRUM-XX-description`.
- Do not push directly to `main`, force-push shared branches, or merge without review and successful CI.
- Commit subjects use `feat`, `fix`, `refactor`, `test`, `docs`, or `chore`.

## Completion Report

Every completed task report must include:

- What changed and which files changed.
- Which project rules and architecture decisions were followed.
- API and database impact.
- Exact build and test commands with results.
- Exact run instructions.
- Remaining limitations, blockers, or external setup.

