import Phaser from "phaser"; 

import SocketHandler from "../networking/socketHandler";
import InputHandler from "../helpers/input";
import PlayerManager from "../helpers/PlayerManager";
import MapManager from "../helpers/MapManager";

export default class GameScene extends Phaser.Scene {
   private inputHandler!: InputHandler;
   private playerManager!: PlayerManager; 

  constructor() {
    super({ key: "GameScene" });
  }


  preload() {
   
  }

  create() {
    

    this.playerManager = new PlayerManager();
    const socket = new SocketHandler(this, this.playerManager);
    const inputHandler = new InputHandler(this, socket);
    this.inputHandler = inputHandler;
    const mapManager = new MapManager(this, this.playerManager);
    mapManager.createMap();

    
    
  }

  update() {

    this.inputHandler.move(); 
    this.playerManager.update(); 
    // update UI logic



  }
}

