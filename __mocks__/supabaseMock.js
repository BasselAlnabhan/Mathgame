// __mocks__/supabaseMock.js
const supabaseMock = {
    createClient: jest.fn(() => ({
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            // Add other Supabase methods you use as needed, chaining mockReturnThis
            // or returning mockResolvedValue for async operations
        })),
        // Mock other top-level client methods if you use them directly
        // e.g., auth: { ... }
    })),
};

module.exports = supabaseMock; 