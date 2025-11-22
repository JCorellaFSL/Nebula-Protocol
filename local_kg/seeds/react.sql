INSERT INTO patterns (id, signature, category, description, solution, occurrence_count) VALUES
(
    'seed-react-001',
    'react_hydration_mismatch',
    'HydrationError',
    'Text content does not match server-rendered HTML',
    'Common causes: Invalid nesting (<div> inside <p>), random values (Math.random()) in render, or local timestamps. Solution: Use useEffect for non-deterministic renders or suppressHydrationWarning if necessary.',
    50
),
(
    'seed-react-002',
    'react_hook_loop',
    'InfiniteLoop',
    'Maximum update depth exceeded',
    'Effect dependency array is triggering updates that trigger the effect again. Solution: Check useEffect dependencies and ensure state updates are conditional.',
    40
),
(
    'seed-react-003',
    'react_cleanup_memory_leak',
    'MemoryLeak',
    'Can''t perform a React state update on an unmounted component',
    'Async operation completed after component unmounted. Solution: Return a cleanup function from useEffect that cancels the async task or sets an isMounted flag.',
    30
);

