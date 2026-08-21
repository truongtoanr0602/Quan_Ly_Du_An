# Shared Project Skills

All coding agents start with the repository-level `AGENTS.md`, then load the skill that matches the current work. Canonical project facts remain under `docs`; skills provide concise decision rules and link back to those facts.

| Skill | Load when |
| --- | --- |
| `project-context` | Starting work or checking Sprint scope |
| `architecture` | Changing boundaries, flow, authentication, or public contracts |
| `backend` | Changing ASP.NET Core API code or backend tests |
| `frontend` | Changing React, TypeScript, API clients, or UI tests |
| `database` | Changing EF Core, SQL Server, migrations, or ERD relationships |
| `git-workflow` | Branching, committing, opening PRs, merging, or configuring GitHub |
| `scrum` | Interpreting backlog, Jira, Acceptance Criteria, Definition of Done, or ownership |

Load every applicable skill for cross-cutting tasks. Explicit user instructions and approved canonical documents take precedence over a stale skill. When a canonical decision changes, update its affected skill in the same reviewed change.

Validate the skill set from the repository root:

```powershell
powershell.exe -NoProfile -File .agents/tests/validate-skills.ps1
```

