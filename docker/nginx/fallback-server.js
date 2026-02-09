const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Servir a página HTML estática
  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading page');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }
  
  // Para outras rotas, servir JSON com status
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      app: 'Fallback Server',
      message: 'Next.js frontend has issues, using fallback'
    }));
    return;
  }
  
  // Redirecionar outras rotas para o frontend original
  res.writeHead(302, { 'Location': `http://localhost:3000${req.url}` });
  res.end();
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Fallback server running on port ${PORT}`);
});
