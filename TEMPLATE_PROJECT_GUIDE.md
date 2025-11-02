# PROJECT_GUIDE.md - Your Project's Nebula Navigation

**Welcome to your project!** This guide explains the Nebula Framework structure created for this specific project and how to use it effectively.

---

## 🌌 What Just Got Created?

When you initialized this project with the Nebula Framework, several key files and directories were automatically generated:

### Your Project Structure
```
{{PROJECT_NAME}}/
├── ROADMAP.md                    # 🌌 Your Nebula (main project roadmap)
{{CONSTELLATION_LIST}}
{{STAR_GATE_LIST}}
└── .nebula/                      # Framework infrastructure (auto-created)
    ├── project_memory.sqlite     # Error tracking, decisions, Star Gate history
    ├── logs/                     # Automatic logging
    │   ├── development.log
    │   ├── errors.log
    │   └── star_gates.log
    └── config.json               # Project configuration
```

### Project Complexity: **{{COMPLEXITY_LEVEL}}**

{{COMPLEXITY_EXPLANATION}}

---

## 📚 Cosmic Terminology Explained

The Nebula Framework uses cosmic metaphors to make project structure intuitive and memorable:

### 🌌 Nebula
**Your `ROADMAP.md` file** - The main project roadmap that provides the high-level overview.

**Think of it as:** Your project's universe - the big picture view
**Contains:** Project vision, objectives, overall timeline, constellation summaries

### ⭐ Constellations
**Your `CONSTELLATION_[N]_[NAME].md` files** - Major development phases.

**Think of them as:** Star formations - groups of related work
**Examples in your project:**
{{CONSTELLATION_EXAMPLES}}

**When to use:**
- Major architectural phases (Setup, Core, Features, Deployment)
- Technology shifts (Backend → Frontend)
- Team handoff points

### 🪐 Star Systems
**Your `STAR_SYSTEM_[X.Y]_[NAME].md` files** - Detailed sub-components within constellations.

**Think of them as:** Individual solar systems within a constellation
**When to create:**
- A constellation exceeds 4000 tokens or 8-10 tasks
- Complex component needs focused attention
- Parallel work streams within same phase
- Use `analyze-constellation` tool to check when to split

**Example:** If `CONSTELLATION_1_CORE.md` becomes too large:
```
CONSTELLATION_1_CORE.md (overview)
├── STAR_SYSTEM_1.1_DATABASE.md
├── STAR_SYSTEM_1.2_API_LAYER.md
└── STAR_SYSTEM_1.3_AUTH_SYSTEM.md
```

### 🚪 Star Gates
**Your `STAR_GATE_[N]_[NAME].md` files** - MANDATORY quality checkpoints.

**Think of them as:** Security checkpoints you must pass through
**Purpose:** Prevent rushed, untested code from proceeding to next phase

**Requirements:**
- ✅ All automated tests passing
- 👤 Manual verification of user-facing features
- 📝 All code committed and pushed to remote repository
- 📊 Results logged in project memory
- ⚠️ Any skipped tests documented with reasoning

**Critical Rule:** You CANNOT proceed to the next constellation without passing its Star Gate.

---

## 🚀 How to Use This Framework

### Step 1: Start with Your Current Constellation

Open the first constellation file (`{{FIRST_CONSTELLATION}}`):
1. Read the constellation overview
2. Review the detailed tasks
3. Check acceptance criteria
4. Begin implementation

### Step 2: Implement with Immediate Validation

For each task:
```
1. Implement feature/code
2. Test immediately (automated or manual)
3. Document test results
4. Commit to git
5. Move to next task
```

**Never skip testing!** The framework is designed to prevent "LLM rush-coding."

### Step 3: Monitor Complexity

As you work, check if constellation is getting too complex:

```bash
# Use the constellation analyzer
analyze-constellation {{FIRST_CONSTELLATION}}

# If output shows complexity warnings, create Star Systems
```

**Indicators to split into Star Systems:**
- 🔴 Token count > 4000
- 🔴 Task count > 10
- 🔴 Section count > 15
- 🔴 Work taking longer than estimated

### Step 4: Pass Through Star Gates

When constellation is complete:

1. **Open the Star Gate file** (`{{FIRST_STAR_GATE}}`)
2. **Complete all checklist items:**
   - Run all automated tests
   - Perform manual verification
   - Commit and push all code
   - Create git tag (e.g., `v0.1.0`)
3. **Log results** using MCP tools (if available)
4. **Document any skipped tests** with clear reasoning
5. **Proceed to next constellation** only after passing

### Step 5: Version Tracking

The framework uses semantic versioning tied to constellations:

{{VERSION_SCHEDULE}}

**Git Integration:**
```bash
# After passing each Star Gate
git tag v0.{{N}}.0
git push origin v0.{{N}}.0
```

---

## 🛠️ Available Tools & Commands

### Constellation Analyzer
Check if your constellation is getting too complex:

```bash
analyze-constellation CONSTELLATION_1_CORE.md
```

**Output tells you:**
- Token count vs. recommended maximum
- Task count vs. recommended maximum
- Whether to split into Star Systems

### Project Initialization (You already did this!)
```bash
init-nebula {{PROJECT_TYPE}} {{PROJECT_NAME}} {{COMPLEXITY_LEVEL}}
```

### MCP Tools (If MCP Server Configured)
If you have the Nebula MCP server set up, you have access to:

**Documentation Access:**
- `fetch_JCorellaFSL_documentation` - Read framework docs
- `search_JCorellaFSL_documentation` - Search framework docs

**Project Memory:**
- `project_memory_log_error` - Log errors automatically
- `project_memory_get_stats` - View project statistics
- `project_memory_record_decision` - Document architectural decisions

**Star Gate Tools:**
- `star_gate_record` - Log Star Gate passage results
- `star_gate_get` - Retrieve Star Gate history

**Constellation Analysis:**
- `constellation_analyze` - Check file complexity

---

## 🎯 Best Practices for Your Project

### 1. Start Simple, Expand When Needed
{{BEST_PRACTICE_SIMPLICITY}}

### 2. Test Everything
- Write automated tests for backend logic
- Manually test all user-facing features
- Document test results in constellation files
- Never skip testing without documentation

### 3. Commit Frequently
```bash
# Good commit rhythm
git add .
git commit -m "feat: implemented user authentication"
git push origin main

# Do this BEFORE attempting Star Gate passage
```

### 4. Use Star Gates Seriously
Star Gates are not bureaucracy—they're quality insurance:
- They prevent technical debt
- They catch bugs early
- They create an audit trail
- They enforce professional standards

### 5. Monitor Constellation Size
Use `analyze-constellation` regularly:
- Check after adding 3-4 major tasks
- Split into Star Systems if complexity grows
- Keep constellations focused and manageable

### 6. Document Decisions
Use project memory to record:
- Why you chose specific technologies
- Trade-offs you considered
- Problems you encountered
- Solutions that worked

---

## 📖 Common Workflows

### Workflow 1: Starting a New Constellation
```bash
1. Open ROADMAP.md
2. Find next constellation in sequence
3. Open constellation file (e.g., CONSTELLATION_2_FEATURES.md)
4. Read objectives and success criteria
5. Begin first task
6. Test immediately after implementation
7. Commit changes
8. Repeat for all tasks
9. Pass through Star Gate
```

### Workflow 2: Constellation Got Too Complex
```bash
1. Run: analyze-constellation CONSTELLATION_1_CORE.md
2. See warning: "⚠️  High Token Count: Exceeds 4000 tokens"
3. Create Star System files:
   - STAR_SYSTEM_1.1_DATABASE.md
   - STAR_SYSTEM_1.2_API_LAYER.md
   - STAR_SYSTEM_1.3_AUTH_SYSTEM.md
4. Move relevant tasks from constellation to Star Systems
5. Update CONSTELLATION_1_CORE.md to reference Star Systems
6. Continue development in focused Star System files
```

### Workflow 3: Passing a Star Gate
```bash
1. Complete all tasks in constellation
2. Run automated test suite: npm test / cargo test / pytest
3. Manually test user-facing features
4. Commit all changes: git add . && git commit
5. Push to remote: git push origin main
6. Open STAR_GATE_1_CORE.md
7. Complete checklist items
8. Create git tag: git tag v0.2.0
9. Push tag: git push origin v0.2.0
10. Log results (manual or via MCP tool)
11. Proceed to next constellation
```

### Workflow 4: Recovering from Issues
```bash
# If Star Gate reveals problems:
1. Document issues in Star Gate file
2. Create STAR_SYSTEM_1.1_FIXES.md for targeted repairs
3. Fix issues with proper testing
4. Reattempt Star Gate passage
5. Log corrective actions in project memory
```

---

## 🚨 Important Reminders

### ⚠️ DO NOT Skip Star Gates
Star Gates are mandatory for good reason:
- They prevent technical debt accumulation
- They catch integration issues early
- They enforce testing discipline
- They create project history

### ⚠️ DO NOT Skip Testing
- Automated tests must genuinely test (no fake outcomes)
- Manual tests must be performed by humans
- Document any skipped tests with clear reasoning
- Skipped tests are flagged in project memory

### ⚠️ DO NOT Forget Git Integration
- Commit after each significant change
- Push to remote before Star Gate attempts
- Create and push tags for version tracking
- Your work must be backed up

### ⚠️ DO NOT Over-Plan
{{OVER_PLANNING_WARNING}}

---

## 📞 Getting Help

### Framework Documentation
- **Core Specification:** `Nebula_Protocol.md` in framework repository
- **Implementation Guide:** `IMPLEMENTATION_GUIDE.md`
- **Usage Guide:** `USAGE_GUIDE.md`
- **November Updates:** `updates/NOVEMBER_UPDATES.md`

### Technology-Specific Guides
{{FRAMEWORK_SPECIFIC_DOCS}}

### Tools & Utilities
- **Constellation Analyzer:** Checks file complexity
- **MCP Server:** Provides AI-accessible tools
- **Project Memory:** Tracks errors and decisions

### Community & Support
- **GitHub Repository:** https://github.com/JCorellaFSL/Nebula-Protocol
- **Issues:** Report bugs or request features
- **Discussions:** Ask questions, share experiences

---

## 🎓 Learning Path

### Week 1: Basics
- [ ] Understand Nebula → Constellation → Star System hierarchy
- [ ] Complete Constellation 0 (Setup)
- [ ] Pass first Star Gate
- [ ] Get comfortable with commit rhythm

### Week 2: Working Efficiently
- [ ] Use `analyze-constellation` to check complexity
- [ ] Create first Star System (if needed)
- [ ] Pass 2-3 more Star Gates
- [ ] Document decisions in project memory

### Week 3: Mastery
- [ ] Adapt constellation structure to project needs
- [ ] Use MCP tools for automation
- [ ] Review project memory for patterns
- [ ] Optimize workflow based on learnings

---

## 📊 Project Progress Tracking

### Current Status
- **Version:** {{CURRENT_VERSION}}
- **Active Constellation:** {{ACTIVE_CONSTELLATION}}
- **Completed Star Gates:** 0/{{TOTAL_STAR_GATES}}

### Version Roadmap
{{VERSION_ROADMAP}}

### Next Steps
1. Open `{{FIRST_CONSTELLATION}}`
2. Read constellation overview
3. Begin first task
4. Test immediately
5. Work toward `{{FIRST_STAR_GATE}}`

---

## ✨ Success Metrics

Track your project health:

- **Star Gates Passed:** Measure constellation completion
- **Tests Skipped:** Aim for 0% (document all skips)
- **Commits Per Day:** Frequent commits = good rhythm
- **Project Memory Entries:** Rich history = better debugging
- **Constellation Splits:** Good - means you're managing complexity

---

**Ready to begin?** Open `{{FIRST_CONSTELLATION}}` and start building! 🚀

**Remember:** The framework is here to help you build quality software systematically. Use it, don't fight it.

---

*Generated by Nebula Framework | Last Updated: {{GENERATION_DATE}}*

