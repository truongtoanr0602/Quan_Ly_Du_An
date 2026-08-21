# Coding Conventions

These conventions apply to the .NET 10 backend and the React/TypeScript/Vite frontend running on Node.js 24.

## 1. General

- Prefer readable, focused files and the smallest implementation that meets Acceptance Criteria.
- Do not duplicate business logic, silently change public contracts, or add dependencies without a demonstrated need.
- Validate at system boundaries and handle expected failure modes explicitly.
- New behavior requires tests; bug fixes require a failing regression test first.
- Secrets, personal connection strings, and tokens never enter tracked files or logs.

## 2. C# and ASP.NET Core

| Symbol | Convention | Example |
| --- | --- | --- |
| Class, record, method, property | PascalCase | `ProductService`, `GetByIdAsync` |
| Interface | `I` + PascalCase | `IProductService` |
| Parameter and local | camelCase | `productId` |
| Private field | `_camelCase` when a field is required | `_logger` |
| Async method | `Async` suffix | `CreateAsync` |

- Keep nullable reference types enabled.
- Controllers own routes, status codes, authentication/authorization attributes, and delegation only.
- Services own business rules and Entity/DTO mapping.
- Persistence goes through EF Core and `AppDbContext`; do not add a repository layer by default.
- Use asynchronous EF/API methods and pass `CancellationToken` through request-bound operations.
- Use request/response DTOs for public contracts. Never return `PasswordHash`.
- Prefer dependency injection through constructors and register dependencies explicitly.
- Log useful context without credentials, tokens, or unnecessary personal data.
- Unexpected errors pass through centralized middleware and return safe Problem Details.

## 3. TypeScript and React

| Symbol | Convention | Example |
| --- | --- | --- |
| Component, type, interface | PascalCase | `ProductCard`, `ProductDto` |
| Function, hook, variable | camelCase | `fetchProducts`, `useAuth` |
| Hook | `use` prefix | `useProducts` |
| Component file | PascalCase | `ProductCard.tsx` |
| Non-component module | camelCase | `productService.ts` |

- Avoid `any`; model backend contracts explicitly under `src/types`.
- Centralize network calls under `src/services`; components do not repeat API URLs.
- Read the backend base URL from `VITE_API_BASE_URL`. Values exposed with `VITE_*` are public browser configuration, not secrets.
- Represent loading, empty, validation, error, and success states where applicable.
- Keep components focused; move reusable behavior to hooks and pure transformations to utilities.
- Test observable user behavior and API-contract handling.

## 4. REST API

- Use plural lowercase resource routes: `/api/products`, `/api/categories`.
- Use nouns in routes and HTTP methods for actions.
- Use `200` for successful reads/updates, `201` for creation, `204` for deletion without content, `400` for invalid input, `401` for missing/invalid authentication, `403` for insufficient role, `404` for missing resources, and `409` for state conflicts.
- Keep response DTO and error structures consistent.
- A route, DTO, status-code, or field change is a public API change and requires impact review.

## 5. Testing and Review

- Backend test names state behavior, condition, and result where useful.
- Frontend tests query accessible roles/text and assert user-visible behavior.
- Keep tests deterministic and independent from developer-specific databases unless explicitly integration-tested.
- Run the affected test first, then the full project build/test before a Pull Request.
- Review validation, authorization, error handling, API/database impact, and Acceptance Criteria.
