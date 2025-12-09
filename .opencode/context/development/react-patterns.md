# React Patterns and Best Practices

## Component Structure

### Functional Components
Always prefer functional components with hooks over class components:

```jsx
// ✅ Good
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false));
  }, [userId]);
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <UserNotFound />;
  
  return <UserCard user={user} />;
}

// ❌ Avoid class components for new code
class UserProfile extends Component { ... }
```

### Component Organization
```
ComponentName/
├── index.js          // Export only
├── ComponentName.jsx // Main component
├── hooks.js          // Custom hooks
├── styles.module.css // Component styles
└── __tests__/        // Tests
    └── ComponentName.test.jsx
```

## State Management

### Local State with useState
```jsx
// ✅ Good - Separate concerns
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// ❌ Avoid - Single object state
const [state, setState] = useState({ user: null, loading: false, error: null });
```

### Complex State with useReducer
```jsx
const initialState = { user: null, loading: false, error: null };

function userReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, user: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}
```

## Custom Hooks

Extract reusable logic into custom hooks:

```jsx
function useUser(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!userId) return;
    
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);
  
  return { user, loading, error };
}

// Usage
function UserProfile({ userId }) {
  const { user, loading, error } = useUser(userId);
  // ... render logic
}
```

## Performance Optimization

### Memoization
```jsx
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Memoize components
const MemoizedComponent = React.memo(({ data }) => {
  return <ExpensiveComponent data={data} />;
});

// Memoize callbacks
const handleClick = useCallback(() => {
  onItemClick(item.id);
}, [item.id, onItemClick]);
```

### Code Splitting
```jsx
// Lazy load components
const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}
```

## Error Boundaries

```jsx
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    
    return this.props.children;
  }
}
```

## Accessibility

- Use semantic HTML elements
- Provide alt text for images
- Include proper ARIA labels
- Ensure keyboard navigation works
- Test with screen readers

```jsx
// ✅ Good
<button 
  onClick={handleSubmit}
  disabled={isLoading}
  aria-label="Submit form"
>
  {isLoading ? <Spinner /> : 'Submit'}
</button>

// ❌ Avoid
<div onClick={handleSubmit}>Submit</div>
```