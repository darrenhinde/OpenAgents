import { describe, test, expect } from 'bun:test'
import { executeAbility } from '../src/executor/index.js'
import type { Ability, ExecutorContext } from '../src/types/index.js'

describe('Context Passing', () => {
  describe('Auto-truncation', () => {
    test('should truncate large outputs when passing to agent steps', async () => {
      let receivedPrompt = ''

      const ability: Ability = {
        name: 'test-truncation',
        description: 'Test output truncation',
        steps: [
          { id: 'generate', type: 'script', run: 'node -e "console.log(\'x\'.repeat(100000))"' },
          { id: 'use', type: 'agent', agent: 'test', prompt: 'Process the output', needs: ['generate'] }
        ]
      }

      const ctx: ExecutorContext = {
        cwd: '/tmp',
        env: {},
        agents: {
          async call(options) { 
            receivedPrompt = options.prompt
            return 'done' 
          },
          async background() { return 'done' }
        }
      }

      const execution = await executeAbility(ability, {}, ctx)

      expect(execution.status).toBe('completed')
      expect(receivedPrompt).toContain('truncated')
    })

    test('should preserve small outputs fully', async () => {
      const smallOutput = 'Hello World'

      const ability: Ability = {
        name: 'test-small',
        description: 'Test small output',
        steps: [
          { id: 'step1', type: 'script', run: `echo "${smallOutput}"` }
        ]
      }

      const ctx: ExecutorContext = {
        cwd: '/tmp',
        env: {}
      }

      const execution = await executeAbility(ability, {}, ctx)

      const step1Result = execution.completedSteps.find(s => s.stepId === 'step1')
      expect(step1Result?.output).toContain(smallOutput)
    })
  })

  describe('Variable Interpolation', () => {
    test('should interpolate input variables', async () => {
      const ability: Ability = {
        name: 'test-interpolation',
        description: 'Test variable interpolation',
        inputs: {
          name: { type: 'string', required: true }
        },
        steps: [
          { id: 'greet', type: 'script', run: 'echo "Hello {{inputs.name}}"' }
        ]
      }

      const ctx: ExecutorContext = {
        cwd: '/tmp',
        env: {}
      }

      const execution = await executeAbility(ability, { name: 'World' }, ctx)

      expect(execution.status).toBe('completed')
    })

    test('should interpolate step outputs', async () => {
      const ability: Ability = {
        name: 'test-step-output',
        description: 'Test step output interpolation',
        steps: [
          { id: 'first', type: 'script', run: 'echo "FirstOutput"' },
          { id: 'second', type: 'script', run: 'echo "Got: {{steps.first.output}}"', needs: ['first'] }
        ]
      }

      const ctx: ExecutorContext = {
        cwd: '/tmp',
        env: {}
      }

      const execution = await executeAbility(ability, {}, ctx)

      expect(execution.status).toBe('completed')
      expect(execution.completedSteps.length).toBe(2)
    })
  })

  describe('Summarization', () => {
    test('should summarize output when summarize flag is set', async () => {
      let secondStepPrompt = ''
      const longOutput = 'Line\n'.repeat(100)

      const ability: Ability = {
        name: 'test-summarize',
        description: 'Test summarization',
        steps: [
          {
            id: 'research',
            type: 'agent',
            agent: 'librarian',
            prompt: 'Research topic',
            summarize: true
          },
          {
            id: 'use',
            type: 'agent',
            agent: 'oracle',
            prompt: 'Use the research',
            needs: ['research']
          }
        ]
      }

      let callCount = 0
      const ctx: ExecutorContext = {
        cwd: '/tmp',
        env: {},
        agents: {
          async call(options) { 
            callCount++
            if (callCount === 2) {
              secondStepPrompt = options.prompt
            }
            return longOutput 
          },
          async background() { return longOutput }
        }
      }

      const execution = await executeAbility(ability, {}, ctx)

      expect(execution.status).toBe('completed')
      expect(secondStepPrompt).toContain('Output Summary')
      expect(secondStepPrompt).toContain('lines omitted')
    })
  })
})

describe('Nested Workflows', () => {
  test('should fail without abilities context', async () => {
    const ability: Ability = {
      name: 'test-nested',
      description: 'Test nested workflow',
      steps: [
        { id: 'nested', type: 'workflow', workflow: 'child-ability' }
      ]
    }

    const ctx: ExecutorContext = {
      cwd: '/tmp',
      env: {}
    }

    const execution = await executeAbility(ability, {}, ctx)

    expect(execution.status).toBe('failed')
    expect(execution.completedSteps[0].error).toContain('not available')
  })

  test('should fail when nested ability not found', async () => {
    const ability: Ability = {
      name: 'test-nested-missing',
      description: 'Test missing nested ability',
      steps: [
        { id: 'nested', type: 'workflow', workflow: 'nonexistent' }
      ]
    }

    const ctx: ExecutorContext = {
      cwd: '/tmp',
      env: {},
      abilities: {
        get: () => undefined,
        execute: async () => ({ 
          id: 'x', 
          ability: ability, 
          inputs: {}, 
          status: 'completed', 
          currentStep: null, 
          currentStepIndex: -1, 
          completedSteps: [], 
          pendingSteps: [], 
          startedAt: Date.now() 
        })
      }
    }

    const execution = await executeAbility(ability, {}, ctx)

    expect(execution.status).toBe('failed')
    expect(execution.completedSteps[0].error).toContain('not found')
  })

  test('should execute nested ability successfully', async () => {
    const childAbility: Ability = {
      name: 'child',
      description: 'Child ability',
      steps: [
        { id: 'child-step', type: 'script', run: 'echo "child done"' }
      ]
    }

    const parentAbility: Ability = {
      name: 'parent',
      description: 'Parent ability',
      steps: [
        { id: 'call-child', type: 'workflow', workflow: 'child' }
      ]
    }

    const ctx: ExecutorContext = {
      cwd: '/tmp',
      env: {},
      abilities: {
        get: (name) => name === 'child' ? childAbility : undefined,
        execute: async (ability, inputs) => {
          return {
            id: 'nested-exec',
            ability,
            inputs,
            status: 'completed',
            currentStep: null,
            currentStepIndex: -1,
            completedSteps: [
              { stepId: 'child-step', status: 'completed', output: 'child done', startedAt: Date.now(), completedAt: Date.now(), duration: 10 }
            ],
            pendingSteps: [],
            startedAt: Date.now(),
            completedAt: Date.now()
          }
        }
      }
    }

    const execution = await executeAbility(parentAbility, {}, ctx)

    expect(execution.status).toBe('completed')
    expect(execution.completedSteps[0].output).toContain('completed successfully')
  })

  test('should pass inputs to nested workflow', async () => {
    let receivedInputs: Record<string, unknown> = {}

    const childAbility: Ability = {
      name: 'child',
      description: 'Child ability',
      inputs: { env: { type: 'string', required: true } },
      steps: [
        { id: 'child-step', type: 'script', run: 'echo "done"' }
      ]
    }

    const parentAbility: Ability = {
      name: 'parent',
      description: 'Parent ability',
      inputs: { environment: { type: 'string', required: true } },
      steps: [
        { 
          id: 'call-child', 
          type: 'workflow', 
          workflow: 'child',
          inputs: { env: '{{inputs.environment}}' }
        }
      ]
    }

    const ctx: ExecutorContext = {
      cwd: '/tmp',
      env: {},
      abilities: {
        get: (name) => name === 'child' ? childAbility : undefined,
        execute: async (ability, inputs) => {
          receivedInputs = inputs
          return {
            id: 'nested-exec',
            ability,
            inputs,
            status: 'completed',
            currentStep: null,
            currentStepIndex: -1,
            completedSteps: [],
            pendingSteps: [],
            startedAt: Date.now(),
            completedAt: Date.now()
          }
        }
      }
    }

    await executeAbility(parentAbility, { environment: 'production' }, ctx)

    expect(receivedInputs.env).toBe('production')
  })
})
