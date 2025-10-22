"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
const vite_tsconfig_paths_1 = __importDefault(require("vite-tsconfig-paths"));
const buffer_1 = require("buffer");
exports.default = (0, config_1.defineConfig)({
    plugins: [(0, vite_tsconfig_paths_1.default)()],
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        alias: {
            // 使用浏览器版本的库
            './exceljs.nodejs': './exceljs.browser',
            buffer: 'buffer',
        },
    },
    optimizeDeps: {
        exclude: ['@aws-sdk/client-s3'], // 排除 AWS SDK
        include: ['buffer'],
    },
    define: {
        global: 'globalThis', // 在浏览器中 global 等同于 globalThis
        'global.Buffer': buffer_1.Buffer,
        require: '(m => m)', // 简单的 require polyfill
    },
    test: {
        globals: true,
        setupFiles: ['./spec/browser/setup.ts'],
        browser: {
            enabled: true,
            name: 'chromium',
            provider: 'playwright',
            headless: true,
        },
        include: ['spec/browser/**/*.vitest.spec.ts'],
    },
});
//# sourceMappingURL=vitest.browser.config.js.map