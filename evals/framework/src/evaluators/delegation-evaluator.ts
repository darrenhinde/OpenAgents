/**
 * DelegationEvaluator - Validates the 4+ file delegation rule
 * 
 * Rules:
 * 1. When a task involves 4+ files, agent should delegate to task-manager
 * 2. Agent can execute directly for 1-3 files
 * 3. Exception: User explicitly says "don't delegate" or "just do it"
 * 4. Delegation should happen BEFORE direct execution starts
 * 
 * Checks:
 * - Count files affected by write/edit tool calls
 * - Check if task tool was used for delegation
 * - Report violations where 4+ files are modified without delegation
 * - Track whether delegation was appropriate
 */

import { BaseEvaluator } from './base-evaluator.js';
import {
  TimelineEvent,
  SessionInfo,
  EvaluationResult,
  Violation,
  Evidence,
  Check,
  DelegationCheck
} from '../types/index.js';

export class DelegationEvaluator extends BaseEvaluator {
  name = 'delegation';
  description = 'Validates 4+ file delegation rule for complex tasks';

  // Delegation thresholds
  private readonly FILE_COUNT_THRESHOLD = 4;
  private readonly TIME_ESTIMATE_THRESHOLD_MINUTES = 60;
  private readonly COMPLEXITY_SCORE_THRESHOLD = 10;

  async evaluate(timeline: TimelineEvent[], sessionInfo: SessionInfo): Promise<EvaluationResult> {
    const checks: Check[] = [];
    const violations: Violation[] = [];
    const evidence: Evidence[] = [];

    // Get file modification tools (write, edit)
    const fileModTools = this.getFileModificationTools(timeline);
    
    // Count affected files
    const fileCount = this.countAffectedFiles(fileModTools);

    // Calculate complexity score
    const complexityScore = this.calculateComplexityScore(timeline, fileModTools);
    
    // Estimate time required
    const estimatedMinutes = this.estimateTimeRequired(fileCount, complexityScore);

    // Get delegation tool calls (task tool)
    const delegationCalls = this.getToolCallsByName(timeline, 'task');
    const didDelegate = delegationCalls.length > 0;
    
    // Add evidence for each task tool call
    if (didDelegate) {
      delegationCalls.forEach((call, index) => {
        const input = call.data?.input || {};
        evidence.push(this.createEvidence(
          'task-tool-call',
          `Task tool call #${index + 1}: ${input.description || 'No description'}`,
          {
            subagent_type: input.subagent_type,
            description: input.description,
            prompt: input.prompt,
            timestamp: call.timestamp
          }
        ));
      });
    }

    // Determine if delegation was required (multiple criteria)
    const shouldDelegate = 
      fileCount >= this.FILE_COUNT_THRESHOLD ||
      estimatedMinutes >= this.TIME_ESTIMATE_THRESHOLD_MINUTES ||
      complexityScore >= this.COMPLEXITY_SCORE_THRESHOLD;

    // Check if user said not to delegate
    const userMessages = this.getUserMessages(timeline);
    const skipDelegation = this.shouldSkipDelegation(userMessages);

    // Build check
    const check: DelegationCheck = {
      shouldDelegate,
      didDelegate,
      fileCount,
      delegationThreshold: this.FILE_COUNT_THRESHOLD,
      evidence: []
    };

    if (fileCount === 0) {
      // No files modified - N/A
      check.evidence.push('No files were modified in this session');
      checks.push({
        name: 'no-file-modifications',
        passed: true,
        weight: 100,
        evidence: [
          this.createEvidence(
            'file-count',
            'No file modifications detected',
            { fileCount: 0 }
          )
        ]
      });
    } else if (shouldDelegate && !didDelegate && !skipDelegation) {
      // Should have delegated but didn't
      check.evidence.push(
        `File count: ${fileCount} (threshold: ${this.FILE_COUNT_THRESHOLD})`,
        `Delegation required but not used`,
        `Files affected: ${fileCount}`
      );

      checks.push({
        name: 'delegation-required',
        passed: false,
        weight: 100,
        evidence: check.evidence.map(e =>
          this.createEvidence('delegation-check', e, { fileCount, shouldDelegate, didDelegate })
        )
      });

      violations.push(
        this.createViolation(
          'missing-delegation',
          'warning',
          `Task modified ${fileCount} files (>= ${this.FILE_COUNT_THRESHOLD}) without delegating to task-manager`,
          fileModTools[0]?.timestamp || Date.now(),
          {
            fileCount,
            threshold: this.FILE_COUNT_THRESHOLD,
            filesAffected: this.getAffectedFilePaths(fileModTools)
          }
        )
      );
    } else if (shouldDelegate && didDelegate) {
      // Correctly delegated
      check.evidence.push(
        `File count: ${fileCount} (threshold: ${this.FILE_COUNT_THRESHOLD})`,
        `Correctly delegated to task-manager`,
        `Delegation calls: ${delegationCalls.length}`
      );

      checks.push({
        name: 'delegation-correct',
        passed: true,
        weight: 100,
        evidence: check.evidence.map(e =>
          this.createEvidence('delegation-check', e, { fileCount, shouldDelegate, didDelegate })
        )
      });
    } else if (!shouldDelegate && didDelegate) {
      // Over-delegated (delegated when not needed)
      check.evidence.push(
        `File count: ${fileCount} (threshold: ${this.FILE_COUNT_THRESHOLD})`,
        `Delegated unnecessarily (< ${this.FILE_COUNT_THRESHOLD} files)`,
        `This is acceptable but not required`
      );

      checks.push({
        name: 'over-delegation',
        passed: true, // Not a violation, just a note
        weight: 100,
        evidence: check.evidence.map(e =>
          this.createEvidence('delegation-check', e, { fileCount, shouldDelegate, didDelegate })
        )
      });

      evidence.push(
        this.createEvidence(
          'over-delegation',
          'Delegated for task with < 4 files (acceptable but not required)',
          { fileCount, delegationCalls: delegationCalls.length }
        )
      );
    } else {
      // Correctly executed directly (< 4 files, no delegation)
      check.evidence.push(
        `File count: ${fileCount} (threshold: ${this.FILE_COUNT_THRESHOLD})`,
        `Correctly executed directly (< ${this.FILE_COUNT_THRESHOLD} files)`,
        `No delegation required`
      );

      checks.push({
        name: 'direct-execution-correct',
        passed: true,
        weight: 100,
        evidence: check.evidence.map(e =>
          this.createEvidence('delegation-check', e, { fileCount, shouldDelegate, didDelegate })
        )
      });
    }

    // Add general evidence
    evidence.push(
      this.createEvidence(
        'file-modifications',
        `${fileCount} files affected by this task`,
        {
          fileCount,
          files: this.getAffectedFilePaths(fileModTools),
          threshold: this.FILE_COUNT_THRESHOLD
        }
      )
    );

    if (delegationCalls.length > 0) {
      evidence.push(
        this.createEvidence(
          'delegation-calls',
          `${delegationCalls.length} delegation calls made`,
          {
            delegations: delegationCalls.map(call => ({
              timestamp: call.timestamp,
              agent: call.data?.input?.subagent_type,
              prompt: call.data?.input?.prompt?.substring(0, 100)
            }))
          }
        )
      );
    }

    if (skipDelegation) {
      evidence.push(
        this.createEvidence(
          'skip-delegation',
          'User explicitly requested to skip delegation',
          { userMessages: userMessages.map(m => m.data) }
        )
      );
    }

    return this.buildResult(this.name, checks, violations, evidence, {
      fileCount,
      complexityScore,
      estimatedMinutes,
      delegationThreshold: this.FILE_COUNT_THRESHOLD,
      timeThreshold: this.TIME_ESTIMATE_THRESHOLD_MINUTES,
      complexityThreshold: this.COMPLEXITY_SCORE_THRESHOLD,
      shouldDelegate,
      didDelegate,
      skipDelegation,
      delegationCheck: check,
      delegationReasons: this.getDelegationReasons(fileCount, complexityScore, estimatedMinutes)
    });
  }

  /**
   * Get file modification tool calls (write, edit)
   */
  private getFileModificationTools(timeline: TimelineEvent[]): TimelineEvent[] {
    return this.getToolCalls(timeline).filter(event =>
      event.data?.tool === 'write' || event.data?.tool === 'edit'
    );
  }

  /**
   * Get affected file paths from tool calls
   */
  private getAffectedFilePaths(toolCalls: TimelineEvent[]): string[] {
    const files = new Set<string>();
    
    for (const call of toolCalls) {
      const input = call.data?.input;
      if (input?.filePath) {
        files.add(input.filePath);
      }
      if (input?.path) {
        files.add(input.path);
      }
    }

    return Array.from(files);
  }

  /**
   * Check if user said to skip delegation
   */
  private shouldSkipDelegation(userMessages: TimelineEvent[]): boolean {
    const skipPatterns = [
      /don't\s+delegate/i,
      /no\s+delegation/i,
      /just\s+do\s+it/i,
      /do\s+it\s+yourself/i,
      /without\s+delegat/i,
      /skip\s+delegation/i
    ];

    for (const msg of userMessages) {
      const text = msg.data?.text || msg.data?.content || '';
      if (skipPatterns.some(pattern => pattern.test(text))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate complexity score based on multiple factors
   * 
   * Factors:
   * - Number of different file types
   * - Number of different directories
   * - Presence of test files
   * - Presence of configuration files
   * - Multiple module types (frontend + backend)
   */
  private calculateComplexityScore(timeline: TimelineEvent[], fileModTools: TimelineEvent[]): number {
    let score = 0;
    const filePaths = this.getAffectedFilePaths(fileModTools);
    
    if (filePaths.length === 0) return 0;

    // Factor 1: Multiple file types (+2 per unique extension beyond first)
    const extensions = new Set(filePaths.map(f => {
      const match = f.match(/\.([^.]+)$/);
      return match ? match[1] : '';
    }).filter(Boolean));
    score += Math.max(0, (extensions.size - 1) * 2);

    // Factor 2: Multiple directories (+1 per unique directory beyond first)
    const directories = new Set(filePaths.map(f => {
      const parts = f.split('/');
      return parts.slice(0, -1).join('/');
    }).filter(Boolean));
    score += Math.max(0, (directories.size - 1));

    // Factor 3: Test files present (+3)
    const hasTests = filePaths.some(f => 
      f.includes('/test/') || 
      f.includes('/tests/') || 
      f.includes('.test.') || 
      f.includes('.spec.')
    );
    if (hasTests) score += 3;

    // Factor 4: Configuration files (+2)
    const hasConfig = filePaths.some(f =>
      f.includes('config') ||
      f.includes('.json') ||
      f.includes('.yaml') ||
      f.includes('.yml')
    );
    if (hasConfig) score += 2;

    // Factor 5: Multiple module types (+4)
    const hasFrontend = filePaths.some(f => 
      f.includes('/components/') ||
      f.includes('/pages/') ||
      f.includes('/ui/')
    );
    const hasBackend = filePaths.some(f =>
      f.includes('/api/') ||
      f.includes('/server/') ||
      f.includes('/services/')
    );
    if (hasFrontend && hasBackend) score += 4;

    // Factor 6: Read operations suggest research needed (+1 per 3 reads)
    const readCalls = this.getToolCallsByName(timeline, 'read');
    score += Math.floor(readCalls.length / 3);

    return score;
  }

  /**
   * Estimate time required in minutes
   * 
   * Base estimates:
   * - 15 minutes per file
   * - +5 minutes per complexity point
   * - Minimum 10 minutes
   */
  private estimateTimeRequired(fileCount: number, complexityScore: number): number {
    const baseTime = fileCount * 15; // 15 min per file
    const complexityTime = complexityScore * 5; // 5 min per complexity point
    const total = baseTime + complexityTime;
    
    return Math.max(10, total); // Minimum 10 minutes
  }

  /**
   * Get reasons why delegation was/wasn't required
   */
  private getDelegationReasons(fileCount: number, complexityScore: number, estimatedMinutes: number): string[] {
    const reasons: string[] = [];
    
    if (fileCount >= this.FILE_COUNT_THRESHOLD) {
      reasons.push(`File count (${fileCount}) >= threshold (${this.FILE_COUNT_THRESHOLD})`);
    }
    
    if (complexityScore >= this.COMPLEXITY_SCORE_THRESHOLD) {
      reasons.push(`Complexity score (${complexityScore}) >= threshold (${this.COMPLEXITY_SCORE_THRESHOLD})`);
    }
    
    if (estimatedMinutes >= this.TIME_ESTIMATE_THRESHOLD_MINUTES) {
      reasons.push(`Estimated time (${estimatedMinutes} min) >= threshold (${this.TIME_ESTIMATE_THRESHOLD_MINUTES} min)`);
    }
    
    if (reasons.length === 0) {
      reasons.push('Task is simple enough for direct execution');
    }
    
    return reasons;
  }
}
