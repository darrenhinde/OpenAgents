#!/bin/bash
# Creates a new agent with proper structure

set -e

CATEGORY=$1
AGENT=$2

if [ -z "$CATEGORY" ] || [ -z "$AGENT" ]; then
  echo "Usage: ./create-agent.sh <category> <agent-name>"
  echo ""
  echo "Categories:"
  echo "  core         - System-level agents"
  echo "  development  - Development specialists"
  echo "  content      - Content creation specialists"
  echo "  product      - Product & strategy specialists"
  echo "  data         - Data & analysis specialists"
  echo "  learning     - Education & coaching specialists"
  echo ""
  echo "Example: ./create-agent.sh development frontend-specialist"
  exit 1
fi

AGENT_FILE=".opencode/agent/$CATEGORY/$AGENT.md"
PROMPTS_DIR=".opencode/prompts/$CATEGORY/$AGENT"
EVALS_DIR="evals/agents/$CATEGORY/$AGENT"

# Check if agent already exists
if [ -f "$AGENT_FILE" ]; then
  echo "❌ Agent already exists: $AGENT_FILE"
  exit 1
fi

echo "Creating agent: $CATEGORY/$AGENT"
echo ""

# Create agent file with template
mkdir -p ".opencode/agent/$CATEGORY"
agent_title=$(echo "$AGENT" | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')
cat > "$AGENT_FILE" <<EOF
---
# Basic Info
id: $AGENT
name: $agent_title
description: Brief description of what this agent does
category: $CATEGORY
type: standard
version: 1.0.0
author: your-name

# Agent Configuration
mode: primary
model: anthropic/claude-sonnet-4-5
temperature: 0.1

# Tools
tools:
  read: true
  write: true
  edit: true
  bash: false
  glob: true
  grep: true
  task: true

# Dependencies
dependencies:
  context:
    - $CATEGORY/patterns
  tools: []

# Prompt Variants
variants:
  - gpt
  - llama

# Tags
tags:
  - $CATEGORY
---

# $agent_title

You are a specialist in...

## Your Role

[Define the agent's role and responsibilities]

## Context Loading Strategy

BEFORE any implementation:
1. Read project context to understand requirements
2. Load appropriate patterns from context files
3. Apply domain-specific best practices

## Workflow

1. **Analyze** - Understand the request
2. **Plan** - Create implementation plan
3. **Request Approval** - Present plan to user
4. **Implement** - Execute following patterns
5. **Validate** - Test and verify

## Best Practices

- [Add domain-specific best practices]
- [Add quality guidelines]
- [Add common patterns]
EOF

echo "✅ Created agent file: $AGENT_FILE"
echo "   (This file IS the default prompt, optimized for Claude)"

# Create prompts structure for model-specific variants
mkdir -p "$PROMPTS_DIR"

# Create GPT variant template
cat > "$PROMPTS_DIR/gpt.md" <<EOF
---
# Copy frontmatter from agent file and customize for GPT
# Agent file: .opencode/agent/$CATEGORY/$AGENT.md
---

# $agent_title - GPT Optimized

[Customize the prompt for GPT-4/GPT-4o characteristics:
- More explicit instructions
- Clearer step-by-step breakdowns
- More examples if needed]

## Your Role

[Copy from agent file and adapt for GPT]
EOF

# Create Llama variant template
cat > "$PROMPTS_DIR/llama.md" <<EOF
---
# Copy frontmatter from agent file and customize for Llama/OSS
# Agent file: .opencode/agent/$CATEGORY/$AGENT.md
---

# $agent_title - Llama/OSS Optimized

[Customize the prompt for Llama/OSS models:
- Simpler language
- More structured format
- Clear delimiters and sections]

## Your Role

[Copy from agent file and adapt for Llama/OSS]
EOF

cat > "$PROMPTS_DIR/TEMPLATE.md" <<EOF
---
# Copy frontmatter from agent file (.opencode/agent/$CATEGORY/$AGENT.md)
# and customize for your target model
---

# Agent prompt optimized for [MODEL NAME]

[Customize the prompt for specific model characteristics]
EOF

cat > "$PROMPTS_DIR/README.md" <<EOF
# $AGENT Prompt Variants

## Default Prompt

The **default prompt** is the agent file itself: \`.opencode/agent/$CATEGORY/$AGENT.md\`

This is optimized for **Claude** (Anthropic models) and serves as the baseline.

## Model-Specific Variants

This directory contains optimizations for other model families:

| Variant | Model Family | Status | Best For |
|---------|--------------|--------|----------|
| gpt.md | GPT | 🚧 Experimental | GPT-4, GPT-4o |
| llama.md | Llama/OSS | 🚧 Experimental | Llama, Qwen, DeepSeek |

## Testing Variants

\`\`\`bash
cd evals/framework

# Test default (agent file itself)
npm run eval:sdk -- --agent=$CATEGORY/$AGENT

# Test GPT variant
npm run eval:sdk -- --agent=$CATEGORY/$AGENT --prompt-variant=gpt

# Test Llama variant
npm run eval:sdk -- --agent=$CATEGORY/$AGENT --prompt-variant=llama
\`\`\`

## Results

| Variant | Pass Rate | Notes |
|---------|-----------|-------|
| default (agent file) | - | Not yet tested |
| gpt | - | Not yet tested |
| llama | - | Not yet tested |
EOF

echo "✅ Created prompts structure: $PROMPTS_DIR"

# Create eval structure
mkdir -p "$EVALS_DIR/config"
mkdir -p "$EVALS_DIR/tests"

cat > "$EVALS_DIR/config/config.yaml" <<EOF
agent: $CATEGORY/$AGENT
model: anthropic/claude-sonnet-4-5
timeout: 60000
EOF

cat > "$EVALS_DIR/tests/smoke-test.yaml" <<EOF
id: smoke-test
name: "Smoke Test: $AGENT"
description: Basic functionality test

category: smoke
agent: $CATEGORY/$AGENT
model: anthropic/claude-sonnet-4-5

prompt: "Hello, can you introduce yourself and explain what you do?"

behavior:
  mustUseAnyOf: []
  requiresApproval: false
  minToolCalls: 0

approvalStrategy:
  type: none

timeout: 30000

tags:
  - smoke-test
  - basic
EOF

cat > "$EVALS_DIR/README.md" <<EOF
# $AGENT Test Suite

## Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Smoke | 1 | 🚧 Not yet run |

## Running Tests

\`\`\`bash
cd evals/framework

# Run all tests
npm run eval:sdk -- --agent=$CATEGORY/$AGENT

# Run smoke test only
npm run eval:sdk -- --agent=$CATEGORY/$AGENT --pattern="smoke-test.yaml"
\`\`\`

## Test Results

Not yet tested.
EOF

echo "✅ Created eval structure: $EVALS_DIR"

# Create context directory if it doesn't exist
if [ ! -d ".opencode/context/$CATEGORY" ]; then
  mkdir -p ".opencode/context/$CATEGORY"
  touch ".opencode/context/$CATEGORY/.gitkeep"
  echo "✅ Created context directory: .opencode/context/$CATEGORY"
fi

echo ""
echo "========================================"
echo "✅ Agent created successfully!"
echo "========================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Edit agent file:"
echo "   vim $AGENT_FILE"
echo ""
echo "2. Customize model-specific variants (optional):"
echo "   vim $PROMPTS_DIR/gpt.md      # GPT optimization"
echo "   vim $PROMPTS_DIR/llama.md    # Llama/OSS optimization"
echo "   Note: The agent file itself is the default prompt"
echo ""
echo "3. Add context files:"
echo "   vim .opencode/context/$CATEGORY/patterns.md"
echo ""
echo "4. Create tests:"
echo "   vim $EVALS_DIR/tests/your-test.yaml"
echo ""
echo "5. Validate structure:"
echo "   ./scripts/registry/validate-agent-structure.sh"
echo ""
echo "6. Test agent:"
echo "   cd evals/framework"
echo "   npm run eval:sdk -- --agent=$CATEGORY/$AGENT"
echo ""