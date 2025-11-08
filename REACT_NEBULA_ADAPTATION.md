# React/Next.js Nebula Framework Adaptation

**⚠️ UPDATED:** November 2024 - Constellations, Star Systems, Star Gates terminology + Docker API support

## Overview
This document adapts the Nebula Context Engineering Protocol specifically for React and Next.js development projects, incorporating React-specific patterns, modern hooks, state management, and server-side rendering best practices.

### Integration Options
- **MCP Server:** Local IDE integration (Cursor, VSCode) via Model Context Protocol
- **Docker API:** REST API access for remote/centralized deployment
- **Hybrid:** Use both - MCP for local development, API for team collaboration
- **Central KG:** Connect to PostgreSQL-backed Knowledge Graph for cross-project learning

---

## React-Specific Constellation Content Structure

### 1. Constellation Overview
- **React Context:** Component architecture and composition patterns
- **Framework Choice:** React (CRA/Vite) vs. Next.js (App Router/Pages Router)
- **State Management:** Context API, Redux, Zustand, Jotai, or Recoil
- **Routing:** React Router vs. Next.js routing
- **Styling:** CSS Modules, Tailwind, styled-components, Emotion, or CSS-in-JS
- **Server Strategy:** CSR, SSR, SSG, ISR (Next.js)

### 2. Detailed Sub-Tasks
- **Component Development:** Functional components with hooks (test immediately with React Testing Library)
- **State Management:** Global state setup and patterns (validate state updates)
- **API Integration:** Data fetching with SWR, React Query, or native fetch (test with MSW)
- **Performance:** Code splitting, lazy loading, memoization (measure with React DevTools)
- **Testing Requirement:** Each sub-task must include React-specific validation

### 3. Technical Implementation Details

#### React-Specific Sections:

**Component Architecture:**
- Component composition patterns
- Custom hooks design
- Props vs. Context decisions
- Component lifecycle optimization

**State Management:**
- Local state (useState, useReducer)
- Global state strategy selection
- State persistence patterns
- Optimistic updates

**Rendering Strategy (Next.js):**
- Server Components vs. Client Components
- App Router vs. Pages Router
- Static Site Generation (SSG)
- Incremental Static Regeneration (ISR)
- Server-Side Rendering (SSR)

**Data Fetching:**
- SWR configuration
- React Query setup
- Next.js data fetching patterns
- API route integration
- Caching strategies

**Styling Approach:**
- CSS Modules configuration
- Tailwind CSS setup
- styled-components/Emotion integration
- Global styles management
- Theme system design

---

## React/Next.js Standard Project Constellations

### Constellation 0: Setup & Foundation (→ 0.1.0.0)

**Strategic Overview:**
Establish React/Next.js development environment with proper tooling, linting, and testing infrastructure.

**Star Systems:**
- **0.1:** Environment Setup
  - Node.js installation (18+ recommended)
  - Package manager selection (npm, yarn, pnpm, bun)
  - Project initialization (Next.js recommended: `npx create-next-app@latest`)
  - TypeScript configuration (recommended)
  - ESLint + Prettier setup
  - **Initialize project memory (via MCP server or Docker API)**

- **0.2:** Development Tools
  - VS Code extensions (ES7+ React snippets, ESLint, Prettier)
  - React DevTools browser extension
  - Next.js DevTools (if using Next.js)
  - Git hooks with Husky and lint-staged
  - CI/CD pipeline basics

**Star Gate 0:** Environment validated, project builds successfully, linting passes

---

### Constellation 1: Core Architecture (→ 0.2.0.0)

**Strategic Overview:**
Build foundational application structure, routing, and core components.

**Star Systems:**
- **1.1:** Project Structure
  ```
  src/
  ├── app/              # Next.js App Router
  ├── components/       # Reusable components
  │   ├── ui/          # UI primitives
  │   └── features/    # Feature components
  ├── lib/             # Utilities and helpers
  ├── hooks/           # Custom React hooks
  ├── types/           # TypeScript types
  └── styles/          # Global styles
  ```

- **1.2:** Routing Setup
  - Next.js App Router configuration (recommended)
  - Or: React Router setup (if not using Next.js)
  - Layout components
  - Navigation components
  - Route guards/middleware

- **1.3:** Core Components
  - Layout components (Header, Footer, Sidebar)
  - UI primitives (Button, Input, Card, etc.)
  - Error boundaries
  - Loading states
  - 404 page

**Star Gate 1:** Core structure complete, routing works, basic pages render

---

### Constellation 2: State Management & Data (→ 0.3.0.0)

**Strategic Overview:**
Implement state management solution and API integration patterns.

**Star Systems:**
- **2.1:** State Management
  - Choose approach:
    - **Context API** (simple apps)
    - **Zustand** (recommended for medium complexity)
    - **Redux Toolkit** (complex apps)
    - **Jotai/Recoil** (atomic state)
  - Store configuration
  - State slices/atoms
  - Selectors and actions

- **2.2:** Data Fetching
  - Choose library:
    - **React Query/TanStack Query** (recommended)
    - **SWR** (Next.js recommended)
    - **Apollo Client** (GraphQL)
  - Query/mutation setup
  - Cache configuration
  - Error handling
  - Loading states

- **2.3:** API Integration
  - API client setup (Axios/fetch)
  - Environment variables (.env.local)
  - API routes (Next.js) or backend proxy
  - Authentication setup
  - Error handling middleware

**Star Gate 2:** State management working, API calls successful, data displays correctly

---

### Constellation 3: Feature Development (→ 0.4.0.0)

**Strategic Overview:**
Build core application features with proper component composition and testing.

**Star Systems:**
- **3.1:** Authentication (if needed)
  - Login/Register forms
  - Protected routes
  - Session management
  - NextAuth.js integration (recommended for Next.js)

- **3.2:** Core Features
  - Feature-specific components
  - Business logic in custom hooks
  - Form handling (React Hook Form recommended)
  - Form validation (Zod/Yup)

- **3.3:** User Interactions
  - Modal/Dialog components
  - Toast notifications
  - Dropdown menus
  - Tooltips and popovers

**Star Gate 3:** All features functional, forms validated, user interactions smooth

---

### Constellation 4: Performance & Polish (→ 0.5.0.0)

**Strategic Overview:**
Optimize performance, add animations, and polish the user experience.

**Star Systems:**
- **4.1:** Performance Optimization
  - Code splitting with React.lazy
  - Next.js dynamic imports
  - Image optimization (next/image)
  - Font optimization (next/font)
  - Memoization (useMemo, useCallback, React.memo)
  - Bundle analysis (next/bundle-analyzer)

- **4.2:** UI Polish
  - Animations (Framer Motion recommended)
  - Transitions and micro-interactions
  - Loading skeletons
  - Empty states
  - Error states

- **4.3:** Accessibility
  - ARIA labels
  - Keyboard navigation
  - Screen reader testing
  - Color contrast validation
  - Focus management

**Star Gate 4:** Performance metrics green, animations smooth, accessibility compliant

---

### Constellation 5: Testing & Quality (→ 0.6.0.0)

**Strategic Overview:**
Comprehensive testing coverage and quality assurance.

**Star Systems:**
- **5.1:** Unit Testing
  - Jest configuration
  - React Testing Library setup
  - Component tests
  - Custom hook tests
  - Utility function tests
  - Coverage targets (80%+)

- **5.2:** Integration Testing
  - API mocking with MSW
  - User flow tests
  - Form submission tests
  - Navigation tests

- **5.3:** E2E Testing
  - Playwright or Cypress setup
  - Critical user journeys
  - Cross-browser testing
  - Mobile responsive testing

**Star Gate 5:** 80%+ test coverage, all E2E tests passing, no critical bugs

---

### Constellation 6: Deployment & Monitoring (→ 1.0.0.0)

**Strategic Overview:**
Production deployment with monitoring and analytics.

**Star Systems:**
- **6.1:** Build Optimization
  - Production build configuration
  - Environment variables management
  - Static asset optimization
  - Bundle size optimization

- **6.2:** Deployment
  - **Vercel** (recommended for Next.js)
  - Or: Netlify, AWS Amplify, Docker
  - CI/CD pipeline
  - Preview deployments
  - Production deployment

- **6.3:** Monitoring
  - Error tracking (Sentry)
  - Analytics (Google Analytics, Plausible)
  - Performance monitoring (Vercel Analytics)
  - User feedback collection

**Star Gate 6:** Deployed to production, monitoring active, metrics being collected

---

## React/Next.js Specific Testing

### Component Testing Pattern
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Hook Testing Pattern
```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '@/hooks/useCounter';

describe('useCounter', () => {
  it('increments count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

### API Integration Testing
```typescript
import { server } from '@/mocks/server';
import { rest } from 'msw';

it('fetches user data', async () => {
  server.use(
    rest.get('/api/user', (req, res, ctx) => {
      return res(ctx.json({ name: 'John Doe' }));
    })
  );

  render(<UserProfile />);
  
  expect(await screen.findByText('John Doe')).toBeInTheDocument();
});
```

---

## React/Next.js Best Practices

### Component Organization
```typescript
// ✅ Good: Single Responsibility
function UserAvatar({ user }) {
  return <img src={user.avatar} alt={user.name} />;
}

function UserName({ user }) {
  return <h2>{user.name}</h2>;
}

// ❌ Bad: Too many responsibilities
function UserCard({ user, onEdit, onDelete, showActions }) {
  // Too much logic in one component
}
```

### Custom Hooks
```typescript
// ✅ Good: Reusable logic
function useUser(userId) {
  const { data, error, isLoading } = useSWR(
    `/api/users/${userId}`,
    fetcher
  );

  return {
    user: data,
    isLoading,
    isError: error
  };
}

// Usage
const { user, isLoading } = useUser('123');
```

### Server Components (Next.js 13+)
```typescript
// ✅ Server Component (default in App Router)
async function UserList() {
  const users = await fetchUsers(); // Server-side fetch
  
  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}

// ✅ Client Component (interactive)
'use client';

function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

---

## Common React Patterns

### Compound Components
```typescript
function Select({ children }) {
  const [selected, setSelected] = useState(null);
  
  return (
    <SelectContext.Provider value={{ selected, setSelected }}>
      <div className="select">{children}</div>
    </SelectContext.Provider>
  );
}

Select.Option = function Option({ value, children }) {
  const { selected, setSelected } = useSelectContext();
  return (
    <div onClick={() => setSelected(value)}>
      {children}
    </div>
  );
};
```

### Render Props
```typescript
function DataFetcher({ url, render }) {
  const { data, loading } = useFetch(url);
  return render({ data, loading });
}

// Usage
<DataFetcher 
  url="/api/users"
  render={({ data, loading }) => (
    loading ? <Spinner /> : <UserList users={data} />
  )}
/>
```

### HOC Pattern (Less common with hooks)
```typescript
function withAuth<T>(Component: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    const { user } = useAuth();
    
    if (!user) {
      return <Redirect to="/login" />;
    }
    
    return <Component {...props} />;
  };
}
```

---

## Error Handling

### Error Boundaries
```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error tracking service
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

### Query Error Handling
```typescript
function UserProfile() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    retry: 3,
    onError: (error) => {
      toast.error('Failed to load user data');
    }
  });

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return <Profile user={data} />;
}
```

---

## Performance Optimization

### Memoization
```typescript
// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Memoize components
const MemoizedComponent = React.memo(ExpensiveComponent);
```

### Code Splitting
```typescript
// Dynamic imports
const DynamicComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false // Disable SSR if needed
});

// React.lazy
const LazyComponent = React.lazy(() => import('./Component'));

<Suspense fallback={<Spinner />}>
  <LazyComponent />
</Suspense>
```

---

## Recommended Stack

### Minimal Setup
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand or Context API
- **Data:** SWR or React Query
- **Testing:** Vitest + React Testing Library
- **E2E:** Playwright

### Full-Featured Setup
- Everything from Minimal +
- **Forms:** React Hook Form + Zod
- **UI Library:** shadcn/ui or Radix UI
- **Animation:** Framer Motion
- **Auth:** NextAuth.js
- **Database:** Prisma + PostgreSQL
- **Deployment:** Vercel
- **Monitoring:** Sentry + Vercel Analytics

---

## Nebula Protocol Integration

### Error Logging
```typescript
import { logError } from '@/lib/nebula';

function ErrorBoundary({ error }) {
  useEffect(() => {
    logError({
      language: 'TypeScript',
      framework: 'React',
      message: error.message,
      stackTrace: error.stack,
      constellation: 'FEATURES',
      level: 'ERROR'
    });
  }, [error]);

  return <ErrorFallback />;
}
```

### Version Tracking
```typescript
// After completing a feature
await fetch('/api/nebula/version/bump', {
  method: 'POST',
  body: JSON.stringify({ component: 'star_system' })
});
```

---

## Resources

- [React Docs](https://react.dev/)
- [Next.js Docs](https://nextjs.org/docs)
- [React Query](https://tanstack.com/query/latest)
- [Testing Library](https://testing-library.com/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Framework:** React 18+ / Next.js 14+  
**Language:** TypeScript recommended  
**Last Updated:** November 2025

