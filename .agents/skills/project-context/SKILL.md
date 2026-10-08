---
name: project-context
description: Use when starting any task in this e-commerce repository or deciding whether requested work belongs to the current Sprint.
---

# Project Context

## Overview

Ground every decision in the Product Goal, current Sprint Goal, and canonical backlog. Product scope comes from `docs/Sprint_backlog.md`; `docs/Sprint1.md` records the completed foundation, and the approved Sprint 2 design is under `docs/superpowers/specs/`.

## Current Context

| Area | Decision |
| --- | --- |
| Product | Six-week e-commerce MVP, three two-week Sprints |
| Sprint | Sprint 2 — Shopping & Ordering |
| Sprint stories | US-9, US-12, US-13, US-14, US-15 |
| PO | Toản |
| Scrum Master | Quang |
| Developers | Bá Nam: Integration/Full-stack; Tùng: Backend/Database; Năng: Frontend/UI |
| Stack | .NET 10, React/TypeScript/Vite on Node.js 24, EF Core, SQL Server, JWT |

## Scope Decision

Read all relevant `docs` before acting. A task belongs to Sprint 2 only when it supports customer profile management, server-backed cart, shipping addresses, COD or approved mock QR checkout, multi-product ordering, or owned order history and is linked to the Sprint Backlog or an approved technical sub-task.

COD and mock QR order creation with `PENDING` payment status are approved. The approved mock bank confirmation sets QR payment status to `PAID` for the order owner after explicit confirmation. Real banking or automatic transaction verification, order cancellation, admin order management, inventory administration, reporting, password recovery, and password changes remain Sprint 3 or later scope and require an explicit backlog/scope update before implementation.

## Example

Request: “Add online payment while implementing Sprint 2.”

Response: report that Sprint 2 supports COD and an approved mock QR flow only; request an explicit backlog update before implementing real online payment.

## Common Mistakes

- Treating every Product Backlog item as current Sprint scope.
- Treating customer order history as permission to implement order cancellation or admin order management.
- Assuming a technical assignment prevents other Developers from collaborating.
- Inventing Acceptance Criteria that are missing from the canonical backlog.

