# OpenAgents ↔ Claude Code Integration

A bridge that allows Claude Code to use OpenAgents standards and context files.

## Overview

This integration provides two-way compatibility between OpenAgents and Claude Code:

1. **Auto-Convert**: Convert OpenAgents to Claude Code format for distribution
2. **Local Adapter**: Immediate context-aware behavior when using Claude in this repo

## Directory Structure

```
integrations/claude-code/
├── converter/           # Scripts to convert OpenAgents → Claude format
│   └── src/
│       └── convert-agents.js
├── generated/           # Output of conversion (gitignored)
│   ├── agents/
│   └── skills/
├── plugin/              # Final plugin files for distribution
│   ├── agents/
│   ├── skills/
│   └── .claude-plugin/
│       └── plugin.json
├── bootstrap-install.sh # One-line installer (downloads bundle)
└── install.sh           # Install script for distribution
```

## Quick Start

### For This Repository (Local Adapter)

Just run Claude in this repository:

```bash
cd /path/to/opencode-agents
claude
```

Claude will automatically:
- Load the `openagents-standards` Skill
- Use `context-scout` to find relevant context in `.opencode/context/`
- Apply OpenAgents standards to any task

<details>
<summary><strong>⚠️ Claude CLI Workaround</strong></summary>

If Claude doesn't auto-load the local adapter when run in this repository:

1. **Restart Claude Code** after any changes to `.claude/`
2. **Explicitly reference the context** in your request:
   ```
   "Load context from .claude/skills/openagents-standards/SKILL.md and .claude/agents/context-scout.md, then help me create a new agent"
   ```
3. **Manual trigger** - if the Skill doesn't auto-trigger, start your request with:
   ```
   [Use OpenAgents standards]
   ```
   This will activate the context loading workflow.

**Known Issue**: Skills auto-trigger based on Claude's heuristic. If it doesn't trigger:
- The `context-scout` subagent will still be available
- You can call it manually: `task(subagent_type="context-scout", ...)`
- Claude will still follow OpenAgents patterns if you reference `.opencode/context/` files in your prompt

</details>

### Install Claude CLI (if needed)

**macOS**:
```bash
brew install claude
```

**npm**:
```bash
npm install -g @anthropic-ai/claude-code
```

**Verify**:
```bash
claude --version
```

## For Distribution (Auto-Convert)

### One-Line Install (Recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/darrenhinde/OpenAgents/main/integrations/claude-code/bootstrap-install.sh | bash
```

**Prereqs**: `git`, `bash`

**Verify Claude Code**:
```bash
claude --version
```

This downloads the Claude integration bundle and runs the plugin installer.

### Step 1: Run the Converter

```bash
cd integrations/claude-code/converter
node src/convert-agents.js
```

This generates Claude-ready files in `integrations/claude-code/generated/`.

### Step 2: Install for Personal Use

```bash
cd integrations/claude-code
./install.sh
```

This copies the plugin to `~/.claude/plugins/openagents-bridge/`.

### Step 3: Use with Claude Code

**With plugin (recommended for distributed use)**:
```bash
claude --plugin-dir ~/.claude/plugins/openagents-bridge
```

**Without plugin (manual mode)**:
```bash
# Set environment variable to load context files
export OPENAGENTS_CONTEXT_PATH=.opencode/context

# Run Claude with context loaded from your prompt
claude
```

<details>
<summary><strong>💡 CLI Tips</strong></summary>

- **Check loaded plugins**: `claude --print-plugins`
- **Debug mode**: `claude --debug` (shows plugin loading)
- **One-shot mode**: `claude "your request" --print-only`
- **Session history**: Check `~/.claude/sessions/` for logs

</details>

## How It Works

### Context Discovery

1. **Skill Triggers**: The `openagents-standards` Skill automatically activates when you ask Claude to do anything.
2. **Subagent Call**: Claude calls `context-scout` to find relevant files in `.opencode/context/`.
3. **Standards Loading**: Claude reads the discovered files and applies OpenAgents standards.

### Agent Conversion

The converter maps OpenAgents frontmatter to Claude format:

| OpenAgents Field | Claude Field |
|------------------|--------------|
| `id` | `name` |
| `description` | `description` |
| `tools` / `permissions` | `tools` |
| `model` | `model` |
| `mode: subagent` | `permissionMode: plan` |

## Adding New Agents

### For Local Use

Add to `.opencode/agent/{category}/{agent}.md`. The local adapter in `.claude/` will pick it up on restart.

### For Distribution

1. Add to `.opencode/agent/{category}/{agent}.md`
2. Run: `cd integrations/claude-code/converter && node src/convert-agents.js`
3. The converted agent appears in `integrations/claude-code/generated/agents/`

## Files to Commit

- `.claude/` - Local adapter (committed)
- `integrations/claude-code/converter/src/convert-agents.js` - Converter script (committed)
- `integrations/claude-code/install.sh` - Install script (committed)

## Files to GitIgnore

- `integrations/claude-code/generated/` - Generated files (ignored)
- `integrations/claude-code/plugin/` - Build output (ignored)

## Requirements

- Node.js 18+
- Claude Code v2.1.6+

## CLI Reference

| Command | Description |
|---------|-------------|
| `claude` | Start interactive session |
| `claude "request"` | One-shot request |
| `claude --plugin-dir ~/.claude/plugins/openagents-bridge` | Load with plugin |
| `claude --print-plugins` | Show loaded plugins |
| `claude --debug` | Debug mode |
| `claude --version` | Show version |
