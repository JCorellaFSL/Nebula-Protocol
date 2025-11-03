# How to Use the Nebula Framework with AI Development Tools

## 🎯 Purpose
This guide shows you how to use the Nebula Framework to structure your projects for AI-assisted development using tools like GPT, Claude, Gemini, Cursor, Windsurf, and other AI-powered IDEs.

**NEW:** Enhanced with context optimization tools and Star System guidelines for complex projects (40+ components).

## 📚 What You Have Here
- **Nebula_Protocol.md** - The core framework specification
- **[FRAMEWORK]_NEBULA_ADAPTATION.md** - Technology-specific adaptations (Flutter, Tauri, Python, Rust, Dioxus)
- **MCP_implementation.md** - Complete MCP server setup and activation guide
- **IMPLEMENTATION_GUIDE.md** - Detailed implementation instructions
- **Nebula_readme.md** - Complete framework overview and philosophy

## 📦 Getting Started: Clone the Repository

**⚠️ Recommended First Step:** Clone this repository to your local machine for easy access to all framework files:

```bash
# Clone the repository
git clone https://github.com/JCorellaFSL/Context-Engineering-Protocol.git
cd Context-Engineering-Protocol

# Or clone to a specific directory
git clone https://github.com/JCorellaFSL/Context-Engineering-Protocol.git ~/nebula-framework
```

**Why clone the repository?**
- ✅ **Easy File Access:** All framework files available locally
- ✅ **Copy to Projects:** Simple to copy files to new projects
- ✅ **Customization:** Modify and adapt for your specific needs
- ✅ **Stay Updated:** Use `git pull` to get the latest improvements
- ✅ **MCP Integration:** Required for local MCP server setup

## 🔌 MCP Server Setup (Choose Your Method)

The Nebula Framework includes a Model Context Protocol (MCP) server that provides direct access to framework files and tools. Choose the setup method that works best for you:

### Method 1: Cloud-Hosted via GitMCP (Recommended) ☁️

**Best for:** Quick setup, always up-to-date, works anywhere

#### Setup Steps:

1. **Open Cursor Settings**
   - Go to `Settings → Tools & MCP`
   - Click "Add Custom MCP"

2. **Add the Configuration**
   ```json
   {
     "mcpServers": {
       "nebula-framework": {
         "url": "https://gitmcp.io/_/JCorellaFSL/Nebula-Protocol"
       }
     }
   }
   ```

3. **Save and Restart**
   - Save the configuration
   - Restart Cursor or reload the window
   - The MCP server will appear in "Installed MCP Servers"

#### Advantages:
- ✅ **No local installation** required
- ✅ **Always up-to-date** with GitHub repository
- ✅ **Works anywhere** - just configure once
- ✅ **No maintenance** needed
- ✅ **Team sharing** - everyone uses same URL

#### Available Tools (Cloud Method):
- `fetch_JCorellaFSL_documentation` - Fetch framework documents
- `search_JCorellaFSL_documentation` - Search documentation  
- `search_JCorellaFSL_code` - Search repository code
- `fetch_generic_url_content` - Fetch referenced content

**Note:** The cloud method provides GitHub file access only. For project memory and knowledge graph tools, use the local server method below.

---

### Method 2: Local MCP Server 💻

**Best for:** Offline work, custom modifications, full control

#### Prerequisites:
- Node.js 18+ installed
- Repository cloned locally

#### Setup Steps:

**For Windows:**
```powershell
# Navigate to the repository
cd C:\path\to\Nebula-Protocol

# Run the installer
.\install-mcp-server.ps1
```

**For Linux/macOS:**
```bash
# Navigate to the repository
cd ~/path/to/Nebula-Protocol

# Make installer executable
chmod +x install-mcp-server.sh

# Run the installer
./install-mcp-server.sh
```

#### Manual Configuration:

If you prefer manual setup, create or edit:

**Windows:** `%APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

**Linux/macOS:** `~/.config/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

Add this configuration:
```json
{
  "mcpServers": {
    "nebula-framework": {
      "command": "node",
      "args": [
        "/absolute/path/to/Nebula-Protocol/nebula-framework-mcp.js"
      ],
      "env": {
        "NEBULA_FRAMEWORK_PATH": "/absolute/path/to/Nebula-Protocol"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

Replace `/absolute/path/to/Nebula-Protocol` with your actual path.

#### Install Dependencies:
```bash
cd /path/to/Nebula-Protocol
npm install
```

#### Advantages:
- ✅ **Works offline**
- ✅ **Full control** over server code
- ✅ **Custom modifications** possible
- ✅ **Local file access** for project memory
- ✅ **Faster response** (no network latency)

#### Available Tools (Local Method):
All 27 tools including:

**Framework Access (3 tools):**
- `get_framework_file` - Load any framework .md file
- `list_framework_files` - List all available files  
- `setup_project_framework` - Copy framework to project

**Project Memory (11 tools):**
- `project_memory_init` - Initialize SQLite memory database
- `project_memory_log_error` - Log errors with pattern detection
- `project_memory_record_solution` - Record error solutions
- `project_memory_find_similar_errors` - Search past errors
- `project_memory_get_patterns` - Get recurring patterns
- `project_memory_record_decision` - Track architectural decisions
- `project_memory_quality_gate` - Record quality gate results
- `project_memory_get_context` - Retrieve context snapshots
- `project_memory_save_context` - Save session state
- `project_memory_version_bump` - Record version changes
- `project_memory_get_stats` - Get project statistics

**Star Chart Knowledge Graph (13 tools):**
- `starchart_init`, `starchart_add_node`, `starchart_add_edge`
- `starchart_record_event`, `starchart_add_lesson`, `starchart_get_constellation`
- `starchart_get_path`, `starchart_search`, `starchart_get_timeline`
- `starchart_get_lessons`, `starchart_link_artifact`, `starchart_get_stats`, `starchart_export`

---

### Method Comparison

| Feature | Cloud (GitMCP) | Local Server |
|---------|---------------|--------------|
| **Setup Time** | 2 minutes | 5-10 minutes |
| **Requires Node.js** | No | Yes |
| **Works Offline** | No | Yes |
| **Auto-Updates** | Yes (GitHub) | No (manual pull) |
| **Available Tools** | 4 (GitHub access) | 27 (all features) |
| **Project Memory** | ❌ No | ✅ Yes (SQLite) |
| **Knowledge Graph** | ❌ No | ✅ Yes (Star Chart) |
| **Custom Modifications** | No | Yes |
| **Team Sharing** | Easy (one URL) | Manual (config sharing) |
| **Speed** | Network dependent | Local (fast) |
| **Best For** | Reading docs | Active development |

---

### Verification

After setup (either method), verify the MCP server is working:

1. Open Cursor
2. Go to `Settings → Tools & MCP`
3. Look for **"nebula-framework"** in "Installed MCP Servers"
4. Green indicator means it's active ✅

### Test the Connection

In Cursor chat, try:
```
"Use the nebula-framework MCP to list available framework files"
```

Or:
```
"Fetch the Rust Nebula adaptation using MCP"
```

If the MCP is working, I'll be able to access your framework documentation directly!

---

### Troubleshooting

#### Cloud Method Issues:
- **"Server not found"**: Check the URL is exactly `https://gitmcp.io/_/JCorellaFSL/Nebula-Protocol`
- **"Connection failed"**: Verify internet connection and GitHub is accessible
- **"No tools available"**: Restart Cursor after configuration

#### Local Method Issues:
- **"Command not found"**: Ensure Node.js is installed (`node --version`)
- **"Module not found"**: Run `npm install` in the repository directory
- **"Path not found"**: Verify NEBULA_FRAMEWORK_PATH points to correct directory
- **"Permission denied"**: On Linux/macOS, ensure script has execute permissions

For detailed troubleshooting, see **[MCP Implementation Guide](MCP_implementation.md)**

---

## 🚀 Quick Start: Initialize Your Project

### Option A: Automated Setup (Recommended)

Use the `init-nebula` command to automatically set up your project:

```bash
# Clone the Nebula Framework
git clone https://github.com/JCorellaFSL/Nebula-Protocol.git
cd Nebula-Protocol

# Install the framework
npm install
npm link  # Makes init-nebula available globally

# Navigate to your project
cd /path/to/your-project

# Initialize Nebula for your project
init-nebula rust my-todo-app
# OR
init-nebula flutter my-mobile-app
# OR  
init-nebula python my-web-service
```

**What this does:**
- ✅ Creates `.nebula/` directory with project-local tools
- ✅ Copies project memory database system
- ✅ Installs dependencies in `.nebula/tools/`
- ✅ Updates `.gitignore` to exclude logs/databases
- ✅ Configures build exclusions (keeps `.nebula/` out of production)
- ✅ Copies framework adaptation documents to `docs/`
- ✅ Creates initial `ROADMAP.md` with phase structure
- ✅ Initializes project memory database

**Result:** Your project has self-contained Nebula tools that:
- Stay out of production builds
- Track errors and patterns locally
- Persist across development sessions
- Don't require global MCP server

---

### Option B: Manual Setup

### Step 1: Choose Your Framework Adaptation
Pick the adaptation that matches your project:

```bash
# For Flutter projects
Use: FLUTTER_NEBULA_ADAPTATION.md

# For Tauri projects  
Use: TAURI_NEBULA_ADAPTATION.md

# For Python projects
Use: PYTHON_NEBULA_ADAPTATION.md

# For Rust projects
Use: RUST_NEBULA_ADAPTATION.md

# For Dioxus projects  
Use: DIOXUS_NEBULA_ADAPTATION.md

# For other frameworks
Use: Nebula_Protocol.md (generic)
```

**NEW in November 2024:** The framework uses cosmic terminology with **clear separation of concerns**:

- **🌌 Constellations** = Non-technical overview documents (WHAT and WHY)
  - Strategic goals, business value, success criteria
  - Example: `CONSTELLATION_0_SETUP.md`
  
- **🪐 Star Systems** = Technical instruction sets (HOW)
  - Step-by-step implementation, code examples, architecture
  - Example: `STAR_SYSTEM_0.1_ENVIRONMENT.md`
  - **Every constellation has Star Systems** - complexity determines how many
  
- **🚪 Star Gates** = Quality checkpoints (VALIDATION)
  - Mandatory testing and validation before next phase
  - Example: `STAR_GATE_0_SETUP.md`

**Key Principle:** Constellations provide context, Star Systems provide code.  
**Universal Structure:** All projects use Constellation → Star Systems → Star Gate pattern.  
Simple projects have fewer Star Systems per constellation; complex projects have more.

### Step 2: Load Framework into Your AI Tool

#### For AI-IDEs (Cursor, Windsurf, etc.)
1. **Open your project** in your AI-IDE
2. **Add framework files** to your project root or docs folder
3. **Reference the framework** in your AI conversations:
   ```
   "I'm using the Nebula Framework for project organization. 
   Please refer to FLUTTER_NEBULA_ADAPTATION.md for guidance."
   ```

#### For Chat-based AI (GPT, Claude, Gemini)
1. **Upload the framework file** to your conversation
2. **Set the context** with this prompt:
   ```
   Please use the attached Nebula Framework document as a reference 
   for structuring and developing my [Flutter/Tauri/Python/Rust/Dioxus] project. 
   Follow the Nebula (main roadmap) and Constellation (phase-specific) 
   pattern for all development discussions.
   ```

### Step 3: Create Your Project Structure

#### NEW APPROACH: Adaptive Constellation Generation
**CHANGED in November 2024:** The framework now supports organic growth instead of rigid upfront planning.

**Universal Structure:** All projects follow the same pattern:
```
CONSTELLATION (overview) → STAR SYSTEMS (technical) → STAR GATE (validation)
```

**Simple Projects (e.g., Python clock app):**
- 3-5 constellations with 1-2 Star Systems each
- Example structure:
  ```
  CONSTELLATION_0_SETUP.md (overview)
  ├── STAR_SYSTEM_0.1_ENVIRONMENT.md (Python setup, venv)
  └── STAR_GATE_0_SETUP.md (validation)
  
  CONSTELLATION_1_CORE.md (overview)
  ├── STAR_SYSTEM_1.1_CLOCK_LOGIC.md (time display implementation)
  └── STAR_GATE_1_CORE.md (validation)
  ```
- **Fewer Star Systems, not no Star Systems**

**Complex Projects (e.g., VSCode clone with agentic features):**
- 5-8 constellations with 3-8 Star Systems each
- Example structure:
  ```
  CONSTELLATION_1_CORE.md (overview)
  ├── STAR_SYSTEM_1.1_DATABASE.md (schema, migrations)
  ├── STAR_SYSTEM_1.2_API.md (REST endpoints)
  ├── STAR_SYSTEM_1.3_AUTH.md (authentication)
  ├── STAR_SYSTEM_1.4_WEBSOCKET.md (real-time features)
  └── STAR_GATE_1_CORE.md (validation)
  ```
- **More Star Systems to manage complexity**

**Rationale:** Separation of concerns is universal. Simple projects need strategic overview + technical detail too, just less of it. This prevents mixing context in constellation files regardless of project size.

#### HOLD 1: Per‑Constellation Conflict Review (during generation)
- For each newly generated constellation, run a quick review against all prior constellations:
  - Check for conflicts: tasks that supersede, duplicate, or nullify previous tasks
  - Check for phase fit: tasks better aligned to earlier/later phases
  - Check dependencies: ensure prerequisites are satisfied or linked
- Example prompt:
  ```
  Review ROADMAP_PHASE_2_FEATURES.md against phases 0–1 for conflicts,
  supersession, duplication, and mis-phasing. Propose reassignments or edits and
  list explicit rationale and updated dependencies.
  ```

#### HOLD 2: Global Constellation Review (after all are generated)
- Perform a whole-plan pass to suggest re-ordering, merging/splitting tasks, and dependency fixes.
- Ensure high-risk/infrastructure items occur before features dependent on them.
- Example prompt:
  ```
  Evaluate phases 0–4 for ordering and dependency correctness. Identify tasks to
  move between phases, merges/splits, and risks if sequence is unchanged. Output
  a proposed diff of phase assignment per task with justification.
  ```

#### A. Start with the Nebula (Main Roadmap)
Create `ROADMAP.md` using this template:

```markdown
# [Project Name] - Nebula Roadmap

## Project Overview
[Brief description of your project]

## Technology Stack
- Framework: [Flutter/Tauri/Python/etc.]
- Key Technologies: [List main technologies]
- Target Platforms: [Specify platforms]

## Development Phases

### Phase 0: Setup & Foundation
- Duration: [Timeline]
- Objectives: Project setup, environment configuration
- Key Deliverables: Basic project structure, dependencies

### Phase 1: Core Development  
- Duration: [Timeline]
- Objectives: Core functionality implementation
- Key Deliverables: [List main features]

### Phase 2: Feature Development
- Duration: [Timeline] 
- Objectives: Specific features and functionality
- Key Deliverables: [List specific features]

### Phase 3: Integration & Testing
- Duration: [Timeline]
- Objectives: Integration, testing, optimization
- Key Deliverables: Tested, integrated application

### Phase 4: Deployment & Distribution
- Duration: [Timeline]
- Objectives: Deployment, distribution, maintenance
- Key Deliverables: Deployed application

## Success Criteria
- [Define success metrics]
- [Quality standards]
- [Performance benchmarks]
```

#### B. Create Constellation Documents for Each Phase
Create the full set of constellation documents for all phases at project initialization, then refine details iteratively:

```markdown
# ROADMAP_PHASE_[NUMBER]_[DESCRIPTOR].md

## Phase Overview
Connection to Nebula phase and specific objectives

## Detailed Tasks
1. **Task Name**
   - Description: [What needs to be done]
   - Acceptance Criteria: [How to know it's complete]
   - Testing Method: [How to validate]
   - Dependencies: [What must be done first]

2. **Next Task**
   - [Continue pattern...]

## Implementation Details
- Technology specifics
- Architecture decisions
- Integration patterns

## Risk Register
- Top risks for this phase and mitigations
- Monitoring plan and decision triggers

## Phase Invariants (Entry/Exit)
- Entry conditions that must be true before starting
- Exit conditions that must be true to complete the phase

## Testing Strategy
- How to test each feature
- Validation criteria
- Quality standards

## Validation Checklist
- [ ] Feature implemented
- [ ] Manual testing completed
- [ ] Integration tested
- [ ] Documentation updated
- [ ] Dependencies resolved and linked
- [ ] Risks identified and mitigations noted
```

## 🤖 Working with AI: Best Practices

### Setting Up AI Context
When starting a new AI conversation:

1. **Load the framework**: Upload or reference your chosen adaptation
2. **Set the project context**: "I'm working on a [Flutter/Tauri/Python] project using the Nebula Framework"
3. **Specify current phase**: "I'm currently in Phase [X] focusing on [description]"
4. **Reference constellation**: "Please refer to ROADMAP_PHASE_[X]_[NAME].md for detailed requirements"

### AI Conversation Patterns

#### Starting a New Feature
```
"I need to implement [feature] as part of Phase [X]. 
Please refer to ROADMAP_PHASE_[X]_[NAME].md for the specific 
requirements and testing criteria."
```

#### Requesting Code Implementation
```
"Please implement [feature] following the Nebula Framework 
validation pattern: code -> test -> validate -> document.
Include the testing approach in your response."
```

#### Troubleshooting Issues
```
"I'm having issues with [problem] in Phase [X]. 
Please help debug this while maintaining the framework's 
testing and validation standards."
```

### The Critical Rule: Test-Validate-Proceed
**Every AI-generated feature must be:**
1. **Implemented** by the AI
2. **Tested** immediately by you
3. **Validated** against acceptance criteria
4. **Documented** with test results
5. **Approved** before proceeding to next task

## 🔧 Framework Integration Examples

### Example 1: Flutter App with Cursor
1. Open Flutter project in Cursor
2. Add `FLUTTER_NEBULA_ADAPTATION.md` to project
3. Create `ROADMAP.md` and phase constellations
4. Use Cursor's AI to implement features by referencing specific constellations
5. Test each feature immediately using hot reload
6. Validate against constellation acceptance criteria

### Example 2: Tauri App with Claude
1. Upload `TAURI_NEBULA_ADAPTATION.md` to Claude conversation
2. Create project structure following Nebula pattern
3. Ask Claude to implement features phase by phase
4. Test each implementation locally
5. Update constellation documents with progress

### Example 3: Python Project with GPT
1. Share `PYTHON_NEBULA_ADAPTATION.md` with GPT
2. Create detailed constellation documents for each phase
3. Use GPT to generate code following framework patterns
4. Run tests and validate functionality
5. Document results and proceed to next phase

## 📋 Daily Workflow

### Morning Setup
1. Review current constellation document
2. Identify next tasks to implement
3. Load framework context into AI tool
4. Begin development session

### Development Cycle
1. **Ask AI** to implement next feature from constellation
2. **Test immediately** - manual or automated
3. **Validate** against acceptance criteria
4. **Document** test results
5. **Update** constellation with progress
6. **Repeat** for next feature

### End of Day
1. Update constellation documents with progress
2. Note any issues or decisions made
3. Plan next day's tasks
4. Commit changes to version control

## 🛠️ Troubleshooting

### Common Issues

#### "AI doesn't understand my project context"
- **Solution**: Ensure framework document is loaded and referenced
- **Check**: Are you mentioning the specific constellation document?

#### "Generated code doesn't match requirements"
- **Solution**: Point AI to specific constellation sections
- **Check**: Are acceptance criteria clearly defined?

#### "Features break existing functionality"
- **Solution**: Emphasize testing and validation in AI prompts
- **Check**: Are you testing immediately after each implementation?

#### "Progress tracking is difficult"
- **Solution**: Update constellation documents after each completed task
- **Check**: Are you documenting test results and validation outcomes?

## 📊 Success Metrics

### Project Health Indicators
- **Completion Rate**: Tasks completed vs. planned in each constellation
- **Quality Score**: Percentage of features passing validation on first try
- **Issue Resolution**: Time to resolve bugs and integration problems
- **Documentation Currency**: How up-to-date constellation documents are

### Framework Effectiveness
- **Context Clarity**: AI understands requirements without clarification
- **Implementation Accuracy**: Generated code matches specifications
- **Testing Coverage**: All features have documented test results
- **Progress Transparency**: Team understands current project state

## 🔄 Iteration and Improvement

### Weekly Review
1. **Assess** constellation accuracy and completeness
2. **Update** framework adaptations based on learnings
3. **Refine** testing and validation processes
4. **Document** lessons learned and best practices

### Monthly Optimization
1. **Analyze** development velocity and quality metrics
2. **Identify** framework improvements and adaptations
3. **Update** templates and examples
4. **Share** insights with team and community

---

## 📖 Additional Resources

- **[Nebula Framework Overview](Nebula_readme.md)** - Complete framework philosophy
- **[Core Protocol](Nebula_Protocol.md)** - Framework specifications
- **[MCP Implementation Guide](MCP_implementation.md)** - Complete MCP server setup and activation
- **[Implementation Guide](IMPLEMENTATION_GUIDE.md)** - Detailed implementation steps
- **Framework Adaptations**: Choose your technology stack
  - `FLUTTER_NEBULA_ADAPTATION.md`
  - `TAURI_NEBULA_ADAPTATION.md`
  - `PYTHON_NEBULA_ADAPTATION.md`
  - `RUST_NEBULA_ADAPTATION.md`
  - `DIOXUS_NEBULA_ADAPTATION.md`

**Start your AI-assisted development journey with structured context engineering today!** 