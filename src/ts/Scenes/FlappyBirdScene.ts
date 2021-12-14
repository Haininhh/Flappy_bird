import Phaser from "phaser";
import game from "../main";

let bird: any;
let base: Phaser.Physics.Arcade.Sprite;
let gapsGroup: Phaser.Physics.Arcade.Group;
let pipesGroup: Phaser.Physics.Arcade.Group | undefined;
let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
let background: Phaser.GameObjects.Image;
let tileSprites: Phaser.GameObjects.TileSprite[];
let PIPES_TO_RENDER: number = 5;
let pipePositionY: number = 100;
let pipeDistance: number = 220;
let bottom_pipe: Phaser.Physics.Arcade.Sprite;
let top_pipe: Phaser.Physics.Arcade.Sprite;
let gameOver: boolean = false;
let gameOverBanner: Phaser.GameObjects.Image;
let restart_button: Phaser.GameObjects.Image;
// let start_screen: Phaser.GameObjects.Image;
let score;
let scoreGroup;
let gameStarted: boolean = true;
let nextPipes: number;

export default class FlappyBirdScene extends Phaser.Scene {
	constructor() {
		super("gameplay");
	}

	isKeyDown = false;
	isMovedBird = true;
	gap: Phaser.GameObjects.Line;
	upButton: Phaser.Input.Keyboard.Key;
	resume: Phaser.GameObjects.Image;
	pause: Phaser.GameObjects.Image;

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
		base = this.physics.add.sprite(144, 458, "base");
		base.setCollideWorldBounds(true);
		base.setDepth(10);

		// Create Pipes
		pipesGroup = this.physics.add.group({
			allowGravity: false,
		});

		// gaps group
		gapsGroup = this.physics.add.group({
			allowGravity: false,
		});

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
			if (nextPipes === 10) bird.body.allowGravity = true;
			bird.setGravityY(1000);
		}

		pipesGroup.children.iterate((child) => {
			if (!child) return;
			if (child.body.gameObject.x < -50) child.destroy();
			else pipesGroup.setVelocityX(-pipeDistance);
		});

		gapsGroup.children.iterate((child) => {
			child.body.gameObject.body.setVelocityX(-pipeDistance);
		});

		nextPipes++;
		if (nextPipes === 60) {
			this.createPipe(game.scene.scenes[0]);
			nextPipes = 0;
		}
	}

	// Create pipe
	createPipe(scene) {
		if (!gameStarted || gameOver) return;

		// Random position Y
		pipePositionY = Phaser.Math.Between(-100, 100);

		// top pipe
		top_pipe = pipesGroup.create(500, 0, "pipe");
		top_pipe.flipY = true;
		// bottom pipe
		bottom_pipe = pipesGroup.create(500, 0, "pipe");

		// Sets position for top pipe
		top_pipe.y = pipePositionY;
		// Sets position for bottom pipe
		bottom_pipe.y = top_pipe.y + 420;

		// add gap
		this.gap = scene.add.line(500, pipeDistance + 210, 0, 0, 0, 98);
		gapsGroup.add(this.gap);
		this.gap.visible = false;
		this.gap.body.gameObject.body.allowGravity = false;
	}
	// getRightPipe execute pipesGroup loop and find max number from pipex to rightX(0)

	// handle collider
	handleConllider() {
		this.physics.pause();
		this.pause.visible = false;

		gameOver = true;
		gameStarted = false;

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
		console.log("restart game");

		bird.destroy();
		pipesGroup.clear(true, true);
		gapsGroup.clear(true, true);

		gameOverBanner.visible = false;
		restart_button.visible = false;

		const gameScene: Phaser.Scene = game.scene.scenes[0];

		this.prepareGame(gameScene);

		gameScene.physics.resume();

		this.moveBird();
		this.startGame(gameScene);
	}

	prepareGame(gameScene: Phaser.Scene) {
		console.log("prepare game");
		nextPipes = 0;
		gameOver = false;

		// Bird
		bird = gameScene.physics.add.sprite(60, 256, "bluebird");

		// ngăn chặn hành vi người chơi chạy ra khỏi các cạnh của màn hình
		bird.setCollideWorldBounds(true);
		bird.setBounce(0.2);
		bird.body.allowGravity = false;

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

		this.scene.pause("gameplay");
		this.scene.launch("startGame");
	}
	moveBird() {
		if (gameOver) return;
		bird.setGravityY(1000); // Trọng lực
		bird.setVelocityY(-350);
		bird.body.allowGravity = true;
	}

	startGame(scene) {
		console.log("start game");

		this.pause.setVisible(true);
		gameStarted = true;

		// create Pipe
		this.createPipe(scene);
	}
}
