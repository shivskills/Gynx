import Phaser from "phaser"; 
import './style.css';
import Game from "./scenes/game"; 

const gameCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const size = { // may change this later depending on responsiveness; 
  width: window.innerWidth,
  height: window.innerHeight
};



const config = {
    type: Phaser.CANVAS,
    width: size.width,
    height: size.height, 
    canvas: gameCanvas,
    physics: {
      default: 'arcade', 
      arcade : {
        debugShowVelocity: true,
      }
    }, 
    scene: [Game]
}

new Phaser.Game(config);
