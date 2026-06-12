import WebSocket, { WebSocketServer } from 'ws'; 
import { v4 as uuidv4 } from 'uuid';
import { Maze } from '../../../client/src/lib/maze.ts';


 
const players = new Map();  
const mazeCols = 55; // treated as width
const mazeRows = 50; // treated as height
const tileSize = 32; 
const worldWidth = mazeCols * tileSize; 
const worldHeight = mazeRows * tileSize; 

const maze = new Maze(mazeCols, mazeRows).initializeMaze();

const wss = new WebSocketServer({ port: 8000 }); 
wss.on('connection', function connection(ws, req) {
    ws.on('error', console.error); 
    console.log('Client connected');

    const spawn = findValidSpawn(); 
    const worldSpawnX = (0.5 + spawn.col) * tileSize; 
    const worldSpawnY = (0.5 + spawn.row) * tileSize; 
    let texture = 'player'; // change later for random texture creation -- maybe by color???
    const playerId = uuidv4();

    players.set(ws, { x: worldSpawnX, y: worldSpawnY, texture: texture, arrX: spawn.col, arrY: spawn.row, targetX: worldSpawnX, targetY: worldSpawnY, playerId: playerId });
   
    // send new player to everyone excluding the new player;
    wss.clients.forEach(function each(client) {
        if(client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'newPlayer', playerInfo: { x: worldSpawnX, y: worldSpawnY, texture: texture, arrX: spawn.col, arrY: spawn.row, targetX: worldSpawnX, targetY: worldSpawnY }, playerId: playerId }));
        }
    })

    ws.send(JSON.stringify({ type: 'firstTimePlayer', players: Array.from(players, ([key, player]) => [player.playerId, { x: player.x, y: player.y, texture: player.texture, arrX: player.arrX, arrY: player.arrY, targetX: player.targetX, targetY: player.targetY }]), maze: maze, playerId: playerId, serverCellSize: tileSize })); 

    
    ws.on('message', function message(data) {
        const obj = JSON.parse(data); 
        
        switch (obj.type) {
            case 'move': {

                /* 
                WARNING: The following numbers are chosen on purpose to avoid binary representation error. 
                DO NOT CHANGE THE NUMBERS unless you can maintain the fixed-point arithmetic

                */
                const pingInterval = 16 ; // ms
                const completeDuration = 256 // ms
                const distancePerInt = tileSize / (completeDuration / pingInterval); 
                


                const player = players.get(ws); 
                console.log(`Player at ${player.arrY}, ${player.arrX}`); 
                console.log(`Checking ${player.arrY + obj.direction.y}, ${[player.arrX + obj.direction.x]}`);
                console.log(maze[player.arrY + obj.direction.y]?.[player.arrX + obj.direction.x]); 
                const validMove = player.x == player.targetX && player.y == player.targetY && maze[player.arrY + obj.direction.y]?.[player.arrX + obj.direction.x] == 0
                console.log(validMove); 
                if (validMove) {
                    player.targetX = player.x + (obj.direction.x) * tileSize; 
                    player.targetY = player.y + (obj.direction.y) * tileSize; 
                    const interval = setInterval(function ping() {

                        player.x += distancePerInt * obj.direction.x; 
                            player.y += distancePerInt * obj.direction.y; 
                            
                        if (player.x == player.targetX && player.y == player.targetY) {
                            clearInterval(interval);
                            player.arrX += obj.direction.x; 
                            player.arrY += obj.direction.y;  
                        }
                            console.log('good')
                            wss.clients.forEach(function each(client) {
                                if (client.readyState === WebSocket.OPEN) {
                                    client.send(JSON.stringify({type: 'move', dx: distancePerInt * obj.direction.x, dy: distancePerInt * obj.direction.y, playerId: playerId }));                                
                                }
                            })
                            
                            
                        

                    }, pingInterval)

                }
                break; 
            }

            default: {
                console.warn('unknown message type', obj.type); 
            }
        }
    });
});


const findValidSpawn = () => {
    let validSpawns = new Array(); 
    for (let row = 0; row < maze.length; row++) {
        for(let col = 0; col < maze[0].length; col++) {
            if(maze[row][col] == 0) {
                validSpawns.push({col: col, row: row})
            }
        }
    }
    const randIndex = Math.floor(Math.random() * validSpawns.length); 
    return validSpawns[randIndex]; 
};








