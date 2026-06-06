import WebSocket, { WebSocketServer } from 'ws'; 
import { v4 as uuidv4 } from 'uuid';
import { Maze } from '../../../client/src/lib/maze.ts';



const players = [];  
const maze = new Maze(55, 50).initializeMaze();

const wss = new WebSocketServer({ port: 8000 }); 
wss.on('connection', function connection(ws, req) {
    ws.on('error', console.error); 
    console.log('Client connected');

    let x = Math.floor(Math.random() * 1000); // change later for random texture creation -- maybe by color???
    let y = Math.floor(Math.random() * 1000); // holds actual coordinates
    let texture = 'player'; // change later for random texture creation -- maybe by color???
    const playerId = uuidv4();

    players.push({ id: playerId, x: x, y: y, texture: texture });
   
    // send new player to everyone excluding the new player;
    wss.clients.forEach(function each(client) {
        if(client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'newPlayer', playerId: playerId, x: x, y: y, texture: texture }));
        }
    })

    ws.send(JSON.stringify({ type: 'firstTimePlayer', players: players, maze: maze, playerId: playerId })); 


    
    ws.on('message', function message(data) {
        const obj = JSON.parse(data); 
        
        switch (obj.type) {
            case 'move': {
                wss.clients.forEach(function each(client) {
                    if(client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'move', playerId: playerId, direction: obj.direction }));
                    }
                });
                console.log(`Player ${playerId} moved in direction (${obj.direction.x}, ${obj.direction.y})`);
                break; 
            }

            default: {
                console.warn('unknown message type'); 
            }
        }
    });
});


