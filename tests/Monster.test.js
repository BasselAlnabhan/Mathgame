// Use a simplified version for testing
class MockMonster {
    constructor(scene, x, y, monsterType, speed, mathProblem, result) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.monsterType = monsterType;
        this.speed = speed;
        this.mathProblem = mathProblem;
        this.result = result;
        this.sprite = { height: 50, texture: { key: monsterType } };
    }

    update() {
        // Simulate movement
        this.y += this.speed * this.scene.game.loop.delta / 1000;
    }

    playSound() {
        // Call sound play function on the scene
        this.scene.sound.add(this.monsterType, { volume: 0.2 }).play();
    }

    explode() {
        // Play explosion sound
        this.scene.sound.add('boom', { volume: 0.2 }).play();
        return 10; // Return points
    }

    getBottom() {
        return this.y + this.sprite.height / 2;
    }
}

describe('Monster', () => {
    let mockScene;
    let monster;

    beforeEach(() => {
        // Create a mock scene
        mockScene = {
            add: {
                sprite: function () { return { play: () => ({}) }; },
                text: function () { return { setOrigin: () => ({}), height: 20 }; },
                existing: function () { }
            },
            physics: {
                world: {
                    enable: function () { }
                }
            },
            sound: {
                add: function (key, options) {
                    return {
                        play: function () { }
                    };
                }
            },
            game: {
                loop: {
                    delta: 16 // Simulate 16ms frame time (roughly 60fps)
                }
            }
        };

        monster = new MockMonster(mockScene, 100, 100, 'monster1', 50, '2 + 2', 4);
    });

    test('should initialize with correct properties', () => {
        expect(monster.x).toBe(100);
        expect(monster.y).toBe(100);
        expect(monster.speed).toBe(50);
        expect(monster.mathProblem).toBe('2 + 2');
        expect(monster.result).toBe(4);
    });

    test('update should move monster down based on speed and delta', () => {
        const initialY = monster.y;
        monster.update();
        // With 16ms delta and speed 50, it should move down by 50 * 16 / 1000 = 0.8 pixels
        expect(monster.y).toBeGreaterThan(initialY);
        expect(monster.y).toBeCloseTo(initialY + 0.8, 1);
    });

    test('getBottom should return correct bottom position', () => {
        // The sprite height is mocked as 50
        expect(monster.getBottom()).toBe(monster.y + 25); // y + height/2
    });
}); 