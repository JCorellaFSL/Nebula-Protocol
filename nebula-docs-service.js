#!/usr/bin/env node

/**
 * Nebula Documentation Service
 * 
 * Dynamically fetches and caches official documentation when errors are encountered.
 * Integrates with Central KG to learn which docs are most relevant for specific errors.
 */

import fetch from 'node-fetch';
import crypto from 'crypto';

export class DocumentationService {
  constructor(redisClient = null) {
    this.redis = redisClient;
    this.cacheTTL = 86400; // 24 hours
    
    // Official documentation sources
    this.docSources = {
      rust: {
        std: 'https://doc.rust-lang.org/std/',
        book: 'https://doc.rust-lang.org/book/',
        cargo: 'https://doc.rust-lang.org/cargo/',
        error_index: 'https://doc.rust-lang.org/error_index.html',
        api: 'https://docs.rs/',
      },
      python: {
        official: 'https://docs.python.org/3/',
        pypi: 'https://pypi.org/project/',
        pep: 'https://peps.python.org/pep-',
      },
      javascript: {
        mdn: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/',
        node: 'https://nodejs.org/api/',
      },
      typescript: {
        handbook: 'https://www.typescriptlang.org/docs/handbook/',
        reference: 'https://www.typescriptlang.org/docs/',
      },
      java: {
        official: 'https://docs.oracle.com/en/java/javase/',
        api: 'https://docs.oracle.com/en/java/javase/17/docs/api/',
        tutorial: 'https://docs.oracle.com/javase/tutorial/',
      },
      csharp: {
        docs: 'https://learn.microsoft.com/en-us/dotnet/csharp/',
        api: 'https://learn.microsoft.com/en-us/dotnet/api/',
        fundamentals: 'https://learn.microsoft.com/en-us/dotnet/fundamentals/',
      },
      cpp: {
        cppreference: 'https://en.cppreference.com/w/',
        isocpp: 'https://isocpp.org/',
        cplusplus: 'https://cplusplus.com/reference/',
        note: 'WIP - Requires additional tooling for full support',
      },
      go: {
        official: 'https://go.dev/doc/',
        pkg: 'https://pkg.go.dev/',
        effective: 'https://go.dev/doc/effective_go',
      },
      php: {
        official: 'https://www.php.net/manual/en/',
        functions: 'https://www.php.net/manual/en/funcref.php',
      },
      swift: {
        official: 'https://docs.swift.org/swift-book/',
        api: 'https://developer.apple.com/documentation/swift',
      },
      kotlin: {
        official: 'https://kotlinlang.org/docs/',
        api: 'https://kotlinlang.org/api/latest/jvm/stdlib/',
      },
      flutter: {
        api: 'https://api.flutter.dev/flutter/',
        docs: 'https://docs.flutter.dev/',
        pub: 'https://pub.dev/documentation/',
      },
      dart: {
        api: 'https://api.dart.dev/stable/',
        docs: 'https://dart.dev/guides/',
      },
    };

    // Error code to documentation mapping
    this.errorMappings = {
      rust: {
        pattern: /E\d{4}/,
        getUrl: (code) => `https://doc.rust-lang.org/error_index.html#${code}`,
      },
      python: {
        pattern: /([\w]+Error|[\w]+Exception)/,
        getUrl: (exception) => `https://docs.python.org/3/library/exceptions.html#${exception}`,
      },
      javascript: {
        pattern: /([\w]+Error)/,
        getUrl: (error) => `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/${error}`,
      },
      typescript: {
        pattern: /TS\d{4}/,
        getUrl: (code) => `https://typescript.tv/errors/#${code}`,
      },
      java: {
        pattern: /([\w]+Exception|[\w]+Error)/,
        getUrl: (exception) => `https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/${exception}.html`,
      },
      csharp: {
        pattern: /(CS\d{4}|[\w]+Exception)/,
        getUrl: (code) => code.startsWith('CS') 
          ? `https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-messages/${code.toLowerCase()}`
          : `https://learn.microsoft.com/en-us/dotnet/api/system.${code.toLowerCase()}`,
      },
      cpp: {
        pattern: /(error C\d{4}|[\w]+_error)/,
        getUrl: (error) => `https://en.cppreference.com/w/cpp/error`,
        note: 'C++ error handling is complex - additional tooling recommended',
      },
      go: {
        pattern: /([\w]+Error)/,
        getUrl: (error) => `https://pkg.go.dev/errors`,
      },
      php: {
        pattern: /([\w]+Error|[\w]+Exception)/,
        getUrl: (exception) => `https://www.php.net/manual/en/class.${exception.toLowerCase()}.php`,
      },
      swift: {
        pattern: /([\w]+Error)/,
        getUrl: (error) => `https://developer.apple.com/documentation/swift/error`,
      },
      kotlin: {
        pattern: /([\w]+Exception|[\w]+Error)/,
        getUrl: (exception) => `https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/${exception.toLowerCase()}.html`,
      },
    };
  }

  /**
   * Generate cache key for documentation
   */
  getCacheKey(language, query, docType = 'error') {
    const hash = crypto.createHash('md5')
      .update(`${language}:${docType}:${query}`)
      .digest('hex');
    return `nebula:docs:${hash}`;
  }

  /**
   * Fetch documentation from cache or source
   */
  async fetchDocumentation(language, query, options = {}) {
    const { 
      docType = 'error',
      forceRefresh = false,
      includeRelated = true 
    } = options;

    // Try cache first
    if (!forceRefresh && this.redis) {
      const cacheKey = this.getCacheKey(language, query, docType);
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return {
          source: 'cache',
          data: JSON.parse(cached),
          timestamp: new Date().toISOString()
        };
      }
    }

    // Fetch from official source
    const result = await this.fetchFromSource(language, query, docType);

    // Cache the result
    if (this.redis && result.success) {
      const cacheKey = this.getCacheKey(language, query, docType);
      await this.redis.setEx(
        cacheKey,
        this.cacheTTL,
        JSON.stringify(result.data)
      );
    }

    return {
      source: 'live',
      data: result.data,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Fetch documentation from official source
   */
  async fetchFromSource(language, query, docType) {
    const lang = language.toLowerCase();

    try {
      switch (lang) {
        case 'rust':
          return await this.fetchRustDocs(query, docType);
        case 'python':
          return await this.fetchPythonDocs(query, docType);
        case 'javascript':
        case 'typescript':
          return await this.fetchJavaScriptDocs(query, docType);
        case 'java':
          return await this.fetchJavaDocs(query, docType);
        case 'csharp':
        case 'c#':
          return await this.fetchCSharpDocs(query, docType);
        case 'cpp':
        case 'c++':
          return await this.fetchCppDocs(query, docType);
        case 'go':
        case 'golang':
          return await this.fetchGoDocs(query, docType);
        case 'php':
          return await this.fetchPhpDocs(query, docType);
        case 'swift':
          return await this.fetchSwiftDocs(query, docType);
        case 'kotlin':
          return await this.fetchKotlinDocs(query, docType);
        case 'flutter':
        case 'dart':
          return await this.fetchFlutterDocs(query, docType);
        default:
          return {
            success: false,
            error: `Unsupported language: ${language}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        query,
        language
      };
    }
  }

  /**
   * Fetch Rust-specific documentation
   */
  async fetchRustDocs(query, docType) {
    // Check if it's an error code (E0xxx)
    const errorCodeMatch = query.match(/E\d{4}/);
    if (errorCodeMatch) {
      const errorCode = errorCodeMatch[0];
      const url = this.errorMappings.rust.getUrl(errorCode);
      
      try {
        const response = await fetch(url);
        const html = await response.text();
        
        // Extract error explanation (simplified - would need proper HTML parsing)
        const explanation = this.extractRustErrorExplanation(html, errorCode);
        
        return {
          success: true,
          data: {
            errorCode,
            url,
            explanation,
            language: 'rust',
            docType: 'error',
            relatedLinks: [
              'https://doc.rust-lang.org/book/',
              'https://doc.rust-lang.org/std/'
            ]
          }
        };
      } catch (error) {
        return {
          success: false,
          error: `Failed to fetch Rust docs: ${error.message}`,
          fallback: {
            url: 'https://doc.rust-lang.org/error_index.html',
            suggestion: 'Check the Rust error index for details'
          }
        };
      }
    }

    // Check if it's a type/trait/module query
    if (docType === 'api') {
      // For std library
      if (query.startsWith('std::')) {
        const path = query.replace(/::/g, '/');
        const url = `https://doc.rust-lang.org/${path}/index.html`;
        
        return {
          success: true,
          data: {
            query,
            url,
            language: 'rust',
            docType: 'api',
            source: 'std'
          }
        };
      }
      
      // For external crates (docs.rs)
      const [crate, ...rest] = query.split('::');
      const url = `https://docs.rs/${crate}/latest/${crate}/`;
      
      return {
        success: true,
        data: {
          query,
          url,
          language: 'rust',
          docType: 'api',
          source: 'docs.rs'
        }
      };
    }

    return {
      success: false,
      error: 'Could not determine documentation type',
      query
    };
  }

  /**
   * Extract Rust error explanation from HTML
   */
  extractRustErrorExplanation(html, errorCode) {
    // This is a simplified version - would need proper HTML parsing with cheerio/jsdom
    const regex = new RegExp(`${errorCode}[\\s\\S]*?<p>(.*?)<\\/p>`, 'i');
    const match = html.match(regex);
    
    if (match && match[1]) {
      return match[1]
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .trim();
    }
    
    return `Error ${errorCode} - See documentation for details`;
  }

  /**
   * Fetch Python-specific documentation
   */
  async fetchPythonDocs(query, docType) {
    // Check if it's an exception
    if (query.includes('Error') || query.includes('Exception')) {
      const url = this.errorMappings.python.getUrl(query);
      
      return {
        success: true,
        data: {
          exception: query,
          url,
          language: 'python',
          docType: 'error',
          relatedLinks: [
            'https://docs.python.org/3/library/exceptions.html',
            'https://docs.python.org/3/tutorial/errors.html'
          ]
        }
      };
    }

    // Check if it's a module/package
    if (docType === 'api') {
      const module = query.replace(/\./g, '/');
      const url = `https://docs.python.org/3/library/${module}.html`;
      
      return {
        success: true,
        data: {
          query,
          url,
          language: 'python',
          docType: 'api'
        }
      };
    }

    return {
      success: false,
      error: 'Could not determine documentation type',
      query
    };
  }

  /**
   * Fetch JavaScript/TypeScript documentation
   */
  async fetchJavaScriptDocs(query, docType) {
    // Check if it's an error
    if (query.includes('Error')) {
      const url = this.errorMappings.javascript.getUrl(query);
      
      return {
        success: true,
        data: {
          error: query,
          url,
          language: 'javascript',
          docType: 'error',
          relatedLinks: [
            'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors'
          ]
        }
      };
    }

    // Check if it's an API query
    if (docType === 'api') {
      const url = `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/${query}`;
      
      return {
        success: true,
        data: {
          query,
          url,
          language: 'javascript',
          docType: 'api'
        }
      };
    }

    return {
      success: false,
      error: 'Could not determine documentation type',
      query
    };
  }

  /**
   * Fetch Flutter/Dart documentation
   */
  async fetchFlutterDocs(query, docType) {
    if (docType === 'api') {
      // Flutter widget/class
      if (query.includes('Widget') || query.includes('State')) {
        const className = query.split('.').pop();
        const url = `https://api.flutter.dev/flutter/widgets/${className}-class.html`;
        
        return {
          success: true,
          data: {
            query,
            url,
            language: 'flutter',
            docType: 'api'
          }
        };
      }
      
      // Dart core
      const url = `https://api.dart.dev/stable/dart-core/${query}-class.html`;
      
      return {
        success: true,
        data: {
          query,
          url,
          language: 'dart',
          docType: 'api'
        }
      };
    }

    return {
      success: false,
      error: 'Could not determine documentation type',
      query
    };
  }

  /**
   * Extract error code/type from error message
   */
  extractErrorInfo(language, errorMessage) {
    const lang = language.toLowerCase();
    const mapping = this.errorMappings[lang];
    
    if (!mapping) {
      return null;
    }

    const match = errorMessage.match(mapping.pattern);
    if (match) {
      return {
        code: match[0],
        url: mapping.getUrl(match[0]),
        language: lang
      };
    }

    return null;
  }

  /**
   * Search documentation (for more general queries)
   */
  async searchDocumentation(language, searchTerm, options = {}) {
    const { limit = 5 } = options;
    const lang = language.toLowerCase();

    const searchUrls = {
      rust: `https://doc.rust-lang.org/std/?search=${encodeURIComponent(searchTerm)}`,
      python: `https://docs.python.org/3/search.html?q=${encodeURIComponent(searchTerm)}`,
      javascript: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(searchTerm)}`,
      flutter: `https://api.flutter.dev/search.html?q=${encodeURIComponent(searchTerm)}`,
    };

    return {
      success: true,
      data: {
        searchTerm,
        language,
        searchUrl: searchUrls[lang] || null,
        suggestion: 'Use the search URL to find relevant documentation'
      }
    };
  }

  /**
   * Fetch Java-specific documentation
   */
  async fetchJavaDocs(query, docType) {
    if (query.includes('Exception') || query.includes('Error')) {
      const className = query.split('.').pop();
      const url = `https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/${className}.html`;
      
      return {
        success: true,
        data: {
          exception: query,
          url,
          language: 'java',
          docType: 'error',
          relatedLinks: [
            'https://docs.oracle.com/javase/tutorial/essential/exceptions/'
          ]
        }
      };
    }

    if (docType === 'api') {
      const url = `https://docs.oracle.com/en/java/javase/17/docs/api/`;
      return {
        success: true,
        data: { query, url, language: 'java', docType: 'api' }
      };
    }

    return { success: false, error: 'Could not determine documentation type', query };
  }

  /**
   * Fetch C#-specific documentation
   */
  async fetchCSharpDocs(query, docType) {
    if (query.startsWith('CS')) {
      const url = `https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-messages/${query.toLowerCase()}`;
      return {
        success: true,
        data: {
          errorCode: query,
          url,
          language: 'csharp',
          docType: 'error',
          relatedLinks: [
            'https://learn.microsoft.com/en-us/dotnet/csharp/'
          ]
        }
      };
    }

    if (query.includes('Exception')) {
      const url = `https://learn.microsoft.com/en-us/dotnet/api/system.${query.toLowerCase()}`;
      return {
        success: true,
        data: { exception: query, url, language: 'csharp', docType: 'error' }
      };
    }

    if (docType === 'api') {
      const url = `https://learn.microsoft.com/en-us/dotnet/api/`;
      return {
        success: true,
        data: { query, url, language: 'csharp', docType: 'api' }
      };
    }

    return { success: false, error: 'Could not determine documentation type', query };
  }

  /**
   * Fetch C++-specific documentation
   */
  async fetchCppDocs(query, docType) {
    const url = `https://en.cppreference.com/w/cpp/error`;
    
    return {
      success: true,
      data: {
        query,
        url,
        language: 'cpp',
        docType,
        warning: '⚠️  C++ SUPPORT IS WIP - Requires additional tooling for full integration',
        note: 'C++ error handling is complex. Consider using clang-tidy, cpplint, or other static analysis tools.',
        relatedLinks: [
          'https://en.cppreference.com/',
          'https://cplusplus.com/reference/',
          'https://isocpp.org/'
        ]
      }
    };
  }

  /**
   * Fetch Go-specific documentation
   */
  async fetchGoDocs(query, docType) {
    if (query.includes('Error')) {
      const url = `https://pkg.go.dev/errors`;
      return {
        success: true,
        data: {
          error: query,
          url,
          language: 'go',
          docType: 'error',
          relatedLinks: [
            'https://go.dev/blog/error-handling-and-go'
          ]
        }
      };
    }

    if (docType === 'api') {
      const url = `https://pkg.go.dev/${query}`;
      return {
        success: true,
        data: { query, url, language: 'go', docType: 'api' }
      };
    }

    return { success: false, error: 'Could not determine documentation type', query };
  }

  /**
   * Fetch PHP-specific documentation
   */
  async fetchPhpDocs(query, docType) {
    if (query.includes('Error') || query.includes('Exception')) {
      const url = `https://www.php.net/manual/en/class.${query.toLowerCase()}.php`;
      return {
        success: true,
        data: {
          exception: query,
          url,
          language: 'php',
          docType: 'error',
          relatedLinks: [
            'https://www.php.net/manual/en/language.exceptions.php'
          ]
        }
      };
    }

    if (docType === 'api') {
      const url = `https://www.php.net/manual/en/function.${query.replace('_', '-')}.php`;
      return {
        success: true,
        data: { query, url, language: 'php', docType: 'api' }
      };
    }

    return { success: false, error: 'Could not determine documentation type', query };
  }

  /**
   * Fetch Swift-specific documentation
   */
  async fetchSwiftDocs(query, docType) {
    if (query.includes('Error')) {
      const url = `https://developer.apple.com/documentation/swift/error`;
      return {
        success: true,
        data: {
          error: query,
          url,
          language: 'swift',
          docType: 'error',
          relatedLinks: [
            'https://docs.swift.org/swift-book/LanguageGuide/ErrorHandling.html'
          ]
        }
      };
    }

    if (docType === 'api') {
      const url = `https://developer.apple.com/documentation/swift/${query.toLowerCase()}`;
      return {
        success: true,
        data: { query, url, language: 'swift', docType: 'api' }
      };
    }

    return { success: false, error: 'Could not determine documentation type', query };
  }

  /**
   * Fetch Kotlin-specific documentation
   */
  async fetchKotlinDocs(query, docType) {
    if (query.includes('Exception') || query.includes('Error')) {
      const url = `https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/${query.toLowerCase()}.html`;
      return {
        success: true,
        data: {
          exception: query,
          url,
          language: 'kotlin',
          docType: 'error',
          relatedLinks: [
            'https://kotlinlang.org/docs/exceptions.html'
          ]
        }
      };
    }

    if (docType === 'api') {
      const url = `https://kotlinlang.org/api/latest/jvm/stdlib/`;
      return {
        success: true,
        data: { query, url, language: 'kotlin', docType: 'api' }
      };
    }

    return { success: false, error: 'Could not determine documentation type', query };
  }

  /**
   * Get related documentation based on error pattern
   */
  async getRelatedDocs(language, errorPattern, errorCategory) {
    const relatedDocs = {
      rust: {
        'type_error': [
          'https://doc.rust-lang.org/book/ch03-02-data-types.html',
          'https://doc.rust-lang.org/std/option/',
          'https://doc.rust-lang.org/std/result/'
        ],
        'lifetime_error': [
          'https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html',
          'https://doc.rust-lang.org/nomicon/lifetimes.html'
        ],
        'borrow_error': [
          'https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html',
          'https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html'
        ]
      },
      python: {
        'type_error': [
          'https://docs.python.org/3/library/stdtypes.html',
          'https://docs.python.org/3/library/typing.html'
        ],
        'import_error': [
          'https://docs.python.org/3/tutorial/modules.html',
          'https://docs.python.org/3/reference/import.html'
        ]
      },
      java: {
        'null_pointer': [
          'https://docs.oracle.com/javase/tutorial/essential/exceptions/',
          'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/NullPointerException.html'
        ],
        'class_not_found': [
          'https://docs.oracle.com/javase/tutorial/essential/exceptions/definition.html'
        ]
      },
      csharp: {
        'null_reference': [
          'https://learn.microsoft.com/en-us/dotnet/api/system.nullreferenceexception'
        ],
        'type_error': [
          'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/'
        ]
      },
      go: {
        'nil_pointer': [
          'https://go.dev/doc/effective_go#errors'
        ]
      },
      php: {
        'fatal_error': [
          'https://www.php.net/manual/en/language.exceptions.php'
        ]
      }
    };

    const docs = relatedDocs[language.toLowerCase()]?.[errorCategory] || [];
    
    return {
      success: true,
      data: {
        language,
        errorCategory,
        relatedDocs: docs,
        count: docs.length
      }
    };
  }
}

export default DocumentationService;

