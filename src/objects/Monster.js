import Phaser from 'phaser';
import { UI_STYLES, POINTS } from '../config/GameConfig';

export default class Monster extends Phaser.GameObjects.Container {
    constructor(scene, monsterType, mathProblem, result, speed, isLandscape) {
        // Calculate x position randomly with spacing to avoid overlaps
        const width = scene.cameras.main.width;
        let x;
        let attempts = 0;
        const minSpacing = 120; // Minimum pixel distance between monsters

        do {
            x = Phaser.Math.Between(100, width - 100);
            attempts++;

            // Break after 5 attempts to avoid infinite loop
            if (attempts > 5) break;

        } while (scene.isPositionTooCloseToExistingMonster &&
            scene.isPositionTooCloseToExistingMonster(x, minSpacing));

        // Create the monster above the screen
        super(scene, x, -50);

        this.scene = scene;
        this.speed = speed;
        this.mathProblem = mathProblem;
        this.result = result;
        this.monsterType = monsterType;

        // Determine if we're on a mobile device
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Use provided landscape mode flag or calculate it
        this.isLandscape = isLandscape !== undefined ? isLandscape : window.innerWidth > window.innerHeight;

        // Create a scale factor based on screen size and orientation
        this.scaleFactor = this.getScaleFactor();

        this.createSprite();
        this.createProblemText();

        // Scale the entire container based on screen size
        this.setScale(this.scaleFactor);

        // Add to scene
        scene.add.existing(this);
        this.setupPhysics();

        // For mobile or small screens, make the monster tappable
        if (this.isMobile || window.innerWidth < 768) {
            this.setInteractive({ useHandCursor: true });

            // If the scene has a handler for monster tap, connect it
            if (scene.handleMonsterTap) {
                this.on('pointerdown', () => scene.handleMonsterTap(this));
            }
        }

        // Play monster sound
        this.playSound();
    }

    getScaleFactor() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // Base scale on screen size
        let scale = Math.min(width / 1024, height / 768);

        // Adjust scale for mobile devices
        if (this.isMobile) {
            // In portrait mode, make monsters bigger for better visibility and touch targets
            if (!this.isLandscape) {
                scale *= 1.3;
            } else {
                // In landscape mode on mobile, monsters need to be sized appropriately
                scale *= 1.1;
            }
        }

        // Ensure scale is within reasonable bounds
        return Math.max(0.6, Math.min(1.6, scale));
    }

    createSprite() {
        // Create sprite based on monster type
        this.sprite = this.scene.add.sprite(0, 0, this.monsterType)
            .play(`${this.monsterType}_normal`);

        // Add to container
        this.add(this.sprite);
    }

    createProblemText() {
        // Create style with adjusted font size
        const adjustedStyle = {
            ...UI_STYLES.problemText,
            // Make font size more readable on mobile
            fontSize: this.isMobile ?
                Math.max(50, UI_STYLES.problemText.fontSize) :
                UI_STYLES.problemText.fontSize,
            // Enhance contrast on the text
            strokeThickness: this.isMobile ? 6 : UI_STYLES.problemText.strokeThickness,
            // Add background for better readability on mobile
            backgroundColor: this.isMobile ? '#00000088' : null,
            padding: this.isMobile ? { x: 8, y: 4 } : null
        };

        // Add text with math problem
        this.problemText = this.scene.add.text(0, 0, this.mathProblem, adjustedStyle)
            .setOrigin(0.5, 0);

        // Position the text above the monster with some extra spacing on mobile
        const spacing = this.isMobile ? 15 : 5;
        this.problemText.y = -this.sprite.height / 2 - this.problemText.height / 2 - spacing;

        // Add to container
        this.add(this.problemText);
    }

    setupPhysics() {
        // Add physics
        if (this.scene.physics && this.scene.physics.world) {
            this.scene.physics.world.enable(this);

            // Set the container body size
            const totalHeight = this.sprite.height + this.problemText.height;
            const width = Math.max(this.sprite.width, this.problemText.width);

            this.body.setSize(width, totalHeight);
            this.body.setOffset(-width / 2, -this.sprite.height / 2 - this.problemText.height);
        }
    }

    // Make the monster interactive for direct tapping
    setInteractive(config = {}) {
        // Make the entire container interactive with a larger hit area on mobile
        const padding = this.isMobile ? 20 : 0;

        super.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(
                -this.sprite.width / 2 - padding,
                -this.sprite.height / 2 - this.problemText.height - padding,
                Math.max(this.sprite.width, this.problemText.width) + (padding * 2),
                this.sprite.height + this.problemText.height + (padding * 2)
            ),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            ...config
        });

        // Add improved visual feedback effects
        this.on('pointerover', this.onPointerOver, this);
        this.on('pointerout', this.onPointerOut, this);

        // Add touch-specific effects for mobile
        if (this.isMobile) {
            this.on('pointerdown', this.onPointerDown, this);
            this.on('pointerup', this.onPointerUp, this);
        }

        return this;
    }

    onPointerOver() {
        // Visual indication that the monster is interactive
        if (this.isMobile) {
            // More pronounced effect for mobile
            this.sprite.setTint(0xaaddff);
            this.problemText.setTint(0xaaddff);
            this.scale = this.scaleFactor * 1.05;
        } else {
            // Subtle effect for desktop
            this.sprite.setTint(0xccccff);
            this.problemText.setTint(0xccccff);
        }
    }

    onPointerOut() {
        // Restore original appearance
        this.sprite.clearTint();
        this.problemText.clearTint();
        this.scale = this.scaleFactor;
    }

    // Mobile-specific touch feedback
    onPointerDown() {
        if (this.isMobile) {
            this.sprite.setTint(0x88aaff);
            this.scale = this.scaleFactor * 0.95;
        }
    }

    onPointerUp() {
        if (this.isMobile) {
            this.sprite.clearTint();
            this.scale = this.scaleFactor;
        }
    }

    update() {
        // Move monster down
        this.y += this.speed * this.scene.game.loop.delta / 1000;
    }

    playSound() {
        // If the scene has a sound manager, use it
        if (this.scene.soundManager) {
            // Play different sounds based on monster type
            if (this.monsterType === 'badpig') {
                this.scene.soundManager.playSound('pig');
            } else if (this.monsterType === 'monster2') {
                this.scene.soundManager.playSound('wario');
            } else {
                // Default to explosion sound for other monsters
                this.scene.soundManager.playSound('explosion');
            }
            return;
        }

        // Fallback to direct sound playing
        try {
            if (this.monsterType === 'badpig' && this.scene.sound.get('pig')) {
                const sound = this.scene.sound.add('pig', { volume: 0.2 });
                sound.play();
            } else if (this.monsterType === 'monster2' && this.scene.sound.get('wario')) {
                const sound = this.scene.sound.add('wario', { volume: 0.2 });
                sound.play();
            } else if (this.scene.sound.get('boom')) {
                const sound = this.scene.sound.add('boom', { volume: 0.2 });
                sound.play();
            }
        } catch (error) {
            console.error('Error playing monster sound:', error);
        }
    }

    explode() {
        // Enhanced explosion effect for mobile
        const explosionScale = this.isMobile ? this.scaleFactor * 1.3 : this.scaleFactor;

        // Create explosion at the position of the monster
        const explosion = this.scene.add.sprite(this.x, this.y, 'explosion')
            .play('explosion_normal')
            .setScale(explosionScale);

        // Add extra visual effects for mobile
        if (this.isMobile) {
            // Add particle effect for more satisfying explosion
            if (this.scene.add.particles) {
                try {
                    const particles = this.scene.add.particles(this.x, this.y, 'explosion', {
                        scale: { start: 0.2, end: 0 },
                        speed: { min: 50, max: 100 },
                        lifespan: 800,
                        blendMode: 'ADD',
                        quantity: 10
                    });

                    // Auto-destroy particles after animation completes
                    this.scene.time.delayedCall(800, () => {
                        if (particles && particles.scene) {
                            particles.destroy();
                        }
                    });
                } catch (error) {
                    // Fail silently - particles are just a visual enhancement
                    console.log('Particle effect not available');
                }
            }

            // Add camera shake for impact
            this.scene.cameras.main.shake(200, 0.01);
        }

        // Play explosion sound (keep using the explosion sound since we're exploding)
        if (this.scene.soundManager) {
            this.scene.soundManager.playSound('explosion');
        } else {
            try {
                if (this.scene.sound.get('boom')) {
                    const sound = this.scene.sound.add('boom', { volume: 0.2 });
                    sound.play();
                }
            } catch (error) {
                console.error('Error playing explosion sound:', error);
            }
        }

        // Remove the monster
        this.destroy();

        // Return points
        return POINTS.standard;
    }

    getBottom() {
        return this.y + (this.sprite.height * this.scaleFactor) / 2;
    }
} 