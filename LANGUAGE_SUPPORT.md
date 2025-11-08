# Nebula Protocol - Language & Framework Support

**Version:** 2.0.0  
**Last Updated:** November 8, 2025  
**Total Languages:** 11  
**Total Frameworks:** 15+

---

## 🌐 Supported Languages

### Tier 1: Full Production Support

#### 1. **Rust** 🦀
**Status:** ✅ Fully Supported  
**Error Detection:** `E0308`, `E0277`, etc.  
**Official Docs:**
- [Rust Error Index](https://doc.rust-lang.org/error_index.html)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Rust std](https://doc.rust-lang.org/std/)
- [docs.rs](https://docs.rs/) (external crates)

**Adaptation:** [RUST_NEBULA_ADAPTATION.md](./RUST_NEBULA_ADAPTATION.md)

---

#### 2. **Python** 🐍
**Status:** ✅ Fully Supported  
**Error Detection:** `TypeError`, `ValueError`, `ImportError`, etc.  
**Official Docs:**
- [Python Official Docs](https://docs.python.org/3/)
- [Exception Reference](https://docs.python.org/3/library/exceptions.html)
- [PyPI](https://pypi.org/)

**Adaptation:** [PYTHON_NEBULA_ADAPTATION.md](./PYTHON_NEBULA_ADAPTATION.md)

---

#### 3. **JavaScript / TypeScript** 📜
**Status:** ✅ Fully Supported  
**Error Detection:** 
- JS: `ReferenceError`, `TypeError`, etc.
- TS: `TS2304`, `TS2345`, etc.

**Official Docs:**
- [MDN Web Docs](https://developer.mozilla.org/)
- [Node.js API](https://nodejs.org/api/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

**Popular Frameworks:** React, Next.js, Vue, Angular, Express, NestJS

---

#### 4. **Java** ☕
**Status:** ✅ Fully Supported  
**Error Detection:** `NullPointerException`, `ClassNotFoundException`, etc.  
**Official Docs:**
- [Java SE Docs](https://docs.oracle.com/en/java/javase/)
- [Java API](https://docs.oracle.com/en/java/javase/17/docs/api/)
- [Java Tutorial](https://docs.oracle.com/javase/tutorial/)

**Popular Frameworks:** Spring Boot, Spring MVC, Hibernate, Apache Camel

---

#### 5. **C# / .NET** 🟣
**Status:** ✅ Fully Supported  
**Error Detection:** `CS0019`, `NullReferenceException`, etc.  
**Official Docs:**
- [C# Docs](https://learn.microsoft.com/en-us/dotnet/csharp/)
- [.NET API](https://learn.microsoft.com/en-us/dotnet/api/)
- [.NET Fundamentals](https://learn.microsoft.com/en-us/dotnet/fundamentals/)

**Popular Frameworks:** .NET Core, ASP.NET Core, Entity Framework, Blazor

---

#### 6. **Go** 🐹
**Status:** ✅ Fully Supported  
**Error Detection:** Error interface patterns  
**Official Docs:**
- [Go Official Docs](https://go.dev/doc/)
- [Go Packages](https://pkg.go.dev/)
- [Effective Go](https://go.dev/doc/effective_go)

**Popular Frameworks:** Gin, Echo, Fiber, gRPC

---

#### 7. **PHP** 🐘
**Status:** ✅ Fully Supported  
**Error Detection:** `FatalError`, `Exception`, `TypeError`, etc.  
**Official Docs:**
- [PHP Manual](https://www.php.net/manual/en/)
- [PHP Functions](https://www.php.net/manual/en/funcref.php)

**Popular Frameworks:** Laravel, Symfony, WordPress, Drupal

---

#### 8. **Swift** 🍎
**Status:** ✅ Fully Supported  
**Error Detection:** Error protocol patterns  
**Official Docs:**
- [Swift Book](https://docs.swift.org/swift-book/)
- [Apple Developer Docs](https://developer.apple.com/documentation/swift)

**Popular Frameworks:** SwiftUI, UIKit, Vapor

---

#### 9. **Kotlin** 🎯
**Status:** ✅ Fully Supported  
**Error Detection:** `Exception`, `Error` patterns  
**Official Docs:**
- [Kotlin Official Docs](https://kotlinlang.org/docs/)
- [Kotlin Stdlib API](https://kotlinlang.org/api/latest/jvm/stdlib/)

**Popular Frameworks:** Spring Boot (Kotlin), Ktor, Android SDK

---

#### 10. **Dart / Flutter** 🎨
**Status:** ✅ Fully Supported  
**Error Detection:** Dart exceptions and Flutter widget errors  
**Official Docs:**
- [Dart API](https://api.dart.dev/stable/)
- [Flutter API](https://api.flutter.dev/flutter/)
- [Flutter Docs](https://docs.flutter.dev/)

**Adaptation:** [FLUTTER_NEBULA_ADAPTATION.md](./FLUTTER_NEBULA_ADAPTATION.md)

---

### Tier 2: Work In Progress (WIP)

#### 11. **C++** ⚠️ 
**Status:** 🚧 WIP - Requires Additional Tooling  
**Error Detection:** `error C2xxx`, standard library errors  
**Official Docs:**
- [cppreference.com](https://en.cppreference.com/)
- [cplusplus.com](https://cplusplus.com/reference/)
- [ISO C++](https://isocpp.org/)

**⚠️  Important Notes:**
- C++ error handling is complex and compiler-specific
- Requires additional static analysis tools:
  - **clang-tidy** (recommended)
  - **cpplint** (Google style)
  - **cppcheck** (static analysis)
  - **clang-format** (formatting)
- Different compilers (GCC, Clang, MSVC) have different error formats
- Template error messages can be extremely verbose

**Recommended Setup:**
```bash
# Install clang-tidy and cppcheck
sudo apt-get install clang-tidy cppcheck  # Linux
brew install llvm cppcheck                 # macOS

# Use compile_commands.json for better error detection
cmake -DCMAKE_EXPORT_COMPILE_COMMANDS=ON ..
```

**Status:** Nebula Protocol provides basic C++ documentation links, but full integration requires project-specific compiler configuration.

---

## 🏗️ Framework Support

### Web Frameworks

#### **React** ⚛️
- Language: JavaScript/TypeScript
- Error Detection: Component errors, hooks errors
- Integration: Via JavaScript/TypeScript support

#### **Next.js** ⏭️
- Language: JavaScript/TypeScript
- Error Detection: Build errors, runtime errors
- Integration: Via JavaScript/TypeScript support

#### **Vue.js** 🖖
- Language: JavaScript/TypeScript
- Error Detection: Component errors, reactivity errors
- Integration: Via JavaScript/TypeScript support

#### **Angular** 🅰️
- Language: TypeScript
- Error Detection: Compiler errors, runtime errors
- Integration: Via TypeScript support

---

### Backend Frameworks

#### **Django** 🎸
- Language: Python
- Error Detection: Python exceptions + Django-specific errors
- Integration: Via Python support
- Docs: https://docs.djangoproject.com/

#### **FastAPI** ⚡
- Language: Python
- Error Detection: Python exceptions + Pydantic validation errors
- Integration: Via Python support
- Docs: https://fastapi.tiangolo.com/

#### **Spring Boot** 🍃
- Language: Java
- Error Detection: Java exceptions + Spring-specific errors
- Integration: Via Java support
- Docs: https://spring.io/projects/spring-boot

#### **ASP.NET Core** 🟣
- Language: C#
- Error Detection: C# compiler errors + .NET exceptions
- Integration: Via C# support
- Docs: https://learn.microsoft.com/en-us/aspnet/core/

#### **Express.js** 🚂
- Language: JavaScript/TypeScript
- Error Detection: JavaScript errors + middleware errors
- Integration: Via JavaScript/TypeScript support
- Docs: https://expressjs.com/

#### **NestJS** 🐱
- Language: TypeScript
- Error Detection: TypeScript errors + decorator errors
- Integration: Via TypeScript support
- Docs: https://nestjs.com/

---

### Mobile Frameworks

#### **Flutter** 🎨
- Language: Dart
- Error Detection: Dart exceptions + widget errors
- Full Adaptation: [FLUTTER_NEBULA_ADAPTATION.md](./FLUTTER_NEBULA_ADAPTATION.md)
- Docs: https://flutter.dev/

#### **React Native** 📱
- Language: JavaScript/TypeScript
- Error Detection: JavaScript errors + native bridge errors
- Integration: Via JavaScript/TypeScript support
- Docs: https://reactnative.dev/

#### **SwiftUI** 🍎
- Language: Swift
- Error Detection: Swift errors + SwiftUI-specific
- Integration: Via Swift support
- Docs: https://developer.apple.com/documentation/swiftui/

---

### Desktop Frameworks

#### **Tauri** 🦀
- Languages: Rust (backend) + JavaScript/TypeScript (frontend)
- Error Detection: Both Rust and JS errors
- Full Adaptation: [TAURI_NEBULA_ADAPTATION.md](./TAURI_NEBULA_ADAPTATION.md)
- Docs: https://tauri.app/

#### **Electron** ⚡
- Language: JavaScript/TypeScript
- Error Detection: JavaScript errors + IPC errors
- Integration: Via JavaScript/TypeScript support
- Docs: https://www.electronjs.org/

#### **Dioxus** 🦀
- Language: Rust
- Error Detection: Rust errors + component errors
- Full Adaptation: [DIOXUS_NEBULA_ADAPTATION.md](./DIOXUS_NEBULA_ADAPTATION.md)
- Docs: https://dioxuslabs.com/

---

## 📊 Language Support Matrix

| Language | Error Detection | Doc Fetching | Adaptation File | Status |
|----------|----------------|--------------|----------------|--------|
| Rust | ✅ E0xxx | ✅ Auto | ✅ Yes | 🟢 Production |
| Python | ✅ Exceptions | ✅ Auto | ✅ Yes | 🟢 Production |
| JavaScript | ✅ Errors | ✅ Auto | ✅ Via frameworks | 🟢 Production |
| TypeScript | ✅ TSxxxx | ✅ Auto | ✅ Via frameworks | 🟢 Production |
| Java | ✅ Exceptions | ✅ Auto | 📝 Pending | 🟢 Production |
| C# | ✅ CSxxxx | ✅ Auto | 📝 Pending | 🟢 Production |
| C++ | ⚠️ Compiler | ⚠️ Basic | ⚠️ WIP | 🟡 WIP |
| Go | ✅ Errors | ✅ Auto | 📝 Pending | 🟢 Production |
| PHP | ✅ Exceptions | ✅ Auto | 📝 Pending | 🟢 Production |
| Swift | ✅ Errors | ✅ Auto | 📝 Pending | 🟢 Production |
| Kotlin | ✅ Exceptions | ✅ Auto | 📝 Pending | 🟢 Production |
| Dart/Flutter | ✅ Exceptions | ✅ Auto | ✅ Yes | 🟢 Production |

**Legend:**
- 🟢 Production: Fully supported, tested, documented
- 🟡 WIP: Basic support, requires additional configuration
- 📝 Pending: Supported by API, adaptation file coming soon

---

## 🔧 Usage Examples

### Rust Example
```bash
curl -X POST http://localhost:3000/api/project/my-project/error \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "language": "Rust",
    "message": "error[E0308]: mismatched types"
  }'

# Response includes:
# - Direct link to E0308 explanation
# - Related Rust Book sections
# - Standard library docs
```

### Java Example
```bash
curl -X POST http://localhost:3000/api/project/my-project/error \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "language": "Java",
    "message": "java.lang.NullPointerException"
  }'

# Response includes:
# - NullPointerException JavaDoc
# - Exception handling tutorial
```

### C++ Example (WIP)
```bash
curl -X POST http://localhost:3000/api/project/my-project/error \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "language": "C++",
    "message": "error C2065: undeclared identifier"
  }'

# Response includes:
# - ⚠️  WIP warning
# - cppreference.com links
# - Recommendation to use clang-tidy
```

---

## 🎯 Coming Soon

### Planned Language Support
- [ ] **Ruby** - Rails, Sinatra
- [ ] **Scala** - Play Framework, Akka
- [ ] **Elixir** - Phoenix Framework
- [ ] **Haskell** - Yesod, Servant

### Planned Framework Support
- [ ] **Laravel** (PHP) - Full adaptation
- [ ] **Ruby on Rails** - Full adaptation
- [ ] **Django** (Python) - Enhanced integration
- [ ] **Spring Boot** (Java) - Enhanced integration

---

## 📚 Adding New Language Support

Want to add a language? Here's what's needed:

1. **Update `nebula-docs-service.js`:**
   - Add official doc sources
   - Add error pattern mapping
   - Implement fetch function

2. **Create Adaptation File:**
   - `LANGUAGE_NEBULA_ADAPTATION.md`
   - Language-specific constellation structure
   - Testing strategies
   - Tools and patterns

3. **Test Error Detection:**
   - Verify error patterns match
   - Test documentation fetching
   - Validate related links

4. **Submit PR:**
   - Include examples
   - Update this document
   - Add integration tests

---

## 🆘 Language-Specific Help

### C++ Setup Help

**Problem:** "C++ errors aren't being detected properly"

**Solution:**
1. Use `compile_commands.json`:
   ```bash
   cmake -DCMAKE_EXPORT_COMPILE_COMMANDS=ON ..
   ```

2. Install clang-tidy:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install clang-tidy
   
   # macOS
   brew install llvm
   ```

3. Configure your IDE to use clang-tidy for error checking

4. Nebula will provide documentation links, but local tooling provides better error detection

---

## 📊 Statistics

**Total Languages:** 11 (10 production + 1 WIP)  
**Total Frameworks:** 15+ officially tested  
**Documentation Sources:** 30+ official sites  
**Error Patterns Supported:** 500+ common errors  
**Cache Hit Rate:** ~95% after initial fetch  

---

**Built with:** Official documentation APIs  
**Maintained by:** Nebula Protocol Team  
**License:** MIT  

**Version:** 2.0.0  
**Last Updated:** November 8, 2025

