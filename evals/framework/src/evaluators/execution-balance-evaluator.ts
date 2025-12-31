/**
 * ExecutionBalanceEvaluator - Evaluates balance and order between read and execution operations.
 *
 * Rules:
 * 1. At least one read operation (read/glob/grep/list) must occur before the first execution tool (bash/write/edit/task).
 * 2. The read-to-execution ratio must be >= 1 when there are executions (promotes exploration before modification).
 *
 * Violations:
 * - execution-before-read (error): A modification tool is executed without any prior read operations.
 * - insufficient-read (warning): Fewer reads than total executions.
 */

import { BaseEvaluator } from './base-evaluator.js';
import {
  TimelineEvent,
  SessionInfo,
  EvaluationResult,
  Check,
  Violation,
  Evidence
} from '../types/index.js';

export class ExecutionBalanceEvaluator extends BaseEvaluator {
  name = 'execution-balance';
  description = 'Verifies that reads occur before executions and maintains a healthy read/execution ratio';

  async evaluate(timeline: TimelineEvent[], sessionInfo: SessionInfo): Promise<EvaluationResult> {
    const checks: Check[] = [];
    const violations: Violation[] = [];
    const evidence: Evidence[] = [];

    const readEvents = this.getReadTools(timeline);
    const execEvents = this.getExecutionTools(timeline);

    const firstExec = execEvents.sort((a,b)=>a.timestamp-b.timestamp)[0];
    const firstRead = readEvents.sort((a,b)=>a.timestamp-b.timestamp)[0];

    // Check 1: Read before first execution
    const readBeforeExec = !firstExec || (firstRead && firstRead.timestamp < firstExec.timestamp);
    checks.push({
      name: 'read-before-first-exec',
      passed: readBeforeExec,
      weight: 50,
      evidence: [
        this.createEvidence(
          'ordering',
          'Order of first read and first execution',
          {
            firstReadTs: firstRead?.timestamp,
            firstExecTs: firstExec?.timestamp,
            readBeforeExec
          },
          firstExec?.timestamp || firstRead?.timestamp
        )
      ]
    });

    if (!readBeforeExec && firstExec) {
      violations.push(
        this.createViolation(
          'execution-before-read',
          'error',
          'A modification tool was executed without prior read operations',
          firstExec.timestamp,
          {
            tool: firstExec.data?.tool,
            execTimestamp: firstExec.timestamp
          }
        )
      );
    }

    // Check 2: Read/execution ratio >= 1 (only if there are executions)
    const readCount = readEvents.length;
    const execCount = execEvents.length;
    const ratio = execCount === 0 ? Infinity : readCount / execCount;

    const ratioPass = execCount === 0 || ratio >= 1;
    checks.push({
      name: 'read-exec-ratio',
      passed: ratioPass,
      weight: 50,
      evidence: [
        this.createEvidence(
          'ratio-metrics',
          'Read/execution ratio metrics',
          { readCount, execCount, ratio }
        )
      ]
    });

    if (!ratioPass && execCount > 0) {
      // We use warning to encourage improvement without completely blocking
      const firstBad = execEvents[0];
      violations.push(
        this.createViolation(
          'insufficient-read',
          'warning',
          `Read/execution ratio < 1 (${ratio.toFixed(2)})`,
          firstBad.timestamp,
          { readCount, execCount, ratio }
        )
      );
    }

    // Contextual evidence
    evidence.push(
      this.createEvidence(
        'session-summary',
        'Basic session summary for execution balance',
        {
          title: sessionInfo.title,
          readCount,
          execCount,
          ratio,
          hasExecution: execCount > 0
        }
      )
    );

    return this.buildResult(this.name, checks, violations, evidence, {
      readCount,
      execCount,
      ratio,
      readBeforeExec
    });
  }
}
