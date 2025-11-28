/**
 * Unit tests for ContextLoadingEvaluator file mapping
 * 
 * Tests the critical fix: evaluator must validate WHICH context file was loaded,
 * not just IF a context file was loaded.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ContextLoadingEvaluator } from '../context-loading-evaluator.js';
import type { TimelineEvent, SessionInfo } from '../../types/index.js';

describe('ContextLoadingEvaluator - File Mapping', () => {
  let evaluator: ContextLoadingEvaluator;
  let sessionInfo: SessionInfo;

  beforeEach(() => {
    evaluator = new ContextLoadingEvaluator();
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

  it('should PASS when correct context file loaded for CODE task', async () => {
    const timeline: TimelineEvent[] = [
      {
        timestamp: 1000,
        type: 'user_message',
        data: { text: 'Create a function called add in math.ts' }
      },
      {
        timestamp: 2000,
        type: 'tool_call',
        data: { 
          tool: 'read',
          input: { filePath: '.opencode/context/core/standards/code.md' }
        }
      },
      {
        timestamp: 3000,
        type: 'tool_call',
        data: { 
          tool: 'write',
          input: { filePath: 'math.ts', content: 'export function add(a, b) { return a + b; }' }
        }
      }
    ];

    const result = await evaluator.evaluate(timeline, sessionInfo);

    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.metadata.taskType).toBe('code');
    expect(result.metadata.correctContextLoaded).toBe(true);
    expect(result.metadata.expectedContextFiles).toContain('code.md');
  });

  it('should FAIL when wrong context file loaded for CODE task', async () => {
    const timeline: TimelineEvent[] = [
      {
        timestamp: 1000,
        type: 'user_message',
        data: { text: 'Create a function called add in math.ts' }
      },
      {
        timestamp: 2000,
        type: 'tool_call',
        data: { 
          tool: 'read',
          input: { filePath: '.opencode/context/core/standards/docs.md' } // WRONG FILE
        }
      },
      {
        timestamp: 3000,
        type: 'tool_call',
        data: { 
          tool: 'write',
          input: { filePath: 'math.ts', content: 'export function add(a, b) { return a + b; }' }
        }
      }
    ];

    const result = await evaluator.evaluate(timeline, sessionInfo);

    expect(result.passed).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.violations[0].type).toBe('wrong-context-file');
    expect(result.metadata.taskType).toBe('code');
    expect(result.metadata.correctContextLoaded).toBe(false);
  });

  it('should PASS when correct context file loaded for TESTS task', async () => {
    const timeline: TimelineEvent[] = [
      {
        timestamp: 1000,
        type: 'user_message',
        data: { text: 'Write a test for the add function' }
      },
      {
        timestamp: 2000,
        type: 'tool_call',
        data: { 
          tool: 'read',
          input: { filePath: '.opencode/context/core/standards/tests.md' }
        }
      },
      {
        timestamp: 3000,
        type: 'tool_call',
        data: { 
          tool: 'write',
          input: { filePath: 'math.test.ts', content: 'test("add", () => {})' }
        }
      }
    ];

    const result = await evaluator.evaluate(timeline, sessionInfo);

    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.metadata.taskType).toBe('tests');
    expect(result.metadata.correctContextLoaded).toBe(true);
  });

  it('should PASS when correct context file loaded for DOCS task', async () => {
    const timeline: TimelineEvent[] = [
      {
        timestamp: 1000,
        type: 'user_message',
        data: { text: 'Write documentation for the API' }
      },
      {
        timestamp: 2000,
        type: 'tool_call',
        data: { 
          tool: 'read',
          input: { filePath: '.opencode/context/core/standards/docs.md' }
        }
      },
      {
        timestamp: 3000,
        type: 'tool_call',
        data: { 
          tool: 'write',
          input: { filePath: 'API.md', content: '# API Documentation' }
        }
      }
    ];

    const result = await evaluator.evaluate(timeline, sessionInfo);

    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.metadata.taskType).toBe('docs');
    expect(result.metadata.correctContextLoaded).toBe(true);
  });

  it('should PASS for bash-only tasks without context', async () => {
    const timeline: TimelineEvent[] = [
      {
        timestamp: 1000,
        type: 'user_message',
        data: { text: 'List files in the directory' }
      },
      {
        timestamp: 2000,
        type: 'tool_call',
        data: { 
          tool: 'bash',
          input: { command: 'ls -la' }
        }
      }
    ];

    const result = await evaluator.evaluate(timeline, sessionInfo);

    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.metadata.isBashOnly).toBe(true);
  });

  it('should classify DELEGATION tasks correctly', async () => {
    const timeline: TimelineEvent[] = [
      {
        timestamp: 1000,
        type: 'user_message',
        data: { text: 'Implement a new feature' }
      },
      {
        timestamp: 2000,
        type: 'tool_call',
        data: { 
          tool: 'read',
          input: { filePath: '.opencode/context/core/workflows/delegation.md' }
        }
      },
      {
        timestamp: 3000,
        type: 'tool_call',
        data: { 
          tool: 'task',
          input: { prompt: 'Create component', subagent_type: 'coder' }
        }
      }
    ];

    const result = await evaluator.evaluate(timeline, sessionInfo);

    expect(result.passed).toBe(true);
    expect(result.metadata.taskType).toBe('delegation');
    expect(result.metadata.correctContextLoaded).toBe(true);
  });

  it('should accept flexible file path matching', async () => {
    const timeline: TimelineEvent[] = [
      {
        timestamp: 1000,
        type: 'user_message',
        data: { text: 'Create a function' }
      },
      {
        timestamp: 2000,
        type: 'tool_call',
        data: { 
          tool: 'read',
          input: { filePath: 'standards/code.md' } // Partial path
        }
      },
      {
        timestamp: 3000,
        type: 'tool_call',
        data: { 
          tool: 'write',
          input: { filePath: 'test.ts' }
        }
      }
    ];

    const result = await evaluator.evaluate(timeline, sessionInfo);

    expect(result.passed).toBe(true);
    expect(result.metadata.correctContextLoaded).toBe(true);
  });

  it('should accept any context file for UNKNOWN task types', async () => {
    const timeline: TimelineEvent[] = [
      {
        timestamp: 1000,
        type: 'user_message',
        data: { text: 'Do something' } // Vague task
      },
      {
        timestamp: 2000,
        type: 'tool_call',
        data: { 
          tool: 'read',
          input: { filePath: '.opencode/context/core/standards/code.md' }
        }
      },
      {
        timestamp: 3000,
        type: 'tool_call',
        data: { 
          tool: 'write',
          input: { filePath: 'test.txt' }
        }
      }
    ];

    const result = await evaluator.evaluate(timeline, sessionInfo);

    expect(result.passed).toBe(true);
    expect(result.metadata.taskType).toBe('unknown');
    expect(result.metadata.correctContextLoaded).toBe(true);
  });

  it('should classify REVIEW tasks correctly', async () => {
    const timeline: TimelineEvent[] = [
      {
        timestamp: 1000,
        type: 'user_message',
        data: { text: 'Review the code for security issues' }
      },
      {
        timestamp: 2000,
        type: 'tool_call',
        data: { 
          tool: 'read',
          input: { filePath: '.opencode/context/core/workflows/review.md' }
        }
      },
      {
        timestamp: 3000,
        type: 'tool_call',
        data: { 
          tool: 'write',
          input: { filePath: 'review.md' }
        }
      }
    ];

    const result = await evaluator.evaluate(timeline, sessionInfo);

    expect(result.passed).toBe(true);
    expect(result.metadata.taskType).toBe('review');
    expect(result.metadata.correctContextLoaded).toBe(true);
  });
});
