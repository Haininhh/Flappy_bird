import Phaser from "phaser";
import game from "../main";

let gapsGroup: Phaser.Physics.Arcade.Group;
let pipesGroup: Phaser.Physics.Arcade.Group | undefined;
let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
let background: Phaser.GameObjects.Image;
let pipeDistance: number = 220;
let bottom_pipe: Phaser.Physics.Arcade.Sprite;
let top_pipe: Phaser.Physics.Arcade.Sprite;
let gameOver: boolean = false;
let gameOverBanner: Phaser.GameObjects.Image;
let restart_button: Phaser.GameObjects.Image;
// let start_screen: Phaser.GameObjects.Image;
let score: number = 0;
const assets = {
	scoreBoard: {
		number: "number",
		number0: "number0",
		number1: "number1",
		number2: "number2",
		number3: "number3",
		number4: "number4",
		number5: "number5",
		number6: "number6",
		number7: "number7",
		number8: "number8",
		number9: "number9",
	},
};
let gameStarted: boolean = true;
let nextPipes: number;

export default class FlappyBirdScene extends Phaser.Scene {
	constructor() {
		super("gameplay");
	}

	bird: Phaser.Physics.Arcade.Sprite;
	base: Phaser.Physics.Arcade.Sprite;
	isKeyDown = false;
	isMovedBird = true;
	upButton: Phaser.Input.Keyboard.Key;
	resume: Phaser.GameObjects.Image;
	pause: Phaser.GameObjects.Image;
	scoreboardGroup: Phaser.Physics.Arcade.StaticGroup;
	score0: Phaser.GameObjects.Image;

	preload() {
		this.load.spritesheet("backgroundDay", "assets/background-day.png", {
			frameWidth: 288,
			frameHeight: 512,
		});
		this.load.spritesheet("base", "assets/base.png", {
			frameWidth: 288,
			frameHeight: 112,
		});
		this.load.image(assets.scoreBoard.number0, "assets/0.png");
		this.load.image(assets.scoreBoard.number1, "assets/1.png");
		this.load.image(assets.scoreBoard.number2, "assets/2.png");
		this.load.image(assets.scoreBoard.number3, "assets/3.png");
		this.load.image(assets.scoreBoard.number4, "assets/4.png");
		this.load.image(assets.scoreBoard.number5, "assets/5.png");
		this.load.image(assets.scoreBoard.number6, "assets/6.png");
		this.load.image(assets.scoreBoard.number7, "assets/7.png");
		this.load.image(assets.scoreBoard.number8, "assets/8.png");
		this.load.image(assets.scoreBoard.number9, "assets/9.png");
		this.load.image("bluebird", "assets/bluebird-midflap.png");
		this.load.image("pipe", "assets/pipe-red.png");
		// Game Over
		this.load.image("gameover", "assets/gameover.png");
		// Restart
		this.load.image("restart_button", "assets/restart-button.png");
		this.load.image("start_screen", "assets/message.png");
		// Pause + Play
		this.load.image("pause", "assets/pause.png");
		this.load.image("resume", "assets/play.png");
	}

	create() {
		// add background
		background = this.add.image(144, 256, "backgroundDay").setInteractive();
		background.on("pointerdown", () => {
			this.scene.resume();
			this.moveBird();
		});

		// add base
		this.base = this.physics.add.sprite(144, 458, "base");
		this.base.setCollideWorldBounds(true);
		this.base.setDepth(10);

		// Ground animations
		this.anims.create({
			key: "moving-base",
			frames: this.anims.generateFrameNumbers("base", {
				start: 0,
				end: 2,
			}),
			frameRate: 15,
			repeat: -1,
		});

		this.anims.create({
			key: "stop-base",
			frames: [
				{
					key: "base",
					frame: 0,
				},
			],
			frameRate: 20,
		});

		// Create Pipes
		pipesGroup = this.physics.add.group({
			allowGravity: false,
		});

		// gaps group
		gapsGroup = this.physics.add.group({
			allowGravity: false,
		});

		// score group
		this.scoreboardGroup = this.physics.add.staticGroup();

		// keyboard event
		cursors = this.input.keyboard.createCursorKeys();
		this.upButton = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.UP
		);

		// prepare game
		this.prepareGame(this);

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

		// pause
		this.pause = this.add.image(250, 50, "pause").setInteractive();
		this.pause.setDepth(20);
		this.pause.visible = false;
		this.pause.on("pointerdown", () => {
			this.scene.pause();
			this.scene.launch("resumeGame");
		});

		// score 0
		this.score0 = this.scoreboardGroup.create(
			144,
			30,
			assets.scoreBoard.number0
		);
		this.score0.setDepth(20);
	}

	update() {
		if (gameOver || !gameStarted) return;

		if (
			(cursors.space.isDown && this.isKeyDown === false) ||
			Phaser.Input.Keyboard.JustDown(this.upButton)
		) {
			this.isKeyDown = true;
			this.moveBird();
		} else if (cursors.space.isUp) {
			this.isKeyDown = false;
			if (nextPipes === 10)
				(this.bird.body as Phaser.Physics.Arcade.Body).allowGravity = true;
			this.bird.setGravityY(1000);
		}

		pipesGroup.children.iterate((child) => {
			if (!child) return;
			if (child.body.gameObject.x < -50) child.destroy();
			else pipesGroup.setVelocityX(-pipeDistance);
		});

		gapsGroup.children.iterate((child) => {
			(child.body as Phaser.Physics.Arcade.Body).setVelocityX(-pipeDistance);
		});

		nextPipes++;
		if (nextPipes === 60) {
			this.createPipe(game.scene.scenes[0]);
			nextPipes = 0;
		}
	}

	// Create pipe
	createPipe(scene: Phaser.Scene) {
		if (!gameStarted || gameOver) return;

		// Random position Y
		const pipePositionY: number = Phaser.Math.Between(-100, 100);

		// add gap
		const gap: Phaser.GameObjects.Line = scene.add.line(
			500,
			pipePositionY + 210,
			0,
			0,
			0,
			98
		);
		gapsGroup.add(gap);

		// top pipe
		top_pipe = pipesGroup.create(500, pipePositionY, "pipe");
		top_pipe.flipY = true;
		// bottom pipe
		bottom_pipe = pipesGroup.create(500, pipePositionY + 420, "pipe");
	}

	// handle collider
	handleConllider() {
		this.physics.pause();
		this.pause.visible = false;

		gameOver = true;
		gameStarted = false;

		this.bird.body.enable = false;
		const a = this.base.anims.play("stop-base");
		console.log("stop: ", a);

		gameOverBanner.visible = true;
		restart_button.visible = true;
	}

	// Update score
	updateScore(_, gap) {
		score++;
		gap.destroy();

		this.scoreboardGroup.clear(true, true);

		const scoreToString = score.toString();
		if (scoreToString.length == 1) {
			this.scoreboardGroup
				.create(144, 30, assets.scoreBoard.number + score)
				.setDepth(10);
		} else {
			let initialPosition = 144 - (score.toString().length * 25) / 2;

			for (let i = 0; i < scoreToString.length; i++) {
				this.scoreboardGroup
					.create(
						initialPosition,
						30,
						assets.scoreBoard.number + scoreToString[i]
					)
					.setDepth(10);
				initialPosition += 25;
			}
		}
	}

	// restartGame
	restartGame() {
		console.log("restart game");

		this.bird.destroy();
		pipesGroup.clear(true, true);
		gapsGroup.clear(true, true);
		this.scoreboardGroup.clear(true, true);

		gameOverBanner.visible = false;
		restart_button.visible = false;

		const gameScene: Phaser.Scene = game.scene.scenes[0];

		this.prepareGame(gameScene);

		gameScene.physics.resume();

		this.moveBird();
		this.startGame(gameScene);
	}

	prepareGame(gameScene: Phaser.Scene) {
		nextPipes = 0;
		gameOver = false;
		score = 0;

		// Bird
		this.bird = gameScene.physics.add.sprite(60, 256, "bluebird");

		// ngăn chặn hành vi người chơi chạy ra khỏi các cạnh của màn hình
		this.bird.setCollideWorldBounds(true);
		this.bird.setBounce(0.2);
		(this.bird.body as Phaser.Physics.Arcade.Body).allowGravity = false;

		// collider event
		gameScene.physics.add.collider(
			this.bird,
			pipesGroup,
			() => {
				this.handleConllider();
			},
			null,
			gameScene
		);
		gameScene.physics.add.collider(
			this.bird,
			this.base,
			() => {
				this.handleConllider();
			},
			null,
			gameScene
		);
		gameScene.physics.add.overlap(
			this.bird,
			gapsGroup,
			this.updateScore,
			null,
			gameScene
		);
		this.scene.pause("gameplay");
		this.scene.launch("startGame");
	}
	moveBird() {
		if (gameOver) return;
		this.bird.setGravityY(1000); // Trọng lực
		this.bird.setVelocityY(-350);
		(this.bird.body as Phaser.Physics.Arcade.Body).allowGravity = true;
	}

	startGame(scene) {
		this.pause.setVisible(true);
		gameStarted = true;
		const a = this.base.anims.play("moving-base", true);
		console.log("anims: ", a);

		this.scoreboardGroup.clear(true, true);

		this.score0 = this.scoreboardGroup.create(
			144,
			30,
			assets.scoreBoard.number0
		);
		this.score0.setDepth(20);
		// create Pipe
		this.createPipe(scene);
	}
}
