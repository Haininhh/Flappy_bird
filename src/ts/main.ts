import Phaser from "phaser";

import FlappyBirdScene from "./Scenes/FlappyBirdScene";

const config = {
	type: Phaser.AUTO,
	width: 288,
	height: 512,
	physics: {
		default: "arcade",
		arcade: {
			gravity: { y: 300 },
		},
	},
	scene: [FlappyBirdScene],
};
const game = new Phaser.Game(config);

export default game;
