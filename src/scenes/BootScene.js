import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Add console logging for debugging
        console.log('BootScene: preload started');

        // Setup error handling
        this.setupErrorHandling();

        // Create loading bar
        this.createLoadingBar();

        // Load game assets
        this.loadAssets();
    }

    setupErrorHandling() {
        // Error handling for the whole loading process
        this.load.on('loaderror', (fileObj) => {
            console.error('Error loading asset:', fileObj.src);
        });
    }

    createLoadingBar() {
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        const percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        // Update the loading bar as assets are loaded
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
            percentText.setText(parseInt(value * 100) + '%');
            console.log('Loading progress:', parseInt(value * 100) + '%');
        });

        this.load.on('complete', () => {
            console.log('BootScene: All assets loaded successfully');
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });
    }

    loadAssets() {
        // Load favicon (prevents 404 console errors)
        this.setupFavicon();

        // Load images
        this.loadImages();

        // Load sounds
        this.loadSounds();
    }

    setupFavicon() {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = 'assets/images/favicon.ico';
        document.head.appendChild(link);
    }

    loadImages() {
        try {
            // Load background images
            this.load.image('background', 'assets/images/background.jpg');
            this.load.image('cockpit', 'assets/images/cockpit.png');
            this.load.image('gameover', 'assets/images/gameover.png');

            // Load monster sprites
            this.loadMonsterSprites();
        } catch (error) {
            console.error('Error loading images:', error);
        }
    }

    loadMonsterSprites() {
        const sprites = [
            {
                key: 'monster1',
                path: 'assets/images/monster1.png',
                frameWidth: 170,
                frameHeight: 170
            },
            {
                key: 'monster2',
                path: 'assets/images/monster2.png',
                frameWidth: 65,
                frameHeight: 85
            },
            {
                key: 'badpig',
                path: 'assets/images/badpig.png',
                frameWidth: 154,
                frameHeight: 171
            },
            {
                key: 'explosion',
                path: 'assets/images/explosion.png',
                frameWidth: 128,
                frameHeight: 128
            }
        ];

        sprites.forEach(sprite => {
            console.log(`Loading ${sprite.key} spritesheet`);
            this.load.spritesheet(sprite.key, sprite.path, {
                frameWidth: sprite.frameWidth,
                frameHeight: sprite.frameHeight
            });
        });
    }

    loadSounds() {
        try {
            // Create debug sound loading handler
            const onSoundLoad = (key) => {
                console.log(`Successfully loaded sound: ${key}`);
            };

            const onSoundError = (key) => {
                console.error(`Failed to load sound: ${key}`);
            };

            // Load main music
            console.log('Loading music from:', 'assets/sounds/zoolook.ogg');
            this.load.audio('music', ['assets/sounds/zoolook.ogg']);
            this.load.once('filecomplete-audio-music', () => onSoundLoad('music'));
            this.load.once('loaderror', (file) => {
                if (file.key === 'music') {
                    onSoundError('music');
                }
            });

            // Load boom sound
            console.log('Loading boom sound from:', 'assets/sounds/explosion.wav');
            this.load.audio('boom', ['assets/sounds/explosion.wav']);
            this.load.once('filecomplete-audio-boom', () => onSoundLoad('boom'));

            // Load monster specific sounds
            console.log('Loading pig sound');
            this.load.audio('pig', ['assets/sounds/pig.wav']);
            this.load.once('filecomplete-audio-pig', () => onSoundLoad('pig'));

            console.log('Loading wario sound');
            this.load.audio('wario', ['assets/sounds/wario.wav']);
            this.load.once('filecomplete-audio-wario', () => onSoundLoad('wario'));

            // Load button click sound
            console.log('Loading click sound');
            this.load.audio('click', ['assets/sounds/click.wav']);
            this.load.once('filecomplete-audio-click', () => onSoundLoad('click'));

            // Load correct answer sound
            console.log('Loading correct answer sound');
            this.load.audio('correct', ['assets/sounds/correct.wav']);
            this.load.once('filecomplete-audio-correct', () => onSoundLoad('correct'));

            // Load wrong answer sound
            console.log('Loading wrong answer sound');
            this.load.audio('wrong', ['assets/sounds/wrong.wav']);
            this.load.once('filecomplete-audio-wrong', () => onSoundLoad('wrong'));
        } catch (error) {
            console.error('Error during sound loading setup:', error);
        }
    }

    create() {
        console.log('BootScene: create method started');
        try {
            // Create animations
            this.createAnimations();
            console.log('BootScene: animations created successfully');

            // Start menu scene
            console.log('BootScene: starting MenuScene');
            this.scene.start('MenuScene');
        } catch (error) {
            console.error('Error in BootScene create method:', error);
        }
    }

    createAnimations() {
        console.log('Creating animations');
        try {
            const animations = [
                {
                    key: 'monster1_normal',
                    spriteKey: 'monster1',
                    frames: [0, 1, 2, 3, 2, 1],
                    frameRate: 6,
                    repeat: -1
                },
                {
                    key: 'monster2_normal',
                    spriteKey: 'monster2',
                    frames: [0, 1, 2, 3, 4, 5],
                    frameRate: 6,
                    repeat: -1
                },
                {
                    key: 'badpig_normal',
                    spriteKey: 'badpig',
                    frames: [1, 1, 1, 1, 0, 1, 0, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1],
                    frameRate: 6,
                    repeat: -1
                },
                {
                    key: 'explosion_normal',
                    spriteKey: 'explosion',
                    frames: { start: 0, end: 30 },
                    frameRate: 25,
                    repeat: 0
                }
            ];

            animations.forEach(anim => {
                this.anims.create({
                    key: anim.key,
                    frames: typeof anim.frames === 'object' && 'start' in anim.frames
                        ? this.anims.generateFrameNumbers(anim.spriteKey, anim.frames)
                        : this.anims.generateFrameNumbers(anim.spriteKey, { frames: anim.frames }),
                    frameRate: anim.frameRate,
                    repeat: anim.repeat
                });
            });

            console.log('All animations created successfully');
        } catch (error) {
            console.error('Error creating animations:', error);
        }
    }
} 