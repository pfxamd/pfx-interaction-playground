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

test('light and dark modes change the actual palette and persist after reload', async ({ page }) => {
  await page.goto('/');
  const shell = page.locator('.app-shell');
  const light = page.getByRole('button', { name: 'Light theme' });
  const dark = page.getByRole('button', { name: 'Dark theme' });
  await expect(shell).toHaveAttribute('data-theme', 'light');
  await expect(light).toHaveAttribute('aria-pressed', 'true');
  await expect(dark).toHaveAttribute('aria-pressed', 'false');
  const lightBackground = await shell.evaluate((element) => getComputedStyle(element).backgroundColor);
  await dark.click();
  await expect(shell).toHaveAttribute('data-theme', 'dark');
  await expect(dark).toHaveAttribute('aria-pressed', 'true');
  await expect
    .poll(() => shell.evaluate((element) => getComputedStyle(element).backgroundColor))
    .not.toBe(lightBackground);
  await page.reload();
  await expect(shell).toHaveAttribute('data-theme', 'dark');
  await light.click();
  await expect(shell).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(shell).toHaveAttribute('data-theme', 'light');
});

test('light and dark selectors stay visible and usable at narrow widths', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  const light = page.getByRole('button', { name: 'Light theme' });
  const dark = page.getByRole('button', { name: 'Dark theme' });
  await expect(light).toBeVisible();
  await expect(dark).toBeVisible();
  await dark.click();
  await expect(dark).toHaveAttribute('aria-pressed', 'true');
  await light.click();
  await expect(light).toHaveAttribute('aria-pressed', 'true');
  const dimensions = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
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
