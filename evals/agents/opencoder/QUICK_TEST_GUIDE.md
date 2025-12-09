# Quick Test Guide - OpenCoder

**TL;DR:** Run tests and see EXACTLY what the agent says and does.

---

## 🚀 Run Test with Full Conversation

### Method 1: Using --verbose flag (RECOMMENDED)

```bash
cd evals/framework

# Run single test and see full conversation
npm run eval:sdk -- --agent=opencoder --pattern="planning/*.yaml" --verbose --debug

# Run context loading test
npm run eval:sdk -- --agent=opencoder --pattern="context-loading/*.yaml" --verbose --debug

# Run all tests (will take longer)
npm run eval:sdk -- --agent=opencoder --verbose --debug
```

**Note:** Both `--verbose` and `--debug` flags are required:
- `--verbose` = Show full conversations
- `--debug` = Keep session data (required for --verbose to work)

### Method 2: Using helper script

```bash
cd evals/framework/scripts

# Run single test and see full conversation
./run-test-verbose.sh opencoder "planning/*.yaml"

# Run context loading test
./run-test-verbose.sh opencoder "context-loading/*.yaml"
```

**Output shows:**
1. ✅ Test result (PASS/FAIL)
2. 📊 Test metrics (duration, events, violations)
3. 💬 **FULL CONVERSATION** - Every message between user and agent

---

## 📋 Example Output

```
TEST RESULTS
======================================================================

1. ✅ planning-approval-workflow - Planning & Approval Workflow
   Duration: 28327ms
   Events: 33
   Approvals: 0
   Violations: 0 (0 errors, 0 warnings)

======================================================================
FULL CONVERSATION
======================================================================

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 USER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Implementation Plan

Based on the existing code structure, I will:

1. Create a new file `utils/utils.js` with an `add` function
2. Follow pure function pattern
3. Use JSDoc comments

**Approval needed before proceeding. Please review and confirm.**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 ASSISTANT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ✅ What You Can Verify

### 1. Planning & Approval Workflow
```bash
./run-test-verbose.sh opencoder "planning/*.yaml"
```

**Look for:**
- ✅ "DIGGING IN..." at start
- ✅ "## Implementation Plan"
- ✅ "**Approval needed before proceeding**"
- ✅ NO write/edit/bash tools used before approval

### 2. Context Loading
```bash
./run-test-verbose.sh opencoder "context-loading/*.yaml"
```

**Look for:**
- ✅ Test output shows: "✓ Loaded: .opencode/context/core/standards/code.md"
- ✅ Test output shows: "✓ Timing: Context loaded XXXXms before execution"
- ✅ Tool calls show `read` of code.md BEFORE `write`

### 3. Delegation Recognition
```bash
./run-test-verbose.sh opencoder "delegation/*.yaml"
```

**Look for:**
- ✅ Agent recognizes multi-file features
- ✅ Mentions "task-manager" or creates detailed breakdown
- ✅ Identifies complexity correctly

---

## 🔍 Inspect Specific Session

If you have a session ID from a test run:

```bash
cd evals/framework/scripts/debug
./show-test-conversation.sh ses_XXXXXXXXXXXXX
```

---

## 📊 All Available Tests

```bash
# List all opencoder tests
find ../agents/opencoder/tests -name "*.yaml" -type f

# Run all tests (no conversation output)
cd ../
npm run eval:sdk -- --agent=opencoder

# Run all tests with debug
npm run eval:sdk -- --agent=opencoder --debug
```

---

## 🎯 Test Categories

| Category | Pattern | What It Tests |
|----------|---------|---------------|
| **Planning** | `planning/*.yaml` | Plan-first, approval gates |
| **Context** | `context-loading/*.yaml` | Loads code.md before coding |
| **Implementation** | `implementation/*.yaml` | Incremental execution, validation |
| **Delegation** | `delegation/*.yaml` | Task-manager, coder-agent routing |
| **Error Handling** | `error-handling/*.yaml` | Stop on failure, report-first |
| **Completion** | `completion/*.yaml` | Handoff recommendations |

---

## 💡 Quick Validation Checklist

Run these 3 tests to validate core behaviors:

```bash
# 1. Approval workflow
./run-test-verbose.sh opencoder "planning/*.yaml"
# ✅ Look for: "Approval needed before proceeding"

# 2. Context loading
./run-test-verbose.sh opencoder "context-loading/*.yaml"
# ✅ Look for: "✓ Loaded: .opencode/context/core/standards/code.md"

# 3. Delegation
./run-test-verbose.sh opencoder "delegation/delegation-task-manager.yaml"
# ✅ Look for: Multi-step plan or "task-manager" mention
```

---

## 🐛 Troubleshooting

### "Session not found"
- Session was cleaned up. Run test again.

### "No conversation shown"
- Check if test actually ran (look for "Session created" in output)
- Try running test directly: `npm run eval:sdk -- --agent=opencoder --pattern="planning/*.yaml" --debug`

### "Test failed but agent looks correct"
- Test expectations may be wrong
- Check test YAML file: `cat ../agents/opencoder/tests/planning/planning-approval-workflow.yaml`

---

## 📝 Summary

**YES, you can see exactly what's being asked and what's being responded with!**

The `run-test-verbose.sh` script:
1. Runs the test
2. Captures the session ID
3. Shows test results
4. **Shows the FULL conversation** between user and agent

**No more guessing** - you can see:
- ✅ Exact prompts sent to agent
- ✅ Exact responses from agent
- ✅ Tool calls made
- ✅ Approval requests
- ✅ Context loading
- ✅ Everything!

---

**Last Updated:** 2025-12-08
