#!/usr/bin/env node
/**
 * Task Management CLI
 *
 * Usage: npx ts-node .opencode/scripts/task-cli.ts <command> [args...]
 *
 * Tasks are stored in: .tmp/tasks/active/{feature}/ and .tmp/tasks/completed/{feature}/
 *
 * Commands:
 *   status [feature]              - Show task status summary
 *   next [feature]                - Show next eligible tasks
 *   parallel [feature]            - Show parallelizable tasks ready to run
 *   deps <feature> <seq>          - Show dependency tree for a task
 *   blocked [feature]             - Show blocked tasks and why
 *   complete <feature> <seq> "summary" - Mark task completed
 *   validate [feature]            - Validate JSON files and dependencies
 *   init                          - Create .tmp/tasks/ directory structure
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// Tasks stored in project root .tmp/tasks/
const PROJECT_ROOT = process.cwd();
const TASKS_ROOT = path.join(PROJECT_ROOT, '.tmp', 'tasks');
const ACTIVE_DIR = path.join(TASKS_ROOT, 'active');
const COMPLETED_DIR = path.join(TASKS_ROOT, 'completed');

interface Task {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'blocked' | 'archived';
  objective: string;
  context_files: string[];
  exit_criteria: string[];
  subtask_count: number;
  completed_count: number;
  created_at: string;
  completed_at: string | null;
}

interface Subtask {
  id: string;
  seq: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  depends_on: string[];
  parallel: boolean;
  context_files: string[];
  acceptance_criteria: string[];
  deliverables: string[];
  agent_id: string | null;
  started_at: string | null;
  completed_at: string | null;
  completion_summary: string | null;
}

// Helpers
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getFeatureDirs(): string[] {
  if (!fs.existsSync(ACTIVE_DIR)) return [];
  return fs.readdirSync(ACTIVE_DIR).filter((f: string) =>
    fs.statSync(path.join(ACTIVE_DIR, f)).isDirectory()
  );
}

function loadTask(feature: string): Task | null {
  const taskPath = path.join(ACTIVE_DIR, feature, 'task.json');
  if (!fs.existsSync(taskPath)) return null;
  return JSON.parse(fs.readFileSync(taskPath, 'utf-8')) as Task;
}

function loadSubtasks(feature: string): Subtask[] {
  const featureDir = path.join(ACTIVE_DIR, feature);
  if (!fs.existsSync(featureDir)) return [];

  const files = fs.readdirSync(featureDir)
    .filter((f: string) => f.match(/^subtask_\d{2}\.json$/))
    .sort();

  return files.map((f: string) =>
    JSON.parse(fs.readFileSync(path.join(featureDir, f), 'utf-8')) as Subtask
  );
}

function saveSubtask(feature: string, subtask: Subtask): void {
  const subtaskPath = path.join(ACTIVE_DIR, feature, `subtask_${subtask.seq}.json`);
  fs.writeFileSync(subtaskPath, JSON.stringify(subtask, null, 2));
}

function saveTask(feature: string, task: Task): void {
  const taskPath = path.join(ACTIVE_DIR, feature, 'task.json');
  fs.writeFileSync(taskPath, JSON.stringify(task, null, 2));
}

// Commands
function cmdInit(): void {
  ensureDir(ACTIVE_DIR);
  ensureDir(COMPLETED_DIR);
  console.log(`\n✓ Created task directories:`);
  console.log(`  ${ACTIVE_DIR}`);
  console.log(`  ${COMPLETED_DIR}`);
}

function cmdStatus(feature?: string): void {
  const features = feature ? [feature] : getFeatureDirs();

  if (features.length === 0) {
    console.log('No active features found in .tmp/tasks/active/');
    console.log('Run `task-cli.ts init` to create directories.');
    return;
  }

  for (const f of features) {
    const task = loadTask(f);
    const subtasks = loadSubtasks(f);

    if (!task) {
      console.log(`\n[${f}] - No task.json found`);
      continue;
    }

    const counts = {
      pending: subtasks.filter((s: Subtask) => s.status === 'pending').length,
      in_progress: subtasks.filter((s: Subtask) => s.status === 'in_progress').length,
      completed: subtasks.filter((s: Subtask) => s.status === 'completed').length,
      blocked: subtasks.filter((s: Subtask) => s.status === 'blocked').length,
    };

    const progress = subtasks.length > 0
      ? Math.round((counts.completed / subtasks.length) * 100)
      : 0;

    console.log(`\n[${f}] ${task.name}`);
    console.log(`  Status: ${task.status} | Progress: ${progress}% (${counts.completed}/${subtasks.length})`);
    console.log(`  Pending: ${counts.pending} | In Progress: ${counts.in_progress} | Completed: ${counts.completed} | Blocked: ${counts.blocked}`);
  }
}

function cmdNext(feature?: string): void {
  const features = feature ? [feature] : getFeatureDirs();

  console.log('\n=== Ready Tasks (deps satisfied) ===\n');

  for (const f of features) {
    const subtasks = loadSubtasks(f);
    const completedSeqs = new Set(
      subtasks.filter((s: Subtask) => s.status === 'completed').map((s: Subtask) => s.seq)
    );

    const ready = subtasks.filter((s: Subtask) => {
      if (s.status !== 'pending') return false;
      return s.depends_on.every((dep: string) => completedSeqs.has(dep));
    });

    if (ready.length > 0) {
      console.log(`[${f}]`);
      for (const s of ready) {
        const parallel = s.parallel ? '[parallel]' : '[sequential]';
        console.log(`  ${s.seq} - ${s.title}  ${parallel}`);
      }
      console.log();
    }
  }
}

function cmdParallel(feature?: string): void {
  const features = feature ? [feature] : getFeatureDirs();

  console.log('\n=== Parallel Tasks Ready Now ===\n');

  for (const f of features) {
    const subtasks = loadSubtasks(f);
    const completedSeqs = new Set(
      subtasks.filter((s: Subtask) => s.status === 'completed').map((s: Subtask) => s.seq)
    );

    const parallel = subtasks.filter((s: Subtask) => {
      if (s.status !== 'pending') return false;
      if (!s.parallel) return false;
      return s.depends_on.every((dep: string) => completedSeqs.has(dep));
    });

    if (parallel.length > 0) {
      console.log(`[${f}] - ${parallel.length} parallel tasks:`);
      for (const s of parallel) {
        console.log(`  ${s.seq} - ${s.title}`);
      }
      console.log();
    }
  }
}

function cmdDeps(feature: string, seq: string): void {
  const subtasks = loadSubtasks(feature);
  const target = subtasks.find((s: Subtask) => s.seq === seq);

  if (!target) {
    console.log(`Task ${seq} not found in ${feature}`);
    return;
  }

  console.log(`\n=== Dependency Tree: ${feature}/${seq} ===\n`);
  console.log(`${seq} - ${target.title} [${target.status}]`);

  if (target.depends_on.length === 0) {
    console.log('  └── (no dependencies)');
    return;
  }

  const printDeps = (seqs: string[], indent: string = '  '): void => {
    for (let i = 0; i < seqs.length; i++) {
      const depSeq = seqs[i];
      const dep = subtasks.find((s: Subtask) => s.seq === depSeq);
      const isLast = i === seqs.length - 1;
      const branch = isLast ? '└──' : '├──';

      if (dep) {
        const statusIcon = dep.status === 'completed' ? '✓' : dep.status === 'in_progress' ? '~' : '○';
        console.log(`${indent}${branch} ${statusIcon} ${depSeq} - ${dep.title} [${dep.status}]`);
        if (dep.depends_on.length > 0) {
          const newIndent = indent + (isLast ? '    ' : '│   ');
          printDeps(dep.depends_on, newIndent);
        }
      } else {
        console.log(`${indent}${branch} ? ${depSeq} - NOT FOUND`);
      }
    }
  };

  printDeps(target.depends_on);
}

function cmdBlocked(feature?: string): void {
  const features = feature ? [feature] : getFeatureDirs();

  console.log('\n=== Blocked Tasks ===\n');

  for (const f of features) {
    const subtasks = loadSubtasks(f);
    const completedSeqs = new Set(
      subtasks.filter((s: Subtask) => s.status === 'completed').map((s: Subtask) => s.seq)
    );

    const blocked = subtasks.filter((s: Subtask) => {
      if (s.status === 'blocked') return true;
      if (s.status !== 'pending') return false;
      return !s.depends_on.every((dep: string) => completedSeqs.has(dep));
    });

    if (blocked.length > 0) {
      console.log(`[${f}]`);
      for (const s of blocked) {
        const waitingFor = s.depends_on.filter((dep: string) => !completedSeqs.has(dep));
        const reason = s.status === 'blocked'
          ? 'explicitly blocked'
          : `waiting: ${waitingFor.join(', ')}`;
        console.log(`  ${s.seq} - ${s.title} (${reason})`);
      }
      console.log();
    }
  }
}

function cmdComplete(feature: string, seq: string, summary: string): void {
  if (summary.length > 200) {
    console.log('Error: Summary must be max 200 characters');
    process.exit(1);
  }

  const subtasks = loadSubtasks(feature);
  const subtask = subtasks.find((s: Subtask) => s.seq === seq);

  if (!subtask) {
    console.log(`Task ${seq} not found in ${feature}`);
    process.exit(1);
  }

  subtask.status = 'completed';
  subtask.completed_at = new Date().toISOString();
  subtask.completion_summary = summary;

  saveSubtask(feature, subtask);

  // Update task.json counts
  const task = loadTask(feature);
  if (task) {
    const newSubtasks = loadSubtasks(feature);
    task.completed_count = newSubtasks.filter((s: Subtask) => s.status === 'completed').length;
    saveTask(feature, task);
  }

  console.log(`\n✓ Marked ${feature}/${seq} as completed`);
  console.log(`  Summary: ${summary}`);

  if (task) {
    console.log(`  Progress: ${task.completed_count}/${task.subtask_count}`);
  }
}

function cmdValidate(feature?: string): void {
  const features = feature ? [feature] : getFeatureDirs();
  let hasErrors = false;

  console.log('\n=== Validation Results ===\n');

  for (const f of features) {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check task.json exists
    const task = loadTask(f);
    if (!task) {
      errors.push('Missing task.json');
    }

    // Load and validate subtasks
    const subtasks = loadSubtasks(f);
    const seqs = new Set(subtasks.map((s: Subtask) => s.seq));

    for (const s of subtasks) {
      // Check ID format
      if (!s.id.startsWith(f)) {
        errors.push(`${s.seq}: ID should start with feature name`);
      }

      // Check for missing dependencies
      for (const dep of s.depends_on) {
        if (!seqs.has(dep)) {
          errors.push(`${s.seq}: depends on non-existent task ${dep}`);
        }
      }

      // Check for circular dependencies
      const visited = new Set<string>();
      const checkCircular = (currentSeq: string, pathArr: string[]): boolean => {
        if (pathArr.includes(currentSeq)) {
          errors.push(`${s.seq}: circular dependency detected: ${[...pathArr, currentSeq].join(' -> ')}`);
          return true;
        }
        if (visited.has(currentSeq)) return false;
        visited.add(currentSeq);

        const currentTask = subtasks.find((t: Subtask) => t.seq === currentSeq);
        if (currentTask) {
          for (const dep of currentTask.depends_on) {
            if (checkCircular(dep, [...pathArr, currentSeq])) return true;
          }
        }
        return false;
      };
      checkCircular(s.seq, []);

      // Warnings
      if (s.acceptance_criteria.length === 0) {
        warnings.push(`${s.seq}: No acceptance criteria defined`);
      }
      if (s.deliverables.length === 0) {
        warnings.push(`${s.seq}: No deliverables defined`);
      }
    }

    // Check counts match
    if (task && task.subtask_count !== subtasks.length) {
      errors.push(`task.json subtask_count (${task.subtask_count}) doesn't match actual count (${subtasks.length})`);
    }

    // Print results
    console.log(`[${f}]`);
    if (errors.length === 0 && warnings.length === 0) {
      console.log('  ✓ All checks passed');
    } else {
      for (const e of errors) {
        console.log(`  ✗ ERROR: ${e}`);
        hasErrors = true;
      }
      for (const w of warnings) {
        console.log(`  ⚠ WARNING: ${w}`);
      }
    }
    console.log();
  }

  process.exit(hasErrors ? 1 : 0);
}

function cmdArchive(feature: string): void {
  const task = loadTask(feature);
  if (!task) {
    console.log(`Feature ${feature} not found`);
    process.exit(1);
  }

  const subtasks = loadSubtasks(feature);
  const completedCount = subtasks.filter((s: Subtask) => s.status === 'completed').length;

  if (completedCount !== subtasks.length) {
    console.log(`Cannot archive: ${completedCount}/${subtasks.length} tasks completed`);
    process.exit(1);
  }

  // Update task status
  task.status = 'completed';
  task.completed_at = new Date().toISOString();
  saveTask(feature, task);

  // Move to completed
  const srcDir = path.join(ACTIVE_DIR, feature);
  const destDir = path.join(COMPLETED_DIR, feature);
  ensureDir(COMPLETED_DIR);
  fs.renameSync(srcDir, destDir);

  console.log(`\n✓ Archived ${feature} to .tmp/tasks/completed/`);
}

// Main
const [,, command, ...args] = process.argv;

switch (command) {
  case 'init':
    cmdInit();
    break;
  case 'status':
    cmdStatus(args[0]);
    break;
  case 'next':
    cmdNext(args[0]);
    break;
  case 'parallel':
    cmdParallel(args[0]);
    break;
  case 'deps':
    if (args.length < 2) {
      console.log('Usage: deps <feature> <seq>');
      process.exit(1);
    }
    cmdDeps(args[0], args[1]);
    break;
  case 'blocked':
    cmdBlocked(args[0]);
    break;
  case 'complete':
    if (args.length < 3) {
      console.log('Usage: complete <feature> <seq> "summary"');
      process.exit(1);
    }
    cmdComplete(args[0], args[1], args.slice(2).join(' '));
    break;
  case 'validate':
    cmdValidate(args[0]);
    break;
  case 'archive':
    if (!args[0]) {
      console.log('Usage: archive <feature>');
      process.exit(1);
    }
    cmdArchive(args[0]);
    break;
  default:
    console.log(`
Task Management CLI

Location: .tmp/tasks/active/{feature}/ and .tmp/tasks/completed/{feature}/

Usage: npx ts-node .opencode/scripts/task-cli.ts <command> [args...]

Commands:
  init                              Create .tmp/tasks/ directory structure
  status [feature]                  Show task status summary
  next [feature]                    Show next eligible tasks (deps satisfied)
  parallel [feature]                Show parallel tasks ready to run
  deps <feature> <seq>              Show dependency tree for a task
  blocked [feature]                 Show blocked tasks and why
  complete <feature> <seq> "summary" Mark task completed with summary
  validate [feature]                Validate JSON files and dependencies
  archive <feature>                 Move completed feature to completed/

Examples:
  npx ts-node .opencode/scripts/task-cli.ts init
  npx ts-node .opencode/scripts/task-cli.ts status
  npx ts-node .opencode/scripts/task-cli.ts next my-feature
  npx ts-node .opencode/scripts/task-cli.ts complete my-feature 02 "Implemented auth module"
`);
}
