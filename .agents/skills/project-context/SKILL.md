---
name: project-context
description: Use when starting any task in this e-commerce repository or deciding whether requested work belongs to the current Sprint.
---

# Project Context

## Overview

Ground every decision in the Product Goal, current Sprint Goal, and canonical backlog. Product scope comes from `docs/Sprint_backlog.md`; detailed Sprint 1 work comes from `docs/Sprint1.md`.

## Current Context

| Area | Decision |
| --- | --- |
| Product | Six-week e-commerce MVP, three two-week Sprints |
| Sprint | Sprint 1 — Product Catalog & Authentication |
| Sprint stories | US-2, US-3, US-7, US-8, US-17, US-18, US-19, US-20 |
| PO | Toản |
| Scrum Master | Quang |
| Developers | Bá Nam: Integration/Full-stack; Tùng: Backend/Database; Năng: Frontend/UI |
| Stack | .NET 10, React/TypeScript/Vite on Node.js 24, EF Core, SQL Server, JWT |

## Scope Decision

Read all relevant `docs` before acting. A task belongs to Sprint 1 only when it supports Authentication, Category management, Product management, product search/filter, or product detail and is linked to the Sprint Backlog or an approved technical sub-task.

If a request introduces Cart, Checkout, Order, Payment, Inventory administration, reporting, or password recovery, identify its later-Sprint ownership and ask for an explicit backlog/scope update before implementation.

## Example

Request: “Add Cart while setting up Sprint 1.”

Response: report that Cart is US-12 in Sprint 2, leave the code unchanged, and ask the Product Owner whether the Sprint Backlog has been updated.

## Common Mistakes

- Treating every Product Backlog item as current Sprint scope.
- Assuming a technical assignment prevents other Developers from collaborating.
- Inventing Acceptance Criteria that are missing from the canonical backlog.

