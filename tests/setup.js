// Create basic Jest mocking functionality for our tests
global.jest = {
    fn: () => {
        const mockFn = (...args) => {
            mockFn.mock.calls.push(args);
            return mockFn.mockReturnValue;
        };
        mockFn.mock = { calls: [] };
        mockFn.mockReturnThis = () => {
            mockFn.mockReturnValue = mockFn;
            return mockFn;
        };
        mockFn.mockReturnValue = undefined;
        mockFn.mockImplementation = (impl) => {
            mockFn.mockImpl = impl;
            return mockFn;
        };
        return mockFn;
    }
};

// Mock Phaser for testing
global.Phaser = {
    Game: class Game { },
    Scene: class Scene {
        constructor() { }
    },
    GameObjects: {
        Container: class Container {
            constructor() { }
            setPosition() { return this; }
            add() { return this; }
        },
        Sprite: class Sprite {
            constructor() { }
            play() { return this; }
            setOrigin() { return this; }
            setScale() { return this; }
        },
        Text: class Text {
            constructor() { }
            setOrigin() { return this; }
            setText() { return this; }
        }
    },
    Math: {
        Between: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
    },
    Input: {
        Keyboard: {
            KeyCodes: {
                ENTER: 13,
                BACKSPACE: 8
            }
        }
    },
    Scale: {
        FIT: 'FIT',
        CENTER_BOTH: 'CENTER_BOTH'
    }
};

// Mock for window.addEventListener
global.window = {
    addEventListener: () => { }
}; 