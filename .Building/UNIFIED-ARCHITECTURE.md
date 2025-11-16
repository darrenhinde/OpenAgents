# Unified Architecture: NexusAgent
**Combining Context-Aware Orchestration + Data Governance**

---

## Overview

**NexusAgent** is a universal AI agent orchestration system that combines:
1. **Context-Aware Orchestration** - Hierarchical agent systems with dynamic context loading
2. **Data Governance** - Managing context as data with quality, lifecycle, and metadata

This creates a system where:
- Agents intelligently route work based on complexity
- Context is treated as governed data assets
- Everything is modular, installable, and customizable
- Works with any AI tool (OpenCode, Cursor, Claude, etc.)

---

## Core Architecture Principles

### 1. **Dual-Layer System**

```
┌────────────────────────────────────────────────────────┐
│                ORCHESTRATION LAYER                      │
│  • Hierarchical agent routing                          │
│  • Dynamic context allocation (3 levels)               │
│  • Workflow management                                 │
│  • Request analysis and complexity assessment          │
└────────────────┬───────────────────────────────────────┘
                 │
                 ↓ Uses context from ↓
┌────────────────────────────────────────────────────────┐
│                GOVERNANCE LAYER                         │
│  • Context quality management                          │
│  • Metadata indexing (JSON primary)                    │
│  • Lifecycle management (CREATE → ARCHIVE)             │
│  • Automated validation workflows                      │
└────────────────────────────────────────────────────────┘
```

### 2. **Three Context Levels** (From Building Context-Aware Systems)

```yaml
Level 1 - Complete Isolation (80% of cases):
  Context: Task description only
  Performance: 80% overhead reduction
  Governance: No metadata queries needed
  
Level 2 - Filtered Context (15% of cases):
  Context: Task + relevant domain knowledge
  Performance: 60% overhead reduction  
  Governance: Query metadata index for relevant files
  
Level 3 - Full Context (5% of cases):
  Context: Task + domain + historical state
  Performance: Optimized for accuracy
  Governance: Full metadata + quality validation
```

### 3. **Request ID Protocol** (From Data Governance)

Every agent interaction uses explicit context passing:

```yaml
1. Orchestrator creates: tmp/requests/req-{uuid}.json
2. Orchestrator passes: request_id to subagent
3. Subagent reads: tmp/requests/req-{uuid}.json (FULL CONTEXT)
4. Subagent updates: processing_chain in request file
5. Orchestrator reads: Results from request file

Benefits:
  ✅ No context loss between agents
  ✅ Full audit trail
  ✅ Resumable workflows
  ✅ Easy debugging
```

### 4. **Metadata-Driven Context** (From Data Governance)

```yaml
PRIMARY: metadata-index.json
  • Fast queries (< 10ms)
  • Indexed by: tier, tag, health, state
  • No file I/O for metadata lookups

SECONDARY: Embedded XML in files
  • Travels with content
  • Source of truth for sync
  • File always wins on conflict
  
Sync: Nightly reconciliation job
```

---

## Universal Folder Structure

This structure works for ANY domain (content, code, data, support, etc.):

```
~/nexus/                          # Base installation
├── config.yml                    # User configuration
├── profiles/                     # Pre-built + custom profiles
│   ├── default/                 # Basic orchestration
│   ├── governance/              # Data governance
│   ├── content/                 # Content creation
│   └── custom/                  # User-created
├── scripts/
│   ├── base-install.sh
│   ├── project-install.sh
│   └── lib/
└── templates/

# After project installation:
your-project/
└── .nexus/                       # or .opencode, .ai, etc.
    ├── agent/
    │   ├── main-orchestrator.md
    │   ├── context-provider.md   # Intelligent context selection
    │   └── subagents/
    │       ├── specialist-a.md
    │       └── specialist-b.md
    │
    ├── command/                  # Slash commands
    │   ├── workflow.md
    │   └── execute.md
    │
    ├── context/                  # Domain knowledge
    │   ├── core/
    │   ├── domain/
    │   ├── processes/
    │   ├── standards/
    │   └── workflows/
    │
    ├── governance/               # Context governance
    │   ├── metadata-index.json   # PRIMARY metadata
    │   ├── workflow-state.json   # Workflow state machine
    │   ├── tmp/                  # Inter-agent communication
    │   │   └── requests/         # Request context files
    │   └── logs/                 # Audit trails
    │
    └── nexus.json                # Project configuration
```

---

## Key Components

### 1. Main Orchestrator (Context-Aware)

**Responsibilities:**
- Analyze request complexity
- Determine context level (1, 2, or 3)
- Route to appropriate specialists
- Coordinate multi-agent workflows
- Integrate results

**Template Structure:**
```xml
---
description: "Main orchestrator with context-aware routing"
mode: primary
temperature: 0.2
---

<context>
  <system_context>[Your domain]</system_context>
</context>

<role>
  Primary orchestrator specializing in [domain] with intelligent
  context allocation and multi-agent coordination
</role>

<task>
  Transform requests into outcomes by analyzing complexity,
  allocating appropriate context, and routing to specialists
</task>

<workflow name="IntelligentRouting">
  <stage_1_analyze>
    <action>Assess request complexity</action>
    <decision>
      <simple>Context Level 1 - Direct execution</simple>
      <moderate>Context Level 2 - Route to @context-provider</moderate>
      <complex>Context Level 3 - Full coordination</complex>
    </decision>
  </stage_1_analyze>
  
  <stage_2_context>
    <level_1>Task description only</level_1>
    <level_2>
      <create_request>tmp/requests/req-{uuid}.json</create_request>
      <route>@context-provider with request_id</route>
      <load>Files returned by context-provider</load>
    </level_2>
    <level_3>
      <create_request>tmp/requests/req-{uuid}.json</create_request>
      <route>@context-manager for governance</route>
      <load>Full validated context</load>
    </level_3>
  </stage_2_context>
  
  <stage_3_execute>
    <route_to_specialists>With explicit context</route_to_specialists>
    <update_request_file>Progress tracking</update_request_file>
  </stage_3_execute>
</workflow>
```

### 2. Context Provider (Intelligent Selection)

**Responsibilities:**
- Analyze request to determine context needs
- Select relevant context files
- Return file paths (not contents)
- Optimize for minimal cognitive load

**Key Logic:**
```yaml
analyze_request:
  complexity: simple | moderate | complex
  domain: [domain keywords]
  integrations: [external systems]
  
determine_context_level:
  if complexity_score <= 3:
    return Level 1 (no files)
  if complexity_score <= 7:
    return Level 2 (filtered files)
  else:
    return Level 3 (full context + governance)
    
select_files:
  base: [core/essential.md]
  domain: [based on keywords]
  processes: [based on workflow type]
  standards: [if validation needed]
  
return:
  context_level: 2
  file_locations: [array of paths]
  estimated_tokens: 1500
```

### 3. Context Manager (Governance)

**Responsibilities:**
- Retrieve context with quality checks
- Update metadata after use
- Coordinate lifecycle transitions
- Validate context health

**Integration with Orchestrator:**
```yaml
# Orchestrator creates request
orchestrator:
  request_id: req-abc123
  creates: tmp/requests/req-abc123.json
  calls: @context-manager get_context(request_id)
  
# Context Manager processes
context_manager:
  reads: tmp/requests/req-abc123.json
  queries: metadata-index.json (FAST)
  checks: health_score, timeliness, validity
  loads: file content (only if quality good)
  updates: access_count in metadata-index.json
  writes: tmp/requests/req-abc123.json (results)
  
# Orchestrator reads results
orchestrator:
  reads: tmp/requests/req-abc123.json
  gets: files_returned, warnings, estimated_tokens
```

### 4. Specialized Subagents

**Design Principles:**
- Single responsibility
- Stateless (no memory between calls)
- Complete explicit instructions
- Always read request file first

**Template:**
```xml
---
description: "[Specific task]"
mode: subagent
temperature: 0.1
---

<inputs_required>
  <parameter name="request_id" type="string">
    UUID pointing to tmp/requests/{request_id}.json
  </parameter>
</inputs_required>

<process_flow>
  <step_1>
    <action>Read request file</action>
    <file>tmp/requests/{request_id}.json</file>
    <extract>Full context for this task</extract>
  </step_1>
  
  <step_2>
    <action>Perform specialized task</action>
  </step_2>
  
  <step_3>
    <action>Update request file</action>
    <append>Processing chain entry</append>
  </step_3>
</process_flow>
```

---

## Profile System

### Profile: Default (Context-Aware Orchestration)

**Purpose:** Basic hierarchical orchestration for any domain

**Includes:**
```yaml
agents:
  - main-orchestrator.md          # Intelligent routing
  - context-provider.md            # Context selection
  - task-planner.md                # Multi-step planning
  - subagents/
    - code-reviewer.md
    - test-writer.md
    - doc-writer.md
    
commands:
  - workflow.md                    # Main entry point
  - plan-task.md                   # Complex tasks
  - execute-task.md                # Step execution
  
context:
  - core/essential-patterns.md     # Always loaded
  - architecture/project-structure.md
  - workflows/simple-task.md
  - workflows/complex-feature.md
  
governance: (minimal)
  - metadata-index.json (basic)
  - No automated workflows
```

### Profile: Governance (Data Management)

**Purpose:** Full data governance for context management

**Includes:**
```yaml
agents:
  - main-orchestrator.md           # Routes to governance
  - governance/
    - context-manager.md           # Primary governance
    - subagents/
      - quality-validator.md
      - lifecycle-manager.md
      - metadata-updater.md
      - catalog-maintainer.md
      
commands:
  - get-context.md                 # Retrieve with quality check
  - update-context.md              # Update after changes
  - validate-quality.md            # Quality validation
  - lifecycle-review.md            # Lifecycle management
  
context:
  - governance/
    - metadata-schema.md
    - quality-dimensions.md
    - lifecycle-states.md
  - workflows/
    - context-retrieval.md
    - quality-validation.md
    
governance: (full)
  - metadata-index.json (PRIMARY)
  - workflow-state.json
  - Automated daily/weekly/monthly workflows
  - Nightly sync job
  - Full audit logging
```

### Profile: Content (Content Orchestration)

**Purpose:** Content creation with platform optimization

**Combines both systems:**
```yaml
agents:
  # Orchestration layer
  - content-orchestrator.md
  - context-provider.md
  
  # Content specialists
  - subagents/
    - twitter-specialist.md
    - linkedin-specialist.md
    - research-assistant.md
    - content-validator.md
    
commands:
  - create-content.md
  - new-project.md
  - validate.md
  
context:
  # Domain knowledge
  - brand/voice.md
  - platforms/twitter/specs.md
  - workflows/multi-platform.md
  
  # Governance for context
  - governance/ (from governance profile)
  
governance:
  - Full metadata management
  - Content lifecycle tracking
  - Quality validation
```

---

## Installation Flow

### Base Installation

```bash
# One command
curl -sSL https://nexus.nextsystems.ai/install.sh | bash

# What it does:
1. Creates ~/nexus/
2. Downloads all profiles
3. Creates config.yml
4. Makes scripts executable
5. Shows quick start guide
```

### Project Installation

```bash
# Navigate to project
cd /path/to/your/project

# Install with profile
~/nexus/scripts/project-install.sh --profile governance

# What it does:
1. Analyzes which profile to use
2. Creates .nexus/ folder
3. Copies agents, commands, context from profile
4. Sets up governance/ if needed
5. Creates nexus.json configuration
6. Shows next steps
```

### Configuration

```yaml
# ~/nexus/config.yml
defaults:
  profile: default
  ai_tool: opencode
  context_level: 2
  enable_governance: false
  
profiles:
  governance:
    enable_governance: true
    metadata_sync: "0 4 * * *"
    quality_workflows: true
    
  content:
    enable_governance: true
    context_level: 2
    enable_research: true
```

---

## How It All Works Together

### Example: Simple Request (Level 1)

```yaml
User: "Format this data according to spec"

Orchestrator:
  analyze: Simple formatting task
  complexity: Low (score: 2)
  context_level: 1
  
  execute_directly:
    - Load spec from context/standards/
    - Format data
    - Return result
    
  no_governance: No metadata queries needed
  
Result: Fast execution (< 1 second)
```

### Example: Moderate Request (Level 2)

```yaml
User: "Create LinkedIn post about our product"

Orchestrator:
  analyze: Content creation, needs brand alignment
  complexity: Moderate (score: 5)
  context_level: 2
  
  create_request: tmp/requests/req-abc123.json
  
  route_to_context_provider:
    request_id: req-abc123
    
  context_provider_returns:
    files:
      - context/brand/voice.md
      - context/platforms/linkedin/specs.md
      - context/platforms/linkedin/patterns.md
    estimated_tokens: 800
    
  route_to_specialist:
    agent: @linkedin-specialist
    request_id: req-abc123
    
  linkedin_specialist:
    reads: tmp/requests/req-abc123.json
    loads: Context files listed
    creates: LinkedIn post
    updates: Request file with results
    
  orchestrator_reads: tmp/requests/req-abc123.json
  cleanup: Delete temp file
  
Result: Quality content (< 10 seconds)
```

### Example: Complex Request (Level 3)

```yaml
User: "Update authentication docs after security PR merge"

Orchestrator:
  analyze: Needs governance, quality validation, catalog updates
  complexity: High (score: 9)
  context_level: 3
  
  create_request: tmp/requests/update-def456.json
  
  route_to_context_manager:
    method: update_context_after_pr
    request_id: update-def456
    pr_data: [PR info]
    
  context_manager:
    reads: tmp/requests/update-def456.json
    analyzes: What context files need updates
    
    updates_files:
      - context/system-design/authentication.md
    
    updates_metadata:
      - Embedded XML in file
      - metadata-index.json (PRIMARY)
      - Recalculates indexes
      
    routes_to_quality_validator:
      request_id: update-def456
      
    routes_to_catalog_maintainer:
      request_id: update-def456
      
    writes: tmp/requests/update-def456.json (results)
    
  orchestrator_reads: Results
  cleanup: Archive request file for audit
  
Result: Governed update with quality validation (< 30 seconds)
```

---

## Benefits of This Architecture

### 1. **Universal Applicability**
- Works for any domain (code, content, data, support, etc.)
- Profiles customize for specific use cases
- Same architecture, different knowledge

### 2. **Intelligent Context Management**
- 3-level system prevents overload
- Metadata-driven fast queries
- Quality validation built-in

### 3. **No Context Loss**
- Request ID protocol
- Explicit context passing
- Full audit trail

### 4. **Governance When Needed**
- Optional governance layer
- Automated quality workflows
- Lifecycle management

### 5. **Easy to Install and Use**
- One-command installation
- Pre-built profiles
- Clear documentation

### 6. **Debuggable and Resumable**
- Request files show full processing chain
- Checkpoint files for long workflows
- Easy troubleshooting

---

## Next: Implementation

With this unified architecture, we can now build:

1. ✅ **Base installation script** - Installs ~/nexus/
2. ✅ **Project installation script** - Installs .nexus/ into projects
3. ✅ **Default profile** - Context-aware orchestration
4. ✅ **Governance profile** - Full data governance
5. ✅ **Content profile** - Combines both for content creation
6. ✅ **Documentation** - Clear guides and examples

**Ready to start building?** Let me know which name you want to use (NexusAgent or MindStack) and I'll create the complete system!
