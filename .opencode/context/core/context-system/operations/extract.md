# Extract Operation

**Purpose**: Extract context from docs, code, or URLs into organized context files

**Last Updated**: 2026-01-06

---

## When to Use

- Extracting from documentation (React docs, API docs, etc.)
- Extracting from codebase (patterns, conventions)
- Extracting from URLs (blog posts, guides)
- Creating initial context for new topics

---

## 7-Stage Workflow

### Stage 1: Read Source
```
/context extract from https://react.dev/hooks
  ↓
Agent: "Reading source (8,500 lines)...
Analyzing content for extractable items..."
```

**Action**: Read and analyze source material

---

### Stage 2: Analyze & Categorize
**Action**: Extract and categorize content by function

**Categorization**:
- Design decisions → `concepts/`
- Working code → `examples/`
- Step-by-step workflows → `guides/`
- Reference data (commands, paths) → `lookup/`
- Errors/gotchas → `errors/`

**Output**: List of extractable items with previews

---

### Stage 3: Select Category (APPROVAL REQUIRED)
**Action**: User chooses target category and items

**Format**:
```
Found 12 extractable items from {source}:

Concepts (8):
  ✓ [A] useState - State management hook
  ✓ [B] useEffect - Side effects hook
  ... (6 more)

Errors (4):
  ✓ [I] Hooks called conditionally
  ✓ [J] Hooks in loops
  ... (2 more)

Which category?
  [1] development/
  [2] core/
  [3] Create new category: ___

Select items (A B I or 'all') + category (1/2/3):
```

**Validation**: MUST wait for user input before proceeding

---

### Stage 4: Preview (APPROVAL REQUIRED)
**Action**: Show what will be created

**Format**:
```
Would create in development/:

  concepts/use-state.md (45 lines)
  concepts/use-effect.md (52 lines)
  errors/react-hooks-errors.md (124 lines)

Total: 12 files, ~650 lines

Preview file? (type filename or 'skip')
Approve? (yes/no/preview):
```

**If user types filename**: Show first 30 lines of that file

**Validation**: MUST get approval before proceeding

---

### Stage 5: Create
**Action**: Create files in function folders

**Process**:
1. Apply MVI format (1-3 sentences, 3-5 key points, minimal example)
2. Create files in correct function folders
3. Ensure all files <200 lines
4. Add cross-references

**Enforcement**: `@critical_rules.mvi_strict` + `@critical_rules.function_structure`

---

### Stage 6: Update Navigation
**Action**: Update README.md and add cross-references

**Process**:
1. Update category README.md with new files
2. Add priority levels (critical/high/medium/low)
3. Add cross-references between related files
4. Update "Last Updated" dates

---

### Stage 7: Report
**Action**: Show comprehensive results

**Format**:
```
✅ Extracted X items into {category}
📄 Created Y files
📊 Updated {category}/README.md

Files created:
  - {category}/concepts/ (N files)
  - {category}/examples/ (N files)
  - {category}/errors/ (N files)
```

---

## Examples

### Extract from URL
```bash
/context extract from https://react.dev/hooks
```

### Extract from Local Docs
```bash
/context extract from docs/api.md
/context extract from docs/architecture/
```

### Extract from Code
```bash
/context extract from src/utils/
```

---

## Success Criteria

- [ ] All files <200 lines?
- [ ] MVI format applied (1-3 sentences, 3-5 points, example, reference)?
- [ ] Files in correct function folders?
- [ ] README.md updated?
- [ ] Cross-references added?
- [ ] User approved before creation?

---

## Related

- standards/mvi.md - What to extract
- guides/compact.md - How to minimize
- guides/workflows.md - Interactive examples
