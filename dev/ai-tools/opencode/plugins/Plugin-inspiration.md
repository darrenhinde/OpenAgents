OpenCode Plugin Architecture & oh-my-opencode Deep Dive
> A comprehensive guide to understanding OpenCode's plugin system and how oh-my-opencode transforms a single-agent assistant into a multi-model orchestration powerhouse.
---
Table of Contents
1. OpenCode Plugin System Overview (#1-opencode-plugin-system-overview)
2. The @opencode-ai/plugin Package (#2-the-opencode-aiplugin-package)
3. oh-my-opencode Architecture (#3-oh-my-opencode-architecture)
4. The Agent Orchestration System (#4-the-agent-orchestration-system)
5. Background Agent System (#5-background-agent-system)
6. The Hook Pipeline (#6-the-hook-pipeline)
7. Custom Tools (#7-custom-tools)
8. MCP Integrations (#8-mcp-integrations)
9. Configuration System (#9-configuration-system)
10. Plugin Loading & Updates (#10-plugin-loading--updates)
11. Creating Your Own Plugin (#11-creating-your-own-plugin)
12. Key Files Reference (#12-key-files-reference)
---
1. OpenCode Plugin System Overview
What is OpenCode?
OpenCode is a terminal-based AI coding assistant (similar to Claude Code) created by SST. It's highly extensible through a plugin system.
Repository: https://github.com/sst/opencode
How Plugins Work
Plugins are JavaScript/TypeScript modules that:
1. Receive a context object with SDK client, project info, and utilities
2. Return a hooks object to extend OpenCode's behavior
Plugin locations:
- .opencode/plugin/ (project-level)
- ~/.config/opencode/plugin/ (global)
- npm packages via opencode.json
The Plugin Interface
// From @opencode-ai/plugin
export type PluginInput = {
  client: ReturnType<typeof createOpencodeClient>  // SDK client for API calls
  project: Project                                  // Current project info
  directory: string                                 // Working directory path
  worktree: string                                  // Git worktree path
  $: BunShell                                      // Bun's shell API for commands
}
export type Plugin = (input: PluginInput) => Promise<Hooks>
---
2. The @opencode-ai/plugin Package
Core Types
Source: packages/plugin/src/index.ts in sst/opencode
export interface Hooks {
  // Event subscription - react to 40+ event types
  event?: (input: { event: Event }) => Promise<void>
  
  // Configuration hook - modify agents, MCPs, commands
  config?: (input: Config) => Promise<void>
  
  // Custom tools registration
  tool?: {
    [key: string]: ToolDefinition
  }
  
  // Authentication provider
  auth?: AuthHook
  
  // Chat lifecycle hooks
  "chat.message"?: (input, output: { message: UserMessage; parts: Part[] }) => Promise<void>
  "chat.params"?: (input, output: { temperature: number; topP: number; topK: number; options: Record<string, any> }) => Promise<void>
  
  // Permission hooks
  "permission.ask"?: (input: Permission, output: { status: "ask" | "deny" | "allow" }) => Promise<void>
  
  // Tool execution hooks
  "tool.execute.before"?: (input: { tool: string; sessionID: string; callID: string }, output: { args: any }) => Promise<void>
  "tool.execute.after"?: (input: { tool: string; sessionID: string; callID: string }, output: { title: string; output: string; metadata: any }) => Promise<void>
  
  // Experimental hooks
  "experimental.chat.messages.transform"?: (input, output: { messages: { info: Message; parts: Part[] }[] }) => Promise<void>
  "experimental.chat.system.transform"?: (input, output: { system: string[] }) => Promise<void>
  "experimental.text.complete"?: (input: { sessionID: string; messageID: string; partID: string }, output: { text: string }) => Promise<void>
}
Tool Definition
export type ToolContext = {
  sessionID: string
  messageID: string
  agent: string
  abort: AbortSignal
}
export function tool<Args extends z.ZodRawShape>(input: {
  description: string
  args: Args
  execute(args: z.infer<z.ZodObject<Args>>, context: ToolContext): Promise<string>
}) {
  return input
}
tool.schema = z  // Zod schema builder
Available Events (40+)
| Category | Events |
|----------|--------|
| Command | command.executed |
| File | file.edited, file.watcher.updated |
| Installation | installation.updated |
| LSP | lsp.client.diagnostics, lsp.updated |
| Message | message.part.removed, message.part.updated, message.removed, message.updated |
| Permission | permission.replied, permission.updated |
| Server | server.connected |
| Session | session.created, session.compacted, session.deleted, session.diff, session.error, session.idle, session.status, session.updated |
| Todo | todo.updated |
| Tool | tool.execute.after, tool.execute.before |
| TUI | tui.prompt.append, tui.command.execute, tui.toast.show |
---
3. oh-my-opencode Architecture
What is oh-my-opencode?
Repository: https://github.com/code-yeongyu/oh-my-opencode
oh-my-opencode is a comprehensive OpenCode plugin that transforms the single-agent experience into a multi-model, multi-agent orchestration system. It's described as "oh-my-zsh for OpenCode."
Project Structure
oh-my-opencode/
├── src/
│   ├── agents/           # AI agents (OmO, oracle, librarian, explore, etc.)
│   │   ├── omo.ts
│   │   ├── oracle.ts
│   │   ├── librarian.ts
│   │   ├── explore.ts
│   │   ├── frontend-ui-ux-engineer.ts
│   │   ├── document-writer.ts
│   │   ├── multimodal-looker.ts
│   │   ├── index.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   ├── hooks/            # 21 lifecycle hooks
│   │   ├── anthropic-auto-compact/
│   │   ├── auto-update-checker/
│   │   ├── background-notification/
│   │   ├── claude-code-hooks/
│   │   ├── comment-checker/
│   │   ├── directory-readme-injector/
│   │   ├── interactive-bash-session/
│   │   ├── keyword-detector/
│   │   ├── non-interactive-env/
│   │   ├── rules-injector/
│   │   ├── session-recovery/
│   │   ├── think-mode/
│   │   ├── context-window-monitor.ts
│   │   ├── empty-task-response-detector.ts
│   │   ├── grep-output-truncator.ts
│   │   ├── session-notification.ts
│   │   ├── todo-continuation-enforcer.ts
│   │   ├── tool-output-truncator.ts
│   │   └── index.ts
│   ├── tools/            # Custom tools (LSP, AST-Grep, background tasks)
│   │   ├── lsp/
│   │   ├── ast-grep/
│   │   ├── background-task/
│   │   ├── call-omo-agent/
│   │   ├── look-at/
│   │   ├── grep/
│   │   ├── glob/
│   │   ├── interactive-bash/
│   │   ├── skill/
│   │   ├── slashcommand/
│   │   └── index.ts
│   ├── mcp/              # MCP server configurations
│   │   ├── context7.ts
│   │   ├── grep-app.ts
│   │   ├── websearch-exa.ts
│   │   └── index.ts
│   ├── features/         # Core features
│   │   ├── background-agent/
│   │   ├── claude-code-*-loader/
│   │   ├── hook-message-injector/
│   │   └── terminal/
│   ├── auth/             # Google Antigravity OAuth
│   ├── shared/           # Utilities
│   ├── config/           # Zod schema, types
│   └── index.ts          # Main plugin entry
├── package.json
└── tsconfig.json
Main Entry Point (src/index.ts)
The plugin implements ALL available hooks:
const OhMyOpenCodePlugin: Plugin = async (ctx) => {
  // 1. Load configuration
  const pluginConfig = loadPluginConfig(ctx.directory);
  
  // 2. Initialize 20+ hooks with enable/disable support
  const todoContinuationEnforcer = isHookEnabled("todo-continuation-enforcer")
    ? createTodoContinuationEnforcer(ctx) : null;
  const contextWindowMonitor = isHookEnabled("context-window-monitor")
    ? createContextWindowMonitorHook(ctx) : null;
  // ... 18 more hooks
  
  // 3. Initialize background agent manager
  const backgroundManager = new BackgroundManager(ctx);
  
  // 4. Create tools
  const backgroundTools = createBackgroundTools(backgroundManager, ctx.client);
  const callOmoAgent = createCallOmoAgent(ctx, backgroundManager);
  const lookAt = createLookAt(ctx);
  
  return {
    // Authentication
    auth: googleAuthHooks?.auth,
    
    // Custom tools
    tool: {
      ...builtinTools,        // LSP, AST-grep, grep, glob
      ...backgroundTools,      // background_task, background_output, background_cancel
      call_omo_agent,
      look_at,
      interactive_bash,
    },
    
    // Config modification
    config: async (config) => {
      // Inject custom agents
      config.agent = { OmO: ..., oracle: ..., ... };
      // Inject MCPs
      config.mcp = { context7: ..., websearch_exa: ..., grep_app: ... };
      // Load Claude Code commands, skills, agents
    },
    
    // Event handling
    event: async (input) => {
      // Process through all 20+ hooks
    },
    
    // Tool interception
    "tool.execute.before": async (input, output) => { ... },
    "tool.execute.after": async (input, output) => { ... },
    
    // Chat hooks
    "chat.message": async (input, output) => { ... },
    "experimental.chat.messages.transform": async (input, output) => { ... },
  };
};
---
4. The Agent Orchestration System
The Agent Team
oh-my-opencode creates a team of specialized agents, each using the optimal model for their task:
| Agent | Model | Purpose | Mode |
|-------|-------|---------|------|
| OmO | anthropic/claude-opus-4-5 | Primary orchestrator, delegates work | primary |
| oracle | openai/gpt-5.2 | Architecture, debugging, deep reasoning | subagent |
| librarian | anthropic/claude-sonnet-4-5 | External docs, GitHub examples | subagent |
| explore | opencode/grok-code | Fast codebase search | subagent |
| frontend-ui-ux-engineer | google/gemini-3-pro-preview | UI generation | subagent |
| document-writer | google/gemini-3-pro-preview | Documentation | subagent |
| multimodal-looker | google/gemini-2.5-flash | PDF/image analysis | subagent |
OmO Agent System Prompt (Key Excerpts)
Source: src/agents/omo.ts
The OmO agent has a 400+ line system prompt that teaches it to:
const OMO_SYSTEM_PROMPT = `<Role>
You are OmO, the orchestrator agent for OpenCode.
**Identity**: Elite software engineer working at SF, Bay Area. You work, delegate, verify, deliver.
**Operating Mode**: You NEVER work alone when specialists are available. Frontend work → delegate. Deep research → parallel background agents. Complex architecture → consult Oracle.
</Role>
<Behavior_Instructions>
## Phase 0 - Intent Gate (EVERY message)
### Step 1: Classify Request Type
| Type | Signal | Action |
|------|--------|--------|
| **Trivial** | Single file, known location | Direct tools only, no agents |
| **Explicit** | Specific file/line, clear command | Execute directly |
| **Exploratory** | "How does X work?" | Assess scope, then search |
| **Open-ended** | "Improve", "Refactor" | Assess codebase first |
## Phase 2A - Exploration & Research
### Tool Selection:
| Tool | Cost | When to Use |
|------|------|-------------|
| grep, glob, lsp_*, ast_grep | FREE | Always try first |
| explore agent | CHEAP | Multiple search angles |
| librarian agent | CHEAP | External docs, GitHub examples |
| oracle agent | EXPENSIVE | Architecture, review, debugging |
### Parallel Execution (DEFAULT behavior)
// CORRECT: Always background, always parallel
background_task(agent="explore", prompt="Find auth implementations...")
background_task(agent="librarian", prompt="Find JWT best practices...")
// Continue working immediately. Collect with background_output when needed.
## Phase 2B - Implementation
### GATE: Frontend Files (HARD BLOCK)
| Extension | Action |
|-----------|--------|
| .tsx, .jsx | DELEGATE |
| .vue, .svelte | DELEGATE |
| .css, .scss | DELEGATE |
ALL frontend = DELEGATE to frontend-ui-ux-engineer. Period.
</Behavior_Instructions>`
export const omoAgent: AgentConfig = {
  description: "Powerful AI orchestrator for OpenCode...",
  mode: "primary",
  model: "anthropic/claude-opus-4-5",
  thinking: {
    type: "enabled",
    budgetTokens: 32000,  // Extended thinking enabled
  },
  maxTokens: 64000,
  prompt: OMO_SYSTEM_PROMPT,
  color: "#00CED1",
}
Oracle Agent (Strategic Advisor)
Source: src/agents/oracle.ts
export const oracleAgent: AgentConfig = {
  description: "Expert technical advisor with deep reasoning...",
  mode: "subagent",
  model: "openai/gpt-5.2",
  temperature: 0.1,
  reasoningEffort: "medium",
  textVerbosity: "high",
  tools: { write: false, edit: false, task: false, background_task: false },
  prompt: `You are a strategic technical advisor...
  
## Decision Framework
**Bias toward simplicity**: The right solution is typically the least complex one.
**Leverage what exists**: Favor modifications to current code over new components.
**One clear path**: Present a single primary recommendation.
**Signal the investment**: Tag recommendations with Quick(<1h), Short(1-4h), Medium(1-2d), Large(3d+).
`,
}
How Agents Get Injected
In the config hook:
config: async (config) => {
  const builtinAgents = createBuiltinAgents(...);
  
  // OmO becomes primary, original agents become subagents
  config.agent = {
    OmO: builtinAgents.OmO,                        // NEW primary
    "OmO-Plan": omoPlanConfig,                      // NEW plan variant
    ...builtinAgents,                               // oracle, librarian, etc.
    ...config.agent,                                // User's original agents
    build: { ...config.agent?.build, mode: "subagent" },  // DEMOTED
    plan: { ...config.agent?.plan, mode: "subagent" },    // DEMOTED
  };
}
---
5. Background Agent System
The BackgroundManager Class
Source: src/features/background-agent/manager.ts
This is the key innovation that enables parallel agent execution:
export class BackgroundManager {
  private tasks: Map<string, BackgroundTask>
  private notifications: Map<string, BackgroundTask[]>
  private client: OpencodeClient
  private pollingInterval?: Timer
  async launch(input: LaunchInput): Promise<BackgroundTask> {
    // 1. Create a NEW child session
    const createResult = await this.client.session.create({
      body: {
        parentID: input.parentSessionID,
        title: `Background: ${input.description}`
      }
    });
    
    const sessionID = createResult.data.id;
    
    // 2. Track the task
    const task: BackgroundTask = {
      id: `bg_${crypto.randomUUID().slice(0, 8)}`,
      sessionID,
      parentSessionID: input.parentSessionID,
      description: input.description,
      status: "running",
      startedAt: new Date(),
    };
    this.tasks.set(task.id, task);
    
    // 3. Fire async prompt (NON-BLOCKING!)
    this.client.session.promptAsync({
      path: { id: sessionID },
      body: {
        agent: input.agent,
        tools: { task: false, background_task: false },  // Prevent recursion
        parts: [{ type: "text", text: input.prompt }]
      }
    });
    
    // 4. Start polling for completion
    this.startPolling();
    
    return task;
  }
  // Event handler for completion detection
  handleEvent(event: Event): void {
    if (event.type === "session.idle") {
      const task = this.findBySession(sessionID);
      if (task?.status === "running") {
        task.status = "completed";
        this.markForNotification(task);
        this.notifyParentSession(task);  // Send message back!
      }
    }
  }
  // Notify the main session when background task completes
  private notifyParentSession(task: BackgroundTask): void {
    // Show toast notification
    this.client.tui.showToast({
      body: {
        title: "Background Task Completed",
        message: `Task "${task.description}" finished.`,
        variant: "success",
      }
    });
    
    // Send a message to the parent session
    this.client.session.prompt({
      path: { id: task.parentSessionID },
      body: {
        parts: [{
          type: "text",
          text: `[BACKGROUND TASK COMPLETED] Task "${task.description}" finished. Use background_output with task_id="${task.id}" to get results.`
        }]
      }
    });
  }
}
Background Task Tools
Source: src/tools/background-task/tools.ts
// background_task - Launch an agent in background
export function createBackgroundTask(manager: BackgroundManager) {
  return tool({
    description: "Launch a background agent task...",
    args: {
      description: tool.schema.string(),
      prompt: tool.schema.string(),
      agent: tool.schema.string(),
    },
    async execute(args, toolContext) {
      const task = await manager.launch({
        description: args.description,
        prompt: args.prompt,
        agent: args.agent,
        parentSessionID: toolContext.sessionID,
        parentMessageID: toolContext.messageID,
      });
      
      return `Background task launched. Task ID: ${task.id}`;
    },
  });
}
// background_output - Get results from background task
export function createBackgroundOutput(manager: BackgroundManager, client: OpencodeClient) {
  return tool({
    description: "Get output from a background task...",
    args: {
      task_id: tool.schema.string(),
      block: tool.schema.boolean().optional(),  // Wait for completion?
    },
    async execute(args) {
      const task = manager.getTask(args.task_id);
      if (task.status === "completed") {
        // Fetch messages from the task's session
        const messages = await client.session.messages({ path: { id: task.sessionID } });
        return formatTaskResult(task, messages);
      }
      return formatTaskStatus(task);
    },
  });
}
// background_cancel - Cancel running tasks
export function createBackgroundCancel(manager: BackgroundManager, client: OpencodeClient) {
  return tool({
    description: "Cancel background tasks...",
    args: {
      taskId: tool.schema.string().optional(),
      all: tool.schema.boolean().optional(),  // Cancel all?
    },
    async execute(args, toolContext) {
      if (args.all) {
        const tasks = manager.getTasksByParentSession(toolContext.sessionID);
        for (const task of tasks.filter(t => t.status === "running")) {
          client.session.abort({ path: { id: task.sessionID } });
          task.status = "cancelled";
        }
      }
      // ...
    },
  });
}
The Parallel Execution Flow
You: "Add authentication to my app"
     │
     ▼
┌─────────────────────────────────────────┐
│           OmO (Claude Opus 4.5)         │
│  "I'll orchestrate this..."             │
└─────────────────────────────────────────┘
     │
     │ 1. Creates todo list
     │ 2. Launches background agents:
     │
     ├──▶ background_task(agent="librarian", "Find JWT best practices...")
     │        └── Creates child session, runs async
     │
     ├──▶ background_task(agent="explore", "Find existing auth patterns...")
     │        └── Creates child session, runs async
     │
     │ 3. Starts implementing immediately (doesn't wait!)
     │
     ▼
┌─────────────────────────────────────────┐
│  [MEANWHILE: Background agents working] │
│  librarian → searching docs             │
│  explore → scanning codebase            │
└─────────────────────────────────────────┘
     │
     │ 4. BackgroundManager detects completion
     │ 5. Sends notification to OmO's session
     │
     ▼
┌─────────────────────────────────────────┐
│ [BACKGROUND TASK COMPLETED]             │
│ Task "Find JWT best practices" done     │
│ Use background_output to get results    │
└─────────────────────────────────────────┘
     │
     ▼
OmO: background_output(task_id="bg_abc123")
     │
     ▼
Integrates findings, continues work...
---
6. The Hook Pipeline
Hook Categories
oh-my-opencode implements 21 hooks across several categories:
Session Management
- session-recovery: Auto-recovers from API errors
- session-notification: OS notifications when session goes idle
- anthropic-auto-compact: Auto-summarizes when hitting token limits
Task Management
- todo-continuation-enforcer: Forces agent to complete all todos
- empty-task-response-detector: Warns about empty task responses
Context Management
- context-window-monitor: Implements "Context Window Anxiety Management"
- directory-readme-injector: Injects README.md context
- directory-agents-injector: Injects AGENTS.md context
- rules-injector: Conditional rules from .claude/rules/
Output Processing
- tool-output-truncator: Truncates verbose tool output
- grep-output-truncator: Specifically handles grep output
Quality Control
- comment-checker: Prevents AI-style excessive comments
- keyword-detector: Detects ultrawork, search, analyze keywords
- think-mode: Auto-enables extended thinking for complex tasks
Background System
- background-notification: Routes events to BackgroundManager
Compatibility
- claude-code-hooks: Pre/PostToolUse, UserPromptSubmit, Stop hooks
- non-interactive-env: Handles non-interactive environments
- interactive-bash-session: Tmux integration
Event Handler Pipeline
event: async (input) => {
  // Process through ALL hooks in sequence
  await autoUpdateChecker?.event(input);
  await claudeCodeHooks.event(input);
  await backgroundNotificationHook?.event(input);  // Background tracking!
  await sessionNotification?.(input);
  await todoContinuationEnforcer?.handler(input);
  await contextWindowMonitor?.event(input);
  await directoryAgentsInjector?.event(input);
  await directoryReadmeInjector?.event(input);
  await rulesInjector?.event(input);
  await thinkMode?.event(input);
  await anthropicAutoCompact?.event(input);
  await keywordDetector?.event(input);
  await agentUsageReminder?.event(input);
  await interactiveBashSession?.event(input);
  
  // Handle session lifecycle
  if (event.type === "session.created") { ... }
  if (event.type === "session.idle") { ... }
  if (event.type === "session.error") { ... }
}
Tool Execution Hooks
"tool.execute.before": async (input, output) => {
  // Claude Code hooks (PreToolUse)
  await claudeCodeHooks["tool.execute.before"](input, output);
  // Non-interactive environment handling
  await nonInteractiveEnv?.["tool.execute.before"](input, output);
  // Comment checking
  await commentChecker?.["tool.execute.before"](input, output);
  
  // Disable dangerous tools for subagents
  if (input.tool === "task") {
    output.args.tools = {
      ...output.args.tools,
      background_task: false,  // Prevent nested background tasks
    };
  }
},
"tool.execute.after": async (input, output) => {
  // Claude Code hooks (PostToolUse)
  await claudeCodeHooks["tool.execute.after"](input, output);
  // Truncate verbose output
  await toolOutputTruncator?.["tool.execute.after"](input, output);
  // Track context usage
  await contextWindowMonitor?.["tool.execute.after"](input, output);
  // Inject directory context
  await directoryAgentsInjector?.["tool.execute.after"](input, output);
  await directoryReadmeInjector?.["tool.execute.after"](input, output);
  // Inject conditional rules
  await rulesInjector?.["tool.execute.after"](input, output);
},
---
7. Custom Tools
LSP Tools (11 tools)
Source: src/tools/lsp/
export const builtinTools = {
  // Information
  lsp_hover,              // Type info, docs at position
  lsp_goto_definition,    // Jump to definition
  lsp_find_references,    // Find all usages
  lsp_document_symbols,   // File symbol outline
  lsp_workspace_symbols,  // Search symbols by name
  lsp_diagnostics,        // Get errors/warnings
  lsp_servers,            // List available LSP servers
  
  // Refactoring
  lsp_prepare_rename,     // Validate rename
  lsp_rename,             // Rename symbol across workspace
  lsp_code_actions,       // Get quick fixes/refactorings
  lsp_code_action_resolve, // Apply code action
}
AST-Grep Tools
Source: src/tools/ast-grep/
export const astGrepTools = {
  ast_grep_search,   // AST-aware pattern search (25 languages)
  ast_grep_replace,  // AST-aware code replacement
}
Search Tools (Improved)
export const searchTools = {
  grep,  // With timeout protection (original hangs forever)
  glob,  // With timeout protection
}
Special Tools
// look_at - Multimodal analysis via subagent
export function createLookAt(ctx: PluginInput) {
  return tool({
    description: "Analyze files using multimodal-looker agent",
    args: { file: tool.schema.string() },
    async execute(args, toolContext) {
      // Delegates to multimodal-looker agent internally
      // Saves context in main session
    },
  });
}
// call_omo_agent - Specialized agent caller
export function createCallOmoAgent(ctx: PluginInput, manager: BackgroundManager) {
  return tool({
    description: "Call explore or librarian agents",
    args: {
      subagent_type: tool.schema.enum(["explore", "librarian"]),
      prompt: tool.schema.string(),
      run_in_background: tool.schema.boolean(),
    },
    async execute(args, toolContext) {
      if (args.run_in_background) {
        return await manager.launch(...);
      }
      return await executeSynchronously(...);
    },
  });
}
// interactive_bash - Tmux integration
export const interactive_bash = tool({
  description: "Execute commands in interactive tmux session",
  // ...
});
---
8. MCP Integrations
Built-in MCPs
Source: src/mcp/
// context7.ts - Official documentation lookup
export const context7 = {
  type: "remote",
  url: "https://mcp.context7.io/sse",
  enabled: true,
}
// websearch_exa.ts - Real-time web search
export const websearch_exa = {
  type: "remote",
  url: "https://mcp.exa.ai/sse",
  enabled: true,
}
// grep_app.ts - GitHub code search
export const grep_app = {
  type: "remote",
  url: "https://mcp.grep.app/sse",
  enabled: true,
}
MCP Injection
config: async (config) => {
  config.mcp = {
    ...config.mcp,
    ...createBuiltinMcps(pluginConfig.disabled_mcps),  // context7, websearch_exa, grep_app
    ...loadMcpConfigs(),  // Claude Code .mcp.json files
  };
}
---
9. Configuration System
Config File Locations
1. ~/.config/opencode/oh-my-opencode.json (user-level)
2. .opencode/oh-my-opencode.json (project-level, overrides user)
Config Schema
Source: src/config/schema.ts
export const OhMyOpenCodeConfigSchema = z.object({
  // Enable Google OAuth
  google_auth: z.boolean().optional(),
  
  // Agent overrides
  agents: z.record(z.object({
    model: z.string().optional(),
    temperature: z.number().optional(),
    prompt: z.string().optional(),
    tools: z.record(z.boolean()).optional(),
    disable: z.boolean().optional(),
    description: z.string().optional(),
    mode: z.enum(["primary", "subagent"]).optional(),
    color: z.string().optional(),
    permission: z.object({
      edit: z.enum(["ask", "allow", "deny"]).optional(),
      bash: z.union([
        z.enum(["ask", "allow", "deny"]),
        z.record(z.enum(["ask", "allow", "deny"]))
      ]).optional(),
    }).optional(),
  })).optional(),
  
  // Disable specific agents
  disabled_agents: z.array(z.string()).optional(),
  
  // Disable specific MCPs
  disabled_mcps: z.array(z.enum(["context7", "websearch_exa", "grep_app"])).optional(),
  
  // Disable specific hooks
  disabled_hooks: z.array(z.string()).optional(),
  
  // Claude Code compatibility toggles
  claude_code: z.object({
    mcp: z.boolean().optional(),
    commands: z.boolean().optional(),
    skills: z.boolean().optional(),
    agents: z.boolean().optional(),
    hooks: z.boolean().optional(),
  }).optional(),
  
  // OmO agent settings
  omo_agent: z.object({
    disabled: z.boolean().optional(),
  }).optional(),
});
Example Configuration
{
  $schema: https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json,
  
  google_auth: true,
  
  agents: {
    OmO: {
      model: anthropic/claude-sonnet-4
    },
    oracle: {
      temperature: 0.3
    },
    frontend-ui-ux-engineer: {
      disable: true
    }
  },
  
  disabled_hooks: [comment-checker],
  disabled_mcps: [grep_app],
  
  claude_code: {
    hooks: true,
    commands: true,
    mcp: false
  }
}
---
10. Plugin Loading & Updates
How OpenCode Loads Plugins
Source: packages/opencode/src/plugin/index.ts (in sst/opencode)
for (let plugin of plugins) {
  if (!plugin.startsWith("file://")) {
    // Parse version: "oh-my-opencode@2.1.6"
    const lastAtIndex = plugin.lastIndexOf("@")
    const pkg = lastAtIndex > 0 ? plugin.substring(0, lastAtIndex) : plugin
    const version = lastAtIndex > 0 ? plugin.substring(lastAtIndex + 1) : "latest"
    
    // Install via Bun from npm registry
    plugin = await BunProc.install(pkg, version)
  }
  
  const mod = await import(plugin)
  for (const [_name, fn] of Object.entries(mod)) {
    const init = await fn(input)
    hooks.push(init)
  }
}
Plugin Cache Location
~/.cache/opencode/
├── node_modules/
│   └── oh-my-opencode/           ← THE ACTUAL PLUGIN CODE
│       ├── dist/
│       │   └── index.js
│       └── package.json
├── package.json
└── bun.lockb
Auto-Update Checker
Source: src/hooks/auto-update-checker/
export function createAutoUpdateCheckerHook(ctx: PluginInput) {
  return {
    event: async ({ event }) => {
      if (event.type !== "session.created") return;
      
      // Check npm registry for latest version
      const result = await checkForUpdate(ctx.directory);
      
      if (result.needsUpdate) {
        // Show notification
        await ctx.client.tui.showToast({
          body: {
            title: `OhMyOpenCode ${result.latestVersion}`,
            message: `v${result.latestVersion} available. Restart OpenCode to apply.`,
          }
        });
        
        // Invalidate cache (delete cached package)
        invalidatePackage("oh-my-opencode");
        // Next restart will download new version
      }
    },
  };
}
async function getLatestVersion(): Promise<string | null> {
  const response = await fetch("https://registry.npmjs.org/-/package/oh-my-opencode/dist-tags");
  const data = await response.json();
  return data.latest;
}
Version Pinning
// Latest (auto-updates on restart)
{ plugin: [oh-my-opencode] }
// Pinned (never auto-updates)
{ plugin: [oh-my-opencode@2.1.6] }
// Local development
{ plugin: [file:///path/to/oh-my-opencode] }
---
11. Creating Your Own Plugin
Minimal package.json
{
  name: my-opencode-plugin,
  version: 1.0.0,
  main: dist/index.js,
  types: dist/index.d.ts,
  type: module,
  files: [dist],
  exports: {
    .: {
      types: ./dist/index.d.ts,
      import: ./dist/index.js
    }
  },
  scripts: {
    build: bun build src/index.ts --outdir dist --target bun --format esm && tsc --emitDeclarationOnly,
    prepublishOnly: bun run build
  },
  dependencies: {
    @opencode-ai/plugin: ^1.0.162
  },
  devDependencies: {
    bun-types: latest,
    typescript: ^5.7.3
  },
  peerDependencies: {
    bun: >=1.0.0
  }
}
Minimal tsconfig.json
{
  compilerOptions: {
    target: ESNext,
    module: ESNext,
    moduleResolution: bundler,
    declaration: true,
    declarationDir: dist,
    outDir: dist,
    rootDir: src,
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    lib: [ESNext],
    types: [bun-types]
  },
  include: [src/**/*],
  exclude: [node_modules, dist]
}
Minimal Plugin (src/index.ts)
import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"
const MyPlugin: Plugin = async ({ client, directory }) => {
  return {
    // Add custom tools
    tool: {
      my_tool: tool({
        description: "Does something useful",
        args: {
          input: tool.schema.string(),
        },
        async execute(args) {
          return `Processed: ${args.input}`;
        },
      }),
    },
    // Modify config
    config: async (config) => {
      config.agent = {
        ...config.agent,
        "my-agent": {
          description: "My custom agent",
          model: "anthropic/claude-sonnet-4",
          prompt: "You are helpful...",
        },
      };
    },
    // React to events
    event: async ({ event }) => {
      if (event.type === "session.created") {
        await client.tui.showToast({
          body: {
            title: "Plugin Loaded",
            message: "My plugin is active!",
            variant: "success",
          }
        }).catch(() => {});
      }
    },
    // Intercept tool calls
    "tool.execute.before": async (input, output) => {
      console.log(`Tool ${input.tool} called`);
    },
  };
};
export default MyPlugin;
Publish to npm
npm login
npm publish
Users Install
{
  plugin: [my-opencode-plugin]
}
---
12. Key Files Reference
Core oh-my-opencode Files
| File | Purpose |
|------|---------|
| src/index.ts | Main plugin entry, orchestrates everything |
| src/agents/*.ts | Agent definitions (OmO, oracle, etc.) |
| src/features/background-agent/manager.ts | Background task management |
| src/tools/background-task/tools.ts | background_task, background_output, background_cancel |
| src/tools/lsp/*.ts | LSP tool implementations |
| src/hooks/*.ts | All 21 hooks |
| src/mcp/*.ts | MCP server configurations |
| src/config/schema.ts | Zod config schema |
OpenCode Core Files (sst/opencode)
| File | Purpose |
|------|---------|
| packages/plugin/src/index.ts | Plugin interface types |
| packages/plugin/src/tool.ts | Tool definition helper |
| packages/opencode/src/plugin/index.ts | Plugin loading logic |
---
Summary: Why oh-my-opencode Works So Well
1. Multi-Model Orchestration: Uses the right model for each task (GPT-5.2 for reasoning, Gemini for UI, Grok for speed)
2. True Parallel Execution: BackgroundManager creates separate sessions, allowing multiple agents to work simultaneously
3. Automatic Notifications: Event system detects task completion and injects messages into the main conversation
4. Defensive Hooks: 21 hooks ensure tasks complete, errors recover, context is managed
5. Comprehensive System Prompt: OmO's 400+ line prompt teaches proper delegation and orchestration
6. IDE-Quality Tools: LSP and AST-grep tools give agents the same capabilities as human developers
7. Context Injection: Automatic README/AGENTS.md injection and conditional rules
8. Claude Code Compatibility: Existing Claude Code configs just work
The plugin transforms a single-agent assistant into a dev team where you're the manager and AI models are your specialized engineers.
---
Session Summary
What We Covered
1. Researched the @opencode-ai/plugin API - Examined the Plugin type, Hooks interface, available events, and tool definitions from the sst/opencode repository
2. Deep-dived into oh-my-opencode architecture - Read and analyzed:
   - Main entry point (src/index.ts) - 566 lines
   - Agent definitions (src/agents/) - OmO, oracle, librarian, explore, etc.
   - BackgroundManager (src/features/background-agent/manager.ts) - 430 lines
   - Background tools (src/tools/background-task/tools.ts) - 332 lines
   - Auto-update checker (src/hooks/auto-update-checker/)
3. Explained key concepts:
   - How plugins are loaded from npm (not GitHub)
   - How the config hook injects custom agents
   - How BackgroundManager enables parallel execution
   - How notifications work (toast + message injection)
   - The difference between schema URL (IDE autocomplete) vs actual code (npm)
4. Created publishing guide - How to create, build, and publish your own OpenCode plugin
Key Files Examined
- /Users/darrenhinde/Documents/GitHub/test-larvel/oh-my-opencode/src/index.ts
- /Users/darrenhinde/Documents/GitHub/test-larvel/oh-my-opencode/src/agents/*.ts
- /Users/darrenhinde/Documents/GitHub/test-larvel/oh-my-opencode/src/features/background-agent/manager.ts
- /Users/darrenhinde/Documents/GitHub/test-larvel/oh-my-opencode/src/tools/background-task/tools.ts
- /Users/darrenhinde/Documents/GitHub/test-larvel/oh-my-opencode/src/hooks/auto-update-checker/*.ts
- /Users/darrenhinde/Documents/GitHub/test-larvel/oh-my-opencode/package.json
- /tmp/opencode-repo/packages/plugin/src/index.ts (from sst/opencode)
▣  Compaction · claude-opus-4-5 · 3m 0s
Thinking: The user is asking me to continue if there are next steps. Let me check what the current state is and if there's anything pending.
Looking at the comprehensive summary I provided, it seems like we've completed a thorough documentation of the OpenCode plugin system and oh-my-opencode architecture. 
Let me check if there's a todo list or any pending tasks by reading the todo list.
⚙ todoread 
Thinking: The todo list is empty, which means we've completed the documentation work. The user asked "What did we do so far?" and I provided a comprehensive summary. Now they're asking to continue if there are next steps.
Since there's no active todo list and the documentation seems complete, I should ask what they'd like to do next. Possible directions:
1. Create a custom plugin based on what we learned
2. Modify/extend oh-my-opencode
3. Work on something else in the codebase
4. Dive deeper into specific components
Let me ask what direction they want to take.