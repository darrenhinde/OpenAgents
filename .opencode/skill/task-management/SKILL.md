---
name: task-management
description: Task management CLI for tracking and managing feature subtasks with status, dependencies, and validation
---

## What I do

I provide a command-line interface for managing task breakdowns created by the TaskManager subagent. I help you:

- **Track progress** - See status of all features and their subtasks
- **Find next tasks** - Show eligible tasks (dependencies satisfied)
- **Identify blocked tasks** - See what's blocked and why
- **Manage completion** - Mark subtasks as complete with summaries
- **Validate integrity** - Check JSON files and dependency trees

## How to use me

### Basic Commands

```bash
# Show all task statuses
npx ts-node .opencode/skill/task-management/scripts/task-cli.ts status

# Show next eligible tasks
npx ts-node .opencode/skill/task-management/scripts/task-cli.ts next

# Show blocked tasks
npx ts-node .opencode/skill/task-management/scripts/task-cli.ts blocked

# Mark a task complete
npx ts-node .opencode/skill/task-management/scripts/task-cli.ts complete <feature> <seq> "summary"

# Validate all tasks
npx ts-node .opencode/skill/task-management/scripts/task-cli.ts validate
```

### Command Reference

| Command | Description |
|---------|-------------|
| `status [feature]` | Show task status summary for all features or specific one |
| `next [feature]` | Show next eligible tasks (dependencies satisfied) |
| `parallel [feature]` | Show parallelizable tasks ready to run |
| `deps <feature> <seq>` | Show dependency tree for a specific subtask |
| `blocked [feature]` | Show blocked tasks and why |
| `complete <feature> <seq> "summary"` | Mark subtask complete with summary |
| `validate [feature]` | Validate JSON files and dependencies |

## Examples

### Check Overall Progress

```
$ npx ts-node .opencode/skill/task-management/scripts/task-cli.ts status

[my-feature] My Feature Implementation
  Status: active | Progress: 45% (5/11)
  Pending: 3 | In Progress: 2 | Completed: 5 | Blocked: 1
```

### Find What's Next

```
$ npx ts-node .opencode/skill/task-management/scripts/task-cli.ts next

=== Ready Tasks (deps satisfied) ===

[my-feature]
  06 - Implement API endpoint [sequential]
  08 - Write unit tests [parallel]
```

### Mark Complete

```
$ npx ts-node .opencode/skill/task-management/scripts/task-cli.ts complete my-feature 05 "Implemented authentication module"

✓ Marked my-feature/05 as completed
  Summary: Implemented authentication module
  Progress: 6/11
```

### Check Dependencies

```
$ npx ts-node .opencode/skill/task-management/scripts/task-cli.ts deps my-feature 07

=== Dependency Tree: my-feature/07 ===

07 - Write integration tests [pending]
  ├── ✓ 05 - Implement authentication module [completed]
  └── ○ 06 - Implement API endpoint [in_progress]
```

### Validate Everything

```
$ npx ts-node .opencode/skill/task-management/scripts/task-cli.ts validate

=== Validation Results ===

[my-feature]
  ✓ All checks passed
```

## Architecture

```
.opencode/
└── skill/
    └── task-management/
        ├── SKILL.md                          # This file
        ├── router.sh                         # Routes to task-cli.ts
        └── scripts/
            └── task-cli.ts                   # Task management CLI
```

## Task File Structure

Tasks are stored in `.tmp/tasks/` at the project root:

```
.tmp/tasks/
├── {feature-slug}/
│   ├── task.json                             # Feature-level metadata
│   ├── subtask_01.json                       # Subtask definitions
│   ├── subtask_02.json
│   └── ...
└── completed/
    └── {feature-slug}/                       # Completed tasks
```

### task.json Schema

```json
{
  "id": "my-feature",
  "name": "My Feature",
  "status": "active",
  "objective": "Implement X",
  "context_files": ["docs/spec.md"],
  "exit_criteria": ["Tests pass", "Code reviewed"],
  "subtask_count": 5,
  "completed_count": 2,
  "created_at": "2026-01-11T10:00:00Z",
  "completed_at": null
}
```

### subtask_##.json Schema

```json
{
  "id": "my-feature-05",
  "seq": "05",
  "title": "Implement authentication",
  "status": "pending",
  "depends_on": ["03", "04"],
  "parallel": false,
  "context_files": ["docs/auth.md"],
  "acceptance_criteria": ["Login works", "JWT tokens valid"],
  "deliverables": ["auth.ts", "auth.test.ts"],
  "agent_id": "coder-agent",
  "started_at": null,
  "completed_at": null,
  "completion_summary": null
}
```

## Integration with TaskManager

The TaskManager subagent creates task files using this format. When you delegate to TaskManager:

```
task(subagent_type="TaskManager", description="Implement feature X")
```

TaskManager creates:
1. `.tmp/tasks/{feature}/task.json` - Feature metadata
2. `.tmp/tasks/{feature}/subtask_XX.json` - Individual subtasks

You can then use this skill to track and manage progress.

## Key Concepts

### 1. Dependency Resolution
Subtasks can depend on other subtasks. A task is "ready" only when all its dependencies are complete.

### 2. Parallel Execution
Set `parallel: true` to indicate a subtask can run alongside other parallel tasks with satisfied dependencies.

### 3. Status Tracking
- **pending** - Not started, waiting for dependencies
- **in_progress** - Currently being worked on
- **completed** - Finished with summary
- **blocked** - Explicitly blocked (not waiting for deps)

### 4. Exit Criteria
Each feature has exit_criteria that must be met before marking the feature complete.

---

**Task Management Skill** - Track, manage, and validate your feature implementations!
