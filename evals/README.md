# OpenCode Agent Evaluation Framework

Comprehensive SDK-based evaluation framework for testing OpenCode agents with real execution, event streaming, and automated violation detection.

---

## 🚀 Quick Start

```bash
# CI/CD - Smoke test (30 seconds)
npm run test:ci:openagent

# Development - Core tests (5-8 minutes)
npm run test:core

# Release - Full suite (40-80 minutes)
npm run test:openagent

# View results dashboard
cd evals/results && ./serve.sh
```

**📖 Complete Guide**: See [GUIDE.md](GUIDE.md) for everything you need to know

---

## 📊 Testing Strategy

### Three-Tier Approach

| Tier | Tests | Time | Coverage | Use Case |
|------|-------|------|----------|----------|
| **Smoke** ⚡ | 1 | ~30s | ~10% | CI/CD, every PR |
| **Core** ✅ | 7 | 5-8 min | ~85% | Development, pre-commit |
| **Full** 🔬 | 71 | 40-80 min | 100% | Release validation |

### Current Status

| Agent | Tests | Status |
|-------|-------|--------|
| **OpenAgent** | 71 tests | ✅ Production Ready |
| **Opencoder** | 4 tests | ✅ Production Ready |

---

## 📁 Directory Structure

```
evals/
├── framework/              # Core evaluation engine
│   ├── src/
│   │   ├── sdk/           # Test runner & execution
│   │   ├── evaluators/    # Rule validators (8 types)
│   │   └── collector/     # Session data collection
│   └── package.json
│
├── agents/                # Agent-specific tests
│   ├── openagent/
│   │   ├── config/        # Core test configuration
│   │   ├── tests/         # 71 tests organized by category
│   │   └── docs/
│   └── opencoder/
│       └── tests/
│
├── results/               # Test results & dashboard
│   ├── history/           # Historical results
│   ├── index.html         # Interactive dashboard
│   └── latest.json
│
├── GUIDE.md              # Complete guide (READ THIS)
└── README.md             # This file
```

---

## 🎯 Key Features

✅ **SDK-Based Execution** - Real agent interaction with event streaming  
✅ **Three-Tier Testing** - Smoke (30s), Core (5-8min), Full (40-80min)  
✅ **Sequential Execution** - Rate limiting protection for free tier  
✅ **Cost-Aware** - FREE by default (grok-code-fast)  
✅ **8 Evaluators** - Comprehensive rule validation  
✅ **Interactive Dashboard** - Results visualization and trends  
✅ **CI/CD Ready** - GitHub Actions configured

---

## 📚 Documentation

**Main Guide**: [GUIDE.md](GUIDE.md) - Complete evaluation system guide

**Includes**:
- Quick start and installation
- Three-tier testing strategy (smoke, core, full)
- Architecture and components
- Test schema and examples
- Core tests detailed breakdown
- Results and dashboard
- CI/CD integration
- Troubleshooting
- System review and recommendations

---

## 🎨 Usage Examples

```bash
# Run core tests (recommended for development)
npm run test:core

# Run with specific model
npm run test:core -- --model=anthropic/claude-sonnet-4-5

# Debug mode
npm run test:core -- --debug

# View results
cd evals/results && ./serve.sh
```

**See [GUIDE.md](GUIDE.md) for complete usage examples and test schema**

---

## 🤝 Contributing

See [GUIDE.md](GUIDE.md) for details on:
- Adding new tests
- Creating evaluators
- Modifying core tests

---

## 🆘 Support

**Complete Guide**: [GUIDE.md](GUIDE.md)  
**Issues**: Create an issue on GitHub  
**Questions**: Check GUIDE.md first

---

**Last Updated**: 2024-11-28  
**Framework Version**: 0.1.0  
**Status**: ✅ Production Ready (9/10)  
**Rating**: EXCELLENT
