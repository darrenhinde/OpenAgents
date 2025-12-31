/**
 * BaseEvaluator - Abstract base class for all evaluators
 * 
 * Provides common functionality for evaluating OpenCode sessions:
 * - Timeline filtering and searching
 * - Evidence collection
 * - Violation tracking
 * - Score calculation
 */

import {
  IEvaluator,
  TimelineEvent,
  SessionInfo,
  EvaluationResult,
  Violation,
  Evidence,
  Check,
  ToolPart
} from '../types/index.js';

export abstract class BaseEvaluator implements IEvaluator {
  abstract name: string;
  abstract description: string;

  /**
   * Main evaluation method - must be implemented by subclasses
   */
  abstract evaluate(timeline: TimelineEvent[], sessionInfo: SessionInfo): Promise<EvaluationResult>;

  // ============================================================================
  // Helper Methods - Timeline Filtering
  // ============================================================================

  /**
   * Get all tool call events from timeline
   */
  protected getToolCalls(timeline: TimelineEvent[]): TimelineEvent[] {
    return timeline.filter(event => event.type === 'tool_call');
  }

  /**
   * Get tool calls by specific tool name
   */
  protected getToolCallsByName(timeline: TimelineEvent[], toolName: string): TimelineEvent[] {
    return this.getToolCalls(timeline).filter(event => 
      event.data?.tool === toolName
    );
  }

  /**
   * Get execution tools (bash, write, edit, task)
   */
  protected getExecutionTools(timeline: TimelineEvent[]): TimelineEvent[] {
    const executionTools = ['bash', 'write', 'edit', 'task'];
    return this.getToolCalls(timeline).filter(event =>
      executionTools.includes(event.data?.tool)
    );
  }

  /**
   * Get read tools (read, glob, grep, list)
   */
  protected getReadTools(timeline: TimelineEvent[]): TimelineEvent[] {
    const readTools = ['read', 'glob', 'grep', 'list'];
    return this.getToolCalls(timeline).filter(event =>
      readTools.includes(event.data?.tool)
    );
  }

  /**
   * Get assistant text messages
   */
  protected getAssistantMessages(timeline: TimelineEvent[]): TimelineEvent[] {
    return timeline.filter(event => 
      event.type === 'assistant_message' || event.type === 'text'
    );
  }

  /**
   * Get user messages
   */
  protected getUserMessages(timeline: TimelineEvent[]): TimelineEvent[] {
    return timeline.filter(event => event.type === 'user_message');
  }

  /**
   * Get events in time range
   */
  protected getEventsInTimeRange(
    timeline: TimelineEvent[],
    startTime: number,
    endTime: number
  ): TimelineEvent[] {
    return timeline.filter(event =>
      event.timestamp >= startTime && event.timestamp <= endTime
    );
  }

  /**
   * Get events before timestamp
   */
  protected getEventsBefore(timeline: TimelineEvent[], timestamp: number): TimelineEvent[] {
    return timeline.filter(event => event.timestamp < timestamp);
  }

  /**
   * Get events after timestamp
   */
  protected getEventsAfter(timeline: TimelineEvent[], timestamp: number): TimelineEvent[] {
    return timeline.filter(event => event.timestamp > timestamp);
  }

  // ============================================================================
  // Helper Methods - Content Analysis
  // ============================================================================

  /**
   * Check if text contains approval language
   * Looks for phrases like "may I", "should I", "can I proceed", etc.
   */
  protected containsApprovalLanguage(text: string): boolean {
    const approvalPatterns = [
      /may\s+i/i,
      /should\s+i/i,
      /can\s+i\s+proceed/i,
      /would\s+you\s+like\s+me\s+to/i,
      /do\s+you\s+want\s+me\s+to/i,
      /shall\s+i/i,
      /is\s+it\s+ok\s+to/i,
      /is\s+it\s+okay\s+to/i,
      /permission\s+to/i,
      /approv/i,           // Matches "approve", "approval", "approved", etc.
      /confirm/i,
      /proceed/i,          // Common approval request language
      /before\s+proceeding/i,  // "Approval needed before proceeding"
    ];

    return approvalPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Enhanced approval detection with confidence levels
   * Returns detailed information about approval request
   */
  protected detectApprovalRequest(text: string): {
    detected: boolean;
    confidence: 'high' | 'medium' | 'low';
    approvalText?: string;
    whatIsBeingApproved?: string;
  } {
    // High confidence patterns - explicit approval requests
    const highConfidencePatterns = [
      /approval\s+needed\s+before/i,
      /please\s+confirm\s+before/i,
      /request\s+approval/i,
      /need\s+your\s+approval/i,
      /awaiting\s+approval/i,
      /\*\*approval\s+needed/i
    ];

    // Medium confidence patterns - approval-like language
    const mediumConfidencePatterns = [
      /would\s+you\s+like\s+me\s+to/i,
      /should\s+i\s+proceed/i,
      /can\s+i\s+proceed/i,
      /shall\s+i\s+proceed/i,
      /do\s+you\s+want\s+me\s+to/i,
      /is\s+it\s+ok(?:ay)?\s+to/i
    ];

    // Low confidence patterns - weak signals (with context checks)
    const lowConfidencePatterns = [
      /may\s+i/i,
      /should\s+i/i,
      /shall\s+i/i
    ];

    // False positive filters for low confidence
    const falsePositivePatterns = [
      /may\s+i\s+help/i,
      /may\s+i\s+ask/i,
      /may\s+i\s+suggest/i
    ];

    // Check high confidence
    for (const pattern of highConfidencePatterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          detected: true,
          confidence: 'high',
          approvalText: this.extractApprovalSentence(text, match.index!),
          whatIsBeingApproved: this.extractWhatIsBeingApproved(text)
        };
      }
    }

    // Check medium confidence
    for (const pattern of mediumConfidencePatterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          detected: true,
          confidence: 'medium',
          approvalText: this.extractApprovalSentence(text, match.index!),
          whatIsBeingApproved: this.extractWhatIsBeingApproved(text)
        };
      }
    }

    // Check low confidence (with false positive filtering)
    for (const pattern of lowConfidencePatterns) {
      const match = text.match(pattern);
      if (match) {
        // Check for false positives
        if (falsePositivePatterns.some(fp => fp.test(text))) {
          continue;
        }
        
        return {
          detected: true,
          confidence: 'low',
          approvalText: this.extractApprovalSentence(text, match.index!),
          whatIsBeingApproved: this.extractWhatIsBeingApproved(text)
        };
      }
    }

    return { detected: false, confidence: 'low' };
  }

  /**
   * Extract the sentence containing approval request
   */
  private extractApprovalSentence(text: string, matchIndex: number): string {
    // Find sentence boundaries around the match
    const beforeMatch = text.substring(0, matchIndex);
    const afterMatch = text.substring(matchIndex);
    
    const sentenceStart = Math.max(
      beforeMatch.lastIndexOf('.'),
      beforeMatch.lastIndexOf('!'),
      beforeMatch.lastIndexOf('?'),
      beforeMatch.lastIndexOf('\n')
    ) + 1;
    
    const sentenceEnd = Math.min(
      afterMatch.search(/[.!?]/),
      afterMatch.indexOf('\n')
    );
    
    const sentence = text.substring(
      sentenceStart,
      matchIndex + (sentenceEnd > 0 ? sentenceEnd + 1 : afterMatch.length)
    ).trim();
    
    return sentence.length > 200 ? sentence.substring(0, 200) + '...' : sentence;
  }

  /**
   * Extract what is being approved from the text
   */
  private extractWhatIsBeingApproved(text: string): string | undefined {
    // Look for plan descriptions, action lists, etc.
    const planPatterns = [
      /##\s*(?:proposed\s+)?plan[:\s]+([\s\S]{0,300})/i,
      /i\s+(?:will|would|plan\s+to)[:\s]+([\s\S]{0,200})/i,
      /(?:steps?|actions?)[:\s]+\n([\s\S]{0,200})/i
    ];

    for (const pattern of planPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const description = match[1].trim();
        return description.length > 150 ? description.substring(0, 150) + '...' : description;
      }
    }

    return undefined;
  }

  /**
   * Extract file paths from text
   */
  protected extractFilePaths(text: string): string[] {
    // Match common file path patterns
    const pathPattern = /(?:\/[\w.-]+)+(?:\.[\w]+)?/g;
    const matches = text.match(pathPattern) || [];
    return [...new Set(matches)]; // Remove duplicates
  }

  /**
   * Check if text mentions a specific file
   */
  protected mentionsFile(text: string, filePath: string): boolean {
    return text.includes(filePath);
  }

  /**
   * Count files affected by tool calls
   */
  protected countAffectedFiles(toolCalls: TimelineEvent[]): number {
    const files = new Set<string>();
    
    for (const call of toolCalls) {
      const input = call.data?.input;
      if (!input) continue;

      // Extract file paths from various tool inputs
      if (input.filePath) {
        files.add(input.filePath);
      }
      if (input.path) {
        files.add(input.path);
      }
      // For glob/grep results
      if (input.pattern && call.data?.output) {
        const outputFiles = this.extractFilePaths(JSON.stringify(call.data.output));
        outputFiles.forEach(f => files.add(f));
      }
    }

    return files.size;
  }

  // ============================================================================
  // Helper Methods - Evidence & Violations
  // ============================================================================

  /**
   * Create evidence object
   */
  protected createEvidence(
    type: string,
    description: string,
    data: any,
    timestamp?: number
  ): Evidence {
    return {
      type,
      description,
      data,
      timestamp
    };
  }

  /**
   * Create violation object
   */
  protected createViolation(
    type: string,
    severity: 'error' | 'warning' | 'info',
    message: string,
    timestamp: number,
    evidence: any
  ): Violation {
    return {
      type,
      severity,
      message,
      timestamp,
      evidence
    };
  }

  /**
   * Calculate score from checks
   * Weighted average based on check weights
   */
  protected calculateScore(checks: Check[]): number {
    if (checks.length === 0) return 100;

    const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
    if (totalWeight === 0) return 100;

    const weightedScore = checks.reduce((sum, check) => {
      const checkScore = check.passed ? 100 : 0;
      return sum + (checkScore * check.weight);
    }, 0);

    return Math.round(weightedScore / totalWeight);
  }

  /**
   * Build evaluation result
   */
  protected buildResult(
    evaluatorName: string,
    checks: Check[],
    violations: Violation[],
    evidence: Evidence[],
    metadata?: any
  ): EvaluationResult {
    const score = this.calculateScore(checks);
    const passed = violations.filter(v => v.severity === 'error').length === 0;

    return {
      evaluator: evaluatorName,
      passed,
      score,
      violations,
      evidence,
      metadata
    };
  }

  // ============================================================================
  // Helper Methods - Logging & Debug
  // ============================================================================

  /**
   * Log evaluation info
   */
  protected log(message: string, data?: any): void {
    console.log(`[${this.name}] ${message}`, data || '');
  }

  /**
   * Log evaluation error
   */
  protected logError(message: string, error?: any): void {
    console.error(`[${this.name}] ERROR: ${message}`, error || '');
  }
}
