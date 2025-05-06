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

        // Add a semi-transparent overlay to improve text contrast
        this.add.rectangle(
            width / 2,
            height / 2,
            width * 0.8,
            height * 0.9,
            0x000000,
            0.4
        ).setOrigin(0.5);

        // Layout depends on orientation
        if (this.isLandscape) {
            // Landscape layout
            // Add title with glow effect
            const title = this.uiFactory.createTitle(
                width / 2,
                height * 0.2,
                'MATH MONSTER GAME'
            );

            // Add shine/glow effect to title
            this.tweens.add({
                targets: title,
                alpha: 0.8,
                duration: 1500,
                yoyo: true,
                repeat: -1
            });

            // Add instructions
            this.uiFactory.createSubtitle(
                width / 2,
                height * 0.35,
                'Solve math problems to defeat monsters\nbefore they reach the bottom of the screen!'
            );

            // Add play button - bigger with animation
            const playButton = this.uiFactory.createButton(
                width / 2,
                height * 0.55,
                'PLAY',
                '#0066cc',
                '#3399ff'
            ).on('pointerdown', () => {
                this.soundManager.playSound('click');
                this.startGame();
            });

            // Add scale animation to play button
            this.tweens.add({
                targets: playButton,
                scale: 1.05,
                duration: 1000,
                yoyo: true,
                repeat: -1
            });

            // Add difficulty selector
            const difficultySelector = this.uiFactory.createDifficultySelector(
                width / 2,
                height * 0.75,
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
            // Add title with glow effect
            const title = this.uiFactory.createTitle(
                width / 2,
                height * 0.15,
                'MATH MONSTER GAME'
            );

            // Add shine/glow effect to title
            this.tweens.add({
                targets: title,
                alpha: 0.8,
                duration: 1500,
                yoyo: true,
                repeat: -1
            });

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

            // Add scale animation to play button
            this.tweens.add({
                targets: playButton,
                scale: 1.05,
                duration: 1000,
                yoyo: true,
                repeat: -1
            });

            // Adjust button size for better touch targets on mobile
            if (this.isMobile) {
                // Make play button even bigger on mobile
                playButton.setFontSize(playButton.style.fontSize * 1.3);
                playButton.setStyle({
                    padding: { left: 50, right: 50, top: 35, bottom: 35 },
                    backgroundColor: '#0077dd'
                });
            }

            // Add difficulty selector - stacked vertically in portrait mode
            this.createVerticalDifficultySelector(width / 2, height * 0.55);
        }
    }

    createVerticalDifficultySelector(x, y) {
        // Create title text with better visibility
        const title = this.uiFactory.createSubtitle(
            x, y - 50,
            'Select Difficulty:'
        );

        const difficulties = ['Easy', 'Medium', 'Hard'];
        const buttons = [];
        const buttonSpacing = this.isMobile ? 90 : 70; // Increase spacing on mobile
        const scale = Math.min(this.cameras.main.width / 1024, this.cameras.main.height / 768);

        // Create a button for each difficulty level, stacked vertically
        difficulties.forEach((diff, index) => {
            const isSelected = diff === this.difficulty;
            const buttonY = y + (index * buttonSpacing);

            // Enhanced button style
            const buttonColor = isSelected ? '#555555' : '#333333';
            const borderColor = isSelected ? '#ffffff' : '#aaaaaa';
            const hoverColor = isSelected ? '#666666' : '#444444';

            // Create button background with border for better visibility
            const buttonBg = this.add.rectangle(
                x,
                buttonY,
                this.isMobile ? 180 : 140,
                this.isMobile ? 60 : 45,
                Phaser.Display.Color.HexStringToColor(buttonColor).color
            ).setOrigin(0.5);

            // Add border
            buttonBg.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(borderColor).color);

            // Make background interactive
            buttonBg.setInteractive({ useHandCursor: true });

            // Add hover effect
            buttonBg.on('pointerover', () => {
                buttonBg.setFillStyle(Phaser.Display.Color.HexStringToColor(hoverColor).color);
            });

            buttonBg.on('pointerout', () => {
                buttonBg.setFillStyle(Phaser.Display.Color.HexStringToColor(buttonColor).color);
            });

            const button = this.add.text(
                x,
                buttonY,
                diff,
                {
                    fontFamily: 'Arial',
                    fontSize: this.isMobile ? Math.round(32 * scale) : Math.round(28 * scale),
                    color: '#ffffff',
                    fontStyle: 'bold',
                    stroke: '#000000',
                    strokeThickness: 2
                }
            ).setOrigin(0.5);

            // Handle click event on background
            buttonBg.on('pointerdown', () => {
                // Update all buttons
                buttons.forEach((btn, idx) => {
                    btn.bg.setFillStyle(Phaser.Display.Color.HexStringToColor('#333333').color);
                    btn.bg.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor('#aaaaaa').color);
                });

                // Highlight selected button
                buttonBg.setFillStyle(Phaser.Display.Color.HexStringToColor('#555555').color);
                buttonBg.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor('#ffffff').color);

                this.difficulty = diff;
                this.soundManager.playSound('click');
                console.log('Difficulty set to:', diff);
            });

            buttons.push({ text: button, bg: buttonBg });
        });
    }

    startGame() {
        console.log('Starting game with difficulty:', this.difficulty);

        // Clean up event listeners
        window.removeEventListener('resize', this.handleResize.bind(this));

        this.scene.start('GameScene', { difficulty: this.difficulty });
    }
} 