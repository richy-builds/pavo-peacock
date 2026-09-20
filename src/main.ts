import './style.css';
import { FeatherStudy } from './FeatherStudy';

const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const input = (id: string) => element<HTMLInputElement>(id);
let study: FeatherStudy | undefined;

try {
  study = new FeatherStudy(element('scene'));
  const app = study;
  const events = new AbortController();
  const listen = (id: string, event: string, handler: EventListener) =>
    element(id).addEventListener(event, handler, { signal: events.signal });

  function setMode(mode: 'single' | 'field' | 'fan') {
    app.setMode(mode);
    const field = app.mode === 'field';
    document.body.classList.toggle('field-mode', field);
    element('single').setAttribute('aria-pressed', String(app.mode === 'single'));
    element('fan').setAttribute('aria-pressed', String(app.mode === 'fan'));
    element('fan-controls').hidden = app.mode !== 'fan';
    element('field').setAttribute('aria-pressed', String(field));
    element('view-number').textContent = app.mode !== 'single' ? '240 / 240' : '01 / 01';
    element('view-caption').textContent = app.mode === 'fan' ? 'The unfolding train' : field ? 'A study in repetition' : 'A single feather';
  }

  listen('fan', 'click', () => setMode('fan'));
  const fanInput = input('fan-amount');
  function targetFan(value: number) {
    app.setFanTarget(value); fanInput.value = String(app.fan.target);
    element('fan-value').textContent = `${Math.round(app.fan.target * 100)}%`;
  }
  for(const action of ['shake','display','bow','rest'] as const) listen(action,'click',()=>{
    app.action(action);fanInput.value=String(app.fan.target);element('fan-value').textContent=`${Math.round(app.fan.target*100)}%`;
  });
  listen('fan-amount', 'input', () => targetFan(Number(fanInput.value)));
  listen('toggle-fan', 'click', () => targetFan(app.fan.target >= 0.5 ? 0 : 1));
  listen('side', 'click', () => app.sideCamera());
  listen('single', 'click', () => setMode('single'));
  listen('field', 'click', () => setMode('field'));
  listen('light', 'input', () => app.light(Number(input('light').value)));
  listen('oblique', 'click', () => app.resetCamera(true));
  listen('detail', 'click', () => app.detailCamera());
  listen('reset', 'click', () => app.resetCamera());
  input('motion').checked = app.motion;
  listen('motion', 'change', () => app.setMotion(input('motion').checked));

  function inspect(open: boolean) {
    element('diagnostics').hidden = !open;
    element('inspect').setAttribute('aria-expanded', String(open));
  }
  listen('inspect', 'click', () => inspect(Boolean(element('diagnostics').hidden)));
  listen('close-inspect', 'click', () => { inspect(false); element('inspect').focus(); });
  document.addEventListener('keydown', event => {
    const editing = event.target instanceof Element && !!event.target.closest('input, textarea, select, button, [contenteditable]');
    if (event.key.toLowerCase() === 'f' && !editing && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey && app.mode === 'fan') {
      event.preventDefault(); targetFan(app.fan.target >= 0.5 ? 0 : 1);
    }
    if (event.key === 'Escape' && !element('diagnostics').hidden) {
      inspect(false);
      element('inspect').focus();
    }
  }, { signal: events.signal });

  const metrics = element('metrics');
  const metricLabels = ['Feathers', 'Draw calls', 'Triangles', 'Frame median', 'Pixel ratio', 'Buffer', 'Detail tier'];
  const values = metricLabels.map(label => {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    metrics.append(dt, dd);
    return dd;
  });
  app.onMetrics = snapshot => {
    const display = [snapshot.feathers, snapshot.drawCalls, snapshot.triangles.toLocaleString(),
      `${app.benchmark.median.toFixed(1)} ms`, snapshot.dpr, snapshot.drawingBuffer, snapshot.quality];
    values.forEach((value, i) => { value.textContent = String(display[i]); });
    if (app.benchmark.recording) element('benchmark-status').textContent = `Recording… ${app.benchmark.remaining}s remaining. You can orbit the camera.`;
  };

  listen('benchmark', 'click', async () => {
    const locked = [...document.querySelectorAll<HTMLButtonElement | HTMLInputElement>('.controls button:not(#inspect), .controls input, #motion, #benchmark')];
    locked.forEach(control => { control.disabled = true; });
    element('download').hidden = true;
    const result = await app.benchmark.start(app.snapshot());
    locked.forEach(control => { control.disabled = false; });
    const report = result as { cancelled?: boolean; medianFrameMs: number; p95FrameMs: number };
    element('benchmark-status').textContent = report.cancelled
      ? 'Capture cancelled because the page or rendering conditions changed. Start again when ready.'
      : `Complete. Median ${report.medianFrameMs} ms · p95 ${report.p95FrameMs} ms. Download includes rendering conditions.`;
    element('download').hidden = !!report.cancelled;
  });
  listen('download', 'click', () => {
    if (!app.benchmark.result) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(app.benchmark.result, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `pavo-${app.mode}-benchmark.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  // Read-only browser-test diagnostics, excluded from production builds.
  if (import.meta.env.DEV) {
    Object.defineProperty(window, '__featherStudy', { configurable: true, value: {
      snapshot: () => app.snapshot(),
      fanState: () => ({ amount: app.fan.amount, target: app.fan.target, velocity: app.fan.velocity }),
      eyeScreen: (id: number) => app.eyeScreen(id),
      lifeState: () => app.life.snapshot(),
      pickingEvidence: () => app.pickingEvidence(),
      camera: () => app.camera.position.toArray(),
    } });
  }
  import.meta.hot?.dispose(() => { events.abort(); app.dispose(); });
} catch (error) {
  study?.dispose();
  element('error').textContent = 'This study needs WebGL 2 graphics support. Please try a browser with hardware acceleration enabled.';
  element('error').hidden = false;
  console.error(error);
}
