import { UI_STYLES } from '../config/GameConfig';

export default class UIFactory {
    constructor(scene) {
        this.scene = scene;
    }

    createTitle(x, y, text) {
        const scale = this.getResponsiveScale();
        const titleStyle = {
            ...UI_STYLES.title,
            fontSize: Math.round(UI_STYLES.title.fontSize * scale)
        };

        return this.scene.add.text(x, y, text, titleStyle)
            .setOrigin(0.5);
    }

    createSubtitle(x, y, text) {
        const scale = this.getResponsiveScale();
        const subtitleStyle = {
            ...UI_STYLES.subtitle,
            fontSize: Math.round(UI_STYLES.subtitle.fontSize * scale)
        };

        return this.scene.add.text(x, y, text, subtitleStyle)
            .setOrigin(0.5);
    }

    createButton(x, y, text, backgroundColor = '#0066cc', hoverColor = '#3399ff') {
        const scale = this.getResponsiveScale();
        const buttonStyle = {
            ...UI_STYLES.button,
            backgroundColor,
            fontSize: Math.round(UI_STYLES.button.fontSize * scale),
            padding: {
                left: Math.round(UI_STYLES.button.padding.left * scale),
                right: Math.round(UI_STYLES.button.padding.right * scale),
                top: Math.round(UI_STYLES.button.padding.top * scale),
                bottom: Math.round(UI_STYLES.button.padding.bottom * scale)
            }
        };

        const button = this.scene.add.text(
            x, y, text, buttonStyle
        )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => button.setStyle({ backgroundColor: hoverColor }))
            .on('pointerout', () => button.setStyle({ backgroundColor }));

        return button;
    }

    createScoreText(x, y, score) {
        const scale = this.getResponsiveScale();
        const scoreStyle = {
            ...UI_STYLES.score,
            fontSize: Math.round(UI_STYLES.score.fontSize * scale)
        };

        return this.scene.add.text(
            x, y, `Score: ${score}`, scoreStyle
        ).setOrigin(1, 0);
    }

    createProblemText(x, y, text) {
        const scale = this.getResponsiveScale();
        const problemStyle = {
            ...UI_STYLES.problemText,
            fontSize: Math.round(UI_STYLES.problemText.fontSize * scale)
        };

        return this.scene.add.text(x, y, text, problemStyle)
            .setOrigin(0.5);
    }

    createDifficultySelector(x, y, difficulties, onSelect, defaultDifficulty = 'Easy') {
        const scale = this.getResponsiveScale();
        const fontSize = Math.round(24 * scale);

        const difficultyText = this.scene.add.text(
            x, y,
            'Difficulty:',
            {
                fontFamily: 'Arial',
                fontSize: fontSize,
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        const buttonWidth = Math.round(120 * scale);
        const startX = x - buttonWidth;
        const buttonY = y + Math.round(50 * scale);

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
                    fontSize: Math.round(20 * scale),
                    color: '#ffffff',
                    backgroundColor: isSelected ? '#555555' : '#333333',
                    padding: {
                        left: Math.round(20 * scale),
                        right: Math.round(20 * scale),
                        top: Math.round(10 * scale),
                        bottom: Math.round(10 * scale)
                    }
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

    // Helper method to calculate a responsive scale factor based on screen size
    getResponsiveScale() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // Base scale on the smaller dimension relative to the base design size
        // This ensures UI elements fit on smaller screens
        return Math.min(width / 1024, height / 768);
    }
} 