# Git Workflow

Required checks build and test the .NET 10 backend and the Node.js 24 frontend.

## 1. Branch Model

```text
main
  ^
develop
  ^
feature/SCRUM-XX-description
```

- `main` contains reviewed, stable increments. Direct pushes are prohibited.
- `develop` is the integration branch. Use reviewed Pull Requests and successful CI.
- Each User Story or large task uses a focused feature branch.
- Include the Jira key when one exists, for example `feature/SCRUM-12-product`.

Create a branch from an updated `develop`:

```powershell
git switch develop
git pull --ff-only origin develop
git switch -c feature/SCRUM-12-product
```

## 2. Commit Convention

Allowed prefixes:

- `feat`: user-visible capability.
- `fix`: defect correction.
- `refactor`: internal change without behavior change.
- `test`: test-only change.
- `docs`: documentation.
- `chore`: tooling, configuration, dependency, or maintenance work.

Use an imperative, focused subject, for example `feat: add category CRUD API`. Do not combine unrelated User Stories in one commit.

## 3. Pull Request Flow

1. Re-read the Jira issue, Acceptance Criteria, and Definition of Done.
2. Synchronize the feature branch with current `develop` without force-pushing a shared branch.
3. Run backend/frontend builds and tests affected by the change.
4. Open a Pull Request into `develop` using the repository template.
5. Address review comments with additional commits when history is shared.
6. Merge only after at least one approval and all required CI checks pass.
7. Delete the feature branch after merge.

A PR must state API impact, database/migration impact, test evidence, and UI screenshots when applicable. Missing or conflicting requirements return to the Product Owner rather than being silently decided in code.

## 4. Branch Protection

Configure on GitHub after the remote repository exists.

### `main`

- Require a Pull Request before merging.
- Require at least one approving review and dismissal of stale approvals after new changes.
- Require successful `backend` and `frontend` status checks.
- Require conversation resolution.
- Block force pushes and deletion.
- Do not allow direct pushes or bypass except designated repository administrators for emergencies.

### `develop`

- Require a Pull Request and at least one review.
- Require successful `backend` and `frontend` checks.
- Require conversation resolution.
- Block force pushes and deletion.

Workflow files cannot enable these settings themselves. The repository owner must configure and verify them in GitHub Settings → Branches or Rulesets.

## 5. Conflict and Failure Handling

- Resolve conflicts on the feature branch, then rerun all affected checks.
- Do not merge with failing CI or hide failures by disabling tests.
- Do not rewrite shared branch history.
- If a migration conflicts, coordinate the final model and regenerate/reconcile migrations rather than manually editing the shared database.
