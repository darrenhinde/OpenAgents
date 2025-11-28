# OpenAgent Core Test Suite

**Purpose**: Fast validation of critical OpenAgent functionality  
**Tests**: 7 core tests  
**Runtime**: 5-8 minutes  
**Coverage**: ~85% of critical functionality

---

## Quick Start

```bash
# Run core tests (recommended for development)
npm run test:core

# Run with specific model
npm run test:openagent:core -- --model=anthropic/claude-sonnet-4-5

# Using test script
./scripts/test.sh openagent --core

# Direct execution
cd evals/framework && npm run eval:sdk:core -- --agent=openagent
```

---

## The 7 Core Tests

### 1. Approval Gate ⚡ CRITICAL
**File**: `01-critical-rules/approval-gate/05-approval-before-execution-positive.yaml`  
**Time**: 30-60s  
**Tests**: Approval before execution workflow

**Why Critical**: This is the #1 safety rule - agent must NEVER execute without approval.

**What it validates**:
- ✅ Agent asks for approval before writing files
- ✅ User approves the plan
- ✅ Agent executes only after approval
- ✅ Timing: approval timestamp < execution timestamp

---

### 2. Context Loading (Simple) ⚡ CRITICAL
**File**: `01-critical-rules/context-loading/01-code-task.yaml`  
**Time**: 60-90s  
**Tests**: Context loading for code tasks

**Why Critical**: Agent must load relevant context before executing tasks.

**What it validates**:
- ✅ Agent loads `.opencode/context/core/standards/code.md` before writing code
- ✅ Context loaded BEFORE execution (timing validation)
- ✅ Proper tool usage (read → write)

---

### 3. Context Loading (Multi-Turn) 🔥 HIGH PRIORITY
**File**: `01-critical-rules/context-loading/09-multi-standards-to-docs.yaml`  
**Time**: 120-180s  
**Tests**: Multi-turn conversation with multiple context files

**Why Important**: Validates complex real-world scenarios with multiple context files.

**What it validates**:
- ✅ Turn 1: Loads standards context
- ✅ Turn 2: Loads documentation context
- ✅ Turn 3: References both contexts
- ✅ Multi-turn approval workflow
- ✅ Context accumulation across turns

---

### 4. Stop on Failure ⚡ CRITICAL
**File**: `01-critical-rules/stop-on-failure/02-stop-and-report-positive.yaml`  
**Time**: 60-90s  
**Tests**: Error handling - stop and report, don't auto-fix

**Why Critical**: Agent must NEVER auto-fix errors without approval.

**What it validates**:
- ✅ Agent runs tests
- ✅ Tests fail
- ✅ Agent STOPS (doesn't continue)
- ✅ Agent REPORTS error
- ✅ Agent PROPOSES fix
- ✅ Agent WAITS for approval

---

### 5. Simple Task (No Delegation) 🔥 HIGH PRIORITY
**File**: `08-delegation/simple-task-direct.yaml`  
**Time**: 30-60s  
**Tests**: Agent handles simple tasks directly

**Why Important**: Prevents unnecessary delegation overhead for simple tasks.

**What it validates**:
- ✅ Simple tasks executed directly (no task tool)
- ✅ No unnecessary subagent delegation
- ✅ Efficient execution path

---

### 6. Subagent Delegation 🔥 HIGH PRIORITY
**File**: `06-integration/medium/04-subagent-verification.yaml`  
**Time**: 90-120s  
**Tests**: Subagent delegation for appropriate tasks

**Why Important**: Validates delegation works correctly when needed.

**What it validates**:
- ✅ Agent delegates to appropriate subagent (coder-agent)
- ✅ Subagent executes successfully
- ✅ Subagent uses correct tools (write)
- ✅ Output file created with expected content
- ✅ Delegation workflow completes

---

### 7. Tool Usage 📋 MEDIUM PRIORITY
**File**: `09-tool-usage/dedicated-tools-usage.yaml`  
**Time**: 30-60s  
**Tests**: Proper tool usage patterns

**Why Important**: Ensures agent follows best practices for tool usage.

**What it validates**:
- ✅ Uses `read` tool instead of `cat`
- ✅ Uses `grep` tool instead of `bash grep`
- ✅ Uses `list` tool instead of `ls`
- ✅ Avoids bash antipatterns

---

## Coverage Analysis

### Critical Rules: 4/4 ✅ 100%
1. ✅ **Approval Gate** - Test #1
2. ✅ **Context Loading** - Tests #2, #3
3. ✅ **Stop on Failure** - Test #4
4. ✅ **Report First** - Covered implicitly in Test #4

### Delegation: 2/2 ✅ 100%
1. ✅ **Simple Tasks** - Test #5 (no delegation)
2. ✅ **Complex Tasks** - Test #6 (with delegation)

### Tool Usage: 1/1 ✅ 100%
1. ✅ **Proper Tools** - Test #7

### Multi-Turn: 1/1 ✅ 100%
1. ✅ **Multi-Turn Context** - Test #3

---

## When to Use Each Test Suite

### Smoke Test (1 test, ~30 sec) ⚡ CI/CD

**Use for:**
- ⚡ **CI/CD pipelines** - Fast validation on every PR
- ⚡ **GitHub Actions** - Automated testing
- ⚡ **Quick sanity check** - Verify system is working

**Command:**
```bash
npm run test:ci:openagent
```

**What it tests:**
- Basic approval workflow
- File creation
- Minimal validation (no evaluators for speed)

---

### Core Suite (7 tests, 5-8 min) ✅ Development

**Use for:**
- ✅ **Prompt iteration** - Testing prompt changes
- ✅ **Development** - Quick validation during development
- ✅ **Pre-commit hooks** - Fast feedback before committing
- ✅ **Local testing** - Before pushing to remote

**Command:**
```bash
npm run test:core
```

**What it tests:**
- All 4 critical safety rules
- Delegation logic (simple + complex)
- Tool usage best practices
- Multi-turn conversations

---

### Full Suite (71 tests, 40-80 min) 🔬 Release

**Use for:**
- 🔬 **Release validation** - Before releasing new versions
- 🔬 **Comprehensive testing** - Full coverage needed
- 🔬 **Edge cases** - Testing boundary conditions
- 🔬 **Regression testing** - Ensure nothing broke
- 🔬 **Performance baseline** - Detailed performance metrics

**Command:**
```bash
npm run test:openagent
```

**What it tests:**
- Everything in core suite
- Edge cases and negative tests
- Complex integration scenarios
- Performance and stress tests

---

## Comparison

| Metric | Smoke Test | Core Suite | Full Suite |
|--------|-----------|-----------|-----------|
| **Tests** | 1 | 7 | 71 |
| **Runtime** | ~30 sec | 5-8 min | 40-80 min |
| **Coverage** | ~10% | ~85% | 100% |
| **Tokens** | ~7K | ~50K | ~500K |
| **Use Case** | CI/CD | Development | Release |
| **When** | Every PR | Pre-commit | Before release |

---

## Test Execution Flow

```
1. Approval Gate (30-60s)
   ↓
2. Context Loading - Simple (60-90s)
   ↓
3. Context Loading - Multi-Turn (120-180s)
   ↓
4. Stop on Failure (60-90s)
   ↓
5. Simple Task - No Delegation (30-60s)
   ↓
6. Subagent Delegation (90-120s)
   ↓
7. Tool Usage (30-60s)

Total: ~5-8 minutes
```

---

## Success Criteria

All 7 tests must pass for core suite to be considered successful:

- ✅ **0 violations** of critical rules
- ✅ **0 errors** in test execution
- ✅ **100% pass rate** (7/7 tests)

If any test fails:
1. Review the failure details
2. Check if it's a prompt issue or test issue
3. Fix the issue
4. Re-run core suite
5. Only proceed when all tests pass

---

## Adding Tests to Core Suite

**Guidelines for adding tests to core suite:**

1. **Must be critical** - Tests a fundamental rule or behavior
2. **Must be fast** - Completes in < 3 minutes
3. **Must be stable** - Passes consistently (99%+ reliability)
4. **Must be unique** - Doesn't duplicate existing coverage
5. **Must be representative** - Covers common use cases

**Current limit**: 7-10 tests maximum to keep runtime under 10 minutes

---

## Configuration

Core test configuration is defined in:
```
evals/agents/openagent/config/core-tests.json
```

This file contains:
- Test paths and metadata
- Estimated runtimes
- Coverage analysis
- Usage examples
- Rationale for test selection

---

## Troubleshooting

### Core tests failing after prompt update

1. **Check which test failed**:
   ```bash
   npm run test:openagent:core -- --debug
   ```

2. **Review the failure**:
   - Approval gate failure → Check approval workflow in prompt
   - Context loading failure → Check context loading rules
   - Stop on failure → Check error handling rules
   - Delegation failure → Check delegation criteria

3. **Fix the prompt** and re-run

4. **Verify with full suite** before releasing:
   ```bash
   npm run test:openagent
   ```

### Core tests passing but full suite failing

This indicates:
- Core tests don't cover the failing scenario
- Consider adding the failing test to core suite
- Or, it's an edge case that's acceptable to miss in core

### Core tests too slow

If core tests exceed 10 minutes:
- Check for network issues
- Check for API rate limiting
- Consider reducing timeout values
- Consider removing slowest test

---

## CI/CD Integration

### GitHub Actions (Already Configured) ✅

The repository already has CI/CD configured in `.github/workflows/test-agents.yml`:

**Current Setup:**
- **PR validation**: Runs smoke test (1 test, ~30 sec)
- **Command**: `npm run test:ci:openagent`
- **Fast and efficient** for CI/CD pipelines

**This is the recommended approach** - keep CI/CD fast with smoke tests.

---

### Pre-commit Hook (Recommended)

For local development, use core tests in pre-commit hooks:

```bash
#!/bin/bash
# .git/hooks/pre-commit
npm run test:core || exit 1
```

This gives you comprehensive validation (7 tests) before committing, while CI/CD stays fast.

---

### Alternative CI/CD Strategies

If you want more coverage in CI/CD (not recommended - will be slower):

#### Option 1: Core Tests in CI (5-8 min)
```yaml
name: Core Tests
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run core tests
        run: npm run test:core
```

#### Option 2: Full Suite on Release (40-80 min)
```yaml
name: Full Test Suite
on:
  push:
    tags:
      - 'v*'
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 90
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run full test suite
        run: npm run test:openagent
```

---

### Recommended Strategy

| Stage | Test Suite | Tests | Time | Command |
|-------|-----------|-------|------|---------|
| **CI/CD (PR)** | Smoke | 1 | ~30s | `npm run test:ci:openagent` |
| **Pre-commit** | Core | 7 | 5-8 min | `npm run test:core` |
| **Release** | Full | 71 | 40-80 min | `npm run test:openagent` |

This gives you:
- ⚡ **Fast CI/CD** - Quick feedback on every PR
- ✅ **Comprehensive local testing** - Catch issues before pushing
- 🔬 **Full validation on release** - Ensure quality before shipping

---

## Metrics & Monitoring

Track these metrics for core suite health:

- **Pass rate**: Should be 100% on main branch
- **Runtime**: Should stay under 10 minutes
- **Flakiness**: Should be < 1% (tests should be stable)
- **Coverage**: Should maintain ~85% of critical functionality

---

## Future Enhancements

Potential additions to core suite:

1. **Negative test** - Test that violations are properly caught
2. **Performance test** - Baseline performance metrics
3. **Error recovery** - Test error recovery workflows
4. **Context bundling** - Test context bundle creation

**Note**: Only add if they meet the "Adding Tests" criteria above.

---

## Related Documentation

- **Full Test Suite**: `tests/README.md`
- **Test Framework**: `../../framework/README.md`
- **OpenAgent Rules**: `docs/OPENAGENT_RULES.md`
- **How Tests Work**: `../../HOW_TESTS_WORK.md`

---

**Last Updated**: 2024-11-28  
**Version**: 1.0.0  
**Maintainer**: OpenCode Team
