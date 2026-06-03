import WebSocket, { WebSocketServer } from 'ws'; 

const wss = new WebSocketServer({ port: 8000 }); 

wss.on('connection', function connection() {
    console.log('Client connected');
});