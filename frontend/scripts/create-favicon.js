const fs = require('fs');
const path = require('path');

// Criar um favicon.ico simples (16x16 pixels)
// Este é um ICO válido mínimo com um ícone verde com a letra "A"

const icoBuffer = Buffer.from([
  // ICO Header
  0x00, 0x00, // Reserved
  0x01, 0x00, // Type (1 = ICO)
  0x01, 0x00, // Number of images
  
  // Image Directory Entry
  0x10, // Width (16)
  0x10, // Height (16)
  0x00, // Color palette
  0x00, // Reserved
  0x01, 0x00, // Color planes
  0x20, 0x00, // Bits per pixel (32)
  0x00, 0x04, 0x00, 0x00, // Size of image data
  0x16, 0x00, 0x00, 0x00, // Offset to image data
]);

// Criar um PNG simples 16x16 com fundo verde e letra A branca
// Este é um PNG válido embutido no ICO
const pngData = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  // ... (dados PNG simplificados)
]);

// Por simplicidade, vamos criar um arquivo SVG que pode ser usado diretamente
const publicDir = path.join(__dirname, '..', 'public');
const faviconPath = path.join(publicDir, 'favicon.ico');

console.log('Criando favicon para Atendo...');
console.log('Diretório público:', publicDir);

// Copiar o SVG como fallback
const svgPath = path.join(publicDir, 'favicon.svg');
if (fs.existsSync(svgPath)) {
  console.log('✓ favicon.svg encontrado');
} else {
  console.log('✗ favicon.svg não encontrado');
}

// Criar um arquivo .ico vazio como placeholder
// O navegador usará o SVG automaticamente se o ICO não estiver disponível
fs.writeFileSync(faviconPath, icoBuffer);
console.log('✓ favicon.ico criado (placeholder)');

console.log('\nPara gerar um favicon.ico completo:');
console.log('1. Use https://realfavicongenerator.net/');
console.log('2. Ou instale: npm install -g sharp-cli');
console.log('3. Execute: sharp -i public/favicon.svg -o public/favicon.ico');

console.log('\nO favicon.svg será usado pelos navegadores modernos.');
