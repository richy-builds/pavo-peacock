import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const evidence = 'docs/evidence';
async function ready(page: Page) {
  await page.goto('/');
  await expect(page.locator('#scene canvas')).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    return (window as any).__featherStudy?.snapshot().drawCalls;
  })).toBe(1);
  await expect(page.locator('#error')).toBeHidden();
}

test('feather renders, camera controls work, and instances share the geometry', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await ready(page);
  await mkdir(evidence, { recursive: true });
  await page.screenshot({ path: `${evidence}/01-feather-front.png` });
  const front = await page.evaluate(() => (window as any).__featherStudy.camera());
  await page.getByRole('button', { name: 'OBLIQUE', exact: true }).click();
  const oblique = await page.evaluate(() => (window as any).__featherStudy.camera());
  expect(oblique[0]).toBeGreaterThan(front[0] + 2);
  await page.screenshot({ path: `${evidence}/02-feather-oblique.png` });
  await page.getByRole('slider', { name: 'Light angle' }).fill('-55');
  await page.screenshot({ path: `${evidence}/03-feather-light.png` });
  await page.getByRole('button', { name: 'DETAIL', exact: true }).click();
  await page.getByRole('slider', { name: 'Light angle' }).fill('25');
  await page.screenshot({ path: `${evidence}/08-feather-detail.png` });
  const zoomBefore = await page.evaluate(() => (window as any).__featherStudy.camera());
  await page.mouse.move(720, 420);
  await page.mouse.wheel(0, -100);
  await expect.poll(() => page.evaluate(() => (window as any).__featherStudy.camera()[2])).toBeLessThan(zoomBefore[2]);
  await page.getByRole('button', { name: 'RESET', exact: true }).click();
  await page.mouse.move(760, 430);
  await page.mouse.down();
  await page.mouse.move(920, 480, { steps: 12 });
  await page.mouse.up();
  expect(await page.evaluate(() => (window as any).__featherStudy.camera())).not.toEqual(front);
  await page.getByRole('button', { name: '240 FEATHERS', exact: true }).click();
  await expect(page.getByRole('button', { name: '240 FEATHERS', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const snapshot = await page.evaluate(() => (window as any).__featherStudy.snapshot());
  expect(snapshot.feathers).toBe(240);
  expect(snapshot.geometries).toBeLessThanOrEqual(2);
  expect(snapshot.quality).toBe('low');
  expect(snapshot.triangles).toBeLessThan(2_000_000);
  expect(snapshot.drawCalls).toBe(1);
  await page.getByRole('slider', { name: 'Light angle' }).fill('25');
  await page.screenshot({ path: `${evidence}/04-field-front.png` });
  await page.getByRole('button', { name: 'OBLIQUE', exact: true }).click();
  await page.screenshot({ path: `${evidence}/05-field-oblique.png` });
  await page.getByRole('button', { name: 'FEATHER', exact: true }).click();
  await page.getByRole('button', { name: 'INSPECT', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Rendering diagnostics' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'INSPECT', exact: true })).toBeFocused();
  expect(errors).toEqual([]);
});

test('narrow viewport respects reduced motion and provides keyboard controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  await page.getByRole('button', { name: 'INSPECT', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Ambient motion' })).not.toBeChecked();
  await page.getByRole('button', { name: 'Close diagnostics' }).click();
  const slider = page.getByRole('slider', { name: 'Light angle' });
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveValue('26');
  await page.screenshot({ path: `${evidence}/06-feather-mobile.png` });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.getByRole('button', { name: '240 FEATHERS', exact: true }).click();
  await page.screenshot({ path: `${evidence}/07-field-mobile.png` });
});

test('records a 30-second moving-field benchmark with reproducible conditions', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: '240 FEATHERS', exact: true }).click();
  await page.getByRole('button', { name: 'INSPECT', exact: true }).click();
  await page.waitForTimeout(2500); // Shader compilation and first-frame warm-up.
  await page.getByRole('button', { name: 'RECORD 30 SECONDS', exact: true }).click();
  await expect(page.getByRole('button', { name: 'FEATHER', exact: true })).toBeDisabled();
  // Include camera motion, not just a static fan.
  for (let sweep = 0; sweep < 3; sweep++) {
    await page.mouse.move(600, 430);
    await page.mouse.down();
    await page.mouse.move(sweep % 2 ? 380 : 820, 450, { steps: 40 });
    await page.mouse.up();
    await page.waitForTimeout(2500);
  }
  await expect(page.locator('#benchmark-status')).toContainText('Complete.', { timeout: 35_000 });
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'DOWNLOAD REPORT', exact: true }).click();
  const download = await downloadPromise;
  await download.saveAs(`${evidence}/field-benchmark.json`);
  await expect(page.getByRole('button', { name: 'FEATHER', exact: true })).toBeEnabled();
});
