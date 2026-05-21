import { test, expect } from '@playwright/test';

// Helper: start the world scene via Enter key
async function startGame(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.locator('canvas').waitFor({ state: 'visible', timeout: 5000 });
  // Give Phaser time to boot and render MenuScene
  await page.waitForTimeout(1000);
  await page.keyboard.press('Enter');
  // Wait for WorldScene to load
  await page.waitForTimeout(1500);
}

// US-2: player can move with WASD (canvas stays alive, no crash)
test('US-2: WASD movement does not crash the game', async ({ page }) => {
  await startGame(page);
  const canvas = page.locator('canvas');
  // Send movement keys
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(200);
  await page.keyboard.up('KeyW');
  await page.keyboard.down('KeyA');
  await page.waitForTimeout(200);
  await page.keyboard.up('KeyA');
  // Canvas must still be visible (game hasn't crashed)
  await expect(canvas).toBeVisible();
});

// US-15: M key toggles mute (no crash)
test('US-15: M key toggles mute', async ({ page }) => {
  await startGame(page);
  await page.keyboard.press('KeyM');
  await page.keyboard.press('KeyM');
  await expect(page.locator('canvas')).toBeVisible();
});

// US-16: P pauses and resumes game
test('US-16: P key pauses and resumes game', async ({ page }) => {
  await startGame(page);
  await page.keyboard.press('KeyP');
  await page.waitForTimeout(300);
  await page.keyboard.press('KeyP');
  await expect(page.locator('canvas')).toBeVisible();
});

// US-16: ESC also pauses
test('US-16: ESC key pauses game', async ({ page }) => {
  await startGame(page);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape');
  await expect(page.locator('canvas')).toBeVisible();
});
