import MathProblem from '../../src/objects/MathProblem';
import { DIFFICULTY_SETTINGS, OPERATION_RANGES } from '../../src/config/GameConfig';

// Mock the config directly if needed, or rely on Jest to use the actuals if they don't have side effects
// jest.mock('../../src/config/GameConfig', () => ({
//   DIFFICULTY_SETTINGS: {
//     Easy: { availableOperations: ['addition', 'subtraction'] },
//     Medium: { availableOperations: ['addition', 'subtraction', 'multiplication'] },
//     Hard: { availableOperations: ['addition', 'subtraction', 'multiplication', 'division'] },
//   },
//   OPERATION_RANGES: {
//     addition: {
//       Easy: { min1: 1, max1: 10, min2: 1, max2: 10 },
//     },
//     subtraction: {
//       Easy: { min1: 1, max1: 10, min2: 1, max2: 10 }, // Ensure num1 >= num2 for positive result logic
//     },
//     multiplication: {
//       Easy: { min1: 1, max1: 5, min2: 1, max2: 5 },
//       Hard: { min1: 1, max1: 10, min2: 1, max2: 10 }, // For division test
//     },
//   },
// }));

describe('MathProblem', () => {
    let mathProblem;

    beforeEach(() => {
        mathProblem = new MathProblem('Easy'); // Default to Easy for setup
    });

    test('constructor sets default difficulty to Easy if not provided', () => {
        const mp = new MathProblem();
        expect(mp.difficulty).toBe('Easy');
    });

    test('setDifficulty updates the difficulty level', () => {
        mathProblem.setDifficulty('Hard');
        expect(mathProblem.difficulty).toBe('Hard');
    });

    describe('Math Problem Generation - Operation Types', () => {
        test("getNextProblem() returns 'addition' or 'subtraction' for 'Easy' difficulty", () => {
            mathProblem.setDifficulty('Easy');
            const easyOperations = DIFFICULTY_SETTINGS.Easy.availableOperations;
            for (let i = 0; i < 20; i++) { // Run multiple times for randomness
                const problem = mathProblem.getNextProblem();
                expect(easyOperations).toContain(problem.operationType);
            }
        });

        test("getNextProblem() returns 'addition', 'subtraction', or 'multiplication' for 'Medium' difficulty", () => {
            mathProblem.setDifficulty('Medium');
            const mediumOperations = DIFFICULTY_SETTINGS.Medium.availableOperations;
            const ops = new Set();
            for (let i = 0; i < 30; i++) {
                const problem = mathProblem.getNextProblem();
                expect(mediumOperations).toContain(problem.operationType);
                ops.add(problem.operationType);
            }
            expect(ops.size).toBe(mediumOperations.length);
        });

        test("getNextProblem() returns problems including 'division' for 'Hard' difficulty", () => {
            mathProblem.setDifficulty('Hard');
            const hardOperations = DIFFICULTY_SETTINGS.Hard.availableOperations;
            const ops = new Set();
            for (let i = 0; i < 50; i++) { // Run multiple times
                const problem = mathProblem.getNextProblem();
                expect(hardOperations).toContain(problem.operationType);
                ops.add(problem.operationType);
            }
            // Check if all expected operations were generated
            expect(ops.size).toBe(hardOperations.length);
            expect(ops.has('division')).toBe(true);
        });
    });

    describe('Math Problem Generation - Number Ranges & Integrity', () => {
        test('generateAdditionProblem() generates numbers within Easy ranges', () => {
            mathProblem.setDifficulty('Easy');
            const ranges = OPERATION_RANGES.addition.Easy;
            const problem = mathProblem.generateAdditionProblem();
            const [num1, num2] = problem.text.split(' + ').map(Number);
            expect(num1).toBeGreaterThanOrEqual(ranges.min1);
            expect(num1).toBeLessThanOrEqual(ranges.max1);
            expect(num2).toBeGreaterThanOrEqual(ranges.min2);
            expect(num2).toBeLessThanOrEqual(ranges.max2);
            expect(problem.result).toBe(num1 + num2);
        });

        test('generateSubtractionProblem() ensures positive result for Easy (num1 >= num2)', () => {
            mathProblem.setDifficulty('Easy');
            for (let i = 0; i < 20; i++) {
                const problem = mathProblem.generateSubtractionProblem();
                const [num1, num2] = problem.text.split(' - ').map(Number);
                expect(num1).toBeGreaterThanOrEqual(num2); // Key check for positive result constraint in your code
                expect(problem.result).toBe(num1 - num2);
                expect(problem.result).toBeGreaterThanOrEqual(0);
            }
        });

        test('generateMultiplicationProblem() generates numbers within Easy ranges', () => {
            mathProblem.setDifficulty('Easy');
            const ranges = OPERATION_RANGES.multiplication.Easy;
            const problem = mathProblem.generateMultiplicationProblem();
            const [num1, num2] = problem.text.split(' × ').map(Number);
            expect(num1).toBeGreaterThanOrEqual(ranges.min1);
            expect(num1).toBeLessThanOrEqual(ranges.max1);
            expect(num2).toBeGreaterThanOrEqual(ranges.min2);
            expect(num2).toBeLessThanOrEqual(ranges.max2);
            expect(problem.result).toBe(num1 * num2);
        });

        test('generateDivisionProblem() always produces integer results and avoids division by zero', () => {
            mathProblem.setDifficulty('Hard'); // Division is typically for Hard
            for (let i = 0; i < 20; i++) { // Run multiple times
                const problem = mathProblem.generateDivisionProblem();
                const [num1, num2] = problem.text.split(' ÷ ').map(Number);
                expect(num2).not.toBe(0);
                expect(num1 % num2).toBe(0);
                expect(problem.result).toBe(num1 / num2);
            }
        });
    });

    describe('getNextProblem() Output Structure', () => {
        test('getNextProblem() returns an object with text, result, and operationType', () => {
            const problem = mathProblem.getNextProblem();
            expect(problem).toHaveProperty('text');
            expect(typeof problem.text).toBe('string');
            expect(problem).toHaveProperty('result');
            expect(typeof problem.result).toBe('number');
            expect(problem).toHaveProperty('operationType');
            expect(typeof problem.operationType).toBe('string');
        });
    });
}); 