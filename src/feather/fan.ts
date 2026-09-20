import { Object3D } from 'three';

export interface FanFeather {
  readonly id: number;
  readonly layer: number;
  readonly slot: number;
  readonly side: number;
  readonly angle: number;
  readonly scale: number;
  readonly delay: number;
}

/** Mirrored, stable instance IDs. Outer layers lift first; neighbours follow. */
export function createFanLayout(): FanFeather[] {
  const feathers: FanFeather[] = [];
  for (let layer = 0; layer < 6; layer++) {
    const count = 50 - layer * 4;
    for (let slot = 0; slot < count; slot++) {
      const side = slot / (count - 1) * 2 - 1;
      feathers.push({ id: feathers.length, layer, slot, side,
        angle: side * 1.48, scale: 1.55 - layer * 0.16 + 0.065 * Math.cos(Math.abs(side) * 12 + layer * 0.7),
        delay: layer * 0.025 + Math.abs(side) * 0.055 });
    }
  }
  return feathers;
}

const smooth = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };

/** Critical damping integrated analytically: reversal preserves position and velocity. */
export class FanMotion {
  amount = 1;
  velocity = 0;
  target = 1;
  setTarget(value: number) {
    if (Number.isFinite(value)) this.target = Math.max(0, Math.min(1, value));
  }
  step(dt: number, reducedMotion = false) {
    const frequency = reducedMotion ? 16 : 7;
    const t = Math.max(0, Math.min(dt, 0.05));
    const offset = this.amount - this.target;
    const impulse = this.velocity + frequency * offset;
    const decay = Math.exp(-frequency * t);
    this.amount = this.target + (offset + impulse * t) * decay;
    this.velocity = (this.velocity - frequency * impulse * t) * decay;
    if (Math.abs(this.amount - this.target) < 0.00001 && Math.abs(this.velocity) < 0.0001) {
      this.amount = this.target;
      this.velocity = 0;
    }
  }
}

/** Lift before spreading; each shaft stays attached behind the rump.
 * Positive Z faces the viewer. The closed train extends along negative Z. */
export function poseFanFeather(p: FanFeather, amount: number, velocity: number, secondary: boolean, out: Object3D) {
  const phase = Math.max(0, Math.min(1, (amount - p.delay) / (1 - p.delay)));
  const lift = smooth(phase / 0.82);
  const spread = smooth((phase - 0.12) / 0.88);
  const lag = secondary ? Math.max(-0.018, Math.min(0.018, velocity * 0.012)) * Math.sin(Math.PI * phase) : 0;
  out.position.set(p.side * (0.08 + spread * 0.07), 1.25 + p.layer * 0.025,
    -0.12 + p.layer * 0.018);
  out.rotation.set(-1.62 * (1 - lift) - (0.16 + p.layer * 0.018) * lift + lag,
    p.side * 0.045 * (1 - spread), p.angle * spread + p.side * 0.045 * (1 - spread));
  out.scale.setScalar(p.scale);
  out.updateMatrix();
}
