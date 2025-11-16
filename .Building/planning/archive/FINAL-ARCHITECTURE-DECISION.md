# NexusAgent - Final Architecture Decision

**Date:** 2025-10-29  
**Status:** APPROVED FOR BUILD  
**Decision:** OpenCode-First with Shareable Core

---

## The Decision

**Build for OpenCode primarily, make context shareable secondarily.**

### What This Means

```
.opencode/                       # PRIMARY - Full NexusAgent for OpenCode
├── agent/                      # OpenCode agents (full support)
├── command/                    # OpenCode commands (full support)
├── context/                    # SHAREABLE - other tools can read
└── governance/                 # SHAREABLE - other tools can read
```

**OpenCode:** Full feature support, all profiles, complete integration  
**Other Tools:** Can read shared context/governance if compatible (user configures)

---

## Why This Approach

1. **Focus:** 95% effort on making OpenCode experience perfect
2. **Simple:** No multi-tool maintenance burden
3. **Flexible:** Context naturally shareable (markdown + JSON)
4. **Clean:** Standard OpenCode structure
5. **Optional:** Users can bridge to other tools via shared context

---

## What We Build

### Core System (OpenCode)
- ✅ Installation scripts
- ✅ Three profiles (default, governance, content)
- ✅ Full agent system
- ✅ Context-aware orchestration
- ✅ Data governance system
- ✅ Complete documentation

### Optional Helpers
- ✅ Bridge scripts (cursor, claude, aider)
- ✅ Integration examples
- ✅ User can adapt as needed

---

## What We Don't Build

- ❌ Full Cursor integration
- ❌ Full Claude integration  
- ❌ Multiple maintained versions
- ❌ Complex adapter system

---

## Repository Structure

```
nextsystems/nexus/
├── scripts/
│   ├── install.sh              # Main installer
│   └── optional/
│       └── bridge-*.sh         # Optional bridges
├── profiles/
│   ├── default/
│   ├── governance/
│   └── content/
└── docs/
    ├── opencode-usage.md       # Primary docs
    └── optional/
        └── *-integration.md    # Examples
```

---

## Next: Start Building

Now that architecture is finalized, let's build:

1. Create GitHub repository
2. Build installation scripts
3. Build default profile
4. Build governance profile
5. Build content profile
6. Test & document
7. Launch!

**Estimated:** 6 weeks to v1.0
