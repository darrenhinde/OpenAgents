# Version Bump Guide

This workflow automatically bumps versions when PRs are merged to main.

## How It Works

When you merge a PR to main, the version is automatically bumped based on your commit message:

### Commit Message Format

Use conventional commits to control version bumping:

| Commit Message | Version Bump | Example |
|----------------|--------------|---------|
| `feat: add feature` | **Minor** | v0.1.0 → v0.2.0 |
| `feat!: breaking change` | **Major** | v0.1.0 → v1.0.0 |
| `fix: bug fix` | **Patch** | v0.1.0 → v0.1.1 |
| `[alpha] message` | **Alpha** | v0.1.0-alpha.1 → v0.1.0-alpha.2 |
| `[beta] message` | **Beta** | v0.1.0-beta.1 → v0.1.0-beta.2 |
| `[rc] message` | **RC** | v0.1.0-rc.1 → v0.1.0-rc.2 |
| Any other message | **Minor** (default) | v0.1.0 → v0.2.0 |

### Examples

```bash
# Feature (minor bump)
git commit -m "feat: add new agent capability"
# Result: v0.1.0 → v0.2.0

# Bug fix (patch bump)
git commit -m "fix: correct context loading"
# Result: v0.1.0 → v0.1.1

# Breaking change (major bump)
git commit -m "feat!: redesign agent API"
# Result: v0.1.0 → v1.0.0

# Alpha release
git commit -m "[alpha] improve prompt"
# Result: v0.1.0-alpha.1 → v0.1.0-alpha.2

# Default (minor bump)
git commit -m "improve documentation"
# Result: v0.1.0 → v0.2.0
```

## What Happens Automatically

1. ✅ Tests run (smoke tests for both agents)
2. ✅ Version is bumped based on commit message
3. ✅ CHANGELOG.md is updated with changes
4. ✅ Git tag is created (e.g., v0.2.0)
5. ✅ Changes are pushed back to main
6. ✅ GitHub release can be created (optional)

## Manual Override

If you want to bump version manually:

```bash
# Bump specific version type
npm run version:bump alpha
npm run version:bump beta
npm run version:bump rc
npm run version:bump patch
npm run version:bump minor
npm run version:bump major

# Commit and push
git add VERSION package.json CHANGELOG.md
git commit -m "chore: bump version to vX.Y.Z"
git tag vX.Y.Z
git push origin main --tags
```

## Skipping Auto-Bump

Add `[skip ci]` to your commit message:

```bash
git commit -m "docs: update README [skip ci]"
```

This will skip both tests and version bumping.
