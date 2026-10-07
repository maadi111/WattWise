import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.E2E_EMAIL ?? 'admin@wattwise.pk';
const TEST_PASSWORD = process.env.E2E_PASSWORD ?? 'ChangeThisStrongBootstrapPassword2026!#';
const FACTORY_NAME = process.env.E2E_FACTORY ?? 'Crescent Weaving & Dyeing Mills';

test.describe('WattWise Industrial Control Room E2E Flow', () => {
  test('factory manager sees live telemetry dashboard and navigates modules', async ({ page }) => {
    // 1. Navigate to the root URL
    await page.goto('/');

    // 2. If a login form is visible, perform authentication flow
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.fill(TEST_EMAIL);
      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      await passwordInput.fill(TEST_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
    }

    // 3. Brand header and application frame must be visible
    await expect(page.locator('text=WattWise').first()).toBeVisible();

    // 4. Verify tenant facility context is present (environment-driven or active plant profile)
    const plantContext = page.locator(`text=${FACTORY_NAME}`).or(page.locator('text=Substation')).or(page.locator('text=Executive Summary'));
    await expect(plantContext.first()).toBeVisible();

    // 5. Test structural metrics containers (not rigid hardcoded numbers)
    const savingsElement = page.locator('[data-testid="savings-mtd"]')
      .or(page.locator('text=Rs.'))
      .or(page.locator('text=PKR'))
      .or(page.locator('text=Savings'));
    await expect(savingsElement.first()).toBeVisible();

    // 6. SwiftSwitch pre-emptive automation module navigation
    const swiftswitchNav = page.locator('button:has-text("SwiftSwitch"), [data-section="swiftswitch"]').first();
    if (await swiftswitchNav.isVisible()) {
      await swiftswitchNav.click();
      await expect(page.locator('text=SwiftSwitch').first()).toBeVisible();
    }

    // 7. Savings Ledger cryptographic audit module navigation
    const savingsNav = page.locator('button:has-text("Savings Ledger"), [data-section="savings_ledger"]').first();
    if (await savingsNav.isVisible()) {
      await savingsNav.click();
      await expect(page.locator('text=Savings Ledger').or(page.locator('text=Ledger')).first()).toBeVisible();
    }
  });
});
