# NexusAgent - Technical Specification
**Version:** 1.0  
**Date:** 2025-10-29

---

## 1. Context-Aware Orchestration System

### 1.1 Three-Level Context Allocation

**Level 1: Complete Isolation (80% of requests)**

```yaml
Triggers:
  - Single clear objective
  - Standard operation
  - No domain knowledge needed
  - Can complete in one step
  
Context Provided:
  - Task description only
  - No file loading
  - No metadata queries
  
Performance:
  - 80% reduction in context overhead
  - < 1 second execution time
  
Examples:
  - Format data according to specification
  - Validate input against simple rules
  - Generate output from template
```

**Level 2: Filtered Context (15% of requests)**

```yaml
Triggers:
  - Multiple steps required
  - Domain knowledge needed
  - Quality validation important
  - Some coordination required
  
Context Provided:
  - Task description
  - Relevant domain files (2-4 files)
  - Platform specs if applicable
  - Quality standards if validation needed
  
Process:
  1. Orchestrator creates tmp/requests/{uuid}.json
  2. Routes to @context-provider with request_id
  3. Context provider analyzes and returns file paths
  4. Orchestrator loads specified files
  5. Routes to specialist with loaded context
  
Performance:
  - 60% reduction in context overhead
  - < 5 seconds execution time
  
Examples:
  - Create content requiring brand alignment
  - Process requests needing business logic
  - Validate against quality standards
```

**Level 3: Full Context (5% of requests)**

```yaml
Triggers:
  - Multi-agent coordination needed
  - High stakes or critical decisions
  - Extensive state management required
  - Requires historical context
  
Context Provided:
  - Task description
  - Full domain knowledge
  - Historical state
  - Quality metadata
  - Lifecycle information
  
Process:
  1. Orchestrator creates tmp/requests/{uuid}.json
  2. Routes to @context-manager with request_id
  3. Context manager queries metadata-index.json
  4. Validates quality and health scores
  5. Loads files with full governance
  6. Routes to specialists with request_id
  7. All agents update processing chain
  
Performance:
  - Optimized for accuracy over speed
  - < 30 seconds execution time
  
Examples:
  - Update governed context after PR merge
  - Complex multi-step workflows with dependencies
  - High-stakes decisions requiring audit trail
```

### 1.2 Main Orchestrator Agent

**File:** `agent/main-orchestrator.md`

**Responsibilities:**
```yaml
1. Request Analysis:
   - Parse user request
   - Extract keywords and intent
   - Assess complexity (simple/moderate/complex)
   - Identify domain and required capabilities
   
2. Context Allocation:
   - Determine context level (1/2/3)
   - Decide if governance is needed
   - Calculate estimated execution time
   
3. Routing:
   - Direct execution (Level 1)
   - Route to @context-provider (Level 2)
   - Route to @context-manager (Level 3)
   - Route to appropriate specialists
   
4. Coordination:
   - Manage multi-agent workflows
   - Track progress via request files
   - Handle errors and retries
   - Integrate results
   
5. Response:
   - Format final output
   - Provide clear confirmation
   - Suggest next actions
   - Clean up temp files
```

**Complexity Assessment Function:**
```python
def assess_complexity(request):
    score = 0
    
    # Step count
    estimated_steps = count_action_verbs(request)
    score += min(estimated_steps, 5)  # Cap at 5
    
    # Domain knowledge
    if requires_domain_knowledge(request):
        score += 2
    
    # Integration points
    integration_count = count_integration_keywords(request)
    score += min(integration_count * 2, 4)  # Cap at 4
    
    # Validation requirements
    if requires_quality_validation(request):
        score += 1
    
    # Historical context
    if requires_historical_context(request):
        score += 2
    
    # Governance keywords
    if contains_governance_keywords(request):
        score += 2
    
    # Classification
    if score <= 3:
        return "simple", 1  # Level 1
    elif score <= 7:
        return "moderate", 2  # Level 2
    else:
        return "complex", 3  # Level 3
```

**Template Structure:**
```xml
---
description: "Main orchestrator for NexusAgent"
mode: primary
temperature: 0.2
tools:
  read: true
  write: true
  edit: true
  bash: true
  task: true
  glob: true
  grep: true
---

# NexusAgent Orchestrator

<context>
  <system_context>
    Universal AI agent orchestration system combining
    context-aware routing with data governance
  </system_context>
  <execution_context>
    Analyzes requests, allocates appropriate context level,
    and coordinates specialists with explicit context passing
  </execution_context>
</context>

<role>
  Primary Orchestrator specializing in intelligent routing,
  context allocation, and multi-agent coordination
</role>

<task>
  Transform user requests into completed outcomes by:
  1. Analyzing complexity
  2. Allocating appropriate context
  3. Routing to specialists
  4. Coordinating execution
  5. Integrating results
</task>

<workflow name="IntelligentOrchestration">
  <stage_1_analyze>
    <action>Assess request complexity</action>
    <complexity_score>Calculate 0-10 score</complexity_score>
    <context_level>Determine 1, 2, or 3</context_level>
    <governance_needed>Check if governance required</governance_needed>
  </stage_1_analyze>
  
  <stage_2_route>
    <level_1>
      <execute_directly>No temp files, direct execution</execute_directly>
    </level_1>
    
    <level_2>
      <create_request_file>tmp/requests/req-{uuid}.json</create_request_file>
      <route_to_context_provider>@context-provider with request_id</route_to_context_provider>
      <load_context>Files specified by context-provider</load_context>
      <route_to_specialist>With loaded context</route_to_specialist>
    </level_2>
    
    <level_3>
      <create_request_file>tmp/requests/req-{uuid}.json</create_request_file>
      <route_to_context_manager>@context-manager with request_id</route_to_context_manager>
      <load_governed_context>With quality validation</load_governed_context>
      <route_to_specialists>With request_id for coordination</route_to_specialists>
    </level_3>
  </stage_2_route>
  
  <stage_3_execute>
    <monitor_progress>Read request file for updates</monitor_progress>
    <handle_errors>Retry logic and fallbacks</handle_errors>
  </stage_3_execute>
  
  <stage_4_finalize>
    <integrate_results>Combine outputs</integrate_results>
    <format_response>Clear user-facing message</format_response>
    <cleanup>Archive or delete temp files</cleanup>
  </stage_4_finalize>
</workflow>

<context_allocation_logic>
  <level_1_indicators>
    - Single clear objective
    - Standard operation type
    - No integration requirements
    - No domain knowledge needed
  </level_1_indicators>
  
  <level_2_indicators>
    - Multi-step process
    - Domain knowledge helpful
    - Quality validation needed
    - Platform-specific requirements
  </level_2_indicators>
  
  <level_3_indicators>
    - Governance keywords present
    - High-stakes or critical
    - Historical context required
    - Multi-system coordination
    - Quality metadata needed
  </level_3_indicators>
</context_allocation_logic>
```

### 1.3 Context Provider Agent

**File:** `agent/context-provider.md`

**Responsibilities:**
```yaml
1. Request Analysis:
   - Read request file for full context
   - Parse user request and keywords
   - Identify domain area
   - Detect integration points
   
2. Context Selection:
   - Query available context files
   - Match keywords to tags
   - Prioritize by relevance
   - Limit to 2-4 files for cognitive load
   
3. File Path Return:
   - Return array of file paths (not contents)
   - Include priority levels
   - Estimate total token count
   - Provide reasoning for selection
```

**Selection Algorithm:**
```python
def select_context_files(request_id):
    # Read request file
    request = read_json(f"tmp/requests/{request_id}.json")
    keywords = request["task_context"]["keywords"]
    task_type = request["task_context"]["type"]
    
    # Initialize selection
    selected_files = []
    
    # Always include core
    selected_files.append({
        "path": "context/core/essential-patterns.md",
        "priority": "critical",
        "reason": "Core patterns always needed"
    })
    
    # Match by domain
    if task_type in ["data_processing", "etl"]:
        selected_files.extend(get_domain_files("data"))
    elif task_type in ["content_creation", "writing"]:
        selected_files.extend(get_domain_files("content"))
    
    # Match by keywords
    for keyword in keywords:
        matching_files = query_context_by_tag(keyword)
        for file in matching_files[:2]:  # Max 2 per keyword
            if file not in selected_files:
                selected_files.append({
                    "path": file,
                    "priority": "important",
                    "reason": f"Matched keyword: {keyword}"
                })
    
    # Limit total files
    if len(selected_files) > 4:
        selected_files = prioritize_files(selected_files)[:4]
    
    # Estimate tokens
    estimated_tokens = sum([estimate_file_tokens(f["path"]) 
                           for f in selected_files])
    
    return {
        "context_level": 2,
        "file_locations": [f["path"] for f in selected_files],
        "estimated_tokens": estimated_tokens,
        "load_priority": {
            "critical": [f["path"] for f in selected_files if f["priority"] == "critical"],
            "important": [f["path"] for f in selected_files if f["priority"] == "important"]
        },
        "reasoning": [f"{f['path']}: {f['reason']}" for f in selected_files]
    }
```

---

## 2. Data Governance System

### 2.1 Request ID Protocol

**Purpose:** Eliminate context loss between agents through explicit context passing

**Specification:**

```yaml
Request File Location: 
  governance/tmp/requests/{request_id}.json

Request ID Format:
  req-{uuid4}  # e.g., req-a1b2c3d4-e5f6-7890-abcd-ef1234567890

Request File Structure:
  {
    "request_id": "req-{uuid}",
    "timestamp": "2025-10-29T10:00:00Z",
    "from_agent": "main-orchestrator",
    "task_context": {
      "type": "feature_build | content_creation | data_update",
      "description": "Human-readable description",
      "user_request": "Original user input",
      "keywords": ["keyword1", "keyword2"],
      "priority": "normal | urgent | low"
    },
    "context_needed": {
      "files_requested": ["file1.md", "file2.md"],
      "depth": 1,
      "include_metadata": true,
      "max_files": 10
    },
    "processing_chain": [
      {
        "agent": "agent-name",
        "action": "action_taken",
        "timestamp": "2025-10-29T10:00:01Z",
        "notes": "Optional details",
        "duration_ms": 150
      }
    ],
    "result": {
      "status": "completed | in_progress | failed",
      "files_returned": ["file1.md", "file2.md"],
      "warnings": ["warning1"],
      "errors": [],
      "estimated_tokens": 1200,
      "metadata": {
        "quality_score": 25,
        "health_status": "healthy"
      }
    }
  }

Protocol Rules:
  1. MUST create request file before calling any subagent
  2. MUST pass request_id (not request contents) to subagents
  3. MUST read request file as first action in subagent
  4. MUST update processing_chain after each major step
  5. MUST update result section upon completion
  6. MUST cleanup or archive after workflow complete

Benefits:
  ✅ No context loss between agents
  ✅ Full audit trail of processing
  ✅ Resumable workflows
  ✅ Easy debugging
  ✅ Distributed processing possible
```

### 2.2 Dual Metadata System

**PRIMARY: metadata-index.json**

```yaml
Location: governance/metadata-index.json

Purpose:
  - Fast queries without file I/O
  - Central source of truth for queries
  - Pre-computed indexes for common patterns
  
Structure:
  {
    "version": "1.0",
    "last_updated": "2025-10-29T10:00:00Z",
    "last_sync_with_files": "2025-10-29T04:00:00Z",
    "sync_status": "healthy | warning | error",
    "total_files": 156,
    
    "files": {
      "path/to/file.md": {
        "admin": {
          "created": "2025-01-15",
          "created_by": "user@domain.com",
          "owner": "team-name",
          "last_modified": "2025-10-15",
          "modified_by": "user@domain.com",
          "next_review": "2026-01-15"
        },
        "classification": {
          "tier": 1,
          "category": "system-design",
          "sensitivity": "internal",
          "tags": ["tag1", "tag2"]
        },
        "quality": {
          "health_score": 25,
          "accuracy_score": 5,
          "completeness_score": 4,
          "consistency_score": 5,
          "timeliness_score": 4,
          "validity_score": 5,
          "uniqueness_score": 5,
          "last_validated": "2025-10-29"
        },
        "usage": {
          "access_count_30d": 45,
          "access_count_90d": 132,
          "last_accessed": "2025-10-28"
        },
        "lifecycle": {
          "state": "active | review | archived | deleted",
          "retention": "permanent | 1year | 90days"
        },
        "checksum": "sha256:abc123...",
        "embedded_metadata_present": true
      }
    },
    
    "indexes": {
      "by_tier": {
        "1": ["file1.md", "file2.md"],
        "2": ["file3.md"]
      },
      "by_state": {
        "active": ["file1.md", "file2.md"],
        "review": ["file3.md"]
      },
      "by_health": {
        "healthy": ["file1.md"],
        "warning": ["file2.md"],
        "action_required": ["file3.md"]
      },
      "by_tag": {
        "authentication": ["file1.md", "file2.md"],
        "storage": ["file3.md"]
      }
    },
    
    "quality_summary": {
      "healthy_files": 142,
      "warning_files": 12,
      "action_required_files": 2,
      "overall_health_score": 87
    }
  }

Query Performance:
  - Tier query: < 1ms (indexed)
  - Tag query: < 5ms (indexed)
  - Health summary: < 1ms (pre-computed)
  - No file I/O required for queries

Update Strategy:
  - Update on every file modification
  - Recalculate indexes if tier/tags change
  - Update quality_summary periodically
  - Atomic writes with locks
```

**SECONDARY: Embedded XML Metadata**

```yaml
Location: Top of each context file

Purpose:
  - Travels with file content
  - Backup for metadata-index.json
  - Source of truth for nightly sync
  - Human-readable metadata

Format:
  <?xml version="1.0" encoding="UTF-8"?>
  <context_file>
  
  <!-- METADATA (Managed by Governance Agents) -->
  <metadata>
    <admin>
      <created>2025-01-15</created>
      <created_by>user@domain.com</created_by>
      <owner>team-name</owner>
      <last_modified>2025-10-15</last_modified>
      <modified_by>user@domain.com</modified_by>
      <next_review>2026-01-15</next_review>
    </admin>
    
    <classification>
      <tier>1</tier>
      <category>system-design</category>
      <sensitivity>internal</sensitivity>
      <tags>tag1,tag2,tag3</tags>
    </classification>
    
    <quality>
      <health_score>25</health_score>
      <accuracy_score>5</accuracy_score>
      <completeness_score>4</completeness_score>
      <consistency_score>5</consistency_score>
      <timeliness_score>4</timeliness_score>
      <validity_score>5</validity_score>
      <uniqueness_score>5</uniqueness_score>
      <last_validated>2025-10-29</last_validated>
    </quality>
    
    <usage>
      <access_count_30d>45</access_count_30d>
      <access_count_90d>132</access_count_90d>
      <last_accessed>2025-10-28</last_accessed>
    </usage>
    
    <lifecycle>
      <state>active</state>
      <retention>permanent</retention>
    </lifecycle>
  </metadata>
  
  <!-- CONTENT (Managed by Humans/Orchestrator) -->
  <domain_knowledge>
    [Actual content here]
  </domain_knowledge>
  
  </context_file>

Sync Strategy:
  - Nightly sync job (4:00 AM)
  - Scans all files
  - Parses XML metadata
  - Compares with metadata-index.json
  - If mismatch: File wins (XML is source of truth)
  - Updates JSON index
  - Logs discrepancies
```

### 2.3 Quality Validation (6 Dimensions)

```yaml
Dimension 1: Accuracy
  Score: 0-5
  Checks:
    - All @ references point to existing files
    - External links are valid
    - Code examples compile/run
    - Data is factually correct
  
Dimension 2: Completeness
  Score: 0-5
  Checks:
    - All required sections present
    - XML schema validation passes
    - Examples provided where needed
    - Related references included
  
Dimension 3: Consistency
  Score: 0-5
  Checks:
    - Naming conventions followed
    - Format standards met
    - Terminology matches glossary
    - Style guide compliance
  
Dimension 4: Timeliness
  Score: 0-5 (time-based)
  Formula:
    days_since_modified = now() - last_modified
    if days_since_modified < 30:  score = 5
    elif days_since_modified < 90: score = 3
    elif days_since_modified < 180: score = 2
    else: score = 1
  
Dimension 5: Validity
  Score: 0-5
  Checks:
    - XML well-formed
    - All references resolve
    - Links not broken
    - Metadata schema valid
  
Dimension 6: Uniqueness
  Score: 0-5
  Checks:
    - No duplicate content
    - No conflicting information
    - Clear unique purpose

Health Score Calculation:
  health_score = sum(all dimension scores)
  max_score = 30
  
  Status Classification:
    - health_score >= 25: Healthy (green)
    - health_score 20-24: Warning (yellow)
    - health_score < 20: Action Required (red)
```

### 2.4 Lifecycle Management

```yaml
Lifecycle States:
  CREATE → ACTIVE → REVIEW → ARCHIVE → DELETE

State: CREATE
  Triggers:
    - New file created
    - Initial metadata populated
  Actions:
    - Set state = "active"
    - Set next_review = created + 1 year
    - Initialize quality scores
    
State: ACTIVE
  Conditions:
    - Regular use (access_count_90d > 5)
    - Recent updates (< 90 days old)
    - Good health (score >= 20)
  Actions:
    - Normal operations
    - Update access counts
    - Periodic quality checks
    
State: REVIEW
  Triggers:
    - next_review date passed
    - freshness_days > 90
    - access_count_90d < 5
    - health_score < 20
  Actions:
    - Notify owner
    - Update next_review = now + 90 days
    - Flag for human review
    - Generate review report
    
State: ARCHIVE
  Triggers:
    - access_count_90d = 0
    - freshness_days > 180
    - Marked obsolete by owner
  Actions:
    - Move to governance/archive/
    - Update state in metadata
    - Remove from active indexes
    - Keep for reference
    
State: DELETE
  Triggers:
    - Archived for > 2 years
    - Owner approval for deletion
    - Regulatory retention period passed
  Actions:
    - Backup to governance/deleted/
    - Remove from all indexes
    - Update catalogs
    - Log deletion

Approval Requirements:
  - Archive Tier 1 files: Owner approval required
  - Delete any file: Owner + steward approval required
  - Bulk operations: Admin approval required
```

---

## 3. Agent Templates

### 3.1 Primary Agent Template

```xml
---
description: "[What this agent does]"
mode: primary
temperature: 0.2
tools:
  read: true
  write: true
  edit: true
  bash: true
  task: true
  glob: true
  grep: true
permissions:
  edit:
    "**/*.env*": "deny"
    "**/*.secret": "deny"
---

# [Agent Name]

<context>
  <system_context>[Overall system]</system_context>
  <domain_context>[Domain/industry]</domain_context>
  <task_context>[Types of tasks]</task_context>
</context>

<role>
  [Role description with expertise areas]
</role>

<task>
  [Specific objective this agent accomplishes]
</task>

<workflow name="PrimaryWorkflow">
  <stage_1>
    <action>[First major action]</action>
    <decision>
      <if test="condition">[Then do this]</if>
      <else>[Do this]</else>
    </decision>
  </stage_1>
  
  <stage_2>
    [Continue workflow]
  </stage_2>
</workflow>

<constraints>
  <must>Always do X</must>
  <must_not>Never do Y</must_not>
</constraints>

<output_specifications>
  [What format to return]
</output_specifications>
```

### 3.2 Subagent Template

```xml
---
description: "[Specific task]"
mode: subagent
temperature: 0.1
tools:
  read: true
  write: false
---

# [Subagent Name]

<context>
  <specialist_domain>[Specific expertise]</specialist_domain>
  <task_scope>[What this agent does]</task_scope>
</context>

<role>
  [Specialist role]
</role>

<task>
  [Specific measurable task]
</task>

<inputs_required>
  <parameter name="request_id" type="string">
    UUID for request file
  </parameter>
</inputs_required>

<process_flow>
  <step_1>
    <action>Read request file</action>
    <file>tmp/requests/{request_id}.json</file>
  </step_1>
  
  <step_2>
    <action>Perform specialized task</action>
  </step_2>
  
  <step_3>
    <action>Update request file</action>
    <append>Processing chain entry</append>
  </step_3>
</process_flow>

<constraints>
  <must>ALWAYS read request file first</must>
  <must>ALWAYS update request file with results</must>
  <must_not>Call other agents</must_not>
</constraints>

<output_specification>
  [Exact structure of output]
</output_specification>
```

---

## 4. Performance Requirements

```yaml
Context Loading:
  - Level 1: < 1 second
  - Level 2: < 5 seconds
  - Level 3: < 30 seconds

Metadata Queries:
  - JSON index query: < 10ms
  - Health summary: < 1ms
  - Tag search: < 5ms

File Operations:
  - Read file: < 100ms
  - Update metadata: < 200ms (with lock)
  - Sync all files: < 2 minutes

Workflow Execution:
  - Simple task: < 10 seconds
  - Moderate task: < 60 seconds
  - Complex task: < 5 minutes

Memory Usage:
  - Base system: < 50MB
  - With metadata index: < 100MB
  - During execution: < 500MB

Scalability:
  - Support up to 10,000 context files
  - Support up to 1,000 concurrent requests
  - Metadata index size: < 10MB for 1,000 files
```

---

## 5. Security Considerations

```yaml
File Permissions:
  - Deny edit on *.env*, *.secret files
  - Validate all file paths (no ../ traversal)
  - Sandbox bash execution
  
Metadata Protection:
  - Lock-based concurrency for writes
  - Atomic updates to prevent corruption
  - Backup before destructive operations
  
Request File Security:
  - UUID prevents guessing
  - Cleanup after completion
  - Archive for audit (optional)
  
API Keys:
  - Never store in context files
  - Use environment variables
  - Validate before use
```

---

## Next: Installation Specification

This technical spec provides the foundation. Next document will detail:
- Installation scripts
- Profile packaging
- Configuration management
- Update mechanisms
