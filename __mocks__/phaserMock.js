// __mocks__/phaserMock.js
// This is a very basic mock. Expand it as needed for your tests.
const Phaser = {
    GameObjects: {
        Container: jest.fn().mockImplementation(function () {
            this.add = jest.fn();
            this.remove = jest.fn();
            this.destroy = jest.fn();
            this.setActive = jest.fn().mockReturnThis();
            this.setVisible = jest.fn().mockReturnThis();
            this.setInteractive = jest.fn().mockReturnThis();
            this.on = jest.fn().mockReturnThis();
            this.off = jest.fn().mockReturnThis();
            this.emit = jest.fn();
            this.setScale = jest.fn().mockReturnThis();
            this.setOrigin = jest.fn().mockReturnThis();
            this.setPosition = jest.fn().mockReturnThis();
            this.setDepth = jest.fn().mockReturnThis();
            this.setAlpha = jest.fn().mockReturnThis();
            this.setAngle = jest.fn().mockReturnThis();
            // Mock other properties/methods as needed
            this.x = 0;
            this.y = 0;
            this.type = 'Container';
            this.scene = { // Mock scene reference if needed by GameObjects
                sound: {
                    add: jest.fn(() => ({
                        play: jest.fn(),
                        stop: jest.fn(),
                        destroy: jest.fn(),
                    })),
                },
                add: {
                    text: jest.fn().mockImplementation(() => ({
                        setOrigin: jest.fn().mockReturnThis(),
                        setText: jest.fn().mockReturnThis(),
                        setStyle: jest.fn().mockReturnThis(),
                        setInteractive: jest.fn().mockReturnThis(),
                        on: jest.fn().mockReturnThis(),
                        destroy: jest.fn(),
                        type: 'Text',
                        // ... other text methods/props
                    })),
                    image: jest.fn().mockImplementation(() => ({
                        setOrigin: jest.fn().mockReturnThis(),
                        setDisplaySize: jest.fn().mockReturnThis(),
                        destroy: jest.fn(),
                        type: 'Image',
                        // ... other image methods/props
                    })),
                    rectangle: jest.fn().mockImplementation(() => ({
                        setOrigin: jest.fn().mockReturnThis(),
                        setFillStyle: jest.fn().mockReturnThis(),
                        setStrokeStyle: jest.fn().mockReturnThis(),
                        destroy: jest.fn(),
                        type: 'Rectangle',
                        // ... other rectangle methods/props
                    })),
                    // Mock other scene.add methods
                },
                tweens: {
                    add: jest.fn(),
                },
                time: {
                    delayedCall: jest.fn(),
                    addEvent: jest.fn(() => ({
                        remove: jest.fn(),
                    })),
                },
                cameras: {
                    main: {
                        width: 800,
                        height: 600,
                        shake: jest.fn(),
                        // ... other camera props/methods
                    }
                },
                input: {
                    keyboard: {
                        on: jest.fn(),
                        off: jest.fn(),
                    }
                },
                // ... other scene properties/methods
            };
            return this;
        }),
        Text: jest.fn().mockImplementation(() => ({
            setOrigin: jest.fn().mockReturnThis(),
            setText: jest.fn().mockReturnThis(),
            setStyle: jest.fn().mockReturnThis(),
            setInteractive: jest.fn().mockReturnThis(),
            on: jest.fn().mockReturnThis(),
            destroy: jest.fn(),
            type: 'Text',
        })),
        Image: jest.fn().mockImplementation(() => ({
            setOrigin: jest.fn().mockReturnThis(),
            setDisplaySize: jest.fn().mockReturnThis(),
            destroy: jest.fn(),
            type: 'Image',
        })),
        Rectangle: jest.fn().mockImplementation(() => ({
            setOrigin: jest.fn().mockReturnThis(),
            setFillStyle: jest.fn().mockReturnThis(),
            setStrokeStyle: jest.fn().mockReturnThis(),
            destroy: jest.fn(),
            type: 'Rectangle',
        })),
        // Add other Phaser GameObjects as needed
    },
    Scene: jest.fn().mockImplementation(function (config) {
        this.sys = {
            game: {
                config: {
                    physics: {
                        arcade: { debug: false }
                    }
                }
            }
        };
        this.add = { // Mock scene.add for direct use in Scene constructor/methods
            text: jest.fn().mockImplementation(() => ({
                setOrigin: jest.fn().mockReturnThis(),
                setText: jest.fn().mockReturnThis(),
                setStyle: jest.fn().mockReturnThis(),
                setInteractive: jest.fn().mockReturnThis(),
                on: jest.fn().mockReturnThis(),
                destroy: jest.fn(),
                type: 'Text',
            })),
            image: jest.fn().mockImplementation(() => ({
                setOrigin: jest.fn().mockReturnThis(),
                setDisplaySize: jest.fn().mockReturnThis(),
                destroy: jest.fn(),
                type: 'Image',
            })),
            rectangle: jest.fn().mockImplementation(() => ({
                setOrigin: jest.fn().mockReturnThis(),
                setFillStyle: jest.fn().mockReturnThis(),
                setStrokeStyle: jest.fn().mockReturnThis(),
                destroy: jest.fn(),
                type: 'Rectangle',
            })),
            container: jest.fn().mockImplementation(() => new Phaser.GameObjects.Container()),
        };
        this.tweens = { add: jest.fn() };
        this.sound = { play: jest.fn(), add: jest.fn(() => ({ play: jest.fn(), stop: jest.fn(), destroy: jest.fn() })), init: jest.fn(), playMusic: jest.fn(), setupAutoPlayWorkaround: jest.fn(), stopMusic: jest.fn(), playSound: jest.fn() };
        this.input = { keyboard: { on: jest.fn(), off: jest.fn() } };
        this.scene = { start: jest.fn(), key: config ? config.key : 'TestScene' }; // Mock scene manager
        this.cameras = { main: { width: 800, height: 600, shake: jest.fn() } };
        this.children = { list: [] }; // Mock children list for cleanupUI
        this.time = { delayedCall: jest.fn(), addEvent: jest.fn(() => ({ remove: jest.fn() })) };
        // Mock other scene properties or methods used by your scenes
        return this;
    }),
    Math: {
        Between: jest.fn((min, max) => Math.floor(Math.random() * (max - min + 1)) + min),
    },
    Utils: {
        Array: {
            Shuffle: jest.fn(arr => arr), // Simple mock, doesn't actually shuffle
        }
    },
    Display: {
        Color: {
            HexStringToColor: jest.fn(hex => ({ color: parseInt(hex.slice(1), 16) }))
        }
    }
    // Add other Phaser namespaces (Geom, Input, etc.) as needed
};

module.exports = Phaser; 