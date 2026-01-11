# Mastra Context

**Purpose**: Documentation and quick references for Mastra implementation in this project.

**Last Updated**: 2026-01-09

---

## Navigation

### Concepts
| File | Description | Priority |
|------|-------------|----------|
| [core.md](concepts/core.md) | Central orchestration layer | critical |
| [workflows.md](concepts/workflows.md) | Linear and parallel execution chains | critical |
| [agents-tools.md](concepts/agents-tools.md) | Reusable units of logic and LLM entities | high |
| [evaluations.md](concepts/evaluations.md) | Quality assurance and scoring | high |
| [storage.md](concepts/storage.md) | Persistence layer and schema | high |

### Guides
| File | Description | Priority |
|------|-------------|----------|
| [testing.md](guides/testing.md) | How to run and validate components | high |
| [modular-building.md](guides/modular-building.md) | Best practices for large-scale Mastra | high |
| [workflow-step-structure.md](guides/workflow-step-structure.md) | Maintainable step patterns | critical |

### Lookup
| File | Description | Priority |
|------|-------------|----------|
| [mastra-config.md](lookup/mastra-config.md) | File locations and database tables | high |

### Errors
| File | Description | Priority |
|------|-------------|----------|
| [mastra-errors.md](errors/mastra-errors.md) | Common errors and recovery | high |


---

## Quick Start
1. **Explore Config**: See `src/mastra/index.ts` for the main Mastra instance.
2. **Check Workflows**: Look at `src/mastra/workflows/` for business logic.
3. **View Traces**: Run `npm run traces` to see execution history.
