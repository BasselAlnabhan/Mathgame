import Phaser from 'phaser';
import UIFactory from '../managers/UIFactory';
import SoundManager from '../managers/SoundManager';
import { GAME_RULES_PRESETS, saveCustomRules, loadCustomRules } from '../config/GameConfig';

// Improved logical presets with more comprehensive settings
const LOGICAL_PRESETS = {
    Easy: { 
        speedMin: 1, 
        speedMax: 50, 
        speedInc: 1,
        speedEvery: 10,
        speedStartDelay: 5,
        monstersMin: 1, 
        monstersMax: 5,
        monstersInc: 1,
        monstersEvery: 20,
        monstersStartDelay: 5,
        monstersToUse: ['monster1', 'monster2'],
        lessionType: 2, // Addition
        lessionMinValue: 1,
        lessionMaxValue: 10,
        arithmeticDifficulty: 'Easy Addition'
    },
    Medium: { 
        speedMin: 30, 
        speedMax: 100, 
        speedInc: 2,
        speedEvery: 10,
        speedStartDelay: 3,
        monstersMin: 3, 
        monstersMax: 10,
        monstersInc: 1,
        monstersEvery: 15,
        monstersStartDelay: 3,
        monstersToUse: ['monster1', 'monster2', 'badpig'],
        lessionType: 2, // Addition
        lessionMinValue: 1,
        lessionMaxValue: 20,
        arithmeticDifficulty: 'Medium Addition'
    },
    Hard: { 
        speedMin: 50, 
        speedMax: 150, 
        speedInc: 3,
        speedEvery: 8,
        speedStartDelay: 2,
        monstersMin: 5, 
        monstersMax: 15,
        monstersInc: 2,
        monstersEvery: 10,
        monstersStartDelay: 2,
        monstersToUse: ['monster1', 'monster2', 'badpig'],
        lessionType: 1, // Multiply
        lessionMinValue: 2,
        lessionMaxValue: 12,
        arithmeticDifficulty: 'Hard Multiplication'
    }
};

export default class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
        this.isLandscape = true;
        this.isMobile = false;
        this.currentRules = loadCustomRules() || { ...LOGICAL_PRESETS.Medium };
        this.activeTab = 'speed';
        this.currentPreset = this.detectCurrentPreset();
        this.presetButtons = {};

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
        // More thorough cleanup - first destroy all game objects
        this.children.each(child => {
            if (child) {
                child.destroy(true);
            }
        });

        // Clear any remaining containers and complex objects
        this.children.removeAll(true);
        
        // Reset any cached references
        this.presetButtons = {};
        
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

        // Add a semi-transparent overlay for better readability
        this.add.rectangle(
            width / 2,
            height / 2,
            width * 0.9,
            height * 0.9,
            0x000000,
            0.7
        ).setOrigin(0.5);

        // Add title with modern styling
        const titleSize = this.isMobile && !this.isLandscape ? 40 : 56;
        this.add.text(
            width / 2,
            this.isMobile ? height * 0.06 : height * 0.08,
            'GAME SETTINGS',
            {
                fontFamily: 'Arial',
                fontSize: titleSize,
                color: '#ffffff',
                fontStyle: 'bold',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Create tabs with original tab names
        this.createTabs(
            width / 2,
            this.isMobile ? height * 0.14 : height * 0.16,
            ['Speed', 'Monsters', 'Math', 'Arithmetic']
        );

        // Adjust panel position to match new tab position
        const panelWidth = this.isMobile ? width * 0.95 : width * 0.8;
        const panelHeight = this.isMobile ? height * 0.55 : height * 0.5;
        const panelY = this.isMobile ? height * 0.25 : height * 0.26;

        this.createSettingsPanel(
            width / 2,
            panelY,
            panelWidth,
            panelHeight
        );

        // Add preset title
        const presetTitleY = this.isMobile ? height * 0.67 : height * 0.7;
        this.add.text(
            width / 2,
            presetTitleY,
            'Presets:',
            {
                fontFamily: 'Arial',
                fontSize: Math.round(24 * scale),
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5, 0.5);

        // Add preset buttons with modern design
        this.createPresetButtons(
            width / 2,
            this.isMobile ? height * 0.72 : height * 0.75,
            ['Easy', 'Medium', 'Hard', 'Custom']
        );

        // Add save and back buttons with improved styling
        const buttonSize = this.isMobile ? 1.2 : 1;
        const buttonY = this.isMobile ? height * 0.85 : height * 0.85;

        const saveButtonX = this.isMobile && !this.isLandscape ?
            width / 2 :
            width * 0.6;

        const backButtonX = this.isMobile && !this.isLandscape ?
            width / 2 :
            width * 0.4;

        const backButtonY = this.isMobile && !this.isLandscape ?
            height * 0.93 :
            buttonY;

        this.createButton('SAVE', saveButtonX, buttonY, '#00aa00', '#00cc00', () => {
            this.soundManager.playSound('click');
            this.saveSettings();
        });

        this.createButton('BACK', backButtonX, backButtonY, '#aa0000', '#cc0000', () => {
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

        // Highest z-index/depth for tabs
        const TAB_DEPTH = 100;

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

            // Explicitly set a high depth
            tabBackground.setDepth(TAB_DEPTH);

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
            
            // Set same high depth for text
            tabText.setDepth(TAB_DEPTH);

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
        
        // Set panel depth below tabs but above background
        panel.setDepth(10);

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
            case 'arithmetic':
                this.createArithmeticSettings(x, contentY, contentWidth, height * 0.7);
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
        const width = this.cameras.main.width;
        const scale = Math.min(width / 1024, this.cameras.main.height / 768);
        const fontSize = Math.round(this.isMobile ? 18 : 16);
        const spacing = this.isMobile ? 50 : 40;

        // Set depths for different UI elements
        const SETTINGS_BASE_DEPTH = 20;

        // Adjust layout based on orientation and device type
        const labelWidth = this.isMobile && !this.isLandscape ? width * 0.8 : width * 0.4;
        
        // Calculate positions based on available space
        const availableWidth = this.cameras.main.width * 0.7;
        
        // Right-align labels
        const labelX = this.isMobile && !this.isLandscape ? 
            x - availableWidth/4 : 
            x - availableWidth/3;
        
        // Button group position (where slider used to be)
        const buttonGroupX = this.isMobile && !this.isLandscape ? x : x;

        fields.forEach((field, index) => {
            const yPos = y + (index * spacing);

            // Add right-aligned label with contrasting background
            const label = this.add.text(
                labelX, 
                yPos, 
                field.label, 
                {
                    fontFamily: 'Arial',
                    fontSize: fontSize * scale,
                    color: '#ffffff',
                    fontStyle: 'bold',
                    backgroundColor: '#333333',
                    padding: { x: 6, y: 3 }
                }
            );
            label.setOrigin(1, 0.5).setDepth(SETTINGS_BASE_DEPTH);

            // Get current value
            const currentValue = this.currentRules[field.key] || field.min;
            
            // Generate discrete button values
            const range = field.max - field.min;
            const numButtons = Math.min(5, range); // Max 5 buttons 
            const buttonValues = [];
            
            // Determine values for buttons
            if (range <= numButtons) {
                // If range is small, show all values
                for (let i = 0; i <= range; i++) {
                    buttonValues.push(field.min + i);
                }
            } else {
                // Otherwise calculate reasonable steps
                for (let i = 0; i < numButtons; i++) {
                    const value = Math.round(field.min + (range * i / (numButtons - 1)));
                    buttonValues.push(value);
                }
                
                // Make sure max value is included
                if (buttonValues[buttonValues.length - 1] !== field.max) {
                    buttonValues[buttonValues.length - 1] = field.max;
                }
            }
                
            // Calculate button dimensions
            const buttonGroupWidth = this.isMobile && !this.isLandscape ? 
                availableWidth * 0.6 : 
                availableWidth * 0.4;
                
            const buttonWidth = buttonGroupWidth / buttonValues.length;
            const buttonHeight = this.isMobile ? 40 : 30;
            
            // Create button group container
            const buttonContainer = this.add.container(buttonGroupX, yPos);
            buttonContainer.setDepth(SETTINGS_BASE_DEPTH);
            
            // Create buttons
            buttonValues.forEach((value, i) => {
                const isSelected = currentValue === value;
                const buttonX = (i - buttonValues.length/2 + 0.5) * buttonWidth;
                
                // Button background
                const buttonBg = this.add.rectangle(
                    buttonX, 
                    0, 
                    buttonWidth - 4, 
                    buttonHeight, 
                    isSelected ? 0x3366cc : 0x555555,
                    1
                ).setOrigin(0.5);
                
                buttonBg.setStrokeStyle(2, isSelected ? 0xffffff : 0x888888);
                
                // Button text
                const buttonText = this.add.text(
                    buttonX,
                    0,
                    value.toString(),
                    {
                        fontFamily: 'Arial',
                        fontSize: (fontSize - 2) * scale,
                        color: '#ffffff',
                        fontStyle: isSelected ? 'bold' : 'normal'
                    }
                ).setOrigin(0.5);
                
                // Make button interactive
                buttonBg.setInteractive({ useHandCursor: true });
                
                // Add hover effects
                buttonBg.on('pointerover', () => {
                    if (!isSelected) {
                        buttonBg.setFillStyle(0x666666);
                    }
                });
                
                buttonBg.on('pointerout', () => {
                    if (!isSelected) {
                        buttonBg.setFillStyle(0x555555);
                    }
                });
                
                // Add click handler
                buttonBg.on('pointerdown', () => {
                    this.soundManager.playSound('click');
                    
                    // Update the value
                    this.currentRules[field.key] = value;
                    
                    // Change to custom preset
                    this.currentPreset = 'Custom';
                    this.updatePresetButtons();
                    
                    // Refresh the UI to update button states
                    this.cleanupUI();
                    this.setupUI();
                });
                
                // Add to container
                buttonContainer.add(buttonBg);
                buttonContainer.add(buttonText);
            });
        });
    }

    createCheckbox(x, y, label, isChecked, onToggle) {
        const scale = Math.min(this.cameras.main.width / 1024, this.cameras.main.height / 768);

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

        // Make checkbox and label positioned in a container for proper hit area
        const container = this.add.container(0, 0);
        container.add(checkboxBg);
        container.add(checkboxFill);

        // Add label with adjusted size for mobile
        const fontSize = Math.round((this.isMobile ? 20 : 16) * scale);
        const labelText = this.add.text(x + boxSize / 2 + 10, y, label, {
            fontFamily: 'Arial',
            fontSize: fontSize,
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        
        container.add(labelText);

        // Set container to interactive with precise hit area
        const hitAreaWidth = boxSize + labelText.width + 20;
        const hitAreaHeight = Math.max(boxSize, labelText.height) + 10;
        
        container.setSize(hitAreaWidth, hitAreaHeight);
        container.setInteractive({ useHandCursor: true });
        
        // Position the hit area correctly
        container.input.hitArea.x = x - boxSize/2;
        container.input.hitArea.y = y - hitAreaHeight/2;
        
        container.on('pointerdown', () => {
            this.soundManager.playSound('click');
            const newState = !checkboxFill.visible;
            checkboxFill.setVisible(newState);
            if (onToggle) onToggle(newState);
        });

        // Make container appear on top
        container.setDepth(2);

        return { bg: checkboxBg, fill: checkboxFill, label: labelText, container: container };
    }

    createPresetButtons(x, y, presets) {
        const width = this.cameras.main.width;
        const buttonSpacing = this.isMobile ? 15 : 10;
        
        // Initialize presetButtons object if not already initialized
        this.presetButtons = {};
        
        // Increase button size on mobile
        const buttonWidth = this.isMobile ? width * 0.2 : width * 0.15;
        const buttonHeight = this.isMobile ? 50 : 40;
        
        // Calculate total width needed for all buttons in a row
        const totalButtonWidth = (presets.length * buttonWidth) + ((presets.length - 1) * buttonSpacing);
        
        // Calculate starting X position to center the row of buttons
        const startX = x - (totalButtonWidth / 2) + (buttonWidth / 2);
        
        // Create presets in a single row
        presets.forEach((preset, index) => {
            const buttonX = startX + (index * (buttonWidth + buttonSpacing));
            const buttonY = y;
            
            const isActive = preset === this.currentPreset;
            const bg = this.add.rectangle(
                buttonX,
                buttonY,
                buttonWidth,
                buttonHeight,
                isActive ? 0x3366cc : 0x555555
            ).setStrokeStyle(2, isActive ? 0xffffff : 0x888888);
            
            const text = this.add.text(
                buttonX,
                buttonY,
                preset,
                {
                    fontFamily: 'Arial',
                    fontSize: this.isMobile ? 18 : 16,
                    color: '#ffffff',
                    fontStyle: isActive ? 'bold' : 'normal'
                }
            ).setOrigin(0.5);
            
            // Make button interactive
            bg.setInteractive({ useHandCursor: true });
            
            // Add hover and press effects
            bg.on('pointerover', () => {
                if (!isActive) {
                    bg.setFillStyle(0x666666);
                }
            });
            
            bg.on('pointerout', () => {
                if (!isActive) {
                    bg.setFillStyle(0x555555);
                }
            });
            
            bg.on('pointerdown', () => {
                this.soundManager.playSound('click');
                this.applyPreset(preset);
                this.updatePresetButtons();
            });
            
            // Store references to update active state later
            this.presetButtons[preset] = { bg, text };
        });
    }

    updatePresetButtons() {
        // Update button appearances based on current preset
        for (const preset in this.presetButtons) {
            const isActive = preset === this.currentPreset;
            const button = this.presetButtons[preset];
            
            // Update button style
            const backgroundColor = isActive ? 
                0x3366cc : 
                0x555555;
                
            button.bg.setFillStyle(backgroundColor);
            button.bg.setStrokeStyle(2, isActive ? 0xffffff : 0x888888);
            button.text.setStyle({
                fontStyle: isActive ? 'bold' : 'normal'
            });
        }
    }
    
    applyPreset(preset) {
        if (preset !== 'Custom') {
            this.currentRules = { ...LOGICAL_PRESETS[preset] };
            this.currentPreset = preset;
            
            // Refresh the UI to reflect the new settings
            this.cleanupUI();
            this.setupUI();
        }
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

    // Add a new method to create arithmetic settings
    createArithmeticSettings(x, y, width, height) {
        const arithmeticText = this.add.text(
            x, y, 'Select Arithmetic Difficulty:', {
                fontFamily: 'Arial',
                fontSize: 24,
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        // Example options for arithmetic difficulty
        const difficulties = ['Easy Addition', 'Hard Addition', 'Easy Subtraction', 'Hard Subtraction'];
        difficulties.forEach((difficulty, index) => {
            this.add.text(
                x, y + 30 * (index + 1), difficulty, {
                    fontFamily: 'Arial',
                    fontSize: 20,
                    color: '#ffffff'
                }
            ).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.soundManager.playSound('click');
                this.currentRules.arithmeticDifficulty = difficulty;
            });
        });
    }

    // Update isPreset method to use logical presets
    isPreset(preset) {
        const presetRules = LOGICAL_PRESETS[preset];
        // Only check key settings that define the preset
        const keySettings = ['speedMin', 'speedMax', 'monstersMin', 'monstersMax'];
        return keySettings.every(key => this.currentRules[key] === presetRules[key]);
    }

    // Add a helper method to create buttons with improved styling
    createButton(text, x, y, color, hoverColor, onClick) {
        const button = this.add.text(
            x,
            y,
            text,
            {
                fontFamily: 'Arial',
                fontSize: Math.round(36 * (this.isMobile ? 1.2 : 1)),
                color: '#ffffff',
                backgroundColor: color,
                padding: {
                    left: 40,
                    right: 40,
                    top: 25,
                    bottom: 25
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
            .on('pointerover', () => button.setStyle({ backgroundColor: hoverColor }))
            .on('pointerout', () => button.setStyle({ backgroundColor: color }))
            .on('pointerdown', onClick);
    }

    // Add method to detect which preset the current settings match
    detectCurrentPreset() {
        for (const preset of ['Easy', 'Medium', 'Hard']) {
            if (this.isPreset(preset)) {
                return preset;
            }
        }
        return 'Custom';
    }
} 