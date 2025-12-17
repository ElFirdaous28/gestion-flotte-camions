export default {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.mjs'],
    transform: {},
    coverageProvider: 'v8', // <--- ADD THIS LINE
};
