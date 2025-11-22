# Nebula Protocol

**Version:** 1.1.0 (Universal Schema)  
**Status:** Active  
**Architecture:** Git-First, Local Memory, Universal Adapter  

## 🌌 Overview

The **Nebula Protocol** is a context-engineering framework designed to bridge the gap between AI agents (LLMs) and complex software projects. It provides a structured way to manage project memory, documentation, and decision-making, ensuring that AI assistants (like Gemini, Claude, Cursor) always have the full picture.

## 🚀 Key Features

- **Universal Knowledge Graph (KG):** A unified SQLite database (`local_kg/universal_memory.sqlite`) that serves as the single source of truth for project memory.
- **Language Agnostic:** 
  - **Node.js Adapter:** `project-memory.js`
  - **Python Adapter:** `local_kg.py`
- **Event-Driven Memory:** All project actions (errors, decisions, milestones) are stored as a linear stream of `events`, making it easy for LLMs to "replay" history.
- **Flashlight Planning:** Adaptive "Constellation" generation—plan the next phase only after validating the current one.
- **Star Gates:** Mandatory quality checkpoints that prevent AI rush-coding.

## 📂 Project Structure

```
.
├── .nebula/                    # Legacy config (deprecated)
├── archive/                    # Historical data
├── local_kg/                   # The Brain 🧠
│   ├── universal_memory.sqlite # The Shared DB
│   └── local_kg.py             # Python Tooling
├── migration-protocol/         # Migration docs (archived)
├── projects/                   # Your actual code
├── src/                        # API Server Source
├── nebula-api-server.js        # Main API Entry Point
├── project-memory.js           # Node.js Adapter
├── IMPLEMENTATION_GUIDE.md     # How to use this
└── ROADMAP.md                  # High-level plan
```

## 🛠️ Usage

### 1. Setup
The protocol is designed to be dropped into any project.
```bash
# Initialize (example)
python local_kg/local_kg.py update-context
```

### 2. Node.js API
The API server provides endpoints for your IDE or agents to query memory.
```bash
npm start
```

### 3. Python Tooling
Use the CLI to update context summaries for your LLM session.
```bash
python local_kg/local_kg.py update-context
# Output: "Project Status: ACTIVE. Recent Errors: 0..."
```

## 🧠 The "Context Window" Summary

A unique feature of Nebula 1.1 is the `context_window_summary`. This is a continuously updated "System Prompt" stored in the database.
- **Why?** Instead of feeding 100 files to your AI, you feed it this 1 paragraph summary + the last 5 events.
- **Result:** Massive token savings and better "grounding" for the AI.

## 📜 Documentation

- **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md):** Detailed instructions for developers.
- **[Nebula_Protocol.md](Nebula_Protocol.md):** The theoretical framework.
- **[local_kg/README.md](local_kg/README.md):** Knowledge Graph specific docs.

---
*Powered by FSLabs*
