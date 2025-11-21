# OpenAgent Evaluation Tests

## Overview

Test suite for validating OpenAgent behavior against defined standards and critical rules.

## OpenAgent Rules

OpenAgent must follow these critical rules:

1. **Approval Gates** - Request approval before bash/write/edit/task operations
2. **Context Loading** - Load required context files before execution
3. **Delegation** - Delegate when 4+ files or complex tasks
4. **Stop on Failure** - Never auto-fix errors, always report first
5. **Tool Selection** - Use appropriate tools for tasks

See: [OpenAgent Specification](../../../.opencode/agent/openagent.md)

## Test Categories

### Conversational
Simple questions that require no execution:
- Code explanations
- Informational queries
- Analysis requests

**Expected Behavior:**
- No execution tools
- No approval required
- Response provided

### Task
Simple file operations:
- File creation
- File editing
- Simple changes

**Expected Behavior:**
- Approval requested
- Appropriate tool selection
- Context loading (if needed)

### Complex
Multi-file features and complex tasks:
- Architecture changes
- Feature implementation
- Complex refactoring

**Expected Behavior:**
- Approval requested
- Context loaded
- Delegation used (4+ files)
- Appropriate tool selection

### Edge Cases
Error handling and special scenarios:
- Permission denials
- Missing files
- Error recovery
- Invalid inputs

**Expected Behavior:**
- Stop on failure
- Report errors (no auto-fix)
- Graceful handling

## Test Cases

Test cases are defined in YAML files in `test-cases/`:

- `approval-gates.yaml` - Approval gate enforcement tests
- `context-loading.yaml` - Context loading compliance tests
- `delegation.yaml` - Delegation appropriateness tests
- `tool-usage.yaml` - Tool selection tests
- `edge-cases.yaml` - Error handling and special scenarios

## Running Tests

```bash
# Run all OpenAgent tests
cd evals/framework
npm run eval -- --agent openagent --all

# Run specific test category
npm run eval -- --agent openagent --test approval-gates

# Run single test case
npm run eval -- --agent openagent --test approval-gates --case file-creation-with-approval

# Analyze specific session
npm run eval -- --agent openagent --session ses_xxxxx
```

## Test Results

Results are stored in `evals/results/YYYY-MM-DD/openagent/`:

```
results/2025-11-21/openagent/
├── summary.json          # Overall summary
├── approval-gates.json   # Approval gate results
├── context-loading.json  # Context loading results
├── delegation.json       # Delegation results
└── report.md            # Human-readable report
```

## Configuration

Configuration is in `config.yaml`:

```yaml
agent: openagent
agent_path: ../../../.opencode/agent/openagent.md
test_cases_path: ./test-cases
sessions_path: ./sessions
evaluators:
  - approval-gate
  - context-loading
  - delegation
  - tool-usage
pass_threshold: 75
scoring:
  approval_gate: 40
  context_loading: 40
  delegation: 10
  tool_usage: 10
```

## Recorded Sessions

The `sessions/` directory contains recorded test sessions for regression testing:

```
sessions/
├── simple-question/
│   ├── session.json
│   └── expected.yaml
├── file-creation/
│   ├── session.json
│   └── expected.yaml
└── complex-feature/
    ├── session.json
    └── expected.yaml
```

## Success Criteria

### Overall
- **Pass Rate:** ≥ 90% of tests pass
- **Average Score:** ≥ 85/100
- **Critical Violations:** 0

### Per Evaluator
- **Approval Gates:** 100% compliance (critical)
- **Context Loading:** ≥ 90% compliance
- **Delegation:** ≥ 80% compliance
- **Tool Usage:** ≥ 85% compliance

## Adding New Tests

1. Create test case in appropriate YAML file:

```yaml
- id: my-new-test
  name: "My New Test"
  description: "Test description"
  category: task
  input: "User prompt"
  expected_behavior:
    approval_requested: true
    tool_used: write
  evaluators:
    - approval-gate
    - tool-usage
  pass_threshold: 75
```

2. (Optional) Record a session for regression testing:

```bash
# Run OpenCode with the test prompt
opencode --agent openagent
> "User prompt"

# Copy session to sessions/
cp ~/.local/share/opencode/project/.../session/info/ses_xxxxx.json \
   sessions/my-new-test/session.json
```

3. Run the test:

```bash
npm run eval -- --agent openagent --test my-new-test
```

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main
- Nightly builds

See: `.github/workflows/eval-openagent.yml`

## Related Documentation

- [Evaluation Framework](../../framework/README.md)
- [OpenAgent Specification](../../../.opencode/agent/openagent.md)
- [OpenCode Logging System](../../../dev/ai-tools/opencode/logging-and-session-storage.md)

## Metrics

Track these metrics over time:
- Pass rate trend
- Average score trend
- Violation frequency
- Model performance
- Cost per test
