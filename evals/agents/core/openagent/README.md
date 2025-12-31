# OpenAgent (Core Orchestrator) Test Suite

## Overview

Test suite for the core orchestrator agent (formerly `openagent`).

**Agent Path**: `core/openagent`  
**Agent File**: `.opencode/agent/core/openagent.md`

## Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Smoke | 1 | ✅ Ready |
| Critical Rules | Inherited from legacy | 🔄 Migration pending |
| Workflow | Inherited from legacy | 🔄 Migration pending |
| Integration | Inherited from legacy | 🔄 Migration pending |

## Running Tests

```bash
cd evals/framework

# Run all tests
npm run eval:sdk -- --agent=core/openagent

# Run smoke test only
npm run eval:sdk -- --agent=core/openagent --pattern="smoke-test.yaml"
```

## Migration Notes

This is the new category-based structure for OpenAgent tests. The legacy tests in `evals/agents/openagent/` will be gradually migrated here.

**Backward Compatibility**: The old agent path `openagent` is still supported and will resolve to `core/openagent`.
