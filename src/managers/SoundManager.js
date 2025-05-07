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
            // Create empty placeholder sounds if needed
            this.createPlaceholderSounds();

            // Initialize music if it doesn't exist
            if (!this.scene.sound.get('music')) {
                console.log('SoundManager: Adding background music');
                try {
                    this.sounds.music = this.scene.sound.add('music', SOUND_CONFIG.music);
                } catch (error) {
                    console.warn('SoundManager: Could not add music, using placeholder', error);
                }
            } else {
                console.log('SoundManager: Music already exists');
                this.sounds.music = this.scene.sound.get('music');
            }

            // Initialize effect sounds with error handling for each
            this.addSoundWithFallback('explosion', 'boom');
            this.addSoundWithFallback('wario', 'wario');
            this.addSoundWithFallback('pig', 'pig');
            this.addSoundWithFallback('click', 'click', 0.7);
            this.addSoundWithFallback('correct', 'correct', 1.2);
            this.addSoundWithFallback('wrong', 'wrong');

            this.initialized = true;
            console.log('SoundManager: Initialized successfully');

            // Check if audio is locked (especially for iOS)
            this.checkAudioContext();
        } catch (error) {
            console.error('SoundManager: Error initializing sounds:', error);
            // Set initialized to true anyway to prevent repeated init attempts
            this.initialized = true;
        }
    }

    // Helper method to add a sound with fallback
    addSoundWithFallback(soundKey, audioKey, volumeMultiplier = 1) {
        try {
            if (this.scene.cache.audio.exists(audioKey)) {
                this.sounds[soundKey] = this.scene.sound.add(audioKey, {
                    volume: SOUND_CONFIG.effects.volume * volumeMultiplier
                });
                console.log(`SoundManager: Added ${soundKey} sound successfully`);
            } else {
                console.warn(`SoundManager: Audio key "${audioKey}" not found in cache, using placeholder`);
                this.sounds[soundKey] = this.createDummySound();
            }
        } catch (error) {
            console.warn(`SoundManager: Error adding ${soundKey} sound, using placeholder`, error);
            this.sounds[soundKey] = this.createDummySound();
        }
    }

    // Create a dummy sound object that mimics the Phaser sound interface
    createDummySound() {
        return {
            play: () => {},
            stop: () => {},
            pause: () => {},
            resume: () => {},
            isPlaying: false
        };
    }

    // Create placeholder sounds to prevent errors
    createPlaceholderSounds() {
        // Create placeholder sounds for common keys
        const soundKeys = ['music', 'explosion', 'wario', 'pig', 'click', 'correct', 'wrong'];
        
        soundKeys.forEach(key => {
            this.sounds[key] = this.createDummySound();
        });
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
                console.warn(`SoundManager: Sound '${key}' not found, creating placeholder`);
                this.sounds[key] = this.createDummySound();
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