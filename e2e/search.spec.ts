import { test, expect } from '@playwright/test';
import { mockArtAPI } from './helpers';

test.describe('Search', () => {
  test.beforeEach(async ({ page }) => {
    await mockArtAPI(page);
  });

  test('should have header search', async ({ page }) => {
    await page.goto('/home');
    await expect(page.locator('#search-input')).toBeVisible();
  });

  test('should search from browse page', async ({ page }) => {
    await page.goto('/browse');
    const searchInput = page.locator('.browse__search-input');
    await searchInput.fill('impressionism');
    await searchInput.press('Enter');
    await expect(page.locator('.card').first()).toBeVisible();
  });

  test('should show artwork cards in grid', async ({ page }) => {
    await page.goto('/browse');
    await expect(page.locator('.grid')).toBeVisible();
  });
});
