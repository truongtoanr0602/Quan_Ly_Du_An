---
name: database
description: Use when changing EF Core entities, configurations, DbContext, migrations, SQL Server constraints, indexes, or documented ERD relationships.
---

# Database

## Overview

Keep SQL Server, the canonical ERD, EF Core models, and migrations consistent. Read `docs/database-erd.md` and the relevant Sprint backlog before schema work.

## Quick Reference

| Concern | Rule |
| --- | --- |
| Sprint 1 | Prioritize `User`, `Category`, and `Product` |
| Later Sprints | `Address`, `Cart`, `CartItem`, `Order`, `OrderItem` remain design references until scheduled |
| Schema changes | Generate and review an EF Core migration |
| Money | Use explicit SQL decimal precision |
| Identity | Unique normalized email for users |
| Quantities | Enforce non-negative stock and positive item quantities |
| Relationships | Keep keys, nullability, and delete behavior explicit |

Before renaming an entity or field, identify API, frontend, migration, and documentation consumers and obtain team agreement. Never repair shared schema manually without recording the equivalent migration.

## Example

Adding `Product.Brand` requires an agreed Entity property, EF configuration, migration, DTO/API contract review, filter impact review, and synchronized ERD documentation.

## Common Mistakes

- Creating all later-Sprint tables during Sprint 1 for convenience.
- Using floating-point types for money.
- Relying only on application validation for critical uniqueness or range rules.
- Editing a generated migration after it has been applied to shared environments without coordination.
- Allowing cascade deletion without evaluating affected business records.

