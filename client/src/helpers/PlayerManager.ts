import Phaser from "phaser";
import Player from "../lib/Player";

export default class PlayerManager {
    private players: Player[];   

    constructor() {
        this.players = [];

    }

    public addPlayer(id: string, x: number, y: number, sprite: Phaser.GameObjects.Sprite) {
        const player = new Player(id, x, y, sprite);
        this.players.push(player);
    }

    // this function is just for updating the cords -- not necessarily for updating on the screen
    public movePlayer(id: string, x: number, y: number) {
        for(const p of this.players) {
            if (p.getId() === id) {
                p.setCords(x, y);
                break; 
            }
        }
    }


    // this function is always called, and is specifically for updating on the screen
    public update() {
        for(const p of this.players) {
            p.updatePositionOnScreen();
        }
    }

    public getPlayers(): Player[] {
        return this.players;
    }
}