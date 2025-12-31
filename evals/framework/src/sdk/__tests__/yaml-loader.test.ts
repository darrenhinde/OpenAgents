/**
 * Tests for loading actual YAML test files
 */

import { describe, it, expect } from 'vitest';
import { loadTestCase } from '../test-case-loader.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to test files (using new category-based structure)
const testFilesDir = join(__dirname, '../../../../agents/core/openagent/tests');

describe('YAML Test File Loading', () => {
  describe('smoke tests', () => {
    it('should load smoke-test.yaml', async () => {
      const testCase = await loadTestCase(join(testFilesDir, 'smoke-test.yaml'));
      
      expect(testCase.id).toBe('smoke-test-001');
      expect(testCase.name).toBe('Smoke Test - Simple File Creation');
      expect(testCase.category).toBe('developer');
      expect(testCase.agent).toBe('core/openagent');
      expect(testCase.behavior).toBeDefined();
    });
  });

  describe('critical-rules tests', () => {
    it('should load approval-gate test', async () => {
      const testCase = await loadTestCase(join(testFilesDir, '01-critical-rules/approval-gate/05-approval-before-execution-positive.yaml'));
      
      expect(testCase.id).toBe('pos-approval-before-001');
      expect(testCase.behavior).toBeDefined();
      expect(testCase.behavior?.mustUseTools).toContain('write');
      expect(testCase.behavior?.requiresApproval).toBe(true);
      expect(testCase.expectedViolations).toBeDefined();
      expect(testCase.expectedViolations?.length).toBeGreaterThan(0);
    });

    it('should load context-loading test', async () => {
      const testCase = await loadTestCase(join(testFilesDir, '01-critical-rules/context-loading/01-code-task.yaml'));
      
      expect(testCase.id).toBeDefined();
      expect(testCase.behavior).toBeDefined();
      expect(testCase.expectedViolations).toBeDefined();
    });

    it('should load stop-on-failure test', async () => {
      const testCase = await loadTestCase(join(testFilesDir, '01-critical-rules/stop-on-failure/02-stop-and-report-positive.yaml'));
      
      expect(testCase.id).toBeDefined();
      expect(testCase.behavior).toBeDefined();
      expect(testCase.expectedViolations).toBeDefined();
    });
  });

  describe('delegation tests', () => {
    it('should load simple-task-direct.yaml', async () => {
      const testCase = await loadTestCase(join(testFilesDir, '08-delegation/simple-task-direct.yaml'));
      
      expect(testCase.id).toBeDefined();
      expect(testCase.category).toBeDefined();
      expect(testCase.behavior).toBeDefined();
    });
  });

  describe('validation', () => {
    it('should validate all test files have required fields', async () => {
      const testFiles = [
        'smoke-test.yaml',
        '01-critical-rules/approval-gate/05-approval-before-execution-positive.yaml',
        '01-critical-rules/context-loading/01-code-task.yaml',
        '01-critical-rules/stop-on-failure/02-stop-and-report-positive.yaml',
        '08-delegation/simple-task-direct.yaml',
      ];

      for (const file of testFiles) {
        const testCase = await loadTestCase(join(testFilesDir, file));
        
        // Required fields
        expect(testCase.id).toBeDefined();
        expect(testCase.name).toBeDefined();
        expect(testCase.description).toBeDefined();
        expect(testCase.category).toBeDefined();
        expect(testCase.approvalStrategy).toBeDefined();
        
        // Must have prompt or prompts
        expect(testCase.prompt || testCase.prompts).toBeDefined();
        
        // Must have behavior, expected, or expectedViolations
        expect(testCase.behavior || testCase.expected || testCase.expectedViolations).toBeDefined();
      }
    });
  });
});
