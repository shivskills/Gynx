
type Projectile = {
    finalArrX: number; 
    finalArrY: number; 
    playerId: string; 
    sprite: Phaser.GameObjects.Sprite;
    alive: boolean; 
    direction: {x: number, y: number}; 
}


export default class ProjectileManager {
    private projectiles: Map<string, Projectile> // string is projId 
    private cellSize: number; 
    private serverCellSize: number; 
    private scene: Phaser.Scene; 

    constructor(scene: Phaser.Scene, cellSize: number, arr: [string, {playerId: string, direction: {x: number, y: number}, alive: boolean, x: number, y: number, finalArrX: number, finalArrY: number, texture: string}][], serverCellSize: number) {
        this.cellSize = cellSize; 
        this.serverCellSize = serverCellSize; 
        this.scene = scene; 

        const projectilesMap = new Map<string, Projectile>(); 
        for (const [key, projectile] of arr) { 
            projectilesMap.set(key, {playerId: projectile.playerId, sprite: scene.physics.add.sprite(projectile.x * (this.cellSize / this.serverCellSize), projectile.y * (this.cellSize / this.serverCellSize), projectile.texture).setScale(0.5), finalArrX: projectile.finalArrX, finalArrY: projectile.finalArrY, alive: projectile.alive, direction: {x: projectile.direction.x, y: projectile.direction.y} }) ;
        }
        this.projectiles = projectilesMap; 
    }

    public addProjectile(projId: string, projInfo: { playerId: string, x: number, y: number, texture: string, finalArrX: number, finalArrY: number, alive: boolean, direction: {x: number, y: number}}) {
       this.projectiles.set(projId, {sprite: this.scene.physics.add.sprite(projInfo.x * ((this.cellSize / this.serverCellSize)), projInfo.y * (this.cellSize / this.serverCellSize), projInfo.texture).setScale(0.5), finalArrX: projInfo.finalArrX, finalArrY: projInfo.finalArrY, alive: projInfo.alive, direction: {x: projInfo.direction.x, y: projInfo.direction.y}, playerId: projInfo.playerId} );
    }

    public moveProjectile(movedProjectiles: [string, { x: number; y: number }][]) {
        for (const [projId, value] of movedProjectiles) {
            const projectile = this.projectiles.get(projId)
            projectile?.sprite.setX(value.x * (this.cellSize / this.serverCellSize)); 
            projectile?.sprite.setY(value.y * (this.cellSize / this.serverCellSize))

        }
    }
    
}