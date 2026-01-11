# Standard: Task JSON Schema

**Purpose**: JSON schema reference for task management files

**Last Updated**: 2026-01-11

---

## Core Concepts

Task management uses two JSON file types:
- `task.json` - Feature-level metadata and tracking
- `subtask_NN.json` - Individual atomic tasks with dependencies

Location: `.tmp/tasks/{feature-slug}/` (at project root)

---

## task.json Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | kebab-case identifier |
| `name` | string | Yes | Human-readable name (max 100) |
| `status` | enum | Yes | active / completed / blocked / archived |
| `objective` | string | Yes | One-line objective (max 200) |
| `context_files` | array | No | Paths to lazy-load |
| `exit_criteria` | array | No | Completion conditions |
| `subtask_count` | int | No | Total subtasks |
| `completed_count` | int | No | Done subtasks |
| `created_at` | datetime | Yes | ISO 8601 |
| `completed_at` | datetime | No | ISO 8601 |

---

## subtask_NN.json Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | {feature}-{seq} |
| `seq` | string | Yes | 2-digit (01, 02) |
| `title` | string | Yes | Task title (max 100) |
| `status` | enum | Yes | pending / in_progress / completed / blocked |
| `depends_on` | array | No | Sequence numbers of dependencies |
| `parallel` | bool | No | True if can run alongside others |
| `context_files` | array | No | Task-specific context |
| `acceptance_criteria` | array | No | Binary pass/fail conditions |
| `deliverables` | array | No | Files to create/modify |
| `agent_id` | string | No | Set when in_progress |
| `started_at` | datetime | No | ISO 8601 |
| `completed_at` | datetime | No | ISO 8601 |
| `completion_summary` | string | No | What was done (max 200) |

---

## Status Transitions

```
pending → in_progress   (by working agent, when deps satisfied)
in_progress → completed (by TaskManager, after verification)
* → blocked             (by either, when issue found)
blocked → pending       (when unblocked)
```

---

## Parallel Flag

- `parallel: true` = Isolated task, can run alongside others
- `parallel: false` = May affect shared state, run sequentially

Use `task-cli.ts parallel` to find all parallelizable tasks ready to run.

---

## Example

```json
{
  "id": "auth-system-02",
  "seq": "02",
  "title": "Create JWT service",
  "status": "pending",
  "depends_on": ["01"],
  "parallel": false,
  "context_files": [".opencode/context/development/backend/auth/jwt-patterns.md"],
  "acceptance_criteria": ["JWT tokens signed with RS256", "Tests pass"],
  "deliverables": ["src/auth/jwt.service.ts"]
}
```

---

## Related

- `../guides/splitting-tasks.md` - How to decompose features
- `../guides/managing-tasks.md` - Lifecycle workflow
- `../lookup/task-commands.md` - CLI reference
