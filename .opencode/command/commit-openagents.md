---
description: Smart commit command for opencode-agents repository with automatic validation and conventional commits
---

# Commit OpenAgents Command

You are an AI agent that helps create well-formatted git commits specifically for the **opencode-agents** repository. This command handles the complete commit workflow including validation, testing, and pushing changes.

## Instructions for Agent

When the user runs this command, execute the following workflow:

### 1. **Pre-Commit Validation**
Run these checks in parallel:
```bash
npm run test:openagent -- --smoke
npm run test:opencoder -- --smoke
git status --porcelain
git diff --cached
```

**Validation Rules:**
- ✅ Smoke tests must pass for both agents
- ✅ Check for uncommitted changes
- ⚠️ If tests fail, ask user if they want to proceed or fix issues first

### 2. **Analyze Changes**
- Run `git status` to see all untracked files
- Run `git diff` to see both staged and unstaged changes
- Run `git log --oneline -5` to see recent commit style
- Identify the scope of changes (evals, scripts, docs, agents, etc.)

### 3. **Stage Files Intelligently**
**Auto-stage based on change type:**
- If modifying evals framework → stage `evals/framework/`
- If modifying agent configs → stage `.opencode/agent/`
- If modifying scripts → stage `scripts/`
- If modifying docs → stage `docs/`
- If modifying CI/CD → stage `.github/workflows/`
- If user provides specific files → stage only those

**Never auto-stage:**
- `node_modules/`
- `.env` files
- `test_tmp/` or temporary directories
- `evals/results/` (test results)

### 4. **Generate Commit Message**

**Follow Conventional Commits (NO EMOJIS):**
```
<type>(<scope>): <description>

[optional body]
```

**Types for this repo:**
- `feat` - New features (agents, commands, tools)
- `fix` - Bug fixes
- `refactor` - Code restructuring without behavior change
- `test` - Test additions or modifications
- `docs` - Documentation updates
- `chore` - Maintenance tasks (dependencies, cleanup)
- `ci` - CI/CD pipeline changes
- `perf` - Performance improvements

**Scopes for this repo:**
- `evals` - Evaluation framework changes
- `agents` - Agent configuration changes (openagent, opencoder)
- `subagents` - Subagent changes (task-manager, coder, tester, etc.)
- `commands` - Slash command changes
- `context` - Context file changes
- `scripts` - Build/test script changes
- `ci` - GitHub Actions workflow changes
- `docs` - Documentation changes

**Examples:**
```
feat(evals): add parallel test execution support
fix(agents): correct delegation logic in openagent
refactor(evals): split test-runner into modular components
test(evals): add smoke tests for openagent
docs(readme): update installation instructions
chore(deps): upgrade evaluation framework dependencies
ci: add automatic version bumping workflow
```

### 5. **Commit Analysis**

<commit_analysis>
- List all files that have been changed or added
- Summarize the nature of changes (new feature, bug fix, refactor, etc.)
- Identify the primary scope (evals, agents, scripts, etc.)
- Determine the purpose/motivation behind changes
- Assess impact on the overall project
- Check for sensitive information (API keys, tokens, etc.)
- Draft a concise commit message focusing on "why" not "what"
- Ensure message follows conventional commit format
- Verify message is specific and not generic
</commit_analysis>

### 6. **Execute Commit**
```bash
git add <relevant-files>
git commit -m "<type>(<scope>): <description>"
git status  # Verify commit succeeded
```

### 7. **Post-Commit Actions**

**Ask user:**
```
✅ Commit created: <commit-hash>
📝 Message: <commit-message>

Would you like to:
1. Push to remote (git push origin main)
2. Create another commit
3. Done
```

**If user chooses push:**
```bash
git push origin main
```

**Then inform:**
```
🚀 Pushed to remote!

This will trigger:
- GitHub Actions CI/CD workflow
- Smoke tests for openagent & opencoder
- Automatic version bumping (if feat/fix commit)
- CHANGELOG.md update
```

## Repository-Specific Rules

### Version Bumping (Automatic via CI/CD)
Commits trigger automatic version bumps:
- `feat:` → minor bump (0.0.1 → 0.1.0)
- `fix:` → patch bump (0.0.1 → 0.0.2)
- `feat!:` or `BREAKING CHANGE:` → major bump (0.1.0 → 1.0.0)
- `[alpha]` in message → alpha bump (0.1.0-alpha.1 → 0.1.0-alpha.2)
- Default → patch bump (0.0.1 → 0.0.2)

### Files to Always Check
Before committing, verify these are in sync:
- `VERSION` file
- `package.json` version
- `CHANGELOG.md` (if manually updated)

### Pre-Commit Hooks
This repo may have pre-commit hooks that:
- Run linting
- Format code
- Run type checks

**If hooks modify files:**
- Automatically amend the commit to include hook changes
- Inform user that files were auto-formatted

## Error Handling

### If Smoke Tests Fail
```
⚠️ Smoke tests failed for <agent-name>

Failures:
<test-output>

Options:
1. Fix issues and retry
2. Run full test suite (npm run test:<agent>)
3. Proceed anyway (not recommended)
4. Cancel commit

What would you like to do?
```

### If No Changes Detected
```
ℹ️ No changes to commit. Working tree is clean.

Recent commits:
<git log --oneline -3>

Would you like to:
1. Check git status
2. View recent commits
3. Exit
```

### If Merge Conflicts
```
⚠️ Merge conflicts detected. Please resolve conflicts first.

Conflicted files:
<list-files>

Run: git status
```

## Agent Behavior Notes

- **Never commit without validation** - Always run smoke tests first
- **Smart staging** - Only stage relevant files based on change scope
- **Conventional commits** - Strictly follow conventional commit format (NO EMOJIS)
- **Scope awareness** - Use appropriate scope for this repository
- **Version awareness** - Inform user about automatic version bumping
- **CI/CD awareness** - Remind user that push triggers automated workflows
- **Security** - Never commit sensitive information (API keys, tokens, .env files)
- **Atomic commits** - Each commit should have a single, clear purpose
- **Push guidance** - Always ask before pushing to remote

## Quick Reference

### Common Workflows

**Feature Addition:**
```bash
# 1. Run smoke tests
npm run test:openagent -- --smoke
npm run test:opencoder -- --smoke

# 2. Stage and commit
git add <files>
git commit -m "feat(evals): add new evaluation metric"

# 3. Push
git push origin main
```

**Bug Fix:**
```bash
git add <files>
git commit -m "fix(agents): correct delegation threshold logic"
git push origin main
```

**Documentation:**
```bash
git add docs/
git commit -m "docs(guides): update testing documentation"
git push origin main
```

**Refactoring:**
```bash
git add evals/framework/src/
git commit -m "refactor(evals): extract validation logic into separate module"
git push origin main
```

## Success Criteria

A successful commit should:
- ✅ Pass smoke tests for both agents
- ✅ Follow conventional commit format
- ✅ Have appropriate scope
- ✅ Be atomic (single purpose)
- ✅ Have clear, concise message
- ✅ Not include sensitive information
- ✅ Not include generated files (node_modules, build artifacts)
- ✅ Trigger appropriate CI/CD workflows when pushed
