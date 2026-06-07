import Phaser from "phaser"; 

import SocketHandler from "../networking/socketHandler";
import InputHandler from "../helpers/input";
import PlayerManager from "../helpers/PlayerManager";


export default class GameScene extends Phaser.Scene {
   private inputHandler!: InputHandler;



  constructor() {
    super({ key: "GameScene" });
  }




  preload() {
   
  }

  create() {
    


    const socket = new SocketHandler(this);
    const inputHandler = new InputHandler(this, socket);
    this.inputHandler = inputHandler;


    // camera.startFollow(gameObject);
    
    
  }

  update() {

    
    this.inputHandler.move();
    



  }
}

