import Phaser from 'phaser';
import UIFactory from '../managers/UIFactory';
import SoundManager from '../managers/SoundManager';
import { loadCustomRules } from '../config/GameConfig';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.isLandscape = true;
        this.isMobile = false;
        // Check if custom rules exist and use them by default
        if (loadCustomRules()) {
            this.hasCustomRules = true;
            this.difficulty = 'Custom';
        } else {
            this.difficulty = 'Medium'; // Default difficulty if no custom rules
        }
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

            // Add settings button
            const settingsButton = this.uiFactory.createButton(
                width / 2,
                height * 0.75,
                'SETTINGS',
                '#555555',
                '#777777'
            ).on('pointerdown', () => {
                this.soundManager.playSound('click');
                this.openSettings();
            });
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
                height * 0.45,
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

            // Add settings button
            const settingsButton = this.uiFactory.createButton(
                width / 2,
                height * 0.65,
                'SETTINGS',
                '#555555',
                '#777777'
            ).on('pointerdown', () => {
                this.soundManager.playSound('click');
                this.openSettings();
            });
        }
    }

    openSettings() {
        console.log('Opening settings scene');

        // Clean up event listeners
        window.removeEventListener('resize', this.handleResize.bind(this));

        // Start settings scene
        this.scene.start('SettingsScene');
    }

    startGame() {
        console.log('Starting game with difficulty:', this.difficulty);

        // Clean up event listeners
        window.removeEventListener('resize', this.handleResize.bind(this));

        this.scene.start('GameScene', { difficulty: this.difficulty });
    }
} 