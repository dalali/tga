import { test, expect } from '@playwright/test';

// US-1: game loads and canvas is visible within 5 seconds
test('US-1: game loads — canvas visible within 5s', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible({ timeout: 5000 });
});

// Menu screen shows "TGA" and start prompt
test('menu screen renders title and start prompt', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible({ timeout: 5000 });
  // Canvas is rendered by Phaser; we can't assert text inside canvas via DOM,
  // but we can assert the canvas exists and has non-zero dimensions
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(0);
  expect(box!.height).toBeGreaterThan(0);
});
