# NexusAgent - Corrected Architecture

**Date:** 2025-10-29  
**Critical Correction:** Agents MUST stay in tool-specific folders

---

## The Constraint

**AI tools expect agents/commands/tools in THEIR specific folders:**
- OpenCode expects: `.opencode/agent/`, `.opencode/command/`
- Cursor expects: `.cursor/prompts/`, `.cursor/rules/`
- Claude expects: MCP servers in specific locations

**We CANNOT move agents to `.nexusagent/`**

---

## Corrected Structure

```
project/
├── .nexusagent/                 # ONLY context & governance (shared)
│   ├── context/                # Domain knowledge (SHAREABLE)
│   │   ├── core/
│   │   ├── domain/
│   │   ├── processes/
│   │   └── standards/
│   │
│   └── governance/             # Data governance (SHAREABLE)
│       ├── metadata-index.json
│       ├── workflow-state.json
│       └── tmp/requests/
│
└── .opencode/                   # OpenCode-specific (PRIMARY)
    ├── agent/                  # MUST be here for OpenCode
    │   ├── main-orchestrator.md
    │   ├── context-provider.md
    │   └── subagents/
    │
    └── command/                # MUST be here for OpenCode
        ├── workflow.md
        └── plan-task.md
```

---

## How It Works

### 1. Shared Context & Governance

`.nexusagent/` contains ONLY:
- Context files (markdown) - any tool can read
- Governance data (JSON) - any tool can read
- No agents, no commands, no tool-specific stuff

### 2. Tool-Specific Integration

Each tool has its own folder with agents/commands that REFERENCE the shared context:

**OpenCode Agent Example:**
```xml
---
description: "Main orchestrator"
mode: primary
---

# Main Orchestrator

**Load shared context from:**
@../.nexusagent/context/core/essential-patterns.md
@../.nexusagent/context/domain/business-rules.md

**Load governance metadata from:**
Read: ../.nexusagent/governance/metadata-index.json

[Rest of agent logic here]
```

### 3. Installation Creates Both

```bash
~/nexus/scripts/install.sh --profile governance

# Creates:
# 1. .nexusagent/           (shared context + governance)
# 2. .opencode/             (OpenCode agents + commands)
#    Agents reference: @../.nexusagent/context/
```

---

## Directory Structure (Corrected)

```
project/
├── .nexusagent/                 # Universal shared resources
│   ├── nexus.json              # Configuration
│   │
│   ├── context/                # SHAREABLE context
│   │   ├── core/
│   │   │   └── essential-patterns.md
│   │   ├── domain/
│   │   │   ├── business-rules.md
│   │   │   └── data-models.md
│   │   ├── processes/
│   │   │   └── standard-workflow.md
│   │   └── standards/
│   │       └── quality-criteria.md
│   │
│   └── governance/             # SHAREABLE governance
│       ├── metadata-index.json
│       ├── workflow-state.json
│       ├── tmp/
│       │   └── requests/
│       └── logs/
│
└── .opencode/                   # OpenCode integration
    ├── agent/
    │   ├── main-orchestrator.md       # References @../.nexusagent/context/
    │   ├── context-provider.md        # References @../.nexusagent/context/
    │   └── subagents/
    │       ├── quality-validator.md   # References @../.nexusagent/governance/
    │       └── lifecycle-manager.md
    │
    └── command/
        ├── workflow.md                # References @../.nexusagent/context/
        └── validate.md
```

---

## What Goes Where

### `.nexusagent/` (Shared)
✅ Context files (markdown)
✅ Governance data (JSON)
✅ Metadata index
✅ Request files
✅ Workflow state
✅ Configuration

❌ Agents (they stay in tool folders)
❌ Commands (they stay in tool folders)
❌ Tool-specific anything

### `.opencode/` (Tool-Specific)
✅ Agents (OpenCode format)
✅ Commands (OpenCode format)
✅ References to @../.nexusagent/context/
✅ References to ../.nexusagent/governance/

### `.cursor/` (Optional, User-Created)
✅ Prompts (Cursor format)
✅ Rules (Cursor format)
✅ Can reference ../.nexusagent/context/
✅ Can reference ../.nexusagent/governance/

---

## Benefits

1. **Respects Tool Conventions**
   - Each tool gets agents/commands in expected locations
   - Tools work normally

2. **Shares What Can Be Shared**
   - Context (markdown files) - universal
   - Governance data (JSON) - universal
   - No duplication

3. **Clean Separation**
   - Shared resources in .nexusagent/
   - Tool-specific in tool folders
   - Clear boundaries

---

## Installation Process

```bash
# Install NexusAgent
~/nexus/scripts/install.sh --profile governance

# What it creates:
# 1. .nexusagent/context/     (shared context)
# 2. .nexusagent/governance/  (shared governance)
# 3. .opencode/agent/         (OpenCode agents)
# 4. .opencode/command/       (OpenCode commands)

# OpenCode agents reference:
# @../.nexusagent/context/
# ../.nexusagent/governance/
```

---

## Agent Template (Corrected)

```xml
---
description: "Main orchestrator with shared context"
mode: primary
temperature: 0.2
---

# Main Orchestrator

<context>
  <system_context>
    NexusAgent orchestration system with shared context from .nexusagent/
  </system_context>
</context>

<!-- Load shared context -->
**Context files:**
@../.nexusagent/context/core/essential-patterns.md
@../.nexusagent/context/domain/business-rules.md

<!-- Access shared governance -->
**Governance data:**
Can read: ../.nexusagent/governance/metadata-index.json

<role>
  Primary orchestrator that uses shared context and governance
</role>

<task>
  Orchestrate tasks using shared context from .nexusagent/
</task>

[Rest of agent logic]
```

---

## This Means We Build

### In Profile (e.g., `~/nexus/profiles/governance/`)

```
governance/
├── nexusagent/                 # Goes to .nexusagent/
│   ├── context/
│   └── governance/
│
└── opencode/                   # Goes to .opencode/
    ├── agent/
    └── command/
```

### Installation Copies To

```
Profile: governance/nexusagent/  → Project: .nexusagent/
Profile: governance/opencode/    → Project: .opencode/
```

---

## Decision: Approved

This architecture:
✅ Respects tool conventions (agents stay in tool folders)
✅ Shares what can be shared (context + governance)
✅ Works with OpenCode (primary)
✅ Allows other tools to read shared resources (optional)
✅ No maintenance burden for multiple tools

**Ready to build with this corrected structure.**
