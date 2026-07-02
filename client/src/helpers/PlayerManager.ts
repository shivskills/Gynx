import Phaser from "phaser"
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
    private graphics!: Phaser.GameObjects.Graphics;  

    constructor(scene: Phaser.Scene, cellSize: number, playerId: string, arr: [string, {x: number, y: number, texture: string, arrX: number, arrY: number, targetX: number, targetY: number}][], serverCellSize: number, health: number) {
        this.cellSize = cellSize;
        this.serverCellSize = serverCellSize; 
        this.scene = scene; 

        const graphics = this.scene.add.graphics(); 

        graphics.fillStyle(0x000000, 1); 
        graphics.fillRect(0,0, cellSize * 0.5 , cellSize * 0.5); 
        graphics.generateTexture("player", cellSize * 0.5, cellSize * 0.5); 
        graphics.destroy(); 

        const playersMap = new Map<string, PlayerData>(); 
        for (const [key, player] of arr) { 
                        playersMap.set(key, {sprite: scene.physics.add.sprite(player.x * (this.cellSize / this.serverCellSize), player.y * (this.cellSize / this.serverCellSize), player.texture), arrX: player.arrX, arrY: player.arrY, targetX: player.targetX, targetY: player.targetY})
                        if  (key === playerId) {
                            const gameObject = playersMap.get(key).sprite;
                            if (gameObject) {
                                scene.cameras.main.startFollow(gameObject);
                            }        
                        } 
                    }
        this.players = playersMap;) 
        this.graphics = this.scene.add.graphics(); 
        this.graphics.setScrollFactor(0);
        this.setHealth(health);   
    }

    public addPlayer(playerId: string, playerInfo: {x: number, y: number, texture: string, arrX: number, arrY: number, targetX: number, targetY: number}) {
       this.players.set(playerId, {sprite: this.scene.physics.add.sprite(playerInfo.x * ((this.cellSize / this.serverCellSize)), playerInfo.y * (this.cellSize / this.serverCellSize), playerInfo.texture), arrX: playerInfo.arrX, arrY: playerInfo.arrY, targetX: playerInfo.targetX, targetY: playerInfo.targetY});
    }

    // *not for handling input but rather retrieving from server* 
    // x and y are the coords in world coords
    public movePlayer(movedPlayers: [string, { x: number; y: number }][]) {
        for (const [playerId, value] of movedPlayers) {
            const player = this.players.get(playerId)
            player?.sprite.setX(value.x * (this.cellSize / this.serverCellSize)); 
            player?.sprite.setY(value.y * (this.cellSize / this.serverCellSize))

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

    public setHealth (health: number): void {

        this.graphics.clear(); 
        this.graphics.fillStyle(0xC5C7C6); 
        this.graphics.fillRect(20,20,200,10); 

        this.graphics.fillStyle(0x00ff00, 1); 
        this.graphics.fillRect(20,20, (health / 100) * 200, 10); 
       
        

    }

  

}

