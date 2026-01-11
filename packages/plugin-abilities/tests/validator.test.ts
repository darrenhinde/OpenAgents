import { describe, expect, it } from 'bun:test'
import { validateAbility, validateInputs } from '../src/validator/index.js'
import type { Ability } from '../src/types/index.js'

describe('validateAbility', () => {
  it('should validate a minimal valid ability', () => {
    const ability = {
      name: 'test-ability',
      description: 'A test ability',
      steps: [
        {
          id: 'step1',
          type: 'script',
          run: 'echo hello',
        },
      ],
    }

    const result = validateAbility(ability)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject ability without name', () => {
    const ability = {
      description: 'A test ability',
      steps: [{ id: 'step1', type: 'script', run: 'echo' }],
    }

    const result = validateAbility(ability)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.path.includes('name'))).toBe(true)
  })

  it('should reject ability without steps', () => {
    const ability = {
      name: 'test',
      description: 'Test',
      steps: [],
    }

    const result = validateAbility(ability)
    expect(result.valid).toBe(false)
  })

  it('should detect circular dependencies', () => {
    const ability = {
      name: 'circular',
      description: 'Has circular deps',
      steps: [
        { id: 'a', type: 'script', run: 'echo a', needs: ['c'] },
        { id: 'b', type: 'script', run: 'echo b', needs: ['a'] },
        { id: 'c', type: 'script', run: 'echo c', needs: ['b'] },
      ],
    }

    const result = validateAbility(ability)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.code === 'CIRCULAR_DEPENDENCY')).toBe(true)
  })

  it('should detect missing dependencies', () => {
    const ability = {
      name: 'missing-dep',
      description: 'Missing dep',
      steps: [
        { id: 'a', type: 'script', run: 'echo', needs: ['nonexistent'] },
      ],
    }

    const result = validateAbility(ability)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.code === 'MISSING_DEPENDENCY')).toBe(true)
  })

  it('should detect duplicate step IDs', () => {
    const ability = {
      name: 'duplicate',
      description: 'Duplicate IDs',
      steps: [
        { id: 'step1', type: 'script', run: 'echo 1' },
        { id: 'step1', type: 'script', run: 'echo 2' },
      ],
    }

    const result = validateAbility(ability)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.code === 'DUPLICATE_ID')).toBe(true)
  })

  it('should validate all step types', () => {
    const ability = {
      name: 'all-types',
      description: 'All step types',
      steps: [
        { id: 'script', type: 'script', run: 'echo' },
        { id: 'agent', type: 'agent', agent: 'oracle', prompt: 'Help' },
        { id: 'skill', type: 'skill', skill: 'test-skill' },
        { id: 'approval', type: 'approval', prompt: 'Approve?' },
        { id: 'workflow', type: 'workflow', workflow: 'sub-workflow' },
      ],
    }

    const result = validateAbility(ability)
    expect(result.valid).toBe(true)
  })
})

describe('validateInputs', () => {
  const ability: Ability = {
    name: 'test',
    description: 'Test',
    inputs: {
      version: {
        type: 'string',
        required: true,
        pattern: '^v\\d+\\.\\d+\\.\\d+$',
      },
      count: {
        type: 'number',
        required: false,
        min: 1,
        max: 100,
      },
      env: {
        type: 'string',
        required: true,
        enum: ['dev', 'staging', 'prod'],
      },
    },
    steps: [{ id: 'test', type: 'script', run: 'echo' }],
  }

  it('should validate correct inputs', () => {
    const errors = validateInputs(ability, {
      version: 'v1.2.3',
      count: 50,
      env: 'staging',
    })
    expect(errors).toHaveLength(0)
  })

  it('should reject missing required input', () => {
    const errors = validateInputs(ability, {
      env: 'dev',
    })
    expect(errors.some((e) => e.code === 'MISSING_INPUT')).toBe(true)
  })

  it('should reject invalid pattern', () => {
    const errors = validateInputs(ability, {
      version: 'invalid',
      env: 'dev',
    })
    expect(errors.some((e) => e.code === 'PATTERN_MISMATCH')).toBe(true)
  })

  it('should reject invalid enum value', () => {
    const errors = validateInputs(ability, {
      version: 'v1.0.0',
      env: 'invalid',
    })
    expect(errors.some((e) => e.code === 'ENUM_MISMATCH')).toBe(true)
  })

  it('should reject number out of range', () => {
    const errors = validateInputs(ability, {
      version: 'v1.0.0',
      env: 'dev',
      count: 200,
    })
    expect(errors.some((e) => e.code === 'MAX_VALUE')).toBe(true)
  })
})
