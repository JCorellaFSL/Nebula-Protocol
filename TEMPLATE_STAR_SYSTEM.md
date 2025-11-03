# STAR SYSTEM [X.Y]: [DESCRIPTOR]

> **Type:** Technical Instruction Set  
> **Constellation:** [Parent constellation name]  
> **Purpose:** Step-by-step implementation guide for LLM execution  
> **Non-Technical Context:** See CONSTELLATION_[X]_[DESCRIPTOR].md

---

## 1. Technical Overview

### What This Builds
[Specific component, feature, or subsystem being implemented]

### Technology Stack
- **Language/Framework:** [e.g., Python 3.11, React 18, Rust 1.75]
- **Key Libraries:** [e.g., FastAPI, Axios, Tokio]
- **Tools:** [e.g., Docker, Redis, PostgreSQL]

### Architecture
[High-level architecture diagram or description]
```
[Component A] → [Component B] → [Component C]
     ↓              ↓              ↓
  [Database]    [Cache]       [Queue]
```

### Integration Points
- **Upstream:** [What this depends on]
- **Downstream:** [What depends on this]
- **External:** [Third-party services, APIs]

### Prerequisites
- [ ] [Required setup or previous Star System completion]
- [ ] [Tools/services that must be running]
- [ ] [Configuration that must exist]

---

## 2. Implementation Steps

### Step 1: [Setup/Foundation]
**Goal:** [What this step accomplishes]

**Actions:**
```[language]
# Code example or command
[Concrete implementation]
```

**Files to Create/Modify:**
- `path/to/file1.ext` - [Purpose]
- `path/to/file2.ext` - [Purpose]

**Configuration:**
```[language]
[Configuration example]
```

**Validation:**
```bash
# Command to verify this step
[Test command]
```

---

### Step 2: [Core Implementation]
**Goal:** [What this step accomplishes]

**Actions:**
```[language]
# Code example or implementation
[Concrete code]
```

**Key Functions/Classes:**
```[language]
class ExampleClass:
    """
    [Purpose and usage]
    """
    def example_method(self, param):
        """
        [What this does]
        
        Args:
            param: [Description]
            
        Returns:
            [Return value description]
        """
        pass
```

**Error Handling:**
```[language]
# Error handling patterns
try:
    [Implementation]
except SpecificError as e:
    [Error handling]
```

**Validation:**
```bash
# Command to verify this step
[Test command]
```

---

### Step 3: [Integration]
**Goal:** [What this step accomplishes]

**Actions:**
```[language]
# Integration code
[Concrete implementation]
```

**Integration Pattern:**
[How this connects to other components]

**Validation:**
```bash
# Command to verify integration
[Test command]
```

---

### Step 4: [Testing & Finalization]
**Goal:** [What this step accomplishes]

**Test Implementation:**
```[language]
# Test code
def test_example():
    """Test [specific functionality]"""
    # Arrange
    [Setup]
    
    # Act
    [Execute]
    
    # Assert
    [Verify]
```

**Validation:**
```bash
# Run all tests for this Star System
[Test command]
```

---

## 3. Technical Specifications

### API Specifications (if applicable)
```[language]
# Endpoint definitions
GET /api/resource
POST /api/resource
PUT /api/resource/{id}
DELETE /api/resource/{id}
```

**Request/Response Examples:**
```json
{
  "example": "data structure",
  "field": "value"
}
```

### Data Models
```[language]
# Data model definitions
class DataModel:
    field1: Type
    field2: Type
    
    def validate(self):
        """Validation logic"""
        pass
```

### Schema Definitions
```sql
-- Database schema if applicable
CREATE TABLE example (
    id SERIAL PRIMARY KEY,
    field VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Configuration Requirements
```[language]
# Required configuration
CONFIG = {
    'setting1': 'value1',
    'setting2': 'value2'
}
```

---

## 4. Testing & Validation

### Unit Tests
**Test File:** `tests/test_[component].py`

```[language]
# Unit test implementation
def test_functionality_1():
    """Test [specific functionality]"""
    assert condition, "Error message"

def test_edge_case_1():
    """Test [edge case]"""
    assert condition, "Error message"
```

**Run Command:**
```bash
pytest tests/test_[component].py -v
```

### Integration Tests
**Test File:** `tests/integration/test_[component]_integration.py`

```[language]
# Integration test implementation
def test_integration_with_component_x():
    """Test integration between components"""
    # Setup both components
    # Execute interaction
    # Verify outcome
```

**Run Command:**
```bash
pytest tests/integration/ -v
```

### Manual Verification Checklist
- [ ] [Manual test case 1 - specific user action]
- [ ] [Manual test case 2 - specific interaction]
- [ ] [Edge case 3 - unusual but valid scenario]

### Validation Criteria
- [ ] **Functionality:** [All features work as specified]
- [ ] **Performance:** [Meets performance requirements]
- [ ] **Error Handling:** [Graceful failure modes]
- [ ] **Integration:** [Works with other components]

---

## 5. Potential Challenges

### Technical Challenges

#### Challenge 1: [Specific technical issue]
**Problem:** [Description of the challenge]

**Solutions:**
1. **Option A:** [Solution approach]
   - Pros: [Advantages]
   - Cons: [Disadvantages]
2. **Option B:** [Alternative approach]
   - Pros: [Advantages]
   - Cons: [Disadvantages]

**Recommended:** [Chosen approach with rationale]

#### Challenge 2: [Another technical issue]
**Problem:** [Description]
**Solution:** [Mitigation strategy]

### Known Limitations
- [Limitation 1 and workaround]
- [Limitation 2 and workaround]

### Performance Considerations
- [Performance concern 1 and optimization]
- [Performance concern 2 and optimization]

---

## 6. Completion Checklist

### Implementation Complete
- [ ] All code written and committed
- [ ] Configuration files in place
- [ ] Documentation updated
- [ ] Integration verified

### Testing Complete
- [ ] Unit tests passing (100% for critical paths)
- [ ] Integration tests passing
- [ ] Manual verification completed
- [ ] Edge cases handled

### Quality Checks
- [ ] Code reviewed (if team environment)
- [ ] Performance benchmarks met
- [ ] Error handling tested
- [ ] Logging implemented

### Ready for Star Gate
- [ ] This Star System fully functional
- [ ] No blocking issues
- [ ] Changes committed and pushed
- [ ] Ready to move to next Star System or Constellation

---

## Next Steps

**If more Star Systems in this Constellation:**
- Proceed to **STAR_SYSTEM_[X.Y+1]_[NEXT_DESCRIPTOR].md**

**If this completes the Constellation:**
- Pass through **STAR_GATE_[X]_[CONSTELLATION_NAME].md**
- Update version tracking
- Create git tag
- Proceed to next constellation

---

## Notes & Decisions

### Technical Decisions
[Record important architectural or implementation decisions]

### Lessons Learned
[What worked well, what to avoid in future]

### Future Improvements
[Ideas for optimization or enhancement later]

