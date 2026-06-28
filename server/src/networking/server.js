import WebSocket, { WebSocketServer } from 'ws'; 
import { v4 as uuidv4 } from 'uuid';
import { Maze } from '../../../client/src/lib/maze.ts';


 
const players = new Map();  
const movedPlayers = new Map(); 
const projectiles = new Map(); 
const playerIdToWs = new Map();
const cellToPlayers = new Map(); // column, row --> player ID
const inputQueue = []
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

    players.set(ws, { x: worldSpawnX, y: worldSpawnY, texture: texture, arrX: spawn.col, arrY: spawn.row, targetX: worldSpawnX, targetY: worldSpawnY, playerId: playerId, facing: {x: 1, y: 0} });
    playerIdToWs.set(playerId, ws); 
    cellToPlayers.set(`${spawn.col},${spawn.row}`, playerId); 
   
    // send new player to everyone excluding the new player;
    wss.clients.forEach(function each(client) {
        if(client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'newPlayer', playerInfo: { x: worldSpawnX, y: worldSpawnY, texture: texture, arrX: spawn.col, arrY: spawn.row, targetX: worldSpawnX, targetY: worldSpawnY }, playerId: playerId }));
        }
    })

    ws.send(JSON.stringify({ type: 'firstTimePlayer', projectiles: Array.from(projectiles, ([key, projectile]) => [key, { x: projectile.x, y: projectile.y, texture: projectile.texture, finalArrX: projectile.finalArrX, finalArrY: projectile.finalArrY, alive: projectile.alive, playerId: projectile.playerId, direction: {x: projectile.direction.x, y: projectile.direction.y} }]), players: Array.from(players, ([key, player]) => [player.playerId, { x: player.x, y: player.y, texture: player.texture, arrX: player.arrX, arrY: player.arrY, targetX: player.targetX, targetY: player.targetY }]), maze: maze, playerId: playerId, serverCellSize: tileSize })); 

    
    ws.on('message', function message(data) {
        const obj = JSON.parse(data); 
        
        switch (obj.type) {
            case 'move': {
            const player = players.get(ws); 
            // console.log(`Player at ${player.arrX}, ${player.arrY}`); 
            const validMove = player.x == player.targetX && player.y == player.targetY && maze[player.arrY + obj.direction.y]?.[player.arrX + obj.direction.x] == 0
            if (validMove) {
                player.targetX = player.x + (obj.direction.x) * tileSize; 
                player.targetY = player.y + (obj.direction.y) * tileSize; 
                movedPlayers.set(playerId, {x: player.x, y: player.y, xDir: Math.sign(obj.direction.x)  , yDir: Math.sign(obj.direction.y) });
                player.facing.x =  Math.sign(obj.direction.x); 
                player.facing.y = Math.sign(obj.direction.y); 
                
            } 
            
            break; 
            }

            case 'projectile' : {
                const projId = uuidv4(); 
                const player = players.get(ws); 
                const finalArr = findProjectileTarget(player.facing, player.arrX, player.arrY); 
                if (finalArr.x != player.arrX || finalArr.y != player.arrY ) { // 
                    const facingX = player.facing.x; 
                    const facingY = player.facing.y
                    projectiles.set(projId, {playerId: playerId, direction: {x: facingX, y: facingY}, alive: true, x: player.x, y: player.y, finalArrX: finalArr.x, finalArrY: finalArr.y, texture: "player"})
                    wss.clients.forEach(function each(client) {
                        if(client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ type: 'newProjectile', projInfo: { playerId: playerId, direction: {x: facingX, y: facingY}, alive: true, x: player.x, y: player.y, finalArrX: finalArr.x, finalArrY: finalArr.y, texture: "player"}, projId: projId }));
                        }
                    })
                    console.log(finalArr.x, finalArr.y); 
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

// x and y represent the direction the player is facing; 
const findProjectileTarget = ({x, y}, playerArrX, playerArrY) => {
    
    let futureX = playerArrX; 
    let futureY = playerArrY
    while (maze[futureY] != undefined && maze[futureY][futureX] != undefined && maze[futureY][futureX] == 0) {
        console.log(`Coord value at ${futureX} ${futureY}: ${maze[futureY][futureX]}`); 
        futureX += x; 
        futureY += y; 
    }

    return {x: futureX -= x, y: futureY -= y}; 

}


const pingInterval = 16 ; // ms
const serverTick = setInterval(function gameTick() {
    processInput(); 
    processMovement(); 
    processProjectile();  
    broadcast(); 

}, pingInterval); 

function processInput() {

    return; 
}

function processMovement(xDir, yDir) {
    const completeDuration = 256 // ms
    const distancePerInt = tileSize / (completeDuration / pingInterval); 
                
    for (const [movedPlayer, value] of movedPlayers) {
        const player = players.get(playerIdToWs.get(movedPlayer))
        player.x += distancePerInt * value.xDir; 
        value.x += distancePerInt * value.xDir; 
        player.y += distancePerInt * value.yDir;
        value.y += distancePerInt * value.yDir;
        if (player.x === player.targetX && player.y == player.targetY) {
            player.arrX += value.xDir; 
            player.arrY += value.yDir; 

            console.log(`Player at ${player.arrX}, ${player.arrY}`); 
        }
    }

}

function processProjectile() {
    const completeDuration = 128 // ms
    const distancePerInt = tileSize / (completeDuration / pingInterval); 

    
    for (const [projectile, value] of projectiles) {
        value.x += distancePerInt * value.direction.x; 
        value.y += distancePerInt * value.direction.y; 
       // console.log(`Projectile at ${value.x}, ${value.y}`);
        console.log(`Projectile at ${value.x}, ${value.y}`);
    }
}



function broadcast() {
    wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({type: 'move', movedPlayers: Array.from(movedPlayers)}));          
        client.send(JSON.stringify({type: 'projectileMove', movedProjectiles: Array.from(projectiles)}));                       
    }
    })

    for (const [movedPlayer, value] of movedPlayers) {
        const player = players.get(playerIdToWs.get(movedPlayer))
        if (player.x == player.targetX && player.y == player.targetY) {
            movedPlayers.delete(movedPlayer);  
        }
    }
    for (const [projectile, value] of projectiles) {
        if(value.x >= value.finalArrX * tileSize + (tileSize / 2)  && value.direction.x > 0 || value.x <= value.finalArrX * tileSize + (tileSize / 2)  && value.direction.x < 0 || value.y >= value.finalArrY * tileSize + (tileSize / 2)  && value.direction.y > 0 || value.y <= value.finalArrY * tileSize + (tileSize / 2)  && value.direction.y < 0) {
            projectiles.delete(projectile); 
        }
    }
}
