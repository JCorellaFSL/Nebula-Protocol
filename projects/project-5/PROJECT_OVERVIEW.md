# Project 5: Password Manager

## Non-Technical Overview

### What We're Building

A secure command-line password manager with encryption. Users can store all their passwords behind one master password, generate strong passwords, and access them quickly from the terminal.

### Why This Project?

Password reuse is a security risk. This project solves:
- Remembering dozens of unique passwords
- Creating strong passwords
- Storing passwords securely
- Quick password access
- Avoiding password manager subscriptions

### Who Is This For?

- Security-conscious individuals
- Developers who live in terminal
- People tired of browser password managers
- Anyone wanting local password control
- Users who value privacy over convenience

### Core Features (What Users Can Do)

1. **Master Password** - Single password to access vault
2. **Add Passwords** - Store website/app credentials
3. **Retrieve Passwords** - Search and view passwords
4. **Generate Passwords** - Create strong random passwords
5. **Copy to Clipboard** - Quick copy for pasting
6. **Update Passwords** - Change existing entries
7. **Delete Entries** - Remove old accounts
8. **Password Strength** - Check password security
9. **Auto-Lock** - Lock after inactivity
10. **Encrypted Storage** - AES-256 encryption

### User Experience Flow

```
1. First run: User creates master password
2. User types: pass add github
3. Prompts for username and password
4. User types: pass generate --length 20
5. Strong password generated and stored
6. User types: pass get github
7. Enters master password
8. GitHub credentials displayed
9. User types: pass copy github password
10. Password copied to clipboard (auto-clears in 30s)
```

### Success Criteria (How We Know It Works)

- [ ] Master password cannot be recovered (encryption works)
- [ ] Encrypted file cannot be read without master password
- [ ] Password generation creates truly random passwords
- [ ] Clipboard auto-clears after 30 seconds
- [ ] No passwords stored in plain text anywhere
- [ ] Locks after 5 minutes of inactivity
- [ ] Zero data loss during encryption/decryption
- [ ] Handles encryption errors gracefully

### Technical Constraints

- **SECURITY CRITICAL** - No compromises on security
- Must use AES-256 encryption (industry standard)
- Must use proper key derivation (PBKDF2 with high iterations)
- Must clear sensitive data from memory
- Must validate all inputs (prevent injection)
- Must handle encryption failures safely
- Cannot log passwords or master password
- Must work offline (no cloud sync)

### Similar Products (For Reference)

- 1Password (but simpler, local)
- LastPass (but command-line)
- pass (Unix password manager)
- KeePass (but terminal-based)

### Project Scope

**In Scope:**
- Master password authentication
- AES-256 encryption
- PBKDF2 key derivation
- Password CRUD operations
- Password generation (random, configurable)
- Password strength checking
- Clipboard integration (with auto-clear)
- Auto-lock on inactivity
- SQLite encrypted database

**Out of Scope:**
- Cloud sync
- Browser extension
- Two-factor authentication
- Password sharing
- Biometric unlock
- Mobile apps
- Import from other password managers

### Estimated Complexity

**Complexity Level:** Moderate to High (Security-Critical)

**Reason:**
- **Security is paramount** - Any bug could expose passwords
- Encryption/decryption complexity
- Key derivation understanding
- Secure memory handling
- Input validation (prevent attacks)
- Error handling (no data loss)
- Clipboard security

**Estimated Constellations:** 7-9

1. **Setup & Security Foundation** - Project structure, security research
2. **Encryption System** - AES-256, PBKDF2, key management
3. **Master Password** - Authentication, validation, lockout
4. **Database Design** - Encrypted SQLite schema
5. **Core Operations** - Add, retrieve, update, delete passwords
6. **Password Generation** - Random generation, strength checking
7. **Clipboard Integration** - Copy with auto-clear
8. **Auto-Lock & Security** - Inactivity timeout, session management
9. **Testing & Security Audit** - Extensive testing, vulnerability checks

---

## Key Decisions to Make

1. **Encryption Library**
   - cryptography (recommended, audited)
   - PyCrypto (deprecated, avoid)
   - hashlib + Crypto (manual, risky)

2. **Key Derivation**
   - PBKDF2 (standard, well-tested)
   - bcrypt (password hashing, slower)
   - Argon2 (modern, memory-hard)

3. **Database**
   - SQLite with encryption
   - JSON file with encryption
   - Custom binary format

4. **Master Password Storage**
   - Don't store (derive key every time)
   - Store hash for verification (standard)
   - Use key stretching (PBKDF2 iterations)

5. **Clipboard Library**
   - pyperclip (cross-platform)
   - xerox (alternative)
   - platform-specific (pbcopy, xclip)

6. **Password Generation**
   - secrets module (cryptographically secure)
   - random module (NOT secure)
   - /dev/urandom (Unix only)

---

## Security Requirements

### Critical Security Principles:

1. **Never Store Master Password**
   - Derive encryption key from master password
   - Use high iteration count (100,000+)
   - Salt unique to each installation

2. **Proper Encryption**
   - AES-256 in CBC or GCM mode
   - Unique IV for each encryption
   - Authenticated encryption (prevent tampering)

3. **Memory Safety**
   - Clear sensitive data after use
   - Don't log passwords or keys
   - Avoid string concatenation (creates copies)

4. **Input Validation**
   - Sanitize all inputs
   - Prevent SQL injection
   - Validate master password strength

5. **Error Handling**
   - Never expose why decryption failed
   - Don't leak information in errors
   - Fail securely (lock on suspicious activity)

---

## Security Testing Checklist

### Must Verify:

- [ ] **Encryption Works**
  - Encrypted file is not readable
  - Different master passwords produce different keys
  - IV is unique per encryption

- [ ] **Key Derivation Works**
  - Same master password produces same key
  - High iteration count (100,000+)
  - Salt is stored and reused correctly

- [ ] **No Plain Text Leaks**
  - Check swap files
  - Check temp files
  - Check core dumps
  - Check logs

- [ ] **Clipboard Security**
  - Clears after 30 seconds
  - Doesn't persist across sessions
  - Works on all platforms

- [ ] **Lock Functionality**
  - Locks after timeout
  - Can't bypass lock
  - Requires re-authentication

- [ ] **Error Cases**
  - Wrong master password handled
  - Corrupted database handled
  - Encryption failures handled
  - All failures fail securely

---

## Common Security Pitfalls to Avoid

1. ❌ Using ECB mode for encryption
2. ❌ Reusing IV across encryptions
3. ❌ Low PBKDF2 iteration count (<100,000)
4. ❌ Storing master password or key
5. ❌ Logging sensitive information
6. ❌ Using `random` instead of `secrets`
7. ❌ Not validating decryption (MAC)
8. ❌ Exposing information in error messages

---

## Success Metrics

After implementation, we should be able to:

- Store 1000+ passwords securely
- Decrypt passwords in under 100ms
- Generate cryptographically secure passwords
- Pass all security tests with 100% success
- Handle wrong master password gracefully
- Auto-lock after exact timeout period
- Clear clipboard reliably on all platforms
- Survive database corruption without data loss

---

**This overview will be used to generate the initial constellation structure using the Nebula Protocol.**

**IMPORTANT:** This is a SECURITY-CRITICAL project. Every Star Gate must include security review and testing.

**Next Steps:**
1. Initialize Nebula Protocol for this project
2. Generate constellations with emphasis on security
3. Create detailed Star Systems for encryption, validation, testing
4. Implement comprehensive security testing
5. Record security patterns to Central KG for future secure projects
6. Security audit before final Star Gate

