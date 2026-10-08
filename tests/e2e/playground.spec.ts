import { expect, test } from '@playwright/test';

test('playground exposes the interaction lab', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Interaction Playground' })).toBeVisible();
  await expect(page.getByTestId('slider')).toBeVisible();
  await expect(page.getByTestId('xy-pad')).toBeVisible();
});

test('keyboard changes the slider value', async ({ page }) => {
  await page.goto('/');
  const slider = page.getByTestId('slider');
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuenow', '53');
  await page.keyboard.down('Shift');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.up('Shift');
  await expect(slider).toHaveAttribute('aria-valuenow', '53');
});

test('pointer drag changes the slider value', async ({ page }) => {
  await page.goto('/');
  const slider = page.getByTestId('slider');
  await slider.scrollIntoViewIfNeeded();
  const box = await slider.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.75, y);
  await page.mouse.up();

  const value = Number(await slider.getAttribute('aria-valuenow'));
  expect(value).toBeGreaterThan(50);
});

test('Escape cancels pointer drag without applying further movement', async ({ page }) => {
  await page.goto('/');
  const slider = page.getByTestId('slider');
  await slider.scrollIntoViewIfNeeded();
  const box = await slider.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.65, y);
  const beforeEscape = await slider.getAttribute('aria-valuenow');
  await page.keyboard.press('Escape');
  await page.mouse.move(box.x + box.width * 0.9, y);
  await page.mouse.up();
  expect(await slider.getAttribute('aria-valuenow')).toBe(beforeEscape);
});

test('eight interactive modules and source links are present', async ({ page }) => {
  await page.goto('/');
  for (const name of [
    'Axis + Precision', 'Vertical Axis', 'XY Control', 'Rotary + Detents',
    'Free Drag', 'Spring Return', 'Snap Points', 'Input Probe',
  ]) {
    await expect(page.getByRole('heading', { name })).toBeVisible();
  }
  await expect(page.getByRole('link', { name: /explore source/i })).toHaveAttribute('href', /github.com\/pfxamd\/PFx-Interaction-Core/);
});

test('theme toggle switches the real application palette', async ({ page }) => {
  await page.goto('/');
  const shell = page.locator('.app-shell');
  await expect(shell).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(shell).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(shell).toHaveAttribute('data-theme', 'dark');
});

test('mobile layout has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Interaction Playground' })).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
});
