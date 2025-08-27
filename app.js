/**
 * Code to Knowledge Graph Application
 * Main application that integrates parsing, generation, and visualization
 */

class CodeToKnowledgeGraphApp {
  constructor() {
    this.parser = new CodeParser();
    this.generator = new KnowledgeGraphGenerator();
    this.visualizer = null;
    this.simpleVisualizer = null;
    this.currentGraph = null;
    
    this.initializeUI();
  }

  /**
   * Initialize the user interface
   */
  initializeUI() {
    // Create the main application container
    const container = document.getElementById('app-container');
    if (!container) {
      console.error('App container not found');
      return;
    }

    container.innerHTML = `
      <div class="app-header">
        <h1>代码知识图谱生成器 (Code Knowledge Graph Generator)</h1>
        <p>将JavaScript代码转换为交互式知识图谱 (Convert JavaScript code to interactive knowledge graphs)</p>
      </div>
      
      <div class="app-content">
        <div class="input-section">
          <h2>代码输入 (Code Input)</h2>
          <div class="input-controls">
            <button id="load-sample" class="btn">加载示例代码 (Load Sample Code)</button>
            <button id="analyze-code" class="btn primary">分析代码 (Analyze Code)</button>
            <button id="clear-code" class="btn">清空 (Clear)</button>
          </div>
          <textarea id="code-input" placeholder="在此输入JavaScript代码... (Enter JavaScript code here...)"></textarea>
        </div>
        
        <div class="output-section">
          <h2>知识图谱 (Knowledge Graph)</h2>
          <div id="graph-container"></div>
          <div id="graph-info" class="info-panel"></div>
        </div>
      </div>
      
      <div class="app-footer">
        <div class="analysis-results">
          <h3>分析结果 (Analysis Results)</h3>
          <div id="analysis-summary"></div>
          <details>
            <summary>详细数据 (Detailed Data)</summary>
            <pre id="detailed-data"></pre>
          </details>
        </div>
      </div>
    `;

    this.bindEvents();
    this.loadSampleCode();
  }

  /**
   * Bind event handlers
   */
  bindEvents() {
    document.getElementById('load-sample').addEventListener('click', () => {
      this.loadSampleCode();
    });

    document.getElementById('analyze-code').addEventListener('click', () => {
      this.analyzeCode();
    });

    document.getElementById('clear-code').addEventListener('click', () => {
      this.clearCode();
    });

    // Auto-resize visualization when window resizes
    window.addEventListener('resize', () => {
      if (this.visualizer) {
        const container = document.getElementById('graph-container');
        this.visualizer.resize(container.clientWidth, 600);
      }
    });
  }

  /**
   * Load the sample three-body simulation code
   */
  loadSampleCode() {
    // Load the threebody.js content
    fetch('threebody.js')
      .then(response => response.text())
      .then(code => {
        document.getElementById('code-input').value = code;
      })
      .catch(error => {
        console.error('Error loading sample code:', error);
        // Fallback sample code
        const sampleCode = `
// Sample JavaScript code for analysis
function calculateSum(a, b) {
  return a + b;
}

function processData(data) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    result.push(calculateSum(data[i], 10));
  }
  return result;
}

const numbers = [1, 2, 3, 4, 5];
const processed = processData(numbers);
console.log(processed);
        `.trim();
        
        document.getElementById('code-input').value = sampleCode;
      });
  }

  /**
   * Clear the code input and visualization
   */
  clearCode() {
    document.getElementById('code-input').value = '';
    document.getElementById('graph-container').innerHTML = '';
    document.getElementById('analysis-summary').innerHTML = '';
    document.getElementById('detailed-data').innerHTML = '';
    document.getElementById('graph-info').innerHTML = '';
    this.currentGraph = null;
  }

  /**
   * Analyze the input code and generate knowledge graph
   */
  analyzeCode() {
    const code = document.getElementById('code-input').value.trim();
    
    if (!code) {
      alert('请输入要分析的代码 (Please enter code to analyze)');
      return;
    }

    try {
      // Parse the code
      const parsedData = this.parser.parse(code);
      
      // Generate knowledge graph
      const graphData = this.generator.generate(parsedData);
      this.currentGraph = graphData;
      
      // Visualize the graph
      this.visualizeGraph(graphData);
      
      // Display analysis results
      this.displayAnalysisResults(parsedData, graphData);
      
    } catch (error) {
      console.error('Error analyzing code:', error);
      alert(`分析代码时发生错误 (Error analyzing code): ${error.message}`);
    }
  }

  /**
   * Visualize the knowledge graph
   */
  visualizeGraph(graphData) {
    const container = document.getElementById('graph-container');
    container.innerHTML = ''; // Clear previous content
    
    // Use simple canvas visualizer (more reliable than D3.js dependency)
    console.log('Using canvas-based visualizer...');
    this.simpleVisualizer = new SimpleGraphVisualizer('graph-container');
    this.simpleVisualizer.render(graphData);
    
    // Display graph information
    this.displayGraphInfo(graphData);
  }

  /**
   * Display graph information
   */
  displayGraphInfo(graphData) {
    const infoPanel = document.getElementById('graph-info');
    const metadata = graphData.metadata;
    
    infoPanel.innerHTML = `
      <h4>图谱统计 (Graph Statistics)</h4>
      <ul>
        <li>节点总数 (Total Nodes): ${metadata.nodeCount}</li>
        <li>连接总数 (Total Links): ${metadata.linkCount}</li>
        <li>函数数量 (Functions): ${metadata.functionCount}</li>
        <li>变量数量 (Variables): ${metadata.variableCount}</li>
        <li>生成时间 (Generated At): ${new Date(metadata.generatedAt).toLocaleString()}</li>
      </ul>
    `;
  }

  /**
   * Display analysis results
   */
  displayAnalysisResults(parsedData, graphData) {
    const summaryDiv = document.getElementById('analysis-summary');
    const detailedDiv = document.getElementById('detailed-data');
    
    // Summary
    const functionNames = parsedData.entities
      .filter(e => e.type === 'function')
      .map(e => e.name);
    
    const variableNames = parsedData.entities
      .filter(e => e.type === 'variable')
      .map(e => e.name);
    
    summaryDiv.innerHTML = `
      <div class="summary-grid">
        <div class="summary-item">
          <h4>发现的函数 (Functions Found)</h4>
          <p>${functionNames.join(', ') || '无 (None)'}</p>
        </div>
        <div class="summary-item">
          <h4>发现的变量 (Variables Found)</h4>
          <p>${variableNames.join(', ') || '无 (None)'}</p>
        </div>
        <div class="summary-item">
          <h4>函数调用关系 (Function Calls)</h4>
          <p>${parsedData.relationships.filter(r => r.type === 'calls').length} 个调用 (calls)</p>
        </div>
        <div class="summary-item">
          <h4>属性访问 (Property Access)</h4>
          <p>${parsedData.relationships.filter(r => r.type === 'accesses').length} 个访问 (accesses)</p>
        </div>
      </div>
    `;
    
    // Detailed data
    detailedDiv.textContent = JSON.stringify({
      parsedData,
      graphData
    }, null, 2);
  }

  /**
   * Export current graph in various formats
   */
  exportGraph(format = 'json') {
    if (!this.currentGraph) {
      alert('没有可导出的图谱 (No graph to export)');
      return;
    }
    
    const exported = this.generator.exportGraph(format);
    
    // Create download
    const blob = new Blob([exported], { 
      type: format === 'json' ? 'application/json' : 'text/plain' 
    });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `knowledge-graph.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if D3.js is loaded
  if (typeof d3 === 'undefined') {
    console.error('D3.js is required for visualization');
    return;
  }
  
  // Initialize the app
  window.app = new CodeToKnowledgeGraphApp();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CodeToKnowledgeGraphApp;
} else {
  window.CodeToKnowledgeGraphApp = CodeToKnowledgeGraphApp;
}