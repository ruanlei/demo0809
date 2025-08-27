/**
 * Simple Canvas-based Knowledge Graph Visualizer
 * Alternative to D3.js for environments where external libraries are not available
 */

class SimpleGraphVisualizer {
  constructor(containerId) {
    this.containerId = containerId;
    this.canvas = null;
    this.ctx = null;
    this.width = 800;
    this.height = 600;
    this.nodes = [];
    this.links = [];
    this.animationId = null;
  }

  /**
   * Initialize the canvas
   */
  init() {
    const container = document.getElementById(this.containerId);
    container.innerHTML = '';
    
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.border = '2px solid #bdc3c7';
    this.canvas.style.borderRadius = '8px';
    this.canvas.style.background = '#f8f9fa';
    this.canvas.style.cursor = 'pointer';
    
    this.ctx = this.canvas.getContext('2d');
    container.appendChild(this.canvas);
    
    // Add event listeners
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
  }

  /**
   * Render the knowledge graph
   */
  render(graphData) {
    if (!this.canvas) {
      this.init();
    }

    this.nodes = graphData.nodes.map((node, i) => ({
      ...node,
      x: this.width / 2 + (Math.random() - 0.5) * 200,
      y: this.height / 2 + (Math.random() - 0.5) * 200,
      vx: 0,
      vy: 0,
      radius: node.size || 10
    }));

    this.links = graphData.links.map(link => ({
      ...link,
      source: this.nodes.find(n => n.id === link.source),
      target: this.nodes.find(n => n.id === link.target)
    })).filter(link => link.source && link.target);

    // Start animation
    this.animate();
    
    // Add legend and controls
    this.addLegendAndControls();
  }

  /**
   * Animation loop with simple physics
   */
  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Apply simple force simulation
    this.applyForces();
    
    // Draw links
    this.drawLinks();
    
    // Draw nodes
    this.drawNodes();
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  /**
   * Apply simple physics forces
   */
  applyForces() {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    // Reset forces
    this.nodes.forEach(node => {
      node.fx = 0;
      node.fy = 0;
    });
    
    // Repulsion between nodes
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const dx = this.nodes[j].x - this.nodes[i].x;
        const dy = this.nodes[j].y - this.nodes[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy) + 0.1;
        const force = 500 / (distance * distance);
        
        this.nodes[i].fx -= force * dx / distance;
        this.nodes[i].fy -= force * dy / distance;
        this.nodes[j].fx += force * dx / distance;
        this.nodes[j].fy += force * dy / distance;
      }
    }
    
    // Attraction along links
    this.links.forEach(link => {
      const dx = link.target.x - link.source.x;
      const dy = link.target.y - link.source.y;
      const distance = Math.sqrt(dx * dx + dy * dy) + 0.1;
      const force = (distance - 80) * 0.1;
      
      link.source.fx += force * dx / distance;
      link.source.fy += force * dy / distance;
      link.target.fx -= force * dx / distance;
      link.target.fy -= force * dy / distance;
    });
    
    // Center attraction
    this.nodes.forEach(node => {
      const dx = centerX - node.x;
      const dy = centerY - node.y;
      node.fx += dx * 0.01;
      node.fy += dy * 0.01;
    });
    
    // Update positions
    this.nodes.forEach(node => {
      node.vx = (node.vx + node.fx) * 0.9;
      node.vy = (node.vy + node.fy) * 0.9;
      node.x += node.vx;
      node.y += node.vy;
      
      // Boundary constraints
      node.x = Math.max(node.radius, Math.min(this.width - node.radius, node.x));
      node.y = Math.max(node.radius, Math.min(this.height - node.radius, node.y));
    });
  }

  /**
   * Draw links between nodes
   */
  drawLinks() {
    this.ctx.strokeStyle = '#999';
    this.ctx.lineWidth = 1;
    
    this.links.forEach(link => {
      this.ctx.beginPath();
      this.ctx.moveTo(link.source.x, link.source.y);
      this.ctx.lineTo(link.target.x, link.target.y);
      this.ctx.stroke();
      
      // Draw link label
      const midX = (link.source.x + link.target.x) / 2;
      const midY = (link.source.y + link.target.y) / 2;
      
      this.ctx.fillStyle = '#666';
      this.ctx.font = '10px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(link.type, midX, midY);
    });
  }

  /**
   * Draw nodes
   */
  drawNodes() {
    this.nodes.forEach(node => {
      // Skip invisible nodes
      if (node.visible === false) return;
      
      // Draw node circle
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      this.ctx.fillStyle = node.color || '#4ecdc4';
      this.ctx.fill();
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // Draw node label
      this.ctx.fillStyle = '#333';
      this.ctx.font = 'bold 12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(node.name, node.x, node.y + node.radius + 15);
    });
  }

  /**
   * Add legend and controls below the canvas
   */
  addLegendAndControls() {
    const container = document.getElementById(this.containerId);
    
    // Remove existing controls
    const existingControls = container.querySelector('.simple-graph-controls');
    if (existingControls) {
      existingControls.remove();
    }
    
    const controls = document.createElement('div');
    controls.className = 'simple-graph-controls';
    controls.style.marginTop = '10px';
    controls.innerHTML = `
      <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <button class="restart-btn">重新开始 (Restart)</button>
        <button class="export-btn">导出图片 (Export Image)</button>
        <div style="display: flex; align-items: center; gap: 5px;">
          <span>筛选类型:</span>
          <select class="filter-select">
            <option value="all">全部 (All)</option>
            <option value="function">函数 (Functions)</option>
            <option value="variable">变量 (Variables)</option>
          </select>
        </div>
      </div>
      <div style="margin-top: 10px; padding: 10px; background: #f0f0f0; border-radius: 5px;">
        <strong>图例 (Legend):</strong>
        <span style="display: inline-block; margin-left: 15px;">
          <span style="display: inline-block; width: 12px; height: 12px; background: #ff6b6b; border-radius: 50%; margin-right: 5px;"></span>
          函数 (Function)
        </span>
        <span style="display: inline-block; margin-left: 15px;">
          <span style="display: inline-block; width: 12px; height: 12px; background: #4ecdc4; border-radius: 50%; margin-right: 5px;"></span>
          变量 (Variable)
        </span>
        <span style="display: inline-block; margin-left: 15px;">
          <span style="display: inline-block; width: 12px; height: 12px; background: #45b7d1; border-radius: 50%; margin-right: 5px;"></span>
          作用域 (Scope)
        </span>
      </div>
    `;
    
    // Add event listeners
    controls.querySelector('.restart-btn').addEventListener('click', () => this.restart());
    controls.querySelector('.export-btn').addEventListener('click', () => this.export());
    controls.querySelector('.filter-select').addEventListener('change', (e) => this.filter(e.target.value));
    
    container.appendChild(controls);
  }

  /**
   * Handle click events
   */
  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Find clicked node
    const clickedNode = this.nodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius;
    });
    
    if (clickedNode) {
      alert(`节点信息:\n类型: ${clickedNode.type}\n名称: ${clickedNode.name}\n行号: ${clickedNode.lineNumber}`);
    }
  }

  /**
   * Handle mouse move events
   */
  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if mouse is over a node
    const hoveredNode = this.nodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius;
    });
    
    this.canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
  }

  /**
   * Restart animation
   */
  restart() {
    this.nodes.forEach(node => {
      node.vx = (Math.random() - 0.5) * 2;
      node.vy = (Math.random() - 0.5) * 2;
    });
  }

  /**
   * Filter nodes by type
   */
  filter(type) {
    this.nodes.forEach(node => {
      node.visible = type === 'all' || node.type === type;
    });
  }

  /**
   * Export canvas as image
   */
  export() {
    const link = document.createElement('a');
    link.download = 'knowledge-graph.png';
    link.href = this.canvas.toDataURL();
    link.click();
  }

  /**
   * Stop animation and cleanup
   */
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SimpleGraphVisualizer;
} else {
  window.SimpleGraphVisualizer = SimpleGraphVisualizer;
}