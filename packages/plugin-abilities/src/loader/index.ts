import * as fs from 'fs/promises'
import * as path from 'path'
import { glob } from 'glob'
import { parse as parseYaml } from 'yaml'
import type { Ability, LoadedAbility, LoaderOptions } from '../types/index.js'

const ABILITY_FILENAME = 'ability.yaml'
const ABILITY_PATTERNS = ['*.yaml', '*/ability.yaml', '*/*.yaml', '*/*/ability.yaml']

const DEFAULT_PROJECT_DIR = '.opencode/abilities'
const DEFAULT_GLOBAL_DIR = '~/.config/opencode/abilities'

function expandHome(filePath: string): string {
  if (filePath.startsWith('~/')) {
    const home = process.env.HOME || process.env.USERPROFILE || ''
    return path.join(home, filePath.slice(2))
  }
  return filePath
}

function resolveAbilityName(filePath: string, baseDir: string): string {
  const relativePath = path.relative(baseDir, filePath)
  const dir = path.dirname(relativePath)
  const filename = path.basename(filePath, '.yaml')

  if (filename === 'ability') {
    return dir === '.' ? path.basename(path.dirname(filePath)) : dir
  }

  if (dir === '.') {
    return filename
  }

  return `${dir}/${filename}`
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function loadAbilityFile(
  filePath: string,
  baseDir: string,
  source: 'project' | 'global'
): Promise<LoadedAbility | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const parsed = parseYaml(content) as Partial<Ability>

    if (!parsed || typeof parsed !== 'object') {
      console.warn(`[abilities] Invalid YAML in ${filePath}`)
      return null
    }

    const resolvedName = parsed.name || resolveAbilityName(filePath, baseDir)

    const ability: Ability = {
      ...parsed,
      name: resolvedName,
      description: parsed.description || '',
      steps: parsed.steps || [],
      _meta: {
        filePath,
        directory: path.dirname(filePath),
        loadedAt: Date.now(),
      },
    }

    return { ability, filePath, source }
  } catch (error) {
    console.error(`[abilities] Failed to load ${filePath}:`, error)
    return null
  }
}

async function discoverAbilities(
  baseDir: string,
  source: 'project' | 'global'
): Promise<LoadedAbility[]> {
  const expandedDir = expandHome(baseDir)

  if (!(await fileExists(expandedDir))) {
    return []
  }

  const files: string[] = []
  for (const pattern of ABILITY_PATTERNS) {
    const matches = await glob(path.join(expandedDir, pattern), { nodir: true })
    files.push(...matches)
  }

  const uniqueFiles = [...new Set(files)]
  const results: LoadedAbility[] = []

  for (const file of uniqueFiles) {
    const loaded = await loadAbilityFile(file, expandedDir, source)
    if (loaded) {
      results.push(loaded)
    }
  }

  return results
}

export async function loadAbilities(
  options: LoaderOptions = {}
): Promise<Map<string, LoadedAbility>> {
  const {
    projectDir = DEFAULT_PROJECT_DIR,
    globalDir = DEFAULT_GLOBAL_DIR,
    includeGlobal = true,
  } = options

  const abilities = new Map<string, LoadedAbility>()

  if (includeGlobal) {
    const globalAbilities = await discoverAbilities(globalDir, 'global')
    for (const loaded of globalAbilities) {
      abilities.set(loaded.ability.name, loaded)
    }
  }

  const projectAbilities = await discoverAbilities(projectDir, 'project')
  for (const loaded of projectAbilities) {
    abilities.set(loaded.ability.name, loaded)
  }

  return abilities
}

export async function loadAbility(
  name: string,
  options: LoaderOptions = {}
): Promise<LoadedAbility | null> {
  const abilities = await loadAbilities(options)
  return abilities.get(name) || null
}

export interface AbilityListItem {
  name: string
  description: string
  source: 'project' | 'global'
  triggers?: string[]
  inputCount: number
  stepCount: number
}

export function listAbilities(
  abilities: Map<string, LoadedAbility>
): AbilityListItem[] {
  return Array.from(abilities.values()).map(({ ability, source }) => ({
    name: ability.name,
    description: ability.description,
    source,
    triggers: ability.triggers?.keywords,
    inputCount: ability.inputs ? Object.keys(ability.inputs).length : 0,
    stepCount: ability.steps.length,
  }))
}
