---
name: git-workflow
description: Use when creating branches, commits, pull requests, merges, Jira-linked work, or changing GitHub workflow and branch-protection configuration.
---

# Git Workflow

## Overview

Protect shared history and keep every change traceable to reviewed work. Read `docs/git-workflow.md` before publishing or integrating changes.

## Quick Reference

| Action | Convention |
| --- | --- |
| Branch flow | `main <- develop <- feature/SCRUM-XX-description` |
| Commits | `feat`, `fix`, `refactor`, `test`, `docs`, `chore` |
| Before PR | Synchronize with `develop`; build and test |
| PR | Link Jira/task, show Acceptance Criteria and evidence |
| Merge | Review plus successful required CI |

Do not commit directly to `main`. Avoid direct commits to `develop`. Never force-push a shared branch or bypass required checks. If no Jira key exists, use a concise descriptive feature branch and state the task source in the PR.

## Example

For Jira task `SCRUM-12`, create `feature/SCRUM-12-product`, make focused conventional commits, synchronize it with `develop`, run both affected builds/tests, and open a reviewed PR into `develop`.

## Common Mistakes

- Combining unrelated User Stories in one feature branch.
- Using vague commit subjects such as `update` or `fix stuff`.
- Treating a green local build as a replacement for PR review and CI.
- Claiming branch protection is enabled without checking GitHub settings.
- Force-pushing to hide merge or review problems.

