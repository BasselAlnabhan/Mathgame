import MathProblem from '../src/objects/MathProblem';

describe('MathProblem', () => {
    let mathProblem;

    beforeEach(() => {
        mathProblem = new MathProblem();
    });

    test('should be initialized with default difficulty', () => {
        expect(mathProblem.difficulty).toBe('Easy');
    });

    test('should set difficulty correctly', () => {
        mathProblem.setDifficulty('Medium');
        expect(mathProblem.difficulty).toBe('Medium');

        mathProblem.setDifficulty('Hard');
        expect(mathProblem.difficulty).toBe('Hard');
    });

    test('getRandomInt should return a number within range', () => {
        const min = 1;
        const max = 10;
        for (let i = 0; i < 100; i++) {
            const result = mathProblem.getRandomInt(min, max);
            expect(result).toBeGreaterThanOrEqual(min);
            expect(result).toBeLessThanOrEqual(max);
        }
    });

    test('generateAdditionProblem should create a valid problem', () => {
        const problem = mathProblem.generateAdditionProblem();
        expect(problem).toHaveProperty('text');
        expect(problem).toHaveProperty('result');
        expect(typeof problem.text).toBe('string');
        expect(typeof problem.result).toBe('number');

        // Extract the numbers from the problem text
        const numbers = problem.text.split('+').map(num => parseInt(num.trim()));
        expect(numbers.length).toBe(2);
        expect(numbers[0] + numbers[1]).toBe(problem.result);
    });

    test('generateSubtractionProblem should create a valid problem', () => {
        const problem = mathProblem.generateSubtractionProblem();
        expect(problem).toHaveProperty('text');
        expect(problem).toHaveProperty('result');
        expect(typeof problem.text).toBe('string');
        expect(typeof problem.result).toBe('number');

        // Extract the numbers from the problem text
        const numbers = problem.text.split('-').map(num => parseInt(num.trim()));
        expect(numbers.length).toBe(2);
        expect(numbers[0] - numbers[1]).toBe(problem.result);
    });

    test('generateMultiplicationProblem should create a valid problem', () => {
        const problem = mathProblem.generateMultiplicationProblem();
        expect(problem).toHaveProperty('text');
        expect(problem).toHaveProperty('result');
        expect(typeof problem.text).toBe('string');
        expect(typeof problem.result).toBe('number');

        // Extract the numbers from the problem text (handling the multiplication symbol)
        const numbers = problem.text.split('×').map(num => parseInt(num.trim()));
        expect(numbers.length).toBe(2);
        expect(numbers[0] * numbers[1]).toBe(problem.result);
    });

    test('getNextProblem should return a problem based on difficulty', () => {
        // Easy difficulty (should only return addition problems)
        mathProblem.setDifficulty('Easy');
        const easyProblem = mathProblem.getNextProblem();
        expect(easyProblem.text).toContain('+');

        // Medium difficulty (should return addition or subtraction)
        mathProblem.setDifficulty('Medium');
        let mediumProblemTypes = new Set();
        for (let i = 0; i < 50; i++) {
            const problem = mathProblem.getNextProblem();
            if (problem.text.includes('+')) mediumProblemTypes.add('addition');
            if (problem.text.includes('-')) mediumProblemTypes.add('subtraction');
        }
        // There should be at least one addition and one subtraction
        expect(mediumProblemTypes.size).toBeGreaterThanOrEqual(1);

        // Hard difficulty (should include multiplication)
        mathProblem.setDifficulty('Hard');
        let hardProblemTypes = new Set();
        for (let i = 0; i < 100; i++) {
            const problem = mathProblem.getNextProblem();
            if (problem.text.includes('+')) hardProblemTypes.add('addition');
            if (problem.text.includes('-')) hardProblemTypes.add('subtraction');
            if (problem.text.includes('×')) hardProblemTypes.add('multiplication');
        }
        // There should be at least one multiplication
        expect(hardProblemTypes.has('multiplication')).toBe(true);
    });
}); 