# Project 1: Todo List CLI

## Non-Technical Overview

### What We're Building

A command-line application that helps users manage their daily tasks. Users can add todos, mark them as complete, set priorities, and organize their work. Think of it as a digital task list that lives in the terminal.

### Why This Project?

Everyone needs to track tasks. This project solves the problem of:
- Forgetting important tasks
- Losing track of priorities
- Managing multiple todos
- Accessing tasks from anywhere (command line)

### Who Is This For?

- Developers who live in the terminal
- Students managing assignments
- Anyone who wants a simple, fast task manager
- People who prefer keyboard over mouse

### Core Features (What Users Can Do)

1. **Add Tasks** - Quickly add new todos with descriptions
2. **View All Tasks** - See complete list of todos
3. **Mark Complete** - Check off finished tasks
4. **Delete Tasks** - Remove tasks no longer needed
5. **Set Priorities** - Mark tasks as high, medium, or low priority
6. **Set Due Dates** - Add deadlines to tasks
7. **Search Tasks** - Find specific todos quickly
8. **Filter by Status** - Show only pending or completed tasks
9. **Color-Coded Display** - Visual cues for priorities and status

### User Experience Flow

```
1. User opens terminal
2. Types: todo add "Buy groceries"
3. Task is saved
4. User types: todo list
5. Sees all tasks with colors showing priority
6. User types: todo complete 1
7. First task marked as done
8. User types: todo list --pending
9. Sees only incomplete tasks
```

### Success Criteria (How We Know It Works)

- [ ] User can add a task in under 3 seconds
- [ ] Tasks persist between sessions (saved to file)
- [ ] User can view all tasks clearly
- [ ] Completed tasks are visually distinct
- [ ] Help text is clear and useful
- [ ] Works on Windows, Mac, and Linux
- [ ] No crashes or data loss

### Technical Constraints

- Must work in terminal (no GUI)
- Must be fast (instant commands)
- Must save data locally (no cloud)
- Should work offline
- Should be easy to install

### Similar Products (For Reference)

- Todoist (but simpler)
- Microsoft To Do (but command-line)
- Apple Reminders (but for terminal users)

### Project Scope

**In Scope:**
- Basic CRUD operations (Create, Read, Update, Delete)
- Priority levels
- Due dates
- Search functionality
- Color-coded output
- File-based storage

**Out of Scope:**
- Cloud sync
- Collaboration/sharing
- Mobile apps
- Reminders/notifications
- Subtasks
- Calendar integration

### Estimated Complexity

**Complexity Level:** Simple

**Reason:** 
- Straightforward data structures (list of tasks)
- Simple file I/O
- No complex algorithms
- No external services
- Standard Python libraries

**Estimated Constellations:** 4-5

1. **Setup & Structure** - Project initialization, file structure
2. **Core Functionality** - Add, list, complete, delete tasks
3. **Enhanced Features** - Priorities, due dates, search, filters
4. **Polish & Testing** - Colors, help text, error handling, tests

---

## Key Decisions to Make

1. **Data Storage Format**
   - JSON (human-readable, easy to debug)
   - SQLite (better for queries)
   - CSV (simplest)

2. **CLI Framework**
   - argparse (built-in, no dependencies)
   - typer (modern, better UX)
   - click (popular, well-supported)

3. **Date Handling**
   - Accept natural language ("tomorrow", "next week")
   - Require specific format (YYYY-MM-DD)
   - Use calendar picker

4. **Task ID System**
   - Sequential numbers (1, 2, 3...)
   - UUID (unique but long)
   - Timestamp-based

5. **Color Library**
   - colorama (cross-platform)
   - termcolor (simpler)
   - rich (modern, feature-rich)

---

## Success Metrics

After implementation, we should be able to:

- Run full test suite with 100% pass rate
- Complete 10 common task operations in under 30 seconds
- Handle 1000+ tasks without performance issues
- Recover gracefully from file corruption
- Display helpful error messages for all user mistakes

---

**This overview will be used to generate the initial constellation structure using the Nebula Protocol.**

**Next Steps:**
1. Initialize Nebula Protocol for this project
2. Generate constellations based on this overview
3. Create Star Systems for each constellation
4. Begin implementation with Star Gate quality checks

