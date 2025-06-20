// Node.js Express server to serve static files and index.html
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve all static files in the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Default route to serve index.html from 'public'
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
