// websocket-test.js
const http = require('http');
const WebSocket = require('ws');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('WebSocket Test Server');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Cliente conectado');
  
  ws.on('message', (message) => {
    console.log('Mensaje recibido:', message);
    ws.send('Respuesta del servidor: ' + message);
  });
  
  ws.send('Bienvenido al servidor WebSocket de prueba');
});

server.listen(4001, () => {
  console.log('Servidor de prueba iniciado en http://localhost:4001');
  console.log('WebSocket disponible en ws://localhost:4001');
});