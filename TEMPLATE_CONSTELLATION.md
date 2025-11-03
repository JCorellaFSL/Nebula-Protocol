# CONSTELLATION [NUMBER]: [DESCRIPTOR]

> **Type:** Non-Technical Overview  
> **Purpose:** Strategic context and goals - WHAT and WHY, not HOW  
> **Technical Details:** See Star System documents below

---

## 1. Constellation Overview

### What This Accomplishes
[Clear description of what this constellation delivers - features, capabilities, outcomes]

### Why It Matters
[Business value, user impact, project importance]

### Connection to Nebula
[How this constellation fits into the overall ROADMAP.md vision]

### Dependencies
- **Previous Constellations:** [List required constellation completions]
- **External Dependencies:** [Tools, services, data sources needed]

---

## 2. Goals & Success Criteria

### High-Level Objectives
1. **[Objective 1]:** [What success looks like]
2. **[Objective 2]:** [What success looks like]
3. **[Objective 3]:** [What success looks like]

### Measurable Outcomes
- [ ] **[Outcome 1]:** [How to measure/verify]
- [ ] **[Outcome 2]:** [How to measure/verify]
- [ ] **[Outcome 3]:** [How to measure/verify]

### Definition of "Done"
[Clear criteria that mark this constellation as complete - focus on deliverables, not implementation steps]

---

## 3. Scope & Boundaries

### In Scope
- [Feature/capability 1]
- [Feature/capability 2]
- [Feature/capability 3]

### Out of Scope
- [Explicitly not included - to be done in other constellations]
- [Features postponed to future work]

### Star System Planning
**Star Systems are always created** to maintain separation of concerns:

**How many to create:**
- **Simple constellation:** 1-2 Star Systems
  - Example: Environment Setup + Dependencies
- **Moderate constellation:** 2-4 Star Systems
  - Example: Database + API + Basic Auth
- **Complex constellation:** 3-8 Star Systems
  - Example: Database + API + Auth + WebSocket + Cache + Monitoring

**Split criteria:**
- Different technology stacks or architectural layers
- Independent features that can be built separately
- Component exceeds context limits (>4000 tokens, >10 tasks)
- Logical separation (setup vs. config, backend vs. frontend)

---

## 4. Star System Breakdown

> **Required:** Every constellation must have Star Systems. List them below.

### Star System List

#### STAR_SYSTEM_[X.1]_[DESCRIPTOR].md
**What:** [Brief description of component/feature]  
**Purpose:** [Why this is needed]  
**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete

#### STAR_SYSTEM_[X.2]_[DESCRIPTOR].md
**What:** [Brief description of component/feature]  
**Purpose:** [Why this is needed]  
**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete

#### STAR_SYSTEM_[X.3]_[DESCRIPTOR].md
**What:** [Brief description of component/feature]  
**Purpose:** [Why this is needed]  
**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete

---

## 5. Star Gate Requirements

### Pre-Gate Checklist
Before attempting the Star Gate for this constellation:

#### Functional Requirements
- [ ] All features from this constellation are functional
- [ ] Integration with previous constellations works
- [ ] User-facing elements are usable (if applicable)

#### Testing Requirements
- [ ] **Automated Tests:** [Describe what needs automated testing]
- [ ] **Manual Verification:** [Describe what needs human testing]
- [ ] **Edge Cases:** [Critical scenarios to validate]

#### Quality Benchmarks
- [ ] **Performance:** [Response time, load capacity, etc.]
- [ ] **Reliability:** [Error handling, edge cases]
- [ ] **Usability:** [User experience standards if applicable]

#### Documentation
- [ ] Code is documented (comments, docstrings)
- [ ] Technical decisions recorded in project memory
- [ ] Breaking changes noted (if any)

#### Git Integration
- [ ] All changes committed with clear messages
- [ ] Code pushed to remote repository
- [ ] Ready for Star Gate validation

---

## 6. Context for Implementation

### Key Considerations
[Important factors to keep in mind during implementation - architectural patterns, performance concerns, user experience, etc.]

### Technical Constraints
[Limitations, requirements, or restrictions that guide implementation choices]

### Integration Points
[How this constellation connects to other parts of the system]

### User Impact
[How users will experience this constellation's features]

---

## Next Steps

After passing **STAR_GATE_[NUMBER]_[DESCRIPTOR].md**:
1. Review lessons learned and update project memory
2. Proceed to **CONSTELLATION_[NUMBER+1]_[NEXT_DESCRIPTOR].md**
3. Update version tracking and git tags

---

## Notes

[Space for additional context, decisions, or clarifications]

