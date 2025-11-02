# Context Engineering Protocol: Nebula Framework

## Overview
The Nebula Framework is a hierarchical documentation and context management system designed to provide clear project structure, focused development phases, and effective knowledge transfer across development teams. Enhanced with cloud-based MCP (Model Context Protocol) integration for seamless AI-assisted development.

## Core Concepts

### 1. Nebula (Main Roadmap)
The central, high-level project roadmap that serves as the primary navigation document. This contains:
- Project vision and objectives
- High-level phase definitions
- Overall timeline and milestones
- Key stakeholders and responsibilities

### 2. Constellations (Phase-Specific Roadmaps)
Detailed, phase-specific documents that expand upon each phase from the Nebula. These provide granular implementation details and actionable tasks.

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
- **Convention:** `STAR_SYSTEM_[X.Y]_[DESCRIPTOR].md` for granular breakdown within constellations
- **Legacy:** `ROADMAP_PHASE_[X.Y]_[DESCRIPTOR].md` (still supported)
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
- Cannot proceed to next constellation without passing Star Gate

### Adaptive Phase Management
The framework now supports **organic growth** instead of rigid upfront planning:

**Simple Projects (3-5 constellations):**
- Minimal structure without forced complexity
- Direct constellation sequence: Setup → Core → Deployment

**Complex Projects (8+ constellations with star systems):**
- Constellations expand into Star Systems as needed
- Structure emerges from actual complexity, not prediction

## Constellation Content Structure

Each **Constellation** document should include:

### 1. Constellation Overview
- Clear connection to the Nebula roadmap
- Constellation objectives and success criteria
- Dependencies on previous constellations

### 2. Detailed Sub-Tasks
- Actionable, granular tasks with immediate validation requirements
- Task priorities and dependencies
- Estimated effort and timeline
- **Mandatory Testing Step:** Each sub-task must include validation criteria and testing approach

### 3. Technical Implementation Details
- Technology stack specifics
- Architecture decisions
- Integration patterns
- Data models and API specifications

### 4. Testing Strategy
- Testing approach for the constellation
- Quality assurance criteria
- Validation methods
- Preparation for Star Gate verification

### 5. Potential Challenges
- Known technical hurdles
- Risk mitigation strategies
- Decision points requiring stakeholder input

### 6. Task-Test-Validate Cycle
- **Implementation Step:** Code/feature development
- **Immediate Testing:** Manual verification or automated script execution
- **Validation Criteria:** Clear pass/fail criteria for each test
- **Iteration Loop:** Fix-test-validate until criteria are met
- **Documentation:** Record test results and validation outcomes

### 7. Acceptance Criteria
- Clear definition of "done" for each sub-task
- Success metrics and validation methods
- Deliverable specifications
- **Validation Evidence:** Documented proof of successful testing

### 8. Star Gate Checkpoint (MANDATORY)
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