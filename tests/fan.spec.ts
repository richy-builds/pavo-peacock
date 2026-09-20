import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { Object3D, Vector3 } from 'three';
import { createFanLayout, FanMotion, poseFanFeather } from '../src/feather/fan';
import { createFeatherGeometry } from '../src/feather/geometry';

const evidence = 'docs/evidence';
const state = (page: Page) => page.evaluate(() => (window as any).__featherStudy.fanState());
async function ready(page: Page) {
  await page.goto('/');
  await expect(page.locator('#scene canvas')).toBeVisible();
  await page.getByRole('button', { name: 'FAN', exact: true }).click();
  await page.waitForTimeout(300);
}
async function amount(page: Page, value: number) {
  await page.getByRole('slider', { name: 'Fan opening' }).fill(String(value));
  await expect.poll(async () => Math.abs((await state(page)).amount - value)).toBeLessThan(0.00002);
}

test('deterministic mirrored layout, floor clearance and stable reversals', () => {
  const layout = createFanLayout();
  expect(layout).toEqual(createFanLayout());
  expect(new Set(layout.map(p => p.id)).size).toBe(240);
  const geometry = createFeatherGeometry();
  const positions = geometry.getAttribute('position');
  const out = new Object3D();
  const point = new Vector3();
  let minimumY = Infinity;
  for (let step = 0; step <= 40; step++) {
    for (const p of layout) {
      const mirror = layout.filter(other => other.layer === p.layer).find(other => Math.abs(other.side + p.side) < 1e-8)!;
      expect(Math.abs(mirror.angle + p.angle)).toBeLessThan(1e-8);
      expect(Math.abs(mirror.scale - p.scale)).toBeLessThan(1e-8);
      poseFanFeather(p, step / 40, 2, true, out);
      expect(out.matrix.elements.every(Number.isFinite)).toBe(true);
      for (let vertex = 0; vertex < positions.count; vertex++) {
        point.fromBufferAttribute(positions, vertex).applyMatrix4(out.matrix);
        minimumY = Math.min(minimumY, point.y);
      }
    }
  }
  expect(minimumY).toBeGreaterThan(0.05);
  geometry.dispose();
  const fan = new FanMotion();
  for (let i = 0; i < 2000; i++) {
    if (i % 7 === 0) fan.setTarget(i % 14 ? 0 : 1);
    const before = fan.amount;
    fan.step(i % 100 === 0 ? 10 : 1 / 60);
    expect(Number.isFinite(fan.velocity)).toBe(true);
    expect(fan.amount).toBeGreaterThanOrEqual(0);
    expect(fan.amount).toBeLessThanOrEqual(1);
    expect(Math.abs(fan.amount - before)).toBeLessThan(0.2);
  }
  fan.setTarget(0);
  for (let i = 0; i < 200; i++) fan.step(1 / 60);
  expect(fan.amount).toBe(0);
});

test('fan phase captures, controls, reduced motion and preserved studies', async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await mkdir(evidence, { recursive: true });
  await ready(page);
  for (const value of [0, 0.3, 0.6, 1]) {
    await amount(page, value);
    for (const [view, button] of [['front', 'RESET'], ['oblique', 'OBLIQUE'], ['side', 'SIDE']]) {
      await page.getByRole('button', { name: button, exact: true }).click();
      await page.waitForTimeout(120);
      await page.screenshot({ path: `${evidence}/hero-${value}-${view}.png` });
    }
  }
  await page.locator('canvas').click({ position: { x: 1000, y: 200 } });
  await page.keyboard.press('f');
  await expect.poll(async () => (await state(page)).target).toBe(0);
  for (let i = 0; i < 10; i++) { await page.waitForTimeout(70); await page.keyboard.press('f'); }
  expect((await state(page)).amount).toBeGreaterThan(0);
  for (const value of [0.1, 0.9, 0.2, 0.8, 0.4]) await page.getByRole('slider', { name: 'Fan opening' }).fill(String(value));
  await page.getByRole('slider', { name: 'Fan opening' }).focus();
  await page.keyboard.press('f');
  expect((await state(page)).target).toBe(0.4);
  await page.keyboard.press('ArrowRight');
  expect((await state(page)).target).toBe(0.41);
  await page.getByRole('button', { name: 'FEATHER', exact: true }).click();
  await expect(page.locator('#fan-controls')).toBeHidden();
  await page.getByRole('button', { name: 'DETAIL', exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__featherStudy.snapshot().quality)).toBe('high');
  await page.getByRole('button', { name: '240 FEATHERS', exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__featherStudy.snapshot().quality)).toBe('low');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'FAN', exact: true }).click();
  await amount(page, 1);
  await page.screenshot({ path: `${evidence}/hero-mobile.png` });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  expect(errors).toEqual([]);
});

for (const scenario of ['orbit', 'reversal']) {
  test(`30-second fan ${scenario} benchmark`, async ({ page }) => {
    await ready(page);
    await page.getByRole('button', { name: 'INSPECT', exact: true }).click();
    await page.waitForTimeout(2500);
    await page.getByRole('button', { name: 'RECORD 30 SECONDS', exact: true }).click();
    const started = Date.now();
    let iteration = 0;
    while (Date.now() - started < 30_100) {
      if (scenario === 'reversal') {
        await page.getByRole('slider', { name: 'Fan opening' }).fill(iteration % 2 ? '1' : '0');
        await page.waitForTimeout(900);
      } else {
        await page.mouse.move(600, 430); await page.mouse.down();
        await page.mouse.move(iteration % 2 ? 550 : 650, 435, { steps: 45 }); await page.mouse.up();
        await page.waitForTimeout(150);
      }
      iteration++;
    }
    await expect(page.locator('#benchmark-status')).toContainText('Complete.');
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: 'DOWNLOAD REPORT', exact: true }).click();
    await (await pending).saveAs(`${evidence}/hero-${scenario}-benchmark.json`);
    await writeFile(`${evidence}/hero-${scenario}-scenario.json`, JSON.stringify({ scenario, iteration, durationMs: Date.now() - started, description: scenario === 'orbit' ? 'Continuous alternating 50px horizontal camera drags, 45 steps per drag.' : 'Fan target alternated between 0 and 1 every 900ms; reversals occur before settling.', limitations: 'Headless Chrome frame scheduling, not GPU timing or headed confirmation. Initial snapshot; geometry tier remains low.' }, null, 2));
  });
}
