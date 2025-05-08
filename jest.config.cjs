module.exports = {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\.jsx?$': 'babel-jest',
        '^.+\.mjs$': 'babel-jest',
    },
    moduleNameMapper: {
        '\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
        '\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
        '^@supabase/supabase-js$': '<rootDir>/__mocks__/supabaseMock.js',
        '^phaser$': '<rootDir>/__mocks__/phaserMock.js'
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    verbose: true,
    clearMocks: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.{js,jsx,mjs}',
        '!src/index.js',
        '!src/**/*.config.js',
    ],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/tests/e2e/',
        'tests/unit/Monster.test.js'
    ],
    transformIgnorePatterns: [
        '/node_modules/(?!phaser)/',
    ],
    globals: {
        // Any global variables for tests
    }
}; 