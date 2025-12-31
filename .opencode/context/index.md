# Context Index

## Core Context (Universal)

Path: `.opencode/context/core/{category}/{file}`

### Quick Map
```
code        → standards/code.md       [critical] implement, refactor, architecture
docs        → standards/docs.md       [critical] write docs, README, documentation
tests       → standards/tests.md      [critical] write tests, testing, TDD → deps: code
patterns    → standards/patterns.md   [high]     error handling, security, validation
analysis    → standards/analysis.md   [high]     analyze, investigate, debug

delegation  → workflows/delegation.md [high]     delegate, task tool, subagent
review      → workflows/review.md     [high]     review code, audit → deps: code, patterns
breakdown   → workflows/task-breakdown.md [high] break down, 4+ files → deps: delegation
sessions    → workflows/sessions.md   [medium]   session management, cleanup
```

### Categories

**Standards** - Code quality, testing, documentation standards (critical priority)
**Workflows** - Process templates for delegation, review, task breakdown (high priority)
**System** - Documentation and guides (medium priority)

---

## Category-Specific Context

### Development
Path: `.opencode/context/development/{file}`

```
clean-code      → development/clean-code.md      [high] coding standards, best practices
react-patterns  → development/react-patterns.md  [high] React, hooks, components
api-design      → development/api-design.md      [high] REST, GraphQL, API versioning
```

**Used by**: frontend-specialist, backend-specialist, devops-specialist, codebase-agent

### Content
Path: `.opencode/context/content/{file}`

```
copywriting     → content/copywriting-frameworks.md [high] AIDA, PAS, persuasive writing
tone-voice      → content/tone-voice.md             [high] brand voice, tone guidelines
```

**Used by**: copywriter, technical-writer

### Product
Path: `.opencode/context/product/{file}`

*No context files yet. Category ready for product-related context.*

### Data
Path: `.opencode/context/data/{file}`

*No context files yet. Category ready for data-related context.*

### Learning
Path: `.opencode/context/learning/{file}`

*No context files yet. Category ready for learning-related context.*

---

## OpenAgents Repository Context

Path: `.opencode/context/openagents-repo/{file}`

**Purpose**: Context for working on the OpenAgents repository itself (not user projects)

### Quick Start (Load First)
```
quick-start     → openagents-repo/quick-start.md     [critical] orientation, common commands
```

### Core Concepts (Load Before Working)
```
agents          → openagents-repo/core-concepts/agents.md     [critical] how agents work
evals           → openagents-repo/core-concepts/evals.md      [critical] how testing works
registry        → openagents-repo/core-concepts/registry.md   [critical] how registry works
categories      → openagents-repo/core-concepts/categories.md [high]     how organization works
```

### Guides (Task-Specific Workflows)
```
adding-agent    → openagents-repo/guides/adding-agent.md      [high] step-by-step agent creation
testing-agent   → openagents-repo/guides/testing-agent.md     [high] testing workflow
updating-registry → openagents-repo/guides/updating-registry.md [medium] registry workflow
creating-release → openagents-repo/guides/creating-release.md [medium] release workflow
debugging       → openagents-repo/guides/debugging.md         [medium] troubleshooting
```

### Lookup (Quick Reference)
```
file-locations  → openagents-repo/lookup/file-locations.md    [medium] where everything is
commands        → openagents-repo/lookup/commands.md          [medium] command reference
```

### Templates (For Subagent Coordination)
```
context-bundle  → openagents-repo/templates/context-bundle-template.md [high] template for delegating to subagents
```

### Examples (Reference Implementations)
```
bundle-example  → openagents-repo/examples/context-bundle-example.md [medium] example context bundle
```

**Loading Strategy**:
- **First time**: Load `quick-start.md`
- **Add agent**: Load `quick-start.md` + `core-concepts/agents.md` + `guides/adding-agent.md`
- **Test agent**: Load `quick-start.md` + `core-concepts/evals.md` + `guides/testing-agent.md`
- **Fix registry**: Load `quick-start.md` + `core-concepts/registry.md` + `guides/updating-registry.md`
- **Find files**: Load `quick-start.md` + `lookup/file-locations.md`

**Use When**:
- Adding new agents, commands, or tools to OpenAgents
- Modifying eval framework or registry system
- Working on OpenAgents infrastructure
- Fixing bugs in the framework
- Writing OpenAgents documentation

**Don't Use When**:
- Working on user projects (use project-specific context)
- General coding tasks (use core/standards/)

---

## Loading Instructions

**For common tasks, use quick map above. For keyword matching, scan triggers.**

**Format:** `id → path [priority] triggers → deps: dependencies`

**Dependencies:** Load dependent contexts alongside main context for complete guidelines.
