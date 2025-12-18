import { z } from 'zod';

/**
 * Approval strategy configuration
 */
export const ApprovalStrategySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('auto-approve'),
  }),
  z.object({
    type: z.literal('auto-deny'),
  }),
  z.object({
    type: z.literal('smart'),
    config: z.object({
      allowedTools: z.array(z.string()).optional(),
      deniedTools: z.array(z.string()).optional(),
      approvePatterns: z.array(z.string()).optional(), // Regex patterns as strings
      denyPatterns: z.array(z.string()).optional(), // Regex patterns as strings
      maxApprovals: z.number().optional(),
      defaultDecision: z.boolean().optional(),
    }).optional(),
  }),
]);

export type ApprovalStrategyConfig = z.infer<typeof ApprovalStrategySchema>;

/**
 * Behavior expectations (what the agent should do)
 */
export const BehaviorExpectationSchema = z.object({
  /**
   * Tools that MUST be used (test fails if not used)
   */
  mustUseTools: z.array(z.string()).optional(),

  /**
   * Alternative tool sets - at least one set must be fully used
   * Example: [[bash], [list]] means either bash OR list must be used
   * Example: [[bash, grep], [glob, read]] means either (bash AND grep) OR (glob AND read)
   */
  mustUseAnyOf: z.array(z.array(z.string())).optional(),

  /**
   * Tools that MAY be used (optional)
   */
  mayUseTools: z.array(z.string()).optional(),

  /**
   * Tools that MUST NOT be used (test fails if used)
   */
  mustNotUseTools: z.array(z.string()).optional(),

  /**
   * Agent must request approval before tool execution
   */
  requiresApproval: z.boolean().optional(),

  /**
   * Agent must load context files before execution
   */
  requiresContext: z.boolean().optional(),

  /**
   * Specific context files that must be loaded (optional - overrides auto-detection)
   * When specified, the evaluator will check if the agent read one of these exact files.
   * Supports partial path matching (e.g., "code.md" matches ".opencode/context/core/standards/code.md")
   * 
   * Example:
   *   expectedContextFiles: [".opencode/context/core/standards/code.md", "standards/code.md"]
   * 
   * If not specified, the evaluator will auto-detect expected files based on the user message.
   */
  expectedContextFiles: z.array(z.string()).optional(),

  /**
   * Agent should delegate to specialized subagent
   */
  shouldDelegate: z.boolean().optional(),

  /**
   * Minimum number of tool calls expected
   */
  minToolCalls: z.number().optional(),

  /**
   * Maximum number of tool calls expected
   */
  maxToolCalls: z.number().optional(),

  /**
   * Agent must use dedicated tools instead of bash
   */
  mustUseDedicatedTools: z.boolean().optional(),

  /**
   * Expected agent name (for validation)
   * Example: "openagent", "opencoder", "coder-agent"
   */
  expectedAgent: z.string().optional(),

  /**
   * Expected model (for validation)
   * Example: "opencode/grok-code", "anthropic/claude-3-5-sonnet-20241022"
   */
  expectedModel: z.string().optional(),

  /**
   * Expected response content (partial matching)
   */
  expectedResponse: z.object({
    contains: z.array(z.string()).optional(),
    notContains: z.array(z.string()).optional(),
    description: z.string().optional(),
  }).optional(),
});

export type BehaviorExpectation = z.infer<typeof BehaviorExpectationSchema>;

/**
 * Expected rule violations
 */
export const ExpectedViolationSchema = z.object({
  rule: z.enum([
    'approval-gate',
    'context-loading',
    'delegation',
    'tool-usage',
    'stop-on-failure',
    'confirm-cleanup',
    'cleanup-confirmation',
    'report-first',
    'execution-balance',
  ]),
  /**
   * Should this rule be violated?
   * true = test expects violation (negative test)
   * false = test expects no violation (positive test)
   */
  shouldViolate: z.boolean(),
  severity: z.enum(['error', 'warning']),
  /**
   * Optional: Specific violation type expected
   */
  violationType: z.string().optional(),
  description: z.string().optional(),
});

export type ExpectedViolation = z.infer<typeof ExpectedViolationSchema>;

/**
 * Test case expected results (DEPRECATED - use behavior + expectedViolations)
 */
export const ExpectedResultsSchema = z.object({
  /**
   * Should the test pass overall?
   */
  pass: z.boolean(),

  /**
   * @deprecated Use expectedViolations instead
   * Expected violations (for tests that should fail)
   */
  violations: z.array(ExpectedViolationSchema).optional(),

  /**
   * @deprecated Use behavior.minToolCalls instead
   * Minimum number of messages expected in session
   */
  minMessages: z.number().optional(),

  /**
   * @deprecated Use behavior.maxToolCalls instead
   * Maximum number of messages expected in session
   */
  maxMessages: z.number().optional(),

  /**
   * @deprecated Use behavior.mustUseTools instead
   * Expected tool calls (partial matching)
   */
  toolCalls: z.array(z.string()).optional(),

  /**
   * Files that should be created/modified
   */
  filesModified: z.array(z.string()).optional(),

  /**
   * Custom validation notes
   */
  notes: z.string().optional(),
});

export type ExpectedResults = z.infer<typeof ExpectedResultsSchema>;

/**
 * Multi-message prompt (for multi-turn conversations)
 */
export const MultiMessageSchema = z.object({
  /**
   * The message text
   */
  text: z.string(),

  /**
   * Should context be loaded for this message?
   */
  expectContext: z.boolean().optional(),

  /**
   * Expected context file to be loaded
   */
  contextFile: z.string().optional(),

  /**
   * Delay before sending this message (ms)
   */
  delayMs: z.number().optional(),
});

export type MultiMessage = z.infer<typeof MultiMessageSchema>;

/**
 * Test case schema
 */
export const TestCaseSchema = z.object({
  /**
   * Unique test ID
   */
  id: z.string(),

  /**
   * Human-readable test name
   */
  name: z.string(),

  /**
   * Test description
   */
  description: z.string(),

  /**
   * Test category
   */
  category: z.enum(['developer', 'business', 'creative', 'edge-case']),

  /**
   * The prompt to send to OpenAgent (single message)
   */
  prompt: z.string().optional(),

  /**
   * Multiple prompts for multi-turn conversations (NEW)
   */
  prompts: z.array(MultiMessageSchema).optional(),

  /**
   * Agent to use (defaults to 'openagent')
   */
  agent: z.string().optional(),

  /**
   * Model to use (in provider/model format)
   */
  model: z.string().optional(),

  /**
   * Files to attach to the prompt
   */
  attachments: z.array(z.string()).optional(),

  /**
   * Approval strategy to use
   */
  approvalStrategy: ApprovalStrategySchema,

  /**
   * Behavior expectations (NEW - preferred)
   * Describes what the agent should/shouldn't do
   */
  behavior: BehaviorExpectationSchema.optional(),

  /**
   * Expected violations (NEW - preferred)
   * List of rules and whether they should be violated
   */
  expectedViolations: z.array(ExpectedViolationSchema).optional(),

  /**
   * Expected results (DEPRECATED - use behavior + expectedViolations)
   */
  expected: ExpectedResultsSchema.optional(),

  /**
   * Timeout in milliseconds (default: 60000)
   */
  timeout: z.number().optional(),

  /**
   * Tags for filtering tests
   */
  tags: z.array(z.string()).optional(),
}).refine(
  (data) => data.prompt || data.prompts,
  {
    message: 'Must provide either "prompt" (single message) or "prompts" (multi-turn)',
  }
).refine(
  // Allow: expected (deprecated), behavior alone, or behavior + expectedViolations
  // This is more flexible - behavior alone is valid for simple tests
  (data) => data.expected || data.behavior || data.expectedViolations,
  {
    message: 'Must provide "expected" (deprecated), "behavior", "expectedViolations", or a combination',
  }
);

export type TestCase = z.infer<typeof TestCaseSchema>;

/**
 * Test suite schema (collection of test cases)
 */
export const TestSuiteSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  tests: z.array(TestCaseSchema),
});

export type TestSuite = z.infer<typeof TestSuiteSchema>;
