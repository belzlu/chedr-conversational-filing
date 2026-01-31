import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Golden Routes & States
// 1. Landing (ChatOnboarding)
// 2. Phone Input (ChatOnboarding)
// 3. Dashboard (via localStorage mock)

test.describe('Visual & A11y Regression Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Clear storage to ensure fresh onboarding state by default
    await page.addInitScript(() => {
        localStorage.clear();
    });
  });

  test('Landing Screen', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the greeting sequence (animations involved)
    // "Let's get you filed." appears after 300ms
    // "What's your phone number?" appears after 800ms
    await expect(page.getByText("Let's get you filed.")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("What's your phone number?")).toBeVisible();
    
    // Wait for input to appear & Autofocus (300ms delay in PhoneInputBubble)
    const phoneInput = page.getByPlaceholder('(555) 555-5555');
    await expect(phoneInput).toBeVisible();
    await page.waitForTimeout(500); // Allow autofocus animation to settle

    // Visual Snapshot
    await expect(page).toHaveScreenshot('landing-screen.png');

    // A11y Check
    const accessibilityScanResults = await new AxeBuilder({ page })
        .analyze();
    
    // Note: We expect some violations maybe, but let's assert empty to catch them.
    // If strict contrast fails on the dark theme, we'll see it.
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Onboarding: Phone Input Interaction', async ({ page }) => {
    await page.goto('/');
    
    const phoneInput = page.getByPlaceholder('(555) 555-5555');
    await expect(phoneInput).toBeVisible({ timeout: 10000 });
    
    // Interaction: Type a number (formatting logic applies)
    await phoneInput.fill('5551234567');
    
    // Verify formatting "(555) 123-4567"
    await expect(phoneInput).toHaveValue('(555) 123-4567');
    
    // Wait for "Verify" button to be enabled/visible
    await expect(page.getByRole('button', { name: 'Verify' })).toBeVisible();

    // Visual Snapshot
    await expect(page).toHaveScreenshot('onboarding-phone-filled.png');

    // A11y Check
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('End-to-End Onboarding Flow', async ({ page }) => {
    await page.goto('/');

    // 1. Phone Input
    const phoneInput = page.getByPlaceholder('(555) 555-5555');
    await expect(phoneInput).toBeVisible({ timeout: 10000 });
    await phoneInput.fill('5551234567');
    await page.getByRole('button', { name: 'Verify' }).click();

    // 2. Code Verification
    // Wait for "Code sent!" message or input
    await expect(page.getByText('Code sent!')).toBeVisible({ timeout: 10000 });
    
    // Check for code input (CodeInputBubble usually has 6 slots or input)
    // Inspecting functionality, usually it's an OTP input. 
    // Assuming standard input or we can target by placeholder if exists, 
    // or just type into the focused element if it auto-focuses.
    // Let's assume there is an input. ChatOnboarding uses CodeInputBubble.
    // CodeInputBubble usually has a hidden input or slots.
    // If slots, we might need to type.
    // Let's try typing digits.
    await page.waitForTimeout(2000); // Wait for transition to code state
    await page.keyboard.type('123456');

    // 3. Success & Dashboard Transition
    // "You're in." appears
    await expect(page.getByText("You're in.")).toBeVisible({ timeout: 10000 });
    
    // Wait for Dashboard
    await expect(page.getByRole('heading', { name: 'Finance Dashboard' })).toBeVisible({ timeout: 20000 });
    
    // Visual Snapshot
    await expect(page).toHaveScreenshot('dashboard-view.png');
    
    // A11y Check
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

});
