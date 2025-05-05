import Phaser from 'phaser';
import UIFactory from '../managers/UIFactory';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
        this.score = 0;
        this.difficulty = 'Easy';
    }

    init(data) {
        // Get score and difficulty from game scene
        if (data) {
            this.score = data.score || 0;
            this.difficulty = data.difficulty || 'Easy';
        }
    }

    create() {
        // Initialize UI factory
        this.uiFactory = new UIFactory(this);

        // Create background and UI
        this.setupBackground();
        this.setupUI();

        // Setup input handling for returning to menu
        this.setupInput();
    }

    setupBackground() {
        // Add game over background
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'gameover')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    }

    setupUI() {
        // Add game over text
        this.uiFactory.createTitle(
            this.cameras.main.width / 2,
            150,
            'GAME OVER'
        );

        // Add score text
        this.add.text(
            this.cameras.main.width / 2,
            250,
            `Score: ${this.score}`,
            {
                fontFamily: 'Arial',
                fontSize: 48,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        // Add difficulty text
        this.add.text(
            this.cameras.main.width / 2,
            320,
            `Difficulty: ${this.difficulty}`,
            {
                fontFamily: 'Arial',
                fontSize: 32,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5);

        // Add play again button
        this.uiFactory.createButton(
            this.cameras.main.width / 2,
            450,
            'PLAY AGAIN'
        ).on('pointerdown', () => this.scene.start('MenuScene'));

        // Add main menu button
        this.uiFactory.createButton(
            this.cameras.main.width / 2,
            550,
            'MAIN MENU',
            '#333333',
            '#555555'
        ).on('pointerdown', () => this.scene.start('MenuScene'));
    }

    setupInput() {
        // Also allow pressing any key to return to menu
        this.input.keyboard.on('keydown', () => {
            this.scene.start('MenuScene');
        });
    }
} 