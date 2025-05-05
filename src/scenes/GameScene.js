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

        // Currently targeted monster for answer buttons
        this.currentTargetMonster = null;
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

        // Recalculate game over line with the orientation parameter
        this.gameOverLine = LAYOUT.gameOverLine(this.cameras.main.height, this.isLandscape);
    }

    cleanupUI() {
        if (this.inputField) this.inputField.destroy();
        if (this.cursor) this.cursor.destroy();
        if (this.scoreText) this.scoreText.destroy();

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
        // Set up game over line - using new LAYOUT function with orientation parameter
        const height = this.cameras.main.height;
        this.gameOverLine = LAYOUT.gameOverLine(height, this.isLandscape);

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
                fontSize: Math.round(24 * scale),
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0, 0); // Left aligned

        // On mobile, we skip the traditional input field and use direct monster targeting instead
        if (this.isMobile || window.innerWidth < 768) {
            this.setupDirectTargeting();
        } else {
            // For desktop, keep the traditional input field
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
        }
    }

    setupDirectTargeting() {
        // We don't need to create a dedicated UI element here
        // Instead, we'll make the monsters directly tappable

        // No help text needed anymore
    }

    setupInput() {
        // Add keyboard input
        this.input.keyboard.on('keydown', this.handleKeyDown, this);
    }

    handleKeyDown(event) {
        // Skip keyboard handling on mobile
        if (this.isMobile || window.innerWidth < 768) {
            return;
        }

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

        // Calculate x position with spacing to avoid overlaps
        let x;
        let attempts = 0;
        const minSpacing = 120; // Minimum pixel distance between monsters

        do {
            x = Phaser.Math.Between(100, this.cameras.main.width - 100);
            attempts++;

            // Break after 5 attempts to avoid infinite loop
            if (attempts > 5) break;

        } while (this.isPositionTooCloseToExistingMonster(x, minSpacing));

        // Calculate the speed (increasing over time)
        const speedMultiplier = 1 + (this.gameTimeElapsed / 60000) * GAME_PROGRESSION.speedMultiplierPerMinute;
        // Apply orientation-based multiplier to ensure consistent timing
        const orientationMultiplier = LAYOUT.speedMultiplier(this.isLandscape);
        const speed = this.monsterSpeedBase * speedMultiplier * orientationMultiplier;

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

        // For mobile or small screens, make the monster tappable
        if (this.isMobile || window.innerWidth < 768) {
            monster.setInteractive({ useHandCursor: true });
            monster.on('pointerdown', () => this.handleMonsterTap(monster));

            // Add hover effect for visual feedback
            monster.on('pointerover', () => {
                monster.setAlpha(0.8);
            });

            monster.on('pointerout', () => {
                monster.setAlpha(1);
            });
        }

        // Play monster sound
        monster.playSound();

        // Add to monsters array
        this.monsters.push(monster);
    }

    // Helper method to check if a position is too close to existing monsters
    isPositionTooCloseToExistingMonster(x, minSpacing) {
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

        // If we don't have a target monster or the current target no longer exists,
        // find a new one (always target the bottom-most monster)
        if (!this.currentTargetMonster || !this.monsters.includes(this.currentTargetMonster)) {
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
    }

    // Modified handle monster tap to switch targets without toggling off
    handleMonsterTap(monster) {
        // Only switch if this is a different monster
        if (monster !== this.currentTargetMonster) {
            // Switch to this monster for targeting
            this.currentTargetMonster = monster;

            // Create answer selection modal for the new target
            this.createAnswerSelectionModal(monster);
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

        // Create answer buttons
        const buttonWidth = Math.min(width * 0.2, 80);
        const buttonHeight = Math.min(height * 0.07, 50);
        const spacing = buttonWidth * 0.2; // Reduce spacing between buttons
        const buttonElements = [];

        // Calculate starting position 
        const totalWidth = (buttonWidth * 4) + (spacing * 3);
        let startX = (width - totalWidth) / 2;
        const buttonY = height - 60; // Position buttons at bottom with fixed distance

        // Position buttons in a horizontal row at the bottom
        for (let i = 0; i < answers.length; i++) {
            const buttonX = startX + (i * (buttonWidth + spacing)) + buttonWidth / 2;

            const button = this.add.rectangle(
                buttonX,
                buttonY,
                buttonWidth,
                buttonHeight,
                0x444444,
                1
            ).setStrokeStyle(2, 0xffffff, 0.8);

            const buttonText = this.add.text(
                buttonX,
                buttonY,
                answers[i].toString(),
                {
                    fontFamily: 'Arial',
                    fontSize: Math.round(28 * scale),
                    color: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5);

            // Make button interactive
            button.setInteractive({ useHandCursor: true });

            // Add hover effect
            button.on('pointerover', () => {
                button.setFillStyle(0x666666);
            });

            button.on('pointerout', () => {
                button.setFillStyle(0x444444);
            });

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

                    // Close modal and let the update method set a new target
                    this.closeAnswerModal();
                } else {
                    // Wrong answer
                    this.soundManager.playSound('wrong');

                    // Visual feedback for wrong answer
                    this.tweens.add({
                        targets: [button, buttonText],
                        alpha: 0.3,
                        duration: 300,
                        yoyo: true,
                        repeat: 1
                    });
                }
            });

            buttonElements.push(button, buttonText);
        }

        // No close button needed anymore

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
} 