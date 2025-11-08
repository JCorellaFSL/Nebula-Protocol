# Context Engineering Protocol: Nebula Framework

## Overview
The Nebula Framework is a hierarchical documentation and context management system designed to provide clear project structure, focused development phases, and effective knowledge transfer across development teams. Enhanced with cloud-based MCP (Model Context Protocol) integration for seamless AI-assisted development.

## Core Requirements

### Mandatory Error Logging
**Every error encountered during development MUST be logged to Project Memory.**

This is not optional. Error logging enables:
- Cross-project learning via Central Knowledge Graph
- Pattern recognition and auto-suggestions
- Solution sharing across all projects
- Measurable progress tracking

See `ERROR_LOGGING_REQUIREMENTS.md` for complete requirements and enforcement.

**Enforcement:** Star Gates automatically fail if error logging is incomplete.

---

## Core Concepts

### 1. Nebula (Main Roadmap)
The central, high-level project roadmap that serves as the primary navigation document. This contains:
- Project vision and objectives
- High-level phase definitions
- Overall timeline and milestones
- Key stakeholders and responsibilities

### 2. Constellations (Phase-Specific Roadmaps)
Non-technical overview documents that expand upon each phase from the Nebula. These provide:
- **What** needs to be built and **why** it matters
- Business value and user impact
- High-level goals and success criteria
- Context for technical implementation
- **NO implementation details** (those belong in Star Systems)

## Naming Convention

### Nebula Document
- **Primary:** `ROADMAP.md` - The main project roadmap

### Constellation Documents (Main Phases)
- **Convention:** `CONSTELLATION_[NUMBER]_[DESCRIPTOR].md`
- **Legacy:** `ROADMAP_PHASE_[NUMBER]_[DESCRIPTOR].md` (still supported for backward compatibility)
- **Examples:**
  - `CONSTELLATION_0_SETUP.md` - Project initialization
  - `CONSTELLATION_1_CORE.md` - Core backend/logic
  - `CONSTELLATION_2_FEATURES.md` - Feature development
  - `CONSTELLATION_3_INTEGRATION.md` - Testing and integration
  - `CONSTELLATION_4_DEPLOYMENT.md` - Deployment and distribution

### Star System Documents (Sub-Phases)
**Technical instruction sets** that provide implementation details for LLM execution.

- **Convention:** `STAR_SYSTEM_[X.Y]_[DESCRIPTOR].md` for granular breakdown within constellations
- **Legacy:** `ROADMAP_PHASE_[X.Y]_[DESCRIPTOR].md` (still supported)
- **Purpose:** 
  - **How** to build what the Constellation defines
  - Step-by-step technical instructions
  - Code examples and architecture decisions
  - Direct LLM execution guidance
- **Examples:**
  - `STAR_SYSTEM_1.1_DATABASE.md` - Database layer within Core constellation
  - `STAR_SYSTEM_1.2_API.md` - API framework within Core constellation
  - `STAR_SYSTEM_2.1_UI_COMPONENTS.md` - UI components within Features constellation

### Star Gates (Quality Gates)
**Star Gates** are mandatory quality checkpoints between constellations that enforce testing and validation:

**Purpose:**
- Prevent rushed, untested code progression
- Ensure proper testing before moving to next constellation
- Document testing decisions in project memory
- Combat LLM rush-coding patterns

**Implementation:**
- **Convention:** `STAR_GATE_[NUMBER]_[CONSTELLATION].md`
- **Examples:**
  - `STAR_GATE_0_SETUP.md` - Validates Constellation 0 completion
  - `STAR_GATE_1_CORE.md` - Validates Constellation 1 completion
  
**Requirements:**
- Automated tests (must genuinely test functionality)
- Manual verification for user-facing features
- All skipped tests documented with rationale in project memory
- **Error logging compliance verified** (MANDATORY - see ERROR_LOGGING_REQUIREMENTS.md)
- All errors encountered during constellation logged to Project Memory
- All solutions recorded with effectiveness ratings
- Cannot proceed to next constellation without passing Star Gate

### Adaptive Phase Management
The framework now supports **organic growth** instead of rigid upfront planning:

**Universal Structure:** All projects follow the same documentation pattern:
```
CONSTELLATION (overview) → STAR SYSTEMS (technical) → STAR GATE (validation)
```

**Simple Projects (3-5 constellations):**
- Fewer constellations overall
- 1-2 Star Systems per constellation
- Example: Setup has Environment + Dependencies Star Systems
- **Separation maintained, just smaller scale**

**Complex Projects (8+ constellations):**
- More constellations to organize complexity
- 3-8 Star Systems per constellation
- Example: Core has Database + API + Auth + WebSocket Star Systems
- **Separation critical for managing scale**

**Key Principle:** Star Systems are not optional - they're the standard technical layer.  
Complexity determines quantity, not whether to use them.

## Documentation Structure & Separation of Concerns

### Constellations: Non-Technical Overview

Each **Constellation** document is a **strategic overview** that provides context, not implementation. Include:

#### 1. Constellation Overview
- Clear connection to the Nebula roadmap
- **What** this constellation accomplishes
- **Why** it matters to the project
- Business value and user impact
- Dependencies on previous constellations

#### 2. Goals & Success Criteria
- High-level objectives (not tasks)
- Measurable outcomes
- Definition of "done" for this constellation
- Expected deliverables (what, not how)

#### 3. Scope & Boundaries
- What's included in this constellation
- What's explicitly out of scope
- Connections to other constellations
- How many Star Systems this will need (1-2 for simple, 3-8 for complex)

#### 4. Star System Breakdown
- List of Star Systems within this constellation (always present)
- Brief description of each (what it builds)
- **No technical details** - reference Star System docs
- Simple projects: 1-2 Star Systems per constellation
- Complex projects: 3-8 Star Systems per constellation

#### 5. Star Gate Requirements
- Testing criteria for this constellation
- Quality benchmarks
- Validation approach
- Preparation for Star Gate checkpoint

---

### Star Systems: Technical Instruction Sets

Each **Star System** document is an **execution guide** for LLMs. Include:

#### 1. Technical Overview
- What this Star System builds (specific component/feature)
- Technology stack and architecture
- Integration points
- Prerequisites

#### 2. Implementation Steps
- Step-by-step technical instructions
- Code examples and patterns
- Configuration details
- File structure and naming

#### 3. Technical Specifications
- API specifications
- Data models and schemas
- Architecture decisions
- Performance requirements

#### 4. Testing & Validation
- Unit tests and integration tests
- Test cases and scenarios
- Validation criteria
- Edge cases to handle

#### 5. Potential Challenges
- Known technical hurdles
- Risk mitigation strategies
- Decision points requiring stakeholder input

---

## Star Gate Validation Process

### Star Gate Checkpoint (MANDATORY)
After completing each constellation, pass through its Star Gate:
- **Automated Tests:** All tests passing (must genuinely test, not fake outcomes)
- **Manual Verification:** User-facing features tested by humans
- **Git Push:** All changes committed and pushed to remote repository
- **Integration Check:** Does this affect previous constellations?
- **Breaking Changes:** Document and assess impact
- **App Usability:** Verify functionality if applicable
- **Decision Points:**
  - **PASS:** All criteria met, proceed to next constellation
  - **CREATE STAR SYSTEM:** Issues found, expand constellation into Star Systems for fixes
  - **ROLLBACK:** Major issues require rethinking approach
- **Project Memory:** All decisions logged automatically

**Git Best Practices:**
- Commit after each significant change
- Push to remote before Star Gate passage
- Create git tags for constellation completions
- Push tags to remote for version tracking

### 9. Constellation Size Guidelines
To prevent context overload and maintain focus:
- **Maximum tokens:** 4,000 tokens (~3,000 words)
- **Maximum tasks:** 8-10 major tasks per constellation
- **Maximum scope:** 4-6 hours of implementation time
- **Split criteria:** If exceeding limits, create Star Systems (X.1, X.2, etc.) within the constellation

### 10. Logging Requirements (Constellation 0 Mandatory)
Every project must initialize logging infrastructure in Constellation 0 (Setup):
- **Log directory:** `.nebula/logs/` in project root
- **Log levels:** DEBUG, INFO, WARN, ERROR, CRITICAL
- **Format:** Structured JSON logs for parsing
- **Retention:** Development (7 days), Production (30 days), Errors (permanent)
- **Integration:** All errors automatically logged to project memory

## Framework Principles

### 1. Continuous Validation via Star Gates (CRITICAL)
- **Test-First Approach:** Every feature implementation must include immediate testing
- **Star Gate Enforcement:** No constellation is complete without passing its Star Gate
- **Immediate Feedback Loop:** Manual or automated testing occurs before proceeding
- **Human Verification:** AI-generated code requires human validation through testing
- **Project Memory Tracking:** All Star Gate results logged automatically

### 2. Modular Planning
- Each phase can be planned and executed independently
- Agile adjustments to specific phases without disrupting overall vision
- Clear handoff points between phases

### 3. Context Clarity
- Developers can focus on current phase without overwhelming scope
- Easy navigation between different detail levels
- Clear relationship mapping between documents

### 4. Knowledge Transfer
- Structured onboarding for new team members
- Consistent documentation patterns
- Self-documenting project structure

### 5. Progress Tracking
- Granular task tracking within phases
- Clear milestone definitions
- Measurable progress indicators

### 6. Automatic Version Tracking
- **Constellation Completion → Version Bump:** Semantic versioning tied to constellations
  - Constellation 0 complete → 0.1.0
  - Constellation 1 complete → 0.2.0
  - Constellation 2 complete → 0.3.0
  - Constellation 3 complete → 0.4.0
  - Constellation 4 complete → 1.0.0
- **Star System Completion → Patch Bump:** Star System X.Y → patch increment
- **Auto-Update:** Package files (package.json, Cargo.toml, pubspec.yaml) updated automatically
- **Git Tags:** Automatic git tags created on constellation completion

### 7. Project Memory Integration
- **Local Knowledge Graph:** `.nebula/project_memory.sqlite` in project root
- **Error Tracking:** All errors automatically logged with context
- **Pattern Recognition:** Recurring errors identified and solutions suggested
- **Decision History:** Architectural decisions recorded for future reference
- **Context Snapshots:** Session state saved for continuity between work sessions
- **Cross-Project Learning:** Successful patterns shared via framework Star Chart

## Implementation Guidelines

### 1. Document Consistency
- Each Constellation explicitly references its Nebula phase
- Consistent formatting and structure across all documents
- Standard metadata and versioning

### 2. Maintenance Protocol
- Regular review and updates of both Nebula and Constellations
- Version control for documentation changes
- Clear change management process

### 3. Security & Privacy
- Sensitive information handling protocols
- Documentation access controls
- Data classification standards

## AI Development Integration

### Critical Success Factor: Star Gate Enforcement
When working with AI assistance, the framework enforces quality through Star Gates:

1. **No Feature Left Untested:** Every AI-generated implementation must pass through Star Gate
2. **Human-in-the-Loop:** AI suggestions require human verification through testing
3. **Iterative Refinement:** Test-fail-refine cycles until Star Gate criteria are met
4. **Evidence-Based Progress:** Star Gate passage logged in project memory before proceeding
5. **Rush-Coding Prevention:** Cannot skip Star Gates; all skips logged and flagged

### Testing Approaches
- **Manual Testing:** Human verification of functionality and user experience
- **Automated Scripts:** Quick validation scripts for repetitive testing
- **Integration Testing:** Ensuring new features work with existing components
- **Regression Testing:** Verifying that changes don't break existing functionality

### Validation Documentation
Each task must include:
- **Test Method:** How the feature was tested
- **Test Results:** Outcome of testing (pass/fail/issues found)
- **Validation Evidence:** Screenshots, logs, or recorded demonstrations
- **Iteration History:** Record of test-fix-retest cycles

## MCP Integration & Cloud Access

### Model Context Protocol Support
The Nebula Framework integrates with MCP (Model Context Protocol) for seamless AI development:

#### Cloud Integration Options
1. **GitMCP Service** (Recommended): Direct GitHub repository access
   - URL: `https://gitmcp.io/_/your-username/your-repo`
   - Always up-to-date with repository changes
   - No local installation required

2. **Custom MCP Server**: Local or hosted server implementation
   - Full control over framework delivery
   - Custom tools and enhanced functionality
   - Scalable for team environments

3. **Package Distribution**: npm or similar package managers
   - Version-controlled framework distribution
   - Easy team sharing and updates

#### AI Tool Integration
- **Cursor IDE**: Direct MCP server integration
- **Claude Desktop**: Framework file access via MCP
- **VS Code**: MCP plugin support
- **Custom AI Tools**: Standardized MCP protocol access

### Framework Access Patterns
With MCP integration, developers can:
- Access framework files from any project
- Reference current documentation without copying
- Get project-type-specific adaptations automatically
- Maintain consistent framework usage across teams

## Technology Stack Adaptation

This framework can be adapted to any technology stack by:

1. **Replacing Technical Implementation Details** with stack-specific requirements
2. **Customizing Testing Strategies** for the chosen technologies
3. **Adapting Acceptance Criteria** to framework-specific deliverables
4. **Incorporating Stack-Specific Challenges** and considerations
5. **Defining Validation Methods** appropriate for the technology stack

### Current Framework Adaptations
- **Flutter Development**: `FLUTTER_NEBULA_ADAPTATION.md`
- **Tauri Development**: `TAURI_NEBULA_ADAPTATION.md`
- **Python Development**: `PYTHON_NEBULA_ADAPTATION.md`
- **Generic Framework**: `Nebula_Protocol.md`

## Benefits

- **Clarity & Focus:** Developers work with appropriately scoped information
- **Modular Development:** Independent phase execution with clear dependencies
- **Improved Onboarding:** Structured knowledge transfer for new team members
- **Better Progress Tracking:** Granular task management with clear milestones
- **Scalable Documentation:** Framework grows with project complexity
- **Context Preservation:** Maintains project knowledge across team changes
- **AI-Optimized:** Structured for maximum AI assistant effectiveness
- **Cloud-Accessible:** Framework available from any development environment

## Usage Examples

### Small Project (3-5 phases)
- Core setup, development, testing, deployment
- Minimal constellation complexity
- Focus on essential deliverables
- Single-developer or small team focus

### Large Project (7+ phases)
- Extended planning, multiple development cycles
- Complex constellation interdependencies
- Comprehensive testing and deployment strategies
- Multi-team coordination and integration

### Multi-Team Project
- Team-specific constellations
- Cross-team integration phases
- Shared Nebula with distributed ownership
- Centralized framework access via MCP

### AI-Assisted Development
- Framework-guided AI conversations
- Context-aware code generation
- Automated testing validation
- Continuous framework reference

---

*This protocol provides the foundation for structured project management and context engineering across diverse technology stacks and project scales, optimized for AI-assisted development with cloud-based accessibility.* 