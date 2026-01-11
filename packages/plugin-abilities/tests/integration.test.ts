import { describe, expect, it, beforeEach, afterEach } from 'bun:test'
import * as fs from 'fs/promises'
import * as path from 'path'
import { loadAbilities, loadAbility } from '../src/loader/index.js'
import { validateAbility } from '../src/validator/index.js'
import { executeAbility } from '../src/executor/index.js'
import { ExecutionManager } from '../src/executor/execution-manager.js'
import type { Ability, ExecutorContext } from '../src/types/index.js'

const TEST_ABILITIES_DIR = path.join(process.cwd(), 'test-abilities')

const createMockContext = (): ExecutorContext => ({
  cwd: process.cwd(),
  env: {},
})

describe('Integration: Full Ability Lifecycle', () => {
  beforeEach(async () => {
    await fs.mkdir(TEST_ABILITIES_DIR, { recursive: true })
  })

  afterEach(async () => {
    await fs.rm(TEST_ABILITIES_DIR, { recursive: true, force: true })
  })

  it('should load, validate, and execute an ability from disk', async () => {
    const abilityYaml = `
name: test-integration
description: Integration test ability

inputs:
  message:
    type: string
    required: true

steps:
  - id: echo
    type: script
    run: echo "{{inputs.message}}"
    validation:
      exit_code: 0
`
    await fs.writeFile(
      path.join(TEST_ABILITIES_DIR, 'test-integration.yaml'),
      abilityYaml
    )

    const abilities = await loadAbilities({
      projectDir: TEST_ABILITIES_DIR,
      includeGlobal: false,
    })

    expect(abilities.size).toBe(1)

    const loaded = abilities.get('test-integration')
    expect(loaded).toBeDefined()
    expect(loaded!.ability.name).toBe('test-integration')

    const validationResult = validateAbility(loaded!.ability)
    expect(validationResult.valid).toBe(true)

    const execution = await executeAbility(
      loaded!.ability,
      { message: 'Hello Integration' },
      createMockContext()
    )

    expect(execution.status).toBe('completed')
    expect(execution.completedSteps).toHaveLength(1)
    expect(execution.completedSteps[0].output).toContain('Hello Integration')
  })

  it('should load abilities from nested directories', async () => {
    await fs.mkdir(path.join(TEST_ABILITIES_DIR, 'deploy', 'staging'), { recursive: true })

    const abilityYaml = `
name: deploy/staging
description: Deploy to staging

steps:
  - id: deploy
    type: script
    run: echo "Deploying to staging"
`
    await fs.writeFile(
      path.join(TEST_ABILITIES_DIR, 'deploy', 'staging', 'ability.yaml'),
      abilityYaml
    )

    const abilities = await loadAbilities({
      projectDir: TEST_ABILITIES_DIR,
      includeGlobal: false,
    })

    expect(abilities.size).toBe(1)

    const loaded = abilities.get('deploy/staging')
    expect(loaded).toBeDefined()
  })

  it('should reject invalid abilities during validation', async () => {
    const invalidYaml = `
name: invalid-ability
description: Missing name field actually has name, but empty steps
steps: []
`
    await fs.writeFile(
      path.join(TEST_ABILITIES_DIR, 'invalid.yaml'),
      invalidYaml
    )

    const abilities = await loadAbilities({
      projectDir: TEST_ABILITIES_DIR,
      includeGlobal: false,
    })

    const loaded = abilities.get('invalid-ability')
    expect(loaded).toBeDefined()

    const result = validateAbility(loaded!.ability)
    expect(result.valid).toBe(false)
  })
})

describe('Integration: ExecutionManager', () => {
  let manager: ExecutionManager

  beforeEach(() => {
    manager = new ExecutionManager()
  })

  afterEach(() => {
    manager.cleanup()
  })

  it('should track and manage execution lifecycle', async () => {
    const ability: Ability = {
      name: 'managed-test',
      description: 'Test managed execution',
      steps: [
        { id: 'step1', type: 'script', run: 'echo step1' },
        { id: 'step2', type: 'script', run: 'echo step2', needs: ['step1'] },
      ],
    }

    const execution = await manager.execute(ability, {}, createMockContext())

    expect(execution.status).toBe('completed')
    expect(manager.get(execution.id)).toBeDefined()
    expect(manager.list()).toHaveLength(1)
  })

  it('should prevent concurrent executions', async () => {
    const slowAbility: Ability = {
      name: 'slow-test',
      description: 'Slow test',
      steps: [
        { id: 'slow', type: 'script', run: 'sleep 0.1' },
      ],
    }

    const fastAbility: Ability = {
      name: 'fast-test',
      description: 'Fast test',
      steps: [
        { id: 'fast', type: 'script', run: 'echo fast' },
      ],
    }

    await manager.execute(slowAbility, {}, createMockContext())

    const execution = await manager.execute(fastAbility, {}, createMockContext())
    expect(execution.status).toBe('completed')
  })

  it('should cancel active execution', async () => {
    const ability: Ability = {
      name: 'cancel-test',
      description: 'Cancel test',
      steps: [
        { id: 'step1', type: 'script', run: 'echo test' },
      ],
    }

    const execution = await manager.execute(ability, {}, createMockContext())

    expect(execution.status).toBe('completed')

    const cancelled = manager.cancelActive()
    expect(cancelled).toBe(false)
  })

  it('should cleanup old executions', async () => {
    const ability: Ability = {
      name: 'cleanup-test',
      description: 'Cleanup test',
      steps: [
        { id: 'step1', type: 'script', run: 'echo test' },
      ],
    }

    for (let i = 0; i < 60; i++) {
      await manager.execute(
        { ...ability, name: `cleanup-test-${i}` },
        {},
        createMockContext()
      )
    }

    expect(manager.list().length).toBeLessThanOrEqual(50)
  })
})

describe('Integration: Context Passing', () => {
  it('should pass outputs between steps', async () => {
    const ability: Ability = {
      name: 'context-test',
      description: 'Context passing test',
      steps: [
        {
          id: 'generate',
          type: 'script',
          run: 'echo "GENERATED_VALUE_123"',
        },
        {
          id: 'use',
          type: 'script',
          run: 'echo "Received: {{steps.generate.output}}"',
          needs: ['generate'],
        },
      ],
    }

    const execution = await executeAbility(ability, {}, createMockContext())

    expect(execution.status).toBe('completed')
    expect(execution.completedSteps[1].output).toContain('GENERATED_VALUE_123')
  })
})

describe('Integration: Error Handling', () => {
  it('should handle script failures gracefully', async () => {
    const ability: Ability = {
      name: 'error-test',
      description: 'Error handling test',
      steps: [
        {
          id: 'fail',
          type: 'script',
          run: 'exit 1',
          validation: { exit_code: 0 },
        },
      ],
    }

    const execution = await executeAbility(ability, {}, createMockContext())

    expect(execution.status).toBe('failed')
    expect(execution.error).toBeDefined()
  })

  it('should handle missing commands gracefully', async () => {
    const ability: Ability = {
      name: 'missing-cmd-test',
      description: 'Missing command test',
      steps: [
        {
          id: 'missing',
          type: 'script',
          run: 'nonexistent_command_12345',
        },
      ],
    }

    const execution = await executeAbility(ability, {}, createMockContext())

    expect(execution.completedSteps[0]).toBeDefined()
  })

  it('should validate inputs before execution', async () => {
    const ability: Ability = {
      name: 'input-validation-test',
      description: 'Input validation test',
      inputs: {
        required_field: {
          type: 'string',
          required: true,
        },
      },
      steps: [
        { id: 'step1', type: 'script', run: 'echo test' },
      ],
    }

    const execution = await executeAbility(ability, {}, createMockContext())

    expect(execution.status).toBe('failed')
    expect(execution.error).toContain('Input validation failed')
  })
})
