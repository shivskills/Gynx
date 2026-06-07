import Phaser from "phaser";
import PlayerManager from "../helpers/PlayerManager";
import MapManager from "../helpers/MapManager";
export default class SocketHandler {
    private playerManager!: PlayerManager; 
    private websocket: WebSocket;
    
    constructor(scene: Phaser.Scene) {
        
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
                    this.playerManager.movePlayer(data.playerId, data.direction.x, data.direction.y);
                    break; 
                };
                case "newPlayer": { // only add new people (self was already in game)
                    this.playerManager.addPlayer(data.playerId, scene.add.sprite(data.x, data.y, data.texture)); // fix 
                    break; 
                }; 
                case "firstTimePlayer" : { // will add all players including itself (self was not already in game)
                    const mapManager = new MapManager(scene, data.maze);
                    this.playerManager = new PlayerManager(mapManager.getCellSize()); 
                    mapManager.createMap();
                    for (const p of data.players) { 
                        if  (p.id === data.playerId) {
                            const gameObject = scene.add.sprite(0.5 * mapManager.getCellSize(), 0.5 * mapManager.getCellSize(), p.texture); // p.x, p.y
                            this.playerManager.addPlayer(p.id, gameObject);
                            scene.cameras.main.startFollow(gameObject);
                        }
                        else {
                            this.playerManager.addPlayer(p.id, scene.add.sprite(p.x, p.y, p.texture));
                        }
                    }
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