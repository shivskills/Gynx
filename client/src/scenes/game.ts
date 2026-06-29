import Phaser from "phaser"; 

import SocketHandler from "../networking/socketHandler";
import InputHandler from "../helpers/input";


export default class GameScene extends Phaser.Scene {
   private inputHandler!: InputHandler;
   private socketHandler!: SocketHandler;



  constructor() {
    super({ key: "GameScene" });
  }




  preload() {
   
  }

  create() {
    
    this.socketHandler = new SocketHandler(this);
    this.inputHandler = new InputHandler(this, this.socketHandler);
    var camera = this.cameras.main
    camera.setZoom(5.5) // 5.5    
    
  }

  update() {


    this.inputHandler.move();
    



  }

}

