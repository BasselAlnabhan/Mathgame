import Phaser from 'phaser';
import UIFactory from '../managers/UIFactory';
import SoundManager from '../managers/SoundManager';
import { createClient } from '@supabase/supabase-js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.isLandscape = true;
        this.isMobile = false;
        // Load last chosen difficulty from localStorage if available
        let lastDifficulty = 'Easy';
        try {
            if (typeof localStorage !== 'undefined') {
                const stored = localStorage.getItem('lastDifficulty');
                if (stored && ['Easy', 'Medium', 'Hard'].includes(stored)) {
                    lastDifficulty = stored;
                }
            }
        } catch (e) { }
        this.difficulty = lastDifficulty;
        // Supabase client setup
        if (!import.meta.env.VITE_SUPABASE_URL) {
            console.warn('VITE_SUPABASE_URL is NOT set');
        } else {
            console.info('VITE_SUPABASE_URL is set');
        }
        if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
            console.warn('VITE_SUPABASE_ANON_KEY is NOT set');
        } else {
            console.info('VITE_SUPABASE_ANON_KEY is set');
        }
        this.supabase = createClient(
            import.meta.env.VITE_SUPABASE_URL,
            import.meta.env.VITE_SUPABASE_ANON_KEY
        );
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

            // Add leaderboard button a bit further down, and match play button width
            const leaderboardButton = this.uiFactory.createButton(
                width / 2,
                height * 0.7,
                'LEADERBOARD',
                '#8B4513',
                '#A0522D'
            ).on('pointerdown', () => {
                this.soundManager.playSound('click');
                this.openLeaderboard();
            });
            leaderboardButton.setDisplaySize(playButton.displayWidth, playButton.displayHeight);

            // Add difficulty selector further down
            const difficultySelector = this.uiFactory.createDifficultySelector(
                width / 2,
                height * 0.8,
                ['Easy', 'Medium', 'Hard'],
                (difficulty) => {
                    this.difficulty = difficulty;
                    // Save last chosen difficulty to localStorage
                    try {
                        if (typeof localStorage !== 'undefined') {
                            localStorage.setItem('lastDifficulty', difficulty);
                        }
                    } catch (e) { }
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

            // Add leaderboard button a bit further down, and match play button width
            const leaderboardButton = this.uiFactory.createButton(
                width / 2,
                height * 0.6,
                'LEADERBOARD',
                '#8B4513',
                '#A0522D'
            ).on('pointerdown', () => {
                this.soundManager.playSound('click');
                this.openLeaderboard();
            });
            leaderboardButton.setDisplaySize(playButton.displayWidth, playButton.displayHeight);

            // Add difficulty selector further down
            const difficultySelector = this.uiFactory.createDifficultySelector(
                width / 2,
                height * 0.7,
                ['Easy', 'Medium', 'Hard'],
                (difficulty) => {
                    this.difficulty = difficulty;
                    // Save last chosen difficulty to localStorage
                    try {
                        if (typeof localStorage !== 'undefined') {
                            localStorage.setItem('lastDifficulty', difficulty);
                        }
                    } catch (e) { }
                    this.soundManager.playSound('click');
                    console.log('Difficulty set to:', difficulty);
                },
                this.difficulty // Use current difficulty
            );
        }
    }

    async openLeaderboard() {
        // Remove any existing leaderboard modal
        if (this.leaderboardModal) {
            this.leaderboardModal.destroy(true);
        }

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const scale = Math.min(width / 1024, height / 768);

        // Modal overlay
        const overlay = this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x000000,
            0.7
        ).setOrigin(0.5).setDepth(1000);

        // Modal panel
        const panelWidth = width * 0.5;
        const panelHeight = height * 0.6;
        const panel = this.add.rectangle(
            width / 2,
            height / 2,
            panelWidth,
            panelHeight,
            0x222222,
            0.95
        ).setOrigin(0.5).setDepth(1001).setStrokeStyle(3, 0x8B4513);

        // Title
        const title = this.add.text(
            width / 2,
            height / 2 - panelHeight / 2 + 50 * scale,
            'LEADERBOARD',
            {
                fontFamily: 'Arial',
                fontSize: Math.round(40 * scale),
                color: '#FFD700',
                fontStyle: 'bold',
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(1002);

        // Loading message
        const loadingText = this.add.text(
            width / 2,
            height / 2,
            'Loading...',
            {
                fontFamily: 'Arial',
                fontSize: Math.round(28 * scale),
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(1002);

        // Close button
        const closeButton = this.uiFactory.createButton(
            width / 2,
            height / 2 + panelHeight / 2 - 40 * scale,
            'CLOSE',
            '#aa0000',
            '#cc0000'
        ).setDepth(1002).on('pointerdown', () => {
            overlay.destroy();
            panel.destroy();
            title.destroy();
            loadingText.destroy();
            if (this.leaderboardEntries) this.leaderboardEntries.forEach(e => e.destroy());
            closeButton.destroy();
            this.leaderboardModal = null;
        });

        // Store modal elements for cleanup
        this.leaderboardModal = this.add.container(0, 0, [overlay, panel, title, loadingText, closeButton]);
        this.leaderboardModal.setDepth(1000);

        // Fetch leaderboard data from Supabase
        let { data, error } = await this.supabase
            .from('leaderboard')
            .select('player,score')
            .order('score', { ascending: false })
            .limit(10);

        loadingText.setVisible(false);
        this.leaderboardEntries = [];
        if (error) {
            const errorText = this.add.text(
                width / 2,
                height / 2,
                'Failed to load leaderboard',
                {
                    fontFamily: 'Arial',
                    fontSize: Math.round(24 * scale),
                    color: '#ff4444',
                    align: 'center'
                }
            ).setOrigin(0.5).setDepth(1002);
            this.leaderboardEntries.push(errorText);
        } else {
            data.forEach((entry, i) => {
                const entryText = this.add.text(
                    width / 2,
                    height / 2 - panelHeight / 2 + 110 * scale + i * 40 * scale,
                    `${i + 1}. ${entry.player} - ${entry.score}`,
                    {
                        fontFamily: 'Arial',
                        fontSize: Math.round(26 * scale),
                        color: '#ffffff',
                        align: 'left'
                    }
                ).setOrigin(0.5, 0).setDepth(1002);
                this.leaderboardEntries.push(entryText);
            });
        }
        this.leaderboardModal.add(this.leaderboardEntries);
    }

    startGame() {
        console.log('Starting game with difficulty:', this.difficulty);

        // Clean up event listeners
        window.removeEventListener('resize', this.handleResize.bind(this));

        this.scene.start('GameScene', { difficulty: this.difficulty });
    }
} 