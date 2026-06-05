import Phaser from "phaser";
import PlayerManager from "../helpers/PlayerManager";
export default class SocketHandler {
    private playerManager: PlayerManager; 
    private websocket: WebSocket;
    constructor(scene: Phaser.Scene, playerManager: PlayerManager) {
        this.playerManager = playerManager; 
        const wsUri = "ws://localhost:8000"; 
        this.websocket = new WebSocket(wsUri); 
        this.websocket.addEventListener("open", () => {
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
                case "newPlayer": {
                    this.playerManager.addPlayer(data.playerId, data.x, data.y, scene.add.sprite(data.x, data.y, "player"));
                    break; 
                }; 
                default: { 
                    console.warn("unknown message from the server: " + data.type)
                }
        }});         
        
    } 

    public sendMessage(message: object) {
        this.websocket.send(JSON.stringify(message));
    }


}