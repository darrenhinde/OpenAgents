<div align="center">

# OpenAgents

### AI agent framework for plan-first development workflows with approval-based execution

[![GitHub stars](https://img.shields.io/github/stars/darrenhinde/OpenAgents?style=social)](https://github.com/darrenhinde/OpenAgents/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub last commit](https://img.shields.io/github/last-commit/darrenhinde/OpenAgents)](https://github.com/darrenhinde/OpenAgents/commits/main)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/contributing/CONTRIBUTING.md)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-yellow.svg?style=flat&logo=buy-me-a-coffee)](https://buymeacoffee.com/darrenhinde)

**Multi-language support:** TypeScript • Python • Go • Rust  
**Features:** Automatic testing • Code review • Validation

> **🚀 Future Plans:** Currently optimized for OpenCode CLI. Support for other AI coding tools (Cursor, Claude Code, etc.) will be added after stabilizing the OpenCode integration.

</div>

[![Watch Demo](https://img.youtube.com/vi/EOIzFMdmox8/maxresdefault.jpg)](https://youtu.be/EOIzFMdmox8?si=4ZSsVlAkhMxVmF2R)

> **Note:** This repository has evolved since the demo video with continuous improvements to make it easier for others to use in their projects. The core concepts remain the same, but installation and component organization have been streamlined.

> 📹 **Following along with the video?** The simplified structure shown in the tutorial is available on the [`video-simple`](https://github.com/darrenhinde/OpenAgents/tree/video-simple) branch.


## Why Use This?

- ✅ **Multi-language support** - Works with TypeScript, Python, Go, Rust, and more
- ✅ **Plan-first workflow** - Agents propose plans before implementing
- ✅ **Incremental execution** - Step-by-step implementation with validation
- ✅ **Quality built-in** - Automatic testing, type checking, and code review
- ✅ **Your patterns** - Agents follow your coding standards from context files

---

## Quick Start

### Step 1: Install OpenCode CLI (Follow official guide)
```bash
https://opencode.ai/docs# 
```
### Step 2: Install Agents & Commands

**Option A: Interactive Installer**

> **Note:** Interactive mode requires downloading the script first (can't run through pipe)

<details open>
<summary><b>macOS / Linux</b></summary>

```bash
# Download the installer
curl -fsSL https://raw.githubusercontent.com/darrenhinde/OpenAgents/main/install.sh -o install.sh

# Run interactively
bash install.sh
```
</details>

<details>
<summary><b>Windows (Git Bash)</b></summary>

```bash
# Download the installer
curl -fsSL https://raw.githubusercontent.com/darrenhinde/OpenAgents/main/install.sh -o install.sh

# Run interactively
bash install.sh
```
</details>

<details>
<summary><b>Windows (PowerShell)</b></summary>

```powershell
# Download the script
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/darrenhinde/OpenAgents/main/install.sh" -OutFile "install.sh"

# Run with Git Bash
& "C:\Program Files\Git\bin\bash.exe" install.sh

# Or run with WSL
wsl bash install.sh
```

> **Note:** Git Bash comes with Git for Windows. [Download here](https://git-scm.com/download/win)
</details>

The installer offers:
- 🎯 **Quick Profiles**: Essential, Developer, Business, Full, or Advanced
- 🎨 **Custom Selection**: Pick exactly what you need
- 📦 **Smart Dependencies**: Auto-installs required components
- ✨ **Interactive Menus**: User-friendly component browser
- 🛡️ **Collision Detection**: Safely handles existing files with 4 strategies (skip/overwrite/backup/cancel)
- 🖥️ **Cross-Platform**: Works on macOS, Linux, and Windows (Git Bash/WSL)

> **Updating?** The installer detects existing files and lets you choose: skip existing (keep your changes), overwrite all (get latest), or backup & overwrite (safe update). [Learn more](docs/getting-started/collision-handling.md)

**Option B: Profile-Based Install (Recommended)**

> **Fastest method:** One command, no interaction needed

<details open>
<summary><b>macOS / Linux / Git Bash / WSL</b></summary>

```bash
# Essential - Minimal essentials (9 components)
curl -fsSL https://raw.githubusercontent.com/darrenhinde/OpenAgents/main/install.sh | bash -s essential

# Developer - Recommended for daily work (19 components)
curl -fsSL https://raw.githubusercontent.com/darrenhinde/OpenAgents/main/install.sh | bash -s developer

# Business - Business automation and content creation (15 components)
curl -fsSL https://raw.githubusercontent.com/darrenhinde/OpenAgents/main/install.sh | bash -s business

# Full - Everything included (25 components)
curl -fsSL https://raw.githubusercontent.com/darrenhinde/OpenAgents/main/install.sh | bash -s full

# Advanced - Full + System Builder (32 components)
curl -fsSL https://raw.githubusercontent.com/darrenhinde/OpenAgents/main/install.sh | bash -s advanced
```
</details>

<details>
<summary><b>Windows PowerShell</b></summary>

```powershell
# Download script
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/darrenhinde/OpenAgents/main/install.sh" -OutFile "install.sh"

# Essential profile
& "C:\Program Files\Git\bin\bash.exe" install.sh essential

# Developer profile
& "C:\Program Files\Git\bin\bash.exe" install.sh developer

# Business profile
& "C:\Program Files\Git\bin\bash.exe" install.sh business

# Full profile
& "C:\Program Files\Git\bin\bash.exe" install.sh full

# Advanced profile
& "C:\Program Files\Git\bin\bash.exe" install.sh advanced
```
</details>

> **New!** The `advanced` profile includes the **System Builder** - an interactive tool that generates complete custom AI systems tailored to your domain. [Learn more](docs/features/system-builder/)

**Option C: Manual Install**
```bash
# Clone this repository
git clone https://github.com/darrenhinde/OpenAgents.git
cd OpenAgents

# Install to OpenCode directory (global)
mkdir -p ~/.opencode
cp -r .opencode/agent ~/.opencode/
cp -r .opencode/command ~/.opencode/
cp -r .opencode/context ~/.opencode/
```

### Step 3: Start Building
```bash
# Start the universal agent (recommended for new users)
opencode --agent openagent

# Ask questions or request tasks
> "Create a React todo list with TypeScript"
```

**What happens next:**
1. OpenAgent analyzes your request (question or task)
2. For tasks: proposes a plan and asks for approval
3. Executes step-by-step with validation
4. Delegates to specialists (@task-manager, @tester, @reviewer) when needed
5. Confirms completion and offers cleanup

---

## How It Works

```
User Request
    ↓
openagent (universal coordinator)
    ↓
    ├─→ @task-manager (breaks down complex features)
    ├─→ @tester (writes and runs tests)
    ├─→ @reviewer (security and code review)
    ├─→ @documentation (generates docs)
    ├─→ @coder-agent (implementation tasks)
    └─→ @build-agent (type checking and validation)
```

**The workflow:**
1. **You describe** what you want to build
2. **Agent plans** the implementation steps
3. **You approve** the plan
4. **Agent implements** incrementally with validation
5. **Quality checks** run automatically (tests, types, linting)
6. **Subagents handle** specialized tasks (testing, review, docs)

**Context-aware:** Agents automatically load patterns from `.opencode/context/` to follow your coding standards.

---

## What's Included

### 🤖 Main Agents
- **openagent** - Universal agent for questions and tasks (recommended default)
- **codebase-agent** - Specialized development agent for code-focused workflows
- **task-manager** - Breaks complex features into manageable subtasks
- **workflow-orchestrator** - Routes requests to appropriate workflows
- **image-specialist** - Generates images with Gemini AI

### 🔧 Specialized Subagents (Auto-delegated)
- **reviewer** - Code review and security analysis
- **tester** - Test creation and validation
- **coder-agent** - Quick implementation tasks
- **documentation** - Documentation generation
- **build-agent** - Build and type checking
- **codebase-pattern-analyst** - Pattern discovery

### ⚡ Commands
- **/commit** - Smart git commits with conventional format
- **/optimize** - Code optimization
- **/test** - Testing workflows
- **/clean** - Cleanup operations
- **/context** - Context management
- **/prompt-enchancer** - Improve your prompts
- **/worktrees** - Git worktree management
- **/validate-repo** - Validate repository consistency

### 📚 Context Files
- `core/essential-patterns.md` - Universal coding patterns
- `project/project-context.md` - Your project-specific patterns

---

## Example Workflows

### Build a Feature
```bash
opencode --agent openagent
> "Create a user authentication system with email/password"

# OpenAgent will:
# 1. Analyze the request (complex task)
# 2. Propose implementation plan
# 3. Wait for your approval
# 4. Delegate to @task-manager (creates task breakdown)
# 5. Coordinate implementation step-by-step
# 6. Use @tester for tests and @reviewer for security
# 7. Validate, summarize, and confirm completion
```

### Make a Commit
```bash
# Make your changes
git add .

# Use the commit command
/commit

# Auto-generates: ✨ feat: add user authentication system
```

### Add Your Patterns
```bash
# Edit your project context
nano ~/.opencode/context/project/project-context.md

# Add your patterns:
# **API Endpoint Pattern:**
# ```typescript
# export async function POST(request: Request) {
#   // Your standard pattern
# }
# ```

# Agents will automatically use these patterns!
```

---

## 🏗️ System Builder (New!)

**Build complete custom AI systems tailored to your domain in minutes.**

The System Builder is an interactive tool that generates complete `.opencode` architectures customized to your needs.

### Quick Start
```bash
# Install advanced profile (includes system builder)
curl -fsSL https://raw.githubusercontent.com/darrenhinde/OpenAgents/main/install.sh | bash -s advanced

# Run the interactive builder
/build-context-system
```

### What It Does
- 🎯 **Interactive Interview** - Asks about your domain, use cases, and requirements
- 🤖 **Generates Complete System** - Creates orchestrator, subagents, context files, workflows, and commands
- 🔗 **Integrates with Existing** - Detects and reuses your existing agents
- 🛡️ **Safe Merging** - Won't overwrite your work, offers merge strategies
- 📚 **Production-Ready** - Includes documentation, testing guides, and examples

### Example
```bash
$ /build-context-system

Domain: E-commerce Operations
Purpose: Automate order processing and customer support

# After answering questions, generates:
# - ecommerce-orchestrator (main agent)
# - order-processor, ticket-router, report-generator (subagents)
# - 12 context files (domain knowledge, processes, standards)
# - 5 workflows (process-order, route-ticket, etc.)
# - 5 custom commands (/process-order, /route-ticket, etc.)
# - Complete documentation
```

**Learn more:** [System Builder Documentation](docs/features/system-builder/)

---

## Optional Add-ons

### 📱 Telegram Notifications
Get notified when OpenCode sessions go idle.

```bash
# Copy plugin directory
cp -r .opencode/plugin ~/.opencode/

# Install dependencies
cd ~/.opencode/plugin
npm install

# Configure
cd ~/OpenAgents
cp env.example .env
# Edit .env with TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID
```

**Get credentials:** Message @BotFather on Telegram → `/newbot` → Save token

See [`.opencode/plugin/README.md`](.opencode/plugin/README.md) for detailed documentation.

### 🎨 Gemini AI Image Tools
Generate and edit images using Gemini AI.

```bash
# Copy tool directory
cp -r .opencode/tool ~/.opencode/

# Install dependencies
cd ~/.opencode/tool
npm install

# Configure
cd ~/OpenAgents
cp env.example .env
# Edit .env with GEMINI_API_KEY
```

**Get API key:** https://makersuite.google.com/app/apikey

---

## Common Questions

**Q: What's the main way to use this?**  
A: Use `opencode --agent openagent` as your default. It handles both questions and tasks, coordinating with specialists as needed.

**Q: Does this work on Windows?**  
A: Yes! Use Git Bash (recommended) or WSL. See [Platform Compatibility Guide](docs/getting-started/platform-compatibility.md) for details.

**Q: What bash version do I need?**  
A: Bash 3.2+ (works on macOS default bash). Run `bash scripts/tests/test-compatibility.sh` to check your system.

**Q: Do I need to install plugins/tools?**  
A: No, they're optional. Only install if you want Telegram notifications or Gemini AI features.

**Q: Where should I install - globally or per-project?**  
A: Global (`~/.opencode/`) works for most. Project-specific (`.opencode/`) if you need different configs per project.

**Q: How do I add my own coding patterns?**  
A: Edit `~/.opencode/context/project/project-context.md` - agents automatically load this file.

**Q: What languages are supported?**  
A: The agents work with any language (TypeScript, Python, Go, Rust, etc.) and adapt based on your project files.

**Q: What's the Agent System Blueprint for?**  
A: It's a teaching document explaining architecture patterns and how to extend the system. See [docs/features/agent-system-blueprint.md](docs/features/agent-system-blueprint.md)

**Q: Can I use just one command or agent?**  
A: Yes! Use the installer's list feature to see all components:
```bash
./install.sh --list
```
Or cherry-pick individual files with curl:
```bash
curl -o ~/.opencode/agent/codebase-agent.md \
  https://raw.githubusercontent.com/darrenhinde/OpenAgents/main/.opencode/agent/codebase-agent.md
```

---

## Installation Profiles

The installer offers five pre-configured profiles:

### 🎯 Essential (Minimal - 9 components)
Minimal starter kit - universal agent with core subagents.
- **Agents**: openagent
- **Subagents**: task-manager, documentation
- **Commands**: context, clean
- **Tools**: env
- **Context**: essential-patterns, project-context
- **Config**: env-example
- **Best for**: Learning the system, lightweight tasks, minimal setup

### 💼 Developer (Recommended - 30 components)
Complete software development environment with code generation, testing, review, and build tools.
- Everything in Essential, plus:
- **Agents**: codebase-agent
- **Subagents**: coder-agent, reviewer, tester, build-agent, codebase-pattern-analyst
- **Commands**: commit, test, optimize, validate-repo
- **Context**: All standards and workflow files (code, patterns, tests, docs, analysis, delegation, sessions, task-breakdown, review, context-guide)
- **Config**: readme
- **Best for**: Most developers, daily use, full-featured development

### 📊 Business (15 components)
Business process automation, content creation, and visual workflows.
- **Agents**: openagent
- **Subagents**: task-manager, documentation, image-specialist
- **Commands**: context, clean, prompt-enhancer
- **Tools**: env, gemini (AI image generation)
- **Plugins**: notify, telegram-notify
- **Context**: essential-patterns, project-context
- **Config**: env-example, readme
- **Best for**: Business automation, content creation, non-developers

### 📦 Full (36 components)
Everything included - all agents, subagents, tools, and plugins.
- Everything in Developer and Business combined, plus:
- **Commands**: worktrees (git worktree management), validate-repo
- **Best for**: Power users, exploring all features

### 🚀 Advanced (43 components)
Full installation plus **System Builder** for creating custom AI architectures.
- Everything in Full, plus:
- **System Builder**: Interactive AI system generator
  - system-builder agent
  - domain-analyzer, agent-generator, context-organizer, workflow-designer, command-creator subagents
  - build-context-system command
- **Best for**: Building custom AI systems, contributors, learning the architecture

## Updating Components

Keep your components up to date:

```bash
# Update all installed components
./update.sh

# Or re-run the installer
curl -fsSL https://raw.githubusercontent.com/darrenhinde/OpenAgents/main/install.sh | bash
```

---

## Advanced

### Understanding the System
Read [Agent System Blueprint](docs/features/agent-system-blueprint.md) to learn:
- How context loading works (the `@` symbol)
- Agent architecture patterns
- How to create custom agents and commands
- How to extend the system for your needs

### Safety & Security
- **Approval-first workflow** - Agents propose plans before execution
- **Configurable permissions** - Granular control over agent capabilities
- **Secure credentials** - Environment variables for sensitive data
- **Input sanitization** - Protection against injection attacks

### Project Structure
```
.opencode/
├── agent/              # AI agents
│   ├── codebase-agent.md
│   ├── task-manager.md
│   └── subagents/      # Specialized helpers
├── command/            # Slash commands
│   ├── commit.md
│   └── optimize.md
├── context/            # Coding patterns
│   ├── core/           # Essential patterns
│   └── project/        # Your patterns
├── plugin/             # Optional: Telegram
└── tool/               # Optional: Gemini AI
```

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](docs/contributing/CONTRIBUTING.md) for details.

1. Follow the established naming conventions and coding standards
2. Write comprehensive tests for new features
3. Update documentation for any changes
4. Ensure security best practices are followed

See also: [Code of Conduct](docs/contributing/CODE_OF_CONDUCT.md)

---

## License

This project is licensed under the MIT License.

---

## Recommended for New Users

**Start with `openagent`** - it's your universal assistant that handles everything from simple questions to complex multi-step workflows. It follows a systematic 6-stage workflow (Analyze → Approve → Execute → Validate → Summarize → Confirm) and automatically delegates to specialized subagents when needed.

```bash
opencode --agent openagent
> "How do I implement authentication in Next.js?"  # Questions
> "Create a user authentication system"            # Tasks
```

OpenAgent will guide you through with a plan-first, approval-based approach. For questions, you get direct answers. For tasks, you see the plan before execution.

**Learn more:** See the [OpenAgent Guide](docs/agents/openagent.md) for detailed workflow diagrams and tips.

---
## Support This Work

If this helped you out and you're feeling generous, consider funding my coffee habit ☕

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-yellow?style=for-the-badge&logo=buy-me-a-coffee)](https://buymeacoffee.com/darrenhinde)

Totally optional, but appreciated.

