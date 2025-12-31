# Install Script Collision Handling - Quick Reference

## 🎯 What Changed

The install script now **detects file collisions** before installing and gives you **4 clear options**.

---

## 📊 The Flow

```
┌─────────────────────────────────────┐
│  Select Components to Install       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Scan for Existing Files            │
│  (Check what would be overwritten)  │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌──────┴──────┐
        │ Collisions? │
        └──────┬──────┘
               │
       ┌───────┴────────┐
       │                │
      NO               YES
       │                │
       ▼                ▼
   Install      ┌──────────────────┐
   Everything   │ Show Report      │
                │ Ask User Choice  │
                └────────┬─────────┘
                         │
         ┌───────────────┼───────────────┬──────────────┐
         │               │               │              │
         ▼               ▼               ▼              ▼
    ┌────────┐    ┌──────────┐    ┌──────────┐   ┌────────┐
    │ Skip   │    │Overwrite │    │ Backup & │   │ Cancel │
    │Existing│    │   All    │    │Overwrite │   │        │
    └───┬────┘    └────┬─────┘    └────┬─────┘   └───┬────┘
        │              │               │             │
        ▼              ▼               ▼             ▼
    Install      Install All     Backup Files    Exit
    New Only     (Replace)       Then Install
```

---

## 🎨 The 4 Options Explained

### Option 1: Skip Existing ✅ (SAFEST)
```
What happens:
  ✓ New files → Installed
  ✓ Existing files → Untouched
  ✓ Your changes → Preserved

Use when:
  • You've customized files
  • You only want new components
  • You're doing incremental updates

Example:
  10 selected, 5 exist
  → 5 installed, 5 skipped
```

### Option 2: Overwrite All ⚠️ (DESTRUCTIVE)
```
What happens:
  ✓ New files → Installed
  ✓ Existing files → REPLACED
  ✗ Your changes → LOST

Use when:
  • You want latest versions
  • You haven't customized anything
  • You want to reset to defaults

Requires: Type 'yes' to confirm

Example:
  10 selected, 5 exist
  → 10 installed (5 new, 5 replaced)
```

### Option 3: Backup & Overwrite 🔄 (RECOMMENDED)
```
What happens:
  ✓ Existing files → Backed up
  ✓ New files → Installed
  ✓ Existing files → Replaced
  ✓ Backup → Available for restore

Use when:
  • You want new versions
  • You want safety net
  • You're not sure about changes

Backup location:
  .opencode.backup.YYYYMMDD-HHMMSS/

Example:
  10 selected, 5 exist
  → 5 backed up
  → 10 installed (5 new, 5 replaced)
```

### Option 4: Cancel ❌
```
What happens:
  • Nothing changes
  • Exit cleanly

Use when:
  • You need to review first
  • You want manual backup
  • You're not ready
```

---

## 📋 Collision Report Example

```
⚠ Found 8 file collision(s):

  Agents (2):
    .opencode/agent/core/task-manager.md
    .opencode/agent/core/opencoder.md
    
  Subagents (3):
    .opencode/agent/subagents/reviewer.md
    .opencode/agent/subagents/tester.md
    .opencode/agent/subagents/coder-agent.md
    
  Commands (2):
    .opencode/command/test.md
    .opencode/command/commit.md
    
  Context (1):
    .opencode/context/core/essential-patterns.md
```

**Clear, organized, easy to review!**

---

## 🚀 Quick Decision Guide

| Your Situation | Best Option | Why |
|----------------|-------------|-----|
| First install | Any (no collisions) | Nothing exists yet |
| Adding new components | **Option 1: Skip** | Keeps your customizations |
| Want latest versions | **Option 3: Backup** | Safe update with rollback |
| Reset to defaults | **Option 2: Overwrite** | Clean slate (careful!) |
| Not sure | **Option 4: Cancel** | Review and decide later |

---

## 💡 Pro Tips

### Restore from Backup
```bash
# List backups
ls -la .opencode.backup.*/

# Restore one file
cp .opencode.backup.20251118-143022/.opencode/agent/my-agent.md .opencode/agent/

# Restore everything
rm -rf .opencode
mv .opencode.backup.20251118-143022/.opencode .opencode
```

### Update One File Only
```bash
# Delete the file you want to update
rm .opencode/agent/task-manager.md

# Run installer with "Skip existing"
# Only the deleted file gets reinstalled
```

### See What Changed
```bash
# Compare with backup
diff .opencode/agent/my-agent.md .opencode.backup.*/agent/my-agent.md

# Or use git
git diff .opencode/
```

---

## ✅ Benefits

| Before | After |
|--------|-------|
| ❌ Always overwrites | ✅ Asks first |
| ❌ All-or-nothing | ✅ Flexible strategies |
| ❌ No visibility | ✅ Clear collision report |
| ❌ No backup option | ✅ Optional backup |
| ❌ Risky updates | ✅ Safe incremental updates |

---

## 🎯 Summary

**The install script is now smart:**

1. **Detects** what would be overwritten
2. **Reports** collisions clearly
3. **Asks** how you want to proceed
4. **Respects** your choice
5. **Protects** your work

**You're in control!** 🎉
