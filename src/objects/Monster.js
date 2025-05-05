import Phaser from 'phaser';
import { UI_STYLES, POINTS } from '../config/GameConfig';

export default class Monster extends Phaser.GameObjects.Container {
    constructor(scene, x, y, monsterType, speed, mathProblem, result) {
        super(scene, x, y);
        this.scene = scene;
        this.speed = speed;
        this.mathProblem = mathProblem;
        this.result = result;
        this.monsterType = monsterType;

        // Determine if we're on a mobile device
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Determine if we're in landscape mode
        this.isLandscape = window.innerWidth > window.innerHeight;

        // Create a scale factor based on screen size and orientation
        this.scaleFactor = this.getScaleFactor();

        this.createSprite();
        this.createProblemText();

        // Scale the entire container based on screen size
        this.setScale(this.scaleFactor);

        // Add to scene
        scene.add.existing(this);
        this.setupPhysics();
    }

    getScaleFactor() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // Base scale on screen size
        let scale = Math.min(width / 1024, height / 768);

        // Adjust scale for mobile devices
        if (this.isMobile) {
            // On mobile, make monsters slightly bigger for better visibility
            scale *= 1.2;

            // In landscape mode on mobile, monsters need to be proportionally smaller
            // to avoid taking up too much vertical space
            if (this.isLandscape) {
                scale *= 0.8;
            }
        }

        // Ensure scale is within reasonable bounds
        return Math.max(0.5, Math.min(1.5, scale));
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
                Math.max(46, UI_STYLES.problemText.fontSize) :
                UI_STYLES.problemText.fontSize,
            // Enhance contrast on the text
            strokeThickness: this.isMobile ? 6 : UI_STYLES.problemText.strokeThickness
        };

        // Add text with math problem
        this.problemText = this.scene.add.text(0, 0, this.mathProblem, adjustedStyle)
            .setOrigin(0.5, 0);

        // Position the text above the monster with some extra spacing on mobile
        const spacing = this.isMobile ? 10 : 0;
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
        // Make the entire container interactive
        super.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(
                -this.sprite.width / 2,
                -this.sprite.height / 2 - this.problemText.height,
                Math.max(this.sprite.width, this.problemText.width),
                this.sprite.height + this.problemText.height
            ),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            ...config
        });

        // Add a subtle highlight effect on tap/hover for better feedback
        this.on('pointerover', this.onPointerOver, this);
        this.on('pointerout', this.onPointerOut, this);

        return this;
    }

    onPointerOver() {
        // Visual indication that the monster is interactive
        this.sprite.setTint(0xccccff);
        this.problemText.setTint(0xccccff);
    }

    onPointerOut() {
        // Restore original appearance
        this.sprite.clearTint();
        this.problemText.clearTint();
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
        // Create explosion at the position of the monster
        const explosion = this.scene.add.sprite(this.x, this.y, 'explosion')
            .play('explosion_normal')
            .setScale(this.scaleFactor); // Scale explosion to match monster

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