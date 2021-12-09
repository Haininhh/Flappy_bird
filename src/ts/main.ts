import Phaser from "phaser";

import FlappyBirdScene from "./Scenes/FlappyBirdScene";
import ResumeScene from "./Scenes/ResumeScene";

const config = {
	type: Phaser.AUTO,
	width: 2880,
	height: 512,
	physics: {
		default: "arcade",
		arcade: {
			gravity: { y: 300 },
		},
	},
	scene: [FlappyBirdScene, ResumeScene],
};
const game: Phaser.Game = new Phaser.Game(config);

export default game;
