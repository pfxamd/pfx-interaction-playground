import { expect, test } from '@playwright/test';

test('window only moves from its title bar and content remains editable', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('.card-window');
  const handle = card.locator('.window-handle');
  await handle.press('ArrowRight');
  await expect(card.locator('output')).toHaveText('X 12 / Y 0 px');
  const input = page.getByRole('textbox', { name: 'Window note' });
  await input.fill('Working note');
  await expect(input).toHaveValue('Working note');
  await expect(card.locator('output')).toHaveText('X 12 / Y 0 px');
  await handle.scrollIntoViewIfNeeded();
  const box = await handle.boundingBox();
  if (!box) throw new Error('Missing title bar');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 25, box.y + box.height / 2 + 10);
  await page.mouse.up();
  await expect(card.locator('output')).not.toHaveText('X 12 / Y 0 px');
  await card.getByRole('button', { name: 'Reset Window Drag' }).click();
  await expect(card.locator('output')).toHaveText('X 0 / Y 0 px');
});

test('four resize corners change dimensions and respect stage limits', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('.card-resize');
  for (const corner of ['tl', 'tr', 'bl', 'br']) {
    await card.getByRole('button', { name: 'Reset Resize Card' }).click();
    const handle = card.locator(`.resize-handle--${corner}`);
    await handle.press(corner.endsWith('l') ? 'ArrowLeft' : 'ArrowRight');
    await expect(card.locator('output')).toHaveText('W 232 / H 130 px');
    await handle.press(corner.startsWith('t') ? 'ArrowUp' : 'ArrowDown');
    await expect(card.locator('output')).toHaveText('W 232 / H 142 px');
  }
  const handle = card.locator('.resize-handle--br');
  await handle.scrollIntoViewIfNeeded();
  const box = await handle.boundingBox();
  if (!box) throw new Error('Missing resize handle');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    Math.min(box.x + 800, (page.viewportSize()?.width || 1280) - 10),
    Math.min(box.y + 800, (page.viewportSize()?.height || 720) - 10),
  );
  await page.mouse.up();
  const dimensions = await card.evaluate((element) => {
    const stage = element.querySelector('.resize-stage');
    const object = element.querySelector('.resizable-card');
    if (!stage || !object) throw new Error('Missing resizing elements');
    return {
      stage: stage.getBoundingClientRect().toJSON(),
      object: object.getBoundingClientRect().toJSON(),
    };
  });
  expect(dimensions.object.width).toBeLessThan(dimensions.stage.width);
  expect(dimensions.object.height).toBeLessThan(dimensions.stage.height);
  await card.getByRole('button', { name: 'Reset Resize Card' }).click();
  await expect(card.locator('output')).toHaveText('W 220 / H 130 px');
});

test('image panning never reveals blank edges and resets', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('.card-image');
  const frame = card.locator('.image-frame');
  await frame.press('ArrowRight');
  await expect(card.locator('output')).toHaveText('X 12 / Y 0 px');
  await frame.scrollIntoViewIfNeeded();
  const box = await frame.boundingBox();
  if (!box) throw new Error('Missing crop frame');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    Math.min(box.x + box.width + 600, (page.viewportSize()?.width || 1280) - 10),
    Math.min(box.y + box.height + 600, (page.viewportSize()?.height || 720) - 10),
  );
  await page.mouse.up();
  const geometry = await frame.evaluate((element) => {
    const image = element.querySelector('.pan-image');
    if (!image) throw new Error('Missing image');
    return {
      frame: element.getBoundingClientRect().toJSON(),
      image: image.getBoundingClientRect().toJSON(),
    };
  });
  expect(geometry.image.x).toBeLessThanOrEqual(geometry.frame.x + 1);
  expect(geometry.image.y).toBeLessThanOrEqual(geometry.frame.y + 1);
  expect(geometry.image.right).toBeGreaterThanOrEqual(geometry.frame.right - 1);
  expect(geometry.image.bottom).toBeGreaterThanOrEqual(geometry.frame.bottom - 1);
  await card.getByRole('button', { name: 'Reset Image Pan' }).click();
  await expect(card.locator('output')).toHaveText('X 0 / Y 0 px');
});

test('eleven experiments fit desktop and narrow mobile screens', async ({ page }) => {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('.lab-area .card')).toHaveCount(11);
    await expect(page.locator('.hero-meta strong')).toHaveText('11');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});
