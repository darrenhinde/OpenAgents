import type { Ability, AbilityExecution, ExecutorContext, LoadedAbility, InputValues } from './types/index.js'
import { loadAbilities, listAbilities } from './loader/index.js'
import { validateAbility, validateInputs } from './validator/index.js'
import { executeAbility, formatExecutionResult } from './executor/index.js'
import { ExecutionManager } from './executor/execution-manager.js'

export interface AbilitiesSDKOptions {
  projectDir?: string
  globalDir?: string
  includeGlobal?: boolean
}

export interface AbilityInfo {
  name: string
  description: string
  source: 'project' | 'global'
  triggers?: string[]
  inputCount: number
  stepCount: number
}

export interface ExecutionResult {
  id: string
  status: 'completed' | 'failed' | 'cancelled'
  ability: string
  duration: number
  steps: Array<{
    id: string
    status: string
    duration?: number
    output?: string
    error?: string
  }>
  error?: string
  formatted: string
}

export class AbilitiesSDK {
  private abilities: Map<string, LoadedAbility> = new Map()
  private executionManager: ExecutionManager
  private initialized = false
  private options: AbilitiesSDKOptions

  constructor(options: AbilitiesSDKOptions = {}) {
    this.options = options
    this.executionManager = new ExecutionManager()
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    const loaded = await loadAbilities({
      projectDir: this.options.projectDir,
      globalDir: this.options.globalDir,
      includeGlobal: this.options.includeGlobal ?? true,
    })

    for (const [name, ability] of loaded) {
      this.abilities.set(name, ability)
    }

    this.initialized = true
  }

  async list(): Promise<AbilityInfo[]> {
    await this.initialize()

    return listAbilities(this.abilities).map(item => ({
      name: item.name,
      description: item.description,
      source: item.source,
      triggers: item.triggers,
      inputCount: item.inputCount,
      stepCount: item.stepCount,
    }))
  }

  async get(name: string): Promise<Ability | undefined> {
    await this.initialize()
    return this.abilities.get(name)?.ability
  }

  async validate(name: string): Promise<{ valid: boolean; errors: string[] }> {
    await this.initialize()

    const loaded = this.abilities.get(name)
    if (!loaded) {
      return { valid: false, errors: [`Ability '${name}' not found`] }
    }

    const result = validateAbility(loaded.ability)
    return {
      valid: result.valid,
      errors: result.errors.map(e => `${e.path}: ${e.message}`),
    }
  }

  async execute(
    name: string,
    inputs: InputValues = {},
    context?: Partial<ExecutorContext>
  ): Promise<ExecutionResult> {
    await this.initialize()

    const loaded = this.abilities.get(name)
    if (!loaded) {
      return {
        id: '',
        status: 'failed',
        ability: name,
        duration: 0,
        steps: [],
        error: `Ability '${name}' not found`,
        formatted: `Error: Ability '${name}' not found`,
      }
    }

    const ability = loaded.ability

    const inputErrors = validateInputs(ability, inputs)
    if (inputErrors.length > 0) {
      return {
        id: '',
        status: 'failed',
        ability: name,
        duration: 0,
        steps: [],
        error: `Input validation failed: ${inputErrors.map(e => e.message).join(', ')}`,
        formatted: `Input validation failed:\n${inputErrors.map(e => `- ${e.message}`).join('\n')}`,
      }
    }

    const self = this
    const executorContext: ExecutorContext = {
      cwd: context?.cwd || process.cwd(),
      env: context?.env || {},
      agents: context?.agents,
      skills: context?.skills,
      approval: context?.approval,
      abilities: {
        get: (n: string) => self.abilities.get(n)?.ability,
        execute: async (a: Ability, i: InputValues) => {
          return executeAbility(a, i, executorContext)
        },
      },
      onStepStart: context?.onStepStart,
      onStepComplete: context?.onStepComplete,
      onStepFail: context?.onStepFail,
    }

    try {
      const execution = await this.executionManager.execute(ability, inputs, executorContext)

      return {
        id: execution.id,
        status: execution.status === 'completed' ? 'completed' : execution.status === 'cancelled' ? 'cancelled' : 'failed',
        ability: ability.name,
        duration: execution.completedAt ? execution.completedAt - execution.startedAt : 0,
        steps: execution.completedSteps.map(s => ({
          id: s.stepId,
          status: s.status,
          duration: s.duration,
          output: s.output,
          error: s.error,
        })),
        error: execution.error,
        formatted: formatExecutionResult(execution),
      }
    } catch (error) {
      return {
        id: '',
        status: 'failed',
        ability: name,
        duration: 0,
        steps: [],
        error: error instanceof Error ? error.message : String(error),
        formatted: `Execution error: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  async status(executionId?: string): Promise<{
    active: boolean
    ability?: string
    currentStep?: string
    progress?: string
    status?: string
  }> {
    const execution = executionId
      ? this.executionManager.get(executionId)
      : this.executionManager.getActive()

    if (!execution) {
      return { active: false }
    }

    return {
      active: execution.status === 'running',
      ability: execution.ability.name,
      currentStep: execution.currentStep?.id,
      progress: `${execution.completedSteps.length}/${execution.ability.steps.length}`,
      status: execution.status,
    }
  }

  async cancel(executionId?: string): Promise<boolean> {
    if (executionId) {
      return this.executionManager.cancel(executionId)
    }
    return this.executionManager.cancelActive()
  }

  async waitFor(executionId: string, timeoutMs: number = 300000): Promise<ExecutionResult | null> {
    const startTime = Date.now()

    while (Date.now() - startTime < timeoutMs) {
      const execution = this.executionManager.get(executionId)

      if (!execution) {
        return null
      }

      if (execution.status !== 'running') {
        return {
          id: execution.id,
          status: execution.status === 'completed' ? 'completed' : execution.status === 'cancelled' ? 'cancelled' : 'failed',
          ability: execution.ability.name,
          duration: execution.completedAt ? execution.completedAt - execution.startedAt : 0,
          steps: execution.completedSteps.map(s => ({
            id: s.stepId,
            status: s.status,
            duration: s.duration,
            output: s.output,
            error: s.error,
          })),
          error: execution.error,
          formatted: formatExecutionResult(execution),
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return null
  }

  cleanup(): void {
    this.executionManager.cleanup()
    this.abilities.clear()
    this.initialized = false
  }
}

export function createAbilitiesSDK(options?: AbilitiesSDKOptions): AbilitiesSDK {
  return new AbilitiesSDK(options)
}

export { loadAbilities, listAbilities, validateAbility, validateInputs, executeAbility, formatExecutionResult }
export type { Ability, AbilityExecution, ExecutorContext, LoadedAbility, InputValues }
