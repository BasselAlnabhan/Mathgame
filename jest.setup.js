// jest.setup.js

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
            store[key] = value.toString();
        },
        removeItem: (key) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock window.matchMedia used by Phaser for responsiveness checks
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false, // default value
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock navigator.userAgent for device detection
Object.defineProperty(navigator, 'userAgent', {
    value: 'jest-test-environment',
    writable: true
});

// Mock for import.meta.env (used in MenuScene.js)
const originalEnv = process.env;
process.env = {
    ...originalEnv,
    VITE_SUPABASE_URL: 'https://mock-supabase-url.com',
    VITE_SUPABASE_ANON_KEY: 'mock-anon-key'
};

// Mock for import.meta.env for ESM modules
if (typeof window !== 'undefined') {
    window.import = {
        meta: {
            env: {
                VITE_SUPABASE_URL: 'https://mock-supabase-url.com',
                VITE_SUPABASE_ANON_KEY: 'mock-anon-key'
            }
        }
    };
}

// Jest dynamic import helper
global.dynamicImport = (modulePath) => {
    return import(modulePath);
};

// You can add other global mocks here if needed 