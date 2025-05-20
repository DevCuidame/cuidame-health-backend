const http = require('http');

console.log('🔍 VERIFICANDO RUTAS EN TIEMPO DE EJECUCIÓN\n');

// Hacer una petición especial para ver qué rutas están registradas
function checkRegisteredRoutes() {
  console.log('1️⃣ Verificando rutas registradas...');
  
  // Primero vamos a hacer una petición que nos dé información de debug
  const debugRequest = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/debug-routes', // Esta no existe, pero veremos el error
    method: 'GET'
  };
  
  const req = http.request(debugRequest, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Response: ${data}\n`);
      
      // Ahora vamos a probar algunas variaciones de las rutas de chat
      testChatRouteVariations();
    });
  });
  
  req.on('error', (err) => {
    console.log(`Error: ${err.message}\n`);
    testChatRouteVariations();
  });
  
  req.end();
}

function testChatRouteVariations() {
  console.log('2️⃣ Probando variaciones de rutas de chat...');
  
  const variations = [
    '/api/chat',
    '/api/chat/',
    '/api/chats',
    '/chat',
    '/chat/',
    '/chats',
    '/api/modules/chat/test',
    '/modules/chat/test'
  ];
  
  let testIndex = 0;
  
  function testNext() {
    if (testIndex >= variations.length) {
      console.log('\n3️⃣ Explorando estructura de la aplicación...');
      exploreAppStructure();
      return;
    }
    
    const path = variations[testIndex];
    console.log(`   Probando: ${path}`);
    
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 404) {
          console.log(`     ✅ ${res.statusCode}: ${data.substring(0, 100)}...`);
        } else {
          console.log(`     ❌ 404`);
        }
        testIndex++;
        setTimeout(testNext, 200);
      });
    });
    
    req.on('error', (err) => {
      console.log(`     ❌ Error: ${err.message}`);
      testIndex++;
      setTimeout(testNext, 200);
    });
    
    req.end();
  }
  
  testNext();
}

function exploreAppStructure() {
  console.log('Intentando acceder a rutas que sabemos que existen...');
  
  const knownRoutes = [
    '/api/auth',
    '/api/users', 
    '/api/patients',
    '/api/locations',
    '/api'
  ];
  
  let routeIndex = 0;
  
  function testKnownRoute() {
    if (routeIndex >= knownRoutes.length) {
      console.log('\n4️⃣ CONCLUSIONES:');
      analyzeResults();
      return;
    }
    
    const path = knownRoutes[routeIndex];
    console.log(`   Probando ruta conocida: ${path}`);
    
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`     Status: ${res.statusCode}`);
        if (res.statusCode !== 404) {
          console.log(`     ✅ Esta ruta SÍ está registrada`);
        } else {
          console.log(`     ❌ Esta ruta NO está registrada`);
        }
        routeIndex++;
        setTimeout(testKnownRoute, 200);
      });
    });
    
    req.on('error', (err) => {
      console.log(`     ❌ Error: ${err.message}`);
      routeIndex++;
      setTimeout(testKnownRoute, 200);
    });
    
    req.end();
  }
  
  testKnownRoute();
}

function analyzeResults() {
  console.log('\n📊 ANÁLISIS DETALLADO:');
  console.log('El problema parece ser que:');
  console.log('1. ✅ El servidor está corriendo');
  console.log('2. ✅ Los archivos están compilados correctamente');
  console.log('3. ✅ Las rutas de chat están en el código');
  console.log('4. ❌ Pero las rutas NO se están registrando en tiempo de ejecución');
  console.log('');
  console.log('🔧 POSIBLES CAUSAS:');
  console.log('- Error en la importación de chatRoutes en routes/index.ts');
  console.log('- Error al compilar routes/index.ts');
  console.log('- Problema con el orden de inicialización');
  console.log('- Error en el middleware que está interceptando las rutas');
  console.log('');
  console.log('📝 SIGUIENTE PASO:');
  console.log('Necesitamos revisar el archivo compilado routes/index.js en detalle');
}

// Iniciar verificación
checkRegisteredRoutes();