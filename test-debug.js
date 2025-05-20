const express = require('express');

console.log('📦 Loading chat routes...');
const chatRoutes = require('./dist/modules/chat/chat.routes.js');
console.log('✅ Chat routes loaded:', typeof chatRoutes.default);

console.log('📦 Loading main routes...');
const mainRoutes = require('./dist/routes/index.js');
console.log('✅ Main routes loaded:', typeof mainRoutes.default);

const app = express();
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    console.log('✋ OPTIONS request for:', req.path);
    res.status(200).end();
    return;
  }
  next();
});

// Debug middleware
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.url}`);
  next();
});

// Test 1: Mount chat routes directly
console.log('🔧 Mounting chat routes directly under /direct-chat');
app.use('/direct-chat', chatRoutes.default);

// Test 2: Mount main routes (which should include chat)
console.log('🔧 Mounting main routes under /api');
app.use('/api', mainRoutes.default);

// Test routes
app.get('/debug', (req, res) => {
  res.json({ message: 'Debug endpoint works' });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Not found in test server', url: req.originalUrl });
});

const PORT = 5005;
app.listen(PORT, () => {
  console.log(`🧪 Debug server running on port ${PORT}`);
});