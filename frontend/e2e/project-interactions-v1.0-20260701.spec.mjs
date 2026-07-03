/**
 * 静态 frontend 项目交互 E2E（对齐 agent-demo SaveProjectDialog 流程）
 * 版本: v1.0 | 日期: 2026-07-01
 */
import { test, expect } from '@playwright/test';

const TEST_COMPANY = '苏州测试科技有限公司';
const ONBOARDING_KEY = 'xinbao_onboarding_done_v8';

async function dismissOnboarding(page) {
	await page.evaluate((key) => {
		localStorage.setItem(key, 'done');
		if (window.XinBaoDemo?.skipOnboarding) {
			window.XinBaoDemo.skipOnboarding();
		}
	}, ONBOARDING_KEY);
	await expect(page.locator('.onboarding-shell')).toHaveCount(0);
}

test.describe('项目交互还原', () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript((key) => {
			localStorage.setItem(key, 'done');
		}, ONBOARDING_KEY);
		await page.goto('/index.html?v=e2e-20260701');
		await page.waitForFunction(() => typeof window.XinBaoDemo?.openCreateModal === 'function');
		await dismissOnboarding(page);
	});

	test('侧栏 hover 新项目打开创建弹窗', async ({ page }) => {
		const projectRow = page.locator('.sidebar-project-nav-row');
		await projectRow.hover();
		await page.getByRole('button', { name: '新项目', exact: true }).click();
		await expect(page.locator('#save-project-title')).toHaveText('创建尽调项目');
		await expect(page.locator('#f-company')).toBeVisible();
	});

	test('项目页顶栏新项目按钮打开创建弹窗', async ({ page }) => {
		await page.locator('.sidebar-project-nav-main').click();
		await expect(page).toHaveURL(/#\/projects/);
		await page.getByRole('button', { name: '新项目' }).first().click();
		await expect(page.locator('#save-project-title')).toBeVisible();
	});

	test('填写企业全称可创建项目并进入新会话', async ({ page }) => {
		await page.evaluate(() => window.XinBaoDemo.openCreateModal());
		await page.locator('#f-company').fill(TEST_COMPANY);
		await page.locator('form.modal-form button[type="submit"]').click();
		await expect(page).toHaveURL(/#\/p\/proj-\d+\/c\/chat-\d+/);
		await expect(page.locator('footer.composer')).toBeVisible();
		await expect(page.locator('.preview-pane')).toBeVisible();
	});

	test('投资雷达展示 mock 资讯与交互', async ({ page }) => {
		await page.locator('button.sidebar-project-nav-main').first().hover().catch(() => {});
		await page.getByRole('button', { name: '投资雷达' }).click();
		await expect(page).toHaveURL(/#\/radar/);
		await expect(page.locator('.radar-card').first()).toBeVisible({ timeout: 10_000 });
		await expect(page.locator('.star-briefing-card')).toContainText('投资早餐');
		await expect(page.locator('.radar-interest-item').first()).toBeVisible();
		await page.locator('.radar-card').first().getByRole('button', { name: '查看全文' }).click();
		await expect(page.locator('.preview-pane')).toBeVisible();
		await page.locator('.btn-interpret').first().click();
		await expect(page.locator('.expert-note.is-expanded').first()).toBeVisible({ timeout: 10_000 });
	});

	test('能力市场展示 mock 目录与 Tab 交互', async ({ page }) => {
		await page.getByRole('button', { name: '能力市场' }).click();
		await expect(page).toHaveURL(/#\/skills/);
		await expect(page.locator('.xb-market-kind-tab.on')).toContainText('专家');
		await expect(page.locator('.xb-skill-card').first()).toBeVisible({ timeout: 10_000 });
		await page.getByRole('tab', { name: '技能' }).click();
		await expect(page.locator('.xb-skills-category-tabs')).toBeVisible();
		await expect(page.locator('.xb-skill-card strong').first()).toContainText('标的速览');
		await page.getByRole('tab', { name: '连接器' }).click();
		await expect(page.locator('.xb-skill-card strong').first()).toContainText('企查查连接器');
		await page.locator('.xb-skill-card').first().locator('.xb-market-add-btn').click();
		await page.getByRole('tab', { name: '我的' }).click();
		await expect(page.locator('.xb-mini-tag-my').first()).toBeVisible();
	});
});
