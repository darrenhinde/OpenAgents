# NexusAgent - Build Plan

**Status:** READY TO BUILD  
**Architecture:** CORRECTED & APPROVED

---

## Final Architecture

```
.nexusagent/          # ONLY shareable resources
├── context/         # Shared context (any tool can read)
└── governance/      # Shared governance (any tool can read)

.opencode/           # OpenCode-specific (PRIMARY)
├── agent/           # OpenCode agents (reference @../.nexusagent/context/)
└── command/         # OpenCode commands
```

---

## What We're Building

### Phase 1: Repository Structure
```
nextsystems/nexus/
├── scripts/
│   └── install.sh
├── profiles/
│   ├── default/
│   │   ├── nexusagent/
│   │   └── opencode/
│   ├── governance/
│   │   ├── nexusagent/
│   │   └── opencode/
│   └── content/
│       ├── nexusagent/
│       └── opencode/
└── docs/
```

### Phase 2: Build Order
1. ✅ Default profile (basic orchestration)
2. ✅ Governance profile (data governance)
3. ✅ Content profile (content creation)

---

## Start Building Now

All planning is complete. Architecture is corrected and approved.

**Next Command:** Start building the actual repository structure.
