# Getting Started with Abilities

Abilities are enforced, validated workflows that guarantee step execution. Unlike skills which LLMs can ignore, abilities enforce execution order via hooks.

## Quick Start

### 1. Create Your First Ability

Create `.opencode/abilities/my-first/ability.yaml`:

```yaml
name: my-first
description: My first ability

steps:
  - id: greet
    type: script
    run: echo "Hello from abilities!"
```

### 2. Run It

```bash
# In OpenCode CLI
/ability run my-first

# Or via the SDK
import { createAbilitiesSDK } from '@openagents/plugin-abilities/sdk'

const sdk = createAbilitiesSDK({ projectDir: '.opencode/abilities' })
const result = await sdk.execute('my-first')
console.log(result.formatted)
```

## Adding Inputs

```yaml
name: greet
description: Greeting with custom name

inputs:
  name:
    type: string
    required: true
    default: "World"

steps:
  - id: greet
    type: script
    run: echo "Hello {{inputs.name}}!"
```

Usage: `/ability run greet --name=Alice`

## Step Types

### Script Steps

Run shell commands deterministically:

```yaml
- id: test
  type: script
  run: npm test
  validation:
    exit_code: 0
```

### Agent Steps

Invoke other agents:

```yaml
- id: review
  type: agent
  agent: reviewer
  prompt: "Review the changes for security issues"
```

### Skill Steps

Load existing skills:

```yaml
- id: docs
  type: skill
  skill: generate-docs
```

### Approval Steps

Request user approval:

```yaml
- id: confirm
  type: approval
  prompt: "Ready to deploy to production?"
```

### Workflow Steps

Call nested abilities:

```yaml
- id: setup
  type: workflow
  workflow: setup-environment
```

## Step Dependencies

Use `needs` to define execution order:

```yaml
steps:
  - id: test
    type: script
    run: npm test

  - id: build
    type: script
    run: npm run build
    needs: [test]  # Runs after test

  - id: deploy
    type: script
    run: ./deploy.sh
    needs: [build]  # Runs after build
```

## Conditional Execution

Use `when` to conditionally skip steps:

```yaml
- id: deploy-prod
  type: script
  run: ./deploy.sh prod
  when: inputs.environment == "production"
```

## Enforcement Modes

Configure in `opencode.json`:

```json
{
  "abilities": {
    "enforcement": "strict"
  }
}
```

| Mode | Behavior |
|------|----------|
| `strict` | Block ALL tools outside current step |
| `normal` | Block destructive tools, warn on others |
| `loose` | Advisory only |

## Auto-Triggering

Define keywords to auto-detect abilities:

```yaml
name: deploy
triggers:
  keywords:
    - "deploy"
    - "ship it"
```

When a user says "deploy to production", the ability is suggested automatically.

## Next Steps

- [YAML Reference](./YAML_REFERENCE.md) - Complete ability format documentation
- [SDK Reference](./SDK_REFERENCE.md) - Programmatic API
