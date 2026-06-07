import Phaser from "phaser"; 
import GameScene from "../scenes/game";
import type SocketHandler from "../networking/socketHandler";
export default class InputHandler {
    private scene: GameScene;
    private socketHandler: SocketHandler;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | undefined; 
    private wasdKeys: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  } | undefined;


    constructor(scene: GameScene, socketHandler: SocketHandler) {
        this.scene = scene; 
        this.socketHandler = socketHandler;
        this.cursorKeys = this.scene.input.keyboard.createCursorKeys();
        this.wasdKeys = this.scene.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D
        });
    }

    public move (): void {
        if (this.cursorKeys?.left.isDown || this.wasdKeys?.A.isDown) {
            this.socketHandler.sendMessage({type: "move", direction: {x: -.1, y: 0}});
        } else if (this.cursorKeys?.right.isDown || this.wasdKeys?.D.isDown) {
            this.socketHandler.sendMessage({type: "move", direction: {x: 0.1, y: 0}});
        } else if (this.cursorKeys?.up.isDown || this.wasdKeys?.W.isDown) {
            this.socketHandler.sendMessage({type: "move", direction: {x: 0, y: -.1}});
        } else if (this.cursorKeys?.down.isDown || this.wasdKeys?.S.isDown) {
            this.socketHandler.sendMessage({type: "move", direction: {x: 0, y: 0.1}});
        } else {
            this.socketHandler.sendMessage({type: "move", direction: {x: 0, y: 0}});
        }
    }


}