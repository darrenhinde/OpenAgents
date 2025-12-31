# System Builder Test Suite

## Overview

Test suite for the system builder agent.

**Agent Path**: `meta/system-builder`  
**Agent File**: `.opencode/agent/meta/system-builder.md`

## Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Smoke | 1 | ✅ Ready |
| System Generation | 0 | 🚧 Not yet created |

## Running Tests

```bash
cd evals/framework

# Run all tests
npm run eval:sdk -- --agent=meta/system-builder

# Run smoke test only
npm run eval:sdk -- --agent=meta/system-builder --pattern="smoke-test.yaml"
```

## Test Results

Not yet tested.
