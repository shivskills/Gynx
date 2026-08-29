import Phaser from "phaser"; 

import SocketHandler from "../networking/socketHandler";
import InputHandler from "../helpers/input";


export default class GameScene extends Phaser.Scene {
   private inputHandler!: InputHandler;
   private socketHandler!: SocketHandler;
   private matchEnded = false;
   private resultText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "GameScene" });
  }

  public isMatchEnded(): boolean {
    return this.matchEnded;
  }

  public showWinScreen(): void {
    this.matchEnded = true;
    this.resultText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "YOU WIN",
      { fontSize: "48px", color: "#4ade80", fontStyle: "bold" }
    );
    this.resultText.setOrigin(0.5);
    this.resultText.setScrollFactor(0);
  }

  public showLoseScreen(): void {
    this.matchEnded = true;
    this.resultText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "YOU LOSE",
      { fontSize: "48px", color: "#f87171", fontStyle: "bold" }
    );
    this.resultText.setOrigin(0.5);
    this.resultText.setScrollFactor(0);
  }

  preload() {
   
  }

  create() {
    
    this.socketHandler = new SocketHandler(this);
    this.inputHandler = new InputHandler(this, this.socketHandler);
        
  }

  update() {
    if (!this.matchEnded) {
      this.inputHandler.move();
    }
  }

}

