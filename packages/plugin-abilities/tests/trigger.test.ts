import { describe, expect, it } from 'bun:test'
import type { Ability, Triggers } from '../src/types/index.js'

function matchesTrigger(text: string, triggers: Triggers | undefined): boolean {
  if (!triggers) return false

  const lowerText = text.toLowerCase()

  if (triggers.keywords) {
    for (const keyword of triggers.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return true
      }
    }
  }

  if (triggers.patterns) {
    for (const pattern of triggers.patterns) {
      try {
        if (new RegExp(pattern, 'i').test(text)) {
          return true
        }
      } catch {
        continue
      }
    }
  }

  return false
}

describe('Trigger Detection', () => {
  describe('keyword matching', () => {
    it('should match exact keyword', () => {
      const triggers: Triggers = { keywords: ['deploy'] }
      expect(matchesTrigger('deploy to production', triggers)).toBe(true)
    })

    it('should match keyword case-insensitively', () => {
      const triggers: Triggers = { keywords: ['Deploy'] }
      expect(matchesTrigger('DEPLOY now', triggers)).toBe(true)
    })

    it('should match keyword as substring', () => {
      const triggers: Triggers = { keywords: ['ship'] }
      expect(matchesTrigger('ship it!', triggers)).toBe(true)
    })

    it('should not match when keyword not present', () => {
      const triggers: Triggers = { keywords: ['deploy'] }
      expect(matchesTrigger('release the code', triggers)).toBe(false)
    })

    it('should match any of multiple keywords', () => {
      const triggers: Triggers = { keywords: ['deploy', 'release', 'ship'] }
      expect(matchesTrigger('release v1.0', triggers)).toBe(true)
      expect(matchesTrigger('ship it', triggers)).toBe(true)
    })
  })

  describe('pattern matching', () => {
    it('should match regex pattern', () => {
      const triggers: Triggers = { patterns: ['deploy.*prod'] }
      expect(matchesTrigger('deploy to production', triggers)).toBe(true)
    })

    it('should match version pattern', () => {
      const triggers: Triggers = { patterns: ['v\\d+\\.\\d+\\.\\d+'] }
      expect(matchesTrigger('release v1.2.3', triggers)).toBe(true)
    })

    it('should not match invalid pattern gracefully', () => {
      const triggers: Triggers = { patterns: ['[invalid(regex'] }
      expect(matchesTrigger('some text', triggers)).toBe(false)
    })

    it('should match case-insensitively', () => {
      const triggers: Triggers = { patterns: ['DEPLOY'] }
      expect(matchesTrigger('deploy now', triggers)).toBe(true)
    })
  })

  describe('combined triggers', () => {
    it('should match keyword OR pattern', () => {
      const triggers: Triggers = {
        keywords: ['ship it'],
        patterns: ['deploy.*prod']
      }
      expect(matchesTrigger('ship it now', triggers)).toBe(true)
      expect(matchesTrigger('deploy to prod', triggers)).toBe(true)
    })

    it('should return false when no triggers defined', () => {
      expect(matchesTrigger('anything', undefined)).toBe(false)
      expect(matchesTrigger('anything', {})).toBe(false)
    })
  })

  describe('ability trigger detection', () => {
    it('should detect ability from user message', () => {
      const abilities: Ability[] = [
        {
          name: 'deploy',
          description: 'Deploy to production',
          triggers: { keywords: ['deploy', 'ship it'] },
          steps: [{ id: 'test', type: 'script', run: 'echo test' }]
        },
        {
          name: 'test',
          description: 'Run tests',
          triggers: { keywords: ['run tests', 'test suite'] },
          steps: [{ id: 'test', type: 'script', run: 'npm test' }]
        }
      ]

      const detectAbility = (text: string): Ability | null => {
        for (const ability of abilities) {
          if (matchesTrigger(text, ability.triggers)) {
            return ability
          }
        }
        return null
      }

      expect(detectAbility('please deploy to staging')?.name).toBe('deploy')
      expect(detectAbility('ship it!')?.name).toBe('deploy')
      expect(detectAbility('run tests please')?.name).toBe('test')
      expect(detectAbility('check the code')).toBe(null)
    })
  })
})
