import Phaser from "phaser"; 
import './style.css';
import { Maze } from "../../server/src/game/maze";
const gameCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement;

const size = { // may change this later depending on responsiveness; 
  width: 980,
  height: 1000
};

const speedDown = 300; 

class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
   
  }

  create() {
    const mazeEngine= new Maze(55, 50);
    const mapMatrixData = mazeEngine.initializeMaze();

    // draw the grid: 0 => white, 1 => black
    const rows = mapMatrixData.length;
    const cols = rows ? mapMatrixData[0].length : 0;
    const cellSize = Math.floor(Math.max(size.width / cols, size.height / rows)); // either width or height will fit perfectly (ex. width per #cols is cell size)
    const graphics = this.add.graphics();

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const val = mapMatrixData[y][x];
        const color = val === 0 ? 0xffffff : 0x000000;
        graphics.fillStyle(color, 1);
        graphics.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

  
    const nodes = mazeEngine.getNodes();
    graphics.lineStyle(1, 0x880000, 1);
    for (const n of nodes) {
      const nx = n.x * cellSize;
      const ny = n.y * cellSize;
      const pad = Math.max(2, Math.floor(cellSize * 0.15));
     graphics.fillStyle(0xff0000, 1);
      graphics.fillRect(nx + pad, ny + pad, cellSize - pad * 2, cellSize - pad * 2);
    
    } 
    
  }

  update() {
    // game loop logic here
  }
}

const config = {
  type: Phaser.CANVAS,
  width: size.width, 
  height: size.height,
  canvas: gameCanvas, 
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: speedDown },
      debug: true
    }
  },
  scene: [GameScene]
}

new Phaser.Game(config);

