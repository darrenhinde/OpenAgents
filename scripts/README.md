# Scripts

This directory contains utility scripts for the OpenAgents system.

## Available Scripts

### Testing

- **`test.sh`** - Main test runner with multi-agent support
  - Run all tests: `./scripts/test.sh openagent`
  - Run core tests: `./scripts/test.sh openagent --core` (7 tests, ~5-8 min)
  - Run with specific model: `./scripts/test.sh openagent opencode/grok-code-fast`
  - Debug mode: `./scripts/test.sh openagent --core --debug`

See `tests/` subdirectory for installer test scripts.

### Component Management

- `register-component.sh` - Register a new component in the registry
- `validate-component.sh` - Validate component structure and metadata

### Session Management

- `cleanup-stale-sessions.sh` - Remove stale agent sessions older than 24 hours

## Session Cleanup

Agent instances create temporary context files in `.tmp/sessions/{session-id}/` for subagent delegation. These sessions are automatically cleaned up, but you can manually remove stale sessions:

```bash
# Clean up sessions older than 24 hours
./scripts/cleanup-stale-sessions.sh

# Or manually delete all sessions
rm -rf .tmp/sessions/
```

Sessions are safe to delete anytime - they only contain temporary context files for agent coordination.

## Usage Examples

### Run Tests

```bash
# Run core test suite (fast, 7 tests, ~5-8 min)
./scripts/test.sh openagent --core

# Run all tests for OpenAgent
./scripts/test.sh openagent

# Run tests with specific model
./scripts/test.sh openagent anthropic/claude-sonnet-4-5

# Run core tests with debug mode
./scripts/test.sh openagent --core --debug
```

### Register a Component
```bash
./scripts/register-component.sh path/to/component
```

### Validate a Component
```bash
./scripts/validate-component.sh path/to/component
```

### Clean Stale Sessions
```bash
./scripts/cleanup-stale-sessions.sh
```

---

## Core Test Suite

The **core test suite** is a subset of 7 carefully selected tests that provide ~85% coverage of critical OpenAgent functionality in just 5-8 minutes.

### Why Use Core Tests?

- ✅ **Fast feedback** - 5-8 minutes vs 40-80 minutes for full suite
- ✅ **Prompt iteration** - Quick validation when updating agent prompts
- ✅ **Development** - Fast validation during development cycles
- ✅ **Pre-commit** - Quick checks before committing changes

### What's Covered?

1. **Approval Gate** - Critical safety rule
2. **Context Loading (Simple)** - Most common use case
3. **Context Loading (Multi-Turn)** - Complex scenarios
4. **Stop on Failure** - Error handling
5. **Simple Task** - No unnecessary delegation
6. **Subagent Delegation** - Proper delegation when needed
7. **Tool Usage** - Best practices

### When to Use Full Suite?

Use the full test suite (71 tests) for:
- 🔬 Release validation
- 🔬 Comprehensive testing
- 🔬 Edge case coverage
- 🔬 Regression testing

See `evals/agents/openagent/CORE_TESTS.md` for detailed documentation.
