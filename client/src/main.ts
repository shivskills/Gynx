import Phaser from "phaser"; 
import './style.css';
import Game from "./scenes/game"; 

const gameCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const size = { // may change this later depending on responsiveness; 
  width: 980,
  height: 1000
};



const config = {
    type: Phaser.CANVAS,
    width: size.width,
    height: size.height, 
    canvas: gameCanvas,
    scene: [Game]
}

new Phaser.Game(config);
