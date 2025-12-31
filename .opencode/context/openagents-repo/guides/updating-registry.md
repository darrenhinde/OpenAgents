# Guide: Updating Registry

**Prerequisites**: Load `core-concepts/registry.md` first  
**Purpose**: How to update the component registry

---

## Quick Commands

```bash
# Auto-detect and add new components
./scripts/registry/auto-detect-components.sh --auto-add

# Validate registry
./scripts/registry/validate-registry.sh

# Dry run (see what would change)
./scripts/registry/auto-detect-components.sh --dry-run
```

---

## When to Update Registry

Update the registry when you:
- ✅ Add a new agent
- ✅ Add a new command
- ✅ Add a new tool
- ✅ Add a new context file
- ✅ Change component metadata
- ✅ Move or rename components

---

## Auto-Detect (Recommended)

### Step 1: Dry Run

```bash
# See what would be added/updated
./scripts/registry/auto-detect-components.sh --dry-run
```

**Output**:
```
Scanning .opencode/ for components...

Would add:
  - agent: development/api-specialist
  - context: development/api-patterns.md

Would update:
  - agent: core/openagent (description changed)
```

### Step 2: Apply Changes

```bash
# Actually update registry
./scripts/registry/auto-detect-components.sh --auto-add
```

### Step 3: Validate

```bash
# Validate registry
./scripts/registry/validate-registry.sh
```

---

## Manual Updates (Not Recommended)

Only edit `registry.json` manually if auto-detect doesn't work.

### Adding Component Manually

```json
{
  "id": "agent-name",
  "name": "Agent Name",
  "type": "agent",
  "path": ".opencode/agent/category/agent-name.md",
  "description": "Brief description",
  "category": "category",
  "tags": ["tag1", "tag2"],
  "dependencies": [],
  "version": "0.5.0"
}
```

### Validate After Manual Edit

```bash
./scripts/registry/validate-registry.sh
```

---

## Validation

### What Gets Validated

✅ **Schema** - Correct JSON structure  
✅ **Paths** - All paths exist  
✅ **IDs** - Unique IDs  
✅ **Categories** - Valid categories  
✅ **Dependencies** - Dependencies exist  

### Validation Errors

```bash
# Example errors
ERROR: Path does not exist: .opencode/agent/core/missing.md
ERROR: Duplicate ID: frontend-specialist
ERROR: Invalid category: invalid-category
ERROR: Missing dependency: subagent:nonexistent
```

### Fixing Errors

1. **Path not found**: Fix path or remove entry
2. **Duplicate ID**: Rename one component
3. **Invalid category**: Use valid category
4. **Missing dependency**: Add dependency or remove reference

---

## Testing Registry Changes

### Test Locally

```bash
# Test with local registry
REGISTRY_URL="file://$(pwd)/registry.json" ./install.sh --list

# Try installing a component
REGISTRY_URL="file://$(pwd)/registry.json" ./install.sh --component agent:your-agent
```

### Verify Component Appears

```bash
# List all agents
cat registry.json | jq '.components.agents[].id'

# Check specific component
cat registry.json | jq '.components.agents[] | select(.id == "your-agent")'
```

---

## Common Tasks

### Add New Agent to Registry

```bash
# 1. Create agent file with frontmatter
# 2. Run auto-detect
./scripts/registry/auto-detect-components.sh --auto-add

# 3. Validate
./scripts/registry/validate-registry.sh
```

### Update Component Metadata

```bash
# 1. Update frontmatter in component file
# 2. Run auto-detect with force
./scripts/registry/auto-detect-components.sh --auto-add --force

# 3. Validate
./scripts/registry/validate-registry.sh
```

### Remove Component

```bash
# 1. Delete component file
# 2. Run auto-detect (will remove from registry)
./scripts/registry/auto-detect-components.sh --auto-add

# 3. Validate
./scripts/registry/validate-registry.sh
```

---

## CI/CD Integration

### Automatic Validation

Registry is validated on:
- Pull requests (`.github/workflows/validate-registry.yml`)
- Merges to main
- Release tags

### Auto-Update on Merge

Registry can be auto-updated after merge:
```yaml
# .github/workflows/update-registry.yml
- name: Update Registry
  run: ./scripts/registry/auto-detect-components.sh --auto-add
```

---

## Best Practices

✅ **Use auto-detect** - Don't manually edit registry  
✅ **Validate often** - Catch issues early  
✅ **Test locally** - Use local registry for testing  
✅ **Dry run first** - See changes before applying  
✅ **Version consistency** - Keep versions in sync  

---

## Related Files

- **Registry concepts**: `core-concepts/registry.md`
- **Adding agents**: `guides/adding-agent.md`
- **Debugging**: `guides/debugging.md`

---

**Last Updated**: 2025-12-10  
**Version**: 0.5.0
