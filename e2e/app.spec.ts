import { test, expect } from '@playwright/test';
import { mockArtAPI } from './helpers';

test.describe('App', () => {
  test('should load with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PD Gallery/i);
  });

  test('should show header', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.header')).toBeVisible();
  });

  test('should show hero section on home', async ({ page }) => {
    await mockArtAPI(page);
    await page.goto('/home');
    await expect(page.locator('.hero')).toBeVisible();
  });

  test('should show footer', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-footer')).toBeVisible();
  });
});
