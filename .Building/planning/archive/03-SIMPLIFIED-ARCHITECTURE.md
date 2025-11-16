# NexusAgent - Simplified OpenCode-First Architecture
**Version:** 1.0  
**Date:** 2025-10-29  
**Philosophy:** OpenCode first, other tools optional via shared core

---

## Core Principle

**Primary:** Build for OpenCode (the best tool)  
**Secondary:** Share core context/governance with other tools if they can use it  
**No Maintenance Burden:** Don't maintain tool-specific versions

---

## Simplified Structure

```
project/
└── .opencode/                   # PRIMARY - OpenCode standard
    ├── agent/
    │   ├── main-orchestrator.md
    │   ├── context-provider.md
    │   └── subagents/
    │       ├── code-reviewer.md
    │       ├── quality-validator.md
    │       └── content-creator.md
    │
    ├── command/
    │   ├── workflow.md
    │   ├── plan-task.md
    │   └── execute-task.md
    │
    ├── context/                 # SHARED - Other tools can read this
    │   ├── core/
    │   ├── domain/
    │   ├── processes/
    │   └── standards/
    │
    ├── governance/              # SHARED - Universal governance
    │   ├── metadata-index.json
    │   ├── workflow-state.json
    │   └── tmp/requests/
    │
    └── nexus.json              # Configuration
```

**Key Insight:** Other AI tools can READ `.opencode/context/` and `.opencode/governance/` if they're compatible. We don't maintain separate versions.

---

## How Other Tools Can Use It (Optional)

### Option 1: Read Shared Context (Zero Maintenance)

```
project/
├── .opencode/                   # OpenCode uses this
│   ├── agent/
│   ├── command/
│   ├── context/                ← Cursor can read this!
│   └── governance/             ← Cursor can read this!
│
└── .cursor/                     # User creates if they want
    ├── prompts/
    │   └── workflow.md          # Points to: ../.opencode/context/
    └── rules.md
```

**Cursor prompt example (user-created):**
```markdown
# Workflow

Load context from `.opencode/context/core/`

Follow patterns defined there.

[Rest of prompt]
```

### Option 2: Smart Installer Detects Tools (Optional)

```bash
# User runs installer
~/nexus/scripts/install.sh --profile governance

# Installer detects:
✓ Found .cursor/ folder
? Also create Cursor-compatible structure? (Y/n)

# If yes:
✓ Created .opencode/ (primary)
✓ Created .cursor/prompts/ pointing to .opencode/context/
ℹ  Cursor can now read shared context
```

### Option 3: Manual Bridge Script (Optional, User-run)

```bash
# User wants to use Cursor too
~/nexus/scripts/bridge-to-cursor.sh

# Creates minimal .cursor/ structure:
# .cursor/
# └── prompts/
#     └── shared-context.md  # Points to .opencode/context/

✓ Bridge created
ℹ  Cursor prompts can now reference .opencode/context/
```

---

## Installation Philosophy

### Primary Flow (OpenCode)

```bash
curl -sSL https://raw.githubusercontent.com/nextsystems/nexus/main/scripts/install.sh | bash
cd my-project
~/nexus/scripts/install.sh --profile governance

# Creates:
# .opencode/
# ├── agent/
# ├── command/
# ├── context/
# └── governance/

# That's it! 
```

### Optional Secondary Tools

**We don't maintain them, but we make it easy:**

```bash
# IF user wants Cursor support:
~/nexus/scripts/optional/bridge-cursor.sh

# Creates minimal bridge
# User can customize from there
```

---

## What We Build & Maintain

### ✅ We Build (OpenCode Only)

1. **Installation Scripts**
   - `install.sh` - Install to `~/nexus/`
   - `project-install.sh` - Install `.opencode/` into project
   - Profile system for OpenCode

2. **OpenCode Profiles**
   - Default profile (basic orchestration)
   - Governance profile (data governance)
   - Content profile (content creation)

3. **OpenCode Agents**
   - Main orchestrator
   - Context provider
   - Governance agents
   - Specialized subagents

4. **Shared Context System**
   - Context files (other tools CAN read)
   - Governance system (other tools CAN read)
   - Request ID protocol (other tools CAN use)

### ⚠️ We Don't Build (User Optional)

1. **Cursor-specific prompts** - User can create if they want
2. **Claude Desktop configs** - User can set up if they want
3. **Aider configs** - User can configure if they want

### 🎁 We Provide (Optional Helpers)

1. **Bridge Scripts** (optional, user-run)
   - `optional/bridge-cursor.sh`
   - `optional/bridge-claude.sh`
   - `optional/bridge-aider.sh`

2. **Examples** (documentation)
   - "How to use with Cursor" (example prompt that reads `.opencode/context/`)
   - "How to use with Claude" (example MCP config)
   - User adapts to their needs

---

## Updated Installation Script Design

```bash
#!/bin/bash
# ~/nexus/scripts/install.sh

set -e

PROFILE="${1:-default}"
DETECT_OTHER_TOOLS="${2:-true}"

echo "🚀 Installing NexusAgent for OpenCode..."
echo "   Profile: $PROFILE"
echo ""

# Create .opencode/ structure
create_opencode_structure "$PROFILE"

echo "✅ NexusAgent installed for OpenCode!"
echo ""

# Optional: Detect other tools
if [ "$DETECT_OTHER_TOOLS" = "true" ]; then
    if [ -d ".cursor" ]; then
        echo "ℹ️  Detected .cursor/ folder"
        echo "   You can create a bridge to share context:"
        echo "   ~/nexus/scripts/optional/bridge-cursor.sh"
        echo ""
    fi
    
    if [ -d ".claude" ]; then
        echo "ℹ️  Detected .claude/ folder"
        echo "   You can configure Claude to read .opencode/context/"
        echo "   See: ~/nexus/docs/claude-integration.md"
        echo ""
    fi
fi

echo "📚 Next steps:"
echo "   1. Try: /workflow \"your request\""
echo "   2. Configure: .opencode/nexus.json"
echo "   3. Read: ~/nexus/docs/getting-started.md"
```

---

## Directory Structure (Actual Build)

### What We Actually Create

```
~/nexus/                         # Base installation
├── README.md
├── LICENSE
├── install.sh                   # Main installer
├── scripts/
│   ├── install.sh              # Project installer (creates .opencode/)
│   ├── update.sh
│   └── optional/               # Optional bridge scripts
│       ├── bridge-cursor.sh
│       ├── bridge-claude.sh
│       └── README.md
│
├── profiles/
│   ├── default/
│   │   ├── agent/
│   │   ├── command/
│   │   └── context/
│   ├── governance/
│   │   ├── agent/
│   │   ├── command/
│   │   ├── context/
│   │   └── governance/
│   └── content/
│       ├── agent/
│       ├── command/
│       └── context/
│
└── docs/
    ├── getting-started.md
    ├── profiles.md
    ├── opencode-usage.md
    └── optional/
        ├── cursor-integration.md      # Example, not automated
        ├── claude-integration.md      # Example, not automated
        └── aider-integration.md       # Example, not automated
```

### What Gets Installed in Project

```
project/
└── .opencode/                   # Standard OpenCode structure
    ├── nexus.json              # NexusAgent config
    │
    ├── agent/                   # OpenCode agents
    │   ├── main-orchestrator.md
    │   ├── context-provider.md
    │   └── subagents/
    │       └── *.md
    │
    ├── command/                 # OpenCode commands
    │   ├── workflow.md
    │   ├── plan-task.md
    │   └── *.md
    │
    ├── context/                 # SHARED - other tools can read
    │   ├── core/
    │   ├── domain/
    │   ├── processes/
    │   └── standards/
    │
    └── governance/              # SHARED - other tools can read
        ├── metadata-index.json
        ├── workflow-state.json
        └── tmp/requests/
```

---

## Optional Bridge Script (Example)

**File:** `~/nexus/scripts/optional/bridge-cursor.sh`

```bash
#!/bin/bash
# Optional bridge for Cursor users

set -e

if [ ! -d ".opencode" ]; then
    echo "❌ No .opencode/ folder found"
    echo "   Run: ~/nexus/scripts/install.sh first"
    exit 1
fi

echo "🌉 Creating Cursor bridge to NexusAgent..."

mkdir -p .cursor/prompts

cat > .cursor/prompts/nexus-workflow.md << 'EOF'
# NexusAgent Workflow (via shared context)

You are using NexusAgent context-aware orchestration.

## Context Available
All context from `.opencode/context/` is available:
- Core patterns: `.opencode/context/core/`
- Domain knowledge: `.opencode/context/domain/`
- Workflows: `.opencode/context/processes/`
- Standards: `.opencode/context/standards/`

## Governance
Quality metadata available at: `.opencode/governance/metadata-index.json`

## Your Task
[Cursor AI will use this prompt with access to shared context]

Follow the patterns and standards defined in the shared context.
EOF

echo "✅ Cursor bridge created!"
echo ""
echo "📝 Created:"
echo "   .cursor/prompts/nexus-workflow.md"
echo ""
echo "ℹ️  Cursor can now reference shared context from .opencode/"
echo "   Edit .cursor/prompts/ to customize for your needs"
```

---

## Benefits of This Approach

### ✅ Simple to Build
- Focus on OpenCode (95% of our effort)
- Clean, standard OpenCode structure
- No complexity of multiple tool versions

### ✅ Simple to Maintain
- One codebase (OpenCode)
- Context is naturally shareable (just markdown)
- Governance is naturally shareable (JSON files)

### ✅ Optional Flexibility
- Users can bridge to other tools if they want
- We provide helpers, not full implementations
- No maintenance burden for us

### ✅ Best of Both Worlds
- Primary tool (OpenCode) is fully supported
- Other tools can leverage shared context
- Users who want multi-tool can set it up

---

## Development Priorities

### Phase 1: Core OpenCode System (Week 1-3)
```
✅ Focus: Perfect OpenCode experience
✅ Build: Full profiles, agents, governance
✅ Test: With real OpenCode projects
```

### Phase 2: Documentation (Week 4)
```
✅ Document: OpenCode usage (primary)
✅ Document: How to share context with other tools (examples)
✅ Create: Optional bridge scripts (minimal)
```

### Phase 3: Polish & Launch (Week 5-6)
```
✅ Test: Installation process
✅ Polish: Error handling, UX
✅ Launch: GitHub repo public
```

---

## Updated Key Decisions

1. **Primary:** OpenCode (full support, all features)
2. **Secondary:** Shareable context/governance (read-only by other tools)
3. **Optional:** Bridge scripts (user-run, minimal maintenance)
4. **Focus:** Build the best OpenCode experience possible

---

## This Means...

### We Build:
- ✅ Perfect OpenCode integration
- ✅ Installable profiles for OpenCode
- ✅ Shareable context system
- ✅ Shareable governance system
- ✅ Optional bridge helpers

### We Don't Build:
- ❌ Full Cursor integration (users can bridge if they want)
- ❌ Full Claude integration (users can bridge if they want)
- ❌ Multiple maintained versions
- ❌ Complex adapter system

### Result:
- 🎯 Clean, focused codebase
- 🚀 Fast development
- 🎨 Easy maintenance
- 🌟 Best OpenCode experience
- 🔗 Optional multi-tool via shared context

---

**Recommendation:** This is the way. Build for OpenCode, make context shareable, let users bridge to other tools if they want.

**Ready to update the master plan and start building?**
