# Evaluation Framework

## Overview

Reusable framework for evaluating OpenCode agent behavior. Can be used to test any agent against defined standards.

## Architecture

```
framework/
├── src/
│   ├── collector/          # Session data collection
│   │   ├── session-reader.ts
│   │   ├── message-parser.ts
│   │   └── timeline-builder.ts
│   ├── evaluators/         # Evaluation logic
│   │   ├── base-evaluator.ts
│   │   ├── approval-gate.ts
│   │   ├── context-loading.ts
│   │   ├── delegation.ts
│   │   ├── tool-usage.ts
│   │   └── model-selection.ts
│   ├── runner/            # Test execution
│   │   ├── test-runner.ts
│   │   └── session-analyzer.ts
│   ├── reporters/         # Result reporting
│   │   ├── console-reporter.ts
│   │   ├── json-reporter.ts
│   │   └── markdown-reporter.ts
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   ├── config.ts          # Configuration
│   └── index.ts           # Main exports
├── tests/                 # Framework tests
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
npm install
```

## Usage

### Basic Example

```typescript
import { SessionReader, ApprovalGateEvaluator, TimelineBuilder } from '@evals/framework';

// Read session
const reader = new SessionReader('/path/to/project');
const sessionInfo = reader.getSessionInfo('ses_xxxxx');
const messages = reader.getMessages('ses_xxxxx');

// Build timeline
const builder = new TimelineBuilder(reader);
const timeline = builder.buildTimeline('ses_xxxxx');

// Evaluate
const evaluator = new ApprovalGateEvaluator();
const result = evaluator.evaluate(timeline);

console.log(`Passed: ${result.passed}`);
console.log(`Score: ${result.score}/100`);
console.log(`Violations: ${result.violations.length}`);
```

### Running Test Suite

```typescript
import { TestRunner } from '@evals/framework';

const runner = new TestRunner({
  projectPath: process.cwd(),
  evaluatorsPath: './src/evaluators',
  resultsPath: '../results'
});

// Load test cases
const testCases = runner.loadTestCases('../opencode/openagent/test-cases/approval-gates.yaml');

// Run tests
const suite = runner.runAll(testCases);

console.log(`Pass Rate: ${suite.summary.passRate}%`);
```

## Components

### Collector

**SessionReader** - Read OpenCode session files
```typescript
const reader = new SessionReader(projectPath);
const info = reader.getSessionInfo(sessionId);
const messages = reader.getMessages(sessionId);
const parts = reader.getParts(sessionId, messageId);
```

**MessageParser** - Parse message structure
```typescript
const parser = new MessageParser();
const agent = parser.getAgent(message);
const model = parser.getModel(message);
const metrics = parser.getMetrics(message);
```

**TimelineBuilder** - Build event timeline
```typescript
const builder = new TimelineBuilder(reader);
const timeline = builder.buildTimeline(sessionId);
const toolCalls = builder.filterByType(timeline, 'tool_call');
```

### Evaluators

All evaluators extend `BaseEvaluator` and implement:
```typescript
evaluate(timeline: TimelineEvent[]): EvaluationResult
```

**ApprovalGateEvaluator** - Check approval before execution
```typescript
const evaluator = new ApprovalGateEvaluator();
const result = evaluator.evaluate(timeline);
```

**ContextLoadingEvaluator** - Verify context loading
```typescript
const evaluator = new ContextLoadingEvaluator();
const result = evaluator.evaluate(timeline);
```

**DelegationEvaluator** - Validate delegation decisions
```typescript
const evaluator = new DelegationEvaluator();
const result = evaluator.evaluate(timeline);
```

**ToolUsageEvaluator** - Check tool selection
```typescript
const evaluator = new ToolUsageEvaluator();
const result = evaluator.evaluate(timeline);
```

### Runner

**TestRunner** - Execute test suites
```typescript
const runner = new TestRunner(config);
const testCases = runner.loadTestCases(path);
const suite = runner.runAll(testCases);
```

**SessionAnalyzer** - Analyze historical sessions
```typescript
const analyzer = new SessionAnalyzer(reader);
const result = analyzer.analyze(sessionId, testCase);
```

### Reporters

**ConsoleReporter** - Pretty console output
```typescript
const reporter = new ConsoleReporter();
reporter.report(testSuite);
```

**JSONReporter** - Machine-readable JSON
```typescript
const reporter = new JSONReporter();
reporter.export(testSuite, 'results.json');
```

**MarkdownReporter** - Documentation format
```typescript
const reporter = new MarkdownReporter();
reporter.generate(testSuite, 'report.md');
```

## Types

### Core Types

```typescript
interface SessionInfo {
  id: string;
  version: string;
  title: string;
  time: { created: number; updated: number };
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  sessionID: string;
  mode?: string;
  modelID?: string;
  providerID?: string;
  tokens?: TokenUsage;
  cost?: number;
  time: { created: number; completed?: number };
}

interface TimelineEvent {
  timestamp: number;
  type: 'user_message' | 'assistant_message' | 'tool_call' | 'patch';
  agent?: string;
  model?: string;
  data: any;
}

interface EvaluationResult {
  evaluator: string;
  passed: boolean;
  score: number;
  violations: Violation[];
  evidence: Evidence[];
}

interface TestResult {
  testCaseId: string;
  sessionId: string;
  passed: boolean;
  score: number;
  evaluationResults: EvaluationResult[];
  metadata: any;
}
```

## Configuration

```typescript
// config.ts
export const config = {
  projectPath: process.cwd(),
  sessionStoragePath: '~/.local/share/opencode/',
  resultsPath: '../results/',
  passThreshold: 75,
  evaluators: {
    'approval-gate': ApprovalGateEvaluator,
    'context-loading': ContextLoadingEvaluator,
    'delegation': DelegationEvaluator,
    'tool-usage': ToolUsageEvaluator,
  }
};
```

## Development

### Setup

```bash
npm install
npm run build
```

### Testing

```bash
# Run all tests
npm test

# Run specific test
npm test -- session-reader

# Watch mode
npm run test:watch
```

### Building

```bash
# Build TypeScript
npm run build

# Watch mode
npm run build:watch
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## Adding New Evaluators

1. Create file in `src/evaluators/`
2. Extend `BaseEvaluator`
3. Implement `evaluate()` method
4. Add tests
5. Register in config
6. Export from `index.ts`

**Example:**
```typescript
// src/evaluators/my-evaluator.ts
import { BaseEvaluator } from './base-evaluator';
import { EvaluationResult, TimelineEvent } from '../types';

export class MyEvaluator extends BaseEvaluator {
  evaluate(timeline: TimelineEvent[]): EvaluationResult {
    // Your evaluation logic
    const checks = [
      { name: 'check1', passed: true, weight: 50 },
      { name: 'check2', passed: false, weight: 50 }
    ];
    
    const score = this.calculateScore(checks);
    const violations = this.findViolations(timeline);
    
    return {
      evaluator: 'my-evaluator',
      passed: score >= 75,
      score,
      violations,
      evidence: []
    };
  }
}
```

## API Reference

See [API.md](./API.md) for complete API documentation.

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests
4. Submit pull request

## License

MIT
