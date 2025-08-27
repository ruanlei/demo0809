/**
 * Knowledge Graph Generator
 * Converts parsed code entities and relationships into a graph structure
 */

class KnowledgeGraphGenerator {
  constructor() {
    this.graph = {
      nodes: [],
      links: []
    };
  }

  /**
   * Generate knowledge graph from parsed code data
   * @param {Object} parsedData - Output from CodeParser
   * @returns {Object} Knowledge graph structure
   */
  generate(parsedData) {
    this.graph = { nodes: [], links: [] };
    
    // Convert entities to nodes
    this.createNodes(parsedData.entities);
    
    // Convert relationships to links
    this.createLinks(parsedData.relationships, parsedData.entities);
    
    // Add metadata
    this.addMetadata();
    
    return this.graph;
  }

  /**
   * Create nodes from entities
   */
  createNodes(entities) {
    const nodeMap = new Map();
    
    entities.forEach(entity => {
      const node = {
        id: entity.id,
        name: entity.name,
        type: entity.type,
        group: this.getNodeGroup(entity.type),
        size: this.getNodeSize(entity.type),
        color: this.getNodeColor(entity.type),
        lineNumber: entity.lineNumber,
        scope: entity.scope
      };

      // Add specific properties
      if (entity.type === 'function') {
        node.parameters = entity.parameters;
        node.parameterCount = entity.parameters.length;
      }

      this.graph.nodes.push(node);
      nodeMap.set(entity.id, node);
    });

    // Add a global scope node
    this.graph.nodes.push({
      id: 'global',
      name: 'Global Scope',
      type: 'scope',
      group: 'scope',
      size: 20,
      color: '#666666',
      lineNumber: 0
    });

    return nodeMap;
  }

  /**
   * Create links from relationships
   */
  createLinks(relationships, entities) {
    const entityMap = new Map(entities.map(e => [e.id, e]));
    
    relationships.forEach(rel => {
      // Check if both source and target exist
      const sourceExists = entityMap.has(rel.source) || rel.source === 'global';
      const targetExists = entityMap.has(rel.target) || this.graph.nodes.some(n => n.id === rel.target);
      
      if (sourceExists && targetExists) {
        const link = {
          source: rel.source,
          target: rel.target,
          type: rel.type,
          value: this.getLinkValue(rel.type),
          color: this.getLinkColor(rel.type),
          lineNumber: rel.lineNumber
        };
        
        this.graph.links.push(link);
      }
    });

    // Add scope relationships
    entities.forEach(entity => {
      if (entity.scope && entity.scope !== 'global') {
        this.graph.links.push({
          source: `func_${entity.scope}`,
          target: entity.id,
          type: 'contains',
          value: 1,
          color: '#cccccc'
        });
      }
    });
  }

  /**
   * Add metadata to the graph
   */
  addMetadata() {
    this.graph.metadata = {
      nodeCount: this.graph.nodes.length,
      linkCount: this.graph.links.length,
      functionCount: this.graph.nodes.filter(n => n.type === 'function').length,
      variableCount: this.graph.nodes.filter(n => n.type === 'variable').length,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Get node group for visualization
   */
  getNodeGroup(type) {
    const groups = {
      'function': 1,
      'variable': 2,
      'scope': 3,
      'object': 4
    };
    return groups[type] || 0;
  }

  /**
   * Get node size based on type
   */
  getNodeSize(type) {
    const sizes = {
      'function': 15,
      'variable': 10,
      'scope': 20,
      'object': 12
    };
    return sizes[type] || 8;
  }

  /**
   * Get node color based on type
   */
  getNodeColor(type) {
    const colors = {
      'function': '#ff6b6b',
      'variable': '#4ecdc4',
      'scope': '#45b7d1',
      'object': '#96ceb4'
    };
    return colors[type] || '#999999';
  }

  /**
   * Get link value (strength) based on type
   */
  getLinkValue(type) {
    const values = {
      'calls': 3,
      'accesses': 2,
      'contains': 1,
      'uses': 2
    };
    return values[type] || 1;
  }

  /**
   * Get link color based on type
   */
  getLinkColor(type) {
    const colors = {
      'calls': '#ff6b6b',
      'accesses': '#4ecdc4',
      'contains': '#cccccc',
      'uses': '#96ceb4'
    };
    return colors[type] || '#999999';
  }

  /**
   * Export graph in various formats
   */
  exportGraph(format = 'json') {
    switch (format) {
      case 'json':
        return JSON.stringify(this.graph, null, 2);
      case 'dot':
        return this.toDotFormat();
      case 'd3':
        return this.graph;
      default:
        return this.graph;
    }
  }

  /**
   * Convert to DOT format for Graphviz
   */
  toDotFormat() {
    let dot = 'digraph CodeGraph {\n';
    dot += '  rankdir=TB;\n';
    dot += '  node [shape=box];\n\n';
    
    // Add nodes
    this.graph.nodes.forEach(node => {
      const color = node.color.replace('#', '');
      dot += `  "${node.id}" [label="${node.name}" fillcolor="#${color}" style=filled];\n`;
    });
    
    dot += '\n';
    
    // Add edges
    this.graph.links.forEach(link => {
      dot += `  "${link.source}" -> "${link.target}" [label="${link.type}"];\n`;
    });
    
    dot += '}';
    return dot;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KnowledgeGraphGenerator;
} else {
  window.KnowledgeGraphGenerator = KnowledgeGraphGenerator;
}