# Abilities Plugin: Architecture & System Overview

## Executive Summary

The **Abilities Plugin** is an OpenCode plugin that enforces deterministic, step-by-step workflow execution for AI agents. It solves the core problem with traditional skills: **LLMs ignore them**. By using enforcement hooks and structured workflows, Abilities guarantee that agents follow prescribed steps in order, without deviation.

### Core Problem It Solves

```
Traditional Skills                    Abilities
─────────────────────────────────     ──────────────────────────
Agent sees skill definition     →     Ability enforces execution
Agent can ignore it             →     Agent MUST follow steps
Execution is non-deterministic  →     Execution is deterministic
No validation between steps     →     Each step validated
Multi-agent coordination fails  →     Agent-specific abilities work
```

---

## System Architecture Overview

### High-Level Flow

```
User Request
    ↓
┌─────────────────────────────────┐
│  OpenCode Chat Message Received │
    ↓
┌──────────────────────────────────────┐
│  AbilitiesPlugin Hooks (opencode-plugin.ts)
│  ├─ chat.message: Detect ability trigger
│  ├─ tool.execute.before: Block unauthorized tools
│  └─ event: Manage execution state
    ↓
┌──────────────────────────────────────┐
│  If ability triggered:
│  ├─ Load ability definition (loader/)
│  ├─ Validate inputs (validator/)
│  └─ Execute steps (executor/)
    ↓
┌──────────────────────────────────────┐
│  Step Execution (ExecutionManager)
│  ├─ Sequential execution with dependencies
│  ├─ Output context passing
│  ├─ Step-level validation
│  └─ Error handling & recovery
    ↓
┌──────────────────────────────────────┐
│  Enforcement Applied
│  ├─ Tool blocking (only allowed tools)
│  ├─ Context injection (ability status)
│  └─ Step-by-step control
    ↓
Agent sees ability context and executes
as instructed (not as LLM desires)
```

---

## Module Architecture

```
src/
├── opencode-plugin.ts          [ENTRY POINT] Main plugin implementation
│   ├─ Hooks: event, chat.message, tool.execute.before
│   ├─ Tools: ability.list, ability.run, ability.status, ability.cancel
│   └─ Enforcement logic & context injection
│
├── loader/
│   └─ index.ts                 [DISCOVERY] Load ability YAML files
│       ├─ loadAbilities(): Discover & parse all abilities
│       ├─ loadAbility(): Get specific ability
│       └─ listAbilities(): Format for display
│
├── validator/
│   └─ index.ts                 [VALIDATION] Ensure abilities are valid
│       ├─ validateAbility(): Check structure, dependencies, step types
│       ├─ validateInputs(): Type-check user inputs against schema
│       └─ validateSteps(): Ensure no circular dependencies
│
├── executor/
│   ├─ index.ts                 [EXECUTION] Run ability steps
│   │   ├─ executeAbility(): Main orchestrator
│   │   ├─ executeScriptStep(): Run shell commands
│   │   ├─ executeAgentStep(): Call agents
│   │   ├─ executeSkillStep(): Load skills
│   │   ├─ executeApprovalStep(): Request approval
│   │   └─ executeWorkflowStep(): Run nested abilities
│   │
│   └─ execution-manager.ts     [STATE] Track active executions
│       ├─ ExecutionManager: Lifecycle management
│       ├─ execute(): Start new execution
│       ├─ getActive(): Current execution status
│       ├─ cancelActive(): Stop active ability
│       └─ cleanup(): GC & resource management
│
├── types/
│   └─ index.ts                 [TYPES] TypeScript definitions
│       ├─ Ability, Step types
│       ├─ Execution state types
│       └─ Input/output schemas
│
└── index.ts                    [EXPORTS] Public API
```

---

## Module Responsibilities

### 1. **opencode-plugin.ts** - Main Plugin & Enforcement
**Responsibility**: Interface between OpenCode and the abilities system

**Key Functions**:
- `AbilitiesPlugin` - Main async factory function that returns hooks
- `matchesTrigger()` - Detect if user text matches ability keywords/patterns
- `detectAbility()` - Find matching ability from user message
- `showToast()` - Display UI notifications
- `createExecutorContext()` - Build execution environment
- `buildAbilityContextInjection()` - Format ability status for agent

**Hooks Implemented**:
```typescript
{
  event()          // Handle session lifecycle (create/delete)
  config()         // Load plugin configuration
  'chat.message'() // Intercept messages, detect abilities, inject context
  'tool.execute.before()' // Block unauthorized tools during steps
  tool: {          // Register custom tools
    'ability.list',
    'ability.run',
    'ability.status',
    'ability.cancel'
  }
}
```

**Enforcement Strategy**:
- **Message Interception**: When user types, check if it matches ability triggers
- **Tool Blocking**: During ability execution, only allow tools for current step type
- **Context Injection**: Add ability progress/instructions to every message
- **State Tracking**: ExecutionManager tracks active executions per session

---

### 2. **loader/index.ts** - Ability Discovery
**Responsibility**: Find and parse YAML ability definitions from filesystem

**Key Functions**:
```typescript
loadAbilities(options)    // Discover all abilities in directories
  └─ discoverAbilities()  // Glob for *.yaml files
  └─ loadAbilityFile()    // Parse YAML → Ability object

loadAbility(name)         // Get specific ability by name

listAbilities(map)        // Format abilities for display
```

**Globbing Strategy** (Limited scope):
```typescript
const ABILITY_PATTERNS = [
  '*.yaml',           // Single-level files
  '*/ability.yaml',   // Dir with ability.yaml
  '*/*.yaml',         // Dir with YAML files
  '*/*/ability.yaml'  // Two-level nesting (max)
]
```

**Why Limited Patterns?**
- Prevents scanning entire project (performance)
- Stops accidental loading of unrelated YAML files
- Encourages organized directory structure

**Output**:
```typescript
Map<string, LoadedAbility> {
  'deploy':        { ability, filePath, source }
  'deploy/staging': { ability, filePath, source }
  'test-suite':    { ability, filePath, source }
}
```

---

### 3. **validator/index.ts** - Structure & Input Validation
**Responsibility**: Ensure abilities are well-formed and inputs are valid

**Key Functions**:
```typescript
validateAbility(ability)     // Check structure
  └─ Validates:
    ├─ name field exists
    ├─ steps array non-empty
    ├─ no duplicate step IDs
    ├─ no circular dependencies
    ├─ all dependencies exist
    ├─ step types valid
    └─ nested abilities exist

validateInputs(ability, inputs) // Type-check user inputs
  └─ For each input definition:
    ├─ required field check
    ├─ type validation (string/number/object)
    ├─ pattern regex validation
    ├─ enum value check
    ├─ min/max range check
    └─ default value handling
```

**Validation Output**:
```typescript
{
  valid: boolean
  errors: Array<{
    path: string    // e.g., "inputs.version"
    message: string // "Must match pattern: ^v\d+\.\d+\.\d+$"
  }>
}
```

---

### 4. **executor/index.ts** - Step Execution Engine
**Responsibility**: Execute ability steps sequentially with dependency management

**Key Functions**:
```typescript
executeAbility(ability, inputs, ctx, options)
  └─ buildExecutionOrder(steps)    // Resolve dependencies
  └─ executeStep(step, execution, ctx)
    ├─ executeScriptStep()         // Run: sh -c "command"
    ├─ executeAgentStep()          // Call agent with context
    ├─ executeSkillStep()          // Load skill
    ├─ executeApprovalStep()       // Request user approval
    └─ executeWorkflowStep()       // Run nested ability

formatExecutionResult(execution) // Pretty-print results
```

**Step Types & Their Allowed Tools**:
```typescript
ALLOWED_TOOLS_BY_STEP_TYPE = {
  script: [],                              // No tools (runs deterministically)
  agent: ['task', 'background_task'],     // Only agent-calling tools
  skill: ['skill', 'slashcommand'],       // Skill-related tools
  approval: ['ability.status'],           // Read-only status tools
  workflow: ['ability.run', 'ability.status'] // Run nested ability
}
```

**Variable Interpolation**:
```yaml
steps:
  - run: "deploy {{inputs.version}} to {{inputs.env}}"
  - run: "echo {{steps.test.output}}"  # From previous step output
```

**Dependency Resolution**:
```yaml
steps:
  - id: test
    type: script
    run: npm test

  - id: build
    needs: [test]  # Runs after test completes
    run: npm run build

  - id: deploy
    needs: [build] # Runs after build completes
    run: ./deploy.sh
```

---

### 5. **executor/execution-manager.ts** - Lifecycle Management
**Responsibility**: Track active executions, manage state, handle cleanup

**Key Responsibilities**:
```typescript
class ExecutionManager {
  // Lifecycle
  execute(ability, inputs, ctx)    // Start new execution
  getActive()                       // Get current execution
  cancelActive()                    // Stop active ability
  
  // State Management
  updateStep(executionId, result)  // Mark step complete
  cancel(executionId)              // Cancel by ID
  get(id)                          // Retrieve execution history
  list()                           // All executions (for debugging)
  
  // Resource Management
  cleanup()                        // Clean up timers & state
  cleanupOldExecutions()          // GC old executions (30 min TTL)
  trimToMaxSize()                 // Keep last 50 executions max
}
```

**Cleanup Strategy**:
```typescript
const EXECUTION_TTL = 30 * 60 * 1000  // Delete after 30 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000 // Check every 5 minutes
const MAX_STORED_EXECUTIONS = 50      // Keep last 50
```

**Why This Matters**:
- Lazy timer initialization (doesn't create timers until first execution)
- Automatic GC prevents memory leaks from long-running sessions
- State persists across messages in same session
- Timer uses `unref()` so it doesn't prevent process exit

---

### 6. **types/index.ts** - Type Definitions
**Responsibility**: Provide TypeScript types for all data structures

**Key Types**:
```typescript
// Ability Definition
interface Ability {
  name: string
  description: string
  triggers?: {
    keywords?: string[]
    patterns?: string[]  // Regex patterns
  }
  inputs?: Record<string, InputDefinition>
  steps: Step[]
  settings?: {
    enforcement?: 'strict' | 'normal' | 'loose'
    on_failure?: 'stop' | 'retry' | 'continue'
  }
  exclusive_agent?: string        // Only this agent can run
  compatible_agents?: string[]    // Whitelist of agents
}

// Step Types
type Step = 
  | ScriptStep
  | AgentStep
  | SkillStep
  | ApprovalStep
  | WorkflowStep

interface ScriptStep {
  id: string
  type: 'script'
  description?: string
  run: string                    // Shell command
  cwd?: string                   // Working directory
  env?: Record<string, string>   // Environment variables
  timeout?: string               // '5m', '30s'
  validation?: {
    exit_code?: number
    stdout_contains?: string
    stderr_contains?: string
  }
  on_failure?: 'stop' | 'retry' | 'continue'
  max_retries?: number
  when?: string                  // Conditional: "inputs.env == 'prod'"
  needs?: string[]               // Dependencies
}

// Execution State
interface AbilityExecution {
  id: string
  ability: Ability
  inputs: InputValues
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  currentStep: Step | null
  currentStepIndex: number
  completedSteps: StepResult[]
  pendingSteps: Step[]
  startedAt: number
  completedAt?: number
  error?: string
}

interface StepResult {
  stepId: string
  status: 'completed' | 'failed' | 'skipped'
  output?: string
  error?: string
  startedAt: number
  completedAt: number
  duration: number
}
```

---

## Data Flow Example: Deploy Workflow

### 1. User Types "Deploy v1.2.3"

```
User Message: "Deploy v1.2.3"
    ↓
chat.message hook intercepts
    ↓
detectAbility("Deploy v1.2.3")
    ├─ Check: "deploy" keyword in message? ✓
    ├─ Found: ability { name: "deploy", ... }
    ↓
Show ability suggestion:
"## Ability Detected: deploy\n\n Deploy application..."
```

### 2. User Runs: `/ability.run deploy version=v1.2.3`

```
ability.run tool executes:
    ├─ Load ability: "deploy"
    ├─ Validate inputs:
    │  └─ version matches pattern: ^v\d+\.\d+\.\d+$ ✓
    ├─ executionManager.execute(ability, {version: "v1.2.3"})
    │
    └─ Start execution:
       ExecutionManager creates AbilityExecution {
         id: "exec_1704067200000_abc123"
         status: "running"
         currentStep: steps[0]
       }
```

### 3. Step 1: Test (Script)

```
Step: "test" (script)
    ├─ Command: "npm test"
    ├─ Run in shell:
    │  ├─ stdout: "✓ 124 tests passed"
    │  ├─ exit code: 0
    │  └─ validation: exit_code == 0 ✓
    ├─ Record result:
    │  └─ StepResult { stepId: "test", status: "completed", output: "..." }
    ├─ Inject context in next message:
    │  "## Active Ability: deploy\nProgress: 1/3 steps\nCurrent Step: build..."
    └─ Continue
```

### 4. Step 2: Build (Script, depends on test)

```
Step: "build" (script)
    ├─ Needs: ["test"] ✓ (completed)
    ├─ Command: "npm run build"
    ├─ Tool check (tool.execute.before):
    │  └─ Block: bash, write, edit (not allowed in script steps)
    ├─ Execute...
    ├─ Result: success
    └─ Continue
```

### 5. Step 3: Deploy (Script)

```
Step: "deploy" (script)
    ├─ Needs: ["build"] ✓ (completed)
    ├─ Interpolate variables:
    │  └─ "Deploy {{inputs.version}}" → "Deploy v1.2.3"
    ├─ Run: "./deploy.sh v1.2.3"
    ├─ Result: success
    └─ Mark ability complete
```

### 6. Execution Complete

```
Set status: "completed"
Save results: { completedSteps: [...], duration: "42.3s" }
Return: "✅ Ability 'deploy' completed successfully"
Clear activeExecution for next ability
```

---

## Enforcement Mechanisms

### 1. Tool Blocking (tool.execute.before hook)

**Problem**: Agent might try to call `bash` during a `script` step (redundant & risky)

**Solution**:
```typescript
async 'tool.execute.before'(input, output) {
  if (!activeExecution) return  // Not running ability, allow all

  const currentStep = activeExecution.currentStep
  const allowedTools = ALLOWED_TOOLS_BY_STEP_TYPE[currentStep.type]
  
  if (enforcement === 'strict' && !allowedTools.includes(input.tool)) {
    throw new Error(`Tool '${input.tool}' blocked in ${currentStep.type} step`)
  }
}
```

**Effect**: Agent cannot deviate from prescribed tool usage for current step

### 2. Context Injection (chat.message hook)

**Problem**: Agent might forget which step it's on or what to do next

**Solution**:
```typescript
async 'chat.message'(input, output) {
  if (activeExecution?.status === 'running') {
    // Inject ability context at start of every message
    output.parts.unshift({
      type: 'text',
      text: `## Active Ability: ${ability.name}\nProgress: 2/3 steps\nCurrent Step: deploy\nAction: Run ./deploy.sh v1.2.3`
    })
  }
}
```

**Effect**: Agent always sees context reminder, reducing deviation

### 3. Ability Detection (chat.message keyword matching)

**Problem**: User doesn't know they can run an ability

**Solution**:
```typescript
const detected = detectAbility(userText)  // Check triggers
if (detected) {
  output.parts.unshift({
    type: 'text',
    text: `## Ability Detected: ${detected.name}\n\n${detected.description}...`
  })
}
```

**Effect**: Auto-discovery makes abilities more discoverable

---

## Configuration

### In `.opencode/opencode.json`:

```json
{
  "plugin": [
    "file://../packages/plugin-abilities/src/opencode-plugin.ts"
  ]
}
```

### Optional Config:

```json
{
  "abilities": {
    "enabled": true,
    "auto_trigger": true,
    "enforcement": "strict",
    "directories": [
      ".opencode/abilities",
      "~/.config/opencode/abilities"
    ]
  }
}
```

---

## Ability File Structure

### Basic Example

```yaml
# .opencode/abilities/deploy/ability.yaml
name: deploy
description: Deploy application with safety checks

triggers:
  keywords:
    - deploy
    - ship
  patterns:
    - 'deploy.*v\d+\.\d+\.\d+'

inputs:
  version:
    type: string
    required: true
    pattern: '^v\d+\.\d+\.\d+$'
  environment:
    type: string
    enum: [dev, staging, prod]
    default: staging

steps:
  - id: test
    type: script
    run: npm test
    validation:
      exit_code: 0

  - id: build
    type: script
    needs: [test]
    run: npm run build
    validation:
      exit_code: 0

  - id: approve
    type: approval
    needs: [build]
    prompt: "Deploy {{inputs.version}} to {{inputs.environment}}?"

  - id: deploy
    type: script
    needs: [approve]
    run: ./deploy.sh {{inputs.version}} {{inputs.environment}}
    validation:
      exit_code: 0
```

---

## Tools Available to Agents

### ability.list
Lists all available abilities
```
ability.list
→ "- deploy: Deploy application...\n- test: Run tests..."
```

### ability.run
Execute an ability
```
ability.run { name: "deploy", inputs: { version: "v1.2.3" } }
→ { status: "completed", ability: "deploy", result: "..." }
```

### ability.status
Check active ability execution
```
ability.status
→ { status: "running", ability: "deploy", currentStep: "build", progress: "2/3" }
```

### ability.cancel
Cancel active ability
```
ability.cancel
→ { status: "cancelled", message: "Ability cancelled" }
```

---

## Execution Flow Diagram

```
┌──────────────────────────────────────────────────────────┐
│  User Message → chat.message hook                        │
└────────────────────┬─────────────────────────────────────┘
                     │
         ┌───────────┴────────────┐
         ▼                        ▼
    No ability match      Ability detected
         │                        │
         │                  ┌─────┴──────┐
         │                  ▼            ▼
         │          Auto-detect    Show suggestion
         │          (cool 10s)      to user
         │                        
         ├─────────────────────────────────────┐
         │                                     │
    Allow normal              User runs /ability.run
    OpenCode flow                       │
                             ┌──────────┴───────────┐
                             ▼                      ▼
                        Load ability         Validate inputs
                             │                      │
                             └──────────┬───────────┘
                                        ▼
                         ExecutionManager.execute()
                                        │
                        ┌───────────────┴────────────────┐
                        │ Build execution order (deps)  │
                        ├───────────────────────────────┤
                        │ FOR each step:                 │
                        │  ├─ Evaluate 'when' condition │
                        │  ├─ Execute step type:        │
                        │  │  ├─ script → shell cmd     │
                        │  │  ├─ agent → agent call     │
                        │  │  ├─ skill → load skill     │
                        │  │  ├─ approval → ask user    │
                        │  │  └─ workflow → nested run  │
                        │  ├─ Validate output           │
                        │  ├─ Pass context to next step │
                        │  └─ Record result             │
                        │                                │
                        ├─ On failure:                  │
                        │  ├─ Stop (default)            │
                        │  ├─ Retry (with max retries)  │
                        │  └─ Continue (ignore error)   │
                        │                                │
                        └───────────────┬────────────────┘
                                        ▼
                         Return execution results
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
              Save to history    Show toast result   Clear active
              (50 max, 30m TTL)   (success/error)    execution
```

---

## Performance & Resource Considerations

### Lazy Initialization
- ExecutionManager timer only starts on first ability execution
- Timer uses `unref()` so it doesn't block process exit
- Prevents unnecessary resource usage for inactive plugins

### Memory Management
- Keep only last 50 executions in memory
- Automatically delete executions older than 30 minutes
- No memory leaks from long-running sessions

### Search Scope
- Glob patterns limited to 2 levels deep (`*/*/ability.yaml`)
- Prevents scanning entire project (could be thousands of files)
- Encourages organized `.opencode/abilities/` directory structure

### Debouncing
- Ability detection limited to once per 10 seconds per ability
- Prevents message spam from repeated ability suggestions
- User can still manually run with `/ability.run`

---

## Extension Points

### Adding New Step Types
1. Add type definition to `types/index.ts`
2. Add executor function in `executor/index.ts`
3. Add to `ALLOWED_TOOLS_BY_STEP_TYPE`
4. Update validator

### Custom Validation
1. Extend `validateAbility()` in `validator/index.ts`
2. Add custom error messages
3. Return enhanced validation result

### Custom Tools
1. Add tool definition in `opencode-plugin.ts`
2. Implement execute function
3. Register in tool map

### Agent-Specific Abilities
```yaml
exclusive_agent: deploy-agent  # Only this agent can run
compatible_agents: [deploy-agent, devops-agent]  # Whitelist
```

---

## Testing

### Test Coverage (87 tests)
- **executor.test.ts** - Step execution, dependencies, validation
- **validator.test.ts** - Ability validation, input validation
- **enforcement.test.ts** - Hook enforcement, agent attachment
- **integration.test.ts** - Full lifecycle, error handling
- **trigger.test.ts** - Keyword/pattern detection
- **context-passing.test.ts** - Output context passing
- **sdk.test.ts** - Public API

### Running Tests
```bash
cd packages/plugin-abilities
bun test
```

---

## Troubleshooting

### "Ability not found"
- Check `.opencode/abilities/` directory exists
- Check ability YAML file is valid
- Run `ability.list` to see loaded abilities

### "Input validation failed"
- Check inputs match schema (type, pattern, enum, range)
- Use `ability.validate <name>` to check definition

### "Tool blocked during step"
- Check enforcement mode (loose vs strict)
- Tool not in `ALLOWED_TOOLS_BY_STEP_TYPE[stepType]`
- Script steps block all tools (run deterministically)

### "Step failed but continued"
- Check `on_failure: continue` in step definition
- Check `max_retries` configured

### Plugin crashes OpenCode
- Check hook signatures match SDK (`@opencode-ai/plugin`)
- Ensure all hooks have try-catch blocks
- Check console for error messages

---

## Design Philosophy

### Why Enforcement?

> **Hypothesis**: Traditional skills fail because LLMs are optimization engines, not planning engines. They optimize for "completion" not for "following instructions."

**Solution**: Make it impossible to deviate
- Block tools, not suggest them
- Inject context, not hope it's remembered
- Execute steps sequentially, not in parallel

### Why Step-Based?

> **Real World**: Complex tasks have dependencies and validation needs. Humans break them into steps for a reason.

**Solution**: Explicit step dependencies
- Test before build
- Build before deploy
- Approval before production

### Why Validation?

> **Problem**: Without validation, agents "guess" at outputs and continue. This causes silent failures.

**Solution**: Assert expectations after each step
- Script validation (exit codes, output content)
- Input validation (required, pattern, range)
- Dependency validation (no circular loops)

---

## Summary

The Abilities Plugin enforces deterministic, step-by-step workflow execution through:

1. **Discovery** (loader) - Find ability definitions from YAML
2. **Validation** (validator) - Ensure well-formed and valid inputs
3. **Execution** (executor) - Run steps sequentially with context passing
4. **Enforcement** (plugin hooks) - Block tools, inject context, track state
5. **State Management** (ExecutionManager) - Lifecycle, cleanup, memory management

Result: Agents follow prescribed workflows reliably, reproducibly, and safely.
