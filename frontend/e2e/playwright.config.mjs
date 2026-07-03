/**
 * 静态 frontend Playwright 配置
 * 版本: v1.0 | 日期: 2026-07-01
 */
/** @type {import('@playwright/test').PlaywrightTestConfig} */
export default {
	testDir: '.',
	testMatch: '**/*.spec.mjs',
	timeout: 60_000,
	expect: { timeout: 15_000 },
	fullyParallel: false,
	workers: 1,
	retries: 0,
	use: {
		baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:8765',
		viewport: { width: 1440, height: 900 },
		actionTimeout: 15_000,
		navigationTimeout: 15_000,
	},
	webServer: {
		command: 'python3 -m http.server 8765',
		cwd: '..',
		port: 8765,
		reuseExistingServer: true,
		timeout: 15_000,
	},
	reporter: [['list']],
};
