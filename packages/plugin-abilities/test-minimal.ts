#!/usr/bin/env bun
/**
 * Minimal Test Script
 * 
 * Quick validation that the minimal plugin works
 */

import { loadAbilities } from './src/loader/index.js'
import { validateAbility } from './src/validator/index.js'
import { executeAbility } from './src/executor/index.js'
import type { ExecutorContext } from './src/types/index.js'

async function test() {
  console.log('🧪 Testing minimal abilities plugin...\n')

  // Test 1: Load ability
  console.log('Test 1: Loading test ability...')
  const abilities = await loadAbilities({
    projectDir: './examples/test',
    includeGlobal: false,
  })

  if (abilities.size === 0) {
    console.error('❌ No abilities loaded')
    process.exit(1)
  }

  const testAbility = abilities.get('test')
  if (!testAbility) {
    console.error('❌ Test ability not found')
    process.exit(1)
  }
  console.log('✅ Loaded ability:', testAbility.ability.name)
  console.log()

  // Test 2: Validate ability
  console.log('Test 2: Validating ability...')
  const validation = validateAbility(testAbility.ability)
  if (!validation.valid) {
    console.error('❌ Validation failed:', validation.errors)
    process.exit(1)
  }
  console.log('✅ Ability is valid')
  console.log()

  // Test 3: Execute ability
  console.log('Test 3: Executing ability...')
  const ctx: ExecutorContext = {
    cwd: process.cwd(),
    env: {},
  }

  const execution = await executeAbility(
    testAbility.ability,
    { message: 'Test message from script' },
    ctx
  )

  console.log('Status:', execution.status)
  console.log('Steps completed:', execution.completedSteps.length)
  console.log()

  for (const step of execution.completedSteps) {
    const icon = step.status === 'completed' ? '✅' : '❌'
    console.log(`${icon} ${step.stepId}: ${step.status}`)
    if (step.output) {
      console.log(`   Output: ${step.output.trim()}`)
    }
  }

  if (execution.status === 'completed') {
    console.log('\n✅ All tests passed!')
  } else {
    console.log('\n❌ Execution failed:', execution.error)
    process.exit(1)
  }
}

test().catch((err) => {
  console.error('❌ Test failed:', err)
  process.exit(1)
})
