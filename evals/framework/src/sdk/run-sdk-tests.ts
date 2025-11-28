#!/usr/bin/env node

/**
 * Main CLI entry point for SDK-based test execution
 * 
 * Usage:
 *   npm run eval:sdk
 *   npm run eval:sdk -- --debug
 *   npm run eval:sdk -- --no-evaluators
 *   npm run eval:sdk -- --core
 *   npm run eval:sdk -- --agent=opencoder
 *   npm run eval:sdk -- --agent=openagent
 *   npm run eval:sdk -- --model=opencode/grok-code-fast
 *   npm run eval:sdk -- --model=anthropic/claude-3-5-sonnet-20241022
 *   npm run eval:sdk -- --pattern="developer/*.yaml" --model=openai/gpt-4-turbo
 * 
 * Options:
 *   --debug              Enable debug logging
 *   --no-evaluators      Skip running evaluators (faster)
 *   --core               Run core test suite only (7 tests, ~5-8 min)
 *   --agent=AGENT        Run tests for specific agent (openagent, opencoder)
 *   --model=PROVIDER/MODEL  Override default model (default: opencode/grok-code-fast)
 *   --pattern=GLOB       Run specific test files (default: star-star/star.yaml)
 *   --timeout=MS         Test timeout in milliseconds (default: 60000)
 */

import { TestRunner } from './test-runner.js';
import { loadTestCase, loadTestCases } from './test-case-loader.js';
import { ResultSaver } from './result-saver.js';
import { globSync } from 'glob';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { rmSync, existsSync, readdirSync } from 'fs';
import type { TestResult } from './test-runner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CliArgs {
  debug: boolean;
  noEvaluators: boolean;
  core: boolean;
  agent?: string;
  pattern?: string;
  timeout?: number;
  model?: string;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  
  return {
    debug: args.includes('--debug'),
    noEvaluators: args.includes('--no-evaluators'),
    core: args.includes('--core'),
    agent: args.find(a => a.startsWith('--agent='))?.split('=')[1],
    pattern: args.find(a => a.startsWith('--pattern='))?.split('=')[1],
    timeout: parseInt(args.find(a => a.startsWith('--timeout='))?.split('=')[1] || '60000'),
    model: args.find(a => a.startsWith('--model='))?.split('=')[1],
  };
}

/**
 * Clean up test_tmp directory, preserving README.md and .gitignore
 */
function cleanupTestTmp(testTmpDir: string): void {
  if (!existsSync(testTmpDir)) {
    return;
  }
  
  const preserveFiles = ['README.md', '.gitignore'];
  
  try {
    const files = readdirSync(testTmpDir);
    let cleanedCount = 0;
    
    for (const file of files) {
      if (!preserveFiles.includes(file)) {
        const filePath = join(testTmpDir, file);
        rmSync(filePath, { recursive: true, force: true });
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} file(s) from test_tmp/\n`);
    }
  } catch (error) {
    console.warn(`Warning: Could not clean test_tmp: ${(error as Error).message}`);
  }
}

function printResults(results: TestResult[]): void {
  const passed = results.filter(r => r.passed).length;
  const failed = results.length - passed;
  
  console.log('\n' + '='.repeat(70));
  console.log('TEST RESULTS');
  console.log('='.repeat(70));
  
  results.forEach((result, idx) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`\n${idx + 1}. ${icon} ${result.testCase.id} - ${result.testCase.name}`);
    console.log(`   Duration: ${result.duration}ms`);
    console.log(`   Events: ${result.events.length}`);
    console.log(`   Approvals: ${result.approvalsGiven}`);
    
    // Show context loading details if available
    if (result.evaluation) {
      const contextEval = result.evaluation.evaluatorResults.find(e => e.evaluator === 'context-loading');
      if (contextEval && contextEval.metadata) {
        const metadata = contextEval.metadata;
        
        // Check if this is a task session
        if (metadata.isTaskSession) {
          if (metadata.isBashOnly) {
            console.log(`   Context Loading: ⊘ Bash-only task (not required)`);
          } else if (metadata.contextCheck) {
            const check = metadata.contextCheck;
            if (check.contextFileLoaded) {
              const timeDiff = check.executionTimestamp && check.loadTimestamp 
                ? check.executionTimestamp - check.loadTimestamp 
                : 0;
              console.log(`   Context Loading:`);
              console.log(`     ✓ Loaded: ${check.contextFilePath}`);
              console.log(`     ✓ Timing: Context loaded ${timeDiff}ms before execution`);
            } else {
              console.log(`   Context Loading:`);
              console.log(`     ✗ No context loaded before execution`);
            }
          }
        } else {
          console.log(`   Context Loading: ⊘ Conversational session (not required)`);
        }
      }
      
      console.log(`   Violations: ${result.evaluation.totalViolations} (${result.evaluation.violationsBySeverity.error} errors, ${result.evaluation.violationsBySeverity.warning} warnings)`);
    }
    
    if (result.errors.length > 0) {
      console.log(`   Errors:`);
      result.errors.forEach(err => console.log(`     - ${err}`));
    }
  });
  
  console.log('\n' + '='.repeat(70));
  console.log(`SUMMARY: ${passed}/${results.length} tests passed (${failed} failed)`);
  console.log('='.repeat(70) + '\n');
  
  // Print failed tests details
  if (failed > 0) {
    console.log('\nFailed Tests:');
    results.filter(r => !r.passed).forEach(result => {
      console.log(`\n  ❌ ${result.testCase.id}`);
      if (result.errors.length > 0) {
        console.log(`     Errors: ${result.errors.join(', ')}`);
      }
      if (result.evaluation && result.evaluation.totalViolations > 0) {
        console.log(`     Violations: ${result.evaluation.totalViolations}`);
        result.evaluation.allViolations.forEach(v => {
          console.log(`       - [${v.severity}] ${v.type}: ${v.message}`);
        });
      }
    });
    console.log();
  }
}

async function main() {
  const args = parseArgs();
  
  console.log('🚀 OpenCode SDK Test Runner\n');
  
  // Determine which agent(s) to test
  const agentsDir = join(__dirname, '../../..', 'agents');
  const agentToTest = args.agent;
  
  let testDirs: string[] = [];
  
  if (agentToTest) {
    // Test specific agent
    const agentTestDir = join(agentsDir, agentToTest, 'tests');
    testDirs = [agentTestDir];
    console.log(`Testing agent: ${agentToTest}\n`);
  } else {
    // Test all agents
    const availableAgents = ['openagent', 'opencoder'];
    testDirs = availableAgents.map(a => join(agentsDir, a, 'tests'));
    console.log(`Testing all agents: ${availableAgents.join(', ')}\n`);
  }
  
  // Find test files across all test directories
  let pattern = args.pattern || '**/*.yaml';
  let testFiles: string[] = [];
  
  // If --core flag is set, use core test patterns
  if (args.core) {
    console.log('🎯 Running CORE test suite (7 tests)\n');
    const coreTests = [
      '01-critical-rules/approval-gate/05-approval-before-execution-positive.yaml',
      '01-critical-rules/context-loading/01-code-task.yaml',
      '01-critical-rules/context-loading/09-multi-standards-to-docs.yaml',
      '01-critical-rules/stop-on-failure/02-stop-and-report-positive.yaml',
      '08-delegation/simple-task-direct.yaml',
      '06-integration/medium/04-subagent-verification.yaml',
      '09-tool-usage/dedicated-tools-usage.yaml'
    ];
    
    for (const testDir of testDirs) {
      for (const coreTest of coreTests) {
        const testPath = join(testDir, coreTest);
        if (existsSync(testPath)) {
          testFiles.push(testPath);
        }
      }
    }
  } else {
    for (const testDir of testDirs) {
      const files = globSync(pattern, { cwd: testDir, absolute: true });
      testFiles = testFiles.concat(files);
    }
  }
  
  if (testFiles.length === 0) {
    console.error(`❌ No test files found matching pattern: ${pattern}`);
    console.error(`   Searched in: ${testDirs.join(', ')}`);
    process.exit(1);
  }
  
  console.log(`Found ${testFiles.length} test file(s):\n`);
  testFiles.forEach((f: string, idx: number) => {
    // Show relative path from agents dir
    const relativePath = f.replace(agentsDir + '/', '');
    console.log(`  ${idx + 1}. ${relativePath}`);
  });
  console.log();
  
  // Load test cases
  console.log('Loading test cases...');
  const testCases = await loadTestCases(testFiles);
  console.log(`✅ Loaded ${testCases.length} test case(s)\n`);
  
  // Create test runner
  const runner = new TestRunner({
    debug: args.debug,
    defaultTimeout: args.timeout,
    runEvaluators: !args.noEvaluators,
    defaultModel: args.model, // Will use 'opencode/grok-code-fast' if not specified
  });
  
  if (args.model) {
    console.log(`Using model: ${args.model}`);
  } else {
    console.log('Using default model: opencode/grok-code-fast (free tier)');
  }
  console.log();
  
  // Clean up test_tmp directory before running tests
  const testTmpDir = join(agentsDir, '..', 'test_tmp');
  cleanupTestTmp(testTmpDir);
  
  try {
    // Start runner
    console.log('Starting test runner...');
    await runner.start();
    console.log('✅ Test runner started\n');
    
    // Run tests
    console.log('Running tests...\n');
    const results = await runner.runTests(testCases);
    
    // Stop runner
    console.log('\nStopping test runner...');
    await runner.stop();
    console.log('✅ Test runner stopped\n');
    
    // Clean up test_tmp directory after tests
    cleanupTestTmp(testTmpDir);
    
    // Save results to JSON
    if (results.length > 0) {
      const resultsDir = join(agentsDir, '..', 'results');
      const resultSaver = new ResultSaver(resultsDir);
      
      // Determine agent from test cases (all tests should be for same agent)
      const agent = testCases[0].agent || agentToTest || 'unknown';
      const model = args.model || 'opencode/grok-code-fast';
      
      try {
        const savedPath = await resultSaver.save(results, agent, model);
        console.log(`\n📊 Results saved to: ${savedPath}`);
        console.log(`📊 Latest results: ${join(resultsDir, 'latest.json')}`);
        console.log(`📊 View dashboard: file://${join(resultsDir, 'index.html')}\n`);
      } catch (error) {
        console.warn(`\n⚠️  Failed to save results: ${(error as Error).message}\n`);
      }
    }
    
    // Print results
    printResults(results);
    
    // Exit with appropriate code
    const allPassed = results.every(r => r.passed);
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Fatal error:', (error as Error).message);
    console.error((error as Error).stack);
    
    try {
      await runner.stop();
    } catch {
      // Ignore cleanup errors
    }
    
    process.exit(1);
  }
}

// Run main
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
