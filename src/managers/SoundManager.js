import { SOUND_CONFIG } from '../config/GameConfig';

export default class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.initialized = false;
        this.muted = false;
        this.audioContext = null;
        this.unlocked = false;
    }

    init() {
        if (this.initialized) return;

        try {
            // Initialize music if it doesn't exist
            if (!this.scene.sound.get('music')) {
                console.log('SoundManager: Adding background music');
                this.sounds.music = this.scene.sound.add('music', SOUND_CONFIG.music);
            } else {
                console.log('SoundManager: Music already exists');
                this.sounds.music = this.scene.sound.get('music');
            }

            // Initialize effect sounds
            this.sounds.explosion = this.scene.sound.add('boom', {
                volume: SOUND_CONFIG.effects.volume
            });

            // Add click sound for buttons and number inputs
            this.sounds.click = this.scene.sound.add('click', {
                volume: SOUND_CONFIG.effects.volume * 0.7
            });

            // Add sound for correct answer
            this.sounds.correct = this.scene.sound.add('correct', {
                volume: SOUND_CONFIG.effects.volume * 1.2
            });

            // Add sound for wrong answer
            this.sounds.wrong = this.scene.sound.add('wrong', {
                volume: SOUND_CONFIG.effects.volume
            });

            this.initialized = true;
            console.log('SoundManager: Initialized successfully');

            // Check if audio is locked (especially for iOS)
            this.checkAudioContext();
        } catch (error) {
            console.error('SoundManager: Error initializing sounds:', error);
        }
    }

    checkAudioContext() {
        // Get the audio context
        if (this.scene.sound.context) {
            this.audioContext = this.scene.sound.context;

            // Check for iOS or other mobile platforms that require unlocking
            if (this.audioContext.state === 'suspended' ||
                /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                this.unlocked = false;
            } else {
                this.unlocked = true;
            }
        }
    }

    playMusic() {
        if (!this.initialized) this.init();
        if (this.muted) return;

        try {
            if (this.sounds.music && !this.sounds.music.isPlaying) {
                console.log('SoundManager: Playing music');
                this.sounds.music.play();
            }
        } catch (error) {
            console.warn('SoundManager: Error playing music:', error);
        }
    }

    playSound(key) {
        if (!this.initialized) this.init();
        if (this.muted) return false;

        try {
            if (this.sounds[key]) {
                // For iOS, some sounds may not play before user interaction
                if (!this.unlocked) {
                    this.unlockAudio();
                    return false;
                }

                this.sounds[key].play();
                return true;
            } else {
                console.warn(`SoundManager: Sound '${key}' not found`);
                return false;
            }
        } catch (error) {
            console.error(`SoundManager: Error playing sound '${key}':`, error);
            return false;
        }
    }

    stopMusic() {
        if (this.sounds.music && this.sounds.music.isPlaying) {
            this.sounds.music.stop();
        }
    }

    toggleMute() {
        this.muted = !this.muted;

        // Mute or unmute all sounds
        this.scene.sound.mute = this.muted;

        // If unmuting, resume music if it was playing
        if (!this.muted && this.sounds.music && !this.sounds.music.isPlaying) {
            this.playMusic();
        }

        return this.muted;
    }

    unlockAudio() {
        if (this.unlocked) return true;

        // Unlock WebAudio - needed for iOS
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log('SoundManager: Audio context resumed successfully');
                this.unlocked = true;
                this.playMusic(); // Try to play music again
            }).catch(error => {
                console.error('SoundManager: Error resuming audio context:', error);
            });
        }
    }

    // For setting up user-interaction for autoplay
    setupAutoPlayWorkaround() {
        const unlockHandler = () => {
            this.unlockAudio();
            this.playMusic();
            this.unlocked = true;

            // Remove the event listeners once audio is unlocked
            if (this.unlocked) {
                document.body.removeEventListener('touchstart', unlockHandler);
                document.body.removeEventListener('touchend', unlockHandler);
                document.body.removeEventListener('click', unlockHandler);
                this.scene.input.off('pointerdown', unlockHandler);
                this.scene.input.keyboard.off('keydown', unlockHandler);
            }
        };

        // Try to start music on any user interaction - mobile and desktop
        document.body.addEventListener('touchstart', unlockHandler, false);
        document.body.addEventListener('touchend', unlockHandler, false);
        document.body.addEventListener('click', unlockHandler, false);
        this.scene.input.on('pointerdown', unlockHandler);
        this.scene.input.keyboard.on('keydown', unlockHandler);

        // For mobile devices, create mute button
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            this.createMuteButton();
        }
    }

    createMuteButton() {
        // Add a small mute button in the corner
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        const buttonSize = Math.min(width, height) * 0.06;
        const padding = buttonSize * 0.3;

        const muteButton = this.scene.add.rectangle(
            width - buttonSize - padding,
            buttonSize + padding,
            buttonSize,
            buttonSize,
            0x000000,
            0.6
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const muteIcon = this.scene.add.text(
            width - buttonSize - padding,
            buttonSize + padding,
            '🔊',
            {
                fontFamily: 'Arial',
                fontSize: buttonSize * 0.7
            }
        ).setOrigin(0.5);

        muteButton.on('pointerdown', () => {
            this.toggleMute();
            muteIcon.setText(this.muted ? '🔇' : '🔊');

            // If it was the first interaction, try to unlock audio
            if (!this.unlocked) {
                this.unlockAudio();
            }
        });

        // Set depth to ensure it's always visible
        muteButton.setDepth(100);
        muteIcon.setDepth(101);
    }
} 