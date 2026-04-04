import { test, expect } from '@playwright/test';

test.describe('AI Hotel Management System E2E', () => {
  
  test('should seed the database successfully', async ({ page }) => {
    await page.goto('/');

    // Locate the Seed DB button in the Pricing section
    const seedButton = page.getByRole('button', { name: /seed db/i });
    await expect(seedButton).toBeVisible();
    
    // Click and wait for the success message
    await seedButton.click();
    
    const successMsg = page.getByText(/database seeded successfully/i);
    await expect(successMsg).toBeVisible({ timeout: 15000 });
  });

  test('should display dynamic pricing after seeding', async ({ page }) => {
    await page.goto('/');

    // Check pricing demo
    const checkPriceBtn = page.getByRole('button', { name: /check price/i });
    await checkPriceBtn.click();

    // Verify dynamic price card appears
    await expect(page.getByText(/Room Rate/i)).toBeVisible();
    await expect(page.getByText(/AI Optimization Factors/i)).toBeVisible();
  });

  test('should show occupancy analytics', async ({ page }) => {
    await page.goto('/');

    // Verify analytics section is present
    await expect(page.getByText(/AI Occupancy Forecasting/i)).toBeVisible();
    
    // Check if at least one day shows a percentage
    const occupancyValue = page.locator('div:has-text("%")').first();
    await expect(occupancyValue).toBeVisible();
  });

  test('should show guest intelligence segmentations', async ({ page }) => {
    await page.goto('/');

    // Verify AI Guest Intelligence is rendering
    await expect(page.getByText(/AI Guest Intelligence/i)).toBeVisible();
    
    // Check for a loyalty score bar
    await expect(page.getByText(/LOYALTY SCORE/i).first()).toBeVisible();
  });
});
