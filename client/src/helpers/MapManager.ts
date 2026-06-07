
import Phaser from "phaser";
const size = { // may change this later depending on responsiveness; 
  width: window.innerWidth * 3,
  height: window.innerHeight
};

export default class MapManager {
    private maze: number [][]; 
    private scene: Phaser.Scene;
    private cellSize: number;



    constructor(scene: Phaser.Scene, maze: number[][] ) {
        this.scene = scene;
        this.maze = maze;
        this.cellSize = Math.floor(Math.max(size.width / this.maze[0].length, size.height / this.maze.length)); // either width or height will fit perfectly (ex. width per #cols is cell size)
    }

    public createMap() {
        const rows = this.maze.length;
        const cols = rows ? this.maze[0].length : 0;
        const graphics = this.scene.add.graphics();

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const val = this.maze[y][x];
                const color = val === 0 ? 0xffffff : 0x300000;
                graphics.fillStyle(color, 1);
                graphics.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                if ( val === 0) {
                    graphics.lineStyle(1,0xD3D3D3 );
                graphics.strokeRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                }
                
            }
        }

        /* 
        const nodes = this.maze.getNodes();
        graphics.lineStyle(1, 0x880000, 1);
        for (const n of nodes) {
            const nx = n.x * cellSize;
            const ny = n.y * cellSize;
            const pad = Math.max(2, Math.floor(cellSize * 0.15));
            graphics.fillStyle(0xff0000, 1);
            graphics.fillRect(nx + pad, ny + pad, cellSize - pad * 2, cellSize - pad * 2);
        }
        **/
    }

    public getCellSize(): number {
        return this.cellSize;
    }


}