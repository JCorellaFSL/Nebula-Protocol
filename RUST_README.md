# Rust Nebula Framework

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Rust](https://img.shields.io/badge/Rust-Framework-orange.svg)](https://www.rust-lang.org)
[![Nebula](https://img.shields.io/badge/Nebula-Context%20Engineering-green.svg)](https://github.com/your-repo/nebula-framework)

## 🚀 Overview

The Rust Nebula Framework is a specialized adaptation of the Nebula Context Engineering Protocol for pure Rust development. It leverages Rust's safety guarantees, zero-cost abstractions, and powerful type system to create reliable, performant systems while maintaining structured context for AI-assisted development.

## 🦀 Why Rust + Nebula?

### Rust Development Challenges
- **Ownership complexity:** Managing borrowing, lifetimes, and ownership
- **Async runtime selection:** Choosing between tokio, async-std, smol
- **Compile times:** Long compilation in larger projects
- **Error handling:** Balancing Result ergonomics with detail
- **Learning curve:** Steep initial learning for new developers

### Nebula Solutions for Rust
- **Type-safe validation:** Leverage compiler for correctness before runtime
- **Structured error tracking:** Log ownership/lifetime issues to project memory
- **Performance validation:** Built-in benchmarking and profiling requirements
- **Pattern library:** Reusable Rust patterns from project memory
- **Immediate testing:** cargo test integration at every step

## 🏗️ Rust Project Structure

```
your-rust-project/
├── ROADMAP.md                               # Main project roadmap
├── ROADMAP_PHASE_0_RUST_SETUP.md           # Setup and configuration
├── ROADMAP_PHASE_1_RUST_CORE.md            # Core architecture
├── ROADMAP_PHASE_1.5_BASIC_UI.md           # MANDATORY: Basic UI/CLI
├── ROADMAP_PHASE_2_RUST_FEATURES.md        # Feature development
├── ROADMAP_PHASE_3_RUST_INTEGRATION.md     # Testing and integration
├── ROADMAP_PHASE_3.5_UI_POLISH.md          # MANDATORY: UI refinement
├── ROADMAP_PHASE_4_RUST_DEPLOYMENT.md      # Deployment
├── docs/
│   └── RUST_NEBULA_ADAPTATION.md           # Framework reference
├── src/
│   ├── main.rs
│   ├── lib.rs
│   ├── models/
│   ├── services/
│   └── utils/
├── tests/
│   ├── integration/
│   └── unit/
├── benches/
│   └── benchmarks.rs
├── Cargo.toml
└── .nebula/
    ├── logs/
    │   ├── dev.log
    │   ├── errors.log
    │   └── prod.log
    └── project_memory.sqlite
```

## 📋 Rust-Specific Phase Flow

### Phase 0: Rust Setup (→ 0.1.0)
**Focus:** Environment, toolchain, logging infrastructure

**Key Validations:**
- ✅ Rust toolchain installed (rustup, cargo, rustc)
- ✅ Project initialized with cargo
- ✅ Logging infrastructure setup (tracing/log)
- ✅ `.nebula/` directory created
- ✅ Project memory initialized
- ✅ CI/CD pipeline configured

**Logging Setup (MANDATORY):**
```rust
// src/main.rs
use tracing::{info, error};
use tracing_subscriber::{fmt, prelude::*, EnvFilter};
use std::fs::OpenOptions;

pub fn init_logging() -> Result<(), Box<dyn std::error::Error>> {
    std::fs::create_dir_all(".nebula/logs")?;
    
    let file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(".nebula/logs/dev.log")?;
    
    let file_layer = fmt::layer()
        .json()
        .with_writer(std::sync::Arc::new(file));
    
    let console_layer = fmt::layer().pretty();
    
    tracing_subscriber::registry()
        .with(EnvFilter::from_default_env())
        .with(console_layer)
        .with(file_layer)
        .init();
    
    info!("Logging initialized - Phase 0");
    Ok(())
}
```

### Phase 1: Core Architecture (→ 0.2.0)
**Focus:** Core types, traits, error handling, module structure

**Key Validations:**
- ✅ Core data structures compile with zero warnings
- ✅ Trait definitions tested
- ✅ Error types comprehensive
- ✅ Module organization clear
- ✅ Documentation with examples

**WARNING:** Phase 1 cannot be completed without Phase 1.5!

### Phase 1.5: Basic UI (→ 0.3.0) **MANDATORY**
**Focus:** Make the application usable and testable

**Options:**
- **CLI Application:** clap for argument parsing
- **TUI Application:** ratatui for terminal UI
- **Web Service:** actix-web/axum for HTTP API
- **Desktop UI:** Integration with Tauri/Dioxus

**Key Validations:**
- ✅ User can interact with all Phase 1 features
- ✅ Help messages clear and comprehensive
- ✅ Error messages user-friendly
- ✅ Manual testing completed
- ✅ Basic functionality demonstrated

**Example CLI:**
```rust
use clap::Parser;

#[derive(Parser)]
#[command(name = "myapp")]
#[command(about = "Description of your app")]
struct Cli {
    #[arg(short, long)]
    verbose: bool,
    
    #[command(subcommand)]
    command: Commands,
}

#[derive(clap::Subcommand)]
enum Commands {
    Run { file: String },
    List,
}
```

**Quality Gate:** Application must be manually testable by non-developers.

### Phase 2: Features (→ 0.4.0)
**Focus:** Feature implementation with UI + backend together

**Key Validations:**
- ✅ Features tested with cargo test
- ✅ User-facing components exist for all features
- ✅ Integration tests pass
- ✅ Performance benchmarks run
- ✅ Error patterns logged to project memory

**Quality Gate:** Review Phases 0-2 for conflicts, create Phase 2.01 if needed.

### Phase 3: Integration & Testing (→ 0.5.0)
**Focus:** Comprehensive testing, optimization, platform-specific code

**Key Validations:**
- ✅ All tests pass (unit, integration, doc)
- ✅ Benchmarks meet targets
- ✅ No clippy warnings
- ✅ Memory safety verified (miri if using unsafe)
- ✅ Documentation complete

### Phase 3.5: UI Polish (→ 0.6.0) **MANDATORY**
**Focus:** Professional, production-ready interface

**CLI Polish:**
- Better help messages with examples
- Progress bars for long operations
- Colored output (termcolor, colored)
- Interactive prompts (dialoguer)

**TUI Polish:**
- Keyboard shortcuts
- Visual refinement
- Responsive layouts
- Status indicators

**Web API Polish:**
- Comprehensive API documentation
- Better error responses
- Rate limiting
- OpenAPI/Swagger specs

**Key Validations:**
- ✅ User experience smooth and intuitive
- ✅ Error messages helpful
- ✅ Documentation complete
- ✅ Professional quality

### Phase 4: Deployment (→ 1.0.0)
**Focus:** Release builds, distribution, documentation

**Key Validations:**
- ✅ Release build optimized
- ✅ Cross-compilation tested
- ✅ Distribution packages created
- ✅ Documentation finalized
- ✅ Security audit passed

## 🔄 Rust Validation Workflow

### 1. Compile & Lint
```bash
# Fast check
cargo check

# Full build
cargo build

# Strict linting
cargo clippy -- -D warnings

# Format check
cargo fmt --check
```

### 2. Test
```bash
# All tests
cargo test

# With output
cargo test -- --nocapture

# Doc tests
cargo test --doc

# Integration tests only
cargo test --test '*'
```

### 3. Benchmark
```bash
# Run benchmarks
cargo bench

# With criterion
cargo criterion
```

### 4. Memory Safety
```bash
# Run miri (detect undefined behavior)
cargo +nightly miri test

# Address sanitizer
RUSTFLAGS="-Z sanitizer=address" cargo +nightly run
```

## 🧪 Testing Strategy

### Unit Tests (src/lib.rs or module files)
```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_feature() {
        let result = my_function(42);
        assert_eq!(result, 84);
    }
    
    #[test]
    #[should_panic(expected = "invalid input")]
    fn test_error_case() {
        my_function(-1);
    }
}
```

### Integration Tests (tests/ directory)
```rust
// tests/integration_test.rs
use my_crate::*;

#[test]
fn test_workflow() {
    let app = App::new();
    let result = app.process();
    assert!(result.is_ok());
}
```

### Benchmarks (benches/ directory)
```rust
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn benchmark(c: &mut Criterion) {
    c.bench_function("my_function", |b| {
        b.iter(|| my_function(black_box(100)))
    });
}

criterion_group!(benches, benchmark);
criterion_main!(benches);
```

## 📊 Error Handling & Project Memory

### Logging Errors to Project Memory
```rust
use tracing::{error, info};

pub fn handle_operation() -> Result<(), AppError> {
    match risky_operation() {
        Ok(value) => {
            info!(phase = "2.1", "Operation successful");
            Ok(value)
        }
        Err(e) => {
            error!(
                phase = "2.1",
                constellation = "FEATURES",
                error = %e,
                "Operation failed"
            );
            // Log to project memory via MCP
            Err(e)
        }
    }
}
```

### Custom Error Types
```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("Parse error: {0}")]
    Parse(String),
    
    #[error("Not found: {0}")]
    NotFound(String),
}
```

## 🔧 Quality Gates

### After Each Constellation
- [ ] All tests pass (`cargo test --all-features`)
- [ ] No clippy warnings (`cargo clippy -- -D warnings`)
- [ ] Code formatted (`cargo fmt --check`)
- [ ] Benchmarks run (if applicable)
- [ ] Documentation updated
- [ ] Errors logged to project memory
- [ ] Manual testing completed

### Decision Point
- **PROCEED:** No issues, continue
- **CREATE SUB-PHASE:** Issues found (e.g., Phase 2.01)
- **ROLLBACK:** Major redesign needed

## 🛠️ Development Tools

### Essential
- **rustup:** Toolchain manager
- **cargo:** Build tool and package manager
- **rustfmt:** Code formatting
- **clippy:** Linting
- **rust-analyzer:** IDE support

### Testing
- **cargo-nextest:** Faster test runner
- **cargo-tarpaulin:** Code coverage
- **criterion:** Benchmarking
- **proptest:** Property-based testing

### Analysis
- **cargo-audit:** Security vulnerabilities
- **cargo-bloat:** Binary size analysis
- **cargo-flamegraph:** Performance profiling
- **miri:** Undefined behavior detection

## 📱 Project Types

### CLI Applications
```toml
[dependencies]
clap = { version = "4", features = ["derive"] }
tracing = "0.1"
tracing-subscriber = "0.3"
anyhow = "1.0"
```

### TUI Applications
```toml
[dependencies]
ratatui = "0.24"
crossterm = "0.27"
tracing = "0.1"
```

### Web Services
```toml
[dependencies]
axum = "0.7"
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
tracing = "0.1"
```

### Library Crates
```toml
[package]
name = "my-lib"
version = "0.1.0"

[dependencies]
# Minimal dependencies

[dev-dependencies]
criterion = "0.5"
```

## 📈 Success Metrics

### Code Quality
- Zero clippy warnings with strict settings
- >80% test coverage
- All public APIs documented
- No unsafe code (or justified and documented)

### Performance
- Benchmarks meet specifications
- Binary size acceptable for target
- Memory usage within limits
- No performance regressions

### Safety
- Miri tests pass (if using unsafe)
- No security vulnerabilities (cargo audit)
- Memory leaks prevented
- Thread safety verified

## 🔮 Quick Start

### 1. Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### 2. Create Project
```bash
cargo new my-nebula-project
cd my-nebula-project
```

### 3. Setup Nebula Structure
```bash
# Copy framework files
cp RUST_NEBULA_ADAPTATION.md docs/
cp RUST_README.md ./

# Create constellation files
touch ROADMAP.md
touch ROADMAP_PHASE_0_RUST_SETUP.md
touch ROADMAP_PHASE_1_RUST_CORE.md
touch ROADMAP_PHASE_1.5_BASIC_UI.md
touch ROADMAP_PHASE_2_RUST_FEATURES.md
touch ROADMAP_PHASE_3_RUST_INTEGRATION.md
touch ROADMAP_PHASE_3.5_UI_POLISH.md
touch ROADMAP_PHASE_4_RUST_DEPLOYMENT.md

# Create Nebula directory
mkdir -p .nebula/logs
```

### 4. Add Dependencies
```toml
[dependencies]
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["json"] }
thiserror = "1.0"
anyhow = "1.0"

[dev-dependencies]
criterion = "0.5"
```

### 5. Initialize Logging
Add the logging initialization code to `src/main.rs` (see Phase 0 above).

### 6. Start Development
```bash
cargo run
cargo test
cargo clippy
```

## 🚨 Common Issues & Solutions

### Issue: Borrow Checker Errors
**Solution:** Log to project memory, reference common patterns
```rust
// Pattern: Use Rc/Arc for shared ownership
use std::rc::Rc;
let shared = Rc::new(data);
```

### Issue: Async Runtime Confusion
**Solution:** Document decision in project memory
```rust
// Decision recorded: Using tokio for better ecosystem support
#[tokio::main]
async fn main() { }
```

### Issue: Long Compile Times
**Solution:** 
- Use `cargo check` during development
- Split into smaller crates
- Use incremental compilation
- Document in project memory

## 🎯 Next Steps

1. **Phase 0:** Setup Rust environment with logging
2. **Initialize Project Memory:** via MCP tools
3. **Core Development:** Follow mandatory UI phases
4. **Quality Gates:** Review after each constellation
5. **Testing:** Comprehensive test coverage
6. **Benchmarking:** Verify performance
7. **Documentation:** Complete rustdoc
8. **Release:** Build and distribute (1.0.0)

---

**Ready to build safe, fast, and reliable systems with Rust? Start your Nebula journey today!**

