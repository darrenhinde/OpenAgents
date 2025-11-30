# Prompt Library System

## Overview
Implementation plan for a model-specific prompt library system that allows testing different prompt variants for different models while keeping the main branch stable.

## Architecture

```
.opencode/prompts/{agent}/
├── README.md              # Capabilities table, how to use
├── default.md             # Safe fallback (enforced in PRs)
├── {variant}.md           # Experimental variants
├── TEMPLATE.md            # For contributors
└── results/               # Test results
    └── {variant}-results.json
```

## Key Principles

1. **Default in PRs**: CI enforces that `.opencode/agent/{agent}.md` matches `.opencode/prompts/{agent}/default.md`
2. **Test from Library**: Scripts copy from prompts library → agent location during tests
3. **Store Results**: All test runs save results to `results/` folder
4. **Documentation**: Each variant documents its tested capabilities

## Implementation Tasks

### ✅ Completed

1. Created `scripts/prompts/test-prompt.sh` - Basic test script
2. Created `scripts/prompts/use-prompt.sh` - Basic usage script
3. Created implementation plan and task breakdown

### 🔄 In Progress

None

### 📋 Todo

1. **Create PR Validation Script** (`scripts/prompts/validate-pr.sh`)
   - Validates all agents use default prompts
   - Exits 1 if any agent uses non-default
   - Clear error messages

2. **Update Test Script to Store Results**
   - Enhance `test-prompt.sh` to save results
   - Create results JSON files
   - Update README with test results

3. **Create Prompts Library Structure**
   - Set up `.opencode/prompts/` directory
   - Create README files
   - Copy current prompts as defaults
   - Create TEMPLATE.md

4. **Update CI Workflow**
   - Add prompt validation to `.github/workflows/validate-registry.yml`
   - Run on all PRs
   - Show clear error messages

5. **Update Documentation**
   - Update `CONTRIBUTING.md` with prompt system
   - Update main `README.md` with model compatibility
   - Create `docs/guides/prompt-variants.md`

6. **Create Demo Script**
   - Interactive repository showcase
   - Quick tour mode
   - Full demo mode
   - Shows prompt library system

## Task Details

See individual task files in `tasks/subtasks/prompt-library-system/`:
- `01-create-pr-validation-script.md`
- `02-update-test-script-store-results.md`
- `03-create-prompts-library-structure.md`
- `04-update-ci-workflow.md`
- `05-update-documentation.md`
- `06-create-demo-script.md`

## Related Work

- `tasks/subtasks/openagent-fix/EXPERIMENT_JOURNAL.md` - Experiments that led to this design
- `tasks/subtasks/openagent-fix/CORE_TEST_FAILURES.md` - Test failure analysis
- `scripts/prompts/` - Prompt management scripts

## Success Criteria

- [ ] PR validation enforces default prompts
- [ ] Test results are automatically stored
- [ ] Prompts library is well-documented
- [ ] CI validates all PRs
- [ ] Documentation is clear and complete
- [ ] Demo script showcases the system

## Timeline

- **Week 1**: Scripts and library structure
- **Week 2**: CI integration and documentation
- **Week 3**: Testing and refinement
