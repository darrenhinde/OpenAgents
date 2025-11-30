# OpenAgent Test Suite

**Total Tests**: 22 (migrated) + new tests to be added  
**Estimated Full Suite Runtime**: 40-80 minutes  
**Last Updated**: Nov 26, 2024

## Quick Start

```bash

# Run core tests (RECOMMENDED - 7 tests, ~5-8 min)
npm run test:core

# Run all tests (full suite - 71 tests, ~40-80 min)
npm run test:openagent

# Run critical tests only

npm run eval:sdk -- --agent=openagent --pattern="01-critical-rules/**/*.yaml"

# Run specific category
npm run eval:sdk -- --agent=openagent --pattern="01-critical-rules/approval-gate/*.yaml"

# Debug mode (keeps sessions, verbose output)
npm run eval:sdk -- --agent=openagent --debug
```

---

## Core Test Suite ⚡

**NEW**: We now have a **core test suite** with 7 carefully selected tests that provide ~85% coverage in just 5-8 minutes!

### Quick Commands

```bash
# NPM (from root)
npm run test:core

# Script
./scripts/test.sh openagent --core

# Direct
cd evals/framework && npm run eval:sdk:core -- --agent=openagent
```

### What's Included?

| # | Test | Category | Time | Priority |
|---|------|----------|------|----------|
| 1 | Approval Gate | Critical Rules | 30-60s | ⚡ CRITICAL |
| 2 | Context Loading (Simple) | Critical Rules | 60-90s | ⚡ CRITICAL |
| 3 | Context Loading (Multi-Turn) | Critical Rules | 120-180s | 🔥 HIGH |
| 4 | Stop on Failure | Critical Rules | 60-90s | ⚡ CRITICAL |
| 5 | Simple Task (No Delegation) | Delegation | 30-60s | 🔥 HIGH |
| 6 | Subagent Delegation | Integration | 90-120s | 🔥 HIGH |
| 7 | Tool Usage | Tool Usage | 30-60s | 📋 MEDIUM |

**Total Runtime**: 5-8 minutes  
**Coverage**: ~85% of critical functionality

### When to Use Core vs Full?

**Use Core Suite** (7 tests, 5-8 min):
- ✅ Prompt iteration and testing
- ✅ Development and quick validation
- ✅ Pre-commit hooks
- ✅ PR validation in CI/CD

**Use Full Suite** (71 tests, 40-80 min):
- 🔬 Release validation
- 🔬 Comprehensive testing
- 🔬 Edge case coverage
- 🔬 Regression testing

**See**: `../CORE_TESTS.md` for detailed documentation

---


## Folder Structure

```
tests/
├── 01-critical-rules/          # MUST PASS - Core safety requirements
│   ├── approval-gate/          # 3 tests - Approval before execution
│   ├── context-loading/        # 11 tests - Load context before execution
│   ├── stop-on-failure/        # 1 test - Stop on errors, don't auto-fix
│   ├── report-first/           # 0 tests - TODO: Add error reporting workflow
│   └── confirm-cleanup/        # 0 tests - TODO: Add cleanup confirmation
│
├── 02-workflow-stages/         # Workflow stage validation
│   ├── analyze/                # 0 tests - TODO
│   ├── approve/                # 0 tests - TODO
│   ├── execute/                # 2 tests - Task execution
│   ├── validate/               # 0 tests - TODO
│   ├── summarize/              # 0 tests - TODO
│   └── confirm/                # 0 tests - TODO
│
├── 03-delegation/              # Delegation scenarios
│   ├── scale/                  # 0 tests - TODO: 4+ files delegation
│   ├── expertise/              # 0 tests - TODO: Specialized knowledge
│   ├── complexity/             # 0 tests - TODO: Multi-step dependencies
│   ├── review/                 # 0 tests - TODO: Multi-component review
│   └── context-bundles/        # 0 tests - TODO: Bundle creation/passing
│
├── 04-execution-paths/         # Conversational vs Task paths
│   ├── conversational/         # 0 tests - (covered in approval-gate)
│   ├── task/                   # 2 tests - Task execution path
│   └── hybrid/                 # 0 tests - TODO
│
├── 05-edge-cases/              # Edge cases and boundaries
│   ├── tier-conflicts/         # 0 tests - TODO: Tier 1 vs 2/3 conflicts
│   ├── boundary/               # 0 tests - TODO: Boundary conditions
│   ├── overrides/              # 1 test - "Just do it" override
│   └── negative/               # 0 tests - TODO: Negative tests
│
└── 06-integration/             # Complex multi-turn scenarios
    ├── simple/                 # 0 tests - TODO: 1-2 turns
    ├── medium/                 # 2 tests - 3-5 turns
    └── complex/                # 0 tests - TODO: 6+ turns
```

## Test Categories

### 01-critical-rules/ (15 tests)
**Priority**: HIGHEST  
**Timeout**: 60-120s  
**Must Pass**: YES

Core safety requirements from OpenAgent prompt:
- ✅ **approval-gate** (3 tests) - Request approval before execution
- ✅ **context-loading** (11 tests) - Load context files before execution
- ✅ **stop-on-failure** (1 test) - Stop on errors, don't auto-fix
- ❌ **report-first** (0 tests) - Error reporting workflow
- ❌ **confirm-cleanup** (0 tests) - Cleanup confirmation

**Run**: `npm run eval:sdk -- --agent=openagent --pattern="01-critical-rules/**/*.yaml"`

### 02-workflow-stages/ (2 tests)
**Priority**: HIGH  
**Timeout**: 60-180s  
**Must Pass**: SHOULD

Validates workflow stage progression:
- Analyze → Approve → Execute → Validate → Summarize → Confirm

**Run**: `npm run eval:sdk -- --agent=openagent --pattern="02-workflow-stages/**/*.yaml"`

### 03-delegation/ (0 tests)
**Priority**: MEDIUM  
**Timeout**: 90-180s  
**Must Pass**: SHOULD

Delegation scenarios (4+ files, specialized knowledge, etc.)

**Run**: `npm run eval:sdk -- --agent=openagent --pattern="03-delegation/**/*.yaml"`

### 04-execution-paths/ (2 tests)
**Priority**: MEDIUM  
**Timeout**: 30-90s  
**Must Pass**: SHOULD

Conversational vs Task execution paths.

**Run**: `npm run eval:sdk -- --agent=openagent --pattern="04-execution-paths/**/*.yaml"`

### 05-edge-cases/ (1 test)
**Priority**: MEDIUM  
**Timeout**: 60-120s  
**Must Pass**: SHOULD

Edge cases, boundaries, overrides, negative tests.

**Run**: `npm run eval:sdk -- --agent=openagent --pattern="05-edge-cases/**/*.yaml"`

### 06-integration/ (2 tests)
**Priority**: LOW  
**Timeout**: 120-300s  
**Must Pass**: NICE TO HAVE

Complex multi-turn scenarios testing multiple features together.

**Run**: `npm run eval:sdk -- --agent=openagent --pattern="06-integration/**/*.yaml"`

## Test Execution Order

Tests run in priority order:

1. **01-critical-rules/** (5-10 min) - Fast, foundational
2. **02-workflow-stages/** (5-10 min) - Medium speed
3. **04-execution-paths/** (2-5 min) - Fast
4. **05-edge-cases/** (5-10 min) - Medium speed
5. **03-delegation/** (10-15 min) - Slower, involves subagents
6. **06-integration/** (15-30 min) - Slowest, complex scenarios

## Coverage Analysis

### Current Coverage (22 tests)

**Critical Rules**: 50% (2/4 tested)
- ✅ approval_gate (3 tests)
- ⚠️ stop_on_failure (1 test - partial)
- ❌ report_first (0 tests)
- ❌ confirm_cleanup (0 tests)

**Context Loading**: 100% (5/5 task types)
- ✅ code.md (2 tests)
- ✅ docs.md (2 tests)
- ✅ tests.md (2 tests)
- ✅ delegation.md (1 test)
- ✅ review.md (1 test)
- ✅ Multi-context (3 tests)

**Delegation Rules**: 0% (0/7 tested)
- ❌ 4+ files
- ❌ specialized knowledge
- ❌ multi-component review
- ❌ complexity
- ❌ fresh eyes
- ❌ simulation
- ❌ user request

**Workflow Stages**: 17% (1/6 tested)
- ❌ Analyze
- ❌ Approve
- ⚠️ Execute (2 tests - partial)
- ❌ Validate
- ❌ Summarize
- ❌ Confirm

### Target Coverage: 80%+

## Missing Tests (High Priority)

### Critical Rules (MUST ADD)
1. `01-critical-rules/report-first/01-error-report-workflow.yaml`
2. `01-critical-rules/report-first/02-auto-fix-negative.yaml`
3. `01-critical-rules/confirm-cleanup/01-session-cleanup.yaml`
4. `01-critical-rules/confirm-cleanup/02-temp-files-cleanup.yaml`

### Delegation (SHOULD ADD)
5. `03-delegation/scale/01-exactly-4-files.yaml`
6. `03-delegation/scale/02-3-files-negative.yaml`
7. `03-delegation/expertise/01-security-audit.yaml`
8. `03-delegation/context-bundles/01-bundle-creation.yaml`

### Workflow Stages (SHOULD ADD)
9. `02-workflow-stages/validate/01-quality-check.yaml`
10. `02-workflow-stages/validate/02-additional-checks-prompt.yaml`
11. `02-workflow-stages/summarize/01-format-validation.yaml`

### Edge Cases (NICE TO HAVE)
12. `05-edge-cases/boundary/01-bash-ls-approval.yaml`
13. `05-edge-cases/tier-conflicts/01-context-override-negative.yaml`
14. `05-edge-cases/negative/01-skip-context-negative.yaml`

## File Creation Rules

**All tests MUST use safe paths:**

```yaml
# ✅ CORRECT - Test files
prompt: |
  Create a file at evals/test_tmp/test-output.txt

# ✅ CORRECT - Agent creates these automatically
.tmp/sessions/{session-id}/
.tmp/context/{session-id}/bundle.md

# ❌ WRONG - Don't use these
/tmp/
~/
/Users/
```

## Timeout Guidelines

| Category | Simple | Multi-turn | Complex |
|----------|--------|------------|---------|
| Critical Rules | 60s | 120s | - |
| Workflow Stages | 60s | 120s | 180s |
| Delegation | 90s | 120s | 180s |
| Execution Paths | 30s | 60s | 90s |
| Edge Cases | 60s | 120s | - |
| Integration | 120s | 180s | 300s |

## Migration Status

✅ **Migration Complete** (Nov 26, 2024)
- 22 tests migrated to new structure
- Original folders preserved for verification
- All tests copied (not moved)

**Next Steps**:
1. ✅ Verify migrated tests run correctly
2. ⬜ Add missing critical tests (Priority 1)
3. ⬜ Add delegation tests (Priority 2)
4. ⬜ Remove old folders after verification
5. ⬜ Update CI/CD to use new structure

**To remove old folders** (after verification):
```bash
cd evals/agents/openagent/tests
rm -rf business/ context-loading/ developer/ edge-case/
```

## CI/CD Integration

### Pre-commit Hook
```bash
# Run critical tests only (fast)
npm run eval:sdk -- --agent=openagent --pattern="01-critical-rules/**/*.yaml"
```

### PR Validation
```bash
# Run critical + workflow tests
npm run eval:sdk -- --agent=openagent --pattern="0[1-2]-*/**/*.yaml"
```

### Release Validation
```bash
# Run full suite
npm run eval:sdk -- --agent=openagent
```

## Debugging Failed Tests

1. **Run with --debug flag**:
   ```bash
   npm run eval:sdk -- --agent=openagent --pattern="path/to/test.yaml" --debug
   ```

2. **Check session files** (preserved in debug mode):
   ```bash
   ls ~/.local/share/opencode/storage/session/
   ```

3. **Review event timeline** in test output

4. **Check test_tmp/** for created files:
   ```bash
   ls -la evals/test_tmp/
   ```

## Contributing

### Adding New Tests

1. **Choose the right category** based on what you're testing
2. **Follow naming convention**: `{sequence}-{description}-{type}.yaml`
3. **Set appropriate timeout** based on category guidelines
4. **Use safe file paths** (evals/test_tmp/)
5. **Add to category README** if introducing new pattern

### Test Template

```yaml
id: category-description-001
name: Human Readable Test Name
description: |
  What this test validates and why it matters.
  
  Expected behavior:
  - Step 1
  - Step 2

category: category-name
agent: openagent
model: anthropic/claude-sonnet-4-5

prompt: |
  Test prompt here

behavior:
  mustUseTools: [read, write]
  requiresApproval: true
  requiresContext: true
  minToolCalls: 2

expectedViolations:
  - rule: approval-gate
    shouldViolate: false
    severity: error
    description: Must ask approval before writing

approvalStrategy:
  type: auto-approve

timeout: 60000

tags:
  - tag1
  - tag2
```

## Resources

- **OpenAgent Prompt**: `.opencode/agent/openagent.md`
- **Test Framework**: `evals/framework/`
- **How Tests Work**: `evals/HOW_TESTS_WORK.md`
- **OpenAgent Rules**: `evals/agents/openagent/docs/OPENAGENT_RULES.md`
- **Folder Structure**: `FOLDER_STRUCTURE.md` (this directory)
