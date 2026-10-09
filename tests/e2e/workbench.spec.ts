import { expect, test } from '@playwright/test';

test('precision, limits and reset work on both scalar axes', async ({ page }) => {
  await page.goto('/');
  for (const name of ['Interaction value', 'Vertical value']) {
    const control = page.getByRole('slider', { name, exact: true });
    const card = control.locator('xpath=ancestor::section[1]');
    await card.getByRole('button', { name: 'Precision', exact: true }).click();
    await control.press('ArrowRight');
    await expect(card.locator('output')).toHaveText('0.505');
    await control.press('End');
    await expect(control).toHaveAttribute('aria-valuenow', '100');
    await control.press('Home');
    await expect(control).toHaveAttribute('aria-valuenow', '0');
    await card.getByRole('button', { name: /Reset/ }).click();
    await expect(card.locator('output')).toHaveText('0.500');
  }
});

test('XY pad and hero signal update and reset with keyboard', async ({ page }) => {
  await page.goto('/');
  for (const id of ['hero-pad', 'xy-pad']) {
    const pad = page.getByTestId(id);
    await pad.press('ArrowRight');
    await expect(pad.locator('.xy-handle')).toHaveCSS('left', /.+/);
    const container =
      id === 'hero-pad' ? page.locator('.hero-instrument') : page.locator('.card-xy');
    await expect(container.locator('output')).toHaveText('X 0.525 / Y 0.500');
    await container.getByRole('button', { name: /Reset/ }).click();
    await expect(container.locator('output')).toHaveText('X 0.500 / Y 0.500');
  }
});

test('rotary detents accumulate small pointer moves and support keyboard', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('.card-rotary');
  await card.getByRole('button', { name: '15° stops', exact: true }).click();
  const rotary = page.getByRole('slider', { name: 'Rotation angle' });
  await rotary.press('ArrowRight');
  await expect(card.locator('output')).toHaveText('15°');
  await rotary.scrollIntoViewIfNeeded();
  const box = await rotary.boundingBox();
  if (!box) throw new Error('Missing rotary bounds');
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y - 30, { steps: 30 });
  await page.mouse.up();
  await expect(card.locator('output')).toHaveText('45°');
  await card.getByRole('button', { name: 'Reset Rotary', exact: true }).click();
  await expect(rotary).toHaveAttribute('aria-valuenow', '0');
});

test('snap keyboard moves through fixed stops and reset', async ({ page }) => {
  await page.goto('/');
  const snap = page.getByRole('slider', { name: 'Snap value' });
  await snap.press('ArrowRight');
  await expect(snap).toHaveAttribute('aria-valuenow', '75');
  await snap.press('End');
  await snap.press('ArrowRight');
  await expect(snap).toHaveAttribute('aria-valuenow', '100');
  await page.getByRole('button', { name: 'Reset Snap Points' }).click();
  await expect(snap).toHaveAttribute('aria-valuenow', '50');
});

test('free drag stays recoverable and spring returns after keyboard release', async ({ page }) => {
  await page.goto('/');
  const object = page.locator('.free-object');
  for (let i = 0; i < 50; i++) await object.press('ArrowRight');
  const zoneBox = await page.locator('.free-zone').boundingBox();
  const objectBox = await object.boundingBox();
  if (!zoneBox || !objectBox) throw new Error('Missing drag bounds');
  expect(objectBox.x + objectBox.width).toBeLessThan(zoneBox.x + zoneBox.width);
  await page.getByRole('button', { name: 'Reset Free Drag' }).click();
  await expect(page.locator('.card-free output')).toHaveText('X 0 / Y 0 px');
  await page.locator('.spring-object').press('ArrowRight');
  await expect(page.locator('.card-spring output')).toHaveText('X 0 / Y 0 px');
});

test('mobile touch controls avoid page scroll while stage margins allow it', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const selector of [
    '.slider',
    '.vertical-slider',
    '.xy-pad',
    '.rotary-wrap',
    '.free-object',
    '.spring-object',
  ]) {
    const actions = await page
      .locator(selector)
      .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).touchAction));
    expect(actions.every((action) => action === 'none')).toBe(true);
  }
  await expect(page.locator('.free-zone')).toHaveCSS('touch-action', 'auto');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
