const { test, expect } = require('@playwright/test');

const viewports = [
  { name: 'iPhone', width: 390, height: 844 },
  { name: 'Android', width: 412, height: 915 },
  { name: 'iPad portrait', width: 768, height: 1024 },
  { name: 'iPad landscape', width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 900 }
];

async function openFresh(page, viewport) {
  await page.setViewportSize(viewport);
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const close = page.locator('.modal-backdrop .modal-close');
  if (await close.count() && await close.first().isVisible().catch(() => false)) await close.first().click();
}

test.describe('Codra mobile controls and profile regression', () => {
  test('menu opens and closes at every supported viewport', async ({ page }) => {
    for (const viewport of viewports) {
      await openFresh(page, viewport);
      const menu = page.getByTestId('mobile-menu');
      const sidebar = page.locator('#main-sidebar');
      const overlay = page.getByTestId('sidebar-overlay');
      if (viewport.width <= 900) {
        await expect(menu).toBeVisible();
        await menu.click();
        await expect(sidebar).toHaveClass(/open/);
        await expect(menu).toHaveAttribute('aria-expanded', 'true');
        await expect(overlay).toHaveClass(/open/);
        await menu.click();
        await expect(sidebar).not.toHaveClass(/open/);
        await expect(menu).toHaveAttribute('aria-expanded', 'false');
        await expect(overlay).not.toHaveClass(/open/);
        await menu.click();
        await overlay.click({ position: { x: 350, y: 400 } });
        await expect(sidebar).not.toHaveClass(/open/);
        await menu.click();
        await page.keyboard.press('Escape');
        await expect(sidebar).not.toHaveClass(/open/);
      } else {
        await expect(menu).not.toBeVisible();
        await expect(sidebar).toBeVisible();
      }
    }
  });

  test('header profile, name persistence, neutral fallback, and notification work', async ({ page }) => {
    await openFresh(page, { width: 390, height: 844 });
    await expect(page.locator('body')).not.toContainText('ゆうき');

    const profileButton = page.locator('.top-avatar');
    await expect(profileButton).toHaveCount(1);
    await profileButton.click();
    await expect(page.getByRole('heading', { name: 'プロフィール分析' })).toBeVisible();
    await page.locator('#edit-profile').click();
    await page.locator('#profile-form input[name="name"]').fill('操作確認ユーザー');
    await page.locator('#profile-form').getByRole('button', { name: '次へ' }).click();
    await page.locator('#profile-form').getByRole('button', { name: '次へ' }).click();
    await page.getByRole('button', { name: 'あなたに合う企業を探す' }).click();
    await expect(page.locator('#toast')).toContainText('プロフィールを保存しました');
    await expect(page.locator('#user-display-name')).toHaveText('操作確認ユーザー');

    await page.reload();
    await page.locator('.top-avatar').click();
    await page.locator('#edit-profile').click();
    await expect(page.locator('#profile-form input[name="name"]')).toHaveValue('操作確認ユーザー');
    await page.locator('#modal-close').click();

    const notification = page.getByTestId('notification-toggle');
    const panel = page.locator('#notification-panel');
    await notification.click();
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('新しい通知はありません');
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await notification.click();
    await page.locator('.page-title').click();
    await expect(panel).toBeHidden();
    await page.screenshot({ path: 'screenshots/mobile-controls-after.png', fullPage: false });
  });

  test('profile can be opened from the sidebar after menu closes', async ({ page }) => {
    await openFresh(page, { width: 768, height: 1024 });
    const menu = page.getByTestId('mobile-menu');
    await menu.click();
    const profileNav = page.getByTestId('profile-nav');
    await expect(profileNav).toBeVisible();
    await profileNav.click();
    await expect(page.locator('#main-sidebar')).not.toHaveClass(/open/);
    await expect(page.getByRole('heading', { name: 'プロフィール分析' })).toBeVisible();
  });

  test('major controls have a usable action contract and no page errors', async ({ page }) => {
    const errors = [];
    const missing = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() === 404) missing.push(response.url()); });
    await openFresh(page, { width: 390, height: 844 });
    const inventory = await page.locator('button, a, input, select, textarea, [role="button"], [tabindex]').evaluateAll(nodes => nodes.map(node => ({
      tag: node.tagName,
      text: (node.innerText || node.getAttribute('aria-label') || node.getAttribute('placeholder') || '').trim().slice(0, 80),
      disabled: node.disabled === true,
      href: node.getAttribute('href') || ''
    })).filter(item => item.text || item.href || item.disabled));
    expect(inventory.length).toBeGreaterThan(20);
    expect(errors).toEqual([]);
    expect(missing).toEqual([]);
  });
});
