import { test, expect } from '@playwright/test';

test.describe('WattWise Industrial Control Room E2E Flow', () => {
  test('factory manager sees live telemetry dashboard', async ({ page }) => {
    // 1. Navigate to the running dashboard
    await page.goto('http://localhost:5173/');

    // 2. Dashboard should load with live power readings & telemetry
    await expect(page.locator('text=Crescent Weaving & Dyeing Mills')).toBeVisible();
    await expect(page.locator('text=CONNECTED')).toBeVisible();
    await expect(page.locator('text=401.8')).toBeVisible();
    await expect(page.locator('text=2.84')).toBeVisible();

    // 3. Outage risk dominating alert should be displayed
    await expect(page.locator('text=OUTAGE RISK: 87%')).toBeVisible();

    // 4. SwiftSwitch navigation should show pre-emptive timeline
    await page.click('text=03 — SwiftSwitch');
    await expect(page.locator('text=SWIFTSWITCH™ PRE-EMPTIVE POWER TRANSFER')).toBeVisible();
    await expect(page.locator('text=T - 0.008s')).toBeVisible();

    // 5. Savings Ledger should show audited three-way calculation & SHA-256 hash
    await page.click('text=08 — Savings Ledger');
    await expect(page.locator('text=Rs. 5,260,000')).toBeVisible();
    await expect(page.locator('text=SHA-256 VERIFIED')).toBeVisible();

    // 6. Savings certificate modal generation
    await page.click('button:has-text("GENERATE CERTIFICATE")');
    await expect(page.locator('text=WATTWISE™ ENERGY SAVINGS CERTIFICATE')).toBeVisible();
    await page.click('button:has-text("Print / PDF")');
  });
});
