/**
 * Knowledge Graph Visualizer
 * Creates interactive D3.js visualization of code knowledge graphs
 */

class KnowledgeGraphVisualizer {
  constructor(containerId) {
    this.containerId = containerId;
    this.width = 800;
    this.height = 600;
    this.simulation = null;
    this.svg = null;
    this.graph = null;
  }

  /**
   * Initialize the visualization
   */
  init() {
    // Remove existing SVG
    d3.select(`#${this.containerId}`).select('svg').remove();
    
    // Create SVG element
    this.svg = d3.select(`#${this.containerId}`)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .style('border', '1px solid #ccc')
      .style('background', '#fafafa');

    // Add zoom and pan
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        this.svg.select('.graph-container')
          .attr('transform', event.transform);
      });

    this.svg.call(zoom);

    // Create container for graph elements
    this.svg.append('g').attr('class', 'graph-container');
  }

  /**
   * Render the knowledge graph
   * @param {Object} graphData - Graph data from KnowledgeGraphGenerator
   */
  render(graphData) {
    this.graph = graphData;
    
    if (!this.svg) {
      this.init();
    }

    // Create force simulation
    this.simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collision', d3.forceCollide().radius(d => d.size + 5));

    const container = this.svg.select('.graph-container');

    // Create links
    const link = container.selectAll('.link')
      .data(graphData.links)
      .enter().append('line')
      .attr('class', 'link')
      .style('stroke', d => d.color)
      .style('stroke-width', d => Math.sqrt(d.value))
      .style('stroke-opacity', 0.6);

    // Create link labels
    const linkLabel = container.selectAll('.link-label')
      .data(graphData.links)
      .enter().append('text')
      .attr('class', 'link-label')
      .style('font-size', '10px')
      .style('fill', '#666')
      .style('text-anchor', 'middle')
      .text(d => d.type);

    // Create nodes
    const node = container.selectAll('.node')
      .data(graphData.nodes)
      .enter().append('circle')
      .attr('class', 'node')
      .attr('r', d => d.size)
      .style('fill', d => d.color)
      .style('stroke', '#fff')
      .style('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (event, d) => this.dragStarted(event, d))
        .on('drag', (event, d) => this.dragged(event, d))
        .on('end', (event, d) => this.dragEnded(event, d)));

    // Create node labels
    const nodeLabel = container.selectAll('.node-label')
      .data(graphData.nodes)
      .enter().append('text')
      .attr('class', 'node-label')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .style('fill', '#333')
      .text(d => d.name);

    // Add tooltips
    node.append('title')
      .text(d => this.getTooltipText(d));

    // Update positions on simulation tick
    this.simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      linkLabel
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      nodeLabel
        .attr('x', d => d.x)
        .attr('y', d => d.y + d.size + 15);
    });

    // Add legend
    this.addLegend();

    // Add controls
    this.addControls();
  }

  /**
   * Add legend to explain node types and colors
   */
  addLegend() {
    const legend = this.svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(20, 20)');

    const legendData = [
      { type: 'Function', color: '#ff6b6b' },
      { type: 'Variable', color: '#4ecdc4' },
      { type: 'Scope', color: '#45b7d1' },
      { type: 'Object', color: '#96ceb4' }
    ];

    const legendItem = legend.selectAll('.legend-item')
      .data(legendData)
      .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    legendItem.append('circle')
      .attr('r', 8)
      .style('fill', d => d.color);

    legendItem.append('text')
      .attr('x', 15)
      .attr('y', 5)
      .style('font-size', '12px')
      .text(d => d.type);
  }

  /**
   * Add interactive controls
   */
  addControls() {
    const controls = d3.select(`#${this.containerId}`)
      .append('div')
      .attr('class', 'graph-controls')
      .style('margin-top', '10px');

    // Add restart button
    controls.append('button')
      .text('Restart Simulation')
      .style('margin-right', '10px')
      .on('click', () => {
        this.simulation.alpha(1).restart();
      });

    // Add export button
    controls.append('button')
      .text('Export as JSON')
      .style('margin-right', '10px')
      .on('click', () => {
        this.exportGraph();
      });

    // Add filter controls
    controls.append('label')
      .text('Filter: ')
      .style('margin-left', '20px');

    const select = controls.append('select')
      .on('change', (event) => {
        this.filterNodes(event.target.value);
      });

    select.append('option').attr('value', 'all').text('All');
    select.append('option').attr('value', 'function').text('Functions');
    select.append('option').attr('value', 'variable').text('Variables');
  }

  /**
   * Filter nodes by type
   */
  filterNodes(type) {
    this.svg.selectAll('.node')
      .style('opacity', d => type === 'all' || d.type === type ? 1 : 0.1);
    
    this.svg.selectAll('.node-label')
      .style('opacity', d => type === 'all' || d.type === type ? 1 : 0.1);
  }

  /**
   * Get tooltip text for a node
   */
  getTooltipText(d) {
    let text = `${d.type}: ${d.name}\n`;
    text += `Line: ${d.lineNumber}\n`;
    if (d.scope) text += `Scope: ${d.scope}\n`;
    if (d.parameters) text += `Parameters: ${d.parameters.join(', ')}`;
    return text;
  }

  /**
   * Export graph data
   */
  exportGraph() {
    const dataStr = JSON.stringify(this.graph, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'knowledge-graph.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Drag event handlers
   */
  dragStarted(event, d) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  dragEnded(event, d) {
    if (!event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  /**
   * Resize the visualization
   */
  resize(width, height) {
    this.width = width;
    this.height = height;
    
    if (this.svg) {
      this.svg.attr('width', width).attr('height', height);
      
      if (this.simulation) {
        this.simulation.force('center', d3.forceCenter(width / 2, height / 2));
        this.simulation.alpha(1).restart();
      }
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KnowledgeGraphVisualizer;
} else {
  window.KnowledgeGraphVisualizer = KnowledgeGraphVisualizer;
}