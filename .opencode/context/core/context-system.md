# Context System

**Purpose**: Minimal, function-based knowledge organization for AI agents

**Last Updated**: 2026-01-06

---

## Core Principles

### 1. Minimal Viable Information (MVI)
Extract only core concepts (1-3 sentences), key points (3-5 bullets), minimal example, and reference link. 
**Goal**: Scannable in <30 seconds. Reference full docs, don't duplicate them.

### 2. Function-Based Structure
Organize by what info does, not just topic:
- `concepts/` - Core ideas, "what is it?"
- `examples/` - Minimal working code
- `guides/` - Step-by-step workflows
- `lookup/` - Quick reference tables
- `errors/` - Common issues + fixes

### 3. Easy Navigation
Every directory has `README.md` with navigation map. Think: table of contents with priority levels.

### 4. Knowledge Harvesting
Extract valuable context from AI summaries/overviews, then delete them. Workspace stays clean, knowledge persists.

---

## Directory Structure

```
.opencode/context/{category}/
├── README.md              # Navigation map
├── concepts/              # What it is
├── examples/              # Working code
├── guides/                # How to do it
├── lookup/                # Quick reference
└── errors/                # Common issues
```

---

## Operations

### Harvest (`/context harvest`)

**Purpose**: Extract knowledge from summary files → permanent context, then clean up.

**Process**:
1. Scan for patterns: `*OVERVIEW.md`, `*SUMMARY.md`, `SESSION-*.md`, `CONTEXT-*.md`
2. Analyze content:
   - Design decisions → `concepts/`
   - Solutions/patterns → `examples/`
   - Workflows → `guides/`
   - Errors encountered → `errors/`
   - Reference data → `lookup/`
3. Present approval UI (letter-based: `A B C` or `all`)
4. Extract + minimize (apply MVI)
5. Archive/delete summaries
6. Report results

**Approval Format**:
```
Found: AUTH-WORK.md
✓ [A] Error: JWT expiration → errors/auth-errors.md
✓ [B] Example: Refresh flow → examples/jwt-refresh.md
✗ Skip: Planning notes

Type 'A B' or 'all':
```

---

### Extract (`/context extract`)

**Purpose**: Extract context from docs/code/URLs.

**Process**:
1. Read source
2. Extract core concepts (1-3 sentences each)
3. Find minimal examples
4. Identify workflows (numbered steps)
5. Build lookup tables
6. Capture errors/gotchas
7. Create references

**Output**: Follow MVI template below.

---

### Organize (`/context organize`)

**Purpose**: Restructure existing files into function-based folders.

**Process**:
1. Scan category
2. Categorize by function (concept/example/guide/lookup/error)
3. Create missing directories
4. Move/refactor files
5. Update README.md
6. Fix references

---

### Update (`/context update`)

**Purpose**: Update context when APIs/frameworks change.

**Process**:
1. Identify what changed
2. Find affected files
3. Update concepts, examples, guides, lookups
4. Add migration notes to errors/
5. Validate references

---

## File Templates

### Concept File (max 100 lines)
```markdown
# Concept: {Name}

**Core Idea**: [1-3 sentences]

**Key Points**:
- Point 1
- Point 2
- Point 3

**Quick Example**:
[Minimal code snippet]

**Reference**: [Link to docs]

**Related**: concepts/x.md, examples/y.md
```

### Error File (max 150 lines)
```markdown
# Errors: {Framework}

## Error: {Name}

**Symptom**: [What you see]

**Cause**: [Why - 1 sentence]

**Solution**:
1. Step 1
2. Step 2

**Prevention**: [How to avoid]

**Reference**: [Link]
```

### README.md (directory root, max 100 lines)
```markdown
# {Category} Context

**Purpose**: [1-2 sentences]

---

## Quick Navigation

### Concepts
| File | Description | Priority |
|------|-------------|----------|
| [topic.md](concepts/topic.md) | Core idea | critical |

### Examples
| File | Description | Priority |
|------|-------------|----------|
| [example.md](examples/example.md) | Working code | high |

[Repeat for guides/, lookup/, errors/]

---

## Loading Strategy

**For {task}**: Load concepts/x.md → examples/y.md → guides/z.md
```

---

## Extraction Rules

### ✅ Extract:
- Core concepts (minimal)
- Essential patterns
- Step-by-step workflows
- Critical errors
- Quick reference data
- Links to detailed docs

### ❌ Don't Extract:
- Verbose explanations
- Complete API docs
- Implementation details
- Historical context
- Marketing content
- Duplicate info

---

## Success Criteria

✅ **Minimal** - Core info only, <200 lines per file
✅ **Navigable** - README.md at every root
✅ **Organized** - Function-based folders
✅ **Referenceable** - Links to full docs
✅ **Searchable** - Errors easily findable
✅ **Maintainable** - Easy to update

---

## Quick Commands

```bash
/context harvest              # Clean up summaries
/context extract {source}     # From docs/code
/context organize {category}  # Restructure
/context update {what}        # When APIs change
```
