import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { AbilitiesPlugin } from '../src/plugin.js'

describe('Agent Attachment', () => {
  let plugin: AbilitiesPlugin

  beforeEach(() => {
    plugin = new AbilitiesPlugin()
  })

  afterEach(() => {
    plugin.cleanup()
  })

  test('should register agent abilities but only return loaded ones', async () => {
    await plugin.initialize(
      { directory: '.', worktree: '.', client: null as any, $: null as any },
      {}
    )

    // Register ability names - note: these abilities don't exist in the plugin
    plugin.registerAgentAbilities('test-agent', ['deploy', 'test-suite'])
    const abilities = plugin.getAgentAbilities('test-agent')

    // Should return 0 because 'deploy' and 'test-suite' abilities aren't loaded
    // This tests that getAgentAbilities only returns abilities that actually exist
    expect(abilities).toHaveLength(0)
  })

  test('should set current agent', async () => {
    await plugin.initialize(
      { directory: '.', worktree: '.', client: null as any, $: null as any },
      {}
    )

    expect(plugin.getCurrentAgent()).toBeUndefined()

    plugin.setCurrentAgent('openagent')
    expect(plugin.getCurrentAgent()).toBe('openagent')

    plugin.setCurrentAgent(undefined)
    expect(plugin.getCurrentAgent()).toBeUndefined()
  })

  test('should check ability-agent compatibility', async () => {
    await plugin.initialize(
      { directory: '.', worktree: '.', client: null as any, $: null as any },
      {}
    )

    expect(plugin.isAbilityAllowedForAgent('nonexistent', 'any-agent')).toBe(false)
  })

  test('should handle agent.changed event', async () => {
    await plugin.initialize(
      { directory: '.', worktree: '.', client: null as any, $: null as any },
      {}
    )

    await plugin.handleEvent({
      event: {
        type: 'agent.changed',
        properties: {
          agent: {
            id: 'test-agent',
            abilities: ['deploy', 'review']
          }
        }
      }
    })

    expect(plugin.getCurrentAgent()).toBe('test-agent')
  })
})

describe('Enforcement Hooks', () => {
  let plugin: AbilitiesPlugin

  beforeEach(() => {
    plugin = new AbilitiesPlugin()
  })

  afterEach(() => {
    plugin.cleanup()
  })

  describe('tool.execute.before', () => {
    test('should allow all tools when no ability is active', async () => {
      await plugin.initialize(
        { directory: '.', worktree: '.', client: null as any, $: null as any },
        {}
      )

      await expect(
        plugin.handleToolExecuteBefore({ tool: 'bash' }, { args: {} })
      ).resolves.toBeUndefined()

      await expect(
        plugin.handleToolExecuteBefore({ tool: 'write' }, { args: {} })
      ).resolves.toBeUndefined()
    })

    test('should always allow status tools', async () => {
      await plugin.initialize(
        { directory: '.', worktree: '.', client: null as any, $: null as any },
        {}
      )

      const alwaysAllowed = ['ability.list', 'ability.status', 'todoread', 'read', 'glob', 'grep']

      for (const tool of alwaysAllowed) {
        await expect(
          plugin.handleToolExecuteBefore({ tool }, { args: {} })
        ).resolves.toBeUndefined()
      }
    })

    test('should respect loose enforcement mode', async () => {
      await plugin.initialize(
        { directory: '.', worktree: '.', client: null as any, $: null as any },
        { abilities: { enforcement: 'loose' } }
      )

      await expect(
        plugin.handleToolExecuteBefore({ tool: 'bash' }, { args: {} })
      ).resolves.toBeUndefined()
    })
  })

  describe('chat.message injection', () => {
    test('should not inject when no ability is active', async () => {
      await plugin.initialize(
        { directory: '.', worktree: '.', client: null as any, $: null as any },
        {}
      )

      const output = {
        parts: [{ type: 'text', text: 'Hello world' }]
      }

      await plugin.handleChatMessage({}, output as any)

      expect(output.parts.length).toBe(1)
      expect(output.parts[0].text).toBe('Hello world')
    })

    test('should not inject when no abilities match keywords', async () => {
      await plugin.initialize(
        { directory: '.', worktree: '.', client: null as any, $: null as any },
        { abilities: { auto_trigger: true } }
      )

      const output = {
        parts: [{ type: 'text', text: 'Please deploy the application' }]
      }

      await plugin.handleChatMessage({}, output as any)

      const syntheticParts = output.parts.filter((p: any) => p.synthetic)
      expect(syntheticParts).toHaveLength(0)
    })
  })

  describe('session.idle', () => {
    test('should return empty when no ability is active', async () => {
      await plugin.initialize(
        { directory: '.', worktree: '.', client: null as any, $: null as any },
        {}
      )

      const result = await plugin.handleSessionIdle()
      expect(result).toEqual({})
    })
  })

  describe('getStepTypeBlockMessage', () => {
    test('should return correct message for each step type', async () => {
      await plugin.initialize(
        { directory: '.', worktree: '.', client: null as any, $: null as any },
        {}
      )

      const getMessage = (plugin as any).getStepTypeBlockMessage.bind(plugin)

      expect(getMessage({ type: 'script', id: 'test' })).toContain('deterministically')
      expect(getMessage({ type: 'agent', id: 'test' })).toContain('agent invocation')
      expect(getMessage({ type: 'approval', id: 'test' })).toContain('approval')
      expect(getMessage({ type: 'skill', id: 'test' })).toContain('skill')
      expect(getMessage({ type: 'workflow', id: 'test' })).toContain('ability')
    })
  })

  describe('getStepInstructions', () => {
    test('should return correct instructions for each step type', async () => {
      await plugin.initialize(
        { directory: '.', worktree: '.', client: null as any, $: null as any },
        {}
      )

      const getInstructions = (plugin as any).getStepInstructions.bind(plugin)

      expect(getInstructions({ type: 'script', id: 'test', run: 'echo hi' }))
        .toContain('Script is executing')

      expect(getInstructions({ type: 'agent', id: 'test', agent: 'reviewer', prompt: 'Review code' }))
        .toContain('Invoke agent "reviewer"')

      expect(getInstructions({ type: 'skill', id: 'test', skill: 'commit' }))
        .toContain('skill "commit"')

      expect(getInstructions({ type: 'approval', id: 'test', prompt: 'Deploy?' }))
        .toContain('Request user approval')

      expect(getInstructions({ type: 'workflow', id: 'test', workflow: 'deploy' }))
        .toContain('nested ability "deploy"')
    })
  })

  describe('buildAbilityContextInjection', () => {
    test('should build correct context for active ability', async () => {
      await plugin.initialize(
        { directory: '.', worktree: '.', client: null as any, $: null as any },
        { abilities: { enforcement: 'strict' } }
      )

      const mockExecution = {
        ability: {
          name: 'test-ability',
          description: 'Test ability',
          steps: [
            { id: 'step1', type: 'script', run: 'echo hi' },
            { id: 'step2', type: 'agent', agent: 'reviewer', prompt: 'Review' }
          ]
        },
        currentStep: { id: 'step1', type: 'script', run: 'echo hi', description: 'Run tests' },
        completedSteps: [],
        status: 'running'
      }

      const buildContext = (plugin as any).buildAbilityContextInjection.bind(plugin)
      const result = buildContext(mockExecution)

      expect(result).toContain('Active Ability: test-ability')
      expect(result).toContain('0/2 steps completed')
      expect(result).toContain('Current Step: step1')
      expect(result).toContain('[STRICT MODE]')
    })

    test('should not show strict mode in normal enforcement', async () => {
      await plugin.initialize(
        { directory: '.', worktree: '.', client: null as any, $: null as any },
        { abilities: { enforcement: 'normal' } }
      )

      const mockExecution = {
        ability: {
          name: 'test-ability',
          description: 'Test ability',
          steps: [{ id: 'step1', type: 'script', run: 'echo hi' }]
        },
        currentStep: { id: 'step1', type: 'script', run: 'echo hi' },
        completedSteps: [],
        status: 'running'
      }

      const buildContext = (plugin as any).buildAbilityContextInjection.bind(plugin)
      const result = buildContext(mockExecution)

      expect(result).not.toContain('[STRICT MODE]')
    })
  })
})
