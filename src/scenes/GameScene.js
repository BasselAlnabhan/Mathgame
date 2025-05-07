import Phaser from 'phaser';
import Monster from '../objects/Monster';
import MathProblem from '../objects/MathProblem';
import SoundManager from '../managers/SoundManager';
import UIFactory from '../managers/UIFactory';
import { DIFFICULTY_SETTINGS, OPERATION_RANGES, MONSTER_TYPES, GAME_PROGRESSION, POINTS, UI_STYLES, LAYOUT } from '../config/GameConfig';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        // Game state
        this.monsters = [];
        this.mathProblem = new MathProblem();
        this.score = 0;
        this.answerText = '';
        this.tries = 3; // Add tries counter
        this.problemsStats = {};

        // Game timing
        this.lastMonsterTime = 0;
        this.gameTimeElapsed = 0;
        this.nextSpeedIncreaseTime = GAME_PROGRESSION.speedIncreaseInterval;

        // Responsive layout
        this.isLandscape = true;
        this.isMobile = false;

        // Currently targeted monster for answer buttons
        this.currentTargetMonster = null;
    }

    init(data) {
        // Get difficulty from passed data or default to Medium
        this.difficulty = data.difficulty || 'Medium';
        console.log('GameScene initialized with difficulty:', this.difficulty);

        // Set difficulty for math problems
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

        // Recalculate game over line to match answer buttons
        this.gameOverLine = this.cameras.main.height - 70;
    }

    cleanupUI() {
        if (this.scoreText) this.scoreText.destroy();
        if (this.triesText) this.triesText.destroy();
        // Close any open modal
        this.closeAnswerModal();
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
        this.tries = 3; // Reset tries on game start
        this.problemsStats = {};
    }

    create() {
        console.log('GameScene: create method started');

        // Set up managers
        this.setupManagers();

        // Create game world
        this.setupBackground();

        // Create game UI
        this.setupUI();

        // Initialize game state
        this.resetGame();

        // Start playing background music
        this.soundManager.playMusic();

        console.log('GameScene: create method completed');
    }

    setupManagers() {
        this.soundManager = new SoundManager(this);
        this.soundManager.init();
        this.uiFactory = new UIFactory(this);
    }

    setupBackground() {
        // Set up game over line - using new LAYOUT function with orientation parameter
        const height = this.cameras.main.height;
        this.gameOverLine = this.cameras.main.height - 70;

        // Add background - adjusted for responsiveness
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Add cockpit overlay only in landscape mode
        if (this.isLandscape) {
            this.add.image(this.cameras.main.width / 2, this.cameras.main.height, 'cockpit')
                .setOrigin(0.5, 1)
                .setDisplaySize(this.cameras.main.width, this.cameras.main.height * 0.25);
        }
        // No alternate grey background in portrait mode

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

        // Get UI scale based on screen size
        const scale = LAYOUT.getUIScale(width, height);

        // Add score text - moved to left side of screen
        this.scoreText = this.add.text(
            20, // Left margin
            this.isLandscape ? 20 : 10,
            `Score: ${this.score}`,
            {
                fontFamily: 'Arial',
                fontSize: Math.round(28 * scale),
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3,
                fontStyle: 'bold'
            }
        ).setOrigin(0, 0); // Left aligned

        // Add tries/lives text (top right)
        this.triesText = this.add.text(
            width - 20,
            this.isLandscape ? 20 : 10,
            `Tries: ${this.tries}`,
            {
                fontFamily: 'Arial',
                fontSize: Math.round(28 * scale),
                color: '#ff5555',
                stroke: '#000000',
                strokeThickness: 3,
                fontStyle: 'bold',
                align: 'right'
            }
        ).setOrigin(1, 0);

        // Always use direct monster targeting and answer selection modal for all devices
        this.setupDirectTargeting();

        // After setting up the UI, set the game over line to the answer button Y position
        this.gameOverLine = height - 70;
    }

    setupDirectTargeting() {
        // Create a help text for new players (universal)
        const width = this.cameras.main.width;
        const scale = LAYOUT.getUIScale(width, this.cameras.main.height);
        const helpText = this.add.text(
            width / 2,
            40,
            "Select the answer for the nearest monster!",
            {
                fontFamily: 'Arial',
                fontSize: Math.round(18 * scale),
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3,
                padding: { x: 10, y: 5 },
                backgroundColor: '#00000066'
            }
        ).setOrigin(0.5, 0);
        // Fade out after 5 seconds
        this.tweens.add({
            targets: helpText,
            alpha: 0,
            delay: 5000,
            duration: 1000,
            onComplete: () => {
                helpText.destroy();
            }
        });
    }

    setupInput() {
        // Add keyboard input
        this.input.keyboard.on('keydown', this.handleKeyDown, this);
    }

    handleKeyDown(event) {
        // No keyboard input for answers anymore
        return;
    }

    checkAnswer() {
        // No manual answer input anymore
        return;
    }

    addMonster() {
        // Check if game is over
        if (this.gameOver) return;

        // Check maximum monsters
        if (this.monsters.length >= this.maxMonsters) {
            return;
        }

        // Get random monster type
        const monsterType = MONSTER_TYPES[Math.floor(Math.random() * MONSTER_TYPES.length)];

        // Generate a math problem based on difficulty
        const task = this.mathProblem.getNextProblem();

        // Use the current monster speed
        const speed = this.monsterSpeedBase;

        // Create monster
        const monster = new Monster(
            this,
            monsterType,
            task.text,
            task.result,
            speed,
            this.isLandscape
        );
        monster.operationType = task.operationType; // Store operation type

        // Always make the monster tappable and interactive
        monster.setInteractive({ useHandCursor: true });
        monster.on('pointerdown', () => {
            // Switch the answer modal to this monster
            if (this.currentTargetMonster !== monster) {
                this.currentTargetMonster = monster;
                this.createAnswerSelectionModal(monster);
            }
        });
        monster.on('pointerover', () => { monster.setAlpha(0.8); });
        monster.on('pointerout', () => { monster.setAlpha(1); });

        // Play monster sound
        monster.playSound();

        // Add to monsters array
        this.monsters.push(monster);

        // Log monster creation
        console.log(`Added ${monsterType} with problem: ${task.text} = ${task.result}, speed: ${speed}`);
    }

    // Helper method to check if a position is too close to existing monsters
    isPositionTooCloseToExistingMonster(x, minSpacing) {
        // Check if x position is too close to any existing monster
        for (const monster of this.monsters) {
            if (Math.abs(monster.x - x) < minSpacing) {
                return true;
            }
        }
        return false;
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
        this.scene.start('GameOverScene', { score: this.score, difficulty: this.difficulty, problemsStats: this.problemsStats });
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

        // Check if we need to update the targeted monster
        // This will select a new monster if the current one is gone
        this.updateTargetedMonster();

        // Spawn new monsters - ensure at least monsterSpawnInterval time has passed
        // since the game started or since the last monster was spawned
        const timeElapsedSinceLastMonster = time - this.lastMonsterTime;

        if (timeElapsedSinceLastMonster > this.monsterSpawnInterval &&
            this.monsters.length < this.maxMonsters) {
            // Make sure this is not the first update frame when game is starting
            // This prevents multiple monsters spawning at once on game start
            if (this.lastMonsterTime > 0 || this.gameTimeElapsed > 1000) {
                this.addMonster();
                this.lastMonsterTime = time;
            } else {
                // First monster - set the timestamp without spawning yet
                this.lastMonsterTime = time;
            }
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

    // Helper method to find the bottom-most monster and update target if needed
    updateTargetedMonster() {
        // If no monsters, clear the current target and buttons
        if (this.monsters.length === 0) {
            if (this.currentTargetMonster) {
                this.currentTargetMonster = null;
                this.closeAnswerModal();
            }
            return;
        }
        // If the current target is gone, or not set, default to the bottom-most monster
        if (!this.currentTargetMonster || !this.monsters.includes(this.currentTargetMonster)) {
            let bottomMonster = this.monsters[0];
            for (let i = 1; i < this.monsters.length; i++) {
                if (this.monsters[i].y > bottomMonster.y) {
                    bottomMonster = this.monsters[i];
                }
            }
            this.currentTargetMonster = bottomMonster;
            this.createAnswerSelectionModal(bottomMonster);
        }
        // If there is a current target, ensure the modal is visible for it
        else if (!this.modalElements || this.modalElements.length === 0) {
            this.createAnswerSelectionModal(this.currentTargetMonster);
        }
    }

    // Method to create an answer selection modal when a monster is tapped
    createAnswerSelectionModal(monster) {
        // Close existing modal first
        this.closeAnswerModal();

        // Get dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const scale = LAYOUT.getUIScale(width, height);

        // Initialize modal elements array - no background panel
        this.modalElements = [];

        // Create answer options for the modal
        this.createAnswerOptions(monster);
    }

    // Create answer options for the modal
    createAnswerOptions(monster) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const scale = LAYOUT.getUIScale(width, height);

        // Create an array of answers including the correct one
        const correctAnswer = monster.result;
        const answers = [correctAnswer];

        // Add incorrect options (±1-10 from correct answer)
        while (answers.length < 4) {
            const offset = Phaser.Math.Between(1, 10) * (Math.random() > 0.5 ? 1 : -1);
            const newAnswer = correctAnswer + offset;
            if (newAnswer > 0 && !answers.includes(newAnswer)) {
                answers.push(newAnswer);
            }
        }

        // Shuffle the answers
        Phaser.Utils.Array.Shuffle(answers);

        // Adjust button size for mobile
        let buttonWidth, buttonHeight, spacing, buttonY, fontSize;

        buttonWidth = Math.min(width * 0.2, 90);
        buttonHeight = Math.min(height * 0.08, 60);
        spacing = buttonWidth * 0.18;
        buttonY = height - 70;
        fontSize = Math.round(32 * scale);

        const buttonElements = [];

        // Calculate starting position 
        const totalWidth = (buttonWidth * 4) + (spacing * 3);
        let startX = (width - totalWidth) / 2;

        // Position buttons in a horizontal row at the bottom
        for (let i = 0; i < answers.length; i++) {
            const buttonX = startX + (i * (buttonWidth + spacing)) + buttonWidth / 2;

            // Enhanced button design
            const buttonColor = 0x444444;
            const button = this.add.rectangle(
                buttonX,
                buttonY,
                buttonWidth,
                buttonHeight,
                buttonColor,
                1
            ).setStrokeStyle(3, 0xffffff, 0.9);

            const buttonText = this.add.text(
                buttonX,
                buttonY,
                answers[i].toString(),
                {
                    fontFamily: 'Arial',
                    fontSize: fontSize,
                    color: '#ffffff',
                    align: 'center',
                    fontStyle: 'bold'
                }
            ).setOrigin(0.5);

            // Make button interactive
            button.setInteractive({ useHandCursor: true });

            // Enhanced visual feedback for mobile
            button.on('pointerover', () => {
                button.setFillStyle(0x66aaee);
                button.setScale(1.05);
                buttonText.setScale(1.05);
            });

            button.on('pointerout', () => {
                button.setFillStyle(0x4488cc);
                button.setScale(1);
                buttonText.setScale(1);
            });

            // Use operationType from monster
            let operationType = monster.operationType;

            // Handle button click
            button.on('pointerdown', () => {
                // Check if answer is correct
                if (answers[i] === correctAnswer) {
                    // Correct answer
                    this.score += monster.explode();
                    this.scoreText.setText(`Score: ${this.score}`);
                    this.soundManager.playSound('correct');

                    // Find and remove the monster from array
                    const index = this.monsters.indexOf(monster);
                    if (index > -1) {
                        this.monsters.splice(index, 1);
                    }

                    // Clear current target since it's destroyed
                    this.currentTargetMonster = null;

                    // Close modal
                    this.closeAnswerModal();

                    // Immediately find a new target if there are other monsters
                    if (this.monsters.length > 0) {
                        // Find the bottom-most monster
                        let bottomMonster = this.monsters[0];
                        for (let i = 1; i < this.monsters.length; i++) {
                            if (this.monsters[i].y > bottomMonster.y) {
                                bottomMonster = this.monsters[i];
                            }
                        }

                        // Set as new target and show its buttons
                        this.currentTargetMonster = bottomMonster;
                        this.createAnswerSelectionModal(bottomMonster);
                    }

                    // Track correct answer
                    if (operationType) {
                        if (!this.problemsStats[operationType]) this.problemsStats[operationType] = { correct: 0, wrong: 0 };
                        this.problemsStats[operationType].correct++;
                    }
                } else {
                    // Wrong answer
                    this.soundManager.playSound('wrong');
                    this.tries -= 1;
                    if (this.triesText) this.triesText.setText(`Tries: ${this.tries}`);
                    this.tweens.add({
                        targets: [button, buttonText],
                        alpha: 0.3,
                        scale: 0.95,
                        duration: 200,
                        yoyo: true,
                        repeat: 1
                    });
                    this.cameras.main.shake(100, 0.01);
                    // End game if out of tries
                    if (this.tries <= 0) {
                        this.endGame();
                    }

                    // Track wrong answer
                    if (operationType) {
                        if (!this.problemsStats[operationType]) this.problemsStats[operationType] = { correct: 0, wrong: 0 };
                        this.problemsStats[operationType].wrong++;
                    }
                }
            });

            buttonElements.push(button, buttonText);
        }

        // Add button elements to the modal elements array
        this.modalElements.push(...buttonElements);
    }

    // Helper to close the answer modal
    closeAnswerModal() {
        if (this.modalElements && this.modalElements.length > 0) {
            // Fade out and destroy all elements
            this.tweens.add({
                targets: this.modalElements,
                alpha: 0,
                duration: 200,
                onComplete: () => {
                    this.modalElements.forEach(element => {
                        if (element && element.destroy) {
                            element.destroy();
                        }
                    });
                    this.modalElements = [];
                }
            });
        }
    }

    resetGame() {
        console.log('Resetting game state');

        this.score = 0;
        this.scoreText.setText('Score: 0');

        // Reset all monster arrays
        this.monsters.forEach(monster => monster.destroy());
        this.monsters = [];

        // Clear any existing event timers
        if (this.monsterTimer) {
            this.monsterTimer.remove();
        }

        // Set up input handling
        this.setupInput();

        // Setup autoplay workaround for sound
        this.soundManager.setupAutoPlayWorkaround();

        // Add the first monster after a short delay
        this.time.delayedCall(1000, () => {
            this.addMonster();

            // Start monster spawn timer
            this.startMonsterTimer();
        });
    }

    startMonsterTimer() {
        // Use rule-based spawn timing
        const settings = DIFFICULTY_SETTINGS[this.difficulty];
        const spawnTime = settings.monsterSpawnInterval;

        this.monsterTimer = this.time.addEvent({
            delay: spawnTime,
            callback: this.addMonster,
            callbackScope: this,
            loop: true
        });
    }
} 