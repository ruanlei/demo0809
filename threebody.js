const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
}
window.addEventListener('resize', resize);
resize();

const vsSource = `
attribute vec2 a_position;
void main() {
  gl_PointSize = 5.0;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const fsSource = `
void main() {
  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}`;

function createShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

const program = gl.createProgram();
const vShader = createShader(gl.VERTEX_SHADER, vsSource);
const fShader = createShader(gl.FRAGMENT_SHADER, fsSource);
gl.attachShader(program, vShader);
gl.attachShader(program, fShader);
gl.linkProgram(program);
gl.useProgram(program);

const positionBuffer = gl.createBuffer();
const positionLocation = gl.getAttribLocation(program, 'a_position');

const masses = [1, 1, 1];
let bodies = [
  { x: -0.5, y: 0.0, vx: 0.0, vy: 0.6 },
  { x: 0.5, y: 0.0, vx: 0.0, vy: -0.6 },
  { x: 0.0, y: 0.8, vx: -0.6, vy: 0.0 }
];

const G = 1.0;
const dt = 0.001;

function step() {
  const acc = bodies.map(() => ({ ax: 0, ay: 0 }));
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const dx = bodies[j].x - bodies[i].x;
      const dy = bodies[j].y - bodies[i].y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq) + 0.001;
      const force = (G * masses[i] * masses[j]) / (distSq);
      const fx = force * dx / dist;
      const fy = force * dy / dist;
      acc[i].ax += fx / masses[i];
      acc[i].ay += fy / masses[i];
      acc[j].ax -= fx / masses[j];
      acc[j].ay -= fy / masses[j];
    }
  }
  for (let i = 0; i < bodies.length; i++) {
    bodies[i].vx += acc[i].ax * dt;
    bodies[i].vy += acc[i].ay * dt;
    bodies[i].x += bodies[i].vx * dt;
    bodies[i].y += bodies[i].vy * dt;
  }
}

function render() {
  step();
  const data = new Float32Array(bodies.flatMap(b => [b.x, b.y]));
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, bodies.length);
  requestAnimationFrame(render);
}

render();
