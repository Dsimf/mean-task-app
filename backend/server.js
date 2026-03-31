const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;

const requestListener = (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Enable CORS for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (parsedUrl.pathname === '/api/ping' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'pong' }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
};

const server = http.createServer(requestListener);

server.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});