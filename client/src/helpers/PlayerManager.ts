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
    private scene: Phaser.Scene; 

    /** This is kinda strange, but essentially the "players" Map represents all players (including ourselves), 
     * and playerManager will also have instance variables to the client specific like their health, and player id
     */
    private graphics!: Phaser.GameObjects.Graphics;  // healthbar
    private health!: Phaser.GameObjects.Text // the number right of healthbar
    private playerId: string; 
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
        this.players = playersMap; 
        this.playerId = playerId; 


        this.graphics = this.scene.add.graphics(); 
        this.graphics.setScrollFactor(0);


        const barThickness = window.innerHeight * 0.01
        const bottom = window.innerHeight - 0.05 * (window.innerHeight) - barThickness
        const barWidth = window.innerWidth * 0.15
        const barLeftPadding = window.innerWidth * 0.02
        this.health = this.scene.add.text(barLeftPadding + barWidth, bottom, `${health}`).setFontSize(28);
        this.health.setColor('#eb4034')
        this.health.setScrollFactor(0); 
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

    public removePlayer(playerIds: string[]): void {
       for (const playerId of playerIds) {
            this.players.get(playerId)?.sprite.destroy(); 
            this.players.delete(playerId); 
        }
    }


    public getCellSize(): number {
        return this.cellSize
    }

    public getServerCellSize(): number {
        return this.serverCellSize
    }

    public setHealth (health: number): void {
        if (health == 0) {
            console.log('you lose'); 
            this.removePlayer(this.playerId)
        }
        const barThickness = window.innerHeight * 0.01
        const bottom = window.innerHeight - 0.05 * (window.innerHeight) - barThickness
        const barWidth = window.innerWidth * 0.15
        
        const barLeftPadding = window.innerWidth * 0.02
        this.graphics.clear(); 
        this.graphics.fillStyle(0xC5C7C6); 
        this.graphics.fillRect(barLeftPadding,bottom, barWidth,barThickness); 

        this.graphics.fillStyle(0x00ff00, 1); 
        this.graphics.fillRect(barLeftPadding,bottom, (health / 100) * barWidth, barThickness); 
        this.health.setText(`${health}`)
        
    }

  

}

