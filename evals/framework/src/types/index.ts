/**
 * Type definitions for OpenCode Evaluation Framework
 * 
 * Core types for session data, evaluation results, and test cases.
 */

// ============================================================================
// Session Data Types
// ============================================================================

/**
 * Session metadata from session/info/{session-id}.json
 */
export interface SessionInfo {
  id: string;
  version: string;
  title: string;
  time: {
    created: number;
    updated: number;
  };
}

/**
 * Token usage metrics
 */
export interface TokenUsage {
  input?: number;
  output?: number;
  total?: number;
}

/**
 * Message metadata from session/message/{session-id}/{message-id}.json
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  sessionID: string;
  mode?: string;              // Agent name (e.g., "openagent", "opencoder")
  modelID?: string;           // Model identifier
  providerID?: string;        // Provider (e.g., "anthropic", "google")
  tokens?: TokenUsage;
  cost?: number;
  time: {
    created: number;
    completed?: number;
  };
  error?: any;
}

/**
 * Message with parts included (as returned by SDK)
 * 
 * The SDK returns messages with parts embedded, not separate.
 * This type represents the full SDK response structure.
 */
export interface MessageWithParts {
  info: Message;
  parts: Part[];
}

/**
 * Message part from session/part/{session-id}/{message-id}/{part-id}.json
 */
export interface Part {
  id: string;
  messageID: string;
  sessionID: string;
  type: 'text' | 'tool' | 'patch' | 'reasoning' | 'step-start' | 'step-finish' | 'file';
  time?: {
    created: number;
    completed?: number;
  };
  // Type-specific fields (varies by part type)
  [key: string]: any;
}

/**
 * Tool call part (when type === 'tool')
 */
export interface ToolPart extends Part {
  type: 'tool';
  tool: string;               // Tool name (e.g., "read", "write", "bash")
  input?: any;                // Tool input parameters
  output?: any;               // Tool output/result
  status?: 'pending' | 'running' | 'completed' | 'error';
  error?: any;
}

/**
 * Text part (when type === 'text')
 */
export interface TextPart extends Part {
  type: 'text';
  text: string;
}

// ============================================================================
// Timeline Types
// ============================================================================

/**
 * Timeline event - unified view of session activity
 */
export interface TimelineEvent {
  timestamp: number;
  type: 'user_message' | 'assistant_message' | 'tool_call' | 'patch' | 'reasoning' | 'text';
  agent?: string;             // Agent name (from message.mode)
  model?: string;             // Model ID
  messageId?: string;         // Associated message ID
  partId?: string;            // Associated part ID
  data: any;                  // Event-specific data
}

// ============================================================================
// Evaluation Types
// ============================================================================

/**
 * Violation of a rule or standard
 */
export interface Violation {
  type: string;               // Violation type (e.g., "missing_approval", "no_context_loaded")
  severity: 'error' | 'warning' | 'info';
  message: string;            // Human-readable description
  timestamp: number;          // When violation occurred
  evidence: any;              // Supporting data
}

/**
 * Evidence supporting an evaluation result
 */
export interface Evidence {
  type: string;               // Evidence type
  description: string;        // What this evidence shows
  data: any;                  // Evidence data
  timestamp?: number;         // When evidence was collected
}

/**
 * Individual check within an evaluation
 */
export interface Check {
  name: string;               // Check name
  passed: boolean;            // Did it pass?
  weight: number;             // Weight in scoring (0-100)
  evidence?: Evidence[];      // Supporting evidence
}

/**
 * Result from a single evaluator
 */
export interface EvaluationResult {
  evaluator: string;          // Evaluator name
  passed: boolean;            // Overall pass/fail
  score: number;              // Score (0-100)
  violations: Violation[];    // Rule violations
  evidence: Evidence[];       // Supporting evidence
  metadata?: any;             // Additional metadata
}

// ============================================================================
// Test Case Types
// ============================================================================

/**
 * Expected behavior for a test case
 */
export interface ExpectedBehavior {
  no_execution_tools?: boolean;
  no_approval_required?: boolean;
  approval_requested?: boolean;
  context_loaded?: boolean;
  context_file?: string;
  delegation_used?: boolean;
  tool_used?: string;
  min_file_count?: number;
  response_provided?: boolean;
}

/**
 * Test case definition
 */
export interface TestCase {
  id: string;
  name: string;
  description: string;
  category: string;           // conversational, task, complex, edge-case
  input: string;              // User prompt
  expected_behavior: ExpectedBehavior;
  evaluators: string[];       // Evaluators to run
  pass_threshold: number;     // Pass threshold (0-100)
}

/**
 * Result from running a test case
 */
export interface TestResult {
  testCaseId: string;
  sessionId: string;
  passed: boolean;
  score: number;
  evaluationResults: EvaluationResult[];
  violations: Violation[];
  evidence: Evidence[];
  metadata: {
    timestamp: number;
    duration?: number;
    agent?: string;
    model?: string;
    cost?: number;
  };
}

/**
 * Test suite results
 */
export interface TestSuite {
  name: string;
  timestamp: number;
  testResults: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
    avgScore: number;
  };
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Framework configuration
 */
export interface FrameworkConfig {
  projectPath: string;
  sessionStoragePath: string;
  resultsPath: string;
  passThreshold: number;
}

/**
 * Model information
 */
export interface ModelInfo {
  modelID: string;
  providerID: string;
}

/**
 * Message metrics
 */
export interface MessageMetrics {
  tokens?: TokenUsage;
  cost?: number;
  duration?: number;
}

/**
 * Task type classification
 */
export type TaskType = 'code' | 'docs' | 'tests' | 'review' | 'delegation' | 'bash-only' | 'unknown';

/**
 * Task context for evaluation
 */
export interface TaskContext {
  type: TaskType;
  userMessage: string;
  requiredContext?: string;
}

// ============================================================================
// Evaluator Types
// ============================================================================

/**
 * Base evaluator interface - all evaluators must implement this
 */
export interface IEvaluator {
  name: string;
  description: string;
  evaluate(timeline: TimelineEvent[], sessionInfo: SessionInfo): Promise<EvaluationResult>;
}

/**
 * Evaluator configuration
 */
export interface EvaluatorConfig {
  enabled?: boolean;
  weight?: number;
  options?: Record<string, any>;
}

/**
 * Registry of available evaluators
 */
export interface EvaluatorRegistry {
  [evaluatorName: string]: IEvaluator;
}

/**
 * Approval gate detection result
 */
export interface ApprovalGateCheck {
  approvalRequested: boolean;
  approvalTimestamp?: number;
  executionTimestamp?: number;
  timeDiffMs?: number;
  toolName?: string;
  approvalConfidence?: 'high' | 'medium' | 'low';
  approvalText?: string;
  whatIsBeingApproved?: string;
  evidence: string[];
}

/**
 * Context loading check result
 */
export interface ContextLoadingCheck {
  contextFileLoaded: boolean;
  contextFilePath?: string;
  loadTimestamp?: number;
  executionTimestamp?: number;
  requiredContext?: string;
  taskType?: TaskType;
  expectedContextFiles?: string[];
  actualContextFiles?: string[];
  evidence: string[];
}

/**
 * Delegation check result
 */
export interface DelegationCheck {
  shouldDelegate: boolean;
  didDelegate: boolean;
  fileCount: number;
  delegationThreshold: number;
  evidence: string[];
}

/**
 * Tool usage check result
 */
export interface ToolUsageCheck {
  correctToolUsed: boolean;
  toolUsed?: string;
  expectedTool?: string;
  reason?: string;
  evidence: string[];
}
