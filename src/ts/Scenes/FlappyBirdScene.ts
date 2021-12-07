import Phaser from "phaser";
import game from "../main";

let bird: Phaser.Physics.Arcade.Sprite;
let base: Phaser.Physics.Arcade.Sprite;
let gapsGroup: Phaser.Physics.Arcade.Group;
let pipesGroup: Phaser.Physics.Arcade.Group | undefined;
let cursors: any;
let background: Phaser.GameObjects.Image;
let tileSprites: Phaser.GameObjects.TileSprite[];
let PIPES_TO_RENDER: number = 5;
let pipePositionY: number = 100;
let pipeDistance: number = 220;
let bottom_pipe: Phaser.Physics.Arcade.Sprite;
let top_pipe: Phaser.Physics.Arcade.Sprite;
let gameOver: boolean = false;
let gameOverBanner: Phaser.GameObjects.Image;
let pause;
let resume;
let restart_button: Phaser.GameObjects.Image;
let restart_screen;
let score;
let scoreGroup;
let gameStarted = false;
let nextPipes;

export default class FlappyBirdScene extends Phaser.Scene {
	constructor() {
		super("hello-world");
	}

	isKeyDown = false;
	isPause = false;

	preload() {
		this.load.spritesheet("backgroundDay", "assets/background-day.png", {
			frameWidth: 288,
			frameHeight: 512,
		});
		this.load.spritesheet("base", "assets/base.png", {
			frameWidth: 336,
			frameHeight: 112,
		});
		this.load.image("0", "assets/0.png");
		this.load.image("1", "assets/1.png");
		this.load.image("2", "assets/2.png");
		this.load.image("3", "assets/3.png");
		this.load.image("4", "assets/4.png");
		this.load.image("5", "assets/5.png");
		this.load.image("6", "assets/6.png");
		this.load.image("8", "assets/8.png");
		this.load.image("9", "assets/9.png");
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
		this.prepareGame(this);

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
		restart_button.on("pointerdown", () => {
			this.restartGame();
		});
		restart_button.setDepth(20);
		restart_button.visible = false;
		// Restart screen
		restart_screen = this.add
			.image(144, 150, "restart_screen")
			.setInteractive();
		restart_screen.on("pointerdown", this.startGame);
		restart_screen.setDepth(20);
		restart_screen.visible = false;

		// pause
		pause = this.add.image(250, 50, "pause").setInteractive();
		pause.on("pointerdown", () => {
			this.pauseGame();
		});
		pause.setDepth(20);

		// resume
		resume = this.add.image(250, 50, "resume").setInteractive();
		resume.on("pointerdown", () => {
			this.resumeGame();
		});
		resume.setDepth(20);
		resume.visible = false;
	}

	update() {
		if (cursors.space.isDown && this.isKeyDown === false) {
			this.isKeyDown = true;
			bird.setVelocityY(-350);
		}
		if (cursors.space.isUp) {
			this.isKeyDown = false;
		}

		pipesGroup.children.iterate((child) => {
			if (!child) return;
			if (child.body.gameObject.x < -50) child.destroy();
			else pipesGroup.setVelocityX(-pipeDistance);
		});
		gapsGroup.children.iterate((child) => {
			gapsGroup.setVelocityX(-pipeDistance);
		});

		nextPipes++;
		if (nextPipes === 130) {
			this.createPipe(game.scene.scenes[0]);
			nextPipes = 0;
		}
	}
	// Create pipe
	createPipe(scene) {
		// if (!gameStarted || gameOver) return;
		pipePositionY = Phaser.Math.Between(-100, 100);
		const gap: Phaser.GameObjects.Line = scene.add.line(
			500,
			pipeDistance + 210,
			0,
			0,
			98
		);
		// gapsGroup.add(gap);

		// top pipe
		top_pipe = pipesGroup.create(500, 0, "pipe");
		top_pipe.flipY = true;
		// bottom pipe
		bottom_pipe = pipesGroup.create(500, 0, "pipe");

		// Sets position for top pipe
		top_pipe.y = pipePositionY;
		// Sets position for bottom pipe
		bottom_pipe.y = top_pipe.y + 420;

		// callback placePipe function
		console.log(pipesGroup);

		// Sets the horizontal velocity of each Group pipe.
	}
	// getRightPipe execute pipesGroup loop and find max number from pipex to rightX(0)

	// handle collider
	handleConllider() {
		this.physics.pause();
		gameOver = true;
		gameStarted = false;

		pause.visible = false;
		bird.body.enable = false;

		gameOverBanner.visible = true;
		restart_button.visible = true;
	}

	// Update score
	updateScore() {
		score++;
		scoreGroup.clear(true, true);

		const scoreToString = score.toString();
		if (scoreToString.length == 1) {
			scoreGroup.create(144, 30, `${score}`).setDepth(10);
		} else {
			let initPos = 144 - (score.toString().length * 25) / 2;

			for (let i = 0; i < scoreToString.length; i++) {
				scoreGroup.create(initPos, 30, `${scoreToString[i]}`).setDepth(10);
				initPos += 25;
			}
		}
	}

	// restartGame
	restartGame() {
		bird.destroy();
		pipesGroup.clear(true, true);
		gapsGroup.clear(true, true);

		gameOverBanner.visible = false;
		restart_button.visible = false;
		restart_screen.visible = true;

		const gameScene: Phaser.Scene = game.scene.scenes[0];

		this.prepareGame(gameScene);

		console.log("restart game");

		gameScene.physics.resume();
	}

	prepareGame(gameScene) {
		console.log("prepare game");
		nextPipes = 0;
		// if (gameOver === false) return;
		// gameOver = false;

		// add background
		background = this.add.image(144, 256, "backgroundDay");
		// Create Pipes
		pipesGroup = this.physics.add.group({
			allowGravity: false,
		});
		// create Pipe
		this.createPipe(this);
		// add base
		base = this.physics.add.sprite(144, 458, "base");
		base.setCollideWorldBounds(true);
		base.setDepth(10);
		// tileSprites = [base];

		// Bird
		bird = this.physics.add.sprite(60, 256, "bluebird");

		// ngăn chặn hành vi người chơi chạy ra khỏi các cạnh của màn hình
		bird.setCollideWorldBounds(true);
		bird.setBounce(0.2);
		bird.setGravityY(1000); // Trọng lực

		// gaps group
		gapsGroup = this.physics.add.group();

		// Score group
		scoreGroup = this.physics.add.staticGroup();

		// collider event
		gameScene.physics.add.collider(
			bird,
			pipesGroup,
			() => {
				this.handleConllider();
			},
			null,
			this.scene
		);
		gameScene.physics.add.collider(
			bird,
			base,
			() => {
				this.handleConllider();
			},
			null,
			this.scene
		);
	}

	startGame() {
		if (gameStarted === false) return;
		gameStarted = true;
		restart_screen.visible = false;
	}

	pauseGame() {
		if (this.isPause === false) {
			this.isPause = true;
			pause.visible = false;
			resume.visible = true;
			pause.setActive(false);
			this.scene.pause();
		}
	}
	resumeGame() {
		if (this.isPause === true) {
			this.isPause = false;
			pause.visible = true;
			resume.visible = false;
			pause.setActive(true);
			bird.body.enable = true;
			this.scene.resume();

			// pipesGroup.destroy(false, false);
		}
	}
}
