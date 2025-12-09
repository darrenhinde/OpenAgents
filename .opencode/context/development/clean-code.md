# Clean Code Standards

## General Principles

- Write code for humans to read, not just machines
- Use descriptive names for variables, functions, and classes
- Keep functions small and focused on a single responsibility
- Avoid deep nesting - prefer early returns and guard clauses
- Remove dead code and unnecessary comments
- Use consistent formatting and style

## Naming Conventions

### Variables and Functions
- Use camelCase in JavaScript/TypeScript
- Use snake_case in Python
- Use descriptive names that reveal intent
- Avoid abbreviations unless widely understood
- Boolean variables should be questions (isValid, hasError, canProcess)

### Classes and Types
- Use PascalCase
- Choose names that clearly describe the entity's purpose
- Avoid generic names like Manager, Handler, Processor

## Function Guidelines

- Functions should do one thing well
- Keep functions under 20 lines when possible
- Use descriptive parameter names
- Limit parameters (max 3-4, use objects for more)
- Return early to reduce nesting

## Error Handling

- Use exceptions for exceptional cases, not control flow
- Provide meaningful error messages
- Log errors with sufficient context for debugging
- Handle errors at the appropriate level
- Don't suppress errors without good reason

## Comments and Documentation

- Code should be self-documenting
- Write comments to explain WHY, not WHAT
- Keep comments up to date with code changes
- Use docstrings/JSDoc for public APIs
- Remove obsolete comments