import { test, expect } from '@playwright/test';

test.describe('WattWise Industrial Control Room E2E Flow', () => {
  test('factory manager sees live telemetry dashboard', async ({ page }) => {
    // 1. Navigate to the running dashboard
    await page.goto('/');

    // 2. Dashboard should load with plant profile & real-time telemetry badge
    await expect(page.locator('text=Crescent Weaving & Dyeing Mills')).toBeVisible();
    await expect(page.locator('text=OUTAGE RISK: 87%')).toBeVisible();
    await expect(page.locator('text=ARMED (0.83ms)')).toBeVisible();

    // 3. Telemetry values displayed
    await expect(page.locator('text=401.8')).toBeVisible();

    // 4. SwiftSwitch navigation should reveal sequence details
    await page.click('button:has-text("SwiftSwitch")');
    await expect(page.locator('text=SwiftSwitch™ Pre-Emptive Generator Switchover')).toBeVisible();

    // 5. Savings Ledger navigation
    await page.click('button:has-text("Savings Ledger")');
    await expect(page.locator('text=Rs. 5,260,000')).toBeVisible();
  });
});
