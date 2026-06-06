import Phaser from "phaser";

export default class Player {
    private id: string; 
    private sprite: Phaser.GameObjects.Sprite;

    constructor(id: string, sprite: Phaser.GameObjects.Sprite) {
        this.id = id; 
        this.sprite = sprite; 
    }
   

    public getId(): string {
        return this.id; 
    }

    public displaceCords(x: number, y: number) {
        this.sprite.setPosition(this.sprite.x + x, this.sprite.y + y); 
    }
    
}