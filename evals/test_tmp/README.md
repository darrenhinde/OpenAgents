# Test Temporary Directory

This directory is used for temporary test files and artifacts generated during evaluation runs.

## Installation

### Prerequisites

- **Node.js**: Version 20.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)

### Installation Steps

1. **Install root project dependencies**

   From the project root directory:
   ```bash
   npm install
   ```

2. **Install evaluation framework dependencies**

   ```bash
   cd evals/framework
   npm install
   ```

   Or from the project root:
   ```bash
   npm run dev:setup
   ```

3. **Build the evaluation framework**

   ```bash
   cd evals/framework
   npm run build
   ```

   Or from the project root:
   ```bash
   npm run dev:build
   ```

### Verify Installation

Run the following command to verify the installation:

```bash
npm run test:ci
```

This will run a basic test suite to ensure everything is set up correctly.

### Common Commands

- **Run all tests**: `npm run test:all`
- **Run OpenAgent tests**: `npm run test:openagent`
- **Run OpenCoder tests**: `npm run test:opencoder`
- **View test results**: `npm run results:latest`
- **Start results dashboard**: `npm run dashboard`

For more detailed testing options, see the root `package.json` scripts section.
