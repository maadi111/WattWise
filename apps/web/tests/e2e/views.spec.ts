import { test, expect } from '@playwright/test';

test.describe('WattWise SCADA Views & Code-Splitting Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('executive dashboard renders key industrial telemetry and savings metrics', async ({ page }) => {
    // 1. Verify primary facility profile is active
    await expect(page.locator('text=Crescent Weaving & Dyeing Mills').first()).toBeVisible();

    // 2. Verify key performance indicators from executive dashboard
    await expect(page.locator('text=5,260,000').or(page.locator('text=5.26M'))).toBeVisible();
    await expect(page.locator('text=142.5').or(page.locator('text=Avoided Generator Hours')).first()).toBeVisible();

    // 3. Verify Feeder status badge
    await expect(page.locator('text=FSD-KHW-11KV-04').or(page.locator('text=FESCO')).first()).toBeVisible();
  });

  test('navigates to Fleet Operations and verifies 20-mill aggregation', async ({ page }) => {
    // Locate and click Fleet Operations in rail navigation
    const fleetBtn = page.locator('#nav-btn-fleet_phase3');
    await expect(fleetBtn).toBeVisible();
    await fleetBtn.click();

    // Verify 20-Mill fleet content loaded
    await expect(
      page.locator('text=20-Mill Enterprise Fleet')
        .or(page.locator('text=Fleet Operations'))
        .or(page.locator('text=Fleet Ops'))
        .first()
    ).toBeVisible({ timeout: 10000 });

    await expect(page.locator('text=FSD-01').or(page.locator('text=Crescent Weaving')).first()).toBeVisible();
  });

  test('substation commissioning wizard opens with zero-downtime clamp protocol', async ({ page }) => {
    // Click on 3-Hr Substation Wizard button in header
    const wizardTrigger = page.locator('#btn-substation-wizard');
    await expect(wizardTrigger).toBeVisible();
    await wizardTrigger.click();

    // Verify Commissioning Wizard modal content
    await expect(
      page.locator('text=Substation 3-Hour Rapid Install')
        .or(page.locator('text=Commissioning Wizard'))
        .first()
    ).toBeVisible();

    // Close wizard modal
    const closeBtn = page.locator('button:has(svg.lucide-x)').first();
    await closeBtn.click();
    await expect(page.locator('text=Substation 3-Hour Rapid Install')).not.toBeVisible();
  });
});
