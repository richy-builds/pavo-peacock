import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

test('distance tier and sampled thin-detail motion review', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '240 FEATHERS', exact: true }).click();
  const snapshots = [];
  for (let frame = 0; frame < 6; frame++) {
    await page.mouse.move(700, 430); await page.mouse.down();
    await page.mouse.move(702, 430, { steps: 4 }); await page.mouse.up();
    await page.waitForTimeout(80);
    await page.screenshot({ path: `docs/evidence/lod-motion-${frame}.png` });
    snapshots.push(await page.evaluate(() => (window as any).__featherStudy.snapshot()));
  }
  expect(snapshots.every(s => s.quality === 'low' && s.drawCalls === 1)).toBe(true);
  await page.getByRole('button', { name: 'FEATHER', exact: true }).click();
  await page.getByRole('button', { name: 'DETAIL', exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__featherStudy.snapshot().quality)).toBe('high');
  await page.screenshot({ path: 'docs/evidence/lod-close-high.png' });
  await page.mouse.move(720, 430);
  for (let step = 0; step < 32; step++) {
    await page.mouse.wheel(0, 120); await page.waitForTimeout(100);
  }
  await expect.poll(() => page.evaluate(() => (window as any).__featherStudy.snapshot().quality)).toBe('low');
  await page.screenshot({ path: 'docs/evidence/lod-distant-low.png' });
  await writeFile('docs/evidence/lod-review.json', JSON.stringify({ snapshots, note: 'Six adjacent 2px orbit drags at stress distance plus close/high and distant/low zoom captures. Alpha-to-coverage smooths branch coverage; distance tier keeps all branch IDs and forks, reduces curve tessellation. Headless Chrome sampling; no claim of elimination of all subpixel aliasing.' }, null, 2));
});
