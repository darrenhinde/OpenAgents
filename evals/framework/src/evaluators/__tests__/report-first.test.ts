/**
 * Unit tests for ReportFirstEvaluator
 * 
 * Tests the critical workflow: REPORT→PROPOSE→REQUEST→FIX
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ReportFirstEvaluator } from '../report-first-evaluator.js';
import type { TimelineEvent, SessionInfo } from '../../types/index.js';

describe('ReportFirstEvaluator', () => {
  let evaluator: ReportFirstEvaluator;
  let sessionInfo: SessionInfo;

  beforeEach(() => {
    evaluator = new ReportFirstEvaluator();
    sessionInfo = {
      id: 'test-session',
      version: '1.0',
      title: 'Test Session',
      time: {
        created: Date.now(),
        updated: Date.now()
      }
    };
  });

  it('should PASS when no errors detected', async () => {
    const timeline: TimelineEvent[] = [
      {
        timestamp: 1000,
        type: 'user_message',
        data: { text: 'Hello' }
      },
      {
        timestamp: 2000,
        type: 'text',
        data: { text: 'Hi there!' }
      }
    ];

    const result = await evaluator.evaluate(timeline, sessionInfo);

    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.metadata.errorCount).toBe(0);
  });

  it('should PASS when complete workflow followed', async () => {
    const timeline: TimelineEvent[] = [
      {
        timestamp: 1000,
        type: 'user_message',
        data: { text: 'Run tests' }
      },
      {
        timestamp: 2000,
        type: 'tool_call',
        data: {
          tool: 'bash',
          input: { command: 'npm test' },
          output: 'FAILED: 3 tests failed\nError: Expected 5 but got 3'
        }
      },
      {
        timestamp: 3000,
        type: 'text',
        data: { text: 'The tests failed. The error is in the calculation function.' }
      },
      {
        timestamp: 4000,
        type: 'text',
        data: { text: 'I can fix this by updating the logic to return the correct value.' }
      },
      {
        timestamp: 5000,
        type: 'text',
        data: { text: 'Would you like me to proceed with the fix?' }
      },
      {
        timestamp: 6000,
        type: 'user_message',
        data: { text: 'Yes, please fix it' }
      },
      {
        timestamp: 7000,
        type: 'tool_call',
        data: {
          tool: 'write',
          input: { filePath: 'calc.ts', content: 'fixed code' }
        }
      }
    ];

    const result = await evaluator.evaluate(timeline, sessionInfo);

    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.metadata.errorCount).toBe(1);
  });

  it('should FAIL when REPORT step missing', async () => {
    const timeline: TimelineEvent[] = [
      {
        timestamp: 1000,
        type: 'user_message',
        data: { text: 'Run tests' }
      },
      {
        timestamp: 2000,
        type: 'tool_call',
        data: {
          tool: 'bash',
          input: { command: 'npm test' },
          output: 'FAILED: 3 tests failed'
        }
      },
      {
        timestamp: 3000,
        type: 'text',
        data: { text: 'I can fix this.' }
      },
      {
        timestamp: 4000,
        type: 'text',
        data: { text: 'Should I proceed?' }
      },
      {
        timestamp: 5000,
        type: 'user_message',
        data: { text: 'Yes' }
      },
      {
        timestamp: 6000,
        type: 'tool_call',
        data: {
          tool: 'write',
          input: { filePath: 'test.ts' }
        }
      }
    ];

    const result = await evaluator.evaluate(timeline, sessionInfo);

    expect(result.passed).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.violations.some(v => v.type === 'missing-report-step')).toBe(true);
  });

  it('should FAIL when PROPOSE step missing', async () => {
    const timeline: TimelineEvent[] = [
      {
        timestamp: 1000,
        type: 'user_message',
        data: { text: 'Run tests' }
      },
      {
        timestamp: 2000,
        type: 'tool_call',
        data: {
          tool: 'bash',
          input: { command: 'npm test' },
          output: 'FAILED: 3 tests failed'
        }
      },
      {
        timestamp: 3000,
        type: 'text',
        data: { text: 'The tests failed with an error.' }
      },
      {
        timestamp: 4000,
        type: 'text',
        data: { text: 'Should I fix it?' }
      },
      {
        timestamp: 5000,
        type: 'user_message',
        data: { text: 'Yes' }
      },
      {
        timestamp: 6000,
        type: 'tool_call',
        data: {
          tool: 'write',
          input: { filePath: 'test.ts' }
        }
      }
    ];

    const result = await evaluator.evaluate(timeline, sessionInfo);

    expect(result.passed).toBe(false);
    expect(result.violations.some(v => v.type === 'missing-propose-step')).toBe(true);
  });

  it('should FAIL when REQUEST step missing', async () => {
    const timeline: TimelineEvent[] = [
      {
        timestamp: 1000,
        type: 'user_message',
        data: { text: 'Run tests' }
      },
      {
        timestamp: 2000,
        type: 'tool_call',
        data: {
          tool: 'bash',
          input: { command: 'npm test' },
          output: 'FAILED: 3 tests failed'
        }
      },
      {
        timestamp: 3000,
        type: 'text',
        data: { text: 'The tests failed. The error is in the code.' }
      },
      {
        timestamp: 4000,
        type: 'text',
        data: { text: 'I can fix this by updating the function.' }
      },
      {
        timestamp: 5000,
        type: 'tool_call',
        data: {
          tool: 'write',
          input: { filePath: 'test.ts' }
        }
      }
    ];

    const result = await evaluator.evaluate(timeline, sessionInfo);

    expect(result.passed).toBe(false);
    expect(result.violations.some(v => v.type === 'missing-request-step')).toBe(true);
  });

  it('should FAIL when fix comes before approval', async () => {
    const timeline: TimelineEvent[] = [
      {
        timestamp: 1000,
        type: 'user_message',
        data: { text: 'Run tests' }
      },
      {
        timestamp: 2000,
        type: 'tool_call',
        data: {
          tool: 'bash',
          input: { command: 'npm test' },
          output: 'FAILED: 3 tests failed'
        }
      },
      {
        timestamp: 3000,
        type: 'text',
        data: { text: 'The tests failed. The error is in the code.' }
      },
      {
        timestamp: 4000,
        type: 'text',
        data: { text: 'I can fix this by updating the function.' }
      },
      {
        timestamp: 5000,
        type: 'text',
        data: { text: 'Should I proceed?' }
      },
      {
        timestamp: 6000,
        type: 'tool_call',
        data: {
          tool: 'write',
          input: { filePath: 'test.ts' }
        }
      },
      {
        timestamp: 7000,
        type: 'user_message',
        data: { text: 'Yes' }
      }
    ];

    const result = await evaluator.evaluate(timeline, sessionInfo);

    expect(result.passed).toBe(false);
    expect(result.violations.some(v => v.type === 'fix-before-approval')).toBe(true);
  });

  it('should FAIL when fix without any approval', async () => {
    const timeline: TimelineEvent[] = [
      {
        timestamp: 1000,
        type: 'user_message',
        data: { text: 'Run tests' }
      },
      {
        timestamp: 2000,
        type: 'tool_call',
        data: {
          tool: 'bash',
          input: { command: 'npm test' },
          output: 'FAILED: 3 tests failed'
        }
      },
      {
        timestamp: 3000,
        type: 'text',
        data: { text: 'The tests failed. I can fix this.' }
      },
      {
        timestamp: 4000,
        type: 'text',
        data: { text: 'Should I fix it?' }
      },
      {
        timestamp: 5000,
        type: 'tool_call',
        data: {
          tool: 'write',
          input: { filePath: 'test.ts' }
        }
      }
    ];

    const result = await evaluator.evaluate(timeline, sessionInfo);

    expect(result.passed).toBe(false);
    expect(result.violations.some(v => v.type === 'fix-before-approval')).toBe(true);
  });

  it('should handle multiple errors correctly', async () => {
    const timeline: TimelineEvent[] = [
      // First error - correct workflow
      {
        timestamp: 1000,
        type: 'tool_call',
        data: {
          tool: 'bash',
          output: 'FAILED: test 1 failed'
        }
      },
      {
        timestamp: 2000,
        type: 'text',
        data: { text: 'The test failed. I can fix it. Should I?' }
      },
      {
        timestamp: 3000,
        type: 'user_message',
        data: { text: 'Yes' }
      },
      {
        timestamp: 4000,
        type: 'tool_call',
        data: {
          tool: 'write',
          input: { filePath: 'test.ts' }
        }
      },
      // Second error - also correct
      {
        timestamp: 5000,
        type: 'tool_call',
        data: {
          tool: 'bash',
          output: 'FAILED: test 2 failed'
        }
      },
      {
        timestamp: 6000,
        type: 'text',
        data: { text: 'Another error occurred. I suggest fixing it. May I proceed?' }
      },
      {
        timestamp: 7000,
        type: 'user_message',
        data: { text: 'Yes' }
      },
      {
        timestamp: 8000,
        type: 'tool_call',
        data: {
          tool: 'edit',
          input: { filePath: 'test.ts' }
        }
      }
    ];

    const result = await evaluator.evaluate(timeline, sessionInfo);

    expect(result.passed).toBe(true);
    expect(result.metadata.errorCount).toBe(2);
  });
});
