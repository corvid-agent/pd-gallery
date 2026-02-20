import { test, expect } from '@playwright/test';
import { mockArtAPI } from './helpers';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockArtAPI(page);
  });

  test('should navigate to browse', async ({ page }) => {
    await page.goto('/browse');
    await expect(page.locator('.browse')).toBeVisible();
  });

  test('should navigate to collection', async ({ page }) => {
    await page.goto('/collection');
    await expect(page.locator('.collection__tabs')).toBeVisible();
  });

  test('should navigate to about', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should redirect root to home', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/home/);
  });
});
