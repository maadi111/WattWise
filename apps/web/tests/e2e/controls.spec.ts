import { test, expect } from '@playwright/test';

test.describe('WattWise Interactive Controls & Bilingual Support', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('toggles language between English and Urdu seamlessly', async ({ page }) => {
    // Locate the language toggle button (#btn-urdu-toggle)
    const langBtn = page.locator('#btn-urdu-toggle');
    await expect(langBtn).toBeVisible();

    // Click to switch to Urdu
    await langBtn.click();
    await expect(
      page.locator('text=کمانڈ سینٹر')
        .or(page.locator('text=English'))
        .or(page.locator('text=پاور فلور'))
        .first()
    ).toBeVisible({ timeout: 5000 });

    // Toggle back to English
    await langBtn.click();
    await expect(page.locator('#btn-urdu-toggle').locator('text=اردو')).toBeVisible();
    await expect(page.locator('text=WattWise').first()).toBeVisible();
  });

  test('opens and closes the operational notification center drawer', async ({ page }) => {
    // Click on notification bell button in header
    const bellBtn = page.locator('#top-notification-bell');
    await expect(bellBtn).toBeVisible();
    await bellBtn.click();

    // Verify drawer header
    await expect(page.locator('text=Operational Incident Center')).toBeVisible();

    // Close notification drawer using X button
    const closeBtn = page.locator('.ww-drawer button:has(svg.lucide-x)').first();
    await closeBtn.click();
    await expect(page.locator('text=Operational Incident Center')).not.toBeVisible();
  });

  test('opens Command Palette via keyboard shortcut Ctrl+K or search trigger', async ({ page }) => {
    // Focus the page and trigger Ctrl+K or click the search box
    const searchTrigger = page.locator('#top-search-trigger');
    await searchTrigger.click();

    // Command palette modal should open with search input
    const searchInput = page.locator('input[placeholder*="Search machines"]');
    await expect(searchInput).toBeVisible();

    // Type a query
    await searchInput.fill('SwiftSwitch');

    // Press Escape to dismiss
    await page.keyboard.press('Escape');
    await expect(searchInput).not.toBeVisible();
  });
});
