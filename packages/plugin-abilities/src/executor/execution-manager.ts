import type { Ability, AbilityExecution, ExecutorContext } from '../types/index.js'
import { executeAbility } from './index.js'

/**
 * Minimal ExecutionManager
 * 
 * Simplified to track SINGLE execution at a time.
 * No session management, no cleanup timers, no multi-execution.
 * 
 * This is the bare minimum to test the core concept.
 */
export class ExecutionManager {
  private activeExecution: AbilityExecution | null = null

  async execute(
    ability: Ability,
    inputs: Record<string, unknown>,
    ctx: ExecutorContext
  ): Promise<AbilityExecution> {
    // Block concurrent executions
    if (this.activeExecution && this.activeExecution.status === 'running') {
      throw new Error(`Already executing ability: ${this.activeExecution.ability.name}`)
    }

    console.log(`[abilities] Starting execution: ${ability.name}`)
    
    const execution = await executeAbility(ability, inputs, ctx)
    this.activeExecution = execution

    // Clear active if completed/failed
    if (execution.status !== 'running') {
      this.activeExecution = null
    }

    return execution
  }

  getActive(): AbilityExecution | null {
    return this.activeExecution
  }

  cancel(): boolean {
    if (!this.activeExecution) return false
    
    if (this.activeExecution.status === 'running') {
      this.activeExecution.status = 'failed'
      this.activeExecution.error = 'Cancelled by user'
      this.activeExecution.completedAt = Date.now()
      this.activeExecution = null
      return true
    }

    return false
  }

  cleanup(): void {
    this.activeExecution = null
  }
}
