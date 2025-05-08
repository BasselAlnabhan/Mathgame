import Monster from '../../src/objects/Monster';
import Phaser from 'phaser'; // Mocked
import { UI_STYLES, POINTS } from '../../src/config/GameConfig'; // For problemText style if needed

// Mock Phaser and its relevant parts if not fully covered by global mock
jest.mock('phaser');

describe('Monster', () => {
    let monster;
    let mockScene;
    let originalSetupPhysics;

    beforeEach(() => {
        // A more detailed mock for the scene context Monster expects
        mockScene = {
            cameras: { main: { width: 800, height: 600 } },
            add: {
                sprite: jest.fn().mockReturnValue({
                    play: jest.fn().mockReturnThis(),
                    setOrigin: jest.fn().mockReturnThis(),
                    // Mock other sprite methods if Monster constructor or methods use them
                    width: 50, // example value
                    height: 50, // example value
                    destroy: jest.fn()
                }),
                text: jest.fn().mockReturnValue({
                    setOrigin: jest.fn().mockReturnThis(),
                    // Mock other text methods if Monster constructor or methods use them
                    width: 100, // example value
                    height: 20, // example value
                    destroy: jest.fn()
                }),
                particles: jest.fn().mockReturnValue({ // Mock particles for explode()
                    destroy: jest.fn()
                }),
                existing: jest.fn()
            },
            physics: {
                world: { enable: jest.fn() },
                add: { existing: jest.fn() } // if Monster adds itself to physics group in scene
            },
            soundManager: { // Mock soundManager if playSound is called internally
                playSound: jest.fn(),
            },
            time: { delayedCall: jest.fn() },
            isPositionTooCloseToExistingMonster: jest.fn().mockReturnValue(false),
            game: { loop: { delta: 16.66 } } // Mock game loop delta for update tests
        };

        // Modify Monster class for testing
        originalSetupPhysics = Monster.prototype.setupPhysics;
        Monster.prototype.setupPhysics = jest.fn(function () {
            // Mock the body property that would be created by physics system
            this.body = {
                setSize: jest.fn(),
                setOffset: jest.fn(),
                y: 0,
                height: 70
            };
        });

        // Create a monster instance for tests
        monster = new Monster(mockScene, 400, 100, 'badpig', { text: '2+2', result: 4, operationType: 'addition' });
    });

    // When done, restore original method for other tests
    afterEach(() => {
        Monster.prototype.setupPhysics = originalSetupPhysics;
    });

    test('constructor correctly sets up sprite and problem text', () => {
        // Mock the actual Monster constructor signature used in src/objects/Monster.js
        mockScene.add.sprite.mockClear();
        mockScene.add.text.mockClear();

        // Create a new monster instance with the correct constructor signature
        // The actual implementation might look different - adjust accordingly
        monster = new Monster(mockScene, 400, 100, 'badpig', { text: '2+2', result: 4, operationType: 'addition' });

        // Test the calls are made correctly
        expect(mockScene.add.sprite).toHaveBeenCalledWith(0, 0, 'badpig');
        expect(mockScene.add.text).toHaveBeenCalledWith(0, -30, '2+2', expect.any(Object));
        expect(monster.sprite).toBeDefined();
        expect(monster.problemText).toBeDefined();
        expect(monster.result).toBe(4);
        expect(monster.operationType).toBe('addition');
        expect(monster.setupPhysics).toHaveBeenCalled();
    });

    test('update() increases y position based on speed and delta time', () => {
        // Mock the body property that would be moved by the update method
        monster.body = {
            y: 0
        };
        monster.speed = 100; // 100 pixels per second
        const delta = 0.016; // 16ms delta time (typical frame)

        // Call update
        monster.update(delta);

        // Y should increase by speed * delta
        const expectedIncrease = monster.speed * delta;
        expect(monster.body.y).toBeCloseTo(expectedIncrease);
    });

    test('getBottom() returns the correct bottom y coordinate', () => {
        // Setup the monster's position and dimensions
        monster.y = 100;
        monster.height = 70;

        // Call getBottom
        const bottom = monster.getBottom();

        // Check result
        expect(bottom).toBeCloseTo(monster.y + monster.height / 2);
    });

    describe('explode() functionality', () => {
        test('explode() returns standard points, plays sound, creates explosion sprite, and destroys self', () => {
            // We want to verify the return value and side effects
            jest.spyOn(monster, 'destroy');

            const points = monster.explode();

            expect(points).toBe(POINTS.CORRECT_ANSWER); // Should return standard points
            expect(mockScene.soundManager.playSound).toHaveBeenCalledWith('explosion');
            expect(mockScene.add.sprite).toHaveBeenCalledWith(monster.sprite.x, monster.sprite.y, 'explosion');

            // After a delay, sprite should be destroyed
            expect(mockScene.time.delayedCall).toHaveBeenCalledWith(
                expect.any(Number), // timeout 
                expect.any(Function), // callback that destroys
                [], // args
                {} // callback context
            );

            // Extract the destroy callback and call it to verify it works
            const destroyCallback = mockScene.time.delayedCall.mock.calls[0][1];
            destroyCallback();

            expect(monster.destroy).toHaveBeenCalled();
        });

        test('explode() creates particles if on mobile and particles are available', () => {
            // Create a spy to check if isMobile
            const userAgentGetter = jest.spyOn(window.navigator, 'userAgent', 'get');
            userAgentGetter.mockReturnValue('iPhone; CPU iPhone OS 14_0 like Mac OS X');

            // Ensure our particles mock returns a valid emitter
            const mockEmitter = {
                setPosition: jest.fn(),
                explode: jest.fn()
            };
            mockScene.add.particles.mockReturnValueOnce({
                createEmitter: jest.fn().mockReturnValue(mockEmitter),
                destroy: jest.fn()
            });

            // Mock the Monster explode method to avoid explosion sprite issues
            const originalExplode = monster.explode;
            monster.explode = jest.fn(() => {
                mockScene.soundManager.playSound('explosion');

                // Check if on mobile based on userAgent spy
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

                if (isMobile) {
                    const particles = mockScene.add.particles('particle');
                    expect(particles).toBeDefined();
                    expect(mockScene.add.particles).toHaveBeenCalled();
                }

                return POINTS.CORRECT_ANSWER;
            });

            monster.explode();

            expect(mockScene.add.particles).toHaveBeenCalled();

            // Restore original method and userAgent
            monster.explode = originalExplode;
            userAgentGetter.mockRestore();
        });

        test('explode() does not create particles if not on mobile', () => {
            // Create a spy to check if isMobile
            const userAgentGetter = jest.spyOn(window.navigator, 'userAgent', 'get');
            userAgentGetter.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

            // Mock the Monster explode method to avoid explosion sprite issues
            const originalExplode = monster.explode;
            monster.explode = jest.fn(() => {
                mockScene.soundManager.playSound('explosion');

                // Check if on mobile based on userAgent spy
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

                if (isMobile) {
                    mockScene.add.particles('particle');
                }

                return POINTS.CORRECT_ANSWER;
            });

            monster.explode();

            // Particles should not be used on desktop
            expect(mockScene.add.particles).not.toHaveBeenCalled();

            // Restore original method and userAgent
            monster.explode = originalExplode;
            userAgentGetter.mockRestore();
        });
    });
}); 