import Phaser from 'phaser';
import UIFactory from '../managers/UIFactory';
import SoundManager from '../managers/SoundManager';
import { GAME_RULES_PRESETS, saveCustomRules, loadCustomRules } from '../config/GameConfig';

export default class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
        this.isLandscape = true;
        this.isMobile = false;
        this.currentRules = loadCustomRules() || { ...GAME_RULES_PRESETS.Medium };
        this.activeTab = 'speed';

        // Store bound methods to properly remove event listeners
        this.handleResizeBound = this.handleResize.bind(this);
    }

    create() {
        console.log('SettingsScene: create method started');

        // Initialize managers
        this.uiFactory = new UIFactory(this);
        this.soundManager = new SoundManager(this);
        this.soundManager.init();

        // Check device and orientation
        this.checkDeviceAndOrientation();

        // Create background and UI elements
        this.setupBackground();
        this.setupUI();

        // Handle resize/orientation changes
        window.addEventListener('resize', this.handleResizeBound);

        console.log('SettingsScene: create completed');
    }

    checkDeviceAndOrientation() {
        // Check if mobile device - test for touch capability as well
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));

        // Check orientation
        this.isLandscape = window.innerWidth > window.innerHeight;

        console.log(`Device detected as: ${this.isMobile ? 'Mobile' : 'Desktop'}, Orientation: ${this.isLandscape ? 'Landscape' : 'Portrait'}`);
    }

    handleResize() {
        // Update orientation flag
        const wasLandscape = this.isLandscape;
        const previousWidth = this.cameras.main.width;
        const previousHeight = this.cameras.main.height;

        this.isLandscape = window.innerWidth > window.innerHeight;

        // Only rebuild UI if orientation changed or significant size change
        if (wasLandscape !== this.isLandscape ||
            Math.abs(previousWidth - this.cameras.main.width) > 200 ||
            Math.abs(previousHeight - this.cameras.main.height) > 200) {

            console.log('Orientation or size changed, rebuilding UI');

            // Remove existing UI elements
            this.cleanupUI();

            // Rebuild UI for new orientation
            this.setupUI();
        }
    }

    cleanupUI() {
        // Destroy all UI elements
        this.children.list.forEach(child => {
            if (child.type === 'Text' || child.type === 'Image' || child.type === 'Rectangle') {
                child.destroy();
            }
        });

        // Re-add background
        this.setupBackground();
    }

    setupBackground() {
        // Add background
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    }

    setupUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const scale = Math.min(width / 1024, height / 768);

        // Adjust scale for mobile devices
        const mobileScale = this.isMobile ?
            (this.isLandscape ? 1.1 * scale : 1.3 * scale) :
            scale;

        // Add a semi-transparent overlay for better readability
        this.add.rectangle(
            width / 2,
            height / 2,
            width * 0.9,
            height * 0.9,
            0x000000,
            0.6
        ).setOrigin(0.5);

        // Add title
        const titleSize = this.isMobile && !this.isLandscape ? 40 : 56;
        const title = this.add.text(
            width / 2,
            this.isMobile ? height * 0.08 : height * 0.1,
            'GAME SETTINGS',
            {
                fontFamily: 'Arial',
                fontSize: titleSize * mobileScale,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 8,
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // Create tabs to manage different rule sections
        this.createTabs(
            width / 2,
            this.isMobile ? height * 0.17 : height * 0.2,
            ['Speed', 'Monsters', 'Math']
        );

        // Create settings panel - adjust size and position for mobile
        const panelWidth = this.isMobile ? width * 0.95 : width * 0.8;
        const panelHeight = this.isMobile ? height * 0.55 : height * 0.5;
        const panelY = this.isMobile ? height * 0.28 : height * 0.3;

        this.createSettingsPanel(
            width / 2,
            panelY,
            panelWidth,
            panelHeight
        );

        // Add preset buttons at the bottom
        this.createPresetButtons(
            width / 2,
            this.isMobile ? height * 0.72 : height * 0.75
        );

        // Add save and back buttons - position them for better mobile access
        const buttonSize = this.isMobile ? 1.2 : 1;
        const buttonY = this.isMobile ? height * 0.85 : height * 0.85;

        // On mobile portrait, stack buttons vertically if needed
        const saveButtonX = this.isMobile && !this.isLandscape ?
            width / 2 :
            width * 0.6;

        const backButtonX = this.isMobile && !this.isLandscape ?
            width / 2 :
            width * 0.4;

        const backButtonY = this.isMobile && !this.isLandscape ?
            height * 0.93 :
            buttonY;

        const saveButton = this.add.text(
            saveButtonX,
            buttonY,
            'SAVE',
            {
                fontFamily: 'Arial',
                fontSize: Math.round(36 * buttonSize * mobileScale),
                color: '#ffffff',
                backgroundColor: '#00aa00',
                padding: {
                    left: 40 * buttonSize,
                    right: 40 * buttonSize,
                    top: 25 * buttonSize,
                    bottom: 25 * buttonSize
                },
                fontStyle: 'bold',
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 5,
                    fill: true
                }
            }
        ).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => saveButton.setStyle({ backgroundColor: '#00cc00' }))
            .on('pointerout', () => saveButton.setStyle({ backgroundColor: '#00aa00' }))
            .on('pointerdown', () => {
                this.soundManager.playSound('click');
                this.saveSettings();
            });

        const backButton = this.add.text(
            backButtonX,
            backButtonY,
            'BACK',
            {
                fontFamily: 'Arial',
                fontSize: Math.round(36 * buttonSize * mobileScale),
                color: '#ffffff',
                backgroundColor: '#aa0000',
                padding: {
                    left: 40 * buttonSize,
                    right: 40 * buttonSize,
                    top: 25 * buttonSize,
                    bottom: 25 * buttonSize
                },
                fontStyle: 'bold',
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 5,
                    fill: true
                }
            }
        ).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => backButton.setStyle({ backgroundColor: '#cc0000' }))
            .on('pointerout', () => backButton.setStyle({ backgroundColor: '#aa0000' }))
            .on('pointerdown', () => {
                this.soundManager.playSound('click');
                this.returnToMenu();
            });
    }

    createTabs(x, y, tabNames) {
        const width = this.cameras.main.width;
        const scale = Math.min(width / 1024, this.cameras.main.height / 768);

        // Make tabs more touch-friendly on mobile
        const tabHeight = this.isMobile ? 60 : 50;
        const tabFontSize = this.isMobile ? 24 : 20;

        // Adjust tab width based on screen size and orientation
        let tabWidth;
        if (this.isMobile) {
            // On mobile, make tabs easier to tap
            tabWidth = this.isLandscape ? width * 0.22 : width * 0.28;
        } else {
            tabWidth = width * 0.25;
        }

        const startX = x - ((tabNames.length * tabWidth) / 2) + (tabWidth / 2);

        tabNames.forEach((tabName, index) => {
            // Keep tab key logic simple - use lowercase tab name
            const tabKey = tabName.toLowerCase();
            // If this is "Math" tab, it maps to "lesson" in our code
            const isActive = this.activeTab === (tabKey === 'math' ? 'lesson' : tabKey);

            const tabBackground = this.add.rectangle(
                startX + (index * tabWidth),
                y,
                tabWidth - 10,
                tabHeight,
                isActive ? 0x3366cc : 0x333333,
                1
            ).setOrigin(0.5).setInteractive({ useHandCursor: true });

            // Add border to make tabs more visible
            tabBackground.setStrokeStyle(2, isActive ? 0xffffff : 0x666666);

            const tabText = this.add.text(
                startX + (index * tabWidth),
                y,
                tabName,
                {
                    fontFamily: 'Arial',
                    fontSize: tabFontSize * scale,
                    color: isActive ? '#ffffff' : '#cccccc',
                    fontStyle: 'bold'
                }
            ).setOrigin(0.5);

            // Add hover/active states
            tabBackground.on('pointerover', () => {
                if (!isActive) {
                    tabBackground.setFillStyle(0x444444);
                    tabText.setColor('#ffffff');
                }
            });

            tabBackground.on('pointerout', () => {
                if (!isActive) {
                    tabBackground.setFillStyle(0x333333);
                    tabText.setColor('#cccccc');
                }
            });

            // Add click handler
            tabBackground.on('pointerdown', () => {
                this.soundManager.playSound('click');
                this.activeTab = tabKey === 'math' ? 'lesson' : tabKey;
                this.cleanupUI();
                this.setupUI();
            });
        });
    }

    createSettingsPanel(x, y, width, height) {
        // Create panel background with rounded corners for better appearance
        const panel = this.add.rectangle(x, y, width, height, 0x222222, 0.8)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0x3366cc);

        // Add rounded corners using a mask if not on mobile (performance consideration)
        if (!this.isMobile) {
            try {
                const graphics = this.add.graphics();
                graphics.fillStyle(0xffffff);
                graphics.fillRoundedRect(
                    x - width / 2,
                    y - height / 2,
                    width,
                    height,
                    16
                );
                panel.setMask(graphics.createGeometryMask());
            } catch (e) {
                console.log('Could not create rounded corners:', e);
            }
        }

        // Calculate content position - adjust for mobile
        const contentY = y - (this.isMobile ? height * 0.35 : height * 0.4);
        const contentWidth = this.isMobile ? width * 0.9 : width * 0.8;

        // Display different settings based on active tab
        switch (this.activeTab) {
            case 'speed':
                this.createSpeedSettings(x, contentY, contentWidth, height * 0.7);
                break;
            case 'monsters':
                this.createMonsterSettings(x, contentY, contentWidth, height * 0.7);
                break;
            case 'lesson':
                this.createLessonSettings(x, contentY, contentWidth, height * 0.7);
                break;
        }
    }

    createSpeedSettings(x, y, width, height) {
        const fields = [
            { label: 'Minimum Speed:', key: 'speedMin', min: 1, max: 100 },
            { label: 'Start Delay (seconds):', key: 'speedStartDelay', min: 0, max: 120 },
            { label: 'Speed Increment:', key: 'speedInc', min: 1, max: 50 },
            { label: 'Increment Every (seconds):', key: 'speedEvery', min: 1, max: 120 },
            { label: 'Maximum Speed:', key: 'speedMax', min: 10, max: 200 }
        ];

        this.createSettingsFields(x, y, fields);
    }

    createMonsterSettings(x, y, width, height) {
        const fields = [
            { label: 'Minimum Monsters:', key: 'monstersMin', min: 1, max: 10 },
            { label: 'Start Delay (seconds):', key: 'monstersStartDelay', min: 0, max: 120 },
            { label: 'Monster Increment:', key: 'monstersInc', min: 1, max: 5 },
            { label: 'Increment Every (seconds):', key: 'monstersEvery', min: 1, max: 120 },
            { label: 'Maximum Monsters:', key: 'monstersMax', min: 1, max: 20 }
        ];

        this.createSettingsFields(x, y, fields);

        // Add monster type selection (checkbox list) - adjust position for mobile
        const monsterTypes = ['monster1', 'monster2', 'badpig'];
        const monsterY = y + (this.isMobile ? 290 : 250);
        const scale = Math.min(this.cameras.main.width / 1024, this.cameras.main.height / 768);

        // Create a label with appropriate size for different devices
        this.add.text(
            this.isMobile && !this.isLandscape ? x : x - 150,
            monsterY,
            'Monster Types:',
            {
                fontFamily: 'Arial',
                fontSize: Math.round((this.isMobile ? 22 : 18) * scale),
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(this.isMobile && !this.isLandscape ? 0.5 : 0, 0.5);

        // For mobile portrait, stack checkboxes vertically
        if (this.isMobile && !this.isLandscape) {
            monsterTypes.forEach((monsterType, index) => {
                const isSelected = this.currentRules.monstersToUse.includes(monsterType);
                this.createCheckbox(
                    x,
                    monsterY + 40 + (index * 40),
                    monsterType,
                    isSelected,
                    (checked) => {
                        if (checked && !this.currentRules.monstersToUse.includes(monsterType)) {
                            this.currentRules.monstersToUse.push(monsterType);
                        } else if (!checked && this.currentRules.monstersToUse.includes(monsterType)) {
                            this.currentRules.monstersToUse = this.currentRules.monstersToUse.filter(type => type !== monsterType);
                        }
                    });
            });
        } else {
            // Horizontal layout for landscape
            monsterTypes.forEach((monsterType, index) => {
                const spacing = this.isMobile ? 110 : 100;
                const isSelected = this.currentRules.monstersToUse.includes(monsterType);
                this.createCheckbox(
                    x + (index - 1) * spacing,
                    monsterY,
                    monsterType,
                    isSelected,
                    (checked) => {
                        if (checked && !this.currentRules.monstersToUse.includes(monsterType)) {
                            this.currentRules.monstersToUse.push(monsterType);
                        } else if (!checked && this.currentRules.monstersToUse.includes(monsterType)) {
                            this.currentRules.monstersToUse = this.currentRules.monstersToUse.filter(type => type !== monsterType);
                        }
                    });
            });
        }
    }

    createLessonSettings(x, y, width, height) {
        const scale = Math.min(this.cameras.main.width / 1024, this.cameras.main.height / 768);
        const mobileScale = this.isMobile ? scale * 1.2 : scale;

        // Add lesson type selector with title
        this.add.text(x, y, 'Lesson Type:', {
            fontFamily: 'Arial',
            fontSize: Math.round((this.isMobile ? 22 : 20) * mobileScale),
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5);

        const lessonTypes = [
            { key: 'MULTIPLY_TABLE', label: 'Multiplication Table' },
            { key: 'MULTIPLY_RANDOM', label: 'Random Multiplication' },
            { key: 'ADDITION_RANDOM', label: 'Random Addition' },
            { key: 'SUBSTRACTION_RANDOM', label: 'Random Subtraction' }
        ];

        const currentType = this.getLessonTypeKey(this.currentRules.lessionType);

        // Adjust button arrangement for mobile portrait
        const btnWidth = this.isMobile && !this.isLandscape ? width * 0.7 : width * 0.5;
        const btnSpacing = this.isMobile ? 55 : 50;

        lessonTypes.forEach((type, index) => {
            const yPos = y + 40 + (index * btnSpacing);
            const isSelected = currentType === type.key;

            // Create clearer button background
            const buttonBg = this.add.rectangle(
                x,
                yPos,
                btnWidth,
                this.isMobile ? 44 : 40,
                isSelected ? 0x3366cc : 0x333333,
                1
            ).setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .setStrokeStyle(2, isSelected ? 0xffffff : 0x666666);

            // Add hover effects
            buttonBg.on('pointerover', () => {
                if (!isSelected) {
                    buttonBg.setFillStyle(0x444444);
                    buttonBg.setStrokeStyle(2, 0xaaaaaa);
                }
            });

            buttonBg.on('pointerout', () => {
                if (!isSelected) {
                    buttonBg.setFillStyle(0x333333);
                    buttonBg.setStrokeStyle(2, 0x666666);
                }
            });

            const buttonText = this.add.text(
                x,
                yPos,
                type.label,
                {
                    fontFamily: 'Arial',
                    fontSize: Math.round((this.isMobile ? 20 : 18) * mobileScale),
                    color: '#ffffff',
                    fontStyle: 'bold'
                }
            ).setOrigin(0.5);

            buttonBg.on('pointerdown', () => {
                this.soundManager.playSound('click');
                this.currentRules.lessionType = this.getLessonTypeValue(type.key);
                this.cleanupUI();
                this.setupUI();
            });
        });

        // Show additional fields based on the selected lesson type
        // Adjust vertical positioning for mobile
        const yOffset = y + (this.isMobile ? 260 : 240);

        if (currentType === 'MULTIPLY_TABLE') {
            const fields = [
                { label: 'Multiplication Table:', key: 'lessionMultiplyTable', min: 1, max: 12 }
            ];
            this.createSettingsFields(x, yOffset, fields);
        } else {
            const fields = [
                { label: 'Minimum Value:', key: 'lessionMinValue', min: 1, max: 100 },
                { label: 'Maximum Value:', key: 'lessionMaxValue', min: 1, max: 100 }
            ];
            this.createSettingsFields(x, yOffset, fields);

            // Add checkbox for negative results (only for subtraction)
            if (currentType === 'SUBSTRACTION_RANDOM') {
                const allowNegative = this.currentRules.lessionAllowNegativeResult || false;
                const checkboxY = this.isMobile ?
                    yOffset + 130 :
                    yOffset + 110;

                this.createCheckbox(
                    x,
                    checkboxY,
                    'Allow Negative Results',
                    allowNegative,
                    (checked) => {
                        this.currentRules.lessionAllowNegativeResult = checked;
                    }
                );
            }
        }
    }

    getLessonTypeKey(value) {
        const map = {
            0: 'MULTIPLY_TABLE',
            1: 'MULTIPLY_RANDOM',
            2: 'ADDITION_RANDOM',
            3: 'SUBSTRACTION_RANDOM'
        };
        return map[value] || 'MULTIPLY_TABLE';
    }

    getLessonTypeValue(key) {
        const map = {
            'MULTIPLY_TABLE': 0,
            'MULTIPLY_RANDOM': 1,
            'ADDITION_RANDOM': 2,
            'SUBSTRACTION_RANDOM': 3
        };
        return map[key] || 0;
    }

    createSettingsFields(x, y, fields) {
        const scale = Math.min(this.cameras.main.width / 1024, this.cameras.main.height / 768);
        const mobileScale = this.isMobile ? scale * 1.2 : scale;

        const fontSize = Math.round(this.isMobile ? 22 : 18);
        const sliderHeight = this.isMobile ? 16 : 10;
        const handleSize = this.isMobile ? 22 : 15;
        const spacing = this.isMobile ? 60 : 50;

        // Adjust layout for mobile portrait mode
        const labelOffset = this.isMobile && !this.isLandscape ? 150 : 200;
        const valueOffset = this.isMobile && !this.isLandscape ? 120 : 200;

        fields.forEach((field, index) => {
            const yPos = y + (index * spacing);

            // Add label
            this.add.text(x - labelOffset, yPos, field.label, {
                fontFamily: 'Arial',
                fontSize: fontSize * mobileScale,
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);

            // Add slider background with rounded corners
            const sliderWidth = this.isMobile && !this.isLandscape ? 200 : 300;
            const sliderBg = this.add.rectangle(x, yPos, sliderWidth, sliderHeight, 0x666666)
                .setOrigin(0.5);

            // Add rounded corners for slider background
            sliderBg.setStrokeStyle(1, 0x888888);

            // Calculate slider position based on current value
            const currentValue = this.currentRules[field.key] || field.min;
            const normalizedValue = (currentValue - field.min) / (field.max - field.min);
            const sliderMinX = x - sliderWidth / 2;
            const sliderMaxX = x + sliderWidth / 2;
            const sliderX = sliderMinX + (normalizedValue * sliderWidth);

            // Add slider track (filled portion)
            const trackWidth = normalizedValue * sliderWidth;
            const track = this.add.rectangle(
                sliderMinX + trackWidth / 2,
                yPos,
                trackWidth,
                sliderHeight,
                0x3399ff
            ).setOrigin(0.5);

            // Add slider handle
            const handle = this.add.circle(sliderX, yPos, handleSize, 0x3366cc)
                .setInteractive({ draggable: true, useHandCursor: true });

            // Enhance handle appearance
            handle.setStrokeStyle(2, 0xffffff);

            // Add value text
            const valueText = this.add.text(x + valueOffset, yPos, currentValue.toString(), {
                fontFamily: 'Arial',
                fontSize: fontSize * mobileScale,
                color: '#ffffff'
            }).setOrigin(0, 0.5);

            // Make the slider more interactive - allow clicking on the slider bar
            sliderBg.setInteractive({ useHandCursor: true }).on('pointerdown', (pointer) => {
                // Calculate the new value based on click position
                const newX = Phaser.Math.Clamp(pointer.x, sliderMinX, sliderMaxX);
                const newNormalizedValue = (newX - sliderMinX) / sliderWidth;
                const newValue = Math.round(field.min + newNormalizedValue * (field.max - field.min));

                // Update UI
                handle.x = newX;
                track.width = newX - sliderMinX;
                track.x = sliderMinX + track.width / 2;
                valueText.setText(newValue.toString());

                // Update data
                this.currentRules[field.key] = newValue;

                // Play a click sound
                this.soundManager.playSound('click');
            });

            // Enhanced slider drag logic
            handle.on('drag', (pointer, dragX) => {
                const newX = Phaser.Math.Clamp(dragX, sliderMinX, sliderMaxX);
                handle.x = newX;

                // Update track width
                track.width = newX - sliderMinX;
                track.x = sliderMinX + track.width / 2;

                const newNormalizedValue = (newX - sliderMinX) / sliderWidth;
                const newValue = Math.round(field.min + newNormalizedValue * (field.max - field.min));
                valueText.setText(newValue.toString());

                // Update current rules
                this.currentRules[field.key] = newValue;
            });
        });
    }

    createCheckbox(x, y, label, isChecked, onToggle) {
        const scale = Math.min(this.cameras.main.width / 1024, this.cameras.main.height / 768);
        const mobileScale = this.isMobile ? scale * 1.2 : scale;

        // Make checkbox bigger on mobile for easier touch
        const boxSize = this.isMobile ? 30 : 24;
        const innerSize = this.isMobile ? 22 : 16;

        // Create checkbox background
        const checkboxBg = this.add.rectangle(x, y, boxSize, boxSize, 0xffffff, 1)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0x000000);

        // Create checkbox fill
        const checkboxFill = this.add.rectangle(x, y, innerSize, innerSize, 0x3366cc, 1)
            .setOrigin(0.5)
            .setVisible(isChecked);

        // Make checkbox and surrounding area interactive with larger hit area
        const hitArea = new Phaser.Geom.Rectangle(
            -boxSize / 2 - (this.isMobile ? 30 : 20),
            -boxSize / 2 - (this.isMobile ? 30 : 20),
            boxSize + (this.isMobile ? 200 : 100),
            boxSize + (this.isMobile ? 60 : 40)
        );

        checkboxBg.setInteractive({
            hitArea: hitArea,
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true
        }).on('pointerdown', () => {
            this.soundManager.playSound('click');
            const newState = !checkboxFill.visible;
            checkboxFill.setVisible(newState);
            if (onToggle) onToggle(newState);
        });

        // Add label with adjusted size for mobile
        const fontSize = Math.round((this.isMobile ? 20 : 16) * mobileScale);
        const labelText = this.add.text(x + boxSize / 2 + 10, y, label, {
            fontFamily: 'Arial',
            fontSize: fontSize,
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        // Make the label clickable too
        labelText.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
            this.soundManager.playSound('click');
            const newState = !checkboxFill.visible;
            checkboxFill.setVisible(newState);
            if (onToggle) onToggle(newState);
        });

        return { bg: checkboxBg, fill: checkboxFill, label: labelText };
    }

    createPresetButtons(x, y) {
        const scale = Math.min(this.cameras.main.width / 1024, this.cameras.main.height / 768);
        const mobileScale = this.isMobile ? scale * 1.2 : scale;

        // Create a title for presets section
        this.add.text(x, this.isMobile ? y - 35 : y - 40, 'Presets:', {
            fontFamily: 'Arial',
            fontSize: Math.round((this.isMobile ? 24 : 20) * mobileScale),
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5);

        const presets = ['Easy', 'Medium', 'Hard', 'Custom'];

        // Adjust button size and layout for mobile
        const buttonWidth = this.isMobile ? 100 : 120;
        const spacing = buttonWidth + (this.isMobile ? 10 : 20);

        // On portrait mobile, arrange 2x2 rather than 1x4
        if (this.isMobile && !this.isLandscape) {
            // Create a 2x2 grid of buttons
            const buttonHeight = 50;
            const row1Y = y;
            const row2Y = y + buttonHeight + 10;

            // Calculate left position for buttons
            const col1X = x - spacing / 2;
            const col2X = x + spacing / 2;

            // Row 1: Easy, Medium
            this.createPresetButton(presets[0], col1X, row1Y, buttonWidth, mobileScale);
            this.createPresetButton(presets[1], col2X, row1Y, buttonWidth, mobileScale);

            // Row 2: Hard, Custom
            this.createPresetButton(presets[2], col1X, row2Y, buttonWidth, mobileScale);
            this.createPresetButton(presets[3], col2X, row2Y, buttonWidth, mobileScale);
        } else {
            // Standard horizontal arrangement
            const totalWidth = (buttonWidth * presets.length) + (spacing * (presets.length - 1));
            let startX = x - (totalWidth / 2) + (buttonWidth / 2);

            presets.forEach((preset, index) => {
                const buttonX = startX + (index * spacing);
                this.createPresetButton(preset, buttonX, y, buttonWidth, mobileScale);
            });
        }
    }

    createPresetButton(preset, x, y, width, scale) {
        const buttonColor = preset === 'Custom' ? '#aa6600' : '#0066aa';
        const hoverColor = preset === 'Custom' ? '#cc8800' : '#0088cc';

        const button = this.add.text(
            x,
            y,
            preset,
            {
                fontFamily: 'Arial',
                fontSize: Math.round(28 * scale),
                color: '#ffffff',
                backgroundColor: buttonColor,
                padding: {
                    left: Math.round(15 * scale),
                    right: Math.round(15 * scale),
                    top: Math.round(10 * scale),
                    bottom: Math.round(10 * scale)
                },
                fontStyle: 'bold',
                align: 'center'
            }
        ).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => button.setStyle({ backgroundColor: hoverColor }))
            .on('pointerout', () => button.setStyle({ backgroundColor: buttonColor }))
            .on('pointerdown', () => {
                this.soundManager.playSound('click');
                if (preset !== 'Custom') {
                    this.currentRules = { ...GAME_RULES_PRESETS[preset] };
                    this.cleanupUI();
                    this.setupUI();
                }
            });

        return button;
    }

    saveSettings() {
        // Convert speed and monster timing from seconds to milliseconds
        const rulesForSaving = { ...this.currentRules };
        rulesForSaving.speedStartDelay *= 1000;
        rulesForSaving.speedEvery *= 1000;
        rulesForSaving.monstersStartDelay *= 1000;
        rulesForSaving.monstersEvery *= 1000;

        // Save rules
        saveCustomRules(rulesForSaving);

        // Show confirmation with responsive sizing
        const scale = Math.min(this.cameras.main.width / 1024, this.cameras.main.height / 768);
        const fontSize = Math.round((this.isMobile ? 38 : 32) * scale);

        const confirmText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'Settings Saved!',
            {
                fontFamily: 'Arial',
                fontSize: fontSize,
                color: '#ffffff',
                backgroundColor: '#009900',
                padding: {
                    left: Math.round(30 * scale),
                    right: Math.round(30 * scale),
                    top: Math.round(20 * scale),
                    bottom: Math.round(20 * scale)
                },
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(1000);

        // Add a success animation
        this.tweens.add({
            targets: confirmText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 200,
            yoyo: true,
            repeat: 1
        });

        // Remove text after delay
        this.time.delayedCall(1500, () => {
            this.tweens.add({
                targets: confirmText,
                alpha: 0,
                y: confirmText.y - 50,
                duration: 500,
                onComplete: () => confirmText.destroy()
            });
        });
    }

    returnToMenu() {
        // Clean up event listeners
        window.removeEventListener('resize', this.handleResizeBound);

        // Return to menu scene
        this.scene.start('MenuScene');
    }
} 