const http = require('http');

console.log('🧪 PRUEBA RÁPIDA - PUERTO 4000\n');

// Definir las pruebas
const tests = [
  {
    name: 'Health Check',
    url: 'http://localhost:4000/health',
    method: 'GET'
  },
  {
    name: 'Chat Test Route',
    url: 'http://localhost:4000/api/chat/test',
    method: 'GET'
  },
  {
    name: 'Chat Start Session',
    url: 'http://localhost:4000/api/chat/session',
    method: 'POST',
    data: '{}'
  },
  {
    name: 'Chat Routes Direct (sin /api)',
    url: 'http://localhost:4000/chat/test',
    method: 'GET'
  }
];

async function runTest(test, index) {
  return new Promise((resolve) => {
    console.log(`${index + 1}️⃣ Probando: ${test.name}`);
    console.log(`   URL: ${test.url}`);
    
    const options = {
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    const req = http.request(test.url, options, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   ✅ Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log(`   📄 Response: ${JSON.stringify(json, null, 2)}`);
          } catch (e) {
            console.log(`   📄 Response (text): ${data}`);
          }
        } else {
          console.log(`   ❌ Error Response: ${data}`);
        }
        
        console.log(''); // Línea en blanco
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ Network Error: ${err.message}`);
      console.log(''); // Línea en blanco
      resolve();
    });
    
    // Enviar datos si es POST
    if (test.data) {
      req.write(test.data);
    }
    
    req.end();
  });
}

async function runAllTests() {
  console.log('Iniciando pruebas en el servidor en puerto 4000...\n');
  
  for (let i = 0; i < tests.length; i++) {
    await runTest(tests[i], i);
    
    // Esperar un poco entre pruebas
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('🏁 Todas las pruebas completadas');
  
  // Análisis de resultados
  console.log('\n📊 ANÁLISIS:');
  console.log('- Si /health funciona pero /api/chat/test no: problema en las rutas');
  console.log('- Si /chat/test funciona pero /api/chat/test no: problema con el prefijo API');
  console.log('- Si nada funciona: problema con el servidor o compilación');
  console.log('- Si todo funciona: problema específico con tu cliente/frontend');
}

// Verificar si el servidor está corriendo
console.log('Verificando si el servidor está corriendo en puerto 4000...');

const checkServer = http.request('http://localhost:4000/health', { method: 'GET' }, (res) => {
  if (res.statusCode) {
    console.log('✅ Servidor detectado en puerto 4000\n');
    runAllTests();
  }
}).on('error', (err) => {
  console.log('❌ No se puede conectar al servidor en puerto 4000');
  console.log('   Asegúrate de que el servidor esté corriendo con: npm start o npm run dev');
  console.log(`   Error: ${err.message}`);
});

checkServer.end();