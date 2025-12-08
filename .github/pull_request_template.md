## Description
<!-- Provide a brief description of your changes -->

## Type of Change
<!-- Check all that apply -->
- [ ] New agent/subagent
- [ ] New command
- [ ] New tool/plugin
- [ ] Bug fix
- [ ] Documentation update
- [ ] Refactoring/cleanup
- [ ] CI/CD improvement
- [ ] Other (please describe):

## Changes Made
<!-- List the specific changes -->
- 
- 
- 

## Checklist
<!-- Ensure all items are checked before submitting -->

### Required
- [ ] **Registry**: Auto-updated by CI (or manually updated if needed)
- [ ] **Tests**: All tests pass locally (`npm run test:core` or relevant tests)
- [ ] **Documentation**: Updated relevant docs (README, guides, etc.)
- [ ] **Contributing**: Followed [CONTRIBUTING.md](docs/contributing/CONTRIBUTING.md) guidelines

### For Agent/Command Changes
- [ ] **Default prompts**: Agent files use default prompts (not variants from `.opencode/prompts/`)
- [ ] **YAML frontmatter**: All required fields present (description, mode, tools, etc.)
- [ ] **Metadata**: Description matches registry entry
- [ ] **Testing**: Tested with `opencode --agent <agent-name>`

### For Code Changes
- [ ] **Linting**: Code follows project style
- [ ] **Security**: No hardcoded secrets or credentials
- [ ] **Dependencies**: New dependencies justified and documented

## Testing
<!-- Describe how you tested these changes -->

**Test environment:**
- OS: [e.g., macOS 14.0, Ubuntu 22.04]
- OpenCode CLI version: [run `opencode --version`]
- Installation profile: [essential/developer/business/full/advanced]

**Test steps:**
1. 
2. 
3. 

**Test results:**
<!-- Paste relevant output or screenshots -->

## Related Issues
<!-- Link related issues -->
Closes #(issue)
Relates to #(issue)

## Additional Context
<!-- Add any other context, screenshots, or information -->

---

## For Maintainer Review

### Automated Checks
The following will run automatically:
- ✅ Registry validation and auto-update
- ✅ Prompt validation (ensures defaults used)
- ✅ Component path validation
- ✅ Smoke tests (if agent/command changed)

### Manual Review Checklist
- [ ] Changes align with project goals
- [ ] Code quality is acceptable
- [ ] Documentation is clear and complete
- [ ] No breaking changes (or properly documented)
- [ ] Security considerations addressed
