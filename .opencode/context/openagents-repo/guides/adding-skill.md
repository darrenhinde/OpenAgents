# Guide: Adding a New Skill

**Prerequisites**: Load `plugins/context/capabilities/events_skills.md` first  
**Purpose**: Step-by-step workflow for adding a new skill  
**Related**: See `plugins/context/architecture/overview.md` for plugin concepts

---

## Overview

Adding a new skill involves:
1. Creating the skill directory structure
2. Creating the SKILL.md file
3. Creating the router script (for CLI-based skills)
4. Creating skill content/scripts
5. Registering the skill (if needed)
6. Testing the skill

**Time**: ~10-15 minutes

---

## Step 1: Create Skill Directory

### Choose Skill Name

Skill names should be:
- **kebab-case**: `task-management`, `brand-guidelines`, `api-reference`
- **Descriptive**: Clear indication of what the skill provides
- **Short**: Avoid overly long names (max 3-4 words)

### Create Directory Structure

```bash
# Create skill directory
mkdir -p .opencode/skill/{skill-name}

# Create subdirectories as needed
mkdir -p .opencode/skill/{skill-name}/scripts
```

### Standard Skill Structure

```
.opencode/skill/{skill-name}/
├── SKILL.md              # Required: Main skill documentation
├── router.sh             # Optional: CLI router script
└── scripts/
    └── skill-cli.ts      # Optional: CLI tool implementation
```

---

## Step 2: Create SKILL.md

The SKILL.md file is required and provides skill documentation and integration details.

### Optional: Claude Code Skills

Claude Code Skills live in `.claude/skills/{skill-name}/SKILL.md` and support extra frontmatter:
- `allowed-tools` for tool restrictions
- `context` + `agent` to run in a forked subagent
- `hooks` for lifecycle events
- `user-invocable` to hide from slash menu

Keep descriptions keyword-rich so auto-discovery triggers reliably. See `../to-be-consumed/claude-code-docs/agent-skills.md` for full details.

### SKILL.md Frontmatter

```markdown
---
name: {skill-name}
description: Brief description of what the skill provides
---

# Skill Name

**Purpose**: What this skill helps users do

## What I do

- Feature 1
- Feature 2
- Feature 3

## How to use me

### Basic Commands

```bash
# Example command 1
npx ts-node .opencode/skill/{skill-name}/scripts/skill-cli.ts command1

# Example command 2
npx ts-node .opencode/skill/{skill-name}/scripts/skill-cli.ts command2
```

### Command Reference

| Command | Description |
|---------|-------------|
| `command1` | What command1 does |
| `command2` | What command2 does |

## Examples

### Example 1

```
$ npx ts-node .opencode/skill/{skill-name}/scripts/skill-cli.ts example

Expected output or behavior
```

## Architecture

```
.opencode/
└── skill/
    └── {skill-name}/
        ├── SKILL.md              # This file
        ├── router.sh             # CLI router
        └── scripts/
            └── skill-cli.ts      # CLI implementation
```

## Integration

### With Agents

This skill integrates with agents by:
- Description of how agents use the skill
- Example agent prompt that invokes the skill

### With OpenCode Events

The skill uses OpenCode event hooks:
- `tool.execute.before` - For [what it does]
- `tool.execute.after` - For [what it does]

---

## Step 3: Create Router Script (Optional)

For CLI-based skills, create a router.sh script:

```bash
#!/bin/bash
# Router script for {skill-name} skill

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Default to help if no arguments
if [ $# -eq 0 ]; then
    echo "Usage: bash router.sh <command> [options]"
    echo "Run 'bash router.sh help' for more information"
    exit 1
fi

COMMAND="$1"
shift

# Route to appropriate script
case "$COMMAND" in
    help|--help|-h)
        echo "{Skill Name} - Skill Description"
        echo ""
        echo "Usage: bash router.sh <command> [options]"
        echo ""
        echo "Commands:"
        echo "  command1    Description of command1"
        echo "  command2    Description of command2"
        echo "  help        Show this help message"
        ;;
    command1)
        npx ts-node "$SCRIPT_DIR/scripts/skill-cli.ts" command1 "$@"
        ;;
    command2)
        npx ts-node "$SCRIPT_DIR/scripts/skill-cli.ts" command2 "$@"
        ;;
    *)
        echo "Unknown command: $COMMAND"
        echo "Run 'bash router.sh help' for available commands"
        exit 1
        ;;
esac
```

### Make Router Executable

```bash
chmod +x .opencode/skill/{skill-name}/router.sh
```

---

## Step 4: Create CLI Implementation

### Basic CLI Structure

```typescript
#!/usr/bin/env ts-node
// CLI implementation for {skill-name} skill

interface Args {
  command: string
  [key: string]: any
}

async function main() {
  const args = parseArgs()
  
  switch (args.command) {
    case 'command1':
      await handleCommand1(args)
      break
    case 'command2':
      await handleCommand2(args)
      break
    case 'help':
    default:
      showHelp()
  }
}

function parseArgs(): Args {
  const args = process.argv.slice(2)
  return {
    command: args[0] || 'help',
    ...parseOptions(args.slice(1))
  }
}

async function handleCommand1(args: Args) {
  // Implementation
  console.log('Running command1...')
}

function showHelp() {
  console.log(`
{ Skill Name }

Usage: npx ts-node scripts/skill-cli.ts <command> [options]

Commands:
  command1    Description of command1
  command2    Description of command2
  help        Show this help message

Options:
  --option1   Description of option1
  --option2   Description of option2
`)
}

main().catch(console.error)
```

---

## Step 5: Register in Registry (Optional)

If the skill should be included in profiles, add it to `registry.json`:

### Add to Components

```json
{
  "skills": [
    {
      "id": "{skill-name}",
      "name": "Skill Name",
      "type": "skill",
      "path": ".opencode/skill/{skill-name}/SKILL.md",
      "description": "Brief description",
      "tags": ["tag1", "tag2"],
      "dependencies": []
    }
  ]
}
```

### Add to Profiles

```json
{
  "profiles": {
    "essential": {
      "components": [
        "skill:{skill-name}"
      ]
    }
  }
}
```

---

## Step 6: Test the Skill

### Test CLI Commands

```bash
# Test help
bash .opencode/skill/{skill-name}/router.sh help

# Test command1
bash .opencode/skill/{skill-name}/router.sh command1 --option value

# Test with npx
npx ts-node .opencode/skill/{skill-name}/scripts/skill-cli.ts help
```

### Test OpenCode Integration

If the skill uses OpenCode events:
1. Call the skill via OpenCode
2. Verify event hooks fire correctly
3. Check conversation history for skill content injection
4. Verify output enhancement works

---

## Example: Creating Task-Management Skill

### Directory Creation

```bash
mkdir -p .opencode/skill/task-management/scripts
```

### SKILL.md

```markdown
---
name: task-management
description: Task management CLI for tracking feature subtasks
---

# Task Management Skill

**Purpose**: Track and manage feature subtasks

## What I do

- Track task progress
- Show next eligible tasks
- Identify blocked tasks
- Mark completion
- Validate task integrity

## Usage

```bash
# Show all task statuses
npx ts-node .opencode/skill/task-management/scripts/task-cli.ts status

# Show next eligible tasks
npx ts-node .opencode/skill/task-management/scripts/task-cli.ts next

# Mark complete
npx ts-node .opencode/skill/task-management/scripts/task-cli.ts complete <feature> <seq> "summary"
```

### router.sh

```bash
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

case "$1" in
    help|--help|-h)
        echo "Task Management Skill"
        echo "Usage: bash router.sh <command>"
        echo "Commands: status, next, blocked, complete, validate"
        ;;
    status|next|blocked|validate)
        npx ts-node "$SCRIPT_DIR/scripts/task-cli.ts" "$@"
        ;;
    complete)
        npx ts-node "$SCRIPT_DIR/scripts/task-cli.ts" "$@"
        ;;
    *)
        echo "Unknown command: $1"
        bash router.sh help
        ;;
esac
```

---

## Best Practices

### 1. Keep Skills Focused

Each skill should do one thing well:
- ✅ Task management skill → Tracks tasks
- ❌ Task management + code generation + testing → Too broad

### 2. Clear Documentation

- Provide usage examples
- Document all commands
- Include expected outputs
- Explain integration points

### 3. Error Handling

- Handle missing arguments gracefully
- Provide helpful error messages
- Validate inputs before processing

### 4. Performance

- Use efficient algorithms
- Cache when appropriate
- Avoid unnecessary file operations

### 5. Testing

- Test all commands
- Test error conditions
- Verify integration with OpenCode

---

## Quick Reference

### File Checklist

- [ ] `.opencode/skill/{skill-name}/SKILL.md` created
- [ ] `.opencode/skill/{skill-name}/router.sh` created (if CLI-based)
- [ ] `.opencode/skill/{skill-name}/scripts/skill-cli.ts` created (if CLI-based)
- [ ] Router script is executable (`chmod +x`)
- [ ] Registry updated (if needed)
- [ ] Profile updated (if needed)
- [ ] All commands tested
- [ ] Documentation complete

### Command Reference

| Command | Purpose |
|---------|---------|
| `mkdir -p .opencode/skill/{name}` | Create skill directory |
| `chmod +x router.sh` | Make router executable |
| `npx ts-node scripts/cli.ts help` | Test CLI help |

---

## Related Documentation

- **Skills Plugin**: `plugins/context/capabilities/events_skills.md`
- **Plugin Overview**: `plugins/context/architecture/overview.md`
- **Event System**: `plugins/context/capabilities/events.md`
- **Adding Agents**: `guides/adding-agent.md`
- **Claude Code Skills**: `../to-be-consumed/claude-code-docs/agent-skills.md`
