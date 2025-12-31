# Evaluation Framework (Technical)

Core framework for evaluating agent behavior. For user documentation, see [../README.md](../README.md).

## Architecture

```
framework/
├── src/
│   ├── sdk/                 # Test execution
│   │   ├── test-runner.ts   # Main orchestrator
│   │   ├── test-executor.ts # Executes individual tests
│   │   ├── client-manager.ts
│   │   └── event-stream-handler.ts
│   ├── evaluators/          # Rule validators
│   │   ├── base-evaluator.ts
│   │   ├── approval-gate-evaluator.ts
│   │   ├── context-loading-evaluator.ts
│   │   ├── execution-balance-evaluator.ts
│   │   ├── tool-usage-evaluator.ts
│   │   ├── behavior-evaluator.ts
│   │   ├── delegation-evaluator.ts
│   │   ├── stop-on-failure-evaluator.ts
│   │   └── performance-metrics-evaluator.ts  # NEW
│   ├── logging/             # Multi-agent logging (NEW)
│   │   ├── types.ts
│   │   ├── session-tracker.ts
│   │   ├── logger.ts
│   │   ├── formatters.ts
│   │   ├── index.ts
│   │   └── __tests__/       # 37 unit tests
│   ├── collector/           # Session data
│   │   ├── session-reader.ts
│   │   └── timeline-builder.ts
│   └── types/
│       └── index.ts
└── package.json
```

## Evaluators

### approval-gate
Checks that approval is requested before risky operations (bash, write, edit, task).

### context-loading
Verifies context files are loaded before acting on tasks.

**NEW:** Supports explicit context file specification via `expectedContextFiles` in test YAML.
- Auto-detect mode: Infers expected files from user message keywords
- Explicit mode: Uses files specified in `behavior.expectedContextFiles`

### execution-balance
Ensures read operations happen before write operations.

### tool-usage
Validates dedicated tools are used instead of bash antipatterns.

### behavior
Checks expected tools are used and forbidden tools are avoided.

### delegation
Validates complex tasks are delegated to subagents.

### stop-on-failure
Ensures agent stops on errors instead of auto-fixing.

### performance-metrics (NEW)
Collects performance data for analysis:
- Total test duration
- Tool latencies (avg, min, max per tool)
- LLM inference time estimation
- Idle time between events
- Event distribution

Always passes - used for metrics collection only.

## Multi-Agent Logging (NEW)

The framework now includes comprehensive multi-agent logging that tracks delegation hierarchies in real-time.

### Features
- **Visual hierarchy** - Box characters and indentation show parent-child relationships (debug mode)
- **Session tracking** - Tracks all sessions (parent, child, grandchild, etc.)
- **Real-time capture** - Hooks into SDK event stream for live updates
- **Non-verbose mode** - Shows child agent execution in normal mode without full debug output
- **Verbose mode** - Full delegation hierarchy with `--debug` flag

### Usage
```bash
# Non-verbose mode (default) - shows child agent completion
npm run eval:sdk -- --agent=openagent --pattern="**/test.yaml"

# Verbose mode (debug) - shows full delegation hierarchy
npm run eval:sdk -- --agent=openagent --pattern="**/test.yaml" --debug
```

### Example Output (Non-Verbose Mode)
```
Running tests...

   ✓ Child agent completed (OpenAgent, 2.9s)

Running evaluator: approval-gate...
```

### Example Output (Verbose Mode - Debug)
```
┌────────────────────────────────────────────────────────────┐
│ 🎯 PARENT: OpenAgent (ses_xxx...)                          │
└────────────────────────────────────────────────────────────┘
  🔧 TOOL: task
     ├─ subagent: simple-responder
     └─ Creating child session...

  ┌────────────────────────────────────────────────────────────┐
  │ 🎯 CHILD: simple-responder (ses_yyy...)                    │
  │    Parent: ses_xxx...                                      │
  │    Depth: 1                                                │
  └────────────────────────────────────────────────────────────┘
    🤖 Agent: AWESOME TESTING
  ✅ CHILD COMPLETE (2.9s)

✅ PARENT COMPLETE (20.9s)
```

See [src/logging/README.md](src/logging/README.md) for API documentation.

## Adding an Evaluator

1. Create `src/evaluators/my-evaluator.ts`:

```typescript
import { BaseEvaluator } from './base-evaluator.js';
import { TimelineEvent, SessionInfo, EvaluationResult } from '../types/index.js';

export class MyEvaluator extends BaseEvaluator {
  name = 'my-evaluator';
  description = 'What this evaluator checks';

  async evaluate(timeline: TimelineEvent[], sessionInfo: SessionInfo): Promise<EvaluationResult> {
    const checks = [];
    const violations = [];
    const evidence = [];

    // Your evaluation logic here
    const toolCalls = this.getToolCalls(timeline);
    
    // Example check
    const passed = toolCalls.length > 0;
    checks.push({
      name: 'has-tool-calls',
      passed,
      weight: 100,
      evidence: [this.createEvidence('tool-count', `Found ${toolCalls.length} tool calls`, {})]
    });

    if (!passed) {
      violations.push(this.createViolation(
        'no-tool-calls',
        'error',
        'No tool calls found',
        Date.now(),
        {}
      ));
    }

    return this.buildResult(this.name, checks, violations, evidence, {});
  }
}
```

2. Register in `test-runner.ts`:

```typescript
import { MyEvaluator } from '../evaluators/my-evaluator.js';

// In setupEvaluators():
this.evaluatorRunner = new EvaluatorRunner({
  evaluators: [
    // ... existing evaluators
    new MyEvaluator(),
  ],
});
```

3. Add to test schema in `test-case-schema.ts`:

```typescript
export const ExpectedViolationSchema = z.object({
  rule: z.enum([
    // ... existing rules
    'my-evaluator',
  ]),
  // ...
});
```

## Development

```bash
# Install
npm install

# Build
npm run build

# Run tests
npm test

# Run SDK tests
npm run eval:sdk -- --agent=openagent --pattern="**/golden/*.yaml"
```

## Key Types

```typescript
interface TimelineEvent {
  timestamp: number;
  type: 'user_message' | 'assistant_message' | 'tool_call' | 'text';
  data: any;
}

interface EvaluationResult {
  evaluator: string;
  passed: boolean;
  score: number;
  violations: Violation[];
  evidence: Evidence[];
  checks: Check[];
}

interface Violation {
  type: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
  evidence?: any;
}
```

## Base Evaluator Helpers

```typescript
// Get all tool calls
const toolCalls = this.getToolCalls(timeline);

// Get specific tool calls
const bashCalls = this.getToolCallsByName(timeline, 'bash');

// Get assistant messages
const messages = this.getAssistantMessages(timeline);

// Get read tools (read, glob, grep, list)
const reads = this.getReadTools(timeline);

// Get execution tools (bash, write, edit, task)
const executions = this.getExecutionTools(timeline);

// Create violation
this.createViolation(type, severity, message, timestamp, evidence);

// Create evidence
this.createEvidence(type, description, data, timestamp?);

// Build result
this.buildResult(name, checks, violations, evidence, metadata);
```
