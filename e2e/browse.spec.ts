import { test, expect } from '@playwright/test';
import { mockArtAPI } from './helpers';

test.describe('Browse', () => {
  test.beforeEach(async ({ page }) => {
    await mockArtAPI(page);
    await page.goto('/browse');
  });

  test('should show search input', async ({ page }) => {
    await expect(page.locator('.browse__search-input')).toBeVisible();
  });

  test('should show artwork cards', async ({ page }) => {
    await expect(page.locator('.card').first()).toBeVisible();
  });

  test('should show result count', async ({ page }) => {
    await expect(page.locator('.browse__count')).toBeVisible();
  });

  test('should show filter dropdown', async ({ page }) => {
    await expect(page.locator('.browse__filter-select').first()).toBeVisible();
  });
});
