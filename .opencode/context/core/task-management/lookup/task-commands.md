# Lookup: Task CLI Commands

**Purpose**: Quick reference for task-cli.ts commands

**Last Updated**: 2026-01-11

---

## Usage

```bash
npx ts-node .opencode/context/tasks/scripts/task-cli.ts <command> [args]
```

Task files are stored in `.tmp/tasks/` at the project root.

---

## Commands

### status [feature]

Show task status summary for all features or specific feature.

```bash
task-cli.ts status
task-cli.ts status my-feature
```

**Output**:
```
[my-feature] My Feature Name
  Status: active | Progress: 40% (2/5)
  Pending: 2 | In Progress: 1 | Completed: 2 | Blocked: 0
```

---

### next [feature]

Show tasks ready to work on (deps satisfied).

```bash
task-cli.ts next
task-cli.ts next my-feature
```

**Output**:
```
=== Ready Tasks (deps satisfied) ===

[my-feature]
  02 - Create JWT service  [sequential]
  03 - Write unit tests    [parallel]
```

---

### parallel [feature]

Show only parallelizable tasks ready now.

```bash
task-cli.ts parallel
task-cli.ts parallel my-feature
```

**Use**: Batch multiple isolated tasks for parallel execution.

---

### deps \<feature\> \<seq\>

Show dependency tree for a specific task.

```bash
task-cli.ts deps my-feature 04
```

**Output**:
```
=== Dependency Tree: my-feature/04 ===

04 - Integration tests [pending]
  ├── ✓ 01 - Setup database [completed]
  └── ○ 02 - Create API [pending]
      └── ✓ 01 - Setup database [completed]
```

---

### blocked [feature]

Show blocked tasks and reasons.

```bash
task-cli.ts blocked
task-cli.ts blocked my-feature
```

**Output**:
```
=== Blocked Tasks ===

[my-feature]
  04 - Integration tests (waiting: 02, 03)
  05 - Deploy (explicitly blocked)
```

---

### complete \<feature\> \<seq\> "summary"

Mark task as completed with summary (max 200 chars).

```bash
task-cli.ts complete my-feature 02 "Created JWT service with RS256 signing"
```

**Effect**:
- Sets `status: "completed"`
- Sets `completed_at` timestamp
- Sets `completion_summary`
- Updates `task.json` counts

---

### validate [feature]

Check JSON validity, dependencies, circular refs.

```bash
task-cli.ts validate
task-cli.ts validate my-feature
```

**Checks**:
- task.json exists
- ID format correct
- Dependencies exist
- No circular dependencies
- Counts match

**Output**:
```
[my-feature]
  ✓ All checks passed

[broken-feature]
  ✗ ERROR: 03: depends on non-existent task 99
  ⚠ WARNING: 02: No acceptance criteria defined
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error (validate found issues, missing args) |

---

## Related

- `../standards/task-schema.md` - JSON schema reference
- `../guides/managing-tasks.md` - Workflow guide
