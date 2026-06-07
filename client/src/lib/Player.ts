import Phaser from "phaser";

export default class Player {
    private id: string; 
    private sprite: Phaser.GameObjects.Sprite;
    private x: number;
    private y: number;

    constructor(id: string, sprite: Phaser.GameObjects.Sprite) {
        this.id = id; 
        this.sprite = sprite; 
        this.x = this.sprite.x;
        this.y = this.sprite.y;

    }
   

    public getId(): string {
        return this.id; 
    }

    public displaceScreenCords(x: number, y: number, cellSize: number) {
      if (x === 0 && y === 0) {
        this.sprite.setPosition(this.x, this.y);
        return;
      }
      
       if (y === 0) { // moving horizontally
        this.sprite.setPosition(this.sprite.x + x, this.y);
        if (x > 0 ) {
            if (this.sprite.x > this.x) {
            this.x = this.x + cellSize;
            } 
        } else {
            if (this.sprite.x < this.x) {
            this.x = this.x - cellSize;
            }
        }
      } else {
            this.sprite.setPosition(this.x, this.sprite.y + y);
            if (y > 0) {
                if (this.sprite.y > this.y) {
                this.y = this.y + cellSize;
                }
            } else  {
                if (this.sprite.y < this.y) {
                this.y = this.y - cellSize;
                }
            }
        }
    }

   
    
}