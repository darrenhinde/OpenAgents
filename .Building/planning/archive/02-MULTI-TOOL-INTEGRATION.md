# NexusAgent - Multi-Tool Integration Strategy
**Version:** 1.0  
**Date:** 2025-10-29  
**Inspiration:** Agent OS pattern with universal base + tool-specific adapters

---

## Problem Statement

Different AI tools have different conventions:
- **OpenCode:** Uses `.opencode/` with `command/` and `agent/subagents/`
- **Cursor:** Uses `.cursor/` with `prompts/` and `rules/`
- **Claude Desktop:** Uses MCP servers and config JSON
- **Aider:** Uses `.aider/` with prompts
- **Custom tools:** May have their own conventions

**Solution:** Separate universal system logic from tool-specific integration layers.

---

## Architecture: Universal Base + Tool Adapters

### Core Concept

```
project/
├── .nexus/                      # UNIVERSAL BASE - Tool-agnostic
│   ├── nexus.json              # Configuration
│   ├── profiles/               # Which profile is active
│   ├── agents/                 # Agent logic (universal)
│   ├── context/                # Domain knowledge (universal)
│   ├── workflows/              # Workflows (universal)
│   └── governance/             # Governance system (universal)
│
├── .opencode/                   # OPENCODE ADAPTER
│   ├── command/                # OpenCode slash commands
│   └── agent/subagents/        # OpenCode agent format
│
├── .cursor/                     # CURSOR ADAPTER
│   ├── prompts/                # Cursor prompts
│   └── rules/                  # Cursor rules
│
└── .claude/                     # CLAUDE ADAPTER
    └── mcp-config.json         # MCP server config
```

### How It Works

```
User request via AI tool
       ↓
Tool-specific adapter (.opencode/command/workflow.md)
       ↓
Loads core logic from .nexus/agents/
       ↓
Loads context from .nexus/context/
       ↓
Executes with governance from .nexus/governance/
       ↓
Returns via tool-specific format
```

---

## Universal Base Structure (`.nexus/`)

```
.nexus/
├── nexus.json                   # Configuration
│   {
│     "version": "1.0.0",
│     "profile": "governance",
│     "tools": ["opencode", "cursor"],
│     "config": { ... }
│   }
│
├── agents/                      # Universal agent definitions
│   ├── main-orchestrator.md
│   ├── context-provider.md
│   ├── context-manager.md
│   └── specialists/
│       ├── code-reviewer.md
│       ├── quality-validator.md
│       └── content-creator.md
│
├── context/                     # Domain knowledge
│   ├── core/
│   ├── domain/
│   ├── processes/
│   └── standards/
│
├── workflows/                   # Workflow definitions
│   ├── simple-task.md
│   ├── complex-feature.md
│   └── governance-update.md
│
├── governance/                  # Governance system
│   ├── metadata-index.json
│   ├── workflow-state.json
│   └── tmp/requests/
│
└── adapters/                    # Tool integration configs
    ├── opencode.yml
    ├── cursor.yml
    └── claude.yml
```

---

## Tool-Specific Adapters

### OpenCode Adapter (`.opencode/`)

```
.opencode/
├── command/                     # Slash commands
│   ├── workflow.md             # Thin wrapper
│   ├── plan-task.md
│   └── execute-task.md
│
└── agent/
    └── subagents/               # Symlinks or thin wrappers
        ├── code-reviewer.md     # → ../.nexus/agents/specialists/code-reviewer.md
        └── quality-validator.md
```

**Example: `.opencode/command/workflow.md`**
```markdown
---
name: workflow
agent: orchestrator
description: "Main workflow entry point"
---

# Workflow Command

You are executing the NexusAgent workflow system.

**Request:** $ARGUMENTS

**Load core logic from:**
@../.nexus/agents/main-orchestrator.md

**Execute the workflow as defined in the core agent.**
```

### Cursor Adapter (`.cursor/`)

```
.cursor/
├── prompts/
│   ├── workflow.md             # Cursor-style prompt
│   └── code-review.md
│
└── rules/
    └── nexus-rules.md          # Cursor AI rules
```

**Example: `.cursor/prompts/workflow.md`**
```markdown
# NexusAgent Workflow

Load the main orchestrator from `.nexus/agents/main-orchestrator.md`.

Execute the workflow logic with the user's request: {request}

Follow the orchestration patterns defined in the core system.
```

### Claude Desktop Adapter (`.claude/`)

```
.claude/
└── mcp-config.json
```

**Example: `.claude/mcp-config.json`**
```json
{
  "mcpServers": {
    "nexus": {
      "command": "node",
      "args": ["~/.nexus/lib/mcp-server.js"],
      "env": {
        "NEXUS_BASE_PATH": "${workspaceFolder}/.nexus"
      }
    }
  }
}
```

---

## Installation Flow with Multi-Tool Support

### Base Installation

```bash
# User installs NexusAgent
curl -sSL https://nexus.nextsystems.ai/install.sh | bash

# Creates ~/nexus/ with:
# - All profiles
# - Installation scripts
# - Adapter templates
```

### Project Installation (Interactive)

```bash
cd /path/to/project
~/nexus/scripts/install.sh

# Interactive prompts:
? Select profile: (Use arrow keys)
  > default (Basic orchestration)
    governance (Data governance)
    content (Content creation)

? Select AI tools to integrate: (Space to select, Enter to continue)
  ◉ OpenCode
  ◯ Cursor
  ◯ Claude Desktop
  ◯ Aider

? Folder name for universal base:
  > .nexus (recommended)
    .agentos
    .ai
    
# Installation proceeds...
✓ Created .nexus/ with governance profile
✓ Created .opencode/ adapter
✓ Configured for OpenCode integration
✓ 
✓ Next steps:
  1. Review .nexus/nexus.json for configuration
  2. Try: /workflow "your request"
```

### Automated Installation (Non-Interactive)

```bash
# For CI/CD or automated setups
~/nexus/scripts/install.sh \
  --profile governance \
  --tools opencode,cursor \
  --base-folder .nexus \
  --non-interactive

# Or via config file
~/nexus/scripts/install.sh --config nexus-install.yml
```

**Config file: `nexus-install.yml`**
```yaml
profile: governance
tools:
  - opencode
  - cursor
base_folder: .nexus
features:
  governance: true
  workflows: true
  context_level: 2
```

---

## Adapter Generation System

### Auto-Generate Adapters

When installing, NexusAgent automatically generates tool-specific adapters based on templates.

**Template: `~/nexus/adapters/opencode/command-template.md`**
```markdown
---
name: {{command_name}}
agent: {{agent_name}}
description: "{{description}}"
---

# {{command_title}}

You are executing {{command_name}} from NexusAgent.

**Request:** $ARGUMENTS

**Core Logic:**
@../.nexus/agents/{{agent_path}}.md

**Context Available:**
{{#each context_files}}
@../.nexus/context/{{this}}
{{/each}}

**Execute the {{command_type}} as defined in the core system.**
```

**Generation process:**
```python
def generate_opencode_adapter(profile, base_folder=".nexus"):
    # Load profile configuration
    profile_config = load_profile(profile)
    
    # Create .opencode/ structure
    os.makedirs(".opencode/command", exist_ok=True)
    os.makedirs(".opencode/agent/subagents", exist_ok=True)
    
    # Generate commands
    for command in profile_config["commands"]:
        template = load_template("opencode/command-template.md")
        content = template.render(
            command_name=command["name"],
            agent_name=command["agent"],
            agent_path=f"agents/{command['agent']}",
            description=command["description"],
            context_files=command.get("context", [])
        )
        write_file(f".opencode/command/{command['name']}.md", content)
    
    # Generate agent wrappers
    for agent in profile_config["agents"]:
        create_agent_wrapper(
            agent_name=agent["name"],
            source_path=f"../{base_folder}/agents/{agent['file']}",
            dest_path=f".opencode/agent/subagents/{agent['name']}.md"
        )
```

---

## Configuration System

### Global Config (`~/nexus/config.yml`)

```yaml
# NexusAgent Global Configuration
version: "1.0.0"

# Default installation preferences
defaults:
  profile: default
  base_folder: .nexus
  tools:
    - opencode
  context_level: 2

# Tool-specific adapter settings
adapters:
  opencode:
    enabled: true
    folder: .opencode
    structure:
      commands: command
      agents: agent/subagents
    features:
      skills: true
      
  cursor:
    enabled: false
    folder: .cursor
    structure:
      prompts: prompts
      rules: rules
      
  claude:
    enabled: false
    folder: .claude
    mcp_server: true
```

### Project Config (`.nexus/nexus.json`)

```json
{
  "version": "1.0.0",
  "profile": "governance",
  "base_folder": ".nexus",
  "tools": {
    "opencode": {
      "enabled": true,
      "adapter_path": ".opencode",
      "features": {
        "skills": true,
        "subagents": true
      }
    },
    "cursor": {
      "enabled": true,
      "adapter_path": ".cursor"
    }
  },
  "config": {
    "context_level": 3,
    "enable_governance": true
  }
}
```

### Adapter Config (`.nexus/adapters/opencode.yml`)

```yaml
# OpenCode Adapter Configuration
tool: opencode
version: "1.0.0"

# Folder structure mapping
folders:
  commands: .opencode/command
  agents: .opencode/agent/subagents
  context: .nexus/context  # Shared

# Command mappings
commands:
  - name: workflow
    agent: main-orchestrator
    context:
      - core/essential-patterns.md
      - architecture/project-structure.md
      
  - name: review
    agent: code-reviewer
    context:
      - standards/code-quality.md

# Agent mappings
agents:
  - name: code-reviewer
    source: .nexus/agents/specialists/code-reviewer.md
    wrapper: true  # Create thin wrapper
    
  - name: quality-validator
    source: .nexus/agents/specialists/quality-validator.md
    wrapper: true
```

---

## Benefits of This Architecture

### 1. **Tool Agnostic Core**
- Universal base (`.nexus/`) works with any AI tool
- Easy to add support for new tools
- Core logic not tied to any specific tool

### 2. **Easy Migration**
```bash
# Switching from OpenCode to Cursor
~/nexus/scripts/add-tool.sh cursor

# Removes nothing from .nexus/
# Just adds .cursor/ adapter
# Both tools can work simultaneously
```

### 3. **Clean Separation**
- **`.nexus/`** = System logic, context, governance
- **`.opencode/`** = OpenCode-specific commands/format
- **`.cursor/`** = Cursor-specific prompts/rules
- No duplication, no confusion

### 4. **Profile Portability**
```bash
# Export your profile
~/nexus/scripts/export-profile.sh my-project-profile

# Creates: ~/.nexus/profiles/my-project-profile/
# Can be shared and installed on any tool
```

### 5. **Gradual Adoption**
```bash
# Start with just .nexus/ (universal)
~/nexus/scripts/install.sh --profile default --tools none

# Add OpenCode later
~/nexus/scripts/add-tool.sh opencode

# Add Cursor when needed
~/nexus/scripts/add-tool.sh cursor
```

---

## Implementation Scripts

### Main Install Script

```bash
#!/bin/bash
# ~/nexus/scripts/install.sh

set -e

PROFILE="${1:-default}"
TOOLS="${2:-opencode}"
BASE_FOLDER="${3:-.nexus}"
INTERACTIVE="${4:-true}"

if [ "$INTERACTIVE" = "true" ]; then
    # Interactive prompts
    select_profile
    select_tools
    select_base_folder
fi

echo "📦 Installing NexusAgent..."
echo "   Profile: $PROFILE"
echo "   Tools: $TOOLS"
echo "   Base: $BASE_FOLDER"
echo ""

# Create base structure
create_base_structure "$BASE_FOLDER" "$PROFILE"

# Generate tool adapters
IFS=',' read -ra TOOL_ARRAY <<< "$TOOLS"
for tool in "${TOOL_ARRAY[@]}"; do
    generate_adapter "$tool" "$BASE_FOLDER" "$PROFILE"
done

# Create configuration
create_config "$BASE_FOLDER" "$PROFILE" "$TOOLS"

echo "✅ NexusAgent installed successfully!"
echo ""
echo "📚 Next steps:"
echo "   1. Review $BASE_FOLDER/nexus.json"
if [[ " ${TOOL_ARRAY[@]} " =~ " opencode " ]]; then
    echo "   2. Try: /workflow \"your request\""
fi
```

### Add Tool Script

```bash
#!/bin/bash
# ~/nexus/scripts/add-tool.sh

TOOL="$1"
BASE_FOLDER="${2:-.nexus}"

if [ -z "$TOOL" ]; then
    echo "Usage: add-tool.sh <tool> [base-folder]"
    echo "Available tools: opencode, cursor, claude, aider"
    exit 1
fi

# Load current config
PROFILE=$(jq -r '.profile' "$BASE_FOLDER/nexus.json")

echo "🔧 Adding $TOOL adapter..."

# Generate adapter
generate_adapter "$TOOL" "$BASE_FOLDER" "$PROFILE"

# Update config
update_config_add_tool "$BASE_FOLDER" "$TOOL"

echo "✅ $TOOL adapter added!"
echo "   Folder: .$(echo $TOOL | tr '[:upper:]' '[:lower:]')/"
```

---

## Updated Directory Structure

### After Installation (Multiple Tools)

```
project/
├── .nexus/                      # Universal base
│   ├── nexus.json
│   ├── agents/
│   │   ├── main-orchestrator.md
│   │   ├── context-provider.md
│   │   └── specialists/
│   ├── context/
│   │   ├── core/
│   │   ├── domain/
│   │   └── standards/
│   ├── workflows/
│   ├── governance/
│   │   ├── metadata-index.json
│   │   └── tmp/requests/
│   └── adapters/
│       ├── opencode.yml
│       └── cursor.yml
│
├── .opencode/                   # OpenCode adapter
│   ├── command/
│   │   ├── workflow.md         # → .nexus/agents/main-orchestrator.md
│   │   └── review.md           # → .nexus/agents/specialists/code-reviewer.md
│   └── agent/subagents/
│       └── quality-validator.md # → .nexus/agents/specialists/quality-validator.md
│
└── .cursor/                     # Cursor adapter
    ├── prompts/
    │   ├── workflow.md         # → .nexus/agents/main-orchestrator.md
    │   └── review.md           # → .nexus/agents/specialists/code-reviewer.md
    └── rules/
        └── nexus-rules.md
```

---

## Migration Path

For users with existing setups:

```bash
# From existing .opencode/ to universal .nexus/
~/nexus/scripts/migrate.sh --from .opencode --to .nexus

# Detects:
# - Existing agents in .opencode/agent/
# - Existing commands in .opencode/command/
# - Existing context in .opencode/context/

# Migrates:
# 1. Moves core logic to .nexus/
# 2. Creates adapters in .opencode/ (thin wrappers)
# 3. Updates all references
# 4. Creates backup before migration
```

---

## Recommendation

**Go with the Universal Base + Adapter pattern:**

1. **`.nexus/`** = Core system (agents, context, governance)
2. **`.opencode/`, `.cursor/`, etc.** = Tool-specific adapters
3. **Auto-generation** = Scripts create adapters from templates
4. **Easy migration** = Switch tools without losing work

This gives us:
- ✅ Maximum flexibility
- ✅ Tool independence
- ✅ Easy multi-tool support
- ✅ Clean separation of concerns
- ✅ Future-proof architecture

**Next step:** Update the master plan to incorporate this approach?
