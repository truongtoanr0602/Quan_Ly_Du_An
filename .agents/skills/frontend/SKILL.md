---
name: frontend
description: Use when creating or changing React components, pages, routes, hooks, TypeScript types, API clients, frontend state, or UI tests.
---

# Frontend

## Overview

Build the client with React, TypeScript, Vite, and Node.js 24. Treat the backend REST contract as authoritative.

## Quick Reference

| Area | Rule |
| --- | --- |
| Components/pages | `PascalCase` names and focused responsibilities |
| Functions/variables | `camelCase`; explicit public types |
| API access | Centralized under `src/services` |
| Contracts | Shared frontend shapes under `src/types` |
| Configuration | Read API base URL from `VITE_API_BASE_URL` |
| UX states | Represent loading, empty, success, validation, and failure states |
| Tests | Assert user-visible behavior and contract handling |

Use hooks for reusable React behavior, not ordinary utility functions. Keep route definitions under `src/routes`. Never access SQL Server, embed secrets in `VITE_*` variables, or bypass an existing backend endpoint.

## Example

A product page imports `ProductDto` from `src/types`, calls a product service from `src/services`, and renders loading, not-found, error, and success states. It does not duplicate the URL or response type inside the component.

## Common Mistakes

- Inventing a mock API after the backend contract exists.
- Using `any` to hide a contract mismatch.
- Fetching directly from many components instead of a service boundary.
- Treating a frontend environment variable as private; Vite exposes it to the browser.
- Adding a state or UI framework without team approval.

