/**
 * AgentModelEvaluator - Logs agent and model information for test transparency
 * 
 * This evaluator provides visibility into which agent and model were used during test execution.
 * It extracts actual agent metadata from eval-runner.md and logs it prominently.
 * 
 * Features:
 * - Reads eval-runner.md to extract actual agent metadata (id, name, description)
 * - Shows agent prompt snippet (first 200 chars) to confirm correct agent loaded
 * - Logs expected vs actual agent/model for comparison
 * - Always passes (informational only, not validation)
 * 
 * Note: This is INFORMATIONAL ONLY. Actual agent/model configuration happens at test setup time
 * via test-runner.ts setupEvalRunner(). Session data doesn't store agent/model metadata.
 */

import { BaseEvaluator } from './base-evaluator.js';
import {
  TimelineEvent,
  SessionInfo,
  EvaluationResult,
  Evidence,
  Violation
} from '../types/index.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export interface AgentModelExpectations {
  /** Expected agent name (e.g., "openagent", "opencoder", "coder-agent") */
  expectedAgent?: string;
  /** Expected model (e.g., "opencode/grok-code", "anthropic/claude-3-5-sonnet-20241022") */
  expectedModel?: string;
  /** Project path to find eval-runner.md */
  projectPath?: string;
}

interface AgentMetadata {
  id?: string;
  name?: string;
  description?: string;
  category?: string;
  type?: string;
  version?: string;
  mode?: string;
  promptSnippet?: string;
}

export class AgentModelEvaluator extends BaseEvaluator {
  name = 'agent-model';
  description = 'Logs agent and model information for test transparency';

  private expectations: AgentModelExpectations;

  constructor(expectations: AgentModelExpectations = {}) {
    super();
    this.expectations = expectations;
  }

  /**
   * Extract agent metadata from eval-runner.md frontmatter
   */
  private extractAgentMetadata(projectPath: string): AgentMetadata {
    const metadata: AgentMetadata = {};
    
    try {
      const evalRunnerPath = join(projectPath, '.opencode', 'agent', 'eval-runner.md');
      
      if (!existsSync(evalRunnerPath)) {
        return metadata;
      }

      const content = readFileSync(evalRunnerPath, 'utf-8');
      
      // Extract frontmatter (between --- markers)
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) {
        return metadata;
      }

      const frontmatter = frontmatterMatch[1];
      
      // Extract key fields
      const idMatch = frontmatter.match(/^id:\s*(.+)$/m);
      const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
      const descMatch = frontmatter.match(/^description:\s*["'](.+)["']$/m);
      const categoryMatch = frontmatter.match(/^category:\s*(.+)$/m);
      const typeMatch = frontmatter.match(/^type:\s*(.+)$/m);
      const versionMatch = frontmatter.match(/^version:\s*(.+)$/m);
      const modeMatch = frontmatter.match(/^mode:\s*(.+)$/m);

      if (idMatch) metadata.id = idMatch[1].trim();
      if (nameMatch) metadata.name = nameMatch[1].trim();
      if (descMatch) metadata.description = descMatch[1].trim();
      if (categoryMatch) metadata.category = categoryMatch[1].trim();
      if (typeMatch) metadata.type = typeMatch[1].trim();
      if (versionMatch) metadata.version = versionMatch[1].trim();
      if (modeMatch) metadata.mode = modeMatch[1].trim();

      // Extract prompt snippet (first 200 chars after frontmatter)
      const promptStart = content.indexOf('---', 4) + 3; // Skip first ---
      const promptContent = content.substring(promptStart).trim();
      const snippet = promptContent.substring(0, 200).replace(/\n/g, ' ').trim();
      metadata.promptSnippet = snippet + (promptContent.length > 200 ? '...' : '');

    } catch (error) {
      // Silently fail - this is informational only
    }

    return metadata;
  }

  /**
   * Extract model from timeline events
   * Model is passed in API calls but not stored in session metadata
   */
  private extractModelFromTimeline(timeline: TimelineEvent[]): string | undefined {
    // Look for session.created or message events that might contain model info
    // In practice, model isn't in timeline either, but we try
    return undefined; // Model not available in timeline
  }

  async evaluate(timeline: TimelineEvent[], sessionInfo: SessionInfo): Promise<EvaluationResult> {
    const violations: Violation[] = [];
    const evidence: Evidence[] = [];

    // Extract actual agent metadata from eval-runner.md
    const projectPath = this.expectations.projectPath || process.cwd();
    const actualAgent = this.extractAgentMetadata(projectPath);
    const actualModel = this.extractModelFromTimeline(timeline);

    // Log actual agent information
    if (actualAgent.id || actualAgent.name) {
      evidence.push(this.createEvidence(
        'actual-agent-info',
        `Actual agent loaded: ${actualAgent.name || actualAgent.id || 'unknown'}`,
        {
          id: actualAgent.id,
          name: actualAgent.name,
          description: actualAgent.description,
          category: actualAgent.category,
          type: actualAgent.type,
          version: actualAgent.version,
          mode: actualAgent.mode,
        }
      ));
    }

    // Log agent prompt snippet for verification
    if (actualAgent.promptSnippet) {
      evidence.push(this.createEvidence(
        'agent-prompt-snippet',
        `Agent prompt snippet: "${actualAgent.promptSnippet}"`,
        { snippet: actualAgent.promptSnippet }
      ));
    }

    // Log expected agent/model if set
    if (this.expectations.expectedAgent) {
      evidence.push(this.createEvidence(
        'expected-agent',
        `Expected agent: ${this.expectations.expectedAgent}`,
        { expectedAgent: this.expectations.expectedAgent }
      ));
    }

    if (this.expectations.expectedModel) {
      evidence.push(this.createEvidence(
        'expected-model',
        `Expected model: ${this.expectations.expectedModel}`,
        { expectedModel: this.expectations.expectedModel }
      ));
    }

    // Log informational note
    evidence.push(this.createEvidence(
      'info-note',
      'ℹ️  This evaluator is INFORMATIONAL ONLY - it logs agent/model info but does not validate',
      {
        note: 'Agent/model configuration happens at test setup time (test-runner.ts)',
        actualAgentId: actualAgent.id,
        expectedAgent: this.expectations.expectedAgent,
        expectedModel: this.expectations.expectedModel,
      }
    ));

    // Always pass - this is informational only
    const passed = true;
    const score = 100;

    return {
      evaluator: this.name,
      passed,
      score,
      violations,
      evidence,
      metadata: {
        actualAgent: {
          id: actualAgent.id,
          name: actualAgent.name,
          description: actualAgent.description,
          category: actualAgent.category,
          type: actualAgent.type,
          version: actualAgent.version,
          mode: actualAgent.mode,
          promptSnippet: actualAgent.promptSnippet,
        },
        expectedAgent: this.expectations.expectedAgent,
        expectedModel: this.expectations.expectedModel,
        mode: 'informational',
      }
    };
  }

}
