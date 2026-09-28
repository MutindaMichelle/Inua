# Git & GitHub Workflow

This document exists to satisfy your course's version-control requirements explicitly. Each section below maps to one bullet from the rubric.

## 1. Branches

Never commit directly to `main` past the initial setup commit. One branch per issue.

- `feature/<short-name>` — new functionality (e.g. `feature/prediction-endpoint`)
- `fix/<short-name>` — bug fixes (e.g. `fix/feedback-validation`)
- `chore/<short-name>` — setup, config, non-code work (e.g. `chore/github-setup`)

```bash
git checkout -b feature/prediction-endpoint
# ... do the work ...
git push -u origin feature/prediction-endpoint
```

## 2. Commits

Use [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <what changed>`.

```
feat(ml): exclude composite scores from feature set to prevent label leakage
fix(backend): return 400 instead of 500 on missing prediction payload field
docs(readme): add VS Code setup instructions
test(ml): add regression test locking in the feature-leakage fix
chore(git): initialize repository structure
```

Commit at natural checkpoints (a working endpoint, a passing test, a fixed bug) — not once a day as a dump of everything, and not every single file save. If you can't describe a commit in one line without the word "stuff," it's not ready to commit yet.

## 3. Issues

One issue per row in `ROADMAP.md`'s tables. Title format: `<type>(<scope>): <what>` (same convention as commits, so issue titles and the commits that close them read consistently).

Reference the issue number in commits and PRs that address it:
```
git commit -m "feat(backend): implement /auth/login endpoint (#12)"
```
Closing an issue automatically: include `Closes #12` in the PR description.

## 4. Milestones

Two milestones, matching `ROADMAP.md`:
- **Backend MVP** — due end of Week 1
- **Working Prototype** — due end of Week 2

Assign every issue to one of these two when you create it, so the milestone progress bar reflects real status.

## 5. Pull Requests & code review

Solo project, so "review" means reviewing your own diff before merging, deliberately:

1. Open a PR from your feature branch into `main` when the issue is done.
2. Fill in: what changed, which issue it closes, how you tested it.
3. Re-read your own diff on the PR's "Files changed" tab before merging — this catches leftover debug prints and half-finished code more reliably than re-reading in the editor.
4. Merge with "Squash and merge" to keep `main`'s history clean, unless the branch's individual commits are each independently meaningful.

## 6. Repository hygiene

- `.gitignore` already excludes `__pycache__/`, `.venv/`, `node_modules/`, and regenerable model/data artifacts — don't force-add these.
- Keep `ml/data/*.csv` and `ml/models/*.joblib` out of git (they're one `python generate_dataset.py && python train_model.py` away from existing); commit `model_metadata.json` results in a PR description or `docs/` note instead, if you want a record of a specific run's metrics.
- Don't commit secrets (DB passwords, API keys) — use a `.env` file (already gitignored) and document required variables in each component's README instead.

## 7. Initial setup checklist (do this first)

```bash
# from inside the unzipped Inua/ folder
git init            # skip if already initialized
git add .
git commit -m "chore: initial project structure (proposal, design, ml pipeline)"

# on GitHub: create a new repository named "Inua" (do not initialize with a README)
git remote add origin https://github.com/<your-username>/Inua.git
git branch -M main
git push -u origin main
```

Then on GitHub: create the two milestones, create the issues from `ROADMAP.md`, turn on branch protection for `main` (Settings → Branches → require PRs before merging), and submit the repository URL through your course's GitHub Repository Submission Form.
