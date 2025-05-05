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

    createInputField(x, y, scale = null) {
        // If scale is not provided, calculate it based on screen size
        if (scale === null) {
            scale = this.getResponsiveScale();
        }

        // Check if it's a mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Adjust font size based on scale and device
        const fontSize = Math.round(isMobile ? 36 * scale : 32 * scale);

        // Set field width based on device type
        const fieldWidth = isMobile ? Math.round(300 * scale) : Math.round(200 * scale);

        const inputField = this.scene.add.text(
            x, y, '',
            {
                fontFamily: 'Arial',
                fontSize: fontSize,
                color: '#ffffff',
                padding: { x: 10, y: 5 },
                backgroundColor: '#222222',
                fixedWidth: fieldWidth
            }
        ).setOrigin(0.5);

        // Make the input field look more like a field
        inputField.setActive(true).setInteractive();

        // Input field background - make it more prominent on mobile
        const bgWidth = inputField.width + (isMobile ? 40 * scale : 20 * scale);
        const bgHeight = inputField.height + (isMobile ? 20 * scale : 10 * scale);
        const inputBg = this.scene.add.rectangle(
            x, y,
            bgWidth, bgHeight,
            0x222222, isMobile ? 0.9 : 0.7
        ).setOrigin(0.5);

        // Add border to make input field more visible
        const border = this.scene.add.rectangle(
            x, y,
            bgWidth, bgHeight,
            0xffffff, 0.3
        ).setOrigin(0.5);
        border.setStrokeStyle(2, 0xffffff, 0.5);

        // Add cursor
        const cursor = this.scene.add.rectangle(
            x, y,
            Math.max(3, 3 * scale),
            fontSize,
            0xffffff
        ).setOrigin(0.5);

        // Blinking cursor animation
        this.scene.time.addEvent({
            delay: 500,
            callback: () => { cursor.visible = !cursor.visible; },
            loop: true
        });

        // Place cursor correctly initially
        inputField.setDepth(2);
        border.setDepth(1);
        inputBg.setDepth(1);
        cursor.setDepth(3);
        this.updateInputCursor(inputField, cursor);

        // Make the input interactive (tap to focus)
        inputBg.setInteractive({ useHandCursor: true });
        border.setInteractive({ useHandCursor: true });

        // Focus handling (for desktop)
        let isFocused = true;

        const focusInput = () => {
            isFocused = true;
            cursor.visible = true;
            border.setStrokeStyle(3, 0x3399ff, 1);
        };

        inputBg.on('pointerdown', focusInput);
        border.on('pointerdown', focusInput);
        inputField.on('pointerdown', focusInput);

        // Allow clicking outside to unfocus on desktop
        this.scene.input.on('pointerdown', (pointer, gameObjects) => {
            if (!gameObjects.includes(inputBg) && !gameObjects.includes(inputField) && !gameObjects.includes(border)) {
                isFocused = false;
                cursor.visible = false;
                border.setStrokeStyle(2, 0xffffff, 0.5);
            }
        });

        return {
            inputField,
            cursor,
            updateCursorPosition: () => {
                this.updateInputCursor(inputField, cursor);
            },
            setText: (text) => {
                inputField.setText(text);
                this.updateInputCursor(inputField, cursor);
            },
            isFocused: () => isFocused
        };
    }

    updateInputCursor(inputField, cursor) {
        // Calculate cursor position based on text width
        const textWidth = inputField.width;
        cursor.x = inputField.x + (textWidth / 2) + 10;
        cursor.y = inputField.y;
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