import Phaser from "phaser";
import game from "../main";

export default class ResumeScene extends Phaser.Scene {
	constructor(key) {
		super(key);
	}
	resume: Phaser.GameObjects.Image;

	SceneB() {
		Phaser.Scene.call(this, { key: "resumeGame" });
	}

	preload() {
		this.load.image("resume", "assets/play.png");
	}

	create() {
		console.log("resumes");
		this.resume = this.add.image(150, 50, "resume").setInteractive();
		this.resume.on("pointerdown", function () {
			// this.scene.resume("pauseGame");
		});
		this.resume.visible = true;
	}
}
