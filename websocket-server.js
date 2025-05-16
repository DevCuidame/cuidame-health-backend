const WebSocket = require('ws');
const http = require('http');
const express = require('express');

// Crear una app Express simple
const app = express();
app.get('/', (req, res) => {
  res.send('Servidor WebSocket de prueba');
});

// Crear un servidor HTTP
const server = http.createServer(app);

// Crear un servidor WebSocket
const wss = new WebSocket.Server({ 
  server: server,
  path: '/ws/chat'
});

// Manejar conexiones
wss.on('connection', (ws) => {
  console.log('Cliente conectado');
  
  ws.on('message', (message) => {
    console.log('Mensaje recibido:', message.toString());
    ws.send('Respuesta: ' + message);
  });
  
  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
  
  // Enviar mensaje de bienvenida
  ws.send('Bienvenido al servidor WebSocket');
});

// Iniciar el servidor
const PORT = 4001;
server.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
  console.log(`WebSocket disponible en ws://localhost:${PORT}/ws/chat`);
});