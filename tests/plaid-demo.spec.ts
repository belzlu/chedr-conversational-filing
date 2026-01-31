import { test, expect } from '@playwright/test';

test('Show PlaidSelector after onboarding flow', async ({ page }) => {
  await page.goto('http://localhost:3003/');
  await page.waitForLoadState('networkidle');

  // Take initial screenshot
  await page.screenshot({ path: 'test-results/01-initial.png', fullPage: true });

  // Type in phone and verify to get past onboarding
  const phoneInput = page.getByPlaceholder('(555) 555-5555');
  if (await phoneInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await phoneInput.fill('5551234567');
    await page.getByRole('button', { name: 'Verify' }).click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/02-after-phone.png', fullPage: true });

    // Enter verification code
    const codeInputs = page.locator('input[maxlength="1"]');
    if (await codeInputs.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await codeInputs.nth(0).fill('1');
      await codeInputs.nth(1).fill('2');
      await codeInputs.nth(2).fill('3');
      await codeInputs.nth(3).fill('4');
      await codeInputs.nth(4).fill('5');
      await codeInputs.nth(5).fill('6');
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'test-results/03-after-code.png', fullPage: true });
    }
  }

  // Now look for any bank connection UI
  await page.screenshot({ path: 'test-results/04-main-app.png', fullPage: true });

  // Try clicking on things that might open the bank selector
  const bankButtons = page.locator('button:has-text("bank"), button:has-text("Bank"), button:has-text("Plaid"), button:has-text("Connect")');
  const count = await bankButtons.count();
  if (count > 0) {
    await bankButtons.first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/05-bank-selector.png', fullPage: true });
  }

  // Look for chips or action buttons that might trigger bank connection
  const chips = page.locator('[class*="chip"], [role="button"]:has-text("bank")');
  const chipCount = await chips.count();
  if (chipCount > 0) {
    await chips.first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/06-after-chip.png', fullPage: true });
  }

  await page.waitForTimeout(2000);
});
