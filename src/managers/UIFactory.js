import { UI_STYLES } from '../config/GameConfig';

export default class UIFactory {
    constructor(scene) {
        this.scene = scene;
    }

    createTitle(x, y, text) {
        return this.scene.add.text(x, y, text, UI_STYLES.title)
            .setOrigin(0.5);
    }

    createSubtitle(x, y, text) {
        return this.scene.add.text(x, y, text, UI_STYLES.subtitle)
            .setOrigin(0.5);
    }

    createButton(x, y, text, backgroundColor = '#0066cc', hoverColor = '#3399ff') {
        const button = this.scene.add.text(
            x, y, text,
            {
                ...UI_STYLES.button,
                backgroundColor
            }
        )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => button.setStyle({ backgroundColor: hoverColor }))
            .on('pointerout', () => button.setStyle({ backgroundColor }));

        return button;
    }

    createScoreText(x, y, score) {
        return this.scene.add.text(
            x, y, `Score: ${score}`, UI_STYLES.score
        ).setOrigin(1, 0);
    }

    createProblemText(x, y, text) {
        return this.scene.add.text(x, y, text, UI_STYLES.problemText)
            .setOrigin(0.5);
    }

    createInputField(x, y) {
        const inputField = this.scene.add.text(
            x, y, '',
            {
                fontFamily: 'Arial',
                fontSize: 32,
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        // Add cursor
        const cursor = this.scene.add.rectangle(
            inputField.x + inputField.width / 2 + 15,
            inputField.y,
            3,
            32,
            0xffffff
        ).setOrigin(0.5);

        // Blinking cursor animation
        this.scene.time.addEvent({
            delay: 500,
            callback: () => { cursor.visible = !cursor.visible; },
            loop: true
        });

        return {
            inputField,
            cursor,
            updateCursorPosition: () => {
                cursor.x = inputField.x + (inputField.width / 2) + 10;
            },
            setText: (text) => {
                inputField.setText(text);
                cursor.x = inputField.x + (inputField.width / 2) + 10;
            }
        };
    }

    createDifficultySelector(x, y, difficulties, onSelect, defaultDifficulty = 'Easy') {
        const difficultyText = this.scene.add.text(
            x, y,
            'Difficulty:',
            {
                fontFamily: 'Arial',
                fontSize: 24,
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        const buttonWidth = 120;
        const startX = x - buttonWidth;
        const buttonY = y + 50;

        const buttons = [];
        let selectedDifficulty = defaultDifficulty;

        difficulties.forEach((diff, index) => {
            const isSelected = diff === defaultDifficulty;
            const button = this.scene.add.text(
                startX + (index * buttonWidth),
                buttonY,
                diff,
                {
                    fontFamily: 'Arial',
                    fontSize: 20,
                    color: '#ffffff',
                    backgroundColor: isSelected ? '#555555' : '#333333',
                    padding: { left: 20, right: 20, top: 10, bottom: 10 }
                }
            )
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    // Update button styles
                    buttons.forEach(btn => btn.setStyle({ backgroundColor: '#333333' }));
                    button.setStyle({ backgroundColor: '#555555' });
                    selectedDifficulty = diff;

                    if (onSelect) {
                        onSelect(diff);
                    }
                });

            buttons.push(button);
        });

        return {
            container: { difficultyText, buttons },
            getSelectedDifficulty: () => selectedDifficulty
        };
    }
} 