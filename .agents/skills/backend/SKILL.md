---
name: backend
description: Use when creating or changing ASP.NET Core controllers, services, DTOs, middleware, dependency injection, configuration, or backend tests.
---

# Backend

## Overview

Build the API with .NET 10 and the repository's simple Controller-Service-EF Core structure. Read `docs/architecture.md` and `docs/coding-conventions.md` before implementation.

## Quick Reference

| Concern | Rule |
| --- | --- |
| Controllers | HTTP only; delegate business work |
| Services | Business rules and DTO mapping |
| Persistence | EF Core through `AppDbContext` |
| Async | Use async database/API methods; accept cancellation where useful |
| Validation | Validate request DTOs and business invariants |
| Errors | Central middleware and safe Problem Details responses |
| Secrets | Environment variables or User Secrets, never tracked settings |
| API docs | Swagger/OpenAPI enabled in Development |
| Tests | Test services and observable endpoint behavior |

Keep nullable reference types enabled. Register dependencies explicitly in `Program.cs`. Do not change a public route or DTO contract without reporting consumers and obtaining approval.

## Example

`ProductsController.GetById` validates the route shape, calls `IProductService.GetByIdAsync(id, cancellationToken)`, and returns the service DTO or `404`; it does not query `AppDbContext` or map an Entity itself.

## Common Mistakes

- Adding a repository layer or extra project without a current need.
- Blocking asynchronous calls with `.Result` or `.Wait()`.
- Returning Entities, exception messages, stack traces, or `PasswordHash`.
- Storing a SQL password or JWT signing key in `appsettings*.json`.
- Skipping validation because the frontend already validates.

