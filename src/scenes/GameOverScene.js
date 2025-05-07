import Phaser from 'phaser';
import UIFactory from '../managers/UIFactory';
import SoundManager from '../managers/SoundManager';
import { createClient } from '@supabase/supabase-js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
        this.score = 0;
        this.difficulty = 'Easy';
        this.isLandscape = true;
        this.isMobile = false;
        // Supabase client setup
        this.supabase = createClient(
            import.meta.env.VITE_SUPABASE_URL,
            import.meta.env.VITE_SUPABASE_ANON_KEY
        );
        this.isPromptOpen = false;
    }

    init(data) {
        // Get score and difficulty from game scene
        if (data) {
            this.score = data.score || 0;
            this.difficulty = data.difficulty || 'Easy';
        }
    }

    async create() {
        // Initialize UI factory and sound manager
        this.uiFactory = new UIFactory(this);
        this.soundManager = new SoundManager(this);
        this.soundManager.init();

        // Check device and orientation
        this.checkDeviceAndOrientation();

        // Create background and UI
        this.setupBackground();
        this.setupUI();

        // Setup input handling for returning to menu
        this.setupInput();

        // Handle resize/orientation changes
        window.addEventListener('resize', this.handleResize.bind(this));

        // Leaderboard logic: check if score qualifies
        await this.checkAndPromptLeaderboard();
    }

    checkDeviceAndOrientation() {
        // Check if mobile device
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Check orientation
        this.isLandscape = window.innerWidth > window.innerHeight;
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
            this.setupBackground();
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
    }

    setupBackground() {
        // Add game over background
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'gameover')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    }

    setupUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const scale = Math.min(width / 1024, height / 768);

        // UI layout depends on orientation
        if (this.isLandscape) {
            // Landscape layout
            // Add game over text
            this.uiFactory.createTitle(
                width / 2,
                height * 0.2,
                'GAME OVER'
            );

            // Add score text
            this.add.text(
                width / 2,
                height * 0.35,
                `Score: ${this.score}`,
                {
                    fontFamily: 'Arial',
                    fontSize: Math.round(48 * scale),
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 4
                }
            ).setOrigin(0.5);

            // Add difficulty text
            this.add.text(
                width / 2,
                height * 0.45,
                `Difficulty: ${this.difficulty}`,
                {
                    fontFamily: 'Arial',
                    fontSize: Math.round(32 * scale),
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5);

            // Add play again button
            this.uiFactory.createButton(
                width / 2,
                height * 0.6,
                'PLAY AGAIN'
            ).on('pointerdown', () => {
                this.soundManager.playSound('click');
                this.restartGame();
            });

            // Add main menu button
            this.uiFactory.createButton(
                width / 2,
                height * 0.75,
                'MAIN MENU',
                '#333333',
                '#555555'
            ).on('pointerdown', () => {
                this.soundManager.playSound('click');
                this.returnToMenu();
            });
        } else {
            // Portrait layout - more compact
            // Add game over text
            this.uiFactory.createTitle(
                width / 2,
                height * 0.15,
                'GAME OVER'
            );

            // Add score text
            this.add.text(
                width / 2,
                height * 0.28,
                `Score: ${this.score}`,
                {
                    fontFamily: 'Arial',
                    fontSize: Math.round(42 * scale),
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 4
                }
            ).setOrigin(0.5);

            // Add difficulty text
            this.add.text(
                width / 2,
                height * 0.37,
                `Difficulty: ${this.difficulty}`,
                {
                    fontFamily: 'Arial',
                    fontSize: Math.round(28 * scale),
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5);

            // In portrait mode, buttons side by side to save vertical space
            // Play again button
            const playButton = this.uiFactory.createButton(
                width * 0.3,
                height * 0.5,
                'PLAY AGAIN'
            ).on('pointerdown', () => {
                this.soundManager.playSound('click');
                this.restartGame();
            });

            // Main menu button
            const menuButton = this.uiFactory.createButton(
                width * 0.7,
                height * 0.5,
                'MENU',
                '#333333',
                '#555555'
            ).on('pointerdown', () => {
                this.soundManager.playSound('click');
                this.returnToMenu();
            });

            // Adjust button size for better touch targets on mobile
            if (this.isMobile) {
                const buttonScale = Math.min(1, width / 768); // Ensure buttons aren't too big on narrow screens

                [playButton, menuButton].forEach(button => {
                    button.setFontSize(button.style.fontSize * buttonScale);

                    // Adjust padding for better touch area
                    const padding = {
                        left: Math.round(20 * buttonScale),
                        right: Math.round(20 * buttonScale),
                        top: Math.round(15 * buttonScale),
                        bottom: Math.round(15 * buttonScale)
                    };

                    button.setStyle({ padding });
                });
            }
        }
    }

    setupInput() {
        // Also allow pressing any key to return to menu
        this.input.keyboard.on('keydown', () => {
            if (!this.isPromptOpen) {
                this.returnToMenu();
            }
        });
    }

    async checkAndPromptLeaderboard() {
        // Fetch current top 10
        let { data, error } = await this.supabase
            .from('leaderboard')
            .select('score')
            .order('score', { ascending: false })
            .limit(10);
        if (error) return;
        const minScore = data && data.length === 10 ? data[9].score : 0;
        if (this.score > minScore || (data && data.length < 10)) {
            this.promptForNameAndSave();
        }
    }

    promptForNameAndSave() {
        this.isPromptOpen = true;
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const scale = Math.min(width / 1024, height / 768);

        // Overlay
        const overlay = this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x000000,
            0.7
        ).setOrigin(0.5).setDepth(2000);

        // Panel
        const panelWidth = width * 0.4;
        const panelHeight = height * 0.25;
        const panel = this.add.rectangle(
            width / 2,
            height / 2,
            panelWidth,
            panelHeight,
            0x222222,
            0.95
        ).setOrigin(0.5).setDepth(2001).setStrokeStyle(3, 0x8B4513);

        // Title
        const title = this.add.text(
            width / 2,
            height / 2 - panelHeight / 2 + 40 * scale,
            'New High Score!',
            {
                fontFamily: 'Arial',
                fontSize: Math.round(32 * scale),
                color: '#FFD700',
                fontStyle: 'bold',
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(2002);

        // Prompt
        const prompt = this.add.text(
            width / 2,
            height / 2 - 10 * scale,
            'Enter your name:',
            {
                fontFamily: 'Arial',
                fontSize: Math.round(24 * scale),
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(2002);

        // HTML input for name
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 16;
        input.placeholder = 'Your name';
        input.style.position = 'absolute';
        input.style.left = `${width / 2 - 100}px`;
        input.style.top = `${height / 2 + 20 * scale}px`;
        input.style.width = '200px';
        input.style.fontSize = '20px';
        input.style.zIndex = 10000;
        document.body.appendChild(input);
        input.focus();

        // Save button
        const saveButton = this.uiFactory.createButton(
            width / 2,
            height / 2 + panelHeight / 2 - 30 * scale,
            'SAVE',
            '#00aa00',
            '#00cc00'
        ).setDepth(2002).on('pointerdown', async () => {
            const player = input.value.trim() || 'Anonymous';
            await this.supabase.from('leaderboard').insert([{ player, score: this.score }]);
            overlay.destroy();
            panel.destroy();
            title.destroy();
            prompt.destroy();
            saveButton.destroy();
            document.body.removeChild(input);
            this.isPromptOpen = false;
            // Optionally show a confirmation
            this.add.text(
                width / 2,
                height / 2,
                'Score saved!',
                {
                    fontFamily: 'Arial',
                    fontSize: Math.round(24 * scale),
                    color: '#00ff00',
                    align: 'center'
                }
            ).setOrigin(0.5).setDepth(2002);
        });
    }

    restartGame() {
        // Clean up event listeners
        window.removeEventListener('resize', this.handleResize.bind(this));

        // Start the game with the same difficulty
        this.scene.start('GameScene', { difficulty: this.difficulty });
    }

    returnToMenu() {
        // Clean up event listeners
        window.removeEventListener('resize', this.handleResize.bind(this));

        this.scene.start('MenuScene');
    }
} 