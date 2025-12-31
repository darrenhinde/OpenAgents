/**
 * ResultValidator - Test result validation logic
 * 
 * Handles validation of test results against expected outcomes:
 * - Behavior expectations (mustUseTools, etc.)
 * - Expected violations (positive/negative tests)
 * - Legacy expected format (deprecated)
 * - Default pass/fail logic
 * 
 * Extracted from test-runner.ts for better modularity.
 */

import type { TestCase } from './test-case-schema.js';
import type { ServerEvent } from './event-stream-handler.js';
import type { AggregatedResult } from '../evaluators/evaluator-runner.js';

/**
 * Logger interface for dependency injection
 */
export interface ValidationLogger {
  log(message: string): void;
}

/**
 * ResultValidator handles test result validation
 */
export class ResultValidator {
  constructor(private readonly logger: ValidationLogger) {}

  /**
   * Evaluate if test result matches expected outcome
   * 
   * Evaluation priority:
   * 1. Check for execution errors
   * 2. Check behavior expectations (if defined)
   * 3. Check expected violations (if defined)
   * 4. Check deprecated expected format (if defined)
   * 5. Default: pass if no errors
   */
  validate(
    testCase: TestCase,
    events: ServerEvent[],
    errors: string[],
    evaluation?: AggregatedResult
  ): boolean {
    // Support both old and new schema
    const expected = testCase.expected;
    const behavior = testCase.behavior;
    const expectedViolations = testCase.expectedViolations;

    // If there were execution errors and test expects to pass, it fails
    if (errors.length > 0 && expected?.pass !== false) {
      this.logger.log(`Test failed due to execution errors: ${errors.join(', ')}`);
      return false;
    }

    // =========================================================================
    // Check behavior evaluator results FIRST (most important)
    // =========================================================================
    if (behavior && evaluation) {
      if (!this.checkBehaviorExpectations(evaluation)) {
        return false;
      }
    }

    // =========================================================================
    // Check expected violations (new format)
    // =========================================================================
    const expectedViolationTypes = new Set<string>();
    
    if (expectedViolations && evaluation) {
      const violationResult = this.checkExpectedViolations(expectedViolations, evaluation, expectedViolationTypes);
      if (!violationResult) {
        return false;
      }
    }

    // =========================================================================
    // Check deprecated expected format
    // =========================================================================
    if (expected) {
      const legacyResult = this.checkLegacyExpected(expected, events, errors, evaluation);
      if (legacyResult !== null) {
        return legacyResult;
      }
    }

    // =========================================================================
    // Default: pass if no errors and no unexpected error-level violations
    // =========================================================================
    if (evaluation && evaluation.violationsBySeverity.error > 0) {
      // Filter out expected violations
      const unexpectedErrors = evaluation.allViolations.filter(v => 
        v.severity === 'error' && !expectedViolationTypes.has(v.type)
      );
      
      if (unexpectedErrors.length > 0) {
        this.logger.log(`Test failed: ${unexpectedErrors.length} unexpected error-level violations`);
        unexpectedErrors.forEach(v => this.logger.log(`  - ${v.type}: ${v.message}`));
        return false;
      }
    }

    return errors.length === 0;
  }

  /**
   * Check behavior evaluator results
   */
  private checkBehaviorExpectations(evaluation: AggregatedResult): boolean {
    // Find the behavior evaluator result
    const behaviorResult = evaluation.evaluatorResults.find(r => r.evaluator === 'behavior');
    
    if (behaviorResult) {
      // Check if behavior evaluator passed
      if (!behaviorResult.passed) {
        this.logger.log(`Behavior validation failed: ${behaviorResult.violations.length} violations`);
        behaviorResult.violations.forEach(v => {
          this.logger.log(`  - [${v.severity}] ${v.type}: ${v.message}`);
        });
        return false;
      }
      
      // Check for error-level violations from behavior evaluator
      const behaviorErrors = behaviorResult.violations.filter(v => v.severity === 'error');
      if (behaviorErrors.length > 0) {
        this.logger.log(`Behavior validation has ${behaviorErrors.length} error-level violations`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Check expected violations (new format)
   */
  private checkExpectedViolations(
    expectedViolations: TestCase['expectedViolations'],
    evaluation: AggregatedResult,
    expectedViolationTypes: Set<string>
  ): boolean {
    if (!expectedViolations) return true;

    for (const expectedViolation of expectedViolations) {
      // Map rule names to violation type patterns
      const rulePatterns: Record<string, string[]> = {
        'approval-gate': ['approval', 'missing-approval'],
        'context-loading': ['context', 'no-context-loaded', 'missing-context', 'wrong-context-file'],
        'delegation': ['delegation', 'missing-delegation'],
        'tool-usage': ['tool', 'suboptimal-tool'],
        'stop-on-failure': ['stop', 'failure'],
        'confirm-cleanup': ['cleanup', 'confirm'],
        'cleanup-confirmation': ['cleanup', 'confirm'],
        'execution-balance': ['execution-balance', 'insufficient-read', 'execution-before-read', 'read-exec-ratio'],
        'report-first': ['report-first', 'report'],
      };

      const patterns = rulePatterns[expectedViolation.rule] || [expectedViolation.rule];
      
      const actualViolations = evaluation.allViolations.filter(v => 
        patterns.some(pattern => v.type.toLowerCase().includes(pattern.toLowerCase()))
      );

      if (expectedViolation.shouldViolate) {
        // Negative test: Should have violation (this is expected behavior)
        if (actualViolations.length === 0) {
          this.logger.log(`❌ Expected ${expectedViolation.rule} violation but none found`);
          return false;
        }
        this.logger.log(`✓ Expected violation '${expectedViolation.rule}' found (as designed)`);
        // Mark these violations as expected so we don't fail on them later
        actualViolations.forEach(v => expectedViolationTypes.add(v.type));
      } else {
        // Positive test: Should NOT have violation
        if (actualViolations.length > 0) {
          this.logger.log(`❌ Unexpected ${expectedViolation.rule} violation: ${actualViolations[0].message}`);
          return false;
        }
        this.logger.log(`✓ No ${expectedViolation.rule} violation (as expected)`);
      }
    }

    return true;
  }

  /**
   * Check legacy expected format (deprecated)
   * Returns null if no decision made, true/false otherwise
   */
  private checkLegacyExpected(
    expected: NonNullable<TestCase['expected']>,
    events: ServerEvent[],
    errors: string[],
    evaluation?: AggregatedResult
  ): boolean | null {
    // Check minimum messages (deprecated)
    if (expected.minMessages !== undefined) {
      const messageEvents = events.filter(e => e.type.includes('message'));
      if (messageEvents.length < expected.minMessages) {
        this.logger.log(`Expected at least ${expected.minMessages} messages, got ${messageEvents.length}`);
        return false;
      }
    }

    // Check maximum messages (deprecated)
    if (expected.maxMessages !== undefined) {
      const messageEvents = events.filter(e => e.type.includes('message'));
      if (messageEvents.length > expected.maxMessages) {
        this.logger.log(`Expected at most ${expected.maxMessages} messages, got ${messageEvents.length}`);
        return false;
      }
    }

    // Check expected violations (deprecated format)
    if (expected.violations && evaluation) {
      const expectedViolationTypes = expected.violations.map(v => v.rule);
      const actualViolationTypes = evaluation.allViolations.map(v => {
        if (v.type.includes('approval')) return 'approval-gate' as const;
        if (v.type.includes('context')) return 'context-loading' as const;
        if (v.type.includes('delegation')) return 'delegation' as const;
        if (v.type.includes('tool')) return 'tool-usage' as const;
        return 'unknown' as const;
      });

      for (const expectedType of expectedViolationTypes) {
        if (['approval-gate', 'context-loading', 'delegation', 'tool-usage'].includes(expectedType)) {
          if (!actualViolationTypes.includes(expectedType as any)) {
            this.logger.log(`Expected violation '${expectedType}' not found`);
            return false;
          }
        }
      }

      if (!expected.pass && evaluation.totalViolations === 0) {
        this.logger.log('Expected violations but none found');
        return false;
      }
    }

    // If test expects to pass, check no critical violations
    if (expected.pass && evaluation) {
      if (evaluation.violationsBySeverity.error > 0) {
        this.logger.log(`Expected pass but found ${evaluation.violationsBySeverity.error} error-level violations`);
        return false;
      }
    }

    // Use expected.pass if specified
    if (expected.pass !== undefined) {
      return expected.pass ? errors.length === 0 : true;
    }

    // No decision made by legacy checks
    return null;
  }
}
