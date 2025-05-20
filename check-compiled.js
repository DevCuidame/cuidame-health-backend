const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO ARCHIVOS COMPILADOS\n');

// Archivos a verificar
const filesToCheck = [
  './dist/modules/chat/chat.routes.js',
  './dist/routes/index.js',
  './dist/app.js',
  './dist/core/config/environment.js'
];

filesToCheck.forEach((filePath, index) => {
  console.log(`${index + 1}️⃣ Verificando: ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    console.log('   ✅ Archivo existe');
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (filePath.includes('chat.routes.js')) {
        console.log('   🔍 Buscando exports en chat.routes.js:');
        if (content.includes('exports.default')) {
          console.log('     ✅ Encontrado: exports.default');
        }
        if (content.includes('/test')) {
          console.log('     ✅ Encontrado: ruta /test');
        }
        if (content.includes('/session')) {
          console.log('     ✅ Encontrado: ruta /session');
        }
      }
      
      if (filePath.includes('index.js') && filePath.includes('routes')) {
        console.log('   🔍 Buscando chat routes en index.js:');
        if (content.includes('chat')) {
          console.log('     ✅ Encontrado: referencia a chat');
        }
        if (content.includes("router.use('/chat'")) {
          console.log('     ✅ Encontrado: router.use(\'/chat\')');
        }
      }
      
      if (filePath.includes('environment.js')) {
        console.log('   🔍 Verificando configuración:');
        if (content.includes('/api')) {
          console.log('     ✅ Encontrado: /api prefix');
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Error leyendo archivo: ${error.message}`);
    }
  } else {
    console.log('   ❌ Archivo no existe');
  }
  
  console.log(''); // Línea en blanco
});

// Verificar estructura de directorios
console.log('📁 ESTRUCTURA DE DIRECTORIOS:');

const dirsToCheck = [
  './dist/modules/chat',
  './dist/routes'
];

dirsToCheck.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}/`);
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      console.log(`   - ${file}`);
    });
  } else {
    console.log(`❌ ${dir}/ no existe`);
  }
  console.log('');
});

// Intentar importar los módulos
console.log('🔧 PROBANDO IMPORTACIONES:');

try {
  const chatRoutes = require('./dist/modules/chat/chat.routes.js');
  console.log('✅ Chat routes importado:', typeof chatRoutes.default);
} catch (error) {
  console.log('❌ Error importando chat routes:', error.message);
}

try {
  const mainRoutes = require('./dist/routes/index.js');
  console.log('✅ Main routes importado:', typeof mainRoutes.default);
} catch (error) {
  console.log('❌ Error importando main routes:', error.message);
}

try {
  const config = require('./dist/core/config/environment.js');
  console.log('✅ Config importado, API prefix:', config.default?.server?.apiPrefix);
} catch (error) {
  console.log('❌ Error importando config:', error.message);
}