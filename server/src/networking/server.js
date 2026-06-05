import WebSocket, { WebSocketServer } from 'ws'; 

const players = []; 

const wss = new WebSocketServer({ port: 8000 }); 
wss.on('connection', function connection(ws, req) {
    ws.on('error', console.error); 
    console.log('Client connected');
    const ip = req.socket.remoteAddress; 
    const port = req.socket.remotePort; 
    const socketId = `${ip}:${port}`; 
    players.push(socketId); 

    
    ws.on('message', function message(data) {
        const obj = JSON.parse(data); 
        
        switch (obj.type) {
            case 'move': {
                ws.send(JSON.stringify({ type: 'move', playerId: socketId, direction: obj.direction }));
                break; 
            }

            default: {
                console.warn('unknown message type'); 
            }
        }
    });
});


