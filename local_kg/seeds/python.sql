INSERT INTO patterns (id, signature, category, description, solution, occurrence_count) VALUES
(
    'seed-python-001',
    'python_circular_import',
    'ImportError',
    'cannot import name X from partially initialized module Y (most likely due to a circular import)',
    'Two modules import each other. Solution: Move one import inside a function/method, or refactor shared logic into a third separate module.',
    50
),
(
    'seed-python-002',
    'python_mutable_default',
    'LogicError',
    'List argument keeps growing across function calls',
    'Mutable default argument (list/dict). Solution: Use None as default value and initialize inside the function (if arg is None: arg = []).',
    45
),
(
    'seed-python-003',
    'python_key_error',
    'KeyError',
    'Dictionary key lookup failed',
    'Accessing non-existent key. Solution: Use .get() method for safe access or check if key in dict before accessing.',
    60
);

