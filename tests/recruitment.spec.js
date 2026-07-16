const { test, expect } = require('@playwright/test');

async function openClean(page, profile = {}) {
  await page.goto('/');
  await page.evaluate(profileData => {
    localStorage.clear();
    if (profileData) localStorage.setItem('codra_profile', JSON.stringify({
      registered: true,
      liberal: '文系',
      grade: '大学3年',
      industries: ['IT・Web'],
      jobTypes: ['事業企画'],
      locations: ['東京'],
      strengths: '課題を見つけて改善する力',
      activities: '学生団体で業務改善',
      ...profileData
    }));
  }, profile);
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
}

test.describe('Codra profile, navigation, and recruitment journeys', () => {
  test('profile opens, edits, saves, and survives reload', async ({ page }) => {
    await openClean(page, { strengths: '保存前の強み' });
    const profileNav = page.getByTestId('profile-nav');
    await expect(profileNav).toHaveCount(1);
    await profileNav.click();
    await expect(page.getByRole('heading', { name: 'プロフィール分析' })).toBeVisible();
    await page.locator('#edit-profile').click();
    await page.locator('#profile-form').getByRole('button', { name: '次へ' }).click();
    await page.locator('#profile-form').getByRole('button', { name: '次へ' }).click();
    const strengths = page.locator('textarea[name="strengths"]');
    await strengths.fill('ユーザーの声をもとに改善を進める力');
    await page.getByRole('button', { name: 'あなたに合う企業を探す' }).click();
    await expect(page.getByText('プロフィールを保存しました。推薦を更新しました')).toBeVisible();
    await page.reload();
    await profileNav.click();
    await page.locator('#edit-profile').click();
    await page.locator('#profile-form').getByRole('button', { name: '次へ' }).click();
    await page.locator('#profile-form').getByRole('button', { name: '次へ' }).click();
    await expect(page.locator('textarea[name="strengths"]')).toHaveValue('ユーザーの声をもとに改善を進める力');
  });

  test('mobile menu closes by toggle, overlay, Escape, and navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await openClean(page);
    const menu = page.getByTestId('mobile-menu');
    const sidebar = page.locator('#main-sidebar');
    const overlay = page.getByTestId('sidebar-overlay');
    await menu.click();
    await expect(sidebar).toHaveClass(/open/);
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await menu.click();
    await expect(sidebar).not.toHaveClass(/open/);
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await menu.click();
    await overlay.click({ position: { x: 350, y: 400 } });
    await expect(sidebar).not.toHaveClass(/open/);
    await menu.click();
    await page.keyboard.press('Escape');
    await expect(sidebar).not.toHaveClass(/open/);
    await menu.click();
    const discoverNav = sidebar.locator('button[data-view="discover"]');
    await expect(discoverNav).toHaveCount(1);
    await discoverNav.click();
    await expect(sidebar).not.toHaveClass(/open/);
  });

  test('recruitment status appears on cards, detail, and dashboard deadlines', async ({ page }) => {
    await openClean(page);
    await page.getByRole('button', { name: '⌕ 企業を探す' }).click();
    await expect(page.getByTestId('recruitment-card').first()).toBeVisible();
    await expect(page.getByText('募集中').first()).toBeVisible();
    const mercariCard = page.getByTestId('recruitment-card').filter({ hasText: 'Mercari' });
    await expect(mercariCard).toHaveCount(1);
    const recruitmentDetail = mercariCard.locator('button[data-recruitment-detail]');
    await expect(recruitmentDetail).toHaveCount(1);
    await recruitmentDetail.click();
    await expect(page.getByRole('heading', { name: 'Mercari' })).toBeVisible();
    await expect(page.locator('[data-tab="selection"]')).toHaveCount(1);
    await page.locator('[data-tab="selection"]').click();
    await expect(page.getByRole('heading', { name: '現在の募集状況' })).toBeVisible();
    const applyLink = page.getByRole('link', { name: '応募ページを見る' });
    await expect(applyLink).toBeVisible();
    await expect(applyLink).toHaveAttribute('target', '_blank');
    await expect(applyLink).toHaveAttribute('rel', 'noopener noreferrer');
    await page.getByRole('button', { name: '◈ ダッシュボード' }).click();
    await expect(page.getByText('企業募集：本選考').first()).toBeVisible();
    await expect(page.getByText('企業募集中').first()).toBeVisible();
  });

  test('company without recruitment data shows a safe checking state', async ({ page }) => {
    await openClean(page);
    await page.getByRole('button', { name: '⌕ 企業を探す' }).click();
    const mufgCard = page.getByTestId('recruitment-card').filter({ hasText: '三菱UFJ銀行' });
    await expect(mufgCard).toHaveCount(1);
    await mufgCard.locator('.detail-link').click();
    await page.locator('[data-tab="selection"]').click();
    await expect(page.getByText('情報確認中').first()).toBeVisible();
    await expect(page.getByText('現在表示できる募集要項はありません。')).toBeVisible();
  });
});
