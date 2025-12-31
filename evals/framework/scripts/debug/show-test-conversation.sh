#!/bin/bash

# Show full conversation from a test session
# Usage: ./show-test-conversation.sh <session_id>

SESSION_ID=$1

if [ -z "$SESSION_ID" ]; then
  echo "Usage: $0 <session_id>"
  echo ""
  echo "Get session ID from test output (look for 'Session created: ses_...')"
  exit 1
fi

SESSION_DIR="$HOME/.local/share/opencode/storage/message/$SESSION_ID"
PART_DIR="$HOME/.local/share/opencode/storage/part"

if [ ! -d "$SESSION_DIR" ]; then
  echo "Session not found: $SESSION_ID"
  exit 1
fi

echo "========================================================================"
echo "SESSION: $SESSION_ID"
echo "========================================================================"
echo ""

# Process messages in order
for msg_file in "$SESSION_DIR"/*.json; do
  if [ -f "$msg_file" ]; then
    MSG_ID=$(cat "$msg_file" | jq -r '.id')
    ROLE=$(cat "$msg_file" | jq -r '.role')
    SUMMARY=$(cat "$msg_file" | jq -r '.summary.body // empty')
    
    if [ "$ROLE" = "user" ]; then
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "👤 USER PROMPT"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      
      # Get actual user prompt from parts (not summary which is auto-generated)
      if [ -d "$PART_DIR/$MSG_ID" ]; then
        for part_file in "$PART_DIR/$MSG_ID"/*.json; do
          if [ -f "$part_file" ]; then
            PART_TYPE=$(cat "$part_file" | jq -r '.type')
            if [ "$PART_TYPE" = "text" ]; then
              TEXT=$(cat "$part_file" | jq -r '.text // empty')
              if [ -n "$TEXT" ]; then
                echo "$TEXT"
              fi
            fi
          fi
        done
      else
        # Fallback to summary if no parts (shouldn't happen)
        if [ -n "$SUMMARY" ]; then
          echo "$SUMMARY"
        fi
      fi
      echo ""
      
    elif [ "$ROLE" = "assistant" ]; then
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "🤖 ASSISTANT"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      
      # Read parts from the part directory
      if [ -d "$PART_DIR/$MSG_ID" ]; then
        for part_file in "$PART_DIR/$MSG_ID"/*.json; do
          if [ -f "$part_file" ]; then
            PART_TYPE=$(cat "$part_file" | jq -r '.type')
            
            if [ "$PART_TYPE" = "text" ]; then
              TEXT=$(cat "$part_file" | jq -r '.text // empty')
              if [ -n "$TEXT" ]; then
                echo "$TEXT"
                echo ""
              fi
            elif [ "$PART_TYPE" = "tool" ]; then
              TOOL=$(cat "$part_file" | jq -r '.tool')
              INPUT=$(cat "$part_file" | jq -c '.input // {}')
              echo "🔧 TOOL CALL: $TOOL"
              echo "   Input: $INPUT"
              echo ""
            elif [ "$PART_TYPE" = "tool_result" ]; then
              RESULT=$(cat "$part_file" | jq -r '.result // empty')
              if [ -n "$RESULT" ]; then
                # Show first 500 chars of result
                echo "📊 TOOL RESULT:"
                echo "$RESULT" | head -c 500
                if [ ${#RESULT} -gt 500 ]; then
                  echo "..."
                fi
                echo ""
              fi
            fi
          fi
        done
      fi
      echo ""
    fi
  fi
done

echo "========================================================================"
