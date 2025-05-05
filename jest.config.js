export default {
    transform: {},
    testEnvironment: 'node',
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    transformIgnorePatterns: [
        'node_modules/(?!(phaser)/)'
    ],
    // Mock Phaser for tests
    setupFiles: ['<rootDir>/tests/setup.js']
}; 