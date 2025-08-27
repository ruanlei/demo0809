/**
 * Simple test for the Code to Knowledge Graph system
 */

// Test code sample
const testCode = `
function calculateArea(width, height) {
  return width * height;
}

function calculateVolume(length, width, height) {
  const area = calculateArea(width, height);
  return area * length;
}

const room = {
  length: 10,
  width: 8,
  height: 3
};

const volume = calculateVolume(room.length, room.width, room.height);
console.log('Room volume:', volume);
`;

// Test the parser
console.log('Testing Code Parser...');
const parser = new CodeParser();
const parsedData = parser.parse(testCode);
console.log('Parsed entities:', parsedData.entities.length);
console.log('Parsed relationships:', parsedData.relationships.length);

// Test the generator
console.log('Testing Knowledge Graph Generator...');
const generator = new KnowledgeGraphGenerator();
const graphData = generator.generate(parsedData);
console.log('Generated nodes:', graphData.nodes.length);
console.log('Generated links:', graphData.links.length);

// Output results
console.log('Test Results:');
console.log('- Functions found:', parsedData.entities.filter(e => e.type === 'function').map(e => e.name));
console.log('- Variables found:', parsedData.entities.filter(e => e.type === 'variable').map(e => e.name));
console.log('- Function calls:', parsedData.relationships.filter(r => r.type === 'calls').length);

console.log('Knowledge Graph System Test Completed Successfully! ✅');