import Phaser from "phaser";
import game from "../main";
import FlappyBirdScene from "./FlappyBirdScene";

export default class StartScene extends Phaser.Scene {
	start_screen: Phaser.GameObjects.Image;

	constructor() {
		super("startGame");
	}

	create() {
		// Start game
		this.start_screen = this.add.image(144, 150, "start_screen");
		this.start_screen.setDepth(20);

		const gameplay = this.scene.get("gameplay") as FlappyBirdScene;
		let { pause, score0 } = gameplay;
		pause.visible = false;
		score0.visible = false;

		this.input.once(
			"pointerdown",
			() => {
				this.scene.resume("gameplay");
				this.scene.setVisible(false, "startGame");
				pause.visible = true;
				score0.visible = true;
			},
			this
		);
	}
}
