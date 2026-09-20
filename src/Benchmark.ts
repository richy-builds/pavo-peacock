export interface RenderSnapshot {
  mode: 'single' | 'field' | 'fan';
  quality: 'high' | 'low';
  fanAmount: number;
  fanTarget: number;
  feathers: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  viewport: string;
  drawingBuffer: string;
  dpr: number;
  motion: boolean;
  renderer: string;
}

export class Benchmark {
  private frames: number[] = [];
  private recent: number[] = [];
  private started = 0;
  private duration = 30_000;
  private initial: RenderSnapshot | null = null;
  private resolve: ((value: object) => void) | null = null;
  result: object | null = null;

  get recording() { return this.resolve !== null; }
  get median() { return percentile(this.recent, 0.5); }
  get remaining() { return Math.max(0, Math.ceil((this.duration - (performance.now() - this.started)) / 1000)); }

  start(snapshot: RenderSnapshot, duration = 30_000): Promise<object> {
    if (this.recording) throw new Error('A benchmark is already recording.');
    this.frames = [];
    this.initial = snapshot;
    this.duration = duration;
    this.started = performance.now();
    this.result = null;
    return new Promise(resolve => { this.resolve = resolve; });
  }

  frame(milliseconds: number, now: number) {
    if (milliseconds <= 0) return;
    this.recent.push(milliseconds);
    if (this.recent.length > 120) this.recent.shift();
    if (!this.resolve) return;
    this.frames.push(milliseconds);
    if (now - this.started < this.duration) return;
    this.result = {
      recordedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ...this.initial,
      durationMs: Math.round(now - this.started),
      sampleCount: this.frames.length,
      medianFrameMs: round(percentile(this.frames, 0.5)),
      p95FrameMs: round(percentile(this.frames, 0.95)),
      maxFrameMs: round(Math.max(...this.frames)),
      framesAbove25Ms: this.frames.filter(t => t > 25).length,
      note: 'requestAnimationFrame intervals, not GPU timings. Study, light and ambient settings locked during capture; camera orbit and manual fan input remain available. Snapshot describes initial conditions. A headless run does not establish interactive hardware performance.',
    };
    const resolve = this.resolve;
    this.resolve = null;
    resolve(this.result);
  }

  cancel() {
    if (!this.resolve) return;
    this.resolve({ cancelled: true, reason: 'Page hidden, resized, or rendering interrupted during capture.' });
    this.resolve = null;
  }
}

function percentile(values: number[], fraction: number) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
}
const round = (value: number) => Math.round(value * 100) / 100;
