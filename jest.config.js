module.exports = {
    transform: {
        "^.+\\.tsx?$": "ts-jest"
    },
    testRegex: "/__tests__/.+\\.(test|spec).(jsx?|tsx?)$",
    testPathIgnorePatterns: ["/node_modules/"],
    globals: {
        "ts-jest": {
            tsConfigFile: "./tsconfig.json"
        }
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
    collectCoverage: true,
    collectCoverageFrom: ["src/**/*.{ts,tsx}", "!*", "!**/__tests__/**/*"]
};
