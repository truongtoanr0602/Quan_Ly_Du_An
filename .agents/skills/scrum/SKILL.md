---
name: scrum
description: Use when interpreting Product Backlog or Sprint Backlog work, Jira issues, Acceptance Criteria, Definition of Done, ownership, or scope ambiguity.
---

# Scrum

## Overview

Use the Product Backlog as the business-requirement authority and the Sprint Backlog as the active work boundary. Read `docs/Sprint_backlog.md` and the current Sprint document.

## Quick Reference

| Role/artifact | Authority |
| --- | --- |
| Product Owner — Toản | Product Goal, backlog priority, Acceptance Criteria, acceptance |
| Scrum Master — Quang | Scrum facilitation, Jira flow, impediment support |
| Developers | Technical plan, implementation, integration, testing, quality |
| Product Backlog | Ordered business requirements |
| Sprint Backlog | Current Sprint scope and technical tasks |
| Definition of Done | Required completion quality |

When a Jira key exists, link code, branch, and PR to it. Developers may refine technical tasks as understanding improves but must not silently add a large User Story that threatens the Sprint Goal.

If requirements conflict or lack a material Acceptance Criterion, report the exact ambiguity and affected behavior to the Product Owner. Continue only with work that does not depend on the missing decision.

## Example

If “delete category” does not say what happens to existing products, report the missing rule and its database/API impact; do not choose cascade delete, restriction, or reassignment on behalf of the Product Owner.

## Common Mistakes

- Marking work Done when only implementation is complete.
- Treating role specialization as exclusive ownership.
- Adding a technical preference as a Product Backlog requirement.
- Inventing a business rule to avoid asking about a material ambiguity.

