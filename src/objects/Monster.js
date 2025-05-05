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

        this.createSprite();
        this.createProblemText();

        // Add to scene
        scene.add.existing(this);
        this.setupPhysics();
    }

    createSprite() {
        // Create sprite based on monster type
        this.sprite = this.scene.add.sprite(0, 0, this.monsterType)
            .play(`${this.monsterType}_normal`);

        // Add to container
        this.add(this.sprite);
    }

    createProblemText() {
        // Add text with math problem
        this.problemText = this.scene.add.text(0, 0, this.mathProblem, UI_STYLES.problemText)
            .setOrigin(0.5, 0);

        // Position the text above the monster
        this.problemText.y = -this.sprite.height / 2 - this.problemText.height / 2;

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

    update() {
        // Move monster down
        this.y += this.speed * this.scene.game.loop.delta / 1000;
    }

    playSound() {
        // If the scene has a sound manager, use it
        if (this.scene.soundManager) {
            this.scene.soundManager.playSound('explosion');
            return;
        }

        // Fallback to direct sound playing
        try {
            if (this.scene.sound.get('boom')) {
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
            .play('explosion_normal');

        // Play explosion sound
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
        return this.y + this.sprite.height / 2;
    }
} 