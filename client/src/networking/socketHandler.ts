import PlayerManager from "../helpers/PlayerManager";
import MapManager from "../helpers/MapManager";
import GameScene from "../scenes/game";
export default class SocketHandler {
    private playerManager!: PlayerManager; 
    private websocket: WebSocket;
    
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
                    this.playerManager.movePlayer(data.playerId, data.dx, data.dy);
                    break; 
                };
                case "newPlayer": { // only add new people (self was already in game)
                    this.playerManager.addPlayer(data.playerId, data.playerInfo); 
                    break; 
                }; 
                case "firstTimePlayer" : { // will add all players including itself (self was not already in game)
                    const mapManager = new MapManager(scene, data.maze);
                    mapManager.createMap();
                    this.playerManager = new PlayerManager(scene, mapManager.getCellSize(), data.playerId, data.players, data.serverCellSize); 
                    break;
                }
                case "removePlayer" : {
                    this.playerManager.removePlayer(data.id)
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