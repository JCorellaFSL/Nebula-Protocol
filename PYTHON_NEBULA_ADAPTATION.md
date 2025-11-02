# Python Nebula Framework Adaptation

**⚠️ UPDATED:** November 2024 - Now uses Constellations, Star Systems, and Star Gates terminology

## Overview
This document adapts the Nebula Context Engineering Protocol specifically for Python development projects, incorporating Python-specific tools, patterns, and best practices for web applications, APIs, data science, and automation projects.

## Python-Specific Constellation Content Structure

### 1. Constellation Overview
- **Python Context:** Project type implications (web app, API, data science, automation)
- **Framework Considerations:** Django, Flask, FastAPI, or other framework-specific requirements
- **Environment Management:** Virtual environments, dependency isolation
- **Python Version:** Target Python version and compatibility considerations
- **Package Management:** pip, poetry, or pipenv usage patterns

### 2. Detailed Sub-Tasks
- **Module Development:** Python modules and packages to be implemented (test immediately)
- **API Endpoints:** REST/GraphQL endpoint implementations (test with curl/Postman)
- **Database Integration:** ORM models and database operations (test with sample data)
- **Package Dependencies:** PyPI packages to be incorporated (validate compatibility)
- **Configuration Management:** Environment variables and settings (verify across environments)
- **Testing Requirement:** Each sub-task must include Python-specific validation method

### 3. Technical Implementation Details

#### Python-Specific Sections:
- **Project Structure:**
  - Package organization and module design
  - Import patterns and namespace management
  - Configuration file structure
  - Static file and template organization

- **Environment Management:**
  - Virtual environment setup and management
  - Dependency management with requirements.txt or pyproject.toml
  - Environment variable configuration
  - Python version compatibility handling

- **Framework Integration:**
  - Django/Flask/FastAPI specific implementations
  - URL routing and view patterns
  - Middleware and authentication setup
  - Template engine integration

- **Database Integration:**
  - ORM model definitions and relationships
  - Database migration strategies
  - Query optimization patterns
  - Connection pooling and management

- **API Development:**
  - RESTful API design patterns
  - Request/response serialization
  - Error handling and validation
  - API documentation generation

### 4. Testing Strategy

#### Python Testing Approach:
- **Unit Tests:** Function and class testing with unittest/pytest
- **Integration Tests:** Database and API endpoint testing
- **End-to-End Tests:** Complete user workflow testing
- **Performance Tests:** Load testing and profiling
- **Security Tests:** Authentication and authorization validation

#### Testing Tools:
- **pytest:** Primary testing framework
- **coverage:** Code coverage measurement
- **tox:** Testing across Python versions
- **mock:** Test doubles and mocking
- **requests-mock:** API testing utilities

### 5. Potential Challenges

#### Python-Specific Challenges:
- **Dependency Management:** Version conflicts and package compatibility
- **Performance Optimization:** Python GIL limitations and async patterns
- **Memory Management:** Large dataset handling and memory leaks
- **Deployment Complexity:** WSGI/ASGI server configuration
- **Package Distribution:** Building and distributing Python packages
- **Environment Consistency:** Development vs. production environment differences

### 6. Acceptance Criteria

#### Python-Specific Criteria:
- **Code Quality:** PEP 8 compliance and linting scores (validated with flake8/black)
- **Test Coverage:** Minimum coverage thresholds (measured with coverage.py)
- **Performance Benchmarks:** Response time and throughput metrics
- **Security Compliance:** Vulnerability scanning and security best practices
- **Documentation:** Docstring coverage and API documentation completeness
- **Environment Compatibility:** Successful deployment across target environments

## Python Project Phase Examples

### Phase 0: Python Setup (→ 0.1.0)
- **Constellation:** `ROADMAP_PHASE_0_PYTHON_SETUP.md`
- **Focus:** Environment setup, project structure, **LOGGING INFRASTRUCTURE**
- **Key Tasks:**
  - Python environment setup (virtual environment, pyenv)
  - Project structure creation
  - **Initialize logging (logging module with JSON formatter)**
  - **Create `.nebula/logs/` directory structure**
  - **Initialize project memory via MCP**
  - Package management configuration (requirements.txt or pyproject.toml)
  - Development tools setup (linting, formatting)

### Phase 1: Core Python Architecture (→ 0.2.0)
- **Constellation:** `ROADMAP_PHASE_1_PYTHON_CORE.md`
- **Focus:** Core application structure, database models, **BACKEND ONLY**
- **Key Tasks:**
  - Application framework setup (Django/Flask/FastAPI)
  - Database model definitions
  - Core business logic implementation
  - Configuration management
  - API endpoint structure (backend logic only)
- **WARNING:** Cannot proceed to Phase 2 without completing Phase 1.5!

### Phase 1.5: Basic UI (→ 0.3.0) **MANDATORY - DO NOT SKIP**
- **Constellation:** `ROADMAP_PHASE_1.5_BASIC_UI.md`
- **Focus:** Make all Phase 1 features accessible through UI/API interface
- **Key Tasks:**
  - **Web App:** Create templates/frontend for all endpoints
  - **API:** Create API documentation and test interface (Swagger/ReDoc)
  - **CLI:** Create command-line interface for all operations
  - Basic forms for data input
  - Display data from backend
  - Error messages and user feedback
  - Manual testing via browser/Postman/CLI
- **Quality Gate:** Manual testing checklist completed, endpoints testable
- **Exit Condition:** User/developer can interact with all Phase 1 features

### Phase 2: Feature Development (→ 0.4.0)
- **Constellation:** `ROADMAP_PHASE_2_PYTHON_FEATURES.md`
- **Focus:** Specific features with BOTH backend and user interface
- **Key Tasks:**
  - Feature-specific modules with corresponding UI/API
  - API endpoint implementations with documentation
  - Database operations with management interface
  - Business logic with user-facing components
- **Quality Gate:** Review Phases 0-2 for conflicts, create Phase 2.01 if issues found
- **Logging:** All errors logged to project memory

### Phase 3: Integration & Testing (→ 0.5.0)
- **Constellation:** `ROADMAP_PHASE_3_PYTHON_INTEGRATION.md`
- **Focus:** Integration testing, third-party services, optimization
- **Key Tasks:**
  - Integration with external services
  - Performance optimization (query optimization, caching)
  - Security implementation (auth, CORS, rate limiting)
  - Comprehensive testing (unit, integration, E2E)
  - Error pattern analysis from project memory
- **Quality Gate:** Review all phases for integration issues

### Phase 3.5: UI Polish (→ 0.6.0) **MANDATORY - DO NOT SKIP**
- **Constellation:** `ROADMAP_PHASE_3.5_UI_POLISH.md`
- **Focus:** Professional, production-ready interface
- **Key Tasks:**
  - **Web App:** Visual design refinement, responsive design
  - **API:** Complete documentation, examples, error messages
  - **CLI:** Help messages, colors, progress bars
  - User experience improvements
  - Accessibility features
  - Loading states and feedback
  - User feedback integration
- **Quality Gate:** UX review, documentation review
- **Exit Condition:** App/API ready for public release
  - Comprehensive testing

### Phase 4: Deployment (→ 1.0.0)
- **Constellation:** `ROADMAP_PHASE_4_PYTHON_DEPLOYMENT.md`
- **Focus:** Production deployment, monitoring, and distribution
- **Key Tasks:**
  - Production deployment setup (Docker, AWS, Heroku, etc.)
  - Monitoring and logging infrastructure
  - Package distribution (PyPI if library, Docker if app)
  - Final documentation
  - **Version bump to 1.0.0**
- **Quality Gate:** Final review, all tests passing
- **Exit Condition:** App/API deployed and available

## Python Immediate Validation Approach

### Development Server Testing
- **Live Reloading:** Use framework development servers for immediate feedback
- **API Testing:** Test endpoints with curl, Postman, or HTTPie immediately after implementation
- **Database Testing:** Validate database operations with sample data
- **Function Testing:** Test individual functions with Python REPL or scripts

### Unit Testing Strategy
- **Test-Driven Development:** Write tests before implementation when possible
- **Immediate Testing:** Run tests after each function/class implementation
- **Coverage Monitoring:** Track test coverage and aim for high coverage
- **Regression Testing:** Ensure new changes don't break existing functionality

### Integration Testing
- **Database Integration:** Test with real database connections
- **API Integration:** Test complete request/response cycles
- **External Service Integration:** Mock and test third-party service calls
- **Environment Testing:** Validate across different Python versions and environments

### Validation Documentation for Python
Each Python task must include:
- **Function/Module Test Results:** Unit test execution results
- **API Test Evidence:** Request/response examples and validation
- **Database Test Results:** Sample data operations and query results
- **Performance Metrics:** Response times, memory usage, and throughput
- **Code Quality Metrics:** Linting scores, coverage percentages

## Python-Specific Tools and Integrations

### Development Tools:
- **Poetry/pip:** Dependency management and virtual environments
- **Black/isort:** Code formatting and import sorting
- **flake8/pylint:** Code linting and quality checks
- **mypy:** Type checking and static analysis

### Testing Tools:
- **pytest:** Testing framework with extensive plugin ecosystem
- **coverage.py:** Code coverage measurement and reporting
- **tox:** Testing across multiple Python versions
- **pytest-mock:** Mocking and test doubles

### Development Environment:
- **IPython/Jupyter:** Interactive development and debugging
- **pdb/ipdb:** Debugging tools
- **Django/Flask dev servers:** Live reloading development servers
- **FastAPI automatic docs:** Interactive API documentation

### Quality Assurance:
- **pre-commit:** Git hooks for code quality enforcement
- **bandit:** Security vulnerability scanning
- **safety:** Dependency vulnerability checking
- **sphinx:** Documentation generation

### Deployment:
- **Docker:** Containerization for consistent deployments
- **Gunicorn/uWSGI:** WSGI server deployment
- **Celery:** Asynchronous task processing
- **Redis/RabbitMQ:** Message broker and caching

## Best Practices Integration

### Code Organization:
- **Package Structure:** Clear module organization and import patterns
- **Configuration Management:** Environment-based configuration
- **Error Handling:** Consistent exception handling patterns
- **Documentation:** Comprehensive docstrings and API documentation

### Performance Considerations:
- **Database Optimization:** Efficient queries and connection management
- **Async Programming:** Proper use of async/await patterns
- **Memory Management:** Efficient data processing and garbage collection
- **Caching Strategies:** Redis, memcached, or application-level caching

### Security:
- **Input Validation:** Proper sanitization and validation
- **Authentication:** Secure user authentication and authorization
- **HTTPS:** SSL/TLS configuration and enforcement
- **Dependency Security:** Regular security audits and updates

## Framework-Specific Considerations

### Django Projects
- **Models:** Database schema design and ORM usage
- **Views:** Class-based and function-based view patterns
- **Templates:** Template inheritance and context management
- **Admin:** Django admin customization and usage

### Flask Projects
- **Blueprints:** Application modularization patterns
- **Extensions:** Flask extension integration and configuration
- **Templates:** Jinja2 template usage and organization
- **Database:** SQLAlchemy integration and migration management

### FastAPI Projects
- **Pydantic Models:** Request/response validation and serialization
- **Dependency Injection:** FastAPI dependency system usage
- **Async Operations:** Proper async/await implementation
- **OpenAPI:** Automatic API documentation generation

## Example Constellation Template

```markdown
# ROADMAP_PHASE_X_PYTHON_[DESCRIPTOR].md

## Phase Overview
**Nebula Reference:** [Link to main roadmap phase]
**Python Context:** [Specific Python project type and framework]
**Framework:** [Django/Flask/FastAPI/Other]
**Python Version:** [Target Python version]

## Detailed Sub-Tasks
### Module Development
- [ ] Core module implementations
- [ ] Package structure organization
- [ ] Import pattern establishment

### API Development
- [ ] Endpoint implementations
- [ ] Request/response handling
- [ ] Authentication integration

### Database Operations
- [ ] Model definitions
- [ ] Migration scripts
- [ ] Query optimization

## Technical Implementation
### Project Structure
[Specific Python project organization]

### Framework Integration
[Django/Flask/FastAPI specific implementations]

### Database Design
[ORM models and database schema]

### API Design
[RESTful API patterns and documentation]

## Testing Strategy
- Unit Tests: [Function and class testing]
- Integration Tests: [Database and API testing]
- End-to-End Tests: [Complete workflow testing]
- Performance Tests: [Load testing and profiling]

## Potential Challenges
- [Python-specific technical challenges]
- [Framework-specific considerations]
- [Performance optimization strategies]

## Acceptance Criteria
- [ ] Code quality standards met (PEP 8, linting)
- [ ] Test coverage targets achieved
- [ ] Performance benchmarks satisfied
- [ ] Security requirements validated
- [ ] Documentation completeness verified
```

## Python Configuration Examples

### pyproject.toml Structure
```toml
[tool.poetry]
name = "your-project"
version = "0.1.0"
description = "Your project description"
authors = ["Your Name <your.email@example.com>"]

[tool.poetry.dependencies]
python = "^3.9"
django = "^4.2"
psycopg2-binary = "^2.9"

[tool.poetry.dev-dependencies]
pytest = "^7.0"
black = "^23.0"
flake8 = "^6.0"
coverage = "^7.0"

[build-system]
requires = ["poetry-core>=1.0.0"]
build-backend = "poetry.core.masonry.api"
```

### Django Settings Pattern
```python
# settings/base.py
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY')
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    # Your apps here
]

# Database configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}
```

### FastAPI Application Structure
```python
# main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .routers import users, items
from .database import engine, get_db

app = FastAPI(title="Your API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/v1")
app.include_router(items.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to Your API"}
```

---

*This Python adaptation ensures that the Nebula framework leverages Python's specific capabilities while maintaining the structured approach to project management and context engineering.* 