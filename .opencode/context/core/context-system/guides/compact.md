# Context Compaction (Minimization)

**Purpose**: Compress verbose content into minimal viable information

**Last Updated**: 2026-01-06

---

## The Compaction Process

Transform verbose explanations → core concepts following MVI principle.

**Formula**:
```
Verbose Content (100+ lines)
  ↓ Extract Core
Core Concept (1-3 sentences)
  ↓ Extract Key Points
Key Points (3-5 bullets)
  ↓ Extract Example
Minimal Example (<10 lines)
  ↓ Add Reference
Link to Full Docs
  ↓ Result
Compact File (<100 lines)
```

---

## Compression Techniques

### 1. Extract Core Concept
**From**: Paragraphs of explanation
**To**: 1-3 sentences capturing essence

**Example**:
```markdown
BEFORE (verbose):
"React Hooks are a new addition to React 16.8 that let you use state 
and other React features without writing a class. They're functions that 
let you "hook into" React state and lifecycle features from function 
components. Hooks don't work inside classes — they let you use React 
without classes. You can also create your own Hooks to reuse stateful 
behavior between different components..."

AFTER (compact):
"Hooks let you use state and lifecycle in function components without 
classes. They're functions that hook into React features (useState, 
useEffect, etc)."
```

**Rule**: If you can't explain it in 3 sentences, you don't understand it yet. Simplify further.

---

### 2. Bulletize Key Points
**From**: Long paragraphs
**To**: 3-5 bullet points

**Example**:
```markdown
BEFORE:
"When using hooks, there are several important rules to follow. First, 
only call hooks at the top level of your function, never inside loops, 
conditions, or nested functions. Second, only call hooks from React 
function components or custom hooks. Third, hooks should be called in 
the same order every render..."

AFTER:
**Key Points**:
- Call hooks at top level only (not in loops/conditions)
- Call from function components or custom hooks only
- Must be called in same order every render
- Names should start with "use" (convention)
```

**Rule**: Each bullet = one key fact. No sub-bullets.

---

### 3. Minimize Examples
**From**: Full implementations
**To**: Smallest working example (<10 lines)

**Example**:
```markdown
BEFORE (50 lines):
import React, { useState, useEffect } from 'react'
import axios from 'axios'

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/users/${userId}`)
        setUser(response.data)
        setError(null)
      } catch (err) {
        setError(err.message)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUser()
  }, [userId])
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!user) return <div>No user found</div>
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}

AFTER (8 lines):
```js
const [count, setCount] = useState(0)

useEffect(() => {
  document.title = `Count: ${count}`
}, [count]) // Re-run when count changes

return <button onClick={() => setCount(count + 1)}>
  Clicked {count} times
</button>
```

**Rule**: Show the simplest case that demonstrates the concept. Link to full examples.

---

### 4. Replace Repetition with References
**From**: Same info repeated in multiple places
**To**: Define once, reference with links

**Example**:
```markdown
BEFORE:
# File A
Authentication uses JWT tokens. JWT tokens are JSON Web Tokens that...

# File B
For auth, we use JWT tokens. JWT tokens are JSON Web Tokens that...

# File C
The JWT token system (JSON Web Tokens) allows us to...

AFTER:
# concepts/jwt.md
"JWT (JSON Web Token) is a stateless authentication method..."

# Other files
See concepts/jwt.md for details.
```

**Rule**: Say it once in concepts/, reference everywhere else.

---

### 5. Convert Prose to Tables
**From**: Paragraphs listing things
**To**: Scannable tables

**Example**:
```markdown
BEFORE:
"There are several important lifecycle methods. componentDidMount runs 
after mounting, componentDidUpdate runs after updates, componentWillUnmount 
runs before unmounting..."

AFTER:
| Method | When It Runs |
|--------|--------------|
| componentDidMount | After mount |
| componentDidUpdate | After update |
| componentWillUnmount | Before unmount |
```

**Rule**: If listing >3 items, use a table or bullets.

---

## Compaction Checklist

Before finalizing a context file:

- [ ] Core concept is 1-3 sentences?
- [ ] Key points are 3-5 bullets (no sub-bullets)?
- [ ] Example is <10 lines of code?
- [ ] No repeated explanations?
- [ ] Reference link added for deep dive?
- [ ] File is <200 lines total?
- [ ] Can be scanned in <30 seconds?

If any "no", compress further.

---

## Common Bloat Patterns

### Bloat: Over-Explaining
```markdown
❌ "This is important because it allows you to manage state in a more 
efficient way, which can lead to better performance and cleaner code..."

✅ "Manages state efficiently"
```

### Bloat: Historical Context
```markdown
❌ "Before React 16.8, we used class components. Then hooks were 
introduced to solve several problems with classes..."

✅ Skip history unless critical. Just explain current approach.
```

### Bloat: Multiple Examples
```markdown
❌ Example 1: useState with counter
   Example 2: useState with string
   Example 3: useState with object
   Example 4: useState with array...

✅ Show ONE simple example. Link to more.
```

### Bloat: Implementation Details
```markdown
❌ "The internal implementation uses a fiber architecture with a 
reconciliation algorithm that diffs the virtual DOM..."

✅ Skip internal details. Just show how to use it.
```

---

## Target Line Counts

| File Type | Target Lines | Max Lines |
|-----------|--------------|-----------|
| Concept | 40-60 | 100 |
| Example | 30-50 | 80 |
| Guide | 60-100 | 150 |
| Lookup | 20-40 | 100 |
| Error | 50-80 | 150 |
| README | 40-60 | 100 |

**Philosophy**: If you hit max lines, split into multiple files or reference external docs.

---

## The 30-Second Rule

<rule id="thirty_second_rule" enforcement="strict">
  Every context file must be scannable in <30 seconds.
  
  If a developer can't grasp the core idea in 30 seconds:
  - File is too verbose
  - Concept is not well explained
  - Needs more compression
</rule>

**Test**: Give file to someone unfamiliar. Can they explain it back in 30 seconds?

---

## Compression Examples

### Before: 150 lines
```markdown
# Authentication System

Our authentication system is built on JSON Web Tokens (JWT), which 
is a standard for securely transmitting information between parties...

[100+ more lines of explanation, edge cases, examples, etc.]
```

### After: 45 lines
```markdown
# Concept: Authentication

**Core Idea**: JWT-based stateless auth. Token in httpOnly cookie, 
verified on every request.

**Key Points**:
- Token has userId + role claims
- Expires in 1 hour (refresh token for renewal)
- Stored in httpOnly cookie (XSS protection)
- Verified via middleware on protected routes

**Quick Example**:
```js
const token = jwt.sign({ userId: 123 }, SECRET, { expiresIn: '1h' })
res.cookie('auth', token, { httpOnly: true })
```

**Reference**: https://docs.company.com/auth
**Related**: examples/jwt-auth.md, errors/auth-errors.md
```

---

## Related

- mvi-principle.md - What MVI is
- harvest.md - When to compact (during extraction)
- templates.md - Standard formats
