const express = require('express');
const path = require('path');
const app = express();

require('dotenv').config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT2 || 9228;

// Dynamic config.js with backend port
app.get('/config.js', (req, res) => {
  const backendPort = process.env.PORT1 || 8228;
  res.type('application/javascript');
  res.send(`
const config = {
  getBackendUrl: function() {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:${backendPort}';
    }
    
    return 'http://157.173.101.159:${backendPort}';
  }
};

const BACKEND_URL = config.getBackendUrl();
`);
});

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on http://0.0.0.0:${PORT}`);
  console.log(`Access locally: http://localhost:${PORT}`);
  console.log(`Access from VPS: http://157.173.101.159:${PORT}`);
});
