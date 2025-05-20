const express = require('express');
const chatRoutes = require('./dist/modules/chat/chat.routes.js');

const app = express();
app.use(express.json());

// Mount chat routes directly
app.use('/chat', chatRoutes.default);

app.get('/test', (req, res) => {
  res.json({ message: 'Simple test works' });
});

const PORT = 5010;
app.listen(PORT, () => {
  console.log(`Simple test server running on port ${PORT}`);
  
  // Test the endpoints right here
  setTimeout(() => {
    const http = require('http');
    
    // Test 1: Basic test
    http.get(`http://localhost:${PORT}/test`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Basic test:', data);
        
        // Test 2: Chat test route
        http.get(`http://localhost:${PORT}/chat/test`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            console.log('✅ Chat test route:', data);
            process.exit(0);
          });
        }).on('error', (err) => {
          console.log('❌ Chat test route error:', err.message);
          process.exit(1);
        });
      });
    }).on('error', (err) => {
      console.log('❌ Basic test error:', err.message);
      process.exit(1);
    });
  }, 1000);
});
