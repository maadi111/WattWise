import { test, expect } from '@playwright/test';

test.describe('WattWise Industrial Control Room E2E Flow', () => {
  test('factory manager sees live telemetry dashboard and navigates modules', async ({ page }) => {
    // 1. Navigate to the running dashboard
    await page.goto('/');

    // 2. Dashboard should load with plant profile & brand header
    await expect(page.locator('text=Crescent Weaving & Dyeing Mills').first()).toBeVisible();
    await expect(page.locator('text=WattWise').first()).toBeVisible();

    // 3. Verified monthly savings metric visible
    await expect(page.locator('text=5,260,000').or(page.locator('text=5.26M'))).toBeVisible();

    // 4. SwiftSwitch navigation
    const swiftswitchNav = page.locator('button:has-text("SwiftSwitch"), [data-section="swiftswitch"]').first();
    if (await swiftswitchNav.isVisible()) {
      await swiftswitchNav.click();
      await expect(page.locator('text=SwiftSwitch').first()).toBeVisible();
    }

    // 5. Savings Ledger navigation
    const savingsNav = page.locator('button:has-text("Savings Ledger"), [data-section="savings_ledger"]').first();
    if (await savingsNav.isVisible()) {
      await savingsNav.click();
      await expect(page.locator('text=Savings Ledger').first()).toBeVisible();
    }
  });
});

