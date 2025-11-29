/**
 * ExecutionBalanceEvaluator - Evalúa equilibrio y orden entre lectura y ejecución.
 *
 * Reglas:
 * 1. Debe existir al menos una operación de lectura (read/glob/grep/list) antes de la primera herramienta de ejecución (bash/write/edit/task).
 * 2. La relación lecturas:ejecuciones debe ser >= 1 cuando hay ejecuciones (favorece exploración antes de modificar).
 *
 * Violaciones:
 * - execution-before-read (error): Se ejecuta una herramienta de modificación sin ninguna lectura previa.
 * - insufficient-read (warning): Menos lecturas que ejecuciones totales.
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
  description = 'Verifica que se lea antes de ejecutar y mantiene un ratio saludable lectura/ejecución';

  async evaluate(timeline: TimelineEvent[], sessionInfo: SessionInfo): Promise<EvaluationResult> {
    const checks: Check[] = [];
    const violations: Violation[] = [];
    const evidence: Evidence[] = [];

    const readEvents = this.getReadTools(timeline);
    const execEvents = this.getExecutionTools(timeline);

    const firstExec = execEvents.sort((a,b)=>a.timestamp-b.timestamp)[0];
    const firstRead = readEvents.sort((a,b)=>a.timestamp-b.timestamp)[0];

    // Check 1: Lectura antes de la primera ejecución
    const readBeforeExec = !firstExec || (firstRead && firstRead.timestamp < firstExec.timestamp);
    checks.push({
      name: 'read-before-first-exec',
      passed: readBeforeExec,
      weight: 50,
      evidence: [
        this.createEvidence(
          'ordering',
          'Orden de primera lectura y primera ejecución',
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
          'Se ejecutó una herramienta de modificación sin lectura previa',
          firstExec.timestamp,
          {
            tool: firstExec.data?.tool,
            execTimestamp: firstExec.timestamp
          }
        )
      );
    }

    // Check 2: Ratio lecturas:ejecuciones >= 1 (solo si hay ejecuciones)
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
          'Métricas de relación lectura/ejecución',
          { readCount, execCount, ratio }
        )
      ]
    });

    if (!ratioPass && execCount > 0) {
      // Usamos warning para incentivar mejora sin bloquear completamente
      const firstBad = execEvents[0];
      violations.push(
        this.createViolation(
          'insufficient-read',
          'warning',
          `Ratio lectura/ejecución < 1 (${ratio.toFixed(2)})`,
          firstBad.timestamp,
          { readCount, execCount, ratio }
        )
      );
    }

    // Evidencia contextual
    evidence.push(
      this.createEvidence(
        'session-summary',
        'Resumen básico de sesión para balance de ejecución',
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
