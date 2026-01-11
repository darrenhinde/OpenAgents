#!/usr/bin/env bun

import { createAbilitiesPlugin } from './src/plugin.js'

async function main() {
  console.log('🧪 Running test-abilities ability\n')

  const mockClient = {
    session: {
      get: async () => ({}),
      list: async () => [],
      command: async () => ({}),
      prompt: async () => ({}),
      todo: async () => ({})
    },
    events: {
      publish: async () => {}
    }
  }

  const projectRoot = process.cwd().replace('/packages/plugin-abilities', '')

  const mockContext = {
    directory: projectRoot,
    worktree: projectRoot,
    client: mockClient,
    $: () => ({ text: async () => '' })
  }

  const plugin = await createAbilitiesPlugin(mockContext as any, {
    abilities: {
      directories: [`${projectRoot}/.opencode/abilities`]
    }
  })

  console.log('Running test-abilities...\n')
  
  const result = await plugin.tool['ability.run'].execute({ 
    name: 'test-abilities',
    inputs: {}
  })
  
  console.log(JSON.stringify(result, null, 2))
}

main().catch(console.error)
