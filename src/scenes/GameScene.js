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

        // Responsive layout
        this.isLandscape = true;
        this.isMobile = false;
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

        // Check device type and orientation
        this.checkDeviceAndOrientation();
    }

    checkDeviceAndOrientation() {
        // Check if mobile device
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Check orientation
        this.isLandscape = window.innerWidth > window.innerHeight;

        // Setup orientation change handler
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    handleResize() {
        // Update orientation flag
        const wasLandscape = this.isLandscape;
        this.isLandscape = window.innerWidth > window.innerHeight;

        // Only rebuild UI if orientation changed
        if (wasLandscape !== this.isLandscape) {
            // Remove existing UI elements
            this.cleanupUI();

            // Rebuild UI for new orientation
            this.setupGameArea();
            this.setupUI();
        }

        // Recalculate game over line
        this.gameOverLine = LAYOUT.gameOverLine(this.cameras.main.height);
    }

    cleanupUI() {
        if (this.inputField) this.inputField.destroy();
        if (this.cursor) this.cursor.destroy();
        if (this.scoreText) this.scoreText.destroy();
        if (this.numPad) {
            this.numPad.forEach(button => button.destroy());
        }
        if (this.deleteButton) this.deleteButton.destroy();
        if (this.enterButton) this.enterButton.destroy();
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
        // Set up game over line - adjust for different orientations
        const height = this.cameras.main.height;
        this.gameOverLine = this.isLandscape
            ? LAYOUT.gameOverLine(height)
            : height * 0.65; // Higher line in portrait mode to leave room for numpad

        // Add background - adjusted for responsiveness
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Add cockpit overlay - adjusted for different orientations
        if (this.isLandscape) {
            this.add.image(this.cameras.main.width / 2, this.cameras.main.height, 'cockpit')
                .setOrigin(0.5, 1)
                .setDisplaySize(this.cameras.main.width, this.cameras.main.height * 0.25);
        } else {
            // In portrait mode, use a different layout for the control panel
            const panelHeight = this.cameras.main.height * 0.35;
            this.add.rectangle(
                this.cameras.main.width / 2,
                this.cameras.main.height - panelHeight / 2,
                this.cameras.main.width,
                panelHeight,
                0x222222
            ).setOrigin(0.5, 0.5).setAlpha(0.8);
        }

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
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add score text - adjusted for different orientations
        this.scoreText = this.uiFactory.createScoreText(
            this.isLandscape ? width - 20 : width - 10,
            this.isLandscape ? 20 : 10,
            this.score
        );

        // Scale UI based on screen size
        const scale = Math.min(width / 1024, height / 768);
        this.scoreText.setFontSize(24 * scale);

        // Add input field - adjusted for different orientations
        const inputY = this.isLandscape
            ? height - 50
            : this.gameOverLine + (height - this.gameOverLine) * 0.25;

        const inputHandler = this.uiFactory.createInputField(
            width / 2,
            inputY,
            scale
        );

        this.inputField = inputHandler.inputField;
        this.cursor = inputHandler.cursor;
        this.updateCursorPosition = inputHandler.updateCursorPosition;

        // Add numpad for mobile devices
        if (this.isMobile || window.innerWidth < 768) {
            this.setupNumpad();
        }
    }

    setupNumpad() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Calculate button size and spacing based on screen dimensions
        const buttonSize = this.isLandscape
            ? Math.min(width / 12, height / 6)
            : Math.min(width / 8, height / 14);

        const padding = buttonSize * 0.2;
        const fontSize = Math.max(20, Math.min(32, buttonSize * 0.7));

        // Numpad layout depends on orientation
        let numpadX, numpadY, numpadWidth, numpadHeight, buttonSpacing;

        if (this.isLandscape) {
            // In landscape, place numpad at the right side
            numpadX = width - (buttonSize * 4) - padding;
            numpadY = height - (buttonSize * 4) - padding;
            buttonSpacing = buttonSize + padding;
        } else {
            // In portrait, place numpad at the bottom
            numpadX = width / 2 - (buttonSize * 1.5) - padding;
            numpadY = this.gameOverLine + (height - this.gameOverLine) * 0.5;
            buttonSpacing = buttonSize + padding;
        }

        this.numPad = [];

        // Create numpad buttons (0-9)
        for (let i = 1; i <= 9; i++) {
            const row = Math.floor((i - 1) / 3);
            const col = (i - 1) % 3;

            const button = this.add.text(
                numpadX + col * buttonSpacing,
                numpadY + row * buttonSpacing,
                i.toString(),
                {
                    fontFamily: 'Arial',
                    fontSize: fontSize,
                    color: '#ffffff',
                    backgroundColor: '#333333',
                    padding: { left: buttonSize * 0.3, right: buttonSize * 0.3, top: buttonSize * 0.2, bottom: buttonSize * 0.2 }
                }
            )
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => this.handleNumpadInput(i.toString()));

            this.numPad.push(button);
        }

        // Add '0' button
        const zeroButton = this.add.text(
            numpadX + 1 * buttonSpacing,
            numpadY + 3 * buttonSpacing,
            '0',
            {
                fontFamily: 'Arial',
                fontSize: fontSize,
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: { left: buttonSize * 0.3, right: buttonSize * 0.3, top: buttonSize * 0.2, bottom: buttonSize * 0.2 }
            }
        )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.handleNumpadInput('0'));

        this.numPad.push(zeroButton);

        // Add delete button
        this.deleteButton = this.add.text(
            numpadX + 0 * buttonSpacing,
            numpadY + 3 * buttonSpacing,
            '←',
            {
                fontFamily: 'Arial',
                fontSize: fontSize,
                color: '#ffffff',
                backgroundColor: '#aa3333',
                padding: { left: buttonSize * 0.3, right: buttonSize * 0.3, top: buttonSize * 0.2, bottom: buttonSize * 0.2 }
            }
        )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.handleDeleteInput());

        // Add enter button
        this.enterButton = this.add.text(
            numpadX + 2 * buttonSpacing,
            numpadY + 3 * buttonSpacing,
            '↵',
            {
                fontFamily: 'Arial',
                fontSize: fontSize,
                color: '#ffffff',
                backgroundColor: '#33aa33',
                padding: { left: buttonSize * 0.3, right: buttonSize * 0.3, top: buttonSize * 0.2, bottom: buttonSize * 0.2 }
            }
        )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.checkAnswer());
    }

    handleNumpadInput(value) {
        // Add number to answer text
        this.answerText += value;
        this.inputField.setText(this.answerText);
        this.updateCursorPosition();

        // Play sound feedback
        this.soundManager.playSound('click');
    }

    handleDeleteInput() {
        // Remove last character
        if (this.answerText.length > 0) {
            this.answerText = this.answerText.substring(0, this.answerText.length - 1);
            this.inputField.setText(this.answerText);
            this.updateCursorPosition();

            // Play sound feedback
            this.soundManager.playSound('click');
        }
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
            this.soundManager.playSound('click');
        }

        // Handle backspace
        if (event.keyCode === 8 && this.answerText.length > 0) {
            this.answerText = this.answerText.substring(0, this.answerText.length - 1);
            this.inputField.setText(this.answerText);
            this.updateCursorPosition();
            this.soundManager.playSound('click');
        }

        // Handle Enter key (submit answer)
        if (event.keyCode === 13 && this.answerText.length > 0) {
            this.checkAnswer();
        }
    }

    checkAnswer() {
        if (this.answerText.length === 0) {
            return;
        }

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

        // Play sound feedback
        if (correct) {
            this.soundManager.playSound('correct');
        } else {
            this.soundManager.playSound('wrong');
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

        // Remove event listeners
        window.removeEventListener('resize', this.handleResize.bind(this));

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
        // Check if it's time to increase speed
        if (this.gameTimeElapsed >= this.nextSpeedIncreaseTime) {
            // Increase monster speed
            this.monsterSpeedBase += GAME_PROGRESSION.speedIncreaseAmount;

            // Decrease spawn interval (to a minimum)
            this.monsterSpawnInterval = Math.max(
                GAME_PROGRESSION.minimumSpawnInterval,
                this.monsterSpawnInterval - GAME_PROGRESSION.spawnIntervalDecreaseAmount
            );

            // Schedule next speed increase
            this.nextSpeedIncreaseTime += GAME_PROGRESSION.speedIncreaseInterval;
        }
    }
} 