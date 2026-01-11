import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { AbilitiesSDK, createAbilitiesSDK } from '../src/sdk.js'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

describe('AbilitiesSDK', () => {
  let sdk: AbilitiesSDK
  let tempDir: string

  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'abilities-sdk-test-'))

    fs.writeFileSync(
      path.join(tempDir, 'test-ability.yaml'),
      `
name: test-sdk
description: Test SDK ability
triggers:
  keywords:
    - test
inputs:
  message:
    type: string
    default: "Hello"
steps:
  - id: echo
    type: script
    run: echo "{{inputs.message}}"
`
    )

    sdk = createAbilitiesSDK({ projectDir: tempDir, includeGlobal: false })
  })

  afterEach(() => {
    sdk.cleanup()
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  test('should list loaded abilities', async () => {
    const abilities = await sdk.list()

    expect(abilities.length).toBe(1)
    expect(abilities[0].name).toBe('test-sdk')
    expect(abilities[0].description).toBe('Test SDK ability')
    expect(abilities[0].stepCount).toBe(1)
  })

  test('should get ability by name', async () => {
    const ability = await sdk.get('test-sdk')

    expect(ability).toBeDefined()
    expect(ability?.name).toBe('test-sdk')
    expect(ability?.steps.length).toBe(1)
  })

  test('should return undefined for unknown ability', async () => {
    const ability = await sdk.get('nonexistent')

    expect(ability).toBeUndefined()
  })

  test('should validate ability', async () => {
    const result = await sdk.validate('test-sdk')

    expect(result.valid).toBe(true)
    expect(result.errors.length).toBe(0)
  })

  test('should return error for unknown ability validation', async () => {
    const result = await sdk.validate('nonexistent')

    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('not found')
  })

  test('should execute ability', async () => {
    const result = await sdk.execute('test-sdk', { message: 'World' })

    expect(result.status).toBe('completed')
    expect(result.ability).toBe('test-sdk')
    expect(result.steps.length).toBe(1)
    expect(result.steps[0].status).toBe('completed')
    expect(result.error).toBeUndefined()
  })

  test('should execute ability with defaults', async () => {
    const result = await sdk.execute('test-sdk')

    expect(result.status).toBe('completed')
  })

  test('should return error for unknown ability execution', async () => {
    const result = await sdk.execute('nonexistent')

    expect(result.status).toBe('failed')
    expect(result.error).toContain('not found')
  })

  test('should get status of active execution', async () => {
    const status = await sdk.status()

    expect(status.active).toBe(false)
  })

  test('should cancel execution', async () => {
    const cancelled = await sdk.cancel()

    expect(cancelled).toBe(false)
  })
})

describe('createAbilitiesSDK', () => {
  test('should create SDK instance', () => {
    const sdk = createAbilitiesSDK()

    expect(sdk).toBeInstanceOf(AbilitiesSDK)
    sdk.cleanup()
  })

  test('should accept options', () => {
    const sdk = createAbilitiesSDK({
      projectDir: '/tmp/test',
      includeGlobal: false,
    })

    expect(sdk).toBeInstanceOf(AbilitiesSDK)
    sdk.cleanup()
  })
})
