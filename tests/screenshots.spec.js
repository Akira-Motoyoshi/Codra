const { test, expect } = require('@playwright/test');

test('capture README screenshots', async ({ page }) => {
  await page.goto('./');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const onboardingClose = page.locator('.modal-backdrop .modal-close').first();
  if (await onboardingClose.isVisible().catch(() => false)) await onboardingClose.click();
  await expect(page.locator('.welcome-card')).toBeVisible();
  await page.screenshot({ path: 'screenshots/welcome.png', fullPage: true });

  await page.locator('#start-demo').click();
  const confirm = page.locator('[data-confirm-ok]');
  if (await confirm.isVisible().catch(() => false)) await confirm.click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('codra_demo_active'))).toBe('true');

  await page.locator('button[data-view="discover"]').first().click();
  await expect(page.locator('.company-card').first()).toBeVisible();
  await page.screenshot({ path: 'screenshots/company-discovery.png', fullPage: true });

  const checks = page.locator('input[data-compare]');
  const count = await checks.count();
  expect(count).toBeGreaterThanOrEqual(3);
  await checks.nth(0).check();
  await checks.nth(1).check();
  await checks.nth(2).check();
  await page.locator('#compare-btn').click();
  await expect(page.getByRole('heading', { name: '企業比較' })).toBeVisible();
  await page.screenshot({ path: 'screenshots/company-compare.png', fullPage: true });
});
