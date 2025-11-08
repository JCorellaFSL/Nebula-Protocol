# Project 8: REST API (FastAPI)

## Non-Technical Overview

### What We're Building

A production-ready REST API with FastAPI that handles user authentication, CRUD operations on resources, and includes comprehensive documentation. This is the backend for a task management application.

### Why This Project?

Modern applications need robust backends. This project solves:
- Building scalable web services
- Handling user authentication securely
- Managing database operations
- Providing API documentation
- Supporting mobile/web frontends

### Who Is This For?

- Backend developers
- Full-stack developers needing APIs
- Teams building microservices
- Startups launching MVPs
- Anyone learning modern API development

### Core Features (What Users Can Do)

1. **User Registration** - Create accounts
2. **User Login** - JWT authentication
3. **CRUD Operations** - Create, read, update, delete tasks
4. **Authorization** - Users can only access their tasks
5. **Input Validation** - Pydantic models prevent bad data
6. **API Documentation** - Auto-generated OpenAPI/Swagger docs
7. **Rate Limiting** - Prevent abuse
8. **CORS Support** - Allow frontend access
9. **Database Operations** - PostgreSQL with SQLAlchemy
10. **Error Handling** - Clear, consistent error responses

### User Experience Flow (API Calls)

```
1. POST /api/auth/register
   {"email": "user@example.com", "password": "secure123"}
   → Returns: {"user_id": 1, "message": "Registered"}

2. POST /api/auth/login
   {"email": "user@example.com", "password": "secure123"}
   → Returns: {"access_token": "eyJ...", "token_type": "bearer"}

3. GET /api/tasks (with Authorization header)
   → Returns: [{"id": 1, "title": "Buy groceries", ...}]

4. POST /api/tasks (with Authorization header)
   {"title": "New task", "description": "Task details"}
   → Returns: {"id": 2, "title": "New task", ...}

5. PUT /api/tasks/2 (with Authorization header)
   {"title": "Updated task"}
   → Returns: {"id": 2, "title": "Updated task", ...}

6. DELETE /api/tasks/2 (with Authorization header)
   → Returns: {"message": "Task deleted"}
```

### Success Criteria (How We Know It Works)

- [ ] API handles 100 requests/second
- [ ] Authentication is secure (JWT, hashed passwords)
- [ ] Input validation catches all bad data
- [ ] Database operations are transactional
- [ ] OpenAPI documentation is accurate
- [ ] CORS configured correctly
- [ ] Rate limiting works (429 responses)
- [ ] All endpoints have tests (90%+ coverage)
- [ ] Error responses are consistent
- [ ] Logging captures all important events

### Technical Constraints

- Must use FastAPI framework
- Must use PostgreSQL database
- Must use SQLAlchemy ORM
- Must implement JWT authentication
- Must validate with Pydantic
- Must provide OpenAPI documentation
- Must include comprehensive tests
- Must handle concurrent requests
- Must log security events

### Similar Products (For Reference)

- Django REST Framework (more complex)
- Flask + extensions (more manual)
- Express.js (JavaScript)
- Spring Boot (Java)

### Project Scope

**In Scope:**
- User authentication (register, login, JWT)
- Task CRUD operations
- PostgreSQL database with migrations
- SQLAlchemy ORM
- Pydantic validation
- OpenAPI/Swagger documentation
- Rate limiting
- CORS configuration
- Error handling middleware
- Unit and integration tests
- Logging

**Out of Scope:**
- Email verification
- Password reset
- OAuth integration
- File uploads
- WebSocket support
- Caching (Redis)
- Background tasks (Celery)
- Deployment (Docker/K8s)

### Estimated Complexity

**Complexity Level:** Complex (Production-Ready)

**Reason:**
- Multiple interacting components
- Database design and migrations
- Authentication and authorization
- Security best practices
- Input validation and sanitization
- Error handling across layers
- Testing strategy (unit, integration, E2E)
- API design best practices
- Performance considerations

**Estimated Constellations:** 9-12

1. **Setup & Structure** - FastAPI project, dependencies, config
2. **Database Layer** - SQLAlchemy models, migrations (Alembic)
3. **Authentication** - User model, JWT, password hashing
4. **Core API** - Task endpoints, CRUD operations
5. **Authorization** - User-specific data access
6. **Validation & Errors** - Pydantic models, error handlers
7. **Security** - Rate limiting, CORS, security headers
8. **Testing** - Unit tests, integration tests, fixtures
9. **Documentation** - OpenAPI customization, examples
10. **Logging & Monitoring** - Structured logs, health checks
11. **Performance** - Database optimization, connection pooling
12. **Production Readiness** - Environment config, deployment prep

---

## Key Decisions to Make

1. **Database**
   - PostgreSQL (production-grade)
   - MySQL (alternative)
   - SQLite (development only)

2. **ORM**
   - SQLAlchemy (full-featured)
   - Tortoise ORM (async-first)
   - Raw SQL (manual, flexible)

3. **Authentication**
   - JWT (stateless, scalable)
   - Session cookies (stateful)
   - OAuth (external providers)

4. **Password Hashing**
   - bcrypt (industry standard)
   - argon2 (modern, secure)
   - PBKDF2 (older)

5. **Migrations**
   - Alembic (SQLAlchemy companion)
   - Manual SQL scripts
   - Django-style migrations

6. **Testing Framework**
   - pytest (flexible, powerful)
   - unittest (built-in)
   - nose2 (alternative)

---

## API Design

### RESTful Endpoints:

```
Authentication:
POST   /api/auth/register     - Create account
POST   /api/auth/login        - Get JWT token
POST   /api/auth/refresh      - Refresh token
GET    /api/auth/me           - Get current user

Tasks:
GET    /api/tasks             - List all tasks (paginated)
POST   /api/tasks             - Create task
GET    /api/tasks/{id}        - Get task by ID
PUT    /api/tasks/{id}        - Update task
DELETE /api/tasks/{id}        - Delete task
GET    /api/tasks/search      - Search tasks

Health:
GET    /health                - API health check
GET    /docs                  - OpenAPI documentation
```

### Response Format:

```json
// Success
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [...]
  }
}
```

---

## Database Schema

### Users Table:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table:
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(50) DEFAULT 'medium',
    due_date TIMESTAMP,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Security Requirements

### Must Implement:

1. **Password Security**
   - Hash with bcrypt (cost factor 12+)
   - Never store plain passwords
   - Enforce password strength

2. **JWT Security**
   - Short expiration (15-30 minutes)
   - Refresh token mechanism
   - Secret key from environment

3. **Input Validation**
   - Pydantic models for all requests
   - Sanitize all user input
   - Validate data types, ranges, formats

4. **SQL Injection Prevention**
   - Use ORM (SQLAlchemy)
   - Parameterized queries only
   - Never concatenate SQL strings

5. **Rate Limiting**
   - 100 requests/minute per IP
   - 10 login attempts/hour per email
   - Custom limits for expensive operations

6. **CORS Configuration**
   - Whitelist allowed origins
   - Restrict methods
   - Limit headers

---

## Testing Strategy

### Unit Tests:
- Database models
- Business logic functions
- Validation schemas
- Utility functions

### Integration Tests:
- API endpoints
- Database operations
- Authentication flow
- Authorization checks

### Test Coverage Goals:
- Overall: 90%+
- Critical paths: 100%
- Authentication: 100%
- API endpoints: 95%+

### Test Fixtures:
- Test database
- Sample users
- Sample tasks
- JWT tokens

---

## Performance Considerations

### Database:
- Connection pooling (10-20 connections)
- Indexes on foreign keys
- Indexes on frequently queried fields
- Query optimization (avoid N+1)

### API:
- Response pagination (default 50 items)
- Response caching headers
- Async database operations
- Background task queue (future)

### Monitoring:
- Request duration logging
- Database query logging
- Error rate tracking
- Health check endpoints

---

## Error Handling

### HTTP Status Codes:

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource
- `422 Unprocessable Entity` - Invalid data
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Error Response:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "field": "email",
    "details": {
      "provided": "notanemail",
      "expected": "email format"
    }
  }
}
```

---

## Success Metrics

After implementation, we should be able to:

- Handle 100+ concurrent requests
- Respond to API calls in under 100ms (P95)
- Pass all tests (90%+ coverage)
- Generate accurate OpenAPI documentation
- Enforce rate limits correctly
- Hash passwords securely (bcrypt)
- Validate all inputs with Pydantic
- Log all security events
- Handle database failures gracefully
- Deploy to production confidently

---

**This overview will be used to generate the initial constellation structure using the Nebula Protocol.**

**IMPORTANT:** This is a PRODUCTION-READY project. Every Star Gate must include:
- Security review
- Test coverage verification
- Performance testing
- API documentation validation

**Next Steps:**
1. Initialize Nebula Protocol for this project
2. Generate constellations with emphasis on production quality
3. Create detailed Star Systems for auth, database, API, testing
4. Implement comprehensive test suite
5. Record API patterns to Central KG for future backend projects
6. Security audit before final Star Gate
7. Load testing and performance optimization

