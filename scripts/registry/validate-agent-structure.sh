#!/bin/bash
# Validates agent structure and dependencies

set -e

validate_agent() {
  local agent_file=$1
  local category
  local agent
  category=$(dirname "$agent_file" | xargs basename)
  agent=$(basename "$agent_file" .md)
  
  echo "Validating: $category/$agent"
  
  # Check frontmatter exists
  if ! grep -q "^---" "$agent_file"; then
    echo "❌ Missing frontmatter"
    return 1
  fi
  
  # Check required fields
  for field in id name description category type; do
    if ! grep -q "^$field:" "$agent_file"; then
      echo "❌ Missing required field: $field"
      return 1
    fi
  done
  
  # Extract category from frontmatter
  fm_category=$(grep "^category:" "$agent_file" | cut -d: -f2 | xargs)
  if [ "$fm_category" != "$category" ]; then
    echo "❌ Category mismatch: frontmatter says '$fm_category', file is in '$category'"
    return 1
  fi
  
  # Check prompt variants exist (model-specific only, not 'default')
  if grep -q "^variants:" "$agent_file"; then
    # Extract variants properly - only lines that are direct children of variants:
    variants=$(awk '/^variants:/{flag=1;next}/^[a-zA-Z]/{flag=0}flag && /^  - /{print $2}' "$agent_file")
    for variant in $variants; do
      # Skip 'default' - the agent file itself is the default
      [ "$variant" = "default" ] && continue
      
      variant_file=".opencode/prompts/$category/$agent/$variant.md"
      if [ ! -f "$variant_file" ]; then
        echo "⚠️  Missing variant: $variant_file"
      fi
    done
  fi
  
  # Check context dependencies exist
  if grep -q "^dependencies:" "$agent_file"; then
    # Extract context dependencies properly
    contexts=$(awk '/^dependencies:/{flag=1}/^[a-zA-Z]/{if(flag && !/^dependencies:/) flag=0}/^  context:/{ctx=1;next}/^  [a-zA-Z]/{ctx=0}flag && ctx && /^    - /{print $2}' "$agent_file")
    for context in $contexts; do
      context_file=".opencode/context/$context.md"
      if [ ! -f "$context_file" ]; then
        echo "⚠️  Missing context: $context_file"
      fi
    done
  fi
  
  # Check eval directory exists (optional)
  eval_dir="evals/agents/$category/$agent"
  if [ ! -d "$eval_dir" ]; then
    echo "⚠️  Missing eval directory: $eval_dir (optional but recommended)"
  fi
  
  echo "✅ Valid"
  return 0
}

# Main execution
echo "Validating agent structure..."
echo ""

failed=0
total=0

# Validate all agents
for category_dir in .opencode/agent/*/; do
  category=$(basename "$category_dir")
  
  # Skip subagents directory for now (has different structure)
  [ "$category" = "subagents" ] && continue
  
  for agent_file in "$category_dir"*.md; do
    [ -f "$agent_file" ] || continue
    [ "$(basename "$agent_file")" = "README.md" ] && continue
    
    total=$((total + 1))
    
    if ! validate_agent "$agent_file"; then
      failed=$((failed + 1))
    fi
    
    echo ""
  done
done

# Validate subagents separately (they have nested structure)
if [ -d ".opencode/agent/subagents" ]; then
  for subcat_dir in .opencode/agent/subagents/*/; do
    for agent_file in "$subcat_dir"*.md; do
      [ -f "$agent_file" ] || continue
      [ "$(basename "$agent_file")" = "README.md" ] && continue
      
      total=$((total + 1))
      
      if ! validate_agent "$agent_file"; then
        failed=$((failed + 1))
      fi
      
      echo ""
    done
  done
fi

echo "========================================"
echo "Validation complete: $((total - failed))/$total passed"
echo "========================================"

if [ $failed -gt 0 ]; then
  exit 1
fi