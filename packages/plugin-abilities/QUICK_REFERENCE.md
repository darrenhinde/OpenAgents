# Abilities Plugin - Quick Reference (Minimal Version)

## What Is This?

A **minimal** implementation of enforced workflows for OpenCode agents.

**Core idea:** Force AI to follow predefined steps instead of improvising.

## Quick Start

### 1. Create an Ability

```yaml
# .opencode/abilities/deploy.yaml
name: deploy
description: Deploy with tests

inputs:
  version:
    type: string
    required: true

steps:
  - id: test
    type: script
    run: npm test
    validation:
      exit_code: 0

  - id: deploy
    type: script
    needs: [test]
    run: ./deploy.sh {{inputs.version}}
```

### 2. Run It

```javascript
ability.run({ name: "deploy", inputs: { version: "v1.0.0" } })
```

### 3. What Happens

1. ✅ Step "test" runs: `npm test`
2. ⏸️ **All other tools blocked** until test completes
3. ✅ Step "deploy" runs: `./deploy.sh v1.0.0`
4. ✅ Status: completed

## Available Tools

### `ability.list`
List all loaded abilities
```javascript
ability.list()
// Returns: "- test: Minimal test ability (3 steps)"
```

### `ability.run`
Execute an ability
```javascript
ability.run({ 
  name: "test",
  inputs: { message: "Hello" }
})
```

### `ability.status`
Check current execution
```javascript
ability.status()
// Returns: { status: "running", currentStep: "step2", progress: "1/3" }
```

### `ability.cancel`
Stop active execution
```javascript
ability.cancel()
// Returns: { status: "cancelled" }
```

## Step Types (Minimal Version)

### Script Step
Runs shell commands

```yaml
- id: build
  type: script
  run: npm run build
  validation:
    exit_code: 0
```

**Features:**
- Sequential execution
- Exit code validation
- Input variable interpolation: `{{inputs.version}}`
- Dependency ordering: `needs: [test]`

## Enforcement

### Tool Blocking

When a script step is running, **all tools are blocked** except:
- `ability.list`
- `ability.status`
- `ability.cancel`
- `read`, `glob`, `grep` (read-only)

**Example:**
```
ability.run({ name: "test" })
[while running]
bash({ command: "ls" })  // ❌ BLOCKED
```

### Context Injection

Every chat message shows ability status:

```
🔄 Active Ability: test
Progress: 1/3 steps completed
Current Step: step2
⚠️ ENFORCEMENT ACTIVE
```

## File Structure

```
.opencode/
  abilities/
    test.yaml          # Your ability
    deploy.yaml        # Another ability
```

## Ability YAML Schema

```yaml
name: string              # Required: unique name
description: string       # Required: what it does

inputs:                   # Optional: input parameters
  param_name:
    type: string|number|boolean
    required: boolean
    default: any

steps:                    # Required: at least 1 step
  - id: string           # Required: unique step ID
    type: script         # Required: only 'script' in minimal version
    description: string  # Optional: what this step does
    run: string          # Required: shell command
    needs: [step_ids]    # Optional: dependencies
    validation:          # Optional: validation rules
      exit_code: number  # Expected exit code (default: any)
```

## Input Interpolation

Use `{{inputs.name}}` in commands:

```yaml
inputs:
  version:
    type: string
    required: true

steps:
  - id: deploy
    run: ./deploy.sh {{inputs.version}}
```

## Step Dependencies

Use `needs` to order steps:

```yaml
steps:
  - id: test
    run: npm test

  - id: build
    needs: [test]      # Runs AFTER test
    run: npm run build

  - id: deploy
    needs: [build]     # Runs AFTER build
    run: ./deploy.sh
```

## Validation

### Input Validation

```yaml
inputs:
  count:
    type: number
    required: true
```

If missing: ❌ `Input validation failed: count is required`

### Exit Code Validation

```yaml
steps:
  - id: test
    run: npm test
    validation:
      exit_code: 0
```

If fails: ❌ `Exit code 1, expected 0`

## Testing

### Quick Test

```bash
cd packages/plugin-abilities
bun test-minimal.ts
```

### Manual Test

```yaml
# .opencode/abilities/hello.yaml
name: hello
description: Test ability

steps:
  - id: greet
    type: script
    run: echo "Hello World"
```

```javascript
ability.run({ name: "hello" })
// Output: ✅ greet: completed
//         Output: Hello World
```

## Limitations (Minimal Version)

**Not Included:**
- ❌ Agent steps (calling other agents)
- ❌ Skill steps (loading skills)
- ❌ Approval steps (human gates)
- ❌ Workflow steps (nested abilities)
- ❌ Session management (multi-user)
- ❌ Triggers (auto-detection)
- ❌ Context passing (step outputs → next step)

**These will be added after core is validated.**

## Troubleshooting

### "No abilities loaded"
- Check `.opencode/abilities/` directory exists
- Check YAML files are valid
- Check plugin is configured in `opencode.json`

### "Tool blocked during script step"
- This is **expected** - enforcement is working!
- Wait for step to complete
- Or use `ability.cancel()` to stop

### "Input validation failed"
- Check required inputs are provided
- Check input types match (string/number/boolean)

### "Already executing ability"
- Only one ability can run at a time (minimal version)
- Use `ability.cancel()` to stop current execution

## Next Steps

Once minimal version is validated:

1. Add agent steps (call other agents)
2. Add session scoping (multi-user)
3. Add context passing (step outputs)
4. Add triggers (auto-detection)
5. Add approval steps (human gates)
6. Add workflow steps (nested abilities)

## Architecture

```
User Request
    ↓
ability.run tool
    ↓
ExecutionManager.execute()
    ↓
For each step:
  ├─ Set as currentStep
  ├─ Block other tools (tool.execute.before hook)
  ├─ Inject context (chat.message hook)
  ├─ Execute script
  ├─ Validate result
  └─ Continue or fail
    ↓
Return execution result
```

## Key Files

- `src/opencode-plugin.ts` - Plugin hooks and tools
- `src/executor/index.ts` - Script execution
- `src/executor/execution-manager.ts` - State tracking
- `src/types/index.ts` - TypeScript types
- `examples/test/ability.yaml` - Example ability

## Support

See `MINIMAL_TEST.md` for detailed testing guide.
See `SIMPLIFICATION_SUMMARY.md` for what changed.
