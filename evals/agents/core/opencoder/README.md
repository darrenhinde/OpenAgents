# OpenCoder (Core Development Agent) Test Suite

## Overview

Test suite for the core development agent (formerly `opencoder`).

**Agent Path**: `core/opencoder`  
**Agent File**: `.opencode/agent/core/opencoder.md`

## Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Smoke | 1 | ✅ Ready |
| Context Loading | Inherited from legacy | 🔄 Migration pending |
| Planning | Inherited from legacy | 🔄 Migration pending |
| Implementation | Inherited from legacy | 🔄 Migration pending |
| Delegation | Inherited from legacy | 🔄 Migration pending |

## Running Tests

```bash
cd evals/framework

# Run all tests
npm run eval:sdk -- --agent=core/opencoder

# Run smoke test only
npm run eval:sdk -- --agent=core/opencoder --pattern="smoke-test.yaml"
```

## Migration Notes

This is the new category-based structure for OpenCoder tests. The legacy tests in `evals/agents/opencoder/` will be gradually migrated here.

**Backward Compatibility**: The old agent path `opencoder` is still supported and will resolve to `core/opencoder`.
