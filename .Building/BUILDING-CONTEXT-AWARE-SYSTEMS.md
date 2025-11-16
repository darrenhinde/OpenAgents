# Building Context-Aware AI Systems: A Complete Guide

## Overview

This guide teaches you how to build sophisticated, context-aware AI systems using `.opencode` folder architecture. While this system was built for content creation, the principles apply to any domain: code generation, data analysis, customer support, research, or process automation.

**What you'll learn:**
- How to split context into modular, reusable files
- How to structure prompts for optimal AI performance
- How to build hierarchical agent systems
- How to manage context flow and prevent information overload
- How to create custom workflows and commands

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Step 1: Foundation - Directory Structure](#step-1-foundation---directory-structure)
3. [Step 2: Prompt Engineering - XML Structure](#step-2-prompt-engineering---xml-structure)
4. [Step 3: Context Splitting](#step-3-context-splitting)
5. [Step 4: Building Your Main Orchestrator](#step-4-building-your-main-orchestrator)
6. [Step 5: Creating Specialized Subagents](#step-5-creating-specialized-subagents)
7. [Step 6: Context Management](#step-6-context-management)
8. [Step 7: Workflows](#step-7-workflows)
9. [Step 8: Custom Commands](#step-8-custom-commands)
10. [Step 9: Integration and Testing](#step-9-integration-and-testing)
11. [Advanced Patterns](#advanced-patterns)
12. [Common Pitfalls](#common-pitfalls)

---

## Core Concepts

### The Problem This Solves

When building AI systems, you face three critical challenges:

1. **Context Overload**: Passing too much information to AI agents leads to confusion and poor performance
2. **Inconsistency**: Without structure, AI agents make different decisions for similar requests
3. **Maintenance**: Scattered prompts and context make systems hard to update and improve

### The Solution: Hierarchical Context-Aware Architecture

```
┌─────────────────────────────────────┐
│    User Request                     │
└───────────┬─────────────────────────┘
            │
┌───────────▼─────────────────────────┐
│  Main Orchestrator Agent            │
│  - Analyzes complexity              │
│  - Allocates context level          │
│  - Routes to specialists            │
└───────────┬─────────────────────────┘
            │
    ┌───────┴────────┬────────────┐
    │                │            │
┌───▼────┐    ┌─────▼──┐    ┌───▼────┐
│Subagent│    │Subagent│    │Subagent│
│   A    │    │   B    │    │   C    │
└────────┘    └────────┘    └────────┘
```

**Key Principles:**
- **Modular Context**: Split knowledge into small, focused files
- **Hierarchical Routing**: Main agent decides which specialists to involve
- **Dynamic Loading**: Only load context needed for specific tasks
- **Stateless Subagents**: Specialists receive complete, explicit instructions

---

## Step 1: Foundation - Directory Structure

### Basic Structure

```
.opencode/
├── agent/                    # Agent definitions
│   ├── main-orchestrator.md # Your primary agent
│   └── subagents/           # Specialized agents
│       ├── specialist-a.md
│       ├── specialist-b.md
│       └── specialist-c.md
│
├── context/                 # Knowledge base
│   ├── domain/             # Domain-specific knowledge
│   ├── processes/          # Step-by-step workflows
│   ├── standards/          # Quality standards and rules
│   └── templates/          # Reusable structures
│
├── command/                # Custom slash commands
│   ├── primary-workflow.md
│   └── utility-commands.md
│
└── templates/              # System templates
    └── guidelines.md
```

### Design Principles

**1. Separation of Concerns**
- `agent/` = Who does the work (prompts and instructions)
- `context/` = What they need to know (knowledge and data)
- `command/` = How users interact (entry points)
- `templates/` = System patterns (reusable structures)

**2. Modularity**
Each file should serve ONE clear purpose. Bad: `everything.md`. Good: `validation-rules.md`, `format-specs.md`, `quality-checklist.md`

**3. Discoverability**
File names should clearly indicate contents:
- ✅ `user-authentication-workflow.md`
- ❌ `process1.md`

### Example: E-commerce System

```
.opencode/
├── agent/
│   ├── order-orchestrator.md
│   └── subagents/
│       ├── inventory-checker.md
│       ├── payment-processor.md
│       ├── shipping-calculator.md
│       └── notification-sender.md
│
├── context/
│   ├── domain/
│   │   ├── product-catalog.md
│   │   ├── pricing-rules.md
│   │   └── inventory-policies.md
│   ├── processes/
│   │   ├── order-fulfillment.md
│   │   ├── refund-workflow.md
│   │   └── fraud-detection.md
│   └── standards/
│       ├── data-validation.md
│       └── error-handling.md
│
└── command/
    ├── process-order.md
    └── manage-inventory.md
```

---

## Step 2: Prompt Engineering - XML Structure

### Research-Backed Component Order

Research from Stanford and Anthropic shows optimal prompt structure improves performance by 20-40%:

```xml
<!-- OPTIMAL ORDER: Context → Role → Task → Instructions → Output -->

<context>
  <system_context>What system is this part of?</system_context>
  <domain_context>What domain/industry?</domain_context>
  <task_context>What specific job?</task_context>
</context>

<role>
  Clear description of the agent's expertise and responsibility
</role>

<task>
  Specific objective this agent accomplishes
</task>

<instructions>
  <step_1>First do this</step_1>
  <step_2>Then do this</step_2>
  <step_3>Finally this</step_3>
</instructions>

<constraints>
  <must>Always do X</must>
  <must_not>Never do Y</must_not>
</constraints>

<output>
  <format>How to structure the response</format>
  <requirements>What must be included</requirements>
</output>
```

### Component Ratios (Research-Backed)

For optimal performance, maintain these proportions:

```yaml
Role: 5-10% of prompt
Context: 15-25% of prompt
Task: 10-15% of prompt
Instructions: 40-50% of prompt
Examples: 15-20% of prompt (when needed)
Constraints: 5-10% of prompt
```

### XML Best Practices

**1. Use Semantic Tags**
```xml
<!-- Good: Semantic meaning -->
<validation_criteria>
  <mandatory>Field X must be present</mandatory>
  <optional>Field Y is helpful but not required</optional>
</validation_criteria>

<!-- Bad: Generic tags -->
<section1>
  <item>Field X must be present</item>
  <item>Field Y is helpful but not required</item>
</section1>
```

**2. Hierarchical Structure**
```xml
<workflow>
  <stage id="1" name="Validation">
    <action>Validate input data</action>
    <criteria>
      <check>Field completeness</check>
      <check>Data type correctness</check>
    </criteria>
  </stage>
  <stage id="2" name="Processing">
    <action>Transform data</action>
  </stage>
</workflow>
```

**3. Conditional Logic**
```xml
<decision>
  <if test="complexity_simple">Route to fast path</if>
  <else_if test="complexity_moderate">Route to standard path</else_if>
  <else>Route to complex path</else>
</decision>
```

### Example: Code Review Agent

```xml
---
description: "Automated code review with security focus"
mode: subagent
temperature: 0.1
---

# Code Review Agent

<context>
  <system_context>Automated code quality assurance system</system_context>
  <domain_context>Software engineering with security focus</domain_context>
  <task_context>Review pull requests for quality and security issues</task_context>
</context>

<role>
  Expert code reviewer specializing in security vulnerabilities, 
  performance optimization, and maintainability standards
</role>

<task>
  Analyze code changes and provide actionable feedback on quality, 
  security, and best practices compliance
</task>

<instructions>
  <step_1>
    <action>Load code changes from pull request</action>
    <validate>Ensure valid code syntax</validate>
  </step_1>
  
  <step_2>
    <action>Security scan</action>
    <checks>
      <sql_injection>Check for SQL injection vulnerabilities</sql_injection>
      <xss>Scan for XSS attack vectors</xss>
      <secrets>Detect hardcoded secrets or API keys</secrets>
    </checks>
  </step_2>
  
  <step_3>
    <action>Code quality analysis</action>
    <metrics>
      <complexity>Calculate cyclomatic complexity</complexity>
      <duplication>Identify code duplication</duplication>
      <naming>Check naming conventions</naming>
    </metrics>
  </step_3>
  
  <step_4>
    <action>Generate review report</action>
    <prioritization>Critical issues first, then warnings, then suggestions</prioritization>
  </step_4>
</instructions>

<constraints>
  <must>Flag all critical security vulnerabilities</must>
  <must>Provide specific line numbers for issues</must>
  <must>Include code examples for fixes</must>
  <must_not>Approve code with critical security issues</must_not>
  <must_not>Make subjective style comments without basis in standards</must_not>
</constraints>

<output>
  <format>
    ### Security Issues (Critical/High/Medium/Low)
    [List with line numbers and severity]
    
    ### Code Quality Issues
    [Complexity, duplication, naming issues]
    
    ### Recommendations
    [Specific, actionable improvements with examples]
    
    ### Approval Status
    [Approved/Needs Changes/Blocked - with reasoning]
  </format>
</output>
```

---

## Step 3: Context Splitting

### The Context Paradox

**Problem**: AI agents need context to work well, but too much context overwhelms them.

**Solution**: Split context into small, focused files that can be loaded dynamically.

### Context Organization Strategy

**1. Domain Knowledge** (What is true about your domain)
```
context/domain/
├── core-concepts.md        # Fundamental definitions
├── business-rules.md       # Rules that govern operations
├── data-models.md          # Structure of your data
└── terminology.md          # Domain-specific terms
```

**2. Process Knowledge** (How things get done)
```
context/processes/
├── standard-workflow.md    # Normal process flow
├── edge-cases.md          # How to handle exceptions
├── integrations.md        # External system interactions
└── escalation-paths.md    # When/how to escalate
```

**3. Standards & Quality** (What defines good/bad)
```
context/standards/
├── quality-criteria.md     # What makes output acceptable
├── validation-rules.md     # How to validate work
├── error-handling.md      # How to handle failures
└── compliance-req.md      # Regulatory requirements
```

**4. Templates & Patterns** (Reusable structures)
```
context/templates/
├── output-format-A.md     # Standard output format
├── output-format-B.md     # Alternative format
└── common-patterns.md     # Proven solution patterns
```

### File Size Guidelines

**Optimal file size: 50-200 lines**
- Too small (<30 lines): Overhead of many files
- Too large (>300 lines): Hard to maintain, loading overhead
- Sweet spot: 50-200 lines of focused content

### Context Referencing Patterns

**Pattern 1: Direct File References**
```markdown
For pricing calculations, see: `@context/domain/pricing-rules.md`
For validation logic, see: `@context/standards/validation-rules.md`
```

**Pattern 2: Tagged References**
```xml
<context_dependencies>
  <when="new_order">
    <load>context/domain/pricing-rules.md</load>
    <load>context/processes/order-fulfillment.md</load>
    <load>context/standards/validation-rules.md</load>
  </when>
  <when="refund_request">
    <load>context/processes/refund-workflow.md</load>
    <load>context/domain/business-rules.md</load>
  </when>
</context_dependencies>
```

**Pattern 3: Conditional Loading**
```xml
<context_loading>
  <base_context>
    <!-- Always load these -->
    <file>context/domain/core-concepts.md</file>
  </base_context>
  
  <conditional>
    <if test="task_type=analysis">
      <load>context/standards/quality-criteria.md</load>
    </if>
    <if test="complexity=high">
      <load>context/processes/edge-cases.md</load>
    </if>
  </conditional>
</context_loading>
```

### Example: Customer Support System

**Bad Approach** (Single massive file):
```
context/
└── everything.md (2000 lines)
    - All product info
    - All support procedures  
    - All policies
    - All templates
```

**Good Approach** (Split and organized):
```
context/
├── domain/
│   ├── product-catalog.md        # 150 lines
│   ├── customer-segments.md      # 80 lines
│   └── pricing-tiers.md          # 100 lines
│
├── processes/
│   ├── ticket-triage.md          # 120 lines
│   ├── escalation-workflow.md   # 90 lines
│   └── resolution-process.md    # 150 lines
│
├── standards/
│   ├── response-quality.md       # 100 lines
│   ├── sla-requirements.md      # 70 lines
│   └── tone-guidelines.md       # 80 lines
│
└── templates/
    ├── response-templates.md     # 200 lines
    └── email-formats.md         # 100 lines
```

**Loading Strategy**:
```yaml
For "Simple Product Question":
  Load: product-catalog.md, response-templates.md
  Total: ~350 lines (efficient)

For "Complex Technical Issue":  
  Load: product-catalog.md, escalation-workflow.md, 
        resolution-process.md, response-quality.md
  Total: ~460 lines (still manageable)

For "Billing Dispute":
  Load: pricing-tiers.md, customer-segments.md,
        escalation-workflow.md, sla-requirements.md
  Total: ~340 lines (targeted)
```

---

## Step 4: Building Your Main Orchestrator

The main orchestrator is the "brain" that analyzes requests and coordinates specialists.

### Core Responsibilities

```yaml
1. Request Analysis:
   - What is the user trying to accomplish?
   - How complex is this request?
   - What domain knowledge is needed?

2. Context Allocation:
   - What context level is appropriate?
   - Which files need to be loaded?
   - How much information is necessary?

3. Routing Decisions:
   - Can I handle this directly?
   - Which specialists should be involved?
   - In what order should they work?

4. Workflow Management:
   - What's the sequence of steps?
   - Are there dependencies between steps?
   - What validations are needed?

5. Response Integration:
   - How do I combine outputs from specialists?
   - What format does the user expect?
   - Are there follow-up actions?
```

### Orchestrator Template

```xml
---
description: "Main orchestrator for [YOUR SYSTEM]"
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

# [YOUR SYSTEM] Orchestrator

<!-- RESEARCH-BACKED OPTIMAL COMPONENT SEQUENCE -->

<context>
  <system_context>
    [Describe the overall system this orchestrator manages]
  </system_context>
  <domain_context>
    [What industry/domain? Who are the users?]
  </domain_context>
  <task_context>
    [What types of tasks does this orchestrator handle?]
  </task_context>
  <execution_context>
    [How does this orchestrator coordinate work?]
  </execution_context>
</context>

<role>
  [Primary Orchestrator] specializing in [domain] with expertise 
  in [key capabilities]
</role>

<task>
  Transform user requests into completed [outcomes] by intelligently 
  routing work to specialized agents and managing workflow execution
</task>

<workflow name="PrimaryWorkflow">
  <stage id="1" name="Analyze">
    <action>Assess request complexity and requirements</action>
    <decision>
      <if test="simple_request">Handle directly</if>
      <if test="needs_specialist">Route to appropriate subagent</if>
      <if test="multi_step">Plan workflow sequence</if>
    </decision>
    <output>Analysis with routing plan</output>
  </stage>

  <stage id="2" name="ContextAllocation">
    <action>Determine what context is needed</action>
    <levels>
      <level_1>Minimal - task description only</level_1>
      <level_2>Filtered - relevant context files</level_2>
      <level_3>Full - complete system state</level_3>
    </levels>
    <output>Context loading plan</output>
  </stage>

  <stage id="3" name="Execution">
    <action>Execute workflow or route to specialists</action>
    <routing>
      <if test="needs_specialist_a">Route to @subagent-a</if>
      <if test="needs_specialist_b">Route to @subagent-b</if>
    </routing>
    <output>Completed work from all required stages</output>
  </stage>

  <stage id="4" name="Validation">
    <action>Verify quality of output</action>
    <criteria>
      <check>Completeness</check>
      <check>Correctness</check>
      <check>Quality standards</check>
    </criteria>
    <output>Validated output or list of issues</output>
  </stage>

  <stage id="5" name="Finalize">
    <action>Package and deliver results</action>
    <steps>
      <save>Save outputs to appropriate locations</save>
      <log>Record execution metadata</log>
      <respond>Provide clear response to user</respond>
    </steps>
    <output>Final deliverable</output>
  </stage>
</workflow>

<subagents>
  <subagent-a>
    <purpose>Specialized task A</purpose>
    <trigger>When condition X is met</trigger>
    <context>What context level to provide</context>
  </subagent-a>
  
  <subagent-b>
    <purpose>Specialized task B</purpose>
    <trigger>When condition Y is met</trigger>
    <context>What context level to provide</context>
  </subagent-b>
</subagents>

<context_allocation_logic>
  <level_1_triggers>
    - Single domain operation
    - Clear requirements
    - Standard workflow
    - No dependencies
  </level_1_triggers>
  
  <level_2_triggers>
    - Multi-step process
    - Domain knowledge needed
    - Quality validation required
    - Integration points
  </level_2_triggers>
  
  <level_3_triggers>
    - Complex multi-agent coordination
    - Requires historical context
    - High-stakes decisions
    - Extensive state management
  </level_3_triggers>
</context_allocation_logic>

<routing_patterns>
  <pattern name="direct_execution">
    <when>Simple, well-defined request within core capabilities</when>
    <action>Execute directly without routing to specialists</action>
  </pattern>
  
  <pattern name="single_specialist">
    <when>Request clearly maps to one specialist's domain</when>
    <action>Route to specialist with complete, explicit instructions</action>
  </pattern>
  
  <pattern name="sequential_coordination">
    <when>Request requires multiple specialists in sequence</when>
    <action>Execute workflow with hand-offs between specialists</action>
  </pattern>
  
  <pattern name="parallel_execution">
    <when>Multiple independent tasks can run simultaneously</when>
    <action>Route to multiple specialists concurrently</action>
  </pattern>
</routing_patterns>

<output_specifications>
  <to_user>
    - Clear confirmation of what was accomplished
    - Key results or deliverables
    - Next steps or options if applicable
    - File locations if outputs were saved
  </to_user>
  
  <to_system>
    - Execution metadata (timing, agents involved, context used)
    - Quality metrics if applicable
    - Errors or warnings encountered
  </to_system>
</output_specifications>
```

### Complexity Analysis Function

Your orchestrator needs a systematic way to assess request complexity:

```xml
<complexity_analysis>
  <simple>
    <indicators>
      - Single clear objective
      - Standard operation
      - No integration needed
      - Can complete in one step
    </indicators>
    <context>Level 1 - Minimal</context>
    <routing>Direct execution or single specialist</routing>
  </simple>
  
  <moderate>
    <indicators>
      - Multiple steps required
      - Domain knowledge needed
      - Quality validation important
      - Some coordination required
    </indicators>
    <context>Level 2 - Filtered</context>
    <routing>Sequential workflow with specialists</routing>
  </moderate>
  
  <complex>
    <indicators>
      - Multi-agent coordination
      - High stakes or critical
      - Extensive state management
      - Requires historical context
    </indicators>
    <context>Level 3 - Full</context>
    <routing>Comprehensive workflow with validation gates</routing>
  </complex>
</complexity_analysis>
```

### Example: Data Pipeline Orchestrator

```xml
---
description: "Orchestrates data processing pipelines with quality validation"
mode: primary
temperature: 0.2
---

# Data Pipeline Orchestrator

<context>
  <system_context>ETL pipeline management system</system_context>
  <domain_context>Data engineering for analytics platform</domain_context>
  <task_context>Process, transform, and validate data flows</task_context>
</context>

<role>
  Data Pipeline Orchestrator specializing in ETL workflow coordination,
  data quality validation, and error recovery
</role>

<task>
  Transform user requests into executed data pipelines by intelligently
  routing extraction, transformation, and loading tasks to specialized
  agents while ensuring data quality and handling errors
</task>

<workflow name="DataPipelineExecution">
  <stage id="1" name="Analyze">
    <action>Assess data source, transformation needs, and destination</action>
    <decision>
      <if test="standard_schema">Use fast path</if>
      <if test="custom_transformation">Route to transformation specialist</if>
      <if test="data_quality_critical">Add validation steps</if>
    </decision>
  </stage>
  
  <stage id="2" name="Extract">
    <routing>
      <if test="database_source">Route to @database-extractor</if>
      <if test="api_source">Route to @api-extractor</if>
      <if test="file_source">Route to @file-extractor</if>
    </routing>
    <output>Extracted raw data</output>
  </stage>
  
  <stage id="3" name="Transform">
    <action>Apply transformations and business logic</action>
    <routing>
      <if test="simple_mapping">Execute directly</if>
      <if test="complex_logic">Route to @transformation-engine</if>
    </routing>
    <output>Transformed data ready for loading</output>
  </stage>
  
  <stage id="4" name="Validate">
    <action>Verify data quality</action>
    <routing>Route to @data-validator</routing>
    <checkpoints>
      <completeness>All required fields present</completeness>
      <correctness>Data types and formats valid</correctness>
      <consistency>Business rules satisfied</consistency>
    </checkpoints>
    <handling>
      <if test="validation_passed">Proceed to load</if>
      <if test="validation_failed">Log errors and halt</if>
    </handling>
  </stage>
  
  <stage id="5" name="Load">
    <action>Load data into destination</action>
    <routing>
      <if test="database_dest">Route to @database-loader</if>
      <if test="warehouse_dest">Route to @warehouse-loader</if>
    </routing>
    <output>Data successfully loaded</output>
  </stage>
</workflow>

<subagents>
  <database-extractor>
    <purpose>Extract data from SQL databases</purpose>
    <trigger>When source is database</trigger>
    <context>Level 1 - connection params only</context>
  </database-extractor>
  
  <transformation-engine>
    <purpose>Apply complex business logic transformations</purpose>
    <trigger>When transformations are not simple mappings</trigger>
    <context>Level 2 - business rules + data models</context>
  </transformation-engine>
  
  <data-validator>
    <purpose>Validate data quality against standards</purpose>
    <trigger>Always for production pipelines</trigger>
    <context>Level 2 - validation rules + data models</context>
  </data-validator>
</subagents>

<context_allocation>
  <level_1>
    <!-- 70% of cases -->
    - Standard ETL jobs
    - Known schemas
    - Established pipelines
    - No custom logic
  </level_1>
  
  <level_2>
    <!-- 25% of cases -->
    - Custom transformations
    - Data quality critical
    - New data sources
    - Integration points
  </level_2>
  
  <level_3>
    <!-- 5% of cases -->
    - Mission-critical pipelines
    - Complex error recovery
    - Regulatory compliance needs
    - Multi-system coordination
  </level_3>
</context_allocation>
```

---

## Step 5: Creating Specialized Subagents

Subagents are specialists that handle specific tasks with complete, explicit instructions.

### Subagent Design Principles

**1. Single Responsibility**
Each subagent should do ONE thing extremely well.

**2. Statelessness**
Subagents should not maintain state or assume context from previous interactions.

**3. Complete Instructions**
Every call to a subagent must include ALL information needed to complete the task.

**4. Explicit Output Format**
Subagents must know exactly what format to return results in.

### Subagent Template

```xml
---
description: "[Specific task this subagent performs]"
mode: subagent
temperature: 0.1  # Lower temp for consistent specialist behavior
tools:
  read: true   # Only enable tools needed for this specific task
  write: false
  bash: false
  task: false
---

# [Subagent Name]

<context>
  <specialist_domain>[What specific area does this agent specialize in?]</specialist_domain>
  <task_scope>[What specific task does this agent complete?]</task_scope>
  <integration>[How does this fit in the larger system?]</integration>
</context>

<role>
  [Specialist Type] expert with deep knowledge of [specific domain]
</role>

<task>
  [Specific, measurable objective this agent accomplishes]
</task>

<inputs_required>
  <parameter name="param1" type="string">
    Description of what this parameter is and acceptable values
  </parameter>
  <parameter name="param2" type="array">
    Description of array contents and structure
  </parameter>
  <parameter name="param3" type="object">
    Description of object structure and required fields
  </parameter>
</inputs_required>

<inputs_forbidden>
  <!-- Subagents should never receive these -->
  <forbidden>conversation_history</forbidden>
  <forbidden>full_system_state</forbidden>
  <forbidden>unstructured_context</forbidden>
</inputs_forbidden>

<process_flow>
  <step_1>
    <action>First thing to do</action>
    <validation>How to verify this step succeeded</validation>
  </step_1>
  
  <step_2>
    <action>Second thing to do</action>
    <conditions>
      <if test="condition_a">Do option A</if>
      <else>Do option B</else>
    </conditions>
  </step_2>
  
  <step_3>
    <action>Final thing to do</action>
    <output>What to return</output>
  </step_3>
</process_flow>

<constraints>
  <must>Always enforce requirement X</must>
  <must>Always validate parameter Y</must>
  <must_not>Never make assumptions about Z</must_not>
  <must_not>Never proceed if critical data is missing</must_not>
</constraints>

<output_specification>
  <format>
    [Exact structure of output, preferably in YAML or JSON format]
  </format>
  
  <example>
    ```yaml
    status: "success" | "failure" | "partial"
    result:
      field1: value
      field2: value
    metadata:
      execution_time: "2.3s"
      warnings: ["warning 1", "warning 2"]
    ```
  </example>
  
  <error_handling>
    If something goes wrong, return:
    ```yaml
    status: "failure"
    error:
      code: "ERROR_CODE"
      message: "Human-readable error message"
      details: "Specific information about what went wrong"
    ```
  </error_handling>
</output_specification>

<validation_checks>
  <pre_execution>
    - Verify all required inputs are present
    - Validate input formats and types
    - Check that any referenced files exist
  </pre_execution>
  
  <post_execution>
    - Verify output meets specifications
    - Validate any files created or modified
    - Ensure no side effects occurred
  </post_execution>
</validation_checks>
```

### Example Subagents

#### Example 1: SQL Query Generator

```xml
---
description: "Generates optimized SQL queries from natural language"
mode: subagent
temperature: 0.1
---

# SQL Query Generator

<context>
  <specialist_domain>Database query optimization</specialist_domain>
  <task_scope>Generate SQL queries from structured requirements</task_scope>
</context>

<role>
  Database specialist expert in SQL query generation, optimization,
  and security best practices
</role>

<task>
  Transform structured query requirements into optimized, secure
  SQL queries with proper indexing hints and parameter binding
</task>

<inputs_required>
  <parameter name="database_type" type="string">
    Database system: postgresql, mysql, sqlite, sqlserver
  </parameter>
  <parameter name="schema" type="object">
    Schema definition with tables and columns
  </parameter>
  <parameter name="requirements" type="object">
    Query requirements: select_fields, from_tables, where_conditions,
    join_conditions, group_by, order_by, limit
  </parameter>
  <parameter name="optimization_level" type="string">
    fast_execution or readable_code
  </parameter>
</inputs_required>

<process_flow>
  <step_1>
    <action>Validate schema and requirements compatibility</action>
    <checks>
      - All referenced tables exist in schema
      - All columns exist in their respective tables
      - Data types are compatible for comparisons
    </checks>
  </step_1>
  
  <step_2>
    <action>Build SELECT clause</action>
    <logic>
      IF requirements.select_fields = "*": SELECT *
      ELSE: SELECT specific fields with table prefixes
    </logic>
  </step_2>
  
  <step_3>
    <action>Build FROM and JOIN clauses</action>
    <logic>
      - Start with primary table
      - Add JOINs in order that minimizes intermediate result size
      - Use INNER/LEFT/RIGHT based on requirements
    </logic>
  </step_3>
  
  <step_4>
    <action>Build WHERE clause with parameter binding</action>
    <security>
      - NEVER concatenate user input directly
      - ALWAYS use parameter binding: WHERE field = ?
      - Validate and sanitize all inputs
    </security>
  </step_4>
  
  <step_5>
    <action>Add optimization hints if requested</action>
    <conditions>
      <if test="optimization_level = fast_execution">
        - Add index hints
        - Suggest covering indexes if beneficial
        - Order JOINs for best performance
      </if>
    </conditions>
  </step_5>
</process_flow>

<constraints>
  <must>Use parameter binding for all dynamic values</must>
  <must>Include query execution plan estimation</must>
  <must>Validate SQL injection safety</must>
  <must_not>Concatenate user input into query strings</must_not>
  <must_not>Generate queries that could cause full table scans on large tables</must_not>
</constraints>

<output_specification>
  <format>
    ```yaml
    status: "success"
    query:
      sql: "SELECT ... FROM ... WHERE ..."
      parameters: ["param1", "param2"]
      parameter_types: ["string", "integer"]
    optimization:
      estimated_execution_time: "0.05s"
      recommended_indexes: ["idx_table_column"]
      warnings: ["Potential full table scan on table X"]
    security:
      injection_safe: true
      uses_parameter_binding: true
    ```
  </format>
</output_specification>
```

#### Example 2: Email Validator and Formatter

```xml
---
description: "Validates and formats email content against standards"
mode: subagent
temperature: 0.1
---

# Email Validator and Formatter

<context>
  <specialist_domain>Email content validation and formatting</specialist_domain>
  <task_scope>Ensure emails meet quality, compliance, and deliverability standards</task_scope>
</context>

<role>
  Email specialist expert in deliverability, spam compliance,
  accessibility, and professional communication standards
</role>

<task>
  Validate email content against comprehensive quality standards
  and provide formatted, optimized version ready for sending
</task>

<inputs_required>
  <parameter name="email_content" type="object">
    {
      subject: string,
      body_html: string,
      body_text: string,
      from_address: string,
      reply_to: string (optional),
      cc_bcc: array (optional)
    }
  </parameter>
  <parameter name="email_type" type="string">
    transactional, marketing, notification, or support
  </parameter>
  <parameter name="compliance_requirements" type="array">
    [CAN-SPAM, GDPR, CCPA, etc.]
  </parameter>
</inputs_required>

<process_flow>
  <step_1>
    <action>Validate required compliance elements</action>
    <checks>
      <can_spam>
        - Physical mailing address present
        - Clear unsubscribe mechanism
        - Honest subject line
        - Sender identification clear
      </can_spam>
      <gdpr>
        - Lawful basis for contact documented
        - Privacy policy linked
        - Data handling transparency
      </gdpr>
    </checks>
  </step_1>
  
  <step_2>
    <action>Validate deliverability factors</action>
    <checks>
      <subject_line>
        - Length 40-50 characters (optimal)
        - No spam trigger words
        - Personalization present if applicable
        - No excessive punctuation or caps
      </subject_line>
      <html_content>
        - Responsive design for mobile
        - Images have alt text
        - Proper HTML structure
        - No excessive image-to-text ratio
      </html_content>
      <text_version>
        - Plain text version exists
        - Properly formatted
        - Content matches HTML version
      </text_version>
    </checks>
  </step_2>
  
  <step_3>
    <action>Run spam score analysis</action>
    <spam_checks>
      - Subject line spam keywords
      - Excessive punctuation or caps
      - Suspicious links
      - Image-heavy content
      - Missing unsubscribe
      - Broken links
    </spam_checks>
    <scoring>
      Score 0-10: (10 = high spam likelihood)
      Threshold for warning: 5
      Threshold for rejection: 7
    </scoring>
  </step_3>
  
  <step_4>
    <action>Optimize content</action>
    <optimizations>
      - Compress HTML
      - Inline critical CSS
      - Optimize image references
      - Add tracking parameters if requested
      - Minify whitespace
    </optimizations>
  </step_4>
  
  <step_5>
    <action>Generate validation report</action>
    <output>Comprehensive report with pass/fail/warning for each check</output>
  </step_5>
</process_flow>

<constraints>
  <must>Block sending if critical compliance violations exist</must>
  <must>Validate all URLs are accessible and not blacklisted</must>
  <must>Ensure accessibility standards (WCAG 2.1 AA minimum)</must>
  <must_not>Allow sending without unsubscribe mechanism (marketing emails)</must_not>
  <must_not>Proceed if spam score exceeds threshold</must_not>
</constraints>

<output_specification>
  <format>
    ```yaml
    status: "approved" | "needs_revision" | "rejected"
    validation_results:
      compliance:
        can_spam: { passed: true, issues: [] }
        gdpr: { passed: true, issues: [] }
      deliverability:
        spam_score: 2.5
        issues: ["Subject line could be more engaging"]
        warnings: []
      accessibility:
        wcag_level: "AA"
        issues: ["3 images missing alt text"]
      
    optimized_content:
      subject: "Optimized subject line"
      body_html: "<html>...</html>"
      body_text: "Text version..."
      
    recommendations:
      - priority: "high"
        issue: "Add alt text to images"
        fix: "Provide descriptive alt text for screen readers"
      - priority: "medium"
        issue: "Subject line optimization"
        fix: "Consider: 'Save 20% this week' instead of 'Special offer'"
        
    send_approval:
      approved: true
      conditions: ["Fix alt text before sending"]
    ```
  </format>
</output_specification>
```

---

## Step 6: Context Management

### The Three-Level Context System

Research shows that dynamic context allocation improves efficiency by 60-80% without sacrificing quality.

```yaml
Level 1 - Complete Isolation (70-80% of cases):
  Context: Task description only
  Use for: Simple, well-defined operations
  Performance: 80% reduction in context overhead
  Examples:
    - Format data according to specification
    - Validate input against rules
    - Generate output from template
    
Level 2 - Filtered Context (15-25% of cases):
  Context: Task + relevant domain knowledge
  Use for: Operations requiring domain expertise
  Performance: 60% reduction in context overhead
  Examples:
    - Create content requiring brand alignment
    - Process requests needing business logic
    - Quality validation against standards
    
Level 3 - Full Context (0-5% of cases):
  Context: Task + domain knowledge + historical state
  Use for: Complex multi-step operations
  Performance: Optimized for accuracy over speed
  Examples:
    - Long-running workflows with dependencies
    - High-stakes decisions requiring full context
    - Complex multi-agent coordination
```

### Context Provider Pattern

Create a specialized subagent to intelligently select and deliver context:

```xml
---
description: "Intelligently provides relevant context based on request analysis"
mode: subagent
temperature: 0.1
---

# Context Provider

<context>
  <specialist_domain>Context selection and optimization</specialist_domain>
  <task_scope>Analyze requests and deliver precisely relevant context</task_scope>
</context>

<role>
  Context Intelligence Specialist expert in information architecture
  and cognitive load optimization
</role>

<task>
  Determine optimal context level and deliver precisely the
  information needed for the current task—nothing more, nothing less
</task>

<inputs_required>
  <parameter name="request" type="string">
    The user's original request or task description
  </parameter>
  <parameter name="task_type" type="string">
    Category of task being performed
  </parameter>
  <parameter name="complexity" type="string">
    simple, moderate, or complex
  </parameter>
</inputs_required>

<process_flow>
  <step_1>
    <action>Analyze request complexity</action>
    <factors>
      - Number of steps required
      - Domain knowledge needed
      - Integration points involved
      - Validation requirements
      - Historical context dependence
    </factors>
    <output>Complexity score 1-10</output>
  </step_1>
  
  <step_2>
    <action>Determine context level</action>
    <logic>
      IF complexity_score <= 3 AND single_domain AND no_integrations:
        context_level = 1 (Isolation)
      ELSE IF complexity_score <= 7 AND multi_domain OR validation_needed:
        context_level = 2 (Filtered)
      ELSE:
        context_level = 3 (Full)
    </logic>
  </step_2>
  
  <step_3>
    <action>Select relevant context files</action>
    <selection_logic>
      <!-- Base context (always load) -->
      <base>
        - context/domain/core-concepts.md
      </base>
      
      <!-- Conditional context -->
      <if test="context_level >= 2">
        Load domain-specific knowledge based on task_type
      </if>
      
      <if test="context_level = 3">
        Load historical state and previous interactions
      </if>
    </selection_logic>
  </step_3>
  
  <step_4>
    <action>Return file paths array</action>
    <note>Return paths to files, NOT file contents (orchestrator loads)</note>
  </step_4>
</process_flow>

<output_specification>
  <format>
    ```yaml
    context_level: 1 | 2 | 3
    reasoning: "Why this context level was chosen"
    file_locations:
      - path/to/file1.md
      - path/to/file2.md
      - path/to/file3.md
    estimated_tokens: 1500
    load_priority:
      critical: ["file1.md"]
      important: ["file2.md"]
      optional: ["file3.md"]
    ```
  </format>
</output_specification>

<optimization_principles>
  <principle_1>Prefer lower context levels when possible</principle_1>
  <principle_2>Only escalate to higher levels when necessary</principle_2>
  <principle_3>Return file paths, not file contents</principle_3>
  <principle_4>Prioritize critical context for loading</principle_4>
</optimization_principles>
```

### Context File Organization

```yaml
context/
  core/                  # Always available (Level 1)
    core-concepts.md
    terminology.md
    
  domain/                # Load selectively (Level 2)
    business-rules.md
    data-models.md
    integrations.md
    
  processes/             # Load by workflow (Level 2)
    standard-workflow.md
    edge-cases.md
    escalation-paths.md
    
  standards/             # Load for validation (Level 2)
    quality-criteria.md
    compliance-requirements.md
    validation-rules.md
    
  history/               # Load rarely (Level 3)
    previous-decisions.md
    learned-patterns.md
    optimization-data.md
```

### Dynamic Context Loading Example

**Orchestrator Implementation**:
```xml
<context_management>
  <analyze_request>
    user_request = "Process customer order for premium widget"
    complexity = assess_complexity(user_request)
    # Returns: "moderate" - needs business rules and pricing
  </analyze_request>
  
  <route_to_context_provider>
    context_plan = @context-provider({
      request: user_request,
      task_type: "order_processing",
      complexity: "moderate"
    })
    # Returns:
    # {
    #   context_level: 2,
    #   file_locations: [
    #     "context/core/core-concepts.md",
    #     "context/domain/pricing-rules.md",
    #     "context/domain/inventory-policies.md",
    #     "context/processes/order-fulfillment.md"
    #   ]
    # }
  </route_to_context_provider>
  
  <load_context>
    FOR each file IN context_plan.file_locations:
      context += read_file(file)
    END FOR
  </load_context>
  
  <execute_with_context>
    # Now execute with precisely the context needed
    result = process_order(user_request, context)
  </execute_with_context>
</context_management>
```

---

## Step 7: Workflows

Workflows are reusable process definitions that can be selected and executed dynamically.

### Workflow Template

```markdown
# [Workflow Name]

## Overview
[Brief description of what this workflow accomplishes and when to use it]

<task_context>
  <expert_role>[What expertise is needed for this workflow]</expert_role>
  <mission_objective>[What this workflow achieves]</mission_objective>
</task_context>

<operational_context>
  <tone_framework>[How this workflow should be executed]</tone_framework>
  <audience_level>[Who benefits from this workflow]</audience_level>
</operational_context>

<pre_flight_check>
  <validation_requirements>
    - [Prerequisite 1 that must be true]
    - [Prerequisite 2 that must be true]
    - [Prerequisite 3 that must be true]
  </validation_requirements>
</pre_flight_check>

<process_flow>

### Step 1: [Step Name]
<step_framework>
  <context_dependencies>
    - [Required context file 1]
    - [Required context file 2]
  </context_dependencies>
  
  <action>[What to do in this step]</action>
  
  <decision_tree>
    <if test="[condition]">[Then do this]</if>
    <else_if test="[other condition]">[Do this instead]</else_if>
    <else>[Default action]</else>
  </decision_tree>
  
  <output>[What this step produces]</output>
</step_framework>

### Step 2: [Next Step Name]
<step_framework>
  <!-- Repeat structure -->
</step_framework>

### Step N: [Final Step Name]
<step_framework>
  <action>[Final action]</action>
  <success_criteria>
    - [Criterion 1 for success]
    - [Criterion 2 for success]
  </success_criteria>
</step_framework>

</process_flow>

<guidance_systems>
  <when_to_use>
    - [Scenario 1 where this workflow is appropriate]
    - [Scenario 2 where this workflow is appropriate]
  </when_to_use>
  
  <when_not_to_use>
    - [Scenario where a different workflow would be better]
  </when_not_to_use>
  
  <workflow_escalation>
    <if test="[condition]">Escalate to [other workflow]</if>
  </workflow_escalation>
</guidance_systems>

<post_flight_check>
  <validation_requirements>
    - [Success criterion 1]
    - [Success criterion 2]
    - [Quality check]
  </validation_requirements>
</post_flight_check>

## Context Dependencies Summary
- **Step 1**: file1.md, file2.md
- **Step 2**: file3.md, file4.md
- **Step 3**: file5.md

## Success Metrics
- [Measurable outcome 1]
- [Measurable outcome 2]
- [Time/quality expectation]
```

### Example Workflows

#### Example 1: Customer Onboarding Workflow

```markdown
# Customer Onboarding Workflow

## Overview
Systematic workflow for onboarding new customers with account setup,
initial configuration, welcome communications, and first-use guidance.

<task_context>
  <expert_role>Customer Success Specialist with onboarding expertise</expert_role>
  <mission_objective>Successfully onboard new customer with positive first experience</mission_objective>
</task_context>

<pre_flight_check>
  <validation_requirements>
    - Customer has completed signup form
    - Payment method verified
    - Email address confirmed
  </validation_requirements>
</pre_flight_check>

<process_flow>

### Step 1: Account Provisioning
<step_framework>
  <context_dependencies>
    - context/domain/account-types.md
    - context/domain/service-tiers.md
  </context_dependencies>
  
  <action>Create customer account with appropriate tier and features</action>
  
  <decision_tree>
    <if test="paid_tier = premium">
      Provision all features + priority support
    </if>
    <else_if test="paid_tier = standard">
      Provision standard features
    </else_if>
    <else>
      Provision trial features with 14-day limit
    </else>
  </decision_tree>
  
  <output>Provisioned account with credentials</output>
</step_framework>

### Step 2: Initial Configuration
<step_framework>
  <context_dependencies>
    - context/processes/setup-wizard.md
    - context/templates/default-configs.md
  </context_dependencies>
  
  <action>Guide customer through initial configuration</action>
  
  <substeps>
    <substep_1>Company profile setup</substep_1>
    <substep_2>User preferences configuration</substep_2>
    <substep_3>Integration connections (if applicable)</substep_3>
    <substep_4>Data import (if applicable)</substep_4>
  </substeps>
  
  <output>Configured account ready for use</output>
</step_framework>

### Step 3: Welcome Communications
<step_framework>
  <context_dependencies>
    - context/templates/welcome-email.md
    - context/standards/communication-tone.md
  </context_dependencies>
  
  <action>Send personalized welcome communications</action>
  
  <communications>
    <welcome_email>
      - Thank you for joining
      - Quick start guide link
      - Support contact information
      - Getting started video
    </welcome_email>
    
    <in_app_tour>
      - Feature highlights
      - First task guidance
      - Help resources
    </in_app_tour>
  </communications>
  
  <output>Customer receives welcome materials</output>
</step_framework>

### Step 4: First-Use Guidance
<step_framework>
  <context_dependencies>
    - context/processes/quickstart-tasks.md
  </context_dependencies>
  
  <action>Guide customer to first successful use</action>
  
  <guidance>
    <task_1>Complete first meaningful action</task_1>
    <task_2>Achieve quick win</task_2>
    <task_3>Discover key features</task_3>
  </guidance>
  
  <monitoring>
    Track completion of first-use tasks
    Trigger follow-up if tasks not completed within 48 hours
  </monitoring>
  
  <output>Customer successfully completes first tasks</output>
</step_framework>

### Step 5: Follow-Up Check-In
<step_framework>
  <context_dependencies>
    - context/templates/check-in-email.md
  </context_dependencies>
  
  <action>Send follow-up to ensure satisfaction</action>
  
  <timing>3 days after signup</timing>
  
  <content>
    - How is everything going?
    - Any questions or issues?
    - Resource recommendations based on usage
    - Invitation to schedule call if needed
  </content>
  
  <success_criteria>
    - Customer has completed core tasks
    - No outstanding issues
    - Positive sentiment in response
  </success_criteria>
</step_framework>

</process_flow>

<guidance_systems>
  <when_to_use>
    - Every new customer signup
    - Converting trial to paid
    - Upgrading to higher tier (partial onboarding)
  </when_to_use>
  
  <workflow_escalation>
    <if test="customer_not_responding">Escalate to customer success manager</if>
    <if test="technical_issues">Route to technical support workflow</if>
  </workflow_escalation>
</guidance_systems>

<post_flight_check>
  <validation_requirements>
    - Account fully configured
    - Customer has logged in
    - First-use tasks completed
    - Welcome communications sent
    - No outstanding issues
  </validation_requirements>
</post_flight_check>

## Context Dependencies Summary
- **Step 1**: account-types.md, service-tiers.md
- **Step 2**: setup-wizard.md, default-configs.md
- **Step 3**: welcome-email.md, communication-tone.md
- **Step 4**: quickstart-tasks.md
- **Step 5**: check-in-email.md

## Success Metrics
- Time to first login: < 24 hours
- First-use tasks completed: 100%
- Customer satisfaction: > 8/10
- Support tickets during onboarding: < 1 per customer
```

#### Example 2: Incident Response Workflow

```markdown
# Incident Response Workflow

## Overview
Systematic workflow for detecting, triaging, resolving, and learning
from system incidents and outages.

<task_context>
  <expert_role>Site Reliability Engineer with incident management expertise</expert_role>
  <mission_objective>Minimize incident impact and prevent recurrence</mission_objective>
</task_context>

<pre_flight_check>
  <validation_requirements>
    - Incident has been detected and confirmed
    - Initial severity assessment completed
    - Incident response team notified
  </validation_requirements>
</pre_flight_check>

<process_flow>

### Step 1: Incident Detection and Classification
<step_framework>
  <context_dependencies>
    - context/domain/service-sla.md
    - context/standards/severity-definitions.md
  </context_dependencies>
  
  <action>Confirm incident and classify severity</action>
  
  <severity_classification>
    <sev1>Complete service outage affecting all customers</sev1>
    <sev2>Major functionality degraded, affecting many customers</sev2>
    <sev3>Minor functionality issue, affecting some customers</sev3>
    <sev4>Cosmetic issue or individual customer problem</sev4>
  </severity_classification>
  
  <decision_tree>
    <if test="severity = SEV1">
      - Page on-call engineer immediately
      - Notify incident commander
      - Initiate status page update
      - Start incident Slack channel
    </if>
    <else_if test="severity = SEV2">
      - Notify on-call engineer
      - Start incident tracking
      - Prepare for status update
    </else_if>
    <else>
      - Create ticket in queue
      - Assign to next available engineer
    </else>
  </decision_tree>
  
  <output>Classified incident with assigned responders</output>
</step_framework>

### Step 2: Initial Response and Mitigation
<step_framework>
  <context_dependencies>
    - context/processes/runbooks/{service}.md
    - context/processes/emergency-procedures.md
  </context_dependencies>
  
  <action>Begin immediate mitigation</action>
  
  <response_actions>
    <assess>
      - What is affected?
      - How many customers impacted?
      - What is the blast radius?
    </assess>
    
    <mitigate>
      - Can we roll back recent changes?
      - Can we failover to backup systems?
      - Can we implement temporary workaround?
    </mitigate>
    
    <communicate>
      - Update status page
      - Post to incident channel
      - Notify affected customers (for SEV1/SEV2)
    </communicate>
  </response_actions>
  
  <output>Mitigation in progress, communications sent</output>
</step_framework>

### Step 3: Diagnosis and Root Cause Analysis
<step_framework>
  <context_dependencies>
    - context/domain/system-architecture.md
    - context/processes/debugging-procedures.md
  </context_dependencies>
  
  <action>Identify root cause of incident</action>
  
  <investigation>
    <logs>Review application and system logs</logs>
    <metrics>Analyze performance metrics and dashboards</metrics>
    <changes>Review recent deployments and configuration changes</changes>
    <dependencies>Check status of external dependencies</dependencies>
  </investigation>
  
  <documentation>
    Document findings in incident channel in real-time
  </documentation>
  
  <output>Root cause identified and documented</output>
</step_framework>

### Step 4: Resolution and Recovery
<step_framework>
  <context_dependencies>
    - context/processes/deployment-procedures.md
    - context/standards/change-management.md
  </context_dependencies>
  
  <action>Implement fix and verify resolution</action>
  
  <resolution_steps>
    <implement_fix>
      - Deploy fix to production
      - OR roll back to last known good state
      - OR implement permanent workaround
    </implement_fix>
    
    <verify>
      - Confirm metrics return to normal
      - Verify functionality restored
      - Test affected features
      - Confirm with impacted customers
    </verify>
    
    <communicate>
      - Update status page to "Resolved"
      - Post resolution to incident channel
      - Send follow-up to affected customers
    </communicate>
  </resolution_steps>
  
  <output>Incident resolved, services restored</output>
</step_framework>

### Step 5: Post-Incident Review
<step_framework>
  <context_dependencies>
    - context/templates/postmortem-template.md
    - context/processes/continuous-improvement.md
  </context_dependencies>
  
  <action>Conduct blameless postmortem</action>
  
  <postmortem_structure>
    <summary>
      - What happened?
      - What was the impact?
      - What was the root cause?
    </summary>
    
    <timeline>
      Detailed timeline of events from detection to resolution
    </timeline>
    
    <contributing_factors>
      What conditions allowed this incident to occur?
    </contributing_factors>
    
    <action_items>
      - Immediate fixes to prevent recurrence
      - Long-term improvements
      - Process changes
      - Assigned owners and due dates
    </action_items>
  </postmortem_structure>
  
  <follow_up>
    - Share postmortem with team
    - Track action items to completion
    - Update runbooks and documentation
  </follow_up>
  
  <success_criteria>
    - Postmortem completed within 48 hours
    - Action items assigned and scheduled
    - Lessons learned shared with team
  </success_criteria>
</step_framework>

</process_flow>

<guidance_systems>
  <when_to_use>
    - Any service disruption or degradation
    - Security incidents
    - Data loss or corruption events
    - SLA breaches
  </when_to_use>
  
  <workflow_escalation>
    <if test="incident_duration > 4_hours">Escalate to engineering leadership</if>
    <if test="data_breach_suspected">Initiate security incident workflow</if>
    <if test="cannot_identify_cause">Bring in additional engineering resources</if>
  </workflow_escalation>
</guidance_systems>

<post_flight_check>
  <validation_requirements>
    - Service fully restored
    - Root cause documented
    - Postmortem completed
    - Action items assigned
    - Status page updated
    - Customer communications sent
  </validation_requirements>
</post_flight_check>

## Context Dependencies Summary
- **Step 1**: service-sla.md, severity-definitions.md
- **Step 2**: runbooks/{service}.md, emergency-procedures.md
- **Step 3**: system-architecture.md, debugging-procedures.md
- **Step 4**: deployment-procedures.md, change-management.md
- **Step 5**: postmortem-template.md, continuous-improvement.md

## Success Metrics
- Mean Time to Detection (MTTD): < 5 minutes
- Mean Time to Resolution (MTTR): < 2 hours (SEV1)
- Postmortem completion: Within 48 hours
- Action item completion: 100% within 30 days
- Incident recurrence: 0%
```

---

## Step 8: Custom Commands

Custom commands provide user-friendly entry points to your system's capabilities.

### Command Template

```markdown
---
agent: [which-agent-handles-this]
description: "[What this command does]"
---

[Brief description of what this command accomplishes]

**Request:** $ARGUMENTS

**Process:**
1. [Step 1 description]
2. [Step 2 description]
3. [Step 3 description]
...

**Options/Flags:**
- `--flag1`: [What this flag does]
- `--flag2`: [What this flag does]

**Examples:**
- [Example 1]
- [Example 2]
- [Example 3]

**Output:**
[What the user should expect to see/receive]
```

### Example Commands

#### Example 1: Data Pipeline Command

```markdown
---
agent: pipeline-orchestrator
description: "Run data pipeline with validation and monitoring"
---

Execute a data pipeline from source to destination with built-in
validation, error handling, and monitoring.

**Request:** $ARGUMENTS

**Process:**
1. **Validate Inputs**: Check that source, transformations, and destination are specified
2. **Load Configuration**: Load pipeline configuration and dependencies
3. **Extract Data**: Pull data from specified source
4. **Transform Data**: Apply transformation logic
5. **Validate Quality**: Run data quality checks
6. **Load Data**: Write to destination
7. **Monitor**: Log metrics and send notifications
8. **Report**: Provide execution summary

**Syntax:**
```bash
/run-pipeline {source} {destination} [--transform {logic}] [--validate] [--dry-run]
```

**Options:**
- `--transform {transformation_name}`: Apply named transformation
- `--validate`: Run data quality validation (recommended)
- `--dry-run`: Test pipeline without writing to destination
- `--schedule {cron}`: Schedule recurring execution
- `--notify {email}`: Send completion notification

**Examples:**
```bash
/run-pipeline database:customers warehouse:customers_fact --validate
/run-pipeline api:orders warehouse:orders_fact --transform enrich_with_products --notify team@company.com
/run-pipeline file:exports/data.csv database:staging --dry-run
```

**Output:**
```yaml
Pipeline Execution Report
========================
Source: database:customers
Destination: warehouse:customers_fact
Status: Success ✓

Metrics:
- Rows extracted: 10,523
- Rows transformed: 10,523
- Rows loaded: 10,523
- Data quality score: 98.5%
- Execution time: 2m 34s

Validation Results:
✓ Schema validation passed
✓ Data type validation passed
✓ Business rule validation passed
⚠ 150 rows flagged for review (null email addresses)

Next Steps:
- Review flagged rows at: logs/pipeline_2024_03_15.log
- Schedule recurring run: /run-pipeline {source} {dest} --schedule "0 2 * * *"
```
```

#### Example 2: Content Generation Command

```markdown
---
agent: content-orchestrator
description: "Generate content for specified platforms"
---

Create optimized content for one or more platforms with brand alignment
and quality validation.

**Request:** $ARGUMENTS

**Process:**
1. **Analyze Request**: Determine platforms, topic, and requirements
2. **Load Context**: Get relevant brand guidelines and platform specs
3. **Generate Content**: Create platform-optimized content
4. **Validate**: Check quality and brand alignment
5. **Refine**: Apply improvements based on validation
6. **Save**: Store content in organized structure
7. **Report**: Show generated content and file locations

**Syntax:**
```bash
/generate-content "{topic}" --platforms {platform1,platform2} [--research] [--validate]
```

**Options:**
- `--platforms {list}`: Target platforms (twitter, linkedin, blog, email)
- `--research`: Include research and data backing
- `--validate`: Run quality validation (recommended for important content)
- `--tone {style}`: Override default brand tone
- `--length {size}`: short, medium, long

**Examples:**
```bash
/generate-content "Product launch announcement" --platforms twitter,linkedin,email
/generate-content "Industry trends analysis" --platforms blog --research --validate
/generate-content "Customer success story" --platforms linkedin,blog --tone professional
```

**Output:**
```markdown
Content Generation Complete ✓
===============================

Topic: Product launch announcement
Platforms: Twitter, LinkedIn, Email

Generated Content:
------------------

📱 Twitter (Thread - 5 tweets)
File: content/2024-03-15/twitter/product-launch.md
Preview: "Excited to announce our new feature that... 🎉"

💼 LinkedIn (Professional Post)
File: content/2024-03-15/linkedin/product-launch.md
Preview: "Today marks an important milestone as we launch..."

✉️ Email (Announcement Email)
File: content/2024-03-15/email/product-launch.md
Subject: "Introducing [Feature]: Transform how you..."

Validation Results:
-------------------
✓ Brand voice alignment: 95%
✓ Platform optimization: 100%
✓ Engagement potential: High
✓ Call-to-action: Clear and compelling

Next Steps:
-----------
1. Review generated content in files above
2. Make any final adjustments
3. Schedule or publish using: /publish {platform} {file}
```
```

---

## Step 9: Integration and Testing

### Testing Your System

**1. Test Agent Prompts in Isolation**
```bash
# Test each agent independently with sample inputs
# Verify they produce expected outputs
# Check they handle errors gracefully
```

**2. Test Context Loading**
```bash
# Verify context files load correctly
# Check that context allocation works
# Validate file paths resolve
```

**3. Test Workflows End-to-End**
```bash
# Run complete workflows
# Verify each step executes correctly
# Check handoffs between agents work
# Validate final outputs
```

**4. Test Edge Cases**
```bash
# Missing inputs
# Invalid data
# Error conditions
# Timeout scenarios
# Large inputs
```

### Integration Checklist

```yaml
Directory Structure:
  ✓ .opencode/ folder created
  ✓ agent/ subfolder with orchestrator and subagents
  ✓ context/ subfolder organized by type
  ✓ command/ subfolder with slash commands
  ✓ templates/ subfolder with guidelines

Agent Configuration:
  ✓ Main orchestrator has workflow stages
  ✓ Subagents have clear input/output specs
  ✓ All agents use XML structure
  ✓ Context allocation logic implemented
  ✓ Routing patterns defined

Context Management:
  ✓ Context files are modular (50-200 lines)
  ✓ Files have clear naming
  ✓ Dependencies documented
  ✓ Context provider implemented
  ✓ Three-level system in place

Workflows:
  ✓ Common workflows documented
  ✓ Context dependencies listed
  ✓ Success criteria defined
  ✓ Error handling specified
  
Commands:
  ✓ Primary commands created
  ✓ Command syntax documented
  ✓ Examples provided
  ✓ Help text clear

Testing:
  ✓ Agents tested individually
  ✓ Workflows tested end-to-end
  ✓ Edge cases handled
  ✓ Error messages helpful
```

---

## Advanced Patterns

### Pattern 1: Progressive Validation

Build quality checks into workflows at multiple stages:

```xml
<validation_gates>
  <pre_execution>
    Validate inputs before starting work
  </pre_execution>
  
  <mid_workflow>
    Check intermediate results meet standards
  </mid_workflow>
  
  <pre_output>
    Validate final output before delivery
  </pre_output>
</validation_gates>
```

### Pattern 2: Adaptive Workflows

Allow workflows to adjust based on intermediate results:

```xml
<adaptive_routing>
  <stage id="2">
    Execute step 2
    IF result.quality_score < 8:
      Route to @quality-enhancer
    ELSE:
      Proceed to step 3
    END IF
  </stage>
</adaptive_routing>
```

### Pattern 3: Context Caching

Cache frequently-used context to improve performance:

```xml
<context_caching>
  <cache_strategy>
    - Cache core concepts (rarely change)
    - Cache workflows (static)
    - DO NOT cache user data (dynamic)
  </cache_strategy>
  
  <cache_invalidation>
    - On file modification
    - On manual cache clear
    - After 24 hours (configurable)
  </cache_invalidation>
</context_caching>
```

### Pattern 4: Parallel Execution

Execute independent tasks concurrently:

```xml
<parallel_execution>
  <when>Tasks have no dependencies</when>
  <how>
    PARALLEL:
      task_a = @subagent-a(input_a)
      task_b = @subagent-b(input_b)
      task_c = @subagent-c(input_c)
    WAIT_ALL
    
    result = integrate(task_a, task_b, task_c)
  </how>
</parallel_execution>
```

### Pattern 5: Learning Systems

Improve system over time by learning from outcomes:

```xml
<learning_system>
  <capture>
    After each execution:
    - What was requested?
    - What context was used?
    - What was the outcome?
    - What was the quality score?
  </capture>
  
  <analyze>
    Periodically:
    - Which context combinations work best?
    - Which workflows are most successful?
    - Which agents are underperforming?
  </analyze>
  
  <optimize>
    Based on analysis:
    - Adjust context allocation rules
    - Refine workflow selection logic
    - Improve agent prompts
  </optimize>
</learning_system>
```

---

## Common Pitfalls

### Pitfall 1: Context Overload

**Problem**: Passing too much context to agents
**Solution**: Implement three-level context system, default to Level 1
**Example**:
```xml
<!-- Bad -->
<pass_to_subagent>
  All conversation history + All context files + All system state
</pass_to_subagent>

<!-- Good -->
<pass_to_subagent>
  Task description + Only required context for this specific task
</pass_to_subagent>
```

### Pitfall 2: Ambiguous Instructions

**Problem**: Subagents receive vague instructions and make assumptions
**Solution**: Always provide complete, explicit instructions
**Example**:
```xml
<!-- Bad -->
"Generate some content about AI"

<!-- Good -->
"Generate a 280-character Twitter post about AI productivity tools 
 for developers, including:
 - Hook about time savings
 - 2-3 specific tool recommendations  
 - Call-to-action to follow
 - Professional but enthusiastic tone"
```

### Pitfall 3: Missing Error Handling

**Problem**: System breaks when encountering errors
**Solution**: Build error handling into every stage
**Example**:
```xml
<error_handling>
  TRY:
    result = execute_task()
  CATCH ValidationError:
    log_error(error)
    return helpful_error_message
  CATCH TimeoutError:
    log_timeout()
    retry_with_simpler_approach()
  CATCH:
    log_unexpected_error()
    escalate_to_human()
</error_handling>
```

### Pitfall 4: Monolithic Files

**Problem**: Huge context files that are hard to maintain
**Solution**: Split into focused 50-200 line files
**Example**:
```
<!-- Bad -->
context/everything.md (3000 lines)

<!-- Good -->
context/domain/products.md (150 lines)
context/domain/pricing.md (100 lines)
context/domain/customers.md (120 lines)
context/processes/sales.md (180 lines)
context/processes/support.md (140 lines)
```

### Pitfall 5: Unclear Success Criteria

**Problem**: System doesn't know when task is complete
**Solution**: Define explicit success criteria for every workflow
**Example**:
```xml
<success_criteria>
  <must_have>
    - Output meets format specifications
    - All required fields present
    - Quality score > 8/10
  </must_have>
  
  <validation>
    IF all must_have criteria met:
      Mark as success
    ELSE:
      Return specific issues to fix
    END IF
  </validation>
</success_criteria>
```

---

## Summary: Building Your System

### Step-by-Step Checklist

```yaml
Phase 1 - Foundation (Week 1):
  ✓ Create .opencode directory structure
  ✓ Define your domain and use cases
  ✓ Identify core agents needed
  ✓ Outline primary workflows

Phase 2 - Core Agents (Week 2):
  ✓ Build main orchestrator
  ✓ Create 2-3 essential subagents
  ✓ Implement basic routing logic
  ✓ Test agents individually

Phase 3 - Context System (Week 3):
  ✓ Organize context into modular files
  ✓ Implement context provider
  ✓ Set up three-level allocation
  ✓ Test context loading

Phase 4 - Workflows (Week 4):
  ✓ Document primary workflows
  ✓ Define context dependencies
  ✓ Implement workflow selection
  ✓ Test end-to-end

Phase 5 - Commands (Week 5):
  ✓ Create custom slash commands
  ✓ Write clear documentation
  ✓ Provide examples
  ✓ Test user experience

Phase 6 - Polish (Week 6):
  ✓ Add error handling
  ✓ Improve error messages
  ✓ Add logging and monitoring
  ✓ Create user guide

Phase 7 - Optimization (Ongoing):
  ✓ Monitor performance
  ✓ Gather user feedback
  ✓ Refine prompts
  ✓ Add new capabilities
```

### Key Principles to Remember

1. **Start Simple**: Build basic functionality first, add complexity gradually
2. **Modular Design**: Small, focused files are easier to maintain
3. **Explicit Instructions**: Never make agents guess or assume
4. **Context Efficiency**: Less context often produces better results
5. **User-Centric**: Design commands for how users think, not how system works
6. **Iterative Improvement**: Systems improve over time with real usage
7. **Document Everything**: Good documentation = maintainable system

---

## Next Steps

**You now understand**:
- How to structure a context-aware AI system
- How to write optimal prompts with XML
- How to split and manage context
- How to build orchestrators and subagents
- How to create workflows and commands
- How to test and integrate components

**Start building**:
1. Define your domain and primary use case
2. Create basic directory structure
3. Build one simple workflow end-to-end
4. Test with real requests
5. Expand and refine

**Get help**:
- Review the existing `.opencode` system as reference
- Start with a simplified version
- Test frequently with actual use cases
- Iterate based on results

**Good luck building your context-aware AI system!**
