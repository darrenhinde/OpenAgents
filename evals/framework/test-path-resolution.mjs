#!/usr/bin/env node
/**
 * Test script to verify agent path resolution
 * Tests both old (flat) and new (category-based) formats
 */

import { resolveAgentPath, normalizeAgentId, extractAgentCategory } from './dist/config.js';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..', '..');

console.log('🧪 Testing Agent Path Resolution\n');
console.log('Project Root:', projectRoot);
console.log('');

// Test cases
const testCases = [
  // Old format (flat structure)
  { agent: 'openagent', expected: 'core/openagent', category: undefined },
  { agent: 'opencoder', expected: 'core/opencoder', category: undefined },
  { agent: 'system-builder', expected: 'meta/system-builder', category: undefined },
  
  // New format (category-based)
  { agent: 'core/openagent', expected: 'core/openagent', category: 'core' },
  { agent: 'core/opencoder', expected: 'core/opencoder', category: 'core' },
  { agent: 'meta/system-builder', expected: 'meta/system-builder', category: 'meta' },
  { agent: 'development/frontend-specialist', expected: 'development/frontend-specialist', category: 'development' },
  { agent: 'development/backend-specialist', expected: 'development/backend-specialist', category: 'development' },
  { agent: 'content/copywriter', expected: 'content/copywriter', category: 'content' },
  
  // Subagents
  { agent: 'subagents/code/tester', expected: 'subagents/code/tester', category: 'subagents/code' },
  { agent: 'subagents/core/task-manager', expected: 'subagents/core/task-manager', category: 'subagents/core' },
];

let passed = 0;
let failed = 0;

console.log('Testing path resolution and normalization:\n');

for (const testCase of testCases) {
  const { agent, expected, category } = testCase;
  
  // Test normalization
  const normalized = normalizeAgentId(agent);
  const normalizePass = normalized === expected;
  
  // Test category extraction
  const extractedCategory = extractAgentCategory(agent);
  const categoryPass = extractedCategory === category;
  
  // Test path resolution
  const resolvedPath = resolveAgentPath(agent, projectRoot);
  const pathExists = existsSync(resolvedPath);
  
  const allPass = normalizePass && categoryPass;
  
  if (allPass) {
    console.log(`✅ ${agent}`);
    console.log(`   Normalized: ${normalized}`);
    console.log(`   Category: ${extractedCategory || 'none'}`);
    console.log(`   Path: ${resolvedPath}`);
    console.log(`   Exists: ${pathExists ? '✅' : '⚠️  (not created yet)'}`);
    passed++;
  } else {
    console.log(`❌ ${agent}`);
    console.log(`   Expected normalized: ${expected}, got: ${normalized}`);
    console.log(`   Expected category: ${category || 'none'}, got: ${extractedCategory || 'none'}`);
    failed++;
  }
  console.log('');
}

console.log('═══════════════════════════════════════');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('═══════════════════════════════════════');

if (failed > 0) {
  process.exit(1);
}
