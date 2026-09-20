# PAVO — procedural peacock studies

A procedural 3D peacock built through milestone 4 of the [interactive peacock plan](docs/peacock-plan.md). Shared curved feather geometry, palette-limited iridescence, reversible folding, articulated anatomy, and composable tactile/life interactions. Single-feather and 240-feather studies remain available. Walking and cinema are later milestones.

Art direction: [original peacock reference](docs/reference/peacock.png), preserved unchanged from the supplied attachment.

## Run

Requires Node.js 22.12+ or a compatible newer release. Developed with Node 24.19.0.

```sh
npm ci
npm run dev
```


```sh
npm run build
npm run preview
```

## Explore

- Drag to orbit; scroll or pinch to zoom.
- **FEATHER / 240 FEATHERS / FAN** selects the single object, unchanged static stress layout, or controllable train.
- In **FAN**, use the **Fan opening** slider or **OPEN / CLOSE** button. **F** toggles the target when focus is outside form controls. Reversing preserves motion velocity; slider changes smoothly retarget the same trajectory.
- Brush solid feather vanes to apply local pressure; click an eye to send an outward ripple. Click the body for a small acknowledgment.
- **SHAKE** shimmers the train with per-feather phases. **DISPLAY** opens and lifts the posture, **BOW** inclines the neck then recovers, and **REST** closes and relaxes the train. Manual fan input cancels display/rest targeting. Gestures compose with folding and ripples.
- **LIGHT** rotates the shader's key light.
- **DETAIL**, **OBLIQUE**, **SIDE**, and **RESET** provide repeatable camera views.
- **INSPECT** shows rendering statistics, an ambient-motion toggle, and a downloadable 30-second benchmark.

Reduced-motion preferences disable ambient life, tactile feather displacement, head tracking/nods, secondary fan lag and camera damping by default; eye-click highlights are restrained and explicit bows are very small. Fan response remains smoothly controllable. The controls remain keyboard accessible. Benchmark capture locks configuration changes while permitting orbit and fan input; resizing or hiding the page cancels capture so incompatible conditions are not combined.

## Verify

```sh
npm test
```

Tests use locally installed Google Chrome through Playwright and a Vite server on port 5174. Install Chrome before running, or change the Playwright channel to an installed browser. The suite captures desktop, oblique, detail, and mobile views; checks camera/zoom, instancing, reduced motion, and keyboard access; checks deterministic mirrored layouts, floor clearance, rapid reversal and fan input ownership; captures all four fan phases from three angles; validates deformed picking, gesture composition, drag/click ownership, and bounded effect recovery; and records separate 30-second field, full-fan orbit, reversing-fan and combined-interaction benchmarks. Visual captures and benchmark JSON are stored in `docs/evidence/`. One worker avoids concurrent GPU workloads.

The benchmark measures browser frame intervals, not GPU duration. Headless GPU-backed results are a useful baseline, not proof of final interactive performance. The fan includes procedural anatomy, a horizonless contact shadow, and width-aware solid-feather picking. Thin translucent barbs are not hit targets. Head/neck pivots provide restrained gestures; no collision solver or physical mirrored reflection pass is used. The renderer uses two shared feather detail tiers, derivative-filtered ornament, and screen-space branch coverage with MSAA alpha-to-coverage. The high tier is restored below 8 world units of camera-target distance; the low tier starts above 10, providing hysteresis. Zooming the whole fan close uses the high tier for all instances; per-instance LOD remains a future optimization.

## Structure

- `src/feather/geometry.ts`: shared curved shaft, branches, and convex eye vane.
- `src/feather/fan.ts`: stable mirrored metadata, lift/spread trajectories, and analytic critical damping.
- `src/feather/material.ts`: palette-limited view/light response and procedural eye ornament.
- `src/feather/picking.ts`: shared CPU solid-vane/shaft proxy using the rendered instance transforms.
- `src/Life.ts`: bounded hover, ripple, shake, posture and idle channels.
- `src/Hero.ts`: procedural anatomy with articulated neck/head and blinking eyes.
- `src/FeatherStudy.ts`: scene, instancing, camera presets, ambient motion, resizing, and disposal.
- `src/Benchmark.ts`: rolling metrics and recording lifecycle.
- `src/main.ts`: minimal UI and development-only read diagnostics.
- [Plan and tracker](docs/peacock-plan.md): decisions, acceptance gates, evidence, and next task.

No image textures or external font services are used. The browser experience has no remote service dependency. Geometry is deterministic; the reference image is not part of the rendered scene.

Implementation references: [Three.js InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html), [ShaderMaterial](https://threejs.org/docs/pages/ShaderMaterial.html), and [Vite setup](https://vite.dev/guide/).
