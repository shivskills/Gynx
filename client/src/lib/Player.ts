import Phaser from "phaser";

export default class Player {
    private id: string; 
    private x: number; 
    private y: number; 
    private sprite: Phaser.GameObjects.Sprite;

    constructor(id: string, x: number, y: number, sprite: Phaser.GameObjects.Sprite) {
        this.id = id; 
        this.x = x; 
        this.y = y; 
        this.sprite = sprite; 
    }

    public updatePositionOnScreen() {
        this.sprite.setPosition(this.x, this.y); 
    }

    public getX(): number {
        return this.x; 
    }

    public getY(): number {
        return this.y; 
    }

    public getId(): string {
        return this.id; 
    }

    public setCords(x: number, y: number) {
        this.x = x; 
        this.y = y; 
    }
}