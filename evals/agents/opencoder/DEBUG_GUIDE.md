# OpenCoder Test Debugging Guide

Quick reference for debugging and validating opencoder tests.

---

## 🚀 Quick Start

### Run Tests with Debug Mode

```bash
cd evals/framework

# Run single test with debug
npm run eval:sdk -- --agent=opencoder --pattern="planning/*.yaml" --debug

# Run all opencoder tests with debug
npm run eval:sdk -- --agent=opencoder --debug

# Run specific category
npm run eval:sdk -- --agent=opencoder --pattern="context-loading/*.yaml" --debug
```

### View Full Conversation

```bash
# 1. Run test with --debug flag
# 2. Copy session ID from output (e.g., "Session created: ses_4ff9f7975ffeWYqM564A5ooo4y")
# 3. View conversation:

./scripts/debug/show-test-conversation.sh ses_4ff9f7975ffeWYqM564A5ooo4y
```

---

## 📁 Where Test Data Lives

### Test Results
```bash
# Latest results (summary only)
cat evals/results/latest.json | jq '.'

# Historical results
ls -lt evals/results/history/2025-12/

# View specific result
cat evals/results/history/2025-12/08-235037-opencoder.json | jq '.'
```

### Session Data (Full Conversations)
```bash
# Session messages
~/.local/share/opencode/storage/message/ses_XXXXX/*.json

# Message parts (tool calls, text, results)
~/.local/share/opencode/storage/part/msg_XXXXX/*.json
```

---

## 🔍 Inspecting Sessions

### Find Recent Sessions
```bash
# List all sessions (most recent first)
ls -lt ~/.local/share/opencode/storage/message/ | head -20

# Find specific session
find ~/.local/share/opencode/storage/message -name "ses_*" -type d | grep "ses_4ff9f7975ffeWYqM564A5ooo4y"
```

### View Session Messages
```bash
SESSION_ID="ses_4ff9f7975ffeWYqM564A5ooo4y"

# List all messages in session
ls -la ~/.local/share/opencode/storage/message/$SESSION_ID/

# View message content
cat ~/.local/share/opencode/storage/message/$SESSION_ID/msg_*.json | jq '.summary.body'
```

### View Tool Calls
```bash
MESSAGE_ID="msg_b006086a5001CXI2Ks0mFkyPxU"

# List message parts
ls -la ~/.local/share/opencode/storage/part/$MESSAGE_ID/

# View all parts
for file in ~/.local/share/opencode/storage/part/$MESSAGE_ID/*.json; do
  cat "$file" | jq '.'
done
```

---

## 🧪 Test Validation Checklist

### ✅ Planning & Approval Test

**What to check:**
1. Agent starts with "DIGGING IN..."
2. Creates implementation plan
3. Explicitly asks for approval: "Approval needed before proceeding"
4. Does NOT execute write/edit/bash without approval

**How to verify:**
```bash
npm run eval:sdk -- --agent=opencoder --pattern="planning/*.yaml" --debug
# Look for "Approval needed" in output
```

### ✅ Context Loading Test

**What to check:**
1. Agent loads `.opencode/context/core/standards/code.md`
2. Context loaded BEFORE write/edit operations
3. Tool call sequence: read (context) → write (code)

**How to verify:**
```bash
npm run eval:sdk -- --agent=opencoder --pattern="context-loading/*.yaml" --debug
# Check test output for:
# "✓ Loaded: .opencode/context/core/standards/code.md"
# "✓ Timing: Context loaded XXXXms before execution"
```

### ✅ Delegation Test

**What to check:**
1. Agent recognizes 4+ file features
2. Mentions task-manager or creates detailed plan
3. Breaks down complex features

**How to verify:**
```bash
npm run eval:sdk -- --agent=opencoder --pattern="delegation/*.yaml" --debug
# Look for "task-manager" or multi-step plan
```

---

## 📊 Understanding Test Output

### Test Result Format
```
✅ test-name - Test Description
   Duration: 23291ms
   Events: 28
   Approvals: 0
   Context Loading:
     ✓ Loaded: /path/to/context/file.md
     ✓ Timing: Context loaded 25272ms before execution
   Violations: 0 (0 errors, 0 warnings)
```

### Violation Types

**Errors (test fails):**
- `missing-approval` - Execution without approval
- `missing-required-tool` - Expected tool not used
- `insufficient-tool-calls` - Not enough tool calls
- `execution-before-read` - Modified without reading first

**Warnings (test passes with warnings):**
- `insufficient-read` - Low read/execution ratio
- Other non-critical issues

---

## 🐛 Common Issues

### Issue: "Session not found"
**Solution:** Session may have been cleaned up. Run test again with `--debug` flag.

### Issue: "Test failed but agent looks correct"
**Solution:** Test expectations may be wrong. Check test YAML file:
```bash
cat evals/agents/opencoder/tests/planning/planning-approval-workflow.yaml
```

### Issue: "Can't see tool calls"
**Solution:** Tool calls are in separate part files:
```bash
ls ~/.local/share/opencode/storage/part/msg_XXXXX/
```

### Issue: "Agent didn't load context"
**Solution:** Check if context file exists:
```bash
ls -la .opencode/context/core/standards/code.md
```

---

## 🎯 Validating Specific Behaviors

### 1. Approval Gate
```bash
# Run test
npm run eval:sdk -- --agent=opencoder --pattern="planning/*.yaml" --debug

# Get session ID from output
SESSION_ID="ses_XXXXX"

# Check for approval request
cat ~/.local/share/opencode/storage/message/$SESSION_ID/*.json | \
  jq -r '.summary.body' | \
  grep -i "approval needed"
```

### 2. Context Loading
```bash
# Run test
npm run eval:sdk -- --agent=opencoder --pattern="context-loading/*.yaml" --debug

# Check test output for context loading confirmation
# Look for: "✓ Loaded: .opencode/context/core/standards/code.md"
```

### 3. Tool Call Sequence
```bash
# Get session ID from test output
SESSION_ID="ses_XXXXX"

# View all tool calls in order
for msg in ~/.local/share/opencode/storage/message/$SESSION_ID/*.json; do
  MSG_ID=$(cat "$msg" | jq -r '.id')
  if [ -d ~/.local/share/opencode/storage/part/$MSG_ID ]; then
    echo "Message: $MSG_ID"
    cat ~/.local/share/opencode/storage/part/$MSG_ID/*.json | \
      jq -r 'select(.type == "tool") | "  \(.tool): \(.input)"'
  fi
done
```

---

## 📝 Creating New Tests

### Test Template
```yaml
id: my-test-name
name: Human Readable Test Name
description: |
  What this test validates

category: developer  # or business, creative, edge-case
agent: opencoder
model: anthropic/claude-sonnet-4-5

prompt: |
  Your test prompt here

behavior:
  mustContain:
    - "Expected text in response"
  mustNotUseTools: [write, edit]  # Tools that should NOT be used
  mustUseTools: [read]  # Tools that MUST be used

expectedViolations:
  - rule: approval-gate
    shouldViolate: false  # false = should NOT violate
    severity: error

approvalStrategy:
  type: auto-approve

timeout: 60000

tags:
  - tag1
  - tag2
```

### Multi-Turn Test Template
```yaml
prompts:
  - text: "First prompt"
    expectContext: false
  
  - text: "approve"
    delayMs: 2000
    expectContext: true
    contextFile: "code.md"
```

---

## 🚀 Advanced Debugging

### Enable Verbose Logging
```bash
# Set debug environment variable
DEBUG=* npm run eval:sdk -- --agent=opencoder --pattern="planning/*.yaml" --debug
```

### Compare Test Runs
```bash
# Run test twice and compare
npm run eval:sdk -- --agent=opencoder --pattern="planning/*.yaml" --debug > run1.log
npm run eval:sdk -- --agent=opencoder --pattern="planning/*.yaml" --debug > run2.log
diff run1.log run2.log
```

### Extract All Tool Calls from Session
```bash
SESSION_ID="ses_XXXXX"

# Create tool call report
echo "Tool Calls in Session: $SESSION_ID"
echo "======================================"
for msg in ~/.local/share/opencode/storage/message/$SESSION_ID/*.json; do
  MSG_ID=$(cat "$msg" | jq -r '.id')
  ROLE=$(cat "$msg" | jq -r '.role')
  
  if [ "$ROLE" = "assistant" ] && [ -d ~/.local/share/opencode/storage/part/$MSG_ID ]; then
    cat ~/.local/share/opencode/storage/part/$MSG_ID/*.json | \
      jq -r 'select(.type == "tool") | "\(.tool): \(.input | tostring)"'
  fi
done
```

---

## 📚 Resources

- **Test Validation Report:** `TEST_VALIDATION_REPORT.md`
- **Test Configuration:** `config/config.yaml`
- **Prompt File:** `../../.opencode/agent/opencoder.md`
- **Debug Scripts:** `../../evals/framework/scripts/debug/`

---

## 💡 Tips

1. **Always use `--debug` flag** when investigating test failures
2. **Save session IDs** from test output for later inspection
3. **Check both test output AND session files** for complete picture
4. **Compare passing vs failing tests** to identify patterns
5. **Verify context files exist** before running context loading tests

---

**Last Updated:** 2025-12-08
