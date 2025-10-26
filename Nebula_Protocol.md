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

### Constellation Documents
- **Convention:** `ROADMAP_PHASE_[NUMBER]_[DESCRIPTOR].md`
- **Sub-Phase Convention:** `ROADMAP_PHASE_[X.Y]_[DESCRIPTOR].md` for granular breakdown
- **Examples:**
  - `ROADMAP_PHASE_0_SETUP.md` - Project initialization
  - `ROADMAP_PHASE_1_CORE.md` - Core backend/logic
  - `ROADMAP_PHASE_1.5_BASIC_UI.md` - **MANDATORY** Basic UI implementation
  - `ROADMAP_PHASE_2_FEATURES.md` - Feature development (UI + backend together)
  - `ROADMAP_PHASE_3_INTEGRATION.md` - Testing and integration
  - `ROADMAP_PHASE_3.5_UI_POLISH.md` - **MANDATORY** UI refinement and polish
  - `ROADMAP_PHASE_4_DEPLOYMENT.md` - Deployment and distribution

### Mandatory UI Phases
To prevent "ready but unusable" applications, two UI-focused phases are **REQUIRED**:

1. **Phase 1.5: Basic UI (MANDATORY)**
   - Implements basic, functional user interface for all core features
   - Ensures application is usable and testable
   - Creates foundation for user feedback
   - **Quality Gate:** No proceeding to Phase 2 without working UI
   
2. **Phase 3.5: UI Polish (MANDATORY)**
   - Refines visual design and user experience
   - Adds animations, transitions, and accessibility features
   - Ensures professional, production-ready interface
   - **Quality Gate:** Application ready for public release

### Sub-Phase Naming for Adjustments
- **Format:** `Phase_X.YY` where YY = 01-99 for quality gate fixes
- **Examples:**
  - `ROADMAP_PHASE_1.01_CORE_FIXES.md` - Post-Phase 1 adjustments
  - `ROADMAP_PHASE_2.01_FEATURE_REFINEMENT.md` - Post-Phase 2 fixes

## Constellation Content Structure

Each Constellation document should include:

### 1. Phase Overview
- Clear connection to the Nebula phase
- Phase objectives and success criteria
- Dependencies on previous phases

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
- Testing approach for the phase
- Quality assurance criteria
- Validation methods

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

### 8. Quality Gate Checkpoint (MANDATORY)
After completing each constellation, perform quality gate review:
- **Does this affect previous constellations?** Review Phase 0 through current for conflicts
- **Are there breaking changes?** Document and assess impact
- **Does the app remain usable?** Verify UI functionality if applicable
- **Decision Points:**
  - **PROCEED:** No issues, continue to next constellation
  - **CREATE SUB-PHASE:** Issues found, create Phase X.01 for fixes
  - **ROLLBACK:** Major issues require rethinking approach

### 9. Constellation Size Guidelines
To prevent context overload and maintain focus:
- **Maximum tokens:** 4,000 tokens (~3,000 words)
- **Maximum tasks:** 8-10 major tasks per constellation
- **Maximum scope:** 4-6 hours of implementation time
- **Split criteria:** If exceeding limits, create sub-phases (Phase X.1, X.2, etc.)

### 10. Logging Requirements (Phase 0 Mandatory)
Every project must initialize logging infrastructure in Phase 0:
- **Log directory:** `.nebula/logs/` in project root
- **Log levels:** DEBUG, INFO, WARN, ERROR, CRITICAL
- **Format:** Structured JSON logs for parsing
- **Retention:** Development (7 days), Production (30 days), Errors (permanent)
- **Integration:** All errors automatically logged to project memory

## Framework Principles

### 1. Continuous Validation (CRITICAL)
- **Test-First Approach:** Every feature implementation must include immediate testing
- **Validation Gate:** No task is considered complete without successful validation
- **Immediate Feedback Loop:** Manual or automated testing occurs before proceeding to next task
- **Human Verification:** AI-generated code requires human validation through testing

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
- **Phase Completion → Version Bump:** Semantic versioning tied to phases
  - Phase 0 complete → 0.1.0
  - Phase 1 complete → 0.2.0
  - Phase 1.5 complete → 0.3.0
  - Phase 2 complete → 0.4.0
  - Phase 3 complete → 0.5.0
  - Phase 3.5 complete → 0.6.0
  - Phase 4 complete → 1.0.0
- **Sub-Phase Completion → Patch Bump:** Phase X.01 → patch increment
- **Auto-Update:** Package files (package.json, Cargo.toml, pubspec.yaml) updated automatically
- **Git Tags:** Automatic git tags created on phase completion

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

### Critical Success Factor: Immediate Validation
When working with AI assistance, the framework enforces:

1. **No Feature Left Untested:** Every AI-generated implementation must be immediately validated
2. **Human-in-the-Loop:** AI suggestions require human verification through testing
3. **Iterative Refinement:** Test-fail-refine cycles until validation criteria are met
4. **Evidence-Based Progress:** Documented proof of successful testing before task completion

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