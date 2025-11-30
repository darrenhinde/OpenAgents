#!/bin/bash
#
# use-prompt.sh - Switch an agent to use a specific prompt variant
#
# Usage:
#   ./scripts/prompts/use-prompt.sh <agent> <prompt-variant>
#   ./scripts/prompts/use-prompt.sh openagent sonnet-4
#
# What it does:
#   1. Copies the specified prompt to the agent location
#   2. That's it - the agent now uses that prompt
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Arguments
AGENT_NAME="${1:-}"
PROMPT_VARIANT="${2:-}"

# Paths
PROMPTS_DIR="$ROOT_DIR/.opencode/prompts"
AGENT_DIR="$ROOT_DIR/.opencode/agent"

usage() {
    echo "Usage: $0 <agent-name> <prompt-variant>"
    echo ""
    echo "Examples:"
    echo "  $0 openagent default      # Use the default prompt"
    echo "  $0 openagent sonnet-4     # Use the Sonnet 4 prompt"
    echo "  $0 openagent grok-fast    # Use the Grok Fast prompt"
    echo ""
    echo "Available prompts:"
    for agent_dir in "$PROMPTS_DIR"/*/; do
        agent=$(basename "$agent_dir")
        echo "  $agent:"
        for prompt in "$agent_dir"*.md; do
            [[ -f "$prompt" ]] && echo "    - $(basename "$prompt" .md)"
        done
    done
    exit 1
}

# Validate arguments
if [[ -z "$AGENT_NAME" ]] || [[ -z "$PROMPT_VARIANT" ]]; then
    usage
fi

PROMPT_FILE="$PROMPTS_DIR/$AGENT_NAME/$PROMPT_VARIANT.md"
AGENT_FILE="$AGENT_DIR/$AGENT_NAME.md"

# Check prompt exists
if [[ ! -f "$PROMPT_FILE" ]]; then
    echo -e "${RED}Error: Prompt not found: $PROMPT_FILE${NC}"
    echo ""
    echo "Available prompts for $AGENT_NAME:"
    ls -1 "$PROMPTS_DIR/$AGENT_NAME/"*.md 2>/dev/null | xargs -I {} basename {} .md || echo "  (none found)"
    exit 1
fi

# Copy prompt to agent location
cp "$PROMPT_FILE" "$AGENT_FILE"

echo -e "${GREEN}✓${NC} Now using ${GREEN}$PROMPT_VARIANT${NC} prompt for ${GREEN}$AGENT_NAME${NC}"
echo ""
echo "  Source: $PROMPT_FILE"
echo "  Active: $AGENT_FILE"
echo ""
echo "To test this prompt:"
echo "  npm run eval:sdk:core -- --agent=$AGENT_NAME"
