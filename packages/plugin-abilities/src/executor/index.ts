import { spawn } from 'child_process'
import type {
  Ability,
  Step,
  ScriptStep,
  AbilityExecution,
  StepResult,
  ExecutorContext,
  InputValues,
} from '../types/index.js'
import { validateInputs } from '../validator/index.js'

/**
 * Minimal Executor - Script Steps Only
 * 
 * Stripped down to prove core concept:
 * - Execute shell commands sequentially
 * - Track step results
 * - Validate exit codes
 * 
 * NO: agent steps, skill steps, approval, workflows, context passing
 */

function generateExecutionId(): string {
  return `exec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function interpolateVariables(text: string, inputs: InputValues): string {
  return text.replace(/\{\{inputs\.(\w+)\}\}/g, (match, name) => {
    const value = inputs[name]
    return value !== undefined ? String(value) : match
  })
}

async function runScript(
  command: string,
  options: { cwd?: string; env?: Record<string, string> }
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const proc = spawn('sh', ['-c', command], {
      cwd: options.cwd || process.cwd(),
      env: { ...process.env, ...options.env },
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    proc.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    proc.on('close', (code) => {
      resolve({ stdout, stderr, exitCode: code ?? 1 })
    })

    proc.on('error', (error) => {
      resolve({ stdout, stderr: error.message, exitCode: 1 })
    })
  })
}

async function executeScriptStep(
  step: ScriptStep,
  execution: AbilityExecution,
  ctx: ExecutorContext
): Promise<StepResult> {
  const startedAt = Date.now()

  const command = interpolateVariables(step.run, execution.inputs)

  console.log(`[abilities] Executing: ${command}`)

  try {
    const result = await runScript(command, {
      cwd: step.cwd || ctx.cwd,
      env: { ...ctx.env, ...step.env },
    })

    // Validate exit code if specified
    let failed = false
    let error: string | undefined

    if (step.validation?.exit_code !== undefined && result.exitCode !== step.validation.exit_code) {
      failed = true
      error = `Exit code ${result.exitCode}, expected ${step.validation.exit_code}`
    }

    return {
      stepId: step.id,
      status: failed ? 'failed' : 'completed',
      output: result.stdout || result.stderr,
      error,
      startedAt,
      completedAt: Date.now(),
      duration: Date.now() - startedAt,
    }
  } catch (err) {
    return {
      stepId: step.id,
      status: 'failed',
      error: err instanceof Error ? err.message : String(err),
      startedAt,
      completedAt: Date.now(),
      duration: Date.now() - startedAt,
    }
  }
}

function buildExecutionOrder(steps: Step[]): Step[] {
  const result: Step[] = []
  const completed = new Set<string>()
  const remaining = [...steps]

  while (remaining.length > 0) {
    const next = remaining.find((step) => {
      if (!step.needs || step.needs.length === 0) return true
      return step.needs.every((dep) => completed.has(dep))
    })

    if (!next) {
      console.error('[abilities] Unable to resolve step order - circular dependency?')
      break
    }

    result.push(next)
    completed.add(next.id)
    remaining.splice(remaining.indexOf(next), 1)
  }

  return result
}

export async function executeAbility(
  ability: Ability,
  inputs: InputValues,
  ctx: ExecutorContext
): Promise<AbilityExecution> {
  // Validate inputs
  const inputErrors = validateInputs(ability, inputs)
  if (inputErrors.length > 0) {
    return {
      id: generateExecutionId(),
      ability,
      inputs,
      status: 'failed',
      currentStep: null,
      currentStepIndex: -1,
      completedSteps: [],
      pendingSteps: ability.steps,
      startedAt: Date.now(),
      completedAt: Date.now(),
      error: `Input validation failed: ${inputErrors.map((e) => e.message).join(', ')}`,
    }
  }

  // Apply defaults
  const resolvedInputs: InputValues = { ...inputs }
  if (ability.inputs) {
    for (const [name, def] of Object.entries(ability.inputs)) {
      if (resolvedInputs[name] === undefined && def.default !== undefined) {
        resolvedInputs[name] = def.default
      }
    }
  }

  // Build execution order based on dependencies
  const orderedSteps = buildExecutionOrder(ability.steps)

  const execution: AbilityExecution = {
    id: generateExecutionId(),
    ability,
    inputs: resolvedInputs,
    status: 'running',
    currentStep: null,
    currentStepIndex: -1,
    completedSteps: [],
    pendingSteps: [...orderedSteps],
    startedAt: Date.now(),
  }

  // Execute steps sequentially
  for (let i = 0; i < orderedSteps.length; i++) {
    const step = orderedSteps[i]
    execution.currentStep = step
    execution.currentStepIndex = i

    console.log(`[abilities] Step ${i + 1}/${orderedSteps.length}: ${step.id}`)

    const result = await executeScriptStep(step as ScriptStep, execution, ctx)
    execution.completedSteps.push(result)
    execution.pendingSteps = execution.pendingSteps.filter((s) => s.id !== step.id)

    if (result.status === 'failed') {
      execution.status = 'failed'
      execution.error = result.error
      execution.completedAt = Date.now()
      return execution
    }
  }

  execution.status = 'completed'
  execution.currentStep = null
  execution.completedAt = Date.now()

  return execution
}

export function formatExecutionResult(execution: AbilityExecution): string {
  const lines: string[] = []

  lines.push(`Ability: ${execution.ability.name}`)
  lines.push(`Status: ${execution.status === 'completed' ? '✅ Complete' : '❌ Failed'}`)

  if (execution.error) {
    lines.push(`Error: ${execution.error}`)
  }

  lines.push('')
  lines.push('Steps:')

  for (const result of execution.completedSteps) {
    const icon = result.status === 'completed' ? '✅' : '❌'
    const duration = result.duration ? ` (${(result.duration / 1000).toFixed(1)}s)` : ''
    lines.push(`  ${icon} ${result.stepId}${duration}`)
    if (result.error) {
      lines.push(`     Error: ${result.error}`)
    }
  }

  const totalDuration = execution.completedAt
    ? ((execution.completedAt - execution.startedAt) / 1000).toFixed(1)
    : 'N/A'
  lines.push('')
  lines.push(`Duration: ${totalDuration}s`)

  return lines.join('\n')
}
