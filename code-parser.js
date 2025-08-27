/**
 * JavaScript Code Parser for Knowledge Graph Generation
 * Extracts functions, variables, dependencies, and relationships from JavaScript code
 */

class CodeParser {
  constructor() {
    this.entities = new Map();
    this.relationships = [];
    this.currentScope = 'global';
  }

  /**
   * Parse JavaScript code and extract entities and relationships
   * @param {string} code - JavaScript source code
   * @returns {Object} Parsed entities and relationships
   */
  parse(code) {
    this.entities.clear();
    this.relationships = [];
    this.currentScope = 'global';

    // Split code into lines for analysis
    const lines = code.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        this.parseLine(line, i + 1);
      }
    }

    return {
      entities: Array.from(this.entities.values()),
      relationships: this.relationships
    };
  }

  /**
   * Parse a single line of code
   * @param {string} line - Line of code
   * @param {number} lineNumber - Line number in source
   */
  parseLine(line, lineNumber) {
    // Remove comments
    line = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');
    
    // Extract function declarations
    const functionMatch = line.match(/function\s+(\w+)\s*\(([^)]*)\)/);
    if (functionMatch) {
      this.addFunction(functionMatch[1], functionMatch[2], lineNumber);
      this.currentScope = functionMatch[1];
      return;
    }

    // Extract variable declarations
    const varMatch = line.match(/(?:const|let|var)\s+(\w+)/);
    if (varMatch) {
      this.addVariable(varMatch[1], this.currentScope, lineNumber);
    }

    // Extract function calls
    const callMatches = line.matchAll(/(\w+)\s*\(/g);
    for (const match of callMatches) {
      this.addFunctionCall(match[1], this.currentScope, lineNumber);
    }

    // Extract property access
    const propertyMatches = line.matchAll(/(\w+)\.(\w+)/g);
    for (const match of propertyMatches) {
      this.addPropertyAccess(match[1], match[2], lineNumber);
    }

    // Reset scope on closing brace
    if (line.includes('}') && this.currentScope !== 'global') {
      this.currentScope = 'global';
    }
  }

  /**
   * Add a function entity
   */
  addFunction(name, params, lineNumber) {
    const id = `func_${name}`;
    this.entities.set(id, {
      id,
      name,
      type: 'function',
      parameters: params.split(',').map(p => p.trim()).filter(p => p),
      lineNumber,
      scope: 'global'
    });
  }

  /**
   * Add a variable entity
   */
  addVariable(name, scope, lineNumber) {
    const id = `var_${name}_${scope}`;
    this.entities.set(id, {
      id,
      name,
      type: 'variable',
      scope,
      lineNumber
    });
  }

  /**
   * Add a function call relationship
   */
  addFunctionCall(calledFunction, callerScope, lineNumber) {
    // Skip built-in functions and methods
    const builtins = ['console', 'Math', 'Array', 'Object', 'document', 'window'];
    if (builtins.includes(calledFunction)) return;

    this.relationships.push({
      type: 'calls',
      source: callerScope === 'global' ? 'global' : `func_${callerScope}`,
      target: `func_${calledFunction}`,
      lineNumber
    });
  }

  /**
   * Add a property access relationship
   */
  addPropertyAccess(object, property, lineNumber) {
    this.relationships.push({
      type: 'accesses',
      source: `var_${object}_${this.currentScope}`,
      target: property,
      lineNumber
    });
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CodeParser;
} else {
  window.CodeParser = CodeParser;
}