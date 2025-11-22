INSERT INTO patterns (id, signature, category, description, solution, occurrence_count) VALUES
(
    'seed-rust-001',
    'rust_borrow_checker_moved',
    'E0382',
    'use of moved value',
    'Variable ownership was transferred to another function or scope. Solution: Use .clone() if type implements Clone, or pass by reference (&var).',
    80
),
(
    'seed-rust-002',
    'rust_lifetime_mismatch',
    'E0621',
    'explicit lifetime required in the type of',
    'Reference lifetime issue. Solution: Add explicit lifetime annotations <''a> to struct or function signatures to tell compiler how long references live.',
    65
),
(
    'seed-rust-003',
    'rust_unwrap_panic',
    'Panic',
    'called `Option::unwrap()` on a `None` value',
    'Unsafe handling of Option/Result. Solution: Use match or if let to handle None/Err cases gracefully, or .expect("msg") for clearer panics.',
    55
);

