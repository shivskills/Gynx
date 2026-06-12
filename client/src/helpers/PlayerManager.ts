import Phaser from "phaser"
import SocketHandler from "../networking/socketHandler";
type PlayerData = {
  sprite: Phaser.GameObjects.Sprite
  arrX: number;
  arrY: number;
  targetX: number;
  targetY: number;
};

export default class PlayerManager {
    private players: Map<string, PlayerData>;  
    private cellSize: number; 
    private serverCellSize: number; 
    private scene: Phaser.Scene
    private playerId: string; 

    constructor(scene: Phaser.Scene, cellSize: number, playerId: string, arr: [string, {x: number, y: number, texture: string, arrX: number, arrY: number, targetX: number, targetY: number}][], serverCellSize: number) {
        this.cellSize = cellSize;
        this.serverCellSize = serverCellSize; 
        this.scene = scene; 


        const playersMap = new Map<string, PlayerData>(); 
        for (const [key, player] of arr) { 
                        playersMap.set(key, {sprite: scene.physics.add.sprite(player.x * (this.cellSize / this.serverCellSize), player.y * (this.cellSize / this.serverCellSize), player.texture).setScale(0.5), arrX: player.arrX, arrY: player.arrY, targetX: player.targetX, targetY: player.targetY})
                        if  (key === playerId) {
                            const gameObject = playersMap.get(key).sprite;
                            if (gameObject) {
                                scene.cameras.main.startFollow(gameObject);
                            }        
                        } 
                    }
        this.players = playersMap; 
        this.playerId = playerId

    }

    public addPlayer(playerId: string, playerInfo: {x: number, y: number, texture: string, arrX: number, arrY: number, targetX: number, targetY: number}) {
       this.players.set(playerId, {sprite: this.scene.physics.add.sprite(playerInfo.x * ((this.cellSize / this.serverCellSize)), playerInfo.y * (this.cellSize / this.serverCellSize), playerInfo.texture).setScale(0.5), arrX: playerInfo.arrX, arrY: playerInfo.arrY, targetX: playerInfo.targetX, targetY: playerInfo.targetY});
    }

    // *not for handling input but rather retrieving from server* 
    // x and y are the change in coords in world coords
    public movePlayer(id: string, x: number, y: number) {
        const player = this.players.get(id); 
        if (player) {
           player.sprite.setX(player.sprite.x += x * (this.cellSize / this.serverCellSize));
           player.sprite.setY(player.sprite.y += y * (this.cellSize / this.serverCellSize)); 
        }
    
    }

    public removePlayer(id: string): void {
        console.log(this.players.size); 
        this.players.get(id).sprite.destroy(); 
        this.players.delete(id); 
        console.log(this.players.size); 
    }


    public getCellSize(): number {
        return this.cellSize
    }

    public getServerCellSize(): number {
        return this.serverCellSize
    }

  

}

