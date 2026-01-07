# Context File Templates

**Purpose**: Standard formats for all context file types

**Last Updated**: 2026-01-06

---

## Template Selection

| Type | Max Lines | Required Sections |
|------|-----------|-------------------|
| Concept | 100 | Purpose, Core Idea (1-3 sentences), Key Points (3-5), Example (<10 lines), Reference, Related |
| Example | 80 | Purpose, Use Case, Code (10-30 lines), Explanation, Related |
| Guide | 150 | Purpose, Prerequisites, Steps (4-7), Verification, Related |
| Lookup | 100 | Purpose, Tables/Lists, Commands, Related |
| Error | 150 | Purpose, Per-error: Symptom, Cause, Solution, Prevention, Reference, Related |
| README | 100 | Purpose, Navigation tables (all 5 folders), Loading Strategy, Statistics |

---

## 1. Concept Template

```markdown
# Concept: {Name}

**Purpose**: [1 sentence]
**Last Updated**: {YYYY-MM-DD}

## Core Idea
[1-3 sentences]

## Key Points
- Point 1
- Point 2
- Point 3

## When to Use
- Use case 1
- Use case 2

## Quick Example
```lang
[<10 lines]
```

## Deep Dive
**Reference**: [Link]

## Related
- concepts/x.md
- examples/y.md
```

---

## 2. Example Template

```markdown
# Example: {What It Shows}

**Purpose**: [1 sentence]
**Last Updated**: {YYYY-MM-DD}

## Use Case
[2-3 sentences]

## Code
```lang
[10-30 lines]
```

## Explanation
1. Step 1
2. Step 2
3. Step 3

**Key points**:
- Detail 1
- Detail 2

## Related
- concepts/x.md
```

---

## 3. Guide Template

```markdown
# Guide: {Action}

**Purpose**: [1 sentence]
**Last Updated**: {YYYY-MM-DD}

## Prerequisites
- Requirement 1
- Requirement 2

**Estimated time**: X min

## Steps

### 1. {Step}
```bash
{command}
```
**Expected**: [result]

### 2. {Step}
[Repeat 4-7 steps]

## Verification
```bash
{verify command}
```

## Troubleshooting
| Issue | Solution |
|-------|----------|
| Problem | Fix |

## Related
- concepts/x.md
```

---

## 4. Lookup Template

```markdown
# Lookup: {Reference Type}

**Purpose**: Quick reference for {desc}
**Last Updated**: {YYYY-MM-DD}

## {Section}
| Item | Value | Desc |
|------|-------|------|
| x | y | z |

## Commands
```bash
# Description
{command}
```

## Paths
```
{path} - {desc}
```

## Related
- concepts/x.md
```

---

## 5. Error Template

```markdown
# Errors: {Framework}

**Purpose**: Common errors for {framework}
**Last Updated**: {YYYY-MM-DD}

## Error: {Name}

**Symptom**:
```
{error message}
```

**Cause**: [1-2 sentences]

**Solution**:
1. Step 1
2. Step 2

**Code**:
```lang
// ❌ Before
{bad}

// ✅ After
{fixed}
```

**Prevention**: [how to avoid]
**Frequency**: common/occasional/rare
**Reference**: [link]

---

[Repeat for 5-10 errors]

## Related
- concepts/x.md
```

---

## 6. README Template

```markdown
# {Category} Context

**Purpose**: [1-2 sentences]
**Last Updated**: {YYYY-MM-DD}

## Quick Navigation

### Concepts
| File | Description | Priority |
|------|-------------|----------|
| [x.md](concepts/x.md) | desc | critical |

### Examples
| File | Description | Priority |
|------|-------------|----------|
| [y.md](examples/y.md) | desc | high |

### Guides
| File | Description | Priority |
|------|-------------|----------|
| [z.md](guides/z.md) | desc | high |

### Lookup
| File | Description | Priority |
|------|-------------|----------|
| [a.md](lookup/a.md) | desc | medium |

### Errors
| File | Description | Priority |
|------|-------------|----------|
| [b.md](errors/b.md) | desc | medium |

## Loading Strategy

**For {task}**:
1. Load concepts/x.md
2. Load examples/y.md

**For troubleshooting**:
1. Load errors/z.md

## Used By
**Agents**: {list}
**Commands**: {list}

## Statistics
- Concepts: {count}
- Examples: {count}
- Total: {count}
```

---

## All Templates Must Have

1. Title with type prefix (# Concept:, # Example:, etc.)
2. **Purpose** (1 sentence)
3. **Last Updated** (YYYY-MM-DD)
4. **Related** section (cross-references)

---

## Validation

- [ ] Correct template for file type?
- [ ] Has required sections?
- [ ] Under max line limit?
- [ ] Cross-references added?
- [ ] Added to README.md?

---

## Related

- creation.md - When to use each template
- mvi-principle.md - How to fill templates
- compact.md - How to stay under limits
