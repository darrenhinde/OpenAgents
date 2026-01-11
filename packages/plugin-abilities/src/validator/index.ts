import { z } from 'zod'
import type {
  Ability,
  Step,
  ValidationResult,
  ValidationError,
} from '../types/index.js'

const InputDefinitionSchema = z.object({
  type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
  required: z.boolean().optional(),
  default: z.unknown().optional(),
  description: z.string().optional(),
  pattern: z.string().optional(),
  enum: z.array(z.string()).optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
})

const ValidationConfigSchema = z.object({
  exit_code: z.number().optional(),
  stdout_contains: z.string().optional(),
  stderr_contains: z.string().optional(),
  file_exists: z.string().optional(),
})

const BaseStepSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'Step ID must be lowercase alphanumeric with hyphens'),
  description: z.string().optional(),
  needs: z.array(z.string()).optional(),
  when: z.string().optional(),
  timeout: z.string().optional(),
  on_failure: z.enum(['stop', 'continue', 'retry', 'ask']).optional(),
  max_retries: z.number().optional(),
})

const ScriptStepSchema = BaseStepSchema.extend({
  type: z.literal('script'),
  run: z.string().min(1, 'Script command is required'),
  cwd: z.string().optional(),
  env: z.record(z.string()).optional(),
  validation: ValidationConfigSchema.optional(),
})

const AgentStepSchema = BaseStepSchema.extend({
  type: z.literal('agent'),
  agent: z.string().min(1, 'Agent name is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  context: z.array(z.string()).optional(),
  summarize: z.union([z.boolean(), z.string()]).optional(),
})

const SkillStepSchema = BaseStepSchema.extend({
  type: z.literal('skill'),
  skill: z.string().min(1, 'Skill name is required'),
  inputs: z.record(z.unknown()).optional(),
})

const ApprovalOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
})

const ApprovalStepSchema = BaseStepSchema.extend({
  type: z.literal('approval'),
  prompt: z.string().min(1, 'Approval prompt is required'),
  options: z.array(ApprovalOptionSchema).optional(),
})

const WorkflowStepSchema = BaseStepSchema.extend({
  type: z.literal('workflow'),
  workflow: z.string().min(1, 'Workflow name is required'),
  inputs: z.record(z.unknown()).optional(),
})

const StepSchema = z.discriminatedUnion('type', [
  ScriptStepSchema,
  AgentStepSchema,
  SkillStepSchema,
  ApprovalStepSchema,
  WorkflowStepSchema,
])

const TriggersSchema = z.object({
  keywords: z.array(z.string()).optional(),
  patterns: z.array(z.string()).optional(),
})

const SettingsSchema = z.object({
  timeout: z.string().optional(),
  parallel: z.boolean().optional(),
  enforcement: z.enum(['strict', 'normal', 'loose']).optional(),
  approval: z.enum(['plan', 'checkpoint', 'none']).optional(),
  on_failure: z.enum(['stop', 'continue', 'retry', 'ask']).optional(),
})

const HooksSchema = z.object({
  before: z.array(z.string()).optional(),
  after: z.array(z.string()).optional(),
})

const AbilitySchema = z.object({
  name: z.string().regex(
    /^[a-z0-9-/]+$/,
    'Name must be lowercase alphanumeric with hyphens and slashes'
  ),
  description: z.string().min(1, 'Description is required'),
  version: z.string().optional(),
  triggers: TriggersSchema.optional(),
  inputs: z.record(InputDefinitionSchema).optional(),
  steps: z.array(StepSchema).min(1, 'At least one step is required'),
  settings: SettingsSchema.optional(),
  hooks: HooksSchema.optional(),
  compatible_agents: z.array(z.string()).optional(),
  exclusive_agent: z.string().optional(),
})

function detectCircularDependencies(steps: Step[]): string[] | null {
  const stepIds = new Set(steps.map((s) => s.id))
  const visited = new Set<string>()
  const recursionStack = new Set<string>()
  const path: string[] = []

  function dfs(stepId: string): string[] | null {
    if (recursionStack.has(stepId)) {
      const cycleStart = path.indexOf(stepId)
      return [...path.slice(cycleStart), stepId]
    }

    if (visited.has(stepId)) {
      return null
    }

    visited.add(stepId)
    recursionStack.add(stepId)
    path.push(stepId)

    const step = steps.find((s) => s.id === stepId)
    if (step?.needs) {
      for (const dep of step.needs) {
        const cycle = dfs(dep)
        if (cycle) return cycle
      }
    }

    path.pop()
    recursionStack.delete(stepId)
    return null
  }

  for (const step of steps) {
    const cycle = dfs(step.id)
    if (cycle) return cycle
  }

  return null
}

function validateDependencies(steps: Step[]): ValidationError[] {
  const errors: ValidationError[] = []
  const stepIds = new Set(steps.map((s) => s.id))

  for (const step of steps) {
    if (!step.needs) continue

    for (const dep of step.needs) {
      if (!stepIds.has(dep)) {
        errors.push({
          path: `steps.${step.id}.needs`,
          message: `Dependency '${dep}' does not exist`,
          code: 'MISSING_DEPENDENCY',
        })
      }
    }
  }

  const cycle = detectCircularDependencies(steps)
  if (cycle) {
    errors.push({
      path: 'steps',
      message: `Circular dependency detected: ${cycle.join(' → ')}`,
      code: 'CIRCULAR_DEPENDENCY',
    })
  }

  return errors
}

function validateUniqueIds(steps: Step[]): ValidationError[] {
  const errors: ValidationError[] = []
  const seen = new Set<string>()

  for (const step of steps) {
    if (seen.has(step.id)) {
      errors.push({
        path: `steps.${step.id}`,
        message: `Duplicate step ID '${step.id}'`,
        code: 'DUPLICATE_ID',
      })
    }
    seen.add(step.id)
  }

  return errors
}

export function validateAbility(data: unknown): ValidationResult {
  const schemaResult = AbilitySchema.safeParse(data)

  if (!schemaResult.success) {
    return {
      valid: false,
      errors: schemaResult.error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
        code: 'SCHEMA_ERROR',
      })),
    }
  }

  const ability = schemaResult.data as Ability
  const errors: ValidationError[] = []

  errors.push(...validateUniqueIds(ability.steps))
  errors.push(...validateDependencies(ability.steps))

  if (ability.triggers?.patterns) {
    for (const pattern of ability.triggers.patterns) {
      try {
        new RegExp(pattern)
      } catch {
        errors.push({
          path: 'triggers.patterns',
          message: `Invalid regex pattern: ${pattern}`,
          code: 'INVALID_REGEX',
        })
      }
    }
  }

  if (ability.inputs) {
    for (const [name, input] of Object.entries(ability.inputs)) {
      if (input.pattern) {
        try {
          new RegExp(input.pattern)
        } catch {
          errors.push({
            path: `inputs.${name}.pattern`,
            message: `Invalid regex pattern: ${input.pattern}`,
            code: 'INVALID_REGEX',
          })
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    ability: errors.length === 0 ? ability : undefined,
  }
}

export function validateInputs(
  ability: Ability,
  inputs: Record<string, unknown>
): ValidationError[] {
  const errors: ValidationError[] = []

  if (!ability.inputs) return errors

  for (const [name, definition] of Object.entries(ability.inputs)) {
    const value = inputs[name]

    if (definition.required && value === undefined && definition.default === undefined) {
      errors.push({
        path: `inputs.${name}`,
        message: `Required input '${name}' is missing`,
        code: 'MISSING_INPUT',
      })
      continue
    }

    if (value === undefined) continue

    const expectedType = definition.type
    const actualType = Array.isArray(value) ? 'array' : typeof value

    if (actualType !== expectedType) {
      errors.push({
        path: `inputs.${name}`,
        message: `Expected ${expectedType}, got ${actualType}`,
        code: 'TYPE_MISMATCH',
      })
      continue
    }

    if (expectedType === 'string' && typeof value === 'string') {
      if (definition.pattern && !new RegExp(definition.pattern).test(value)) {
        errors.push({
          path: `inputs.${name}`,
          message: `Value '${value}' does not match pattern '${definition.pattern}'`,
          code: 'PATTERN_MISMATCH',
        })
      }

      if (definition.enum && !definition.enum.includes(value)) {
        errors.push({
          path: `inputs.${name}`,
          message: `Value '${value}' must be one of: ${definition.enum.join(', ')}`,
          code: 'ENUM_MISMATCH',
        })
      }

      if (definition.minLength && value.length < definition.minLength) {
        errors.push({
          path: `inputs.${name}`,
          message: `Value must be at least ${definition.minLength} characters`,
          code: 'MIN_LENGTH',
        })
      }

      if (definition.maxLength && value.length > definition.maxLength) {
        errors.push({
          path: `inputs.${name}`,
          message: `Value must be at most ${definition.maxLength} characters`,
          code: 'MAX_LENGTH',
        })
      }
    }

    if (expectedType === 'number' && typeof value === 'number') {
      if (definition.min !== undefined && value < definition.min) {
        errors.push({
          path: `inputs.${name}`,
          message: `Value must be at least ${definition.min}`,
          code: 'MIN_VALUE',
        })
      }

      if (definition.max !== undefined && value > definition.max) {
        errors.push({
          path: `inputs.${name}`,
          message: `Value must be at most ${definition.max}`,
          code: 'MAX_VALUE',
        })
      }
    }
  }

  return errors
}

export { AbilitySchema, StepSchema }
