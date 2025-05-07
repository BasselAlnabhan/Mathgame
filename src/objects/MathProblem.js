import { OPERATION_RANGES, DIFFICULTY_SETTINGS } from '../config/GameConfig';

export default class MathProblem {
    constructor(difficulty = 'Easy') {
        this.difficulty = difficulty;
        this.operationTypes = ['addition', 'subtraction', 'multiplication'];
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generateAdditionProblem() {
        const ranges = OPERATION_RANGES.addition[this.difficulty];

        const num1 = this.getRandomInt(ranges.min1, ranges.max1);
        const num2 = this.getRandomInt(ranges.min2, ranges.max2);

        return {
            text: `${num1} + ${num2}`,
            result: num1 + num2
        };
    }

    generateSubtractionProblem() {
        const ranges = OPERATION_RANGES.subtraction[this.difficulty];

        const num1 = this.getRandomInt(ranges.min1, ranges.max1);
        const num2 = this.getRandomInt(ranges.min2, Math.min(num1, ranges.max2 || num1)); // Ensure positive result

        return {
            text: `${num1} - ${num2}`,
            result: num1 - num2
        };
    }

    generateMultiplicationProblem() {
        const ranges = OPERATION_RANGES.multiplication[this.difficulty];

        const num1 = this.getRandomInt(ranges.min1, ranges.max1);
        const num2 = this.getRandomInt(ranges.min2, ranges.max2);

        return {
            text: `${num1} × ${num2}`,
            result: num1 * num2
        };
    }

    generateDivisionProblem() {
        // For division, ensure integer results and avoid division by zero
        let num2, num1;
        const difficulty = this.difficulty;
        // Use multiplication ranges for divisor/dividend
        const ranges = OPERATION_RANGES.multiplication[difficulty] || { min1: 1, max1: 10, min2: 1, max2: 10 };
        num2 = this.getRandomInt(ranges.min2, ranges.max2); // divisor
        const result = this.getRandomInt(ranges.min1, ranges.max1); // quotient
        num1 = num2 * result; // dividend
        return {
            text: `${num1} ÷ ${num2}`,
            result: result
        };
    }

    getNextProblem() {
        // Get available operations based on difficulty
        const availableOperations = DIFFICULTY_SETTINGS[this.difficulty].availableOperations;

        // Select a random operation from available ones
        const operation = availableOperations[Math.floor(Math.random() * availableOperations.length)];

        switch (operation) {
            case 'addition':
                return this.generateAdditionProblem();
            case 'subtraction':
                return this.generateSubtractionProblem();
            case 'multiplication':
                return this.generateMultiplicationProblem();
            case 'division':
                return this.generateDivisionProblem();
            default:
                return this.generateAdditionProblem();
        }
    }
} 