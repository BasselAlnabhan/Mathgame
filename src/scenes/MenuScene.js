import Phaser from 'phaser';
import UIFactory from '../managers/UIFactory';
import SoundManager from '../managers/SoundManager';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.difficulty = 'Easy'; // Default difficulty
    }

    create() {
        console.log('MenuScene: create method started');

        // Initialize managers
        this.uiFactory = new UIFactory(this);
        this.soundManager = new SoundManager(this);
        this.soundManager.init();

        // Create background and UI elements
        this.setupBackground();
        this.setupUI();

        // Start background music
        this.soundManager.playMusic();

        // Setup autoplay workaround
        this.soundManager.setupAutoPlayWorkaround();

        console.log('MenuScene: create completed');
    }

    setupBackground() {
        // Add background
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    }

    setupUI() {
        // Add title
        this.uiFactory.createTitle(
            this.cameras.main.width / 2,
            150,
            'MATH MONSTER GAME'
        );

        // Add instructions
        this.uiFactory.createSubtitle(
            this.cameras.main.width / 2,
            250,
            'Solve math problems to defeat monsters\nbefore they reach the bottom of the screen!'
        );

        // Add play button
        const playButton = this.uiFactory.createButton(
            this.cameras.main.width / 2,
            400,
            'PLAY'
        ).on('pointerdown', () => this.startGame());

        // Add difficulty selector
        const difficultySelector = this.uiFactory.createDifficultySelector(
            this.cameras.main.width / 2,
            500,
            ['Easy', 'Medium', 'Hard'],
            (difficulty) => {
                this.difficulty = difficulty;
                console.log('Difficulty set to:', difficulty);
            },
            'Easy' // Default difficulty
        );
    }

    startGame() {
        console.log('Starting game with difficulty:', this.difficulty);
        this.scene.start('GameScene', { difficulty: this.difficulty });
    }
} 