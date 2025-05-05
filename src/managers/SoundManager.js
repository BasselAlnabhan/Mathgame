import { SOUND_CONFIG } from '../config/GameConfig';

export default class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.initialized = false;
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

            this.initialized = true;
            console.log('SoundManager: Initialized successfully');
        } catch (error) {
            console.error('SoundManager: Error initializing sounds:', error);
        }
    }

    playMusic() {
        if (!this.initialized) this.init();

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

        try {
            if (this.sounds[key]) {
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

    // For setting up user-interaction for autoplay
    setupAutoPlayWorkaround() {
        // Try to start music on any user interaction
        this.scene.input.once('pointerdown', () => {
            this.playMusic();
        });

        this.scene.input.keyboard.once('keydown', () => {
            this.playMusic();
        });
    }
} 