# SDD ledger — plan: docs/superpowers/plans/2026-09-06-sprint2-shopping-ordering.md

## Baseline

- Worktree: `D:/TruongQuocToan_0214168/Hoc_ky_7/QLDA/.worktrees/sprint2-shopping-ordering`
- Branch: `feature/sprint2-shopping-ordering-implementation`
- Backend: 2/2 tests passed.
- Frontend: 1/2 tests failed because `App.test.tsx` asserts the removed technical-baseline shell.
- Ruling: Continue — this is a known stale test explicitly replaced by Task 6; cost if wrong is a frontend regression caught by Task 6 and final verification.

## Pre-flight consistency scan

| Scope | Produces / consumes | Finding |
| --- | --- | --- |
| Task 1 | SQLite factory and JWT tokens | Internally consistent; enables HTTP/service tests. |
| Task 2 | expected exceptions and middleware mappings | Internally consistent; consumed by Tasks 3, 7, 8. |
| Task 3 | Cart DTOs and `ICartService` | Internally consistent; consumed by Tasks 4–6. |
| Task 4 | Cart routes and DI | Internally consistent with Task 3 signatures and Task 5 routes. |
| Task 5 | `ApiError`, cart client/context | Internally consistent with Task 4 contracts; consumed by Task 6/10. |
| Task 6 | cart UI/routes and stale baseline test replacement | Internally consistent with Task 5 context. |
| Task 7 | Address DTO/service/API | Internally consistent; `GetOwnedEntityAsync` is consumed by Task 8. |
| Task 8 | transactional Order DTO/service | Internally consistent with Cart/Address entities and consumed by Task 9/10. |
| Task 9 | Order route and DI | Internally consistent with Task 8 and Task 10 client. |
| Task 10 | address/order clients and checkout UI | Internally consistent with Tasks 5, 7 and 9. |
| Task 11 | whole-project verification | Internally consistent; preserves the user's unrelated architecture-skill edit in the original checkout. |
| Tasks 1↔4↔7↔9 | `ApiWebApplicationFactory`, JWT, endpoint tests | Shared interfaces agree. |
| Tasks 2↔3↔7↔8 | `NotFoundException` / `ConflictException` | Error ownership and 404/409 mappings agree. |
| Tasks 3↔4↔5↔6 | Cart DTO/service/routes/context/UI | Property names, routes and status codes agree. |
| Tasks 7↔8↔9↔10 | Address ownership and checkout contracts | Exactly one address source and COD-only rules agree. |
| Tasks 5↔6↔10 | `CartContext` async actions and refresh | Consumers agree on the produced interface. |
| Tasks 4↔7↔9 | `Program.cs` DI additions | Additive registrations; no conflict. |
| Tasks 6↔10 | `CartPage.tsx` and `AppRouter.tsx` | Task 10 extends Task 6 checkout navigation; no conflicting behavior. |

Ruling: Task 11's known baseline failure is not attributed to Tasks 1–5 and must be resolved exactly in Task 6 as planned.

