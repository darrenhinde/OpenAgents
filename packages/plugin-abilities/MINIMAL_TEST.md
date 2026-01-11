# Minimal Abilities Plugin - Test Guide

## What Was Simplified

This is a **bare minimum** version to test the core concept:

### ✅ KEPT
- Script step execution
- Sequential step ordering (with `needs` dependencies)
- Tool blocking during execution (enforcement)
- Context injection into chat messages
- Input validation
- Single execution tracking

### ❌ REMOVED
- `plugin.ts` (duplicate implementation)
- `sdk.ts` (not needed for testing)
- Agent/skill/approval/workflow step types
- Session tracking and multi-session support
- Agent attachment
- Triggers and auto-detection
- Cleanup timers
- Toast notifications
- Context passing between steps
- Conditional execution (`when`)

## File Structure

```
src/
  types/index.ts              (~120 lines - minimal types)
  loader/index.ts             (unchanged - already simple)
  validator/index.ts          (unchanged - already simple)
  executor/
    index.ts                  (~240 lines - script steps only)
    execution-manager.ts      (~50 lines - single execution)
  opencode-plugin.ts          (~200 lines - minimal hooks)
  index.ts                    (exports)

examples/
  test/ability.yaml           (3-step test ability)
```

**Total: ~600 lines** (down from ~2000+)

## Testing the Core Concept

### Setup

1. **Create test ability directory:**
   ```bash
   mkdir -p .opencode/abilities
   cp examples/test/ability.yaml .opencode/abilities/
   ```

2. **Configure OpenCode to use plugin:**
   ```json
   // .opencode/opencode.json
   {
     "plugin": [
       "file://./packages/plugin-abilities/src/opencode-plugin.ts"
     ]
   }
   ```

### Test 1: Basic Execution

**Goal:** Verify steps execute sequentially

```
User: ability.run({ name: "test" })

Expected:
✅ Step 1 executes
✅ Step 2 executes (after step 1)
✅ Step 3 executes (after step 2)
✅ Status = completed
```

### Test 2: Tool Blocking (CRITICAL)

**Goal:** Verify tools are blocked during script execution

```
User: ability.run({ name: "test" })

[While step 1 is running]
User: bash({ command: "ls" })

Expected:
❌ Error: Tool 'bash' blocked during script step 'step1'
```

### Test 3: Context Injection

**Goal:** Verify ability context appears in chat

```
User: ability.run({ name: "test" })

[Send any message while running]
User: What's happening?

Expected:
🔄 Active Ability: test
Progress: 1/3 steps completed
Current Step: step2
⚠️ ENFORCEMENT ACTIVE
```

### Test 4: Status Check

**Goal:** Verify status tool works

```
User: ability.run({ name: "test" })
User: ability.status()

Expected:
{
  "status": "running",
  "ability": "test",
  "currentStep": "step2",
  "progress": "1/3"
}
```

### Test 5: Input Validation

**Goal:** Verify inputs are validated

```
User: ability.run({ name: "test", inputs: { message: "Custom message" } })

Expected:
✅ Step 1 output contains "Custom message"
```

## Success Criteria

All 5 tests pass = **Core concept proven**

Then you can add back:
- Agent steps
- Skill steps
- Session management
- Context passing
- Triggers
- etc.

## Quick Validation

```bash
# Build
cd packages/plugin-abilities
bun run build

# Run minimal test (if you have test runner)
bun test tests/minimal.test.ts
```

## What This Proves

1. **Hook-based enforcement works** - Tools can be blocked
2. **Context injection works** - AI sees ability state
3. **Sequential execution works** - Steps run in order
4. **State tracking works** - ExecutionManager tracks progress

If these 4 things work, the architecture is sound.

## Next Steps After Validation

1. Add agent steps (call other agents)
2. Add session scoping (multi-user support)
3. Add context passing (step outputs → next step inputs)
4. Add triggers (auto-detect abilities from keywords)
5. Add approval steps (human-in-the-loop)
6. Add workflow steps (nested abilities)

But **test the minimal version first** before adding complexity.
