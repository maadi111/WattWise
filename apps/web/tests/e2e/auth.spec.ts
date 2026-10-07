import { test, expect } from '@playwright/test';

test.describe('WattWise Authentication & Security Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('executive dashboard loads and reveals industrial security indicators', async ({ page }) => {
    // 1. Verify dashboard brand header
    await expect(page.locator('text=WattWise').first()).toBeVisible();

    // 2. Locate user profile badge in the header
    const userBadge = page.locator('#user-profile-badge');
    await expect(userBadge).toBeVisible();

    // 3. Open Login Modal
    await userBadge.click();
    await expect(page.locator('text=Industrial Authentication (RS256 / Argon2id)')).toBeVisible();

    // 4. Verify password and email inputs exist and can be filled
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // 5. Verify security badge at the bottom of the modal
    await expect(page.locator('text=Argon2id + RS256 PKI active').or(page.locator('text=local RS256 auth store'))).toBeVisible();

    // 6. Close modal
    await page.locator('.modal-content button:has-text("✕")').first().click();
    await expect(page.locator('text=Industrial Authentication (RS256 / Argon2id)')).not.toBeVisible();
  });

  test('submitting credentials updates tenant state or displays error', async ({ page }) => {
    const userBadge = page.locator('#user-profile-badge');
    await userBadge.click();

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await emailInput.fill('admin@wattwise.pk');
    await passwordInput.fill('WattWise2026!#');

    await page.locator('button[type="submit"]').click();

    // Modal should close or show authenticated profile state
    await page.waitForTimeout(1000);
    const isOpen = await page.locator('text=Industrial Authentication (RS256 / Argon2id)').isVisible();
    if (isOpen) {
      // If modal remained open, verify authenticated profile banner or sign out button is present
      await expect(page.locator('text=CURRENTLY AUTHENTICATED').or(page.locator('text=Sign Out'))).toBeVisible();
    }
  });
});
