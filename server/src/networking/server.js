import WebSocket, { WebSocketServer } from 'ws'; 
import { v4 as uuidv4 } from 'uuid';
import { Maze } from '../../../client/src/lib/maze.ts';


 
const players = new Map();  
const movedPlayers = new Map(); 
const projectiles = new Map(); 
const playerIdToWs = new Map();
let deadProjectiles = [] // store projIds
let inputQueue = []
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
                inputQueue.push({type: "move", player: players.get(ws), direction: obj.direction })
                break; 
            }

            case 'projectile' : {
                inputQueue.push({type: "projectile", player: players.get(ws) }); 
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
    const current = inputQueue; 
    inputQueue = [];
    for (const packet of current) {
        if (packet.type === "move") {
            const validMove = packet.player.x == packet.player.targetX && packet.player.y == packet.player.targetY && maze[packet.player.arrY + packet.direction.y]?.[packet.player.arrX + packet.direction.x] == 0
            if (validMove) {
                packet.player.targetX = packet.player.x + (packet.direction.x) * tileSize; 
                packet.player.targetY = packet.player.y + (packet.direction.y) * tileSize; 
                movedPlayers.set(packet.player.playerId, {x: packet.player.x, y: packet.player.y, xDir: Math.sign(packet.direction.x)  , yDir: Math.sign(packet.direction.y) });
                packet.player.facing.x =  Math.sign(packet.direction.x); 
                packet.player.facing.y = Math.sign(packet.direction.y); 
            }
        } else if (packet.type === "projectile") {
            const projId = uuidv4(); 
            const finalArr = findProjectileTarget(packet.player.facing, packet.player.arrX, packet.player.arrY); 
            if (finalArr.x != packet.player.arrX || finalArr.y != packet.player.arrY ) {  
                const facingX = packet.player.facing.x; 
                const facingY = packet.player.facing.y
                const texture = facingX == 0 ? "projectileVertical" : "projectileHorizontal"  
                projectiles.set(projId, {playerId: packet.player.playerId, direction: {x: facingX, y: facingY}, alive: true, x: packet.player.x, y: packet.player.y, finalArrX: finalArr.x, finalArrY: finalArr.y, texture: texture})
                wss.clients.forEach(function each(client) {
                    if(client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'newProjectile', projInfo: { playerId: packet.player.playerId, direction: {x: facingX, y: facingY}, alive: true, x: packet.player.x, y: packet.player.y, finalArrX: finalArr.x, finalArrY: finalArr.y, texture: texture}, projId: projId }));
                    }
                })
                console.log(finalArr.x, finalArr.y); 
                }
        }
        
    }
    
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

            console.log(`Player at ${player.x}, ${player.y}`); 
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

        const playerWidth = (tileSize / 4); 
        const projectileWidth = (tileSize / 2);
        const projectileHeight = ( tileSize / 20 )
        // playerTop = player.y - playerWidth; 
        // playerBottom = player.y + playerWidth; 
        // playerRight = player.x + playerWidth; 
        // playerRight = player.x - playerWithdth; 


        // projTop = proj.y - projWidth; etc etc etc 

       
        for (const [key, playerVal] of players) {
            if((
                playerVal.x - playerWidth <= value.x + projectileWidth && // left1 < right2
                playerVal.x + playerWidth >= value.x - projectileWidth && // right1 > left 
                playerVal.y - playerWidth <= value.y + projectileHeight &&  // top1 < bottom2
                playerVal.y + playerWidth >= value.y - projectileHeight // bottom1 > top2
            ) && value.playerId !== playerVal.playerId) { 
                projectiles.delete(projectile); 
                deadProjectiles.push(projectile); 
            }
        }
    }


}



function broadcast() {
    for (const [projectile, value] of projectiles) {
        if(value.x >= value.finalArrX * tileSize + (tileSize / 2)  && value.direction.x > 0 || value.x <= value.finalArrX * tileSize + (tileSize / 2)  && value.direction.x < 0 || value.y >= value.finalArrY * tileSize + (tileSize / 2)  && value.direction.y > 0 || value.y <= value.finalArrY * tileSize + (tileSize / 2)  && value.direction.y < 0) {
            deadProjectiles.push(projectile); 
            projectiles.delete(projectile); 
        }
    }
    wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({type: 'move', movedPlayers: Array.from(movedPlayers)}));          
        client.send(JSON.stringify({type: 'projectileMove', movedProjectiles: Array.from(projectiles)}));    
        client.send(JSON.stringify({type: 'removeProjectile', deletedProjectiles: deadProjectiles}));                       
    }
    })
    for (const [movedPlayer, value] of movedPlayers) {
        const player = players.get(playerIdToWs.get(movedPlayer))
        if (player.x == player.targetX && player.y == player.targetY) {
            movedPlayers.delete(movedPlayer);  
        }
    }


    deadProjectiles = []; 
}
