import Phaser from "phaser";
import game from "../main";
import FlappyBirdScene from "./FlappyBirdScene";

export default class ResumeScene extends Phaser.Scene {
	constructor() {
		super("resumeGame");
	}

	create() {
		const pauseScene = this.scene.get("gameplay") as FlappyBirdScene;
		let { resume } = pauseScene;
		resume = this.add.image(250, 50, "resume").setInteractive();
		this.input.once(
			"pointerdown",
			() => {
				this.scene.resume("gameplay");
				resume.visible = false;
			},
			this
		);
	}
}
