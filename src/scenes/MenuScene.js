import Phaser from 'phaser';
import UIFactory from '../managers/UIFactory';
import SoundManager from '../managers/SoundManager';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.difficulty = 'Easy'; // Default difficulty
        this.isLandscape = true;
        this.isMobile = false;
    }

    create() {
        console.log('MenuScene: create method started');

        // Initialize managers
        this.uiFactory = new UIFactory(this);
        this.soundManager = new SoundManager(this);
        this.soundManager.init();

        // Check device and orientation
        this.checkDeviceAndOrientation();

        // Create background and UI elements
        this.setupBackground();
        this.setupUI();

        // Start background music
        this.soundManager.playMusic();

        // Setup autoplay workaround
        this.soundManager.setupAutoPlayWorkaround();

        // Handle resize/orientation changes
        window.addEventListener('resize', this.handleResize.bind(this));

        console.log('MenuScene: create completed');
    }

    checkDeviceAndOrientation() {
        // Check if mobile device
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Check orientation
        this.isLandscape = window.innerWidth > window.innerHeight;

        console.log(`Device type: ${this.isMobile ? 'Mobile' : 'Desktop'}, Orientation: ${this.isLandscape ? 'Landscape' : 'Portrait'}`);
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
            this.setupUI();
        }
    }

    cleanupUI() {
        // Destroy all UI elements
        this.children.list.forEach(child => {
            if (child.type === 'Text' || child.type === 'Image') {
                child.destroy();
            }
        });

        // Re-add background
        this.setupBackground();
    }

    setupBackground() {
        // Add background
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    }

    setupUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const scale = Math.min(width / 1024, height / 768);

        // Layout depends on orientation
        if (this.isLandscape) {
            // Landscape layout
            // Add title
            this.uiFactory.createTitle(
                width / 2,
                height * 0.2,
                'MATH MONSTER GAME'
            );

            // Add instructions
            this.uiFactory.createSubtitle(
                width / 2,
                height * 0.35,
                'Solve math problems to defeat monsters\nbefore they reach the bottom of the screen!'
            );

            // Add play button
            const playButton = this.uiFactory.createButton(
                width / 2,
                height * 0.55,
                'PLAY'
            ).on('pointerdown', () => {
                this.soundManager.playSound('click');
                this.startGame();
            });

            // Add difficulty selector
            const difficultySelector = this.uiFactory.createDifficultySelector(
                width / 2,
                height * 0.7,
                ['Easy', 'Medium', 'Hard'],
                (difficulty) => {
                    this.difficulty = difficulty;
                    this.soundManager.playSound('click');
                    console.log('Difficulty set to:', difficulty);
                },
                this.difficulty // Use current difficulty
            );
        } else {
            // Portrait layout - adjust vertical spacing
            // Add title
            this.uiFactory.createTitle(
                width / 2,
                height * 0.15,
                'MATH MONSTER GAME'
            );

            // Add instructions - shorter in portrait mode
            this.uiFactory.createSubtitle(
                width / 2,
                height * 0.25,
                'Solve math problems to defeat monsters!'
            );

            // Add play button - bigger in portrait mode
            const playButton = this.uiFactory.createButton(
                width / 2,
                height * 0.4,
                'PLAY',
                '#0066cc',
                '#3399ff'
            ).on('pointerdown', () => {
                this.soundManager.playSound('click');
                this.startGame();
            });

            // Adjust button size for better touch targets on mobile
            if (this.isMobile) {
                playButton.setFontSize(playButton.style.fontSize * 1.3);
                playButton.setStyle({ padding: { left: 40, right: 40, top: 30, bottom: 30 } });
            }

            // Add difficulty selector - stacked vertically in portrait mode
            this.createVerticalDifficultySelector(width / 2, height * 0.55);
        }
    }

    createVerticalDifficultySelector(x, y) {
        // Create title text
        const title = this.uiFactory.createSubtitle(
            x, y - 40,
            'Select Difficulty:'
        );

        const difficulties = ['Easy', 'Medium', 'Hard'];
        const buttons = [];
        const buttonSpacing = 70;
        const scale = Math.min(this.cameras.main.width / 1024, this.cameras.main.height / 768);

        // Create a button for each difficulty level, stacked vertically
        difficulties.forEach((diff, index) => {
            const isSelected = diff === this.difficulty;
            const buttonY = y + (index * buttonSpacing);

            const button = this.add.text(
                x,
                buttonY,
                diff,
                {
                    fontFamily: 'Arial',
                    fontSize: 28 * scale,
                    color: '#ffffff',
                    backgroundColor: isSelected ? '#555555' : '#333333',
                    padding: {
                        left: Math.round(20 * scale),
                        right: Math.round(20 * scale),
                        top: Math.round(10 * scale),
                        bottom: Math.round(10 * scale)
                    }
                }
            )
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    // Update button styles
                    buttons.forEach(btn => btn.setStyle({ backgroundColor: '#333333' }));
                    button.setStyle({ backgroundColor: '#555555' });
                    this.difficulty = diff;
                    this.soundManager.playSound('click');
                    console.log('Difficulty set to:', diff);
                });

            buttons.push(button);
        });
    }

    startGame() {
        console.log('Starting game with difficulty:', this.difficulty);

        // Clean up event listeners
        window.removeEventListener('resize', this.handleResize.bind(this));

        this.scene.start('GameScene', { difficulty: this.difficulty });
    }
} 