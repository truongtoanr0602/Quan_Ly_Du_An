# US-2 — Category Management (Acceptance Criteria)

**Status:** transcribed from the Sprint 1 Day 2 backend task brief. **Not yet confirmed by the Product
Owner.** `AGENTS.md` requires Acceptance Criteria to come from the canonical backlog; this file exists
because `docs/acceptance-criteria/` was empty when the Category API was implemented. Toản must confirm
or correct it before US-2 is accepted.

**Story:** As an Admin, I want to manage product categories so that products can be organised.

## 1. Data rules

| Rule | Detail |
| --- | --- |
| Name | Required, 2–100 characters measured after trimming |
| Name normalisation | Leading and trailing whitespace is removed before storing and comparing |
| Name uniqueness | Unique, case-insensitive |
| Description | Optional, at most 500 characters, trimmed; whitespace-only is stored as null |
| CreatedAt | Set by the system on creation and never changed by an update |

## 2. Authorization

| Endpoint | Access |
| --- | --- |
| `GET /api/categories` | Public |
| `GET /api/categories/{id}` | Public |
| `POST /api/categories` | Admin only |
| `PUT /api/categories/{id}` | Admin only |
| `DELETE /api/categories/{id}` | Admin only |

## 3. Status codes

| Situation | Response |
| --- | --- |
| List categories | `200 OK` |
| Get an existing category | `200 OK` |
| Create a valid category | `201 Created` with a `Location` header |
| Update a valid category | `200 OK` |
| Delete a category with no products | `204 No Content` |
| Invalid name or description | `400 Bad Request` |
| No credentials on an admin endpoint | `401 Unauthorized` |
| Customer role on an admin endpoint | `403 Forbidden` |
| Category not found | `404 Not Found` |
| Duplicate name, case-insensitive | `409 Conflict` |
| Delete a category that still has products | `409 Conflict` |

## 4. Open questions for the Product Owner

1. Should name uniqueness also ignore Vietnamese diacritics, or only letter case? The implementation
   currently ignores case only (`SQL_Latin1_General_CP1_CI_AS`).
2. Is deletion a hard delete, or should categories be soft-deleted/archived? The implementation
   performs a hard delete, allowed only when no product references the category.
3. Should the list endpoint be paginated once the catalogue grows? It currently returns every
   category ordered by name.
