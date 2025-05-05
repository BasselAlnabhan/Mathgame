import Phaser from 'phaser';
import Monster from '../objects/Monster';
import MathProblem from '../objects/MathProblem';
import SoundManager from '../managers/SoundManager';
import UIFactory from '../managers/UIFactory';
import { DIFFICULTY_SETTINGS, MONSTER_TYPES, GAME_PROGRESSION, LAYOUT } from '../config/GameConfig';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        // Game state
        this.monsters = [];
        this.mathProblem = new MathProblem();
        this.score = 0;
        this.answerText = '';

        // Game timing
        this.lastMonsterTime = 0;
        this.gameTimeElapsed = 0;
        this.nextSpeedIncreaseTime = GAME_PROGRESSION.speedIncreaseInterval;
    }

    init(data) {
        // Set difficulty from menu scene
        this.difficulty = data?.difficulty || 'Easy';
        this.mathProblem.setDifficulty(this.difficulty);

        // Get settings based on difficulty
        const settings = DIFFICULTY_SETTINGS[this.difficulty];
        this.monsterSpawnInterval = settings.monsterSpawnInterval;
        this.monsterSpeedBase = settings.monsterSpeedBase;
        this.maxMonsters = settings.maxMonsters;

        // Reset game state
        this.resetGameState();
    }

    resetGameState() {
        this.monsters = [];
        this.score = 0;
        this.answerText = '';
        this.gameTimeElapsed = 0;
        this.lastMonsterTime = 0;
        this.nextSpeedIncreaseTime = GAME_PROGRESSION.speedIncreaseInterval;
    }

    create() {
        // Setup managers
        this.soundManager = new SoundManager(this);
        this.soundManager.init();
        this.uiFactory = new UIFactory(this);

        // Set up game area
        this.setupGameArea();

        // Setup user interface
        this.setupUI();

        // Setup input handling
        this.setupInput();

        // Add the first monster
        this.addMonster();

        // Start background music
        this.soundManager.playMusic();

        // Setup autoplay workaround
        this.soundManager.setupAutoPlayWorkaround();
    }

    setupGameArea() {
        // Set up game over line
        this.gameOverLine = LAYOUT.gameOverLine(this.cameras.main.height);

        // Add background
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Add cockpit overlay at the bottom
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height, 'cockpit')
            .setOrigin(0.5, 1)
            .setDisplaySize(this.cameras.main.width, 200);

        // Debug: show game over line
        if (this.game.config.physics.arcade.debug) {
            this.add.line(
                0,
                this.gameOverLine,
                0,
                this.gameOverLine,
                this.cameras.main.width,
                this.gameOverLine,
                0xff0000
            ).setOrigin(0);
        }
    }

    setupUI() {
        // Add score text
        this.scoreText = this.uiFactory.createScoreText(
            this.cameras.main.width - 20,
            20,
            this.score
        );

        // Add input field
        const inputHandler = this.uiFactory.createInputField(
            this.cameras.main.width / 2,
            this.cameras.main.height - 50
        );

        this.inputField = inputHandler.inputField;
        this.cursor = inputHandler.cursor;
        this.updateCursorPosition = inputHandler.updateCursorPosition;
    }

    setupInput() {
        // Add keyboard input
        this.input.keyboard.on('keydown', this.handleKeyDown, this);
    }

    handleKeyDown(event) {
        // Handle numeric input (0-9)
        if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105)) {
            const number = event.keyCode >= 96 ? event.keyCode - 96 : event.keyCode - 48;
            this.answerText += number.toString();
            this.inputField.setText(this.answerText);
            this.updateCursorPosition();
        }

        // Handle backspace
        if (event.keyCode === 8 && this.answerText.length > 0) {
            this.answerText = this.answerText.substring(0, this.answerText.length - 1);
            this.inputField.setText(this.answerText);
            this.updateCursorPosition();
        }

        // Handle Enter key (submit answer)
        if (event.keyCode === 13 && this.answerText.length > 0) {
            this.checkAnswer();
        }
    }

    checkAnswer() {
        const answer = parseInt(this.answerText);
        let correct = false;

        // Check if the answer matches any monster
        for (let i = 0; i < this.monsters.length; i++) {
            if (answer === this.monsters[i].result) {
                // Correct answer
                this.score += this.monsters[i].explode();
                this.scoreText.setText(`Score: ${this.score}`);
                correct = true;
                this.monsters.splice(i, 1);
                break;
            }
        }

        // Clear input regardless of correct or not
        this.answerText = '';
        this.inputField.setText('');
        this.updateCursorPosition();
    }

    addMonster() {
        // Don't add more monsters if at max
        if (this.monsters.length >= this.maxMonsters) {
            return;
        }

        // Generate a math problem
        const problem = this.mathProblem.getNextProblem();

        // Select a random monster type
        const monsterType = MONSTER_TYPES[Phaser.Math.Between(0, MONSTER_TYPES.length - 1)];

        // Calculate a random x position
        const x = Phaser.Math.Between(100, this.cameras.main.width - 100);

        // Calculate the speed (increasing over time)
        const speedMultiplier = 1 + (this.gameTimeElapsed / 60000) * GAME_PROGRESSION.speedMultiplierPerMinute;
        const speed = this.monsterSpeedBase * speedMultiplier;

        // Create the monster
        const monster = new Monster(
            this,
            x,
            -50, // Start above the screen
            monsterType,
            speed,
            problem.text,
            problem.result
        );

        // Play monster sound
        monster.playSound();

        // Add to monsters array
        this.monsters.push(monster);
    }

    checkGameOver() {
        // Check if any monsters have reached the game over line
        for (const monster of this.monsters) {
            if (monster.getBottom() >= this.gameOverLine) {
                this.endGame();
                return true;
            }
        }
        return false;
    }

    endGame() {
        // Stop all monsters
        this.monsters.forEach(monster => {
            monster.speed = 0;
        });

        // Stop keyboard input
        this.input.keyboard.off('keydown', this.handleKeyDown, this);

        // Go to game over scene
        this.scene.start('GameOverScene', { score: this.score, difficulty: this.difficulty });
    }

    update(time, delta) {
        // Update game time
        this.gameTimeElapsed += delta;

        // Check for game over
        if (this.checkGameOver()) {
            return;
        }

        // Update all monsters
        this.monsters.forEach(monster => monster.update());

        // Spawn new monsters
        if (time - this.lastMonsterTime > this.monsterSpawnInterval && this.monsters.length < this.maxMonsters) {
            this.addMonster();
            this.lastMonsterTime = time;
        }

        // Increase difficulty over time
        this.increaseDifficultyOverTime();
    }

    increaseDifficultyOverTime() {
        if (this.gameTimeElapsed >= this.nextSpeedIncreaseTime) {
            // Increase monster speed
            this.monsterSpeedBase += GAME_PROGRESSION.speedIncreaseAmount;

            // Decrease spawn interval (but not below minimum)
            this.monsterSpawnInterval = Math.max(
                GAME_PROGRESSION.minimumSpawnInterval,
                this.monsterSpawnInterval - GAME_PROGRESSION.spawnIntervalDecreaseAmount
            );

            // Set next increase time
            this.nextSpeedIncreaseTime += GAME_PROGRESSION.speedIncreaseInterval;
        }
    }
} 