# Golden Test Suite

A curated set of 8 tests that validate core agent behaviors. These tests are:

- **Safe** - All operations are read-only or write to `evals/test_tmp/` (gitignored)
- **Agent-Agnostic** - Work with any agent, not tied to specific implementations
- **Fast** - Complete in ~5-10 minutes total
- **Reliable** - Designed to pass consistently

## Tests

| # | Test | Behavior Validated | Evaluator(s) |
|---|------|-------------------|--------------|
| 01 | Smoke Test | Basic read operation | behavior |
| 02 | Context Loading | Agent reads context before answering | context-loading |
| 03 | Read Before Write | Agent inspects before modifying | execution-balance |
| 04 | Write With Approval | Agent asks before writing | approval-gate |
| 05 | Multi-Turn Context | Agent remembers conversation | behavior |
| 06 | Task Breakdown | Agent reads standards before implementing | context-loading |
| 07 | Tool Selection | Agent uses dedicated tools (not bash) | tool-usage |
| 08 | Error Handling | Agent handles errors gracefully | behavior |

## Running the Golden Suite

```bash
# Run all golden tests for openagent
npm run eval:sdk -- --agent=openagent --pattern="**/golden/*.yaml"

# Run all golden tests for any agent
npm run eval:sdk -- --agent=<agent-name> --pattern="**/golden/*.yaml"

# Run with debug output
npm run eval:sdk -- --agent=openagent --pattern="**/golden/*.yaml" --debug

# Run a specific golden test
npm run eval:sdk -- --agent=openagent --pattern="**/golden/01-smoke-test.yaml"
```

## Expected Results

All 8 tests should pass for a well-behaved agent. If tests fail:

- **01 fails**: Basic infrastructure issue - check agent/server setup
- **02 fails**: Agent doesn't load context - check context-loading behavior
- **03 fails**: Agent writes without reading - check execution-balance
- **04 fails**: Agent doesn't ask approval - check approval workflow
- **05 fails**: Agent loses context - check conversation handling
- **06 fails**: Agent doesn't read standards - check context-loading
- **07 fails**: Agent uses bash antipatterns - check tool selection
- **08 fails**: Agent crashes on errors - check error handling

## Adding New Golden Tests

Golden tests should be:

1. **Essential** - Test a core behavior that all agents need
2. **Safe** - No dangerous operations, writes only to test_tmp/
3. **Reliable** - Pass consistently across runs
4. **Fast** - Complete in under 2 minutes each
5. **Clear** - Easy to understand what's being tested
