# NexusAgent - Master Plan
**Version:** 1.0  
**Date:** 2025-10-29  
**Status:** Planning Phase

---

## Executive Summary

**NexusAgent** is an open-source, universal AI agent orchestration system that combines:
1. **Context-Aware Orchestration** - Hierarchical agent routing with 3-level dynamic context allocation
2. **Data Governance** - Treating context as governed data assets with quality, lifecycle, and metadata management

**Target Users:** Developers, data teams, content creators, AI engineers  
**Primary Use Cases:** Any domain requiring intelligent AI workflows with governed context

---

## Core Decisions

### ✅ Name & Branding
- **Product Name:** NexusAgent
- **CLI Command:** `nexus`
- **Domain:** nexus.nextsystems.ai (open-source on GitHub)
- **Repository:** nextsystems/nexus
- **Tagline:** "The central hub for intelligent AI orchestration"

### ✅ Installation Method
```bash
# One-command installation from GitHub
curl -sSL https://raw.githubusercontent.com/nextsystems/nexus/main/scripts/install.sh | bash

# Or manual
git clone https://github.com/nextsystems/nexus.git ~/nexus
~/nexus/scripts/base-install.sh
```

### ✅ Foundational Principles

**From Building Context-Aware Systems:**
1. **3-Level Context Allocation**
   - Level 1 (80%): Complete isolation - task description only
   - Level 2 (15%): Filtered context - relevant domain knowledge
   - Level 3 (5%): Full context - complete system state

2. **Hierarchical Agent Architecture**
   - Main orchestrator analyzes and routes
   - Specialized subagents execute specific tasks
   - Context provider intelligently selects context

3. **XML Prompt Engineering**
   - Research-backed component ordering (Context → Role → Task → Instructions → Output)
   - Semantic tags for clarity
   - Component ratios optimized for performance

4. **Modular Context Files**
   - 50-200 lines per file (optimal)
   - Organized by domain/processes/standards/templates
   - Discoverable and maintainable

**From Data Governance Agent System:**
1. **Request ID Protocol**
   - Every agent interaction creates `tmp/requests/{uuid}.json`
   - All agents read same request file (no context loss)
   - Full audit trail with processing chain
   - Resumable workflows with checkpoints

2. **Dual Metadata System**
   - **PRIMARY:** `metadata-index.json` (fast JSON queries, no file I/O)
   - **SECONDARY:** Embedded XML in files (travels with content, backup)
   - Nightly sync ensures consistency
   - File always wins on conflict

3. **Explicit Context Passing**
   - No implicit assumptions
   - Complete context in temp files
   - Any agent can resume from any point
   - Easy debugging

4. **Quality & Lifecycle Management**
   - 6 dimensions of data quality (accuracy, completeness, consistency, timeliness, validity, uniqueness)
   - Lifecycle states: CREATE → ACTIVE → REVIEW → ARCHIVE → DELETE
   - Automated workflows (daily, weekly, monthly)
   - Lock-based concurrency control

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      USER REQUEST                           │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              MAIN ORCHESTRATOR AGENT                        │
│  • Analyzes request complexity (simple/moderate/complex)    │
│  • Determines context level (1/2/3)                         │
│  • Routes to appropriate specialists                        │
│  • Creates request files for coordination                   │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌─────▼─────┐  ┌──────▼──────┐
│  LEVEL 1     │  │  LEVEL 2   │  │   LEVEL 3   │
│  Direct      │  │  Context   │  │   Context   │
│  Execute     │  │  Provider  │  │   Manager   │
│  (80%)       │  │  (15%)     │  │   (5%)      │
└──────────────┘  └─────┬──────┘  └──────┬──────┘
                        │                │
                        ↓                ↓
              Smart Context      Full Governance
              Selection          + Quality Checks
                        │                │
                        ↓                ↓
              tmp/requests/      metadata-index.json
              req-{uuid}.json    Lifecycle Management
                        │                │
                        └────────┬───────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
              ┌─────▼────┐ ┌────▼─────┐ ┌───▼──────┐
              │Specialist│ │Specialist│ │Specialist│
              │    A     │ │    B     │ │    C     │
              └──────────┘ └──────────┘ └──────────┘
```

---

## Directory Structure

### Base Installation (`~/nexus/`)
```
~/nexus/
├── README.md
├── LICENSE (MIT)
├── config.example.yml
├── config.yml (user's config)
│
├── profiles/                    # Pre-built profiles
│   ├── default/                # Basic orchestration
│   ├── governance/             # Data governance
│   ├── content/                # Content creation
│   └── custom-example/         # Example custom profile
│
├── scripts/
│   ├── install.sh              # Main installation script
│   ├── project-install.sh      # Install into project
│   ├── update.sh               # Update installation
│   ├── create-profile.sh       # Create custom profile
│   └── lib/
│       ├── colors.sh
│       ├── validation.sh
│       └── utils.sh
│
├── templates/                   # Templates for custom creation
│   ├── agent-template.md
│   ├── command-template.md
│   ├── context-template.md
│   └── profile-template/
│
└── docs/
    ├── quick-start.md
    ├── architecture.md
    ├── profiles.md
    └── customization.md
```

### Project Installation (`project/.nexus/`)
```
your-project/
└── .nexus/                      # or .opencode, .ai, etc.
    ├── nexus.json              # Project configuration
    ├── README.md               # Auto-generated guide
    │
    ├── agent/
    │   ├── main-orchestrator.md
    │   ├── context-provider.md  # (Level 2+ contexts)
    │   └── subagents/
    │       ├── specialist-a.md
    │       └── specialist-b.md
    │
    ├── command/                 # Slash commands
    │   ├── workflow.md
    │   └── execute.md
    │
    ├── context/                 # Domain knowledge
    │   ├── core/               # Always available
    │   ├── domain/             # Domain-specific
    │   ├── processes/          # Workflows
    │   ├── standards/          # Quality rules
    │   └── templates/          # Reusable patterns
    │
    └── governance/              # (If governance enabled)
        ├── metadata-index.json  # PRIMARY metadata
        ├── workflow-state.json  # Workflow state machine
        ├── tmp/
        │   └── requests/       # Request context files
        └── logs/
            ├── access.log
            ├── changes.log
            └── workflows.log
```

---

## Profile System

### Profile: Default (Context-Aware Orchestration)

**Purpose:** Universal hierarchical orchestration for any domain

**Components:**
```yaml
agents:
  - main-orchestrator.md       # Intelligent routing
  - context-provider.md        # Smart context selection
  - task-planner.md           # Multi-step planning
  - subagents/
    - code-reviewer.md
    - test-writer.md
    - doc-writer.md

commands:
  - workflow.md               # Main entry point
  - plan-task.md             # Complex planning
  - execute-task.md          # Step execution

context:
  - core/essential-patterns.md
  - architecture/project-structure.md
  - workflows/simple-task.md
  - workflows/complex-feature.md

governance: minimal
  - metadata-index.json (basic tracking)
  - No automated workflows
  
config:
  context_level: 2
  enable_governance: false
```

### Profile: Governance (Data Management)

**Purpose:** Full data governance for context as data assets

**Components:**
```yaml
agents:
  - main-orchestrator.md       # Routes to governance
  - governance/
    - context-manager.md       # Primary governance agent
    - subagents/
      - quality-validator.md
      - lifecycle-manager.md
      - metadata-updater.md
      - catalog-maintainer.md

commands:
  - get-context.md            # Retrieve with quality check
  - update-context.md         # Update after changes
  - validate-quality.md       # Quality validation
  - lifecycle-review.md       # Lifecycle management
  - sync-metadata.md          # Force metadata sync

context:
  - governance/
    - metadata-schema.md
    - quality-dimensions.md
    - lifecycle-states.md
    - sync-strategies.md
  - workflows/
    - context-retrieval.md
    - context-update.md
    - quality-validation.md

governance: full
  - metadata-index.json (PRIMARY with indexes)
  - workflow-state.json (state machine)
  - Automated workflows:
    - daily_quality_sample
    - weekly_lifecycle_review
    - monthly_deep_audit
  - Nightly sync job
  - Full audit logging
  - Lock-based concurrency
  
config:
  context_level: 3
  enable_governance: true
  metadata_sync: "0 4 * * *"
  quality_workflows: true
```

### Profile: Content (Combines Both)

**Purpose:** Content creation with platform optimization and governance

**Components:**
```yaml
agents:
  # Orchestration
  - content-orchestrator.md
  - context-provider.md
  
  # Content specialists
  - subagents/
    - twitter-specialist.md
    - linkedin-specialist.md
    - blog-specialist.md
    - research-assistant.md
    - content-validator.md
    
  # Governance (inherited)
  - governance/context-manager.md
  - governance/subagents/ (all)

commands:
  - create-content.md
  - new-project.md
  - work-on.md
  - validate.md
  - publish.md

context:
  # Content domain
  - brand/voice.md
  - brand/accuracy-guidelines.md
  - platforms/twitter/specs.md
  - platforms/linkedin/specs.md
  - workflows/multi-platform.md
  
  # Governance (inherited)
  - governance/ (all)

governance: full
  - All governance features enabled
  - Content lifecycle tracking
  - Quality validation for content
  
config:
  context_level: 2
  enable_governance: true
  enable_research: true
```

---

## Configuration System

### Global Config (`~/nexus/config.yml`)

```yaml
# NexusAgent Configuration
version: "1.0.0"

# User information
user:
  name: "Your Name"
  email: "your@email.com"

# Installation defaults
defaults:
  profile: "default"
  ai_tool: "opencode"
  folder_name: ".nexus"
  context_level: 2
  enable_governance: false
  backup_existing: true

# Profile-specific overrides
profiles:
  governance:
    context_level: 3
    enable_governance: true
    metadata_sync: "0 4 * * *"
    quality_workflows: true
    
  content:
    context_level: 2
    enable_governance: true
    enable_research: true

# AI tool integration
ai_tools:
  opencode:
    commands_folder: "command"
    agents_folder: "agent/subagents"
    context_folder: "context"
    use_skills: true
    
  cursor:
    prompts_folder: ".cursor/prompts"
    agents_folder: ".cursor/agents"
    use_skills: false

# Advanced settings
advanced:
  verbose_logging: false
  telemetry: false           # Privacy-first
  auto_update_check: true
  update_channel: "stable"

# Installation behavior
install:
  create_examples: true
  create_docs: true
  run_validation: true
  show_tips: true
```

### Project Config (`.nexus/nexus.json`)

```json
{
  "version": "1.0.0",
  "profile": "governance",
  "ai_tool": "opencode",
  "installed_at": "2025-10-29T10:00:00Z",
  "nexus_version": "1.0.0",
  "config": {
    "context_level": 3,
    "enable_governance": true
  },
  "metadata": {
    "project_name": "My Project",
    "project_type": "data-governance"
  }
}
```

---

## Implementation Phases

### Phase 1: Core Foundation ✅ (Planning)
- [x] Architecture design
- [x] Profile system design
- [x] Directory structure
- [ ] **Get approval on planning**

### Phase 2: Base Installation (Week 1)
- [ ] Create base repository structure
- [ ] Write installation scripts
- [ ] Create configuration templates
- [ ] Build CLI tooling

### Phase 3: Default Profile (Week 1-2)
- [ ] Main orchestrator agent
- [ ] Context provider agent
- [ ] Task planner agent
- [ ] Basic subagents (reviewer, tester, doc writer)
- [ ] Core context files
- [ ] Basic commands

### Phase 4: Governance Profile (Week 2-3)
- [ ] Context manager agent
- [ ] Quality validator subagent
- [ ] Lifecycle manager subagent
- [ ] Metadata updater subagent
- [ ] Catalog maintainer subagent
- [ ] Metadata index system
- [ ] Workflow state machine
- [ ] Automated workflows

### Phase 5: Content Profile (Week 3-4)
- [ ] Content orchestrator
- [ ] Platform specialists (Twitter, LinkedIn, Blog, YouTube)
- [ ] Research assistant
- [ ] Content validator
- [ ] Platform context files
- [ ] Brand guidelines
- [ ] Content commands

### Phase 6: Documentation & Testing (Week 4-5)
- [ ] Quick start guide
- [ ] Architecture documentation
- [ ] Profile guides
- [ ] Customization tutorials
- [ ] API reference
- [ ] Testing with real projects
- [ ] Bug fixes and refinements

### Phase 7: Launch (Week 5)
- [ ] GitHub repository public
- [ ] Website (nexus.nextsystems.ai)
- [ ] Video demonstrations
- [ ] Community Discord
- [ ] Launch announcement

---

## Success Metrics

### Technical Metrics
- ✅ Installation works on macOS, Linux, Windows (WSL)
- ✅ Context loading < 1 second for 90% of requests
- ✅ Metadata queries < 10ms (JSON index)
- ✅ No context loss between agents (request ID protocol)
- ✅ Resumable workflows with checkpoints

### User Metrics
- ✅ Time to first successful use < 15 minutes
- ✅ User satisfaction > 8/10
- ✅ Profile adoption: Default (60%), Governance (25%), Content (15%)

### Quality Metrics
- ✅ Context quality health score > 85%
- ✅ Code coverage > 80% for critical paths
- ✅ Documentation completeness > 90%

---

## Risks & Mitigations

### Risk 1: Complexity Overwhelms Users
**Mitigation:** 
- Start with simple default profile
- Progressive disclosure in documentation
- Clear examples for each use case
- Video tutorials

### Risk 2: Performance Issues with Large Context
**Mitigation:**
- JSON metadata index for fast queries
- 3-level context allocation
- Lazy loading of file contents
- Caching strategies

### Risk 3: Profile Compatibility Issues
**Mitigation:**
- Versioned profile schemas
- Validation on installation
- Clear migration guides
- Backward compatibility guarantees

### Risk 4: AI Tool Integration Breaks
**Mitigation:**
- Abstract integration layer
- Tool-specific adapters
- Comprehensive testing
- Fallback mechanisms

---

## Next Steps

1. **Review & Approve Planning** - Get feedback on this master plan
2. **Create Detailed Specifications** - Technical specs for each component
3. **Set Up Repository** - Initialize GitHub repo with structure
4. **Start Phase 2** - Build installation scripts
5. **Iterate** - Build, test, refine

---

## Open Questions

1. ❓ Should we support multiple AI tools from day one, or focus on OpenCode first?
2. ❓ What's the minimum viable profile for launch (just default, or all three)?
3. ❓ Do we need a web UI for configuration, or is CLI + YAML sufficient?
4. ❓ Should metadata index support plugins for custom quality dimensions?
5. ❓ What's the governance model for community contributions?

---

**Status:** Ready for review and approval  
**Next Action:** Get feedback on master plan, then proceed to detailed specifications
