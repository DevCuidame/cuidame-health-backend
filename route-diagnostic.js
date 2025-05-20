const express = require('express');
const http = require('http');

async function diagnoseRoutes() {
  console.log('🔍 DIAGNÓSTICO DE RUTAS\n');
  
  try {
    // 1. Verificar importaciones
    console.log('1️⃣ Verificando importaciones...');
    
    const chatRoutes = require('./dist/modules/chat/chat.routes.js');
    console.log('✅ Chat routes:', typeof chatRoutes, typeof chatRoutes.default);
    
    const mainRoutes = require('./dist/routes/index.js');
    console.log('✅ Main routes:', typeof mainRoutes, typeof mainRoutes.default);
    
    const config = require('./dist/core/config/environment.js');
    console.log('✅ Config loaded, API prefix:', config.default?.server?.apiPrefix);
    
    // 2. Crear aplicación de prueba
    console.log('\n2️⃣ Creando aplicación de prueba...');
    
    const app = express();
    app.use(express.json());
    
    // CORS básico
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }
      next();
    });
    
    // Debug middleware
    app.use((req, res, next) => {
      console.log(`📥 ${req.method} ${req.path}`);
      next();
    });
    
    // Montar rutas
    const apiPrefix = config.default?.server?.apiPrefix || '/api';
    console.log(`🔧 Montando rutas en: ${apiPrefix}`);
    
    app.use(apiPrefix, mainRoutes.default);
    
    // 404 handler
    app.use('*', (req, res) => {
      console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
      res.status(404).json({ 
        error: 'Not found', 
        path: req.originalUrl,
        apiPrefix: apiPrefix
      });
    });
    
    // 3. Iniciar servidor de prueba
    console.log('\n3️⃣ Iniciando servidor de prueba...');
    
    const PORT = 4000;
    const server = app.listen(PORT, () => {
      console.log(`🧪 Servidor de diagnóstico en puerto ${PORT}`);
      
      // 4. Realizar pruebas
      setTimeout(() => {
        runTests(PORT, apiPrefix);
      }, 1000);
    });
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  }
}

function runTests(port, apiPrefix) {
  console.log('\n4️⃣ Ejecutando pruebas...');
  
  const testUrls = [
    `http://localhost:${port}/health`,
    `http://localhost:${port}${apiPrefix}/chat/test`,
    `http://localhost:${port}${apiPrefix}/chat/session`,
  ];
  
  testUrls.forEach((url, index) => {
    setTimeout(() => {
      console.log(`\n🧪 Prueba ${index + 1}: ${url}`);
      
      const method = url.includes('/session') && !url.includes('/test') ? 'POST' : 'GET';
      const postData = method === 'POST' ? JSON.stringify({}) : null;
      
      const options = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        }
      };
      
      const req = http.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`   Status: ${res.statusCode}`);
          try {
            const json = JSON.parse(data);
            console.log(`   Response: ${JSON.stringify(json, null, 2)}`);
          } catch (e) {
            console.log(`   Response: ${data}`);
          }
          
          if (index === testUrls.length - 1) {
            console.log('\n✅ Diagnóstico completado');
            process.exit(0);
          }
        });
      });
      
      req.on('error', (err) => {
        console.log(`   ❌ Error: ${err.message}`);
      });
      
      if (postData) {
        req.write(postData);
      }
      req.end();
      
    }, index * 2000);
  });
}

// Ejecutar diagnóstico
diagnoseRoutes();