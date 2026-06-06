import Phaser from "phaser";
import Player from "../lib/Player";

export default class PlayerManager {
    private players: Player[];   

    constructor() {
        this.players = [];

    }

    public addPlayer(id: string, sprite: Phaser.GameObjects.Sprite) {
        const player = new Player(id, sprite);
        this.players.push(player);
    }

    // *not for handling input but rather retrieving from server* 
    // x and y are the changes in cords not the new cords themselves
    public movePlayer(id: string, x: number, y: number) {
        for(const p of this.players) {
            if (p.getId() === id) {
                p.displaceCords(x, y);
                break; 
            }
        }
    }


  

    public getPlayers(): Player[] {
        return this.players;
    }
}