import PlayerManager from "../helpers/PlayerManager";
import MapManager from "../helpers/MapManager";
import GameScene from "../scenes/game";
import ProjectileManager from "../helpers/ProjectileManager";
export default class SocketHandler {
    private playerManager!: PlayerManager; 
    private websocket: WebSocket;
    private projectileManager!: ProjectileManager; 
    constructor(scene: GameScene) {
        
        const wsUri = "ws://localhost:8000"; 
        this.websocket = new WebSocket(wsUri); 
        
        this.websocket.addEventListener("open", () => { // on connection
          console.log("CONNECTED"); 
        })


        // standard message retrieval
        this.websocket.addEventListener("message", (e) => {
            const data = JSON.parse(e.data);

            switch (data.type) {
                case "move": {
                    this.playerManager.movePlayer(data.movedPlayers);
                    break; 
                };
                case "newProjectile" : {
                    this.projectileManager.addProjectile(data.projId, data.projInfo); 
                    break; 
                };
                case "projectileMove" : {
                    this.projectileManager.moveProjectile(data.movedProjectiles); 
                    break;
                };
                
                case "newPlayer": { // only add new people (self was already in game)
                    this.playerManager.addPlayer(data.playerId, data.playerInfo); 
                    break; 
                }; 
                case "firstTimePlayer" : { // will add all players including itself (self was not already in game)
                    const mapManager = new MapManager(scene, data.maze);
                    mapManager.createMap();
                    this.playerManager = new PlayerManager(scene, mapManager.getCellSize(), data.playerId, data.players, data.serverCellSize, data.health); 
                    this.projectileManager = new ProjectileManager(scene, mapManager.getCellSize(), data.projectiles, data.serverCellSize); 
                    break;
                }
                case "removePlayer" : {
                    this.playerManager.removePlayer(data.removedPlayers)
                    break; 
                }
                case "removeProjectile" : {
                    this.projectileManager.removeProjectile(data.deletedProjectiles); 
                    break; 
                }
                case "damagedPlayer" : {
                    this.playerManager.setHealth(data.health); 
                    break; 
                }
                case "win" : {
                    scene.showWinScreen();
                    break;
                }
                case "lose" : {
                    scene.showLoseScreen();
                    this.playerManager.setHealth(0); 
                    break;
                }
                default: { 
                    console.warn("unknown message from the server: " + data.type)
                }
        }});         
        
    } 

    public sendMessage(message: object) {
        if (this.websocket.readyState !== WebSocket.OPEN) {
            return;
        }
        this.websocket.send(JSON.stringify(message));
    }




}