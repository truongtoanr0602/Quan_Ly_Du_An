---
name: architecture
description: Use when changing component boundaries, API flow, dependency direction, authentication, error handling, or other cross-module technical decisions.
---

# Architecture

## Overview

Keep the MVP on the approved simple layered architecture. Read `docs/architecture.md` before changing a boundary or public contract.

## Required Flow

```text
React -> REST API -> Controller -> Service -> EF Core / AppDbContext -> SQL Server
```

| Component | Owns |
| --- | --- |
| React | Presentation, interaction, API consumption |
| Controller | HTTP routing, request/response concerns |
| Service | Business rules, orchestration, Entity/DTO mapping |
| EF Core | Persistence mapping, queries, migrations |
| Middleware | Cross-cutting exception handling |

JWT authenticates callers; authorization uses `Admin` and `Customer`. Use DTOs when an Entity would leak data or persistence details.

## Decision Rule

Keep a change inside these boundaries. If it requires a new architectural layer, public API change, database redesign, microservice, or major framework, describe the impact and obtain team approval before editing.

## Example

For duplicate-category validation, the controller accepts the DTO and delegates; `CategoryService` checks the rule through EF Core and returns a result that the controller maps to an HTTP response.

## Common Mistakes

- Querying `AppDbContext` directly from React or bypassing the API.
- Putting reusable business rules in controllers.
- Returning password hashes or navigation graphs as API Entities.
- Adding abstractions because they may be useful in a later Sprint.

