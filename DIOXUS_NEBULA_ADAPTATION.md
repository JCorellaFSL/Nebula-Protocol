# Dioxus Nebula Framework Adaptation

**⚠️ UPDATED:** November 2024 - Constellations, Star Systems, Star Gates terminology + Docker API support

## Overview
This document adapts the Nebula Context Engineering Protocol specifically for Dioxus development projects, incorporating Dioxus's unique Rust-based reactive UI architecture, cross-platform capabilities (Web, Desktop, Mobile, TUI), and component-driven development patterns.

### Integration Options
- **MCP Server:** Local IDE integration (Cursor, VSCode) via Model Context Protocol
- **Docker API:** REST API access for remote/centralized deployment
- **Hybrid:** Use both - MCP for local development, API for team collaboration
- **Central KG:** Connect to PostgreSQL-backed Knowledge Graph for cross-project learning

## Dioxus-Specific Constellation Content Structure

### 1. Constellation Overview
- **Dioxus Context:** Component architecture and rendering strategy
- **Platform Considerations:** Web/Desktop/Mobile/TUI specific requirements
- **State Management:** Hooks, context, and signals patterns
- **Rendering Strategy:** SSR, CSR, or hybrid approaches
- **Platform Features:** Platform-specific API access and capabilities

### 2. Detailed Sub-Tasks
- **Component Development:** UI components and composition patterns (test in browser/desktop)
- **State Management:** Hooks, signals, and global state (verify reactivity)
- **Platform Integration:** File system, notifications, native APIs (test on target platforms)
- **Asset Management:** Static assets, icons, styles (verify loading and display)
- **Router Integration:** Navigation and routing patterns (validate navigation flows)
- **Testing Requirement:** Each sub-task must include Dioxus-specific validation method

### 3. Technical Implementation Details

#### Dioxus-Specific Sections:
- **Component Architecture:**
  - Component structure and organization
  - Props and event handling patterns
  - Component composition strategies
  - Reusable component library

- **State Management:**
  - `use_state` and `use_signal` patterns
  - `use_context` for global state
  - `use_effect` for side effects
  - State synchronization across components

- **Rendering Strategy:**
  - Client-side rendering (CSR)
  - Server-side rendering (SSR)
  - Static site generation (SSG)
  - Hydration patterns

- **Platform Integration:**
  - Desktop: Native window management, file system, notifications
  - Web: Browser APIs, localStorage, WebAssembly optimization
  - Mobile: Native device APIs and platform features
  - TUI: Terminal rendering and input handling

- **Styling Approach:**
  - CSS-in-Rust patterns
  - Tailwind CSS integration
  - Inline styles with dioxus
  - Component-scoped styling

### 4. Testing Strategy

#### Dioxus Testing Approach:
- **Component Tests:** Unit tests for component logic
- **Integration Tests:** Multi-component interaction testing
- **Visual Tests:** Snapshot testing for UI consistency
- **Platform Tests:** Cross-platform behavior validation
- **Performance Tests:** Render performance and WASM size optimization

#### Testing Tools:
- **Rust Testing:** `cargo test` for component logic
- **Browser Testing:** Web-based testing with selenium/playwright
- **Desktop Testing:** Native desktop application testing
- **WASM Testing:** WebAssembly-specific testing
- **Benchmark Testing:** `cargo bench` for performance validation

### 5. Potential Challenges

#### Dioxus-Specific Challenges:
- **WASM Size:** Optimizing bundle size for web deployment
- **Platform Differences:** Handling platform-specific APIs gracefully
- **Hot Reload:** Development experience and iteration speed
- **State Management:** Complex state synchronization patterns
- **Third-Party Crates:** Compatibility with web/WASM targets
- **Async Operations:** Managing async in reactive contexts

### 6. Acceptance Criteria

#### Dioxus-Specific Criteria:
- **Cross-Platform Compatibility:** Consistent behavior across target platforms
- **Performance Benchmarks:** Initial render time, update latency, WASM size
- **Code Quality:** Idiomatic Rust patterns and Dioxus best practices
- **Responsive Design:** Proper layout across screen sizes
- **Accessibility:** ARIA attributes and keyboard navigation

## Dioxus Project Phase Examples

### Phase 0: Dioxus Setup (→ 0.1.0)
- **Constellation:** `ROADMAP_PHASE_0_DIOXUS_SETUP.md`
- **Focus:** Environment setup, project structure, **LOGGING INFRASTRUCTURE**
- **Key Tasks:**
  - Rust toolchain setup (rustup, cargo)
  - Dioxus CLI installation (`cargo install dioxus-cli`)
  - Project initialization (`dx new`)
  - **Initialize logging (tracing with file output)**
  - **Create `.nebula/logs/` directory structure**
  - **Initialize project memory (via MCP server or Docker API)**
  - Development environment configuration
- **Exit Condition:** Logging operational, project memory initialized, basic app runs
  - Target platform setup (Web, Desktop, Mobile, TUI)

### Phase 1: Core Dioxus Architecture (→ 0.2.0)
- **Constellation:** `ROADMAP_PHASE_1_DIOXUS_CORE.md`
- **Focus:** Component architecture, routing, state management, **LOGIC ONLY**
- **Key Tasks:**
  - Component structure design
  - Data models and business logic
  - State management patterns (hooks, signals)
  - Router configuration
  - Platform abstraction layer
- **WARNING:** Cannot proceed to Phase 2 without completing Phase 1.5!

### Phase 1.5: Basic UI (→ 0.3.0) **MANDATORY - DO NOT SKIP**
- **Constellation:** `ROADMAP_PHASE_1.5_BASIC_UI.md`
- **Focus:** Render all Phase 1 features into usable UI components
- **Key Tasks:**
  - Create UI components for all features
  - Implement navigation/routing with actual screens
  - Display data from state/models
  - Forms and user input
  - Basic styling (functional, not beautiful)
  - Error display and feedback
- **Quality Gate:** Manual testing checklist completed, app runs and is usable
- **Exit Condition:** User can interact with all Phase 1 features via UI

### Phase 2: Feature Development (→ 0.4.0)
- **Constellation:** `ROADMAP_PHASE_2_DIOXUS_FEATURES.md`
- **Focus:** Specific app features with UI + backend TOGETHER
- **Key Tasks:**
  - Feature-specific components with logic
  - Data models with UI forms
  - API integration with UI display
  - Form handling and validation
  - User-facing feature components
- **Quality Gate:** Review Phases 0-2 for conflicts, create Phase 2.01 if issues found
- **Logging:** All errors logged to project memory

### Phase 3: Platform Integration (→ 0.5.0)
- **Constellation:** `ROADMAP_PHASE_3_DIOXUS_INTEGRATION.md`
- **Focus:** Platform-specific features, testing, and optimization
- **Key Tasks:**
  - Desktop: Native menus, system tray, file dialogs
  - Web: PWA features, service workers, WASM optimization
  - Mobile: Native device APIs
  - Cross-platform testing
  - Performance optimization
  - Error pattern analysis from project memory
- **Quality Gate:** Review all phases for integration issues

### Phase 3.5: UI Polish (→ 0.6.0) **MANDATORY - DO NOT SKIP**
- **Constellation:** `ROADMAP_PHASE_3.5_UI_POLISH.md`
- **Focus:** Professional, production-ready UI
- **Key Tasks:**
  - Visual design refinement
  - Smooth animations and transitions
  - Responsive design across devices
  - Accessibility (ARIA, keyboard navigation)
  - Loading states and progress indicators
  - Polish micro-interactions
  - User feedback integration
- **Quality Gate:** Design review, accessibility audit, UX testing
- **Exit Condition:** App looks professional and feels polished
  - Mobile: Native navigation, device APIs
  - Cross-platform: Shared abstractions and adapters

### Phase 4: Deployment (→ 1.0.0)
- **Constellation:** `ROADMAP_PHASE_4_DIOXUS_DEPLOYMENT.md`
- **Focus:** Final testing, building, and deployment
- **Key Tasks:**
  - Final comprehensive testing
  - Cross-platform build configuration (Web, Desktop, Mobile)
  - WASM optimization for web (size < 500KB)
  - Distribution setup (installers, app stores, hosting)
  - CI/CD pipeline setup
  - **Version bump to 1.0.0**
- **Quality Gate:** Final review, all tests passing
- **Exit Condition:** App deployed and available on all target platforms

## Dioxus Immediate Validation Approach

### Component-Level Testing
- **Component Logic:** Test hooks and state management immediately after implementation
- **Render Testing:** Verify component renders correctly with various props
- **Event Handling:** Validate event handlers and state updates
- **Integration:** Test component composition and data flow

### Platform-Specific Validation
- **Web Testing:** Validate in multiple browsers and screen sizes
- **Desktop Testing:** Test native desktop features and window management
- **Mobile Testing:** Verify mobile-specific behaviors and touch interactions
- **TUI Testing:** Test terminal rendering and keyboard input

### Development Environment Testing
- **Dev Mode Validation:** Test features with hot reload during development
- **Build Testing:** Validate production builds before deployment
- **Performance Profiling:** Use Rust profiling tools for optimization
- **WASM Analysis:** Check bundle size and loading performance

### Validation Documentation for Dioxus
Each Dioxus task must include:
- **Component Test Results:** Unit test execution and validation
- **Visual Test Evidence:** Screenshots or recordings of UI behavior
- **Platform Test Results:** Validation on all target platforms
- **Performance Metrics:** Render time, bundle size, memory usage
- **Accessibility Check:** ARIA compliance and keyboard navigation

## Dioxus-Specific Tools and Integrations

### Development Tools:
- **Dioxus CLI:** Project management and development server
- **dx serve:** Development server with hot reload
- **dx build:** Production build tool
- **Rust Analyzer:** Rust language server
- **Browser DevTools:** Web debugging and profiling

### Quality Assurance:
- **cargo clippy:** Rust linting and suggestions
- **cargo fmt:** Rust code formatting
- **cargo test:** Unit and integration testing
- **wasm-pack:** WebAssembly packaging and optimization
- **trunk:** Web asset bundling (alternative to dx)

### Deployment:
- **Web:** Static hosting, CDN deployment, WASM optimization
- **Desktop:** Native bundlers (cargo-bundle, cargo-packager)
- **Mobile:** Mobile build tools and app store deployment
- **CI/CD:** GitHub Actions, GitLab CI for automated builds

## Best Practices Integration

### Code Organization:
- **Component modules:** Feature-based component organization
- **Shared components:** Reusable component library
- **Hooks directory:** Custom hooks and state management
- **Platform abstractions:** Cross-platform API wrappers
- **Asset management:** Static assets and resource files

### Performance Considerations:
- **Memoization:** Use `memo` to prevent unnecessary re-renders
- **Lazy loading:** Code splitting and dynamic imports
- **WASM optimization:** Minimize bundle size with optimization flags
- **Virtual scrolling:** Efficient rendering of large lists
- **Async operations:** Non-blocking UI updates

### State Management Patterns:
- **Local state:** `use_state` for component-specific state
- **Signals:** `use_signal` for reactive data
- **Context:** `use_context` for global state sharing
- **Props drilling:** Avoid deep prop passing with context
- **Derived state:** Compute derived values efficiently

## Example Constellation Template

```markdown
# ROADMAP_PHASE_X_DIOXUS_[DESCRIPTOR].md

## Phase Overview
**Nebula Reference:** [Link to main roadmap phase]
**Dioxus Context:** [Specific Dioxus architectural considerations]
**Target Platforms:** [Web/Desktop/Mobile/TUI]
**Key Technologies:** [Specific crates and tools]

## Detailed Sub-Tasks
### Component Development
- [ ] Core components implementation
- [ ] Component composition patterns
- [ ] Props and event handling
- [ ] Component testing

### State Management
- [ ] State hooks setup
- [ ] Global state context
- [ ] State synchronization
- [ ] Side effects handling

### Platform Integration
- [ ] Platform-specific features
- [ ] API abstractions
- [ ] Native capabilities
- [ ] Cross-platform testing

## Technical Implementation
### Component Architecture
[Specific component patterns and structures]

### State Management Strategy
[Hooks, signals, and context usage patterns]

### Platform Abstractions
[Cross-platform API wrappers and adapters]

### Styling Approach
[CSS/styling strategy and implementation]

## Testing Strategy
- Component Tests: [Unit tests for component logic]
- Visual Tests: [UI rendering and appearance]
- Integration Tests: [Multi-component interactions]
- Platform Tests: [Cross-platform compatibility]

## Potential Challenges
- [Dioxus-specific technical challenges]
- [Platform differences and solutions]
- [WASM size and performance optimization]

## Acceptance Criteria
- [ ] Cross-platform compatibility verified
- [ ] Performance benchmarks met
- [ ] Accessibility validated
- [ ] Components properly tested
- [ ] Documentation complete
```

## Dioxus Configuration Examples

### Dioxus.toml Structure
```toml
[application]
name = "finance-86"
default_platform = "web"

[web.app]
title = "Finance-86"
base_path = "/"

[web.watcher]
reload_html = true
watch_path = ["src", "assets"]

[web.resource]
style = ["assets/main.css"]

[bundle]
identifier = "com.finance86.app"
publisher = "Finance-86"
icon = ["assets/icon.png"]
resources = ["assets/*"]
```

### Component Implementation Pattern
```rust
use dioxus::prelude::*;

#[component]
pub fn AccountCard(
    account_name: String,
    balance: f64,
    on_click: EventHandler<()>
) -> Element {
    let is_hovered = use_signal(|| false);
    
    rsx! {
        div {
            class: "account-card",
            onmouseenter: move |_| is_hovered.set(true),
            onmouseleave: move |_| is_hovered.set(false),
            onclick: move |_| on_click.call(()),
            
            h3 { "{account_name}" }
            p { class: "balance", "${balance:.2}" }
        }
    }
}
```

### State Management Pattern
```rust
use dioxus::prelude::*;

#[derive(Clone, Copy)]
pub struct AppState {
    pub accounts: Signal<Vec<Account>>,
    pub transactions: Signal<Vec<Transaction>>,
}

pub fn use_app_state() -> AppState {
    use_context()
}

pub fn AppStateProvider(children: Element) -> Element {
    let accounts = use_signal(Vec::new);
    let transactions = use_signal(Vec::new);
    
    use_context_provider(|| AppState {
        accounts,
        transactions,
    });
    
    rsx! {
        {children}
    }
}
```

### Platform-Specific Code Pattern
```rust
#[cfg(target_family = "wasm")]
pub fn save_data(data: &str) -> Result<(), String> {
    // Web storage implementation
    web_sys::window()
        .and_then(|w| w.local_storage().ok().flatten())
        .and_then(|storage| storage.set_item("app_data", data).ok())
        .ok_or_else(|| "Failed to save data".to_string())
}

#[cfg(not(target_family = "wasm"))]
pub fn save_data(data: &str) -> Result<(), String> {
    // Desktop file system implementation
    std::fs::write("app_data.json", data)
        .map_err(|e| e.to_string())
}
```

---

*This Dioxus adaptation ensures that the Nebula framework leverages Dioxus's unique Rust-based reactive architecture while maintaining the structured approach to project management and context engineering across Web, Desktop, Mobile, and TUI platforms.*

