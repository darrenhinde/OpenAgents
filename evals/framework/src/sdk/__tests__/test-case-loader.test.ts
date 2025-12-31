/**
 * Test YAML test case schema and loader
 * 
 * NOTE: This file tests loading test cases from the actual test directory.
 * For more comprehensive YAML loading tests, see yaml-loader.test.ts
 */

import { describe, it, expect } from 'vitest';
import { loadTestCase } from '../test-case-loader.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to test files - using new category-based structure
const testFilesDir = join(__dirname, '../../../../agents/core/openagent/tests');

describe('TestCaseLoader', () => {
  describe('loadTestCase', () => {
    it('should load a valid test case from YAML', async () => {
      const testCase = await loadTestCase(join(testFilesDir, 'smoke-test.yaml'));
      
      expect(testCase.id).toBe('smoke-test-001');
      expect(testCase.name).toBeDefined();
      expect(testCase.description).toBeDefined();
      expect(testCase.category).toBe('developer');
      expect(testCase.prompt || testCase.prompts).toBeDefined();
      expect(testCase.approvalStrategy).toBeDefined();
    });

    it('should validate required fields', async () => {
      const testCase = await loadTestCase(join(testFilesDir, '01-critical-rules/approval-gate/05-approval-before-execution-positive.yaml'));
      
      // Required fields
      expect(testCase.id).toBeDefined();
      expect(testCase.name).toBeDefined();
      expect(testCase.description).toBeDefined();
      expect(testCase.category).toBeDefined();
      expect(testCase.approvalStrategy).toBeDefined();
      
      // Must have prompt or prompts
      expect(testCase.prompt || testCase.prompts).toBeDefined();
    });

    it('should parse behavior expectations', async () => {
      const testCase = await loadTestCase(join(testFilesDir, '01-critical-rules/approval-gate/05-approval-before-execution-positive.yaml'));
      
      expect(testCase.behavior).toBeDefined();
      expect(testCase.behavior?.mustUseTools).toContain('write');
      expect(testCase.behavior?.requiresApproval).toBe(true);
    });

    it('should parse expected violations', async () => {
      const testCase = await loadTestCase(join(testFilesDir, '01-critical-rules/approval-gate/05-approval-before-execution-positive.yaml'));
      
      expect(testCase.expectedViolations).toBeDefined();
      expect(testCase.expectedViolations?.length).toBeGreaterThan(0);
      
      const approvalViolation = testCase.expectedViolations?.find(v => v.rule === 'approval-gate');
      expect(approvalViolation).toBeDefined();
      expect(approvalViolation?.shouldViolate).toBe(false); // Positive test - should NOT violate
    });

    it('should parse approval strategy', async () => {
      const testCase = await loadTestCase(join(testFilesDir, 'smoke-test.yaml'));
      
      expect(testCase.approvalStrategy.type).toBe('auto-approve');
    });

    it('should parse optional fields', async () => {
      const testCase = await loadTestCase(join(testFilesDir, '01-critical-rules/approval-gate/05-approval-before-execution-positive.yaml'));
      
      expect(testCase.timeout).toBeDefined();
      expect(testCase.tags).toBeDefined();
      expect(testCase.tags?.length).toBeGreaterThan(0);
    });

    it('should throw on invalid file path', async () => {
      await expect(loadTestCase('/nonexistent/path.yaml')).rejects.toThrow();
    });
  });
});
