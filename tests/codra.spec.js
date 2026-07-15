const { test, expect } = require('@playwright/test');

async function openFresh(page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const close = page.locator('.modal-backdrop .modal-close').first();
  if (await close.isVisible().catch(() => false)) await close.click();
}

async function startDemo(page) {
  await openFresh(page);
  await page.locator('#start-demo').click();
  await expect(page.locator('.demo-guide')).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('codra_demo_active'))).toBe('true');
}

test.describe('Codra primary user journeys', () => {
  test('A: first visit shows a clear welcome path', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.locator('.welcome-card')).toBeVisible();
    await expect(page.locator('#start-demo')).toBeVisible();
    await expect(page.locator('[data-start-onboarding]').first()).toBeVisible();
  });

  test('B: demo can be started and persisted', async ({ page }) => {
    await startDemo(page);
    await expect(page.getByText('あなた向けおすすめ企業')).toBeVisible();
    await expect.poll(() => page.evaluate(() => localStorage.getItem('codra_demo_active'))).toBe('true');
  });

  test('C: company save and compare work', async ({ page }) => {
    await openFresh(page);
    await page.evaluate(() => localStorage.setItem('codra_saved_companies', '[]'));
    await page.reload();
    const close = page.locator('.modal-backdrop .modal-close').first();
    if (await close.isVisible().catch(() => false)) await close.click();
    await page.locator('button[data-view="discover"]').first().click();
    await expect(page.locator('.company-card').first()).toBeVisible();
    await page.locator('.company-card').first().locator('button[data-save]').click();
    await expect(page.locator('.company-card').first().locator('button[data-save]')).toHaveClass(/saved/);
    const checks = page.locator('input[data-compare]');
    await checks.nth(0).check();
    await checks.nth(1).check();
    await page.locator('#compare-btn').click();
    await expect(page.getByRole('heading', { name: '企業比較' })).toBeVisible();
    await expect(page.locator('.compare-enhanced')).toBeVisible();
  });

  test('D: ES can be created, saved, and improved with mock AI', async ({ page }) => {
    await startDemo(page);
    await page.locator('button[data-view="documents"]').first().click();
    await page.locator('#new-es').click();
    await page.locator('#new-es-company').selectOption('mercari');
    await page.locator('#new-es-type').selectOption({ label: '志望動機' });
    await page.locator('#create-es').click();
    await page.locator('#es-draft').fill('ユーザーに価値を届ける仕事がしたいです。');
    await page.locator('#save-es').click();
    await expect(page.getByText('ES下書きを保存しました')).toBeVisible();
    await page.locator('#improve-es').click();
    await expect(page.locator('.feedback-block')).toBeVisible();
    await expect(page.locator('.mock-source')).toBeVisible();
  });

  test('E: interview notes save to localStorage', async ({ page }) => {
    await startDemo(page);
    await page.locator('button[data-view="documents"]').first().click();
    await page.locator('[data-interview-company="mercari"]').click();
    await page.locator('#answer-note').fill('結論から話し、経験と結果を具体的に伝えます。');
    await page.locator('#save-answer').click();
    await expect(page.getByText('面接回答メモを保存しました')).toBeVisible();
    await expect.poll(() => page.evaluate(() => Boolean(localStorage.getItem('codra_interview_answers')))).toBe(true);
  });

  test('F/G: data management exports, previews, and removes demo data', async ({ page }) => {
    await startDemo(page);
    await page.locator('button[data-view="profile"]').first().click();
    await page.locator('#open-data').click();
    await expect(page.locator('.data-modal')).toBeVisible();
    await expect(page.locator('.migration-preview')).toBeVisible();
    await page.locator('#export-json').click();
    await expect(page.locator('#data-json')).not.toHaveValue('');
    await page.locator('#delete-demo-data').click();
    await expect(page.locator('[data-confirm-ok]')).toBeVisible();
    await page.locator('[data-confirm-ok]').click();
    await expect.poll(() => page.evaluate(() => localStorage.getItem('codra_demo_active'))).toBeNull();
  });
});
