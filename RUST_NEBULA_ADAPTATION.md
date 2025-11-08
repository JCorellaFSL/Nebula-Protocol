# Rust Nebula Framework Adaptation

**⚠️ UPDATED:** November 2024 - Constellations, Star Systems, Star Gates terminology + Docker API support

## Overview
This document adapts the Nebula Context Engineering Protocol specifically for pure Rust development projects, incorporating Rust-specific tools, patterns, and best practices for systems programming, CLI tools, backend services, WebAssembly, and high-performance applications.

### Integration Options
- **MCP Server:** Local IDE integration (Cursor, VSCode) via Model Context Protocol
- **Docker API:** REST API access for remote/centralized deployment (recommended for Rust projects)
- **Hybrid:** Use both - MCP for local development, API for CI/CD and team collaboration
- **Central KG:** Connect to PostgreSQL-backed Knowledge Graph for cross-project learning

## Rust-Specific Constellation Content Structure

### 1. Constellation Overview
- **Rust Context:** Project type implications (CLI, web server, library, WebAssembly, embedded)
- **Architecture Considerations:** Async/sync, single-threaded/multi-threaded design
- **Safety Requirements:** Memory safety, thread safety, error handling patterns
- **Performance Goals:** Zero-cost abstractions, performance benchmarks
- **Dependency Management:** Cargo.toml dependencies and feature flags

### 2. Detailed Sub-Tasks
- **Module Development:** Rust modules and crates to be implemented (test with cargo test)
- **API Design:** Public interfaces, trait implementations (validate with examples)
- **Error Handling:** Result/Error types and error propagation (test error scenarios)
- **Dependencies:** Crates from crates.io (validate compatibility and features)
- **Unsafe Code:** Justification and safety documentation (review and test thoroughly)
- **Testing Requirement:** Each sub-task must include Rust-specific validation method

### 3. Technical Implementation Details

#### Rust-Specific Sections:
- **Project Structure:**
  - Cargo workspace organization
  - Module tree and visibility design
  - Build configuration and features
  - Procedural macro organization

- **Type System Design:**
  - Ownership and lifetime strategies
  - Trait design and implementation
  - Generic programming patterns
  - Zero-sized type optimizations

- **Concurrency Architecture:**
  - Thread management strategies
  - Async/await runtime selection (tokio, async-std)
  - Channel-based communication
  - Atomic operations and lock-free patterns

- **Error Handling:**
  - Custom error types with thiserror/snafu
  - Error propagation patterns
  - Result combinators and error chains
  - Panic vs. recoverable error strategy

- **Performance Optimization:**
  - Memory layout and alignment
  - Allocation strategies
  - Inline optimization hints
  - Profile-guided optimization

### 4. Testing Strategy

#### Rust Testing Approach:
- **Unit Tests:** Module-level testing with #[cfg(test)]
- **Integration Tests:** tests/ directory for black-box testing
- **Doc Tests:** Documentation examples as tests
- **Benchmark Tests:** Performance regression testing with criterion
- **Property Tests:** QuickCheck/proptest for property-based testing

#### Testing Tools:
- **cargo test:** Built-in test runner
- **cargo-nextest:** Faster test execution
- **criterion:** Benchmarking framework
- **proptest:** Property-based testing
- **cargo-tarpaulin:** Code coverage measurement
- **cargo-mutants:** Mutation testing

### 5. Potential Challenges

#### Rust-Specific Challenges:
- **Ownership Complexity:** Managing ownership, borrowing, and lifetimes
- **Async Runtime Selection:** Choosing between tokio, async-std, smol
- **Compile Times:** Managing long compilation times in large projects
- **Unsafe Code:** Validating safety of unsafe operations
- **C Interop:** FFI boundary safety and correctness
- **Error Ergonomics:** Balancing error detail with usability

### 6. Acceptance Criteria

#### Rust-Specific Criteria:
- **Compilation:** Zero warnings with clippy on strict settings
- **Test Coverage:** High coverage with cargo-tarpaulin
- **Performance:** Benchmarks meet specified requirements
- **Memory Safety:** No memory leaks detected by valgrind/miri
- **Documentation:** Complete rustdoc coverage with examples
- **API Stability:** Semantic versioning compliance for public APIs

## Rust Project Phase Examples

### Phase 0: Rust Setup (→ 0.1.0)
- **Constellation:** `ROADMAP_PHASE_0_RUST_SETUP.md`
- **Focus:** Environment setup, project structure, **LOGGING INFRASTRUCTURE**
- **Key Tasks:**
  - Rust toolchain installation (rustup, rustc, cargo)
  - Project initialization with cargo new/cargo init
  - **Initialize logging (tracing or env_logger)**
  - **Create `.nebula/logs/` directory structure**
  - **Initialize project memory (via MCP server or Docker API)**
  - Development tools configuration (rust-analyzer, rustfmt, clippy)
  - CI/CD pipeline setup (GitHub Actions, GitLab CI)
- **Exit Condition:** Logging operational, project memory initialized, basic project compiles

### Phase 1: Core Rust Architecture
- **Constellation:** `ROADMAP_PHASE_1_RUST_CORE.md`
- **Focus:** Core types, traits, module structure, error handling
- **Key Tasks:**
  - Core data structures and types
  - Trait definitions and implementations
  - Error type hierarchy
  - Module organization and visibility
  - **Backend-Only Warning:** No Phase 1 completion without Phase 1.5 UI

### Phase 1.5: Basic UI (MANDATORY)
- **Constellation:** `ROADMAP_PHASE_1.5_BASIC_UI.md`
- **Focus:** CLI interface, web interface, or API endpoints
- **Key Tasks:**
  - CLI argument parsing (clap, structopt) OR
  - Web server setup (actix-web, axum, rocket) OR
  - TUI interface (ratatui, cursive)
  - Basic user interaction flows
  - Help messages and usage examples
  - Error message formatting for users
- **Quality Gate:** Manual testing shows working, usable interface

### Phase 2: Feature Development
- **Constellation:** `ROADMAP_PHASE_2_RUST_FEATURES.md`
- **Focus:** Specific features with integrated functionality
- **Key Tasks:**
  - Feature-specific modules and functions
  - Async operations (if applicable)
  - Database integration (diesel, sqlx)
  - External API integration
  - **Both UI and Backend:** Features include user-facing components
- **Quality Gate:** Review Phase 0-2 for conflicts, create Phase 2.xx if needed

### Phase 3: Integration & Testing (→ 0.5.0)
- **Constellation:** `ROADMAP_PHASE_3_RUST_INTEGRATION.md`
- **Focus:** Integration testing, optimization, platform-specific code
- **Key Tasks:**
  - Integration test suite
  - Performance profiling and optimization
  - Platform-specific implementations
  - Security audit and unsafe code review
  - Error pattern documentation in project memory
- **Quality Gate:** Review all phases for integration issues
- **Exit Condition:** All tests passing, performance benchmarks met

### Phase 3.5: UI Polish (→ 0.6.0) **MANDATORY - DO NOT SKIP**
- **Constellation:** `ROADMAP_PHASE_3.5_UI_POLISH.md`
- **Focus:** User experience refinement
- **Key Tasks:**
  - CLI: Better help messages, progress bars, colors
  - Web: Improved error pages, loading states
  - TUI: Keyboard shortcuts, visual polish
  - API: Better error responses, documentation
  - User feedback integration
- **Quality Gate:** UX review, documentation review
- **Exit Condition:** Professional user experience, ready for public release

### Phase 4: Deployment (→ 1.0.0)
- **Constellation:** `ROADMAP_PHASE_4_RUST_DEPLOYMENT.md`
- **Focus:** Release builds, distribution, documentation
- **Key Tasks:**
  - Release build optimization
  - Cross-compilation for target platforms
  - Package distribution (cargo publish, binary releases)
  - Documentation finalization
  - **Version bump to 1.0.0**
- **Quality Gate:** Final review, all tests passing, benchmarks met
- **Exit Condition:** Released and available to users

## Rust Immediate Validation Approach

### Compile-Time Validation
- **Type Checking:** Leverage Rust's type system for correctness
- **Lifetime Analysis:** Validate borrowing and lifetimes
- **Clippy Lints:** Catch common mistakes and antipatterns
- **Cargo Check:** Fast syntax and type checking

### Runtime Testing
- **Unit Tests:** Test individual functions and modules
```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_feature() {
        let result = my_function(input);
        assert_eq!(result, expected);
    }
}
```

- **Integration Tests:** Test public API
```rust
// tests/integration_test.rs
use my_crate::*;

#[test]
fn test_api_workflow() {
    let instance = MyStruct::new();
    let result = instance.process();
    assert!(result.is_ok());
}
```

- **Doc Tests:** Test documentation examples
```rust
/// Processes data and returns result
/// 
/// # Example
/// ```
/// let result = process_data(input);
/// assert_eq!(result, 42);
/// ```
pub fn process_data(input: i32) -> i32 {
    input * 2
}
```

### Performance Validation
- **Benchmarks:** Measure performance with criterion
```rust
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn benchmark_function(c: &mut Criterion) {
    c.bench_function("my_function", |b| {
        b.iter(|| my_function(black_box(100)))
    });
}

criterion_group!(benches, benchmark_function);
criterion_main!(benches);
```

- **Profiling:** Use cargo-flamegraph, perf, or valgrind
```bash
cargo flamegraph --bin my-app
```

## Rust Logging Infrastructure (Phase 0 Requirement)

### Logging Setup with Tracing
```rust
// src/main.rs or src/lib.rs
use tracing::{info, warn, error, debug};
use tracing_subscriber::{fmt, prelude::*, EnvFilter};
use std::fs::OpenOptions;

pub fn init_logging() -> Result<(), Box<dyn std::error::Error>> {
    // Create .nebula/logs directory
    std::fs::create_dir_all(".nebula/logs")?;
    
    // File appender for persistent logs
    let file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(".nebula/logs/app.log")?;
    
    let file_layer = fmt::layer()
        .json()
        .with_writer(std::sync::Arc::new(file));
    
    // Console layer for development
    let console_layer = fmt::layer()
        .pretty()
        .with_writer(std::io::stderr);
    
    tracing_subscriber::registry()
        .with(EnvFilter::from_default_env()
            .add_directive(tracing::Level::INFO.into()))
        .with(console_layer)
        .with(file_layer)
        .init();
    
    info!("Logging initialized - Phase 0 complete");
    Ok(())
}

fn main() {
    init_logging().expect("Failed to initialize logging");
    info!("Application starting");
    
    // Your application logic here
}
```

### Structured Logging
```rust
use tracing::{info, error, instrument};

#[instrument]
pub fn process_request(user_id: u64, request_type: &str) -> Result<(), Error> {
    info!(
        user_id = user_id,
        request_type = request_type,
        phase = "2.1",
        constellation = "API_LAYER",
        "Processing request"
    );
    
    match handle_request(user_id, request_type) {
        Ok(()) => {
            info!("Request processed successfully");
            Ok(())
        }
        Err(e) => {
            error!(
                error = %e,
                user_id = user_id,
                "Request processing failed"
            );
            // Log to project memory
            log_to_project_memory(&e, "2.1", "API_LAYER");
            Err(e)
        }
    }
}
```

## Error Handling Patterns

### Custom Error Types
```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum MyError {
    #[error("Database connection failed: {0}")]
    DatabaseError(String),
    
    #[error("Invalid configuration: {field}")]
    ConfigError { field: String },
    
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
}

// Log errors to project memory
impl MyError {
    pub fn log_to_memory(&self, phase: &str, constellation: &str) {
        // Integration with project memory system
        tracing::error!(
            error = %self,
            phase = phase,
            constellation = constellation,
            "Error occurred and logged to project memory"
        );
    }
}
```

### Result Patterns
```rust
pub type Result<T> = std::result::Result<T, MyError>;

pub fn my_function() -> Result<String> {
    let config = load_config()?; // Propagate errors
    let data = process_data(config)?;
    Ok(data)
}
```

## Rust-Specific Validation Workflows

### 1. Code Quality Check
```bash
# Format code
cargo fmt --all -- --check

# Run clippy with strict settings
cargo clippy --all-targets --all-features -- -D warnings

# Check for common mistakes
cargo audit  # Security vulnerabilities
```

### 2. Testing Workflow
```bash
# Run all tests
cargo test --all-features

# Run tests with output
cargo test -- --nocapture

# Run specific test
cargo test test_name

# Test with coverage
cargo tarpaulin --out Html
```

### 3. Performance Validation
```bash
# Run benchmarks
cargo bench

# Profile the application
cargo flamegraph --bin my-app -- args

# Check binary size
cargo bloat --release --crates
```

### 4. Memory Safety Validation
```bash
# Run miri for undefined behavior detection
cargo +nightly miri test

# Check for memory leaks (Linux)
valgrind --leak-check=full ./target/debug/my-app

# Address sanitizer
RUSTFLAGS="-Z sanitizer=address" cargo +nightly run
```

## Quality Gates for Rust Projects

### Post-Constellation Review Checklist
- [ ] All tests pass (`cargo test --all-features`)
- [ ] No clippy warnings (`cargo clippy -- -D warnings`)
- [ ] Code formatted (`cargo fmt --check`)
- [ ] Documentation complete (`cargo doc --no-deps`)
- [ ] Benchmarks meet requirements (if applicable)
- [ ] Error handling comprehensive
- [ ] Logging integrated with project memory
- [ ] Unsafe code justified and documented
- [ ] Public API follows Rust API guidelines
- [ ] CHANGELOG updated
- [ ] Version incremented appropriately

## Project Memory Integration

### Logging Errors to Project Memory
```rust
use serde_json::json;

pub fn log_error_to_memory(
    error: &dyn std::error::Error,
    phase: &str,
    constellation: &str,
    file: &str,
    line: u32,
) {
    let error_entry = json!({
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "level": "ERROR",
        "phase": phase,
        "constellation": constellation,
        "file": file,
        "line": line,
        "message": error.to_string(),
        "context": {
            "backtrace": std::backtrace::Backtrace::capture().to_string()
        }
    });
    
    // Write to .nebula/logs/errors.log
    if let Ok(mut file) = OpenOptions::new()
        .create(true)
        .append(true)
        .open(".nebula/logs/errors.log")
    {
        let _ = writeln!(file, "{}", error_entry);
    }
}
```

## Rust Tooling Ecosystem

### Essential Tools
- **rustup:** Toolchain management
- **cargo:** Package manager and build tool
- **rustfmt:** Code formatting
- **clippy:** Linting and best practices
- **rust-analyzer:** IDE support

### Development Tools
- **cargo-watch:** Auto-rebuild on file changes
- **cargo-expand:** Macro expansion viewer
- **cargo-edit:** Dependency management helpers
- **cargo-outdated:** Check for outdated dependencies
- **cargo-tree:** Dependency tree visualization

### Testing Tools
- **cargo-nextest:** Faster test runner
- **cargo-tarpaulin:** Code coverage
- **cargo-mutants:** Mutation testing
- **criterion:** Benchmarking

### Analysis Tools
- **cargo-audit:** Security vulnerability scanning
- **cargo-bloat:** Binary size analysis
- **cargo-flamegraph:** Performance profiling
- **miri:** Undefined behavior detection

## Platform-Specific Considerations

### CLI Applications
- **Argument Parsing:** clap, structopt
- **Terminal UI:** ratatui, cursive
- **Progress Indicators:** indicatif
- **Colored Output:** colored, termcolor

### Web Services
- **Async Runtimes:** tokio, async-std
- **Web Frameworks:** actix-web, axum, rocket
- **Serialization:** serde, serde_json
- **Database:** diesel, sqlx

### WebAssembly
- **Target:** wasm32-unknown-unknown
- **Interop:** wasm-bindgen
- **Web APIs:** web-sys
- **Size Optimization:** wasm-opt, wasm-snip

### Embedded Systems
- **no_std Development:** Core library only
- **Hardware Abstraction:** embedded-hal
- **RTOS:** RTIC, Embassy
- **Debugging:** probe-rs, OpenOCD

## Success Metrics

### Code Quality
- Zero clippy warnings on `cargo clippy -- -D warnings`
- 100% rustfmt compliance
- >80% test coverage
- Complete documentation with examples

### Performance
- Meet specified performance benchmarks
- Binary size within targets
- Memory usage within constraints
- Zero memory leaks

### Safety
- No unsafe code without justification
- All unsafe code documented and reviewed
- Miri tests pass (for unsafe code)
- No security vulnerabilities (cargo audit)

## Next Steps

1. **Phase 0:** Setup Rust environment with logging
2. **Initialize Project Memory:** Create `.nebula/` structure
3. **Core Development:** Build with mandatory UI phases
4. **Quality Gates:** Review after each constellation
5. **Error Tracking:** Log all errors to project memory
6. **Performance:** Benchmark and optimize
7. **Documentation:** Complete rustdoc with examples
8. **Release:** Build and distribute with proper versioning

---

**Ready to build safe, fast, and reliable systems with Rust and structured context engineering? Start your Nebula journey today!**

