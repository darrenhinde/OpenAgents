# Building Data Governance Agent Systems: A Complete Guide

**Version**: 2.0  
**Date**: 2025-10-09  
**Purpose**: Separate, specialized system for managing context data quality and lifecycle

---

## Overview

This guide teaches you how to build a **Data Governance Agent System** that manages your context documentation as data assets. This system operates **independently** from your main orchestrator but **integrates seamlessly** when context management is needed.

**What you'll learn:**
- How to build specialized data governance agents
- How to manage context lifecycle automatically
- How to maintain data quality without overwhelming your main orchestrator
- How to pass context between agents without information loss
- How to keep everything simple but robust

**Key Improvements in v2.0:**
- **JSON Metadata Index** as primary (fast queries, no XML parsing)
- **Explicit Context Passing** via temp files (no information loss)
- **Simplified Workflows** with state machine (resumable, debuggable)
- **Clear Communication Protocol** between agents

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [System Architecture](#system-architecture)
3. [Step 1: Foundation - Data Management Structure](#step-1-foundation---data-management-structure)
4. [Step 2: Agent Communication Protocol](#step-2-agent-communication-protocol)
5. [Step 3: Building the Context Management Agent](#step-3-building-the-context-management-agent)
6. [Step 4: Specialized Governance Subagents](#step-4-specialized-governance-subagents)
7. [Step 5: Automated Quality & Lifecycle Workflows](#step-5-automated-quality--lifecycle-workflows)
8. [Step 6: Metadata Management](#step-6-metadata-management)
9. [Complete Workflow Examples](#complete-workflow-examples)
10. [Keeping It Simple](#keeping-it-simple)

---

## Core Concepts

### The Problem This Solves

Your main orchestrator should focus on **user tasks** (building features, writing code, processing requests). It shouldn't be burdened with:

1. **Context Quality Management**: Checking if docs are accurate, complete, current
2. **Context Lifecycle**: Moving files through CREATE → ACTIVE → REVIEW → ARCHIVE → DELETE
3. **Metadata Maintenance**: Updating timestamps, usage stats, quality scores
4. **Catalog Synchronization**: Keeping CATALOG.md files in sync with actual files

**Solution**: A **separate Data Governance Agent System** that handles all context management autonomously.

### The Architecture

```
┌────────────────────────────────────────────────────────┐
│                   USER REQUEST                         │
└────────────────┬───────────────────────────────────────┘
                 ↓
┌────────────────────────────────────────────────────────┐
│          MAIN ORCHESTRATOR AGENT                       │
│  "Build feature X"                                     │
│  "Write blog post about Y"                             │
└────────────────┬───────────────────────────────────────┘
                 ↓
         Need context?
                 ↓
         Creates request file (tmp/context-requests/req-123.json)
                 ↓
┌────────────────────────────────────────────────────────┐
│      CONTEXT MANAGEMENT AGENT (Primary)                │
│  - Reads request file (full context)                   │
│  - Retrieve context for task                           │
│  - Check if context needs update                       │
│  - Route to governance subagents with request ID       │
└────────────────┬───────────────────────────────────────┘
                 ↓
         ┌───────┴────────┬────────────┬──────────────┐
         │                │            │              │
    ┌────▼────┐   ┌──────▼──┐   ┌────▼─────┐   ┌───▼──────┐
    │ Quality │   │Lifecycle│   │ Metadata │   │ Catalog  │
    │ Agent   │   │ Agent   │   │  Agent   │   │  Agent   │
    └─────────┘   └─────────┘   └──────────┘   └──────────┘
         ↑              ↑              ↑              ↑
         └──────────────┴──────────────┴──────────────┘
              All read same request file (no context loss)
```

**Key Separation**:
- **Main Orchestrator**: User-facing tasks
- **Context Management Agent**: All context operations
- **Governance Subagents**: Specialized maintenance tasks
- **Temp Files**: Pass full context between agents (no information loss)

---

## System Architecture

### Directory Structure

```
.opencode/
├── agent/
│   ├── main-orchestrator.md        # User-facing agent
│   │
│   └── governance/                 # Governance agents
│       ├── context-manager.md      # Primary governance agent
│       └── subagents/
│           ├── quality-validator.md
│           ├── lifecycle-manager.md
│           ├── metadata-updater.md
│           └── catalog-maintainer.md
│
├── context/
│   ├── MASTER-CATALOG.md
│   ├── system-design/
│   │   ├── CATALOG.md
│   │   └── [context files with embedded metadata]
│   ├── services/
│   ├── business-logic/
│   ├── styles/
│   └── temp/
│
├── learning/
│   └── [error patterns, decisions, etc.]
│
└── governance/                     # Governance metadata & state
    ├── metadata-index.json         # PRIMARY: Fast queryable metadata
    ├── workflow-state.json         # Workflow state machine
    ├── tmp/                        # Inter-agent communication
    │   ├── context-requests/       # Request context files
    │   ├── validation-jobs/        # Validation job state
    │   └── workflow-checkpoints/   # Resumable workflow state
    ├── logs/
    │   ├── access.log              # All file access
    │   ├── changes.log             # All metadata changes
    │   └── workflows.log           # Workflow execution logs
    ├── quality-reports/
    │   └── [automated quality reports]
    └── lifecycle-logs/
        └── [lifecycle transition logs]
```

### Design Principles

**1. Explicit Context Passing**
- No implicit context assumptions
- All agent calls include request ID
- Request ID points to temp file with full context
- Any agent can resume from any point

**2. JSON Metadata as Primary**
- Fast queries without XML parsing
- Embedded XML as backup/sync source
- Nightly sync ensures consistency
- File always wins on conflict

**3. State Machine for Workflows**
- Single workflow-state.json file
- Resumable from any checkpoint
- Clear locks prevent concurrent runs
- Easy debugging with state history

**4. Separation of Concerns**
- Main Orchestrator = User tasks
- Context Management Agent = Context operations
- Governance Subagents = Specific maintenance tasks
- No circular dependencies

---

## Step 1: Foundation - Data Management Structure

### Dual Metadata System

**PRIMARY: JSON Metadata Index** (Fast, Queryable)
**SECONDARY: Embedded XML Metadata** (Travels with file, Backup)

#### JSON Metadata Index (PRIMARY)

**Location**: `.opencode/governance/metadata-index.json`

```json
{
  "version": "1.0",
  "last_updated": "2025-10-09T14:30:00Z",
  "last_sync_with_files": "2025-10-09T14:25:00Z",
  "sync_status": "healthy",
  "total_files": 156,
  
  "files": {
    "context/system-design/storage.md": {
      "admin": {
        "created": "2025-01-15",
        "created_by": "john.doe@company.com",
        "owner": "platform-team-lead",
        "last_modified": "2025-07-15",
        "modified_by": "jane.smith@company.com",
        "next_review": "2026-01-09"
      },
      "classification": {
        "tier": 1,
        "category": "system-design",
        "sensitivity": "internal",
        "tags": ["storage", "database", "persistence", "postgresql"]
      },
      "quality": {
        "health_score": 22,
        "accuracy_score": 5,
        "completeness_score": 4,
        "consistency_score": 5,
        "timeliness_score": 3,
        "validity_score": 5,
        "uniqueness_score": 5,
        "last_validated": "2025-10-09"
      },
      "usage": {
        "access_count_30d": 45,
        "access_count_90d": 132,
        "last_accessed": "2025-10-08"
      },
      "lifecycle": {
        "state": "active",
        "retention": "permanent"
      },
      "checksum": "sha256:abc123...",
      "embedded_metadata_present": true
    }
  },
  
  "indexes": {
    "by_tier": {
      "1": ["context/system-design/storage.md", "context/system-design/api-patterns.md"],
      "2": ["context/services/user-service.md"],
      "3": ["context/styles/naming-conventions.md"],
      "4": ["context/temp/sprint-notes.md"],
      "5": ["learning/error-patterns.md"]
    },
    "by_state": {
      "active": ["context/system-design/storage.md", "..."],
      "review": ["context/services/old-service.md"],
      "archive": []
    },
    "by_health": {
      "healthy": ["context/system-design/storage.md", "..."],
      "warning": ["context/services/stale-service.md"],
      "action_required": ["context/business-logic/deprecated-rule.md"]
    },
    "by_tag": {
      "storage": ["context/system-design/storage.md", "..."],
      "database": ["context/system-design/storage.md", "..."],
      "authentication": ["context/system-design/authentication.md", "..."]
    }
  },
  
  "quality_summary": {
    "healthy_files": 142,
    "warning_files": 12,
    "action_required_files": 2,
    "overall_health_score": 87
  }
}
```

**Usage**:
```
Fast Queries:
- "Show all Tier 1 files" → indexes.by_tier["1"] (instant)
- "Files needing review" → indexes.by_state["review"] (instant)
- "Health summary" → quality_summary (instant)
- NO XML PARSING NEEDED
```

#### Embedded XML Metadata (SECONDARY)

**Location**: Top of each context file

```xml
<!-- context/system-design/storage.md -->

<?xml version="1.0" encoding="UTF-8"?>
<context_file>

<!-- METADATA (Managed by Governance Agents) -->
<metadata>
  <admin>
    <created>2025-01-15</created>
    <created_by>john.doe@company.com</created_by>
    <owner>platform-team-lead</owner>
    <last_modified>2025-07-15</last_modified>
    <modified_by>jane.smith@company.com</modified_by>
    <next_review>2026-01-09</next_review>
  </admin>
  
  <classification>
    <tier>1</tier>
    <category>system-design</category>
    <sensitivity>internal</sensitivity>
    <tags>storage,database,persistence,postgresql</tags>
  </classification>
  
  <quality>
    <health_score>22</health_score>
    <accuracy_score>5</accuracy_score>
    <completeness_score>4</completeness_score>
    <timeliness_score>3</timeliness_score>
    <validity_score>5</validity_score>
    <last_validated>2025-10-09</last_validated>
  </quality>
  
  <usage>
    <access_count_30d>45</access_count_30d>
    <access_count_90d>132</access_count_90d>
    <last_accessed>2025-10-08</last_accessed>
  </usage>
  
  <lifecycle>
    <state>active</state>
    <retention>permanent</retention>
  </lifecycle>
</metadata>

<!-- CONTENT (Managed by Humans/Main Orchestrator) -->
<system_design category="storage">
  <overview>Data persistence patterns and database conventions</overview>
  
  <patterns>
    <!-- Pattern definitions here -->
  </patterns>
  
  <related>
    <see>@context/services/CATALOG.md</see>
  </related>
</system_design>

</context_file>
```

### Metadata Synchronization Strategy

**Write Operation** (Human or Agent Updates File):
```
1. Update embedded XML metadata in file
2. Calculate checksum of file
3. Update metadata-index.json entry
4. Update indexes (by_tier, by_tag, etc.)
5. Write both atomically
```

**Read Operation** (Agent Queries Metadata):
```
1. Query metadata-index.json (FAST - no file I/O)
2. Return metadata
```

**Read Operation** (Agent Loads File Content):
```
1. Query metadata-index.json for file info
2. Load file content
3. Verify checksum matches
4. If mismatch: Re-sync from file (embedded XML wins)
```

**Nightly Sync Job**:
```
1. Scan all context files
2. Parse embedded XML metadata
3. Compare with metadata-index.json
4. If mismatch: File wins, update JSON
5. Recalculate all indexes
6. Log any discrepancies
7. Update sync_status
```

---

## Step 2: Agent Communication Protocol

### The Problem with Implicit Context

**BAD (Context Loss)**:
```
Main Orchestrator → Context Manager: "validate authentication.md"
Context Manager → Quality Validator: "validate authentication.md"

❌ Quality Validator doesn't know:
- WHY it's validating
- What the user task is
- How urgent/important this is
- What to prioritize in validation
```

**GOOD (Explicit Context)**:
```
Main Orchestrator:
  - Creates tmp/context-requests/req-abc123.json
  - Calls Context Manager with request_id="req-abc123"

Context Manager:
  - Reads tmp/context-requests/req-abc123.json (full context)
  - Knows user task, keywords, priority
  - Calls Quality Validator with request_id="req-abc123"

Quality Validator:
  - Reads tmp/context-requests/req-abc123.json
  - Knows WHY it's validating
  - Validates appropriately
  - Updates tmp file with results
```

### Context Request File Structure

**Location**: `.opencode/governance/tmp/context-requests/{request_id}.json`

```json
{
  "request_id": "req-abc123",
  "timestamp": "2025-10-09T14:23:45Z",
  "from_agent": "main-orchestrator",
  
  "task_context": {
    "type": "feature_build",
    "description": "Add password reset feature",
    "user_request": "Allow users to reset their password via email",
    "keywords": ["password", "reset", "authentication", "email"],
    "priority": "normal"
  },
  
  "context_needed": {
    "files_requested": [
      "context/system-design/authentication.md",
      "context/services/user-service.md"
    ],
    "depth": 1,
    "include_learning": true,
    "max_files": 10
  },
  
  "processing_chain": [
    {
      "agent": "main-orchestrator",
      "action": "initiated_request",
      "timestamp": "2025-10-09T14:23:45Z"
    },
    {
      "agent": "context-manager",
      "action": "processing_retrieval",
      "timestamp": "2025-10-09T14:23:46Z",
      "notes": "Found 2 primary files, checking quality"
    },
    {
      "agent": "quality-validator",
      "action": "validating",
      "timestamp": "2025-10-09T14:23:47Z",
      "files_validated": 2,
      "warnings": ["authentication.md is 85 days stale"]
    },
    {
      "agent": "context-manager",
      "action": "completed",
      "timestamp": "2025-10-09T14:23:48Z"
    }
  ],
  
  "result": {
    "status": "completed",
    "files_returned": [
      "context/system-design/authentication.md",
      "context/services/user-service.md",
      "context/system-design/security.md"
    ],
    "warnings": ["authentication.md not updated in 85 days"],
    "estimated_tokens": 1200
  }
}
```

### Communication Protocol Rules

**Rule 1: Every Agent Call Includes Request ID**
```xml
<agent_call>
  <from>context-manager</from>
  <to>quality-validator</to>
  <method>validate_files</method>
  <request_id>req-abc123</request_id>  <!-- ALWAYS INCLUDE -->
  <parameters>
    <files>["authentication.md"]</files>
  </parameters>
</agent_call>
```

**Rule 2: First Action is Always Read Request File**
```python
def quality_validator_process(request_id, files):
    # ALWAYS read request file first
    request = read_json(f"tmp/context-requests/{request_id}.json")
    
    # Now you have full context:
    user_task = request["task_context"]["description"]
    priority = request["task_context"]["priority"]
    
    # Validate appropriately based on context
    if priority == "urgent":
        quick_validation(files)
    else:
        thorough_validation(files)
```

**Rule 3: Update Request File at Each Stage**
```python
def context_manager_process(request_id):
    request = read_json(f"tmp/context-requests/{request_id}.json")
    
    # Do work...
    files = locate_context(request)
    
    # Update request file with progress
    request["processing_chain"].append({
        "agent": "context-manager",
        "action": "located_files",
        "timestamp": now(),
        "files_found": files
    })
    write_json(f"tmp/context-requests/{request_id}.json", request)
    
    # Call subagent with same request_id
    call_quality_validator(request_id, files)
```

**Rule 4: Cleanup Temp Files After Completion**
```python
def main_orchestrator_after_task():
    # Read final result
    result = read_json(f"tmp/context-requests/req-abc123.json")
    
    # Archive for debugging (optional)
    archive(f"tmp/context-requests/req-abc123.json", 
            f"governance/logs/requests/2025-10-09/req-abc123.json")
    
    # Clean up
    delete(f"tmp/context-requests/req-abc123.json")
```

### Workflow State File

**Location**: `.opencode/governance/workflow-state.json`

```json
{
  "workflows": {
    "daily_quality_check": {
      "schedule": "0 2 * * *",
      "last_run": "2025-10-09T02:00:00Z",
      "next_run": "2025-10-10T02:00:00Z",
      "status": "completed",
      "duration_seconds": 45,
      "files_processed": 156
    },
    "weekly_lifecycle_review": {
      "schedule": "0 3 * * 0",
      "last_run": "2025-10-08T03:00:00Z",
      "next_run": "2025-10-15T03:00:00Z",
      "status": "in_progress",
      "checkpoint": {
        "files_processed": 45,
        "files_total": 65,
        "current_file": "context/services/payment-service.md",
        "can_resume": true,
        "checkpoint_file": "tmp/workflow-checkpoints/weekly-lifecycle-2025-10-08.json"
      }
    }
  },
  
  "locks": {
    "metadata_update": {
      "locked": false,
      "locked_by": null,
      "locked_at": null
    },
    "catalog_sync": {
      "locked": false,
      "locked_by": null,
      "locked_at": null
    },
    "quality_validation": {
      "locked": false,
      "locked_by": null,
      "locked_at": null
    }
  }
}
```

**Checkpoint File for Resumable Workflows**:

**Location**: `.opencode/governance/tmp/workflow-checkpoints/weekly-lifecycle-2025-10-08.json`

```json
{
  "workflow_id": "weekly-lifecycle-2025-10-08",
  "started": "2025-10-08T03:00:00Z",
  "current_stage": "review_transitions",
  "files_processed": [
    "context/system-design/storage.md",
    "context/system-design/api-patterns.md",
    "..."
  ],
  "files_remaining": [
    "context/services/payment-service.md",
    "context/services/order-service.md",
    "..."
  ],
  "current_file": "context/services/payment-service.md",
  "results_so_far": {
    "files_needing_review": 5,
    "archive_candidates": 3,
    "temp_expiring": 2
  }
}
```

---

## Step 3: Building the Context Management Agent

### Primary Governance Agent

This is the **main entry point** for all context operations.

```xml
---
description: "Primary context management and governance coordinator"
mode: subagent
temperature: 0.1
tools:
  read: true
  write: true
  edit: true
  glob: true
  grep: true
  task: true
---

# Context Management Agent

<context>
  <system_context>
    Data governance system for context documentation management.
    Uses JSON metadata index for fast queries.
    Uses tmp files for explicit context passing between agents.
  </system_context>
  <specialist_domain>
    Context retrieval, quality management, lifecycle coordination
  </specialist_domain>
  <integration>
    Called by Main Orchestrator when context operations needed.
    Calls governance subagents with explicit request context.
  </integration>
</context>

<role>
  Context Management Specialist responsible for all context data operations,
  quality assurance, lifecycle management, and governance coordination.
  ALWAYS passes full context via tmp files to prevent information loss.
</role>

<task>
  Provide context to agents while maintaining data quality, managing
  lifecycle, and ensuring system health—all with minimal complexity.
  Use JSON metadata index for fast queries.
  Use tmp files for agent communication.
</task>

<core_responsibilities>
  <retrieval>
    <responsibility>Retrieve relevant context for agent tasks</responsibility>
    <method>Query metadata-index.json (fast), catalog-based discovery</method>
    <performance>Fast (< 1 second for 90% of requests using JSON index)</performance>
    <context_passing>Create tmp/context-requests/{request_id}.json with full context</context_passing>
  </retrieval>
  
  <quality_check>
    <responsibility>Check context quality before retrieval</responsibility>
    <method>Query metadata-index.json for health scores</method>
    <action>Flag stale/low-quality context, trigger updates if needed</action>
  </quality_check>
  
  <lifecycle_coordination>
    <responsibility>Coordinate lifecycle transitions</responsibility>
    <when>Scheduled (managed by workflow-state.json)</when>
    <action>Route to lifecycle-manager with request ID</action>
  </lifecycle_coordination>
  
  <update_coordination>
    <responsibility>Coordinate context updates after code changes</responsibility>
    <when>After PR approval (triggered by main orchestrator)</when>
    <action>Analyze changes, update context, update metadata (both XML and JSON)</action>
  </update_coordination>
</core_responsibilities>

<workflow name="ContextRetrieval">
  <step_1>
    <action>Read request file</action>
    <input>tmp/context-requests/{request_id}.json</input>
    <extract>task_description, keywords, priority, user_request</extract>
    <output>Full task context</output>
  </step_1>
  
  <step_2>
    <action>Query metadata-index.json for relevant files</action>
    <method>
      - Search indexes.by_tag for keyword matches
      - Search indexes.by_tier if tier_filter specified
      - Check health scores in metadata
    </method>
    <output>List of candidate files with metadata</output>
    <note>NO XML PARSING - pure JSON query (fast)</note>
  </step_2>
  
  <step_3>
    <action>Quality check using metadata-index.json</action>
    <checks>
      - health_score < 20? → action_required
      - timeliness_score < 3? → stale_warning
      - usage.access_count_90d = 0? → rarely_used_warning
    </checks>
    <decision>
      - quality_good: Proceed to load
      - quality_warning: Load but flag for review
      - quality_poor: Trigger update workflow, use backup if available
    </decision>
    <note>ALL checks from JSON - no file I/O yet</note>
  </step_3>
  
  <step_4>
    <action>Load actual file content (only now)</action>
    <verify>Checksum matches metadata-index.json entry</verify>
    <update>Increment access_count, update last_accessed in JSON index</update>
    <output>File content + metadata</output>
  </step_4>
  
  <step_5>
    <action>Follow @ references (depth 1)</action>
    <method>Load referenced files, query their metadata from JSON index</method>
    <limit>depth=1 to prevent explosion</limit>
  </step_5>
  
  <step_6>
    <action>Update request file with results</action>
    <update>
      - Add processing_chain entry
      - Set result.status = "completed"
      - Set result.files_returned
      - Set result.warnings (if any)
    </update>
    <write>tmp/context-requests/{request_id}.json</write>
  </step_6>
  
  <step_7>
    <action>Return to calling agent</action>
    <output>Context files + metadata + warnings</output>
    <log>Log to governance/logs/access.log</log>
  </step_7>
</workflow>

<workflow name="ContextUpdate">
  <step_1>
    <action>Create update request file</action>
    <file>tmp/context-requests/update-{request_id}.json</file>
    <include>PR diff, changed files, commit message, timestamp</include>
  </step_1>
  
  <step_2>
    <action>Analyze what context needs updating</action>
    <logic>
      - New pattern introduced? → Add to system-design/
      - Service changed? → Update services/{service}.md
      - Business rule changed? → Update business-logic/
      - Error fixed? → Add to learning/error-patterns.md
    </logic>
    <output>List of files to update</output>
  </step_2>
  
  <step_3>
    <action>Update context files</action>
    <for_each>file in files_to_update</for_each>
    <update>
      - Update embedded XML metadata (last_modified, modified_by)
      - Update file content
      - Calculate new checksum
    </update>
  </step_3>
  
  <step_4>
    <action>Update metadata-index.json (PRIMARY)</action>
    <update>
      - Update admin.last_modified
      - Update admin.modified_by
      - Reset quality scores (needs re-validation)
      - Update checksum
      - Recalculate indexes if tier/tags changed
    </update>
    <atomic>Write both file and JSON atomically</atomic>
  </step_4>
  
  <step_5>
    <action>Update catalogs if needed</action>
    <if>Files added or removed</if>
    <call>catalog-maintainer subagent with request_id</call>
  </step_5>
  
  <step_6>
    <action>Trigger quality validation</action>
    <call>quality-validator subagent with request_id</call>
    <async>Run in background, don't block</async>
  </step_6>
  
  <step_7>
    <action>Update request file with results</action>
    <write>tmp/context-requests/update-{request_id}.json</write>
    <return>Summary of updates to main orchestrator</return>
  </step_7>
</workflow>

<integration_interface>
  <retrieval_call>
    <method>get_context</method>
    <input>
      request_id: string (UUID)
      task_description: string
      keywords: array[string]
      tier_filter: array[int] (optional)
      max_files: int (optional, default 10)
    </input>
    <process>
      1. Create tmp/context-requests/{request_id}.json
      2. Query metadata-index.json (fast)
      3. Load files
      4. Update request file with results
    </process>
    <output>
      Read from tmp/context-requests/{request_id}.json:
      - result.files_returned (with content)
      - result.warnings
      - result.estimated_tokens
    </output>
  </retrieval_call>
  
  <update_call>
    <method>update_context_after_pr</method>
    <input>
      request_id: string (UUID)
      pr_number: string
      changed_files: array[string]
      commit_message: string
      diff: string
    </input>
    <process>
      1. Create tmp/context-requests/update-{request_id}.json
      2. Analyze changes
      3. Update files + embedded XML
      4. Update metadata-index.json (PRIMARY)
      5. Update request file with results
    </process>
    <output>
      Read from tmp/context-requests/update-{request_id}.json:
      - result.updated_files
      - result.catalog_updates
      - result.validation_status
    </output>
  </update_call>
  
  <status_call>
    <method>get_system_health</method>
    <input>none</input>
    <process>
      Query metadata-index.json.quality_summary (instant)
    </process>
    <output>
      - overall_health_score
      - healthy_files, warning_files, action_required_files
      - recent_issues from logs
    </output>
  </status_call>
</integration_interface>

<constraints>
  <must>ALWAYS create request file before calling subagents</must>
  <must>ALWAYS pass request_id to subagents</must>
  <must>Query metadata-index.json first (never parse XML for queries)</must>
  <must>Update both embedded XML and JSON index atomically</must>
  <must>Update request file after each major step</must>
  <must>Acquire lock before modifying metadata-index.json</must>
  <must_not>Call subagents without request_id</must_not>
  <must_not>Parse XML files for metadata queries</must_not>
  <must_not>Modify metadata-index.json without lock</must_not>
</constraints>

<output_specifications>
  <to_orchestrator>
    Point to tmp/context-requests/{request_id}.json for full results
  </to_orchestrator>
  
  <to_logs>
    - governance/logs/access.log: All file access
    - governance/logs/changes.log: All metadata updates
    - governance/logs/workflows.log: Workflow execution
  </to_logs>
</output_specifications>
```

---

## Step 4: Specialized Governance Subagents

### 4.1 Quality Validator Agent

```xml
---
description: "Validates context quality against six dimensions"
mode: subagent
temperature: 0.1
---

# Quality Validator Agent

<role>
  Data Quality Specialist expert in the six dimensions of data quality.
  ALWAYS reads request file first to understand validation context.
</role>

<task>
  Validate context files against quality standards and generate
  actionable reports. Updates metadata-index.json with quality scores.
</task>

<process_flow>
  <step_1>
    <action>Read request file for context</action>
    <file>tmp/context-requests/{request_id}.json</file>
    <extract>
      - Why validation requested (user task, priority)
      - Which files to validate
      - Validation depth (quick vs thorough)
    </extract>
  </step_1>
  
  <step_2>
    <action>Load files and current quality scores from JSON index</action>
    <source>metadata-index.json (fast query)</source>
    <extract>Current health_score, last_validated date</extract>
  </step_2>
  
  <step_3>
    <action>Run quality checks</action>
    <accuracy>Check @ references point to existing files</accuracy>
    <completeness>Validate against XML schema, check required sections</completeness>
    <consistency>XML format valid, naming conventions followed</consistency>
    <timeliness>freshness_days = days_since(last_modified)</timeliness>
    <validity>All @ references resolve, links work, XML well-formed</validity>
    <uniqueness>Scan for duplicate content</uniqueness>
  </step_3>
  
  <step_4>
    <action>Calculate quality scores</action>
    <formula>
      accuracy_score: 0-5 (@ references valid)
      completeness_score: 0-5 (% of required sections)
      consistency_score: 0-5 (format compliance)
      timeliness_score: 0-5 (freshness-based: 5 if <30d, 3 if <90d, 1 if >90d)
      validity_score: 0-5 (link/reference validity)
      uniqueness_score: 0-5 (no duplicates = 5)
      
      health_score = sum(all scores)
      max_score = 30
      
      status:
        - health_score >= 25: Healthy
        - health_score 20-24: Warning
        - health_score < 20: Action Required
    </formula>
  </step_4>
  
  <step_5>
    <action>Update metadata-index.json (PRIMARY)</action>
    <lock>Acquire metadata_update lock</lock>
    <update>
      - quality.health_score
      - quality.accuracy_score (through uniqueness_score)
      - quality.last_validated = now()
    </update>
    <also_update>Embedded XML metadata in file</also_update>
    <unlock>Release lock</unlock>
  </step_5>
  
  <step_6>
    <action>Update indexes if health status changed</action>
    <if>File moved from "healthy" to "warning"</if>
    <update>metadata-index.json.indexes.by_health</update>
  </step_6>
  
  <step_7>
    <action>Generate quality report</action>
    <save>governance/quality-reports/validation-{timestamp}.yaml</save>
    <format>
      file: path
      health_score: int/30
      status: healthy|warning|action_required
      quality_dimensions: {dimension: score/5}
      issues: [{dimension, severity, description}]
      recommendations: [string]
    </format>
  </step_7>
  
  <step_8>
    <action>Update request file with results</action>
    <file>tmp/context-requests/{request_id}.json</file>
    <append>
      processing_chain entry:
      - agent: quality-validator
      - action: validation_completed
      - files_validated: count
      - warnings: [list]
    </append>
  </step_8>
</process_flow>

<constraints>
  <must>ALWAYS read request file first</must>
  <must>Update metadata-index.json AND embedded XML</must>
  <must>Acquire lock before updating metadata-index.json</must>
  <must>Update request file with results</must>
  <must_not>Update metadata without lock</must_not>
  <must_not>Call other agents (no circular dependencies)</must_not>
</constraints>
```

### 4.2 Lifecycle Manager Agent

```xml
---
description: "Manages context file lifecycle transitions"
mode: subagent
temperature: 0.1
---

# Lifecycle Manager Agent

<role>
  Lifecycle Management Specialist. Moves files through lifecycle stages.
  ALWAYS reads request file for context.
</role>

<task>
  Move context files through lifecycle stages (CREATE → ACTIVE → 
  REVIEW → ARCHIVE → DELETE) based on rules and thresholds.
  Query metadata-index.json for fast lifecycle queries.
</task>

<process_flow>
  <step_1>
    <action>Read request file for context</action>
    <file>tmp/context-requests/{request_id}.json OR workflow checkpoint</file>
    <extract>
      - Is this scheduled workflow or triggered?
      - What's the priority?
      - Can resume from checkpoint?
    </extract>
  </step_1>
  
  <step_2>
    <action>Query metadata-index.json for lifecycle candidates</action>
    <queries>
      <review_needed>
        WHERE next_review < today
        OR freshness_days > 90
        OR usage.access_count_90d < 5
      </review_needed>
      
      <archive_candidate>
        WHERE lifecycle.state = "active"
        AND usage.access_count_90d = 0
        AND freshness_days > 180
      </archive_candidate>
      
      <delete_candidate>
        WHERE lifecycle.state = "archived"
        AND archived_date > 2 years ago
      </delete_candidate>
    </queries>
    <note>Pure JSON queries - fast, no file I/O</note>
  </step_2>
  
  <step_3>
    <action>Process lifecycle transitions</action>
    <for_each>candidate in candidates</for_each>
    <transition>
      - REVIEW: Notify owner, update next_review
      - ARCHIVE: Move to archive/, update state in JSON+XML
      - DELETE: Get approvals, backup, delete, update catalogs
    </transition>
    <checkpoint>Save progress to workflow checkpoint file after each file</checkpoint>
  </step_3>
  
  <step_4>
    <action>Update metadata-index.json for transitioned files</action>
    <lock>Acquire lifecycle_manager lock</lock>
    <update>
      - lifecycle.state (active → review → archived → deleted)
      - Update indexes.by_state
      - Recalculate quality_summary
    </update>
    <unlock>Release lock</unlock>
  </step_4>
  
  <step_5>
    <action>Generate lifecycle report</action>
    <save>governance/lifecycle-logs/lifecycle-{timestamp}.yaml</save>
    <content>
      - actions_taken: {reviewed, archived, deleted}
      - files_needing_attention: [{file, reason, owner}]
    </content>
  </step_5>
  
  <step_6>
    <action>Update request file or workflow checkpoint</action>
    <write>tmp/context-requests/{request_id}.json</write>
    <include>
      - processing_chain entry
      - result: lifecycle transitions completed
    </include>
  </step_6>
</process_flow>

<constraints>
  <must>Read request file or workflow checkpoint first</must>
  <must>Query metadata-index.json (not files)</must>
  <must>Save checkpoint after each file (resumable)</must>
  <must>Get owner approval before archiving Tier 1</must>
  <must>Get owner + steward approval before delete</must>
  <must>Update both JSON and XML metadata</must>
  <must_not>Process without approval for critical actions</must_not>
</constraints>
```

### 4.3 Metadata Updater Agent

```xml
---
description: "Updates metadata automatically based on events"
mode: subagent
temperature: 0.1
---

# Metadata Updater Agent

<role>
  Metadata Management Specialist. Updates metadata-index.json (PRIMARY)
  and embedded XML (SECONDARY) based on events.
</role>

<task>
  Keep metadata current by updating based on events.
  ALWAYS updates both JSON index and embedded XML.
</task>

<process_flow>
  <step_1>
    <action>Read event from request file</action>
    <file>tmp/context-requests/{request_id}.json</file>
    <extract>
      - event_type (file_accessed, file_modified, quality_check, etc.)
      - file_path
      - event_data (new values)
    </extract>
  </step_1>
  
  <step_2>
    <action>Acquire metadata_update lock</action>
    <check>workflow-state.json.locks.metadata_update</check>
    <set>locked=true, locked_by=metadata-updater, locked_at=now()</set>
  </step_2>
  
  <step_3>
    <action>Load current metadata from JSON index</action>
    <source>metadata-index.json.files[file_path]</source>
    <fast>No file I/O, pure JSON read</fast>
  </step_3>
  
  <step_4>
    <action>Update metadata fields based on event</action>
    <file_accessed>
      - usage.access_count_30d += 1
      - usage.access_count_90d += 1
      - usage.last_accessed = now()
    </file_accessed>
    
    <file_modified>
      - admin.last_modified = now()
      - admin.modified_by = event_data.modified_by
      - quality scores reset (need re-validation)
      - recalculate checksum
    </file_modified>
    
    <quality_check_completed>
      - quality.* = event_data.quality_scores
      - quality.last_validated = now()
    </quality_check_completed>
  </step_4>
  
  <step_5>
    <action>Update metadata-index.json (PRIMARY)</action>
    <write>metadata-index.json.files[file_path]</write>
    <also_update>
      - metadata-index.json.last_updated = now()
      - Recalculate indexes if needed (by_health, by_state)
    </also_update>
  </step_5>
  
  <step_6>
    <action>Update embedded XML metadata in file (SECONDARY)</action>
    <read>file</read>
    <parse>Extract metadata block</parse>
    <update>Update XML fields to match JSON</update>
    <write>file (preserve content, only update metadata)</write>
  </step_6>
  
  <step_7>
    <action>Release lock</action>
    <set>workflow-state.json.locks.metadata_update.locked=false</set>
  </step_7>
  
  <step_8>
    <action>Log update</action>
    <write>governance/logs/changes.log</write>
    <include>timestamp, file, event_type, changes_made</include>
  </step_8>
  
  <step_9>
    <action>Update request file with result</action>
    <file>tmp/context-requests/{request_id}.json</file>
    <append>processing_chain entry: metadata updated</append>
  </step_9>
</process_flow>

<constraints>
  <must>ALWAYS acquire lock before updating</must>
  <must>Update JSON index first (PRIMARY)</must>
  <must>Update embedded XML second (SECONDARY)</must>
  <must>Keep both in sync</must>
  <must>Release lock even if error</must>
  <must_not>Update without lock (race conditions)</must_not>
  <must_not>Leave lock acquired if error</must_not>
</constraints>
```

### 4.4 Catalog Maintainer Agent

```xml
---
description: "Keeps CATALOG.md files synchronized with actual files"
mode: subagent
temperature: 0.1
---

# Catalog Maintainer Agent

<role>
  Catalog Management Specialist. Maintains CATALOG.md accuracy.
  Uses metadata-index.json for fast file listing.
</role>

<task>
  Ensure all CATALOG.md files are accurate and synchronized.
  Query metadata-index.json for fast catalog generation.
</task>

<process_flow>
  <step_1>
    <action>Read request file</action>
    <file>tmp/context-requests/{request_id}.json</file>
    <extract>Which folders to sync (all or specific)</extract>
  </step_1>
  
  <step_2>
    <action>Query metadata-index.json for files by folder</action>
    <query>
      SELECT file_path, classification.tags, admin.owner
      FROM metadata-index.json.files
      WHERE file_path LIKE "context/system-design/%"
      ORDER BY file_path
    </query>
    <note>Fast JSON query, no file I/O needed</note>
  </step_2>
  
  <step_3>
    <action>Load current CATALOG.md</action>
    <parse>Extract file listings table</parse>
  </step_3>
  
  <step_4>
    <action>Compare actual files vs CATALOG listings</action>
    <find>
      - Files in folder but not in CATALOG (add them)
      - Files in CATALOG but not in folder (remove them)
      - File descriptions outdated (update from metadata)
    </find>
  </step_4>
  
  <step_5>
    <action>Update CATALOG.md</action>
    <operations>
      - Add missing files
      - Remove deleted files
      - Update descriptions from metadata-index.json
      - Update "Last Updated" timestamp
      - Sort alphabetically
    </operations>
  </step_5>
  
  <step_6>
    <action>Verify MASTER-CATALOG.md consistency</action>
    <check>Does MASTER-CATALOG reference all folder CATALOGs?</check>
    <update>If new folders, update MASTER-CATALOG</update>
  </step_6>
  
  <step_7>
    <action>Generate sync report</action>
    <save>governance/logs/catalog-sync-{timestamp}.yaml</save>
    <content>
      - catalogs_updated: count
      - files_added: [list]
      - files_removed: [list]
      - inconsistencies_fixed: count
    </content>
  </step_7>
  
  <step_8>
    <action>Update request file</action>
    <file>tmp/context-requests/{request_id}.json</file>
    <append>processing_chain: catalog sync completed</append>
  </step_8>
</process_flow>

<constraints>
  <must>Query metadata-index.json for file lists (fast)</must>
  <must>Update CATALOG.md atomically</must>
  <must>Maintain alphabetical sort</must>
  <must_not>Parse all XML files (use JSON index)</must_not>
</constraints>
```

---

## Step 5: Automated Quality & Lifecycle Workflows

### Unified Workflow Manager

**Single State Machine** instead of multiple separate schedules.

**Location**: `.opencode/governance/workflow-state.json`

```json
{
  "workflows": {
    "maintenance": {
      "schedule": "0 2 * * *",
      "enabled": true,
      "last_run": "2025-10-09T02:00:00Z",
      "next_run": "2025-10-10T02:00:00Z",
      "status": "idle",
      "tasks": {
        "daily_quality_sample": {
          "frequency": "daily",
          "enabled": true,
          "last_run": "2025-10-09T02:00:00Z",
          "duration_seconds": 45
        },
        "weekly_lifecycle_review": {
          "frequency": "weekly",
          "day": "sunday",
          "enabled": true,
          "last_run": "2025-10-08T03:00:00Z",
          "status": "idle"
        },
        "monthly_deep_audit": {
          "frequency": "monthly",
          "day": 1,
          "enabled": true,
          "last_run": "2025-10-01T04:00:00Z",
          "status": "idle"
        }
      }
    }
  },
  
  "locks": {
    "metadata_update": {
      "locked": false,
      "locked_by": null,
      "locked_at": null
    },
    "workflow_execution": {
      "locked": false,
      "locked_by": null,
      "locked_at": null
    }
  }
}
```

### Workflow Execution

```yaml
Workflow: Unified Maintenance (Daily 2:00 AM)

1. Check workflow-state.json:
   - Acquire workflow_execution lock
   - Check which tasks need to run today
   
2. For each task that needs running:
   a. Check if previous run was "in_progress"
   b. If yes: Load checkpoint file, resume from last position
   c. If no: Start fresh
   
3. Execute task:
   a. Create tmp/context-requests/workflow-{task_id}-{date}.json
   b. Call appropriate agent with request_id
   c. Save checkpoint after each major step
   d. Update workflow-state.json.workflows.maintenance.tasks[task].status
   
4. On completion:
   a. Update workflow-state.json
   b. Generate combined report
   c. Clean up tmp files (or archive)
   d. Release lock
   
5. On error/interruption:
   a. Save checkpoint
   b. Set status = "in_progress"
   c. Can resume next run
```

### Daily Tasks

```yaml
Task: daily_quality_sample

Frequency: Every day
Duration: ~45 seconds
Agent: quality-validator

Process:
  1. Create request file: tmp/context-requests/daily-quality-{date}.json
  2. Query metadata-index.json:
     - SELECT random 10% of files
     - Prioritize files not validated in 7+ days
  3. Call quality-validator with request_id
  4. Quality validator:
     - Reads request file
     - Validates files
     - Updates metadata-index.json
     - Updates request file with results
  5. Check results:
     - Any files with health_score < 20? → Alert owner
     - Any broken @ references? → Alert steward
     - Overall health < 80%? → Alert admin
  6. Generate daily report
  7. Update workflow-state.json
```

### Weekly Tasks

```yaml
Task: weekly_lifecycle_review

Frequency: Every Sunday
Duration: ~5 minutes
Agent: lifecycle-manager

Process:
  1. Create request file: tmp/context-requests/weekly-lifecycle-{date}.json
  2. Query metadata-index.json for lifecycle candidates:
     - Files where next_review < today
     - Files with freshness_days > 90
     - Files with usage.access_count_90d < 5
     - Temp files created > 90 days ago
  3. Call lifecycle-manager with request_id
  4. Lifecycle manager:
     - Reads request file
     - Queries JSON index (fast)
     - Processes transitions
     - Saves checkpoint after each file
     - Updates metadata-index.json
     - Updates request file with results
  5. Generate weekly report with action items
  6. Notify owners
  7. Update workflow-state.json
```

### Monthly Tasks

```yaml
Task: monthly_deep_audit

Frequency: First day of month
Duration: ~30 minutes
Agent: quality-validator, catalog-maintainer

Process:
  1. Create request file: tmp/context-requests/monthly-audit-{date}.json
  2. Deep quality audit:
     a. Call quality-validator with ALL files (100%)
     b. Validate everything thoroughly
     c. Update metadata-index.json
     d. Generate comprehensive quality report
  3. Full catalog sync:
     a. Call catalog-maintainer for ALL folders
     b. Verify all CATALOG.md files
     c. Fix inconsistencies
     d. Update MASTER-CATALOG if needed
  4. Metadata cleanup:
     a. Verify JSON index matches embedded XML (sample 20%)
     b. Fix any discrepancies
     c. Standardize tag taxonomy
  5. Generate monthly health dashboard
  6. Update workflow-state.json
```

### Resumable Workflows with Checkpoints

**Example: Weekly lifecycle review interrupted halfway**

```json
// workflow-state.json
{
  "workflows": {
    "maintenance": {
      "tasks": {
        "weekly_lifecycle_review": {
          "status": "in_progress",
          "checkpoint_file": "tmp/workflow-checkpoints/weekly-lifecycle-2025-10-08.json"
        }
      }
    }
  }
}

// tmp/workflow-checkpoints/weekly-lifecycle-2025-10-08.json
{
  "workflow_id": "weekly-lifecycle-2025-10-08",
  "started": "2025-10-08T03:00:00Z",
  "current_stage": "review_transitions",
  "files_processed": 45,
  "files_total": 65,
  "current_file": "context/services/payment-service.md",
  "results_so_far": {
    "files_needing_review": 5,
    "archive_candidates": 3,
    "temp_expiring": 2
  }
}
```

**Next run (Sunday following week)**:
```
1. Check workflow-state.json
2. See weekly_lifecycle_review status = "in_progress"
3. Load checkpoint file
4. Resume from current_file = "context/services/payment-service.md"
5. Process remaining 20 files
6. Complete workflow
7. Update status = "completed"
8. Delete checkpoint file
```

---

## Step 6: Metadata Management

### Metadata Synchronization

**PRIMARY**: metadata-index.json (Fast queries, source of truth for queries)
**SECONDARY**: Embedded XML (Travels with file, backup, source of truth for sync)

### Write Operation (Human or Agent Updates File)

```
1. Update embedded XML metadata in file
   └─ Parse file, update <metadata> block
   
2. Calculate checksum
   └─ sha256(file_content)
   
3. Acquire metadata_update lock
   └─ workflow-state.json.locks.metadata_update = locked
   
4. Update metadata-index.json
   ├─ Update files[path] entry
   ├─ Recalculate indexes if needed
   └─ Update last_updated timestamp
   
5. Write both atomically
   ├─ Write file (embedded XML)
   └─ Write metadata-index.json
   
6. Release lock
   └─ workflow-state.json.locks.metadata_update = unlocked
```

### Query Operation (Agent Needs Metadata)

```
1. Query metadata-index.json
   └─ Pure JSON query, no file I/O
   
2. Return results
   └─ Instant (no parsing, no disk reads)
   
Example queries:
- "All Tier 1 files" → indexes.by_tier["1"] (instant)
- "Files needing review" → indexes.by_state["review"] (instant)
- "Health summary" → quality_summary (instant)
- "Files tagged 'authentication'" → indexes.by_tag["authentication"] (instant)
```

### Nightly Sync Job

```
Task: metadata_sync
Frequency: Every night at 4:00 AM
Duration: ~2 minutes

Process:
  1. Scan all context files
  2. For each file:
     a. Parse embedded XML metadata
     b. Calculate checksum
     c. Compare with metadata-index.json entry
     d. If mismatch:
        - Log discrepancy
        - FILE WINS (embedded XML is source of truth)
        - Update metadata-index.json from file
  3. Recalculate all indexes
  4. Update sync_status in metadata-index.json
  5. Generate sync report
  6. If discrepancies found: Alert admin
```

### Conflict Resolution

**Rule**: Embedded XML (in file) ALWAYS wins on conflict.

```
Scenario: metadata-index.json says health_score=25, 
          but file says health_score=22

Resolution:
  1. Nightly sync detects mismatch
  2. File wins (embedded XML = source of truth)
  3. Update metadata-index.json to health_score=22
  4. Log: "Synced storage.md: health_score 25→22 from file"
  5. Alert: "Metadata out of sync, resolved from files"
```

---

## Complete Workflow Examples

### Example 1: User Requests Feature, Needs Context

```
1. User: "Add password reset to user service"
   ↓
2. Main Orchestrator:
   - Analyzes request
   - Extracts keywords: password, reset, authentication, user
   - Creates tmp/context-requests/req-abc123.json:
     {
       "request_id": "req-abc123",
       "task_context": {
         "description": "Add password reset feature",
         "user_request": "Add password reset to user service",
         "keywords": ["password", "reset", "authentication", "user"],
         "priority": "normal"
       }
     }
   ↓
3. Main Orchestrator → Context Manager:
   - Calls: get_context(request_id="req-abc123")
   ↓
4. Context Manager:
   a. Reads tmp/context-requests/req-abc123.json (FULL CONTEXT)
   b. Queries metadata-index.json.indexes.by_tag["authentication"] (FAST)
   c. Finds: authentication.md, security.md, user-service.md
   d. Queries metadata-index.json for health scores (FAST)
   e. All files healthy, proceed
   f. Loads file content (only now - after metadata queries)
   g. Updates metadata-index.json.files[*].usage.access_count_30d
   h. Updates tmp/context-requests/req-abc123.json:
      {
        "processing_chain": [
          {"agent": "context-manager", "action": "located_files", "count": 3}
        ],
        "result": {
          "status": "completed",
          "files_returned": ["authentication.md", "security.md", "user-service.md"],
          "warnings": [],
          "estimated_tokens": 1200
        }
      }
   ↓
5. Main Orchestrator:
   - Reads tmp/context-requests/req-abc123.json for results
   - Routes to Feature Build Agent with context
   ↓
6. Feature Build Agent:
   - Uses context to build feature
   ↓
7. PR Created, Approved, Merged
   ↓
8. Main Orchestrator → Context Manager:
   - Creates tmp/context-requests/update-def456.json
   - Calls: update_context_after_pr(request_id="update-def456", pr_number="PR-456", ...)
   ↓
9. Context Manager:
   a. Reads tmp/context-requests/update-def456.json
   b. Analyzes diff: authentication logic added
   c. Updates authentication.md (embedded XML + content)
   d. Acquires metadata_update lock
   e. Updates metadata-index.json (PRIMARY)
   f. Releases lock
   g. Triggers quality-validator (async, with request_id)
   h. Updates tmp/context-requests/update-def456.json with results
   ↓
10. Done: Context up-to-date, ready for next request

TOTAL TIME: < 2 seconds (thanks to JSON index)
NO CONTEXT LOSS: All agents read same request file
RESUMABLE: Checkpoint files allow recovery from failures
DEBUGGABLE: Full audit trail in request file
```

### Example 2: Scheduled Maintenance (Weekly)

```
1. Sunday 2:00 AM: Unified maintenance workflow triggers
   ↓
2. Workflow Manager:
   - Checks workflow-state.json
   - Sees weekly_lifecycle_review needs to run
   - Creates tmp/context-requests/weekly-lifecycle-2025-10-15.json
   ↓
3. Calls lifecycle-manager with request_id="weekly-lifecycle-2025-10-15"
   ↓
4. Lifecycle Manager:
   a. Reads tmp/context-requests/weekly-lifecycle-2025-10-15.json
   b. Queries metadata-index.json for lifecycle candidates:
      - WHERE next_review < today → 5 files
      - WHERE freshness_days > 90 → 3 files
      - WHERE usage.access_count_90d < 5 → 2 files
      - Total: 10 files to process
   c. Creates checkpoint: tmp/workflow-checkpoints/weekly-lifecycle-2025-10-15.json
   d. Processes each file:
      - File 1: Notify owner for review
      - File 2: Flag as archive candidate
      - ... (saves checkpoint after each)
   e. Acquires lock, updates metadata-index.json
   f. Releases lock
   g. Updates tmp/context-requests/weekly-lifecycle-2025-10-15.json:
      {
        "result": {
          "files_reviewed": 5,
          "archive_candidates": 3,
          "temp_expiring": 2
        }
      }
   ↓
5. Workflow Manager:
   - Reads results from request file
   - Generates weekly governance report
   - Emails admin with action items
   - Updates workflow-state.json:
     - weekly_lifecycle_review.status = "completed"
     - weekly_lifecycle_review.last_run = "2025-10-15T02:00:00Z"
   - Cleans up checkpoint file
   ↓
6. Done: System maintained, no user involvement

TOTAL TIME: ~5 minutes
RESUMABLE: If interrupted, resumes from checkpoint next run
NO XML PARSING: All queries from metadata-index.json (fast)
```

---

## Keeping It Simple

### Design Philosophy

**Complexity Hidden, Interface Simple**

```
┌────────────────────────────────────────────────────────┐
│            USER / MAIN ORCHESTRATOR                    │
│                                                        │
│  Simple Interface:                                     │
│  - get_context(request_id, task_description)          │
│  - update_context_after_pr(request_id, pr_data)       │
│  - get_system_health()                                │
│                                                        │
│  Creates: tmp/context-requests/{request_id}.json      │
│  Returns: Results from that file                      │
│                                                        │
└────────────────┬───────────────────────────────────────┘
                 │
                 │  Simple interface hides complexity ↓
                 │
┌────────────────▼───────────────────────────────────────┐
│         CONTEXT MANAGEMENT AGENT                       │
│                                                        │
│  Handles:                                              │
│  - Reads request file (full context)                   │
│  - Queries metadata-index.json (fast)                 │
│  - Routes to subagents with request_id                │
│  - Updates request file with results                   │
│                                                        │
└────────────────┬───────────────────────────────────────┘
                 │
         ┌───────┴────────┬────────────┬──────────────┐
         │                │            │              │
    ┌────▼────┐   ┌──────▼──┐   ┌────▼─────┐   ┌───▼──────┐
    │ Quality │   │Lifecycle│   │ Metadata │   │ Catalog  │
    │Validator│   │ Manager │   │ Updater  │   │Maintainer│
    └─────────┘   └─────────┘   └──────────┘   └──────────┘
         ↑              ↑              ↑              ↑
         └──────────────┴──────────────┴──────────────┘
      All read same request file → NO CONTEXT LOSS
      All query metadata-index.json → FAST
      All update request file → AUDIT TRAIL
```

### Key Simplifications

**1. No Context Loss**
- Every agent call includes request_id
- Request ID points to tmp file with FULL context
- No implicit assumptions
- No lazy parameter passing

**2. Fast Queries**
- Query metadata-index.json (JSON), not files (XML)
- Most queries < 10ms (pure JSON, no I/O)
- Load file content only when needed

**3. Resumable Workflows**
- Checkpoint files save progress
- Workflow can resume from any point
- No lost work on interruption

**4. Clear Ownership**
- metadata-index.json = PRIMARY (queries)
- Embedded XML = SECONDARY (backup, sync source)
- File always wins on conflict

**5. No Circular Dependencies**
- Context Manager → Subagents (one way)
- Subagents NEVER call each other
- Subagents NEVER call Context Manager
- Clean hierarchy

### What Makes It Simple

**For Main Orchestrator**:
```
1. Create request file with task context
2. Call Context Manager with request_id
3. Read results from request file
4. Done

NO NEED TO KNOW:
- How metadata is stored
- How quality is checked
- How lifecycle works
- How agents communicate
```

**For Subagents**:
```
1. Receive request_id
2. Read tmp/context-requests/{request_id}.json
3. Have FULL context (no guessing)
4. Do work
5. Update request file with results
6. Done

NO NEED TO KNOW:
- What other agents are doing
- How to coordinate with others
- Complex state management
```

**For Debugging**:
```
1. Check tmp/context-requests/{request_id}.json
2. See full processing_chain
3. See exactly what happened
4. See any errors
5. Done

EASY TO DEBUG:
- Full audit trail in one file
- Timestamps for each step
- Clear agent ownership
- No implicit state
```

---

## Summary

### What We Built

A **simple, robust Data Governance Agent System** that:

✅ **No Context Loss**: Explicit context passing via tmp files  
✅ **Fast Queries**: JSON metadata index (no XML parsing)  
✅ **Resumable Workflows**: Checkpoint files for long-running tasks  
✅ **Clear Communication**: Request files with full audit trail  
✅ **No Circular Dependencies**: Clean agent hierarchy  
✅ **Debuggable**: Full processing chain in request files  
✅ **Simple Integration**: 3 function calls from main orchestrator  

### Key Innovations

1. **Dual Metadata System**: JSON (fast queries) + XML (backup, sync)
2. **Explicit Context Passing**: Tmp files eliminate information loss
3. **State Machine Workflows**: Resumable, debuggable, simple
4. **Request ID Protocol**: Every agent has full context
5. **Lock-Based Concurrency**: Prevent race conditions on metadata updates

### Architecture Highlights

```
SIMPLE:
- Main orchestrator: 3 function calls
- Create request file, call agent, read result
- That's it!

FAST:
- Query JSON index (< 10ms)
- No XML parsing for queries
- Load files only when needed

ROBUST:
- No context loss (explicit passing)
- Resumable workflows (checkpoints)
- Atomic updates (locks)
- Full audit trail (request files)

DEBUGGABLE:
- One file per request
- Full processing chain
- Clear timestamps
- Easy to trace
```

### Next Steps

1. Create directory structure
2. Create metadata-index.json template
3. Create workflow-state.json template
4. Build Context Management Agent
5. Build 4 governance subagents
6. Create nightly sync job
7. Test with real scenarios
8. Monitor and refine

**Result**: Simple, fast, robust context governance system with ZERO context loss.
