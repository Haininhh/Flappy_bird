import Phaser from "phaser";
import game from "../main";

let bird: any;
let pipe: any;
let base: any;
let cursors: any;
let background: any;
const PIPES_TO_RENDER = 100;
let bottom_pipe: any[] = [];
let top_pipe: any[] = [];
let gameOver: boolean = false;
let gameOverBanner;
let pause;
let resume;
let restart_button;
let restart_screen;
let distance;
let xPos = 0; //distance between columns
let firstRandomNumber;
let offset; // random number from -100 to 100
let initOffsetY: number[] = [];
let gameStarted;

export default class FlappyBirdScene extends Phaser.Scene {
	constructor() {
		super("hello-world");
	}

	isKeyDown = false;
	isPause = false;

	preload() {
		this.load.image("backgroundDay", "assets/background-day.png");
		this.load.image("0", "assets/0.png");
		this.load.image("1", "assets/1.png");
		this.load.image("2", "assets/2.png");
		this.load.image("3", "assets/3.png");
		this.load.image("4", "assets/4.png");
		this.load.image("5", "assets/5.png");
		this.load.image("6", "assets/6.png");
		this.load.image("8", "assets/8.png");
		this.load.image("9", "assets/9.png");
		this.load.image("base", "assets/base.png");
		this.load.image("bluebird", "assets/bluebird-midflap.png");
		this.load.image("pipe", "assets/pipe-red.png");
		// Game Over
		this.load.image("gameover", "assets/gameover.png");
		// Restart
		this.load.image("restart_button", "assets/restart-button.png");
		this.load.image("restart_screen", "assets/message.png");
		// Pause + Play
		this.load.image("pause", "assets/pause.png");
		this.load.image("resume", "assets/play.png");
	}

	create() {
		// add background and base
		background = this.add.image(144, 256, "backgroundDay").setInteractive();
		background.on("pointerdown", this.prepareGame);
		this.createPipe(); // create Pipe
		base = this.physics.add.sprite(144, 460, "base");
		base.setCollideWorldBounds(true);
		base.setDepth(10);
		// Bird
		bird = this.physics.add.sprite(60, 256, "bluebird");

		// ngăn chặn hành vi người chơi chạy ra khỏi các cạnh của màn hình
		bird.setCollideWorldBounds(true);
		bird.setBounce(0.2);
		bird.setGravityY(1000); // Trọng lực

		// keyboard event
		cursors = this.input.keyboard.createCursorKeys();

		// Game Over
		gameOverBanner = this.add.image(144, 150, "gameover");
		gameOverBanner.setDepth(20);
		gameOverBanner.visible = false;
		// Restart Button
		restart_button = this.add
			.image(144, 220, "restart_button")
			.setInteractive();
		restart_button.on("pointerdown", this.restartGame);
		restart_button.setDepth(20);
		restart_button.visible = false;
		// Restart screen
		restart_screen = this.add
			.image(144, 150, "restart_screen")
			.setInteractive();
		restart_screen.on("pointerdown", this.prepareGame);
		restart_screen.setDepth(20);
		restart_screen.visible = false;

		// pause
		pause = this.add.image(250, 50, "pause").setInteractive();
		pause.on("pointerdown", this.pauseGame);
		pause.setDepth(20);

		// resume
		resume = this.add.image(250, 50, "resume").setInteractive();
		pause.on("pointerdown", this.resumeGame);
		resume.setDepth(20);
		resume.visible = false;

		// collider event
		this.physics.add.collider(bird, bottom_pipe, this.handleConllider);
		this.physics.add.collider(bird, top_pipe, this.handleConllider);
		this.physics.add.collider(bird, base, this.handleConllider);
	}

	update() {
		if (cursors.space.isDown && this.isKeyDown === false) {
			this.isKeyDown = true;
			bird.setVelocityY(-350);
		}
		if (cursors.space.isUp) {
			this.isKeyDown = false;
		}
	}

	createPipe() {
		for (let i = 0; i < PIPES_TO_RENDER; i++) {
			firstRandomNumber = Math.floor(Math.random() * 10) + 1;
			if (firstRandomNumber < 6) {
				// add random positive number to pipe's new y position
				initOffsetY[i] = Math.floor(Math.random() * 10) * 10;
			} else {
				// add random negative number to pipe's new y position
				initOffsetY[i] = Math.floor(Math.random() * 10) * -10;
			}
		}

		// Create Top Pipes
		for (let i = 0; i < PIPES_TO_RENDER; i++) {
			offset = initOffsetY[i];
			// 800 + xPos: distance from bird to first column
			// -20 + offset: distance from top background
			top_pipe[i] = this.physics.add.sprite(800 + xPos, -20 + offset, "pipe");
			top_pipe[i].body.setAllowGravity(false);
			top_pipe[i].body.setVelocityX(-200);
			top_pipe[i].immovable = true; // won't move at all(bất di bất dịch)
			top_pipe[i].flipY = true; // Pipe will be flipped upside down(lật ngược lại)
			xPos += 220; //distance between columns
		}

		// Create Bottom Pipes
		xPos = 0; // reset xPos back to zero

		for (let i = 0; i < PIPES_TO_RENDER; i++) {
			offset = initOffsetY[i];
			// 800 + xPos: distance from bird to first column
			// 400 + offset: distance from bottom background
			bottom_pipe[i] = this.physics.add.sprite(
				800 + xPos,
				400 + offset,
				"pipe"
			);
			bottom_pipe[i].body.setAllowGravity(false);
			bottom_pipe[i].body.setVelocityX(-200);
			bottom_pipe[i].immovable = true; // won't move at all(bất di bất dịch)
			xPos += 220; //distance between columns
		}
	}

	handleConllider() {
		gameOver = true;
		pause.visible = false;
		bird.body.enable = false;
		for (let i = 0; i < PIPES_TO_RENDER; i++) {
			top_pipe[i].body.enable = false;
			bottom_pipe[i].body.enable = false;
		}
		gameOverBanner.visible = true;
		restart_button.visible = true;
	}

	// restartGame
	restartGame() {
		bird.destroy();
		for (let i = 0; i < PIPES_TO_RENDER; i++) {
			top_pipe[i].destroy();
			bottom_pipe[i].destroy();
		}
		gameOver = false;
		gameOverBanner.visible = false;
		restart_button.visible = false;
		restart_screen.visible = true;

		const gameScene = game.scene.scenes[0];
		() => {
			this.prepareGame(gameScene);
		};
		gameScene.physics.resume();
	}

	prepareGame(scene) {
		if (gameOver) return;
		restart_screen.visible = false;

		// bird = scene.physics.add.sprite(60, 256, "bluebird");
		console.log(scene);

		bird.setCollideWorldBounds(true);
		bird.setBounce(0.2);
		bird.setGravityY(1000); // Trọng lực

		scene.createPipe();

		scene.physics.add.collider(
			bird,
			bottom_pipe,
			this.handleConllider,
			null,
			scene
		);
		scene.physics.add.collider(
			bird,
			top_pipe,
			this.handleConllider,
			null,
			scene
		);
		scene.physics.add.collider(bird, base, this.handleConllider, null, scene);
	}

	startGame() {
		gameStarted = true;
		restart_screen.visible = false;
		this.createPipe();
	}

	pauseGame() {
		// pause.visible = false;
		// resume.visible = true;

		bird.body.moves = !bird.body.moves;
		for (let i = 0; i < PIPES_TO_RENDER; i++) {
			top_pipe[i].body.moves = !top_pipe[i].body.moves;
			bottom_pipe[i].body.moves = !bottom_pipe[i].body.moves;
		}
	}
	resumeGame() {
		// pause.visible = true;
		// resume.visible = false;
		// bird.body.moves = true;
		// for (let i = 0; i < PIPES_TO_RENDER; i++) {
		// 	top_pipe[i].body.moves = true;
		// 	bottom_pipe[i].body.moves = true;
		// }
	}
}
