# Interactive peacock — plan and progress

Updated: 2026-09-06

## Current status

Milestones 1 and 2 remain complete under their recorded conditions. Milestone 3 is implemented and accepted as a stylised procedural hero under the browser conditions recorded below. FAN now includes continuous anatomy, layered plumage, folding coverts, feet, restrained lighting and horizonless grounding. FEATHER and 240 FEATHERS, slider/F controls, reversible damping, reduced motion and the existing feather LOD tiers remain available. Milestone 4 is now implemented and accepted under the recorded browser conditions: deformation-aware solid-feather picking, local hover/ripple, phased shake, acknowledgment/head tracking, display/bow/rest and restrained idle life. Milestone 4.5 body refinement and the inspected 10-second X video are implemented; final validation is running. Walking and cinema remain unimplemented. No Git repository existed at initial inspection; one has not been created.

Creative sources: [original brief](peacock-brief.md), preserved verbatim, and [original peacock reference](reference/peacock.png). The original attached PNG was recovered unchanged from the saved conversation on 2026-09-06 and visually verified (1370×1148). Use it for art direction and visual reviews, not as a rendered scene asset.

## Outcome and priorities

Build a living, controllable procedural 3D peacock in a dark museum-like environment. Preserve the reference's monumental symmetry, layered ornament, sapphire/turquoise/emerald colour, antique gold detail, and restrained presentation.

Priority order:

1. Convincing feathers and magnificent full-fan composition.
2. Beautiful, continuously controllable folding with visible depth.
3. Smooth performance at representative scene complexity.
4. Tactile, composable interaction and expressive motion.
5. Walking, environment responses, and presentation polish.

The reference must not be rendered on planes as the bird. Avoid flat card silhouettes, rainbow chrome, excessive bloom, constant exaggerated motion, and interface clutter. The model may be stylised.

## Provisional decisions

These are working defaults, to be revisited when prototype evidence warrants it.

| Topic | Working decision |
| --- | --- |
| Stack | TypeScript, Vite, Three.js; no UI framework unless a concrete need emerges. Verify current compatible versions when scaffolding. |
| Rendering | Shared curved geometry and instancing; geometric shafts and prominent branches, shader detail for fine ornament and eye patterns. Prototype before committing to material implementation. |
| Feather population | Deterministic, mirrored radial layers with depth. Start with roughly 200–300 main feathers as a provisional stress case, then tune density against the reference. |
| Fan motion | Per-feather local trajectories from folded train to open radial placement; angle/position/curvature controls, eased phase offsets, and bounded secondary displacement. Do not interpolate only a global scale. |
| Behaviour | Separate locomotion, posture/head tracking, fan control, and transient shake/ripple channels. Establish ownership and blending rather than one exclusive behavioural state. |
| Control precedence | Manual fan input cancels automated fan targeting. Camera input cancels intro/cinema ownership. Shake, ripple, and head tracking remain composable with walking and folding. |
| Intro | First visit: interruptible 5–7 second reveal. Later visits: hero composition. Reduced motion: immediate hero view and restrained secondary motion. |
| Input | Empty-space drag orbits; feather clicks ripple; body clicks acknowledge. Movement threshold distinguishes click from drag. Slider and F are the reliable fan controls. |
| Fan dragging | Optional experiment after core interaction works; must have explicit hit regions and pointer capture to avoid fighting orbit controls. |
| Lighting | Gentle background-pointer influence initially; optional L-drag override can persist a deliberate light position. |
| Camera | Orbit first; follow later; cinema last. One active camera owner with smooth handoff. |
| Touch/accessibility | Touch orbit/zoom and visible controls; labelled keyboard-operable slider and buttons, visible focus, and no shortcut interception while a form control has focus. Restore faded UI on focus or interaction. |
| Audio | Deferred; no audio dependency or empty audio framework for V1. |

Feather transforms are a composition of a base trajectory, local spring displacement, and effect offsets. The brief's multiplication notation is conceptual, not a literal multiplication of all state values. Maintain stable feather IDs and metadata for instancing and picking.

## Milestones and acceptance gates

Each milestone ends with a running-browser inspection and recorded evidence below. Fix failed gates before adding the next feature layer.

### 0 — Project preparation

- [x] Preserve original brief.
- [x] Inspect workspace and record assumptions.
- [x] Establish milestones and progress tracking.
- [x] Save original reference image under `docs/reference/`: [peacock.png](reference/peacock.png).
- [x] Scaffold TypeScript/Vite/Three.js app with development and build scripts.
- [x] Record exact test laptop, browser, viewport, and effective pixel ratio. Apple M1 Pro MacBook Pro (32 GB), macOS 26.6.1; Chrome 152 headless using ANGLE Metal on the M1 Pro; 1440×900 CSS, DPR 1.5, 2160×1350 buffer. Interactive headed-browser confirmation remains outstanding.

### 1 — Feather prototype

Deliver one reusable feather with curved volume, shaft, branching silhouette, layered eye-spot detail, and view/light-responsive iridescence. Include a temporary development view for close and oblique inspection plus a repeated-feather stress view.

Acceptance:

- [x] Recognisable feather shape at hero distance and close range, including at 30–45 degrees. First visual prototype reviewed from front and approximately 46° oblique.
- [x] Eye pattern retains gold, emerald, turquoise, deep blue, and dark violet regions.
- [x] Light and camera movement visibly change colour within the intended palette.
- [x] Thin details avoid unacceptable flicker/aliasing during sampled motion at the recorded target conditions; see LOD review and limitations below.
- [x] Representative repeated geometry shares materials and yields measured draw-call/triangle/frame-time evidence. 240 instances, one geometry/material, one draw call; see benchmark and captures below.

Prototype review: initial enamel-like glare was reduced, geometry-induced surface banding was removed, and branch-aligned shader grooves added. The current eye is intentionally stylised and still needs more organic border detail. Distance rendering now uses a second shared tessellation tier and screen-space branch coverage with MSAA alpha-to-coverage. Unresolved tips and their specular highlights fade; fork origins are identical across tiers. Fine detail remains deliberately softer at distance. The static stress layout is a measurement tool, not an accepted final fan composition.

### 2 — Controllable fan

Deliver deterministic radial layers with independent feather metadata, a fan slider, F toggle, damped secondary motion, and a simple placeholder body for scale and attachment points.

Acceptance:

- [x] Inspect and capture `fanAmount` 0, 0.3, 0.6, and 1 from front, oblique, and side views.
- [x] Closed feathers form a narrow train behind the bird; open feathers form a monumental fan with layered depth.
- [x] Opening follows believable individual trajectories, with a gentle cascade rather than uniform rotation or scaling.
- [x] Rapid F reversal and slider scrubbing produce no snapping, discontinuities, or unstable springs.
- [x] Representative feather count performs acceptably while moving, not only when static.
- [x] Inspect overlap and floor/body penetration throughout the transition; resolve conspicuous intersections.

### 3 — Hero composition

Deliver body, neck, head, crest, wings, legs, feet, cinematic lighting, restrained reflection/shadow, and orbit/zoom/reset camera controls.

Acceptance:

- [x] Front view matches the reference's visual hierarchy, symmetry, fan proportions, rich dark values, and colour distribution.
- [x] Oblique and side views show a coherent sculpture with no exposed visual shortcuts.
- [x] Whole-bird framing works at desktop and narrow viewports without clipping the fan.
- [x] Reflection and lighting reinforce feather detail without washing it out.
- [x] Orbit, zoom, and double-click background reset behave consistently.

Acceptance is for the broad reference hierarchy and a coherent stylised sculpture, not photorealism or matching the reference’s fine ornament. Grounding uses a soft contact shadow/light pool; no mirrored reflection pass is claimed. See the milestone 3 review below.

### 4 — Tactile interaction and life

Deliver efficient feather picking, local hover forces, propagating eye-spot ripples, phased shake, acknowledgment/head tracking, display, bow, rest, and subtle breathing/blinking/settling.

Acceptance:

- [x] Picking follows the currently deformed fan sufficiently accurately at partial opening and oblique angles.
- [x] Hover settles smoothly; a click creates a visible outward wave with no notification UI.
- [x] Shake uses individual phase offsets and moving highlights rather than whole-fan rotation.
- [x] Manual fan control, shake, ripple, and head response can run together.
- [x] Pointer drag does not accidentally trigger a click; UI actions do not leak into the scene.
- [x] Optional direct fan drag is retained only if intuitive; record the decision.

### 4.5 — Body realism and X post capture

Added after milestone 4 review. The user likes the fan feathers; the close-up body still reads as a toy. Prioritize this bounded art/presentation pass before walking. Preserve the procedural sculpture and existing fan design; improve the central bird to support it. This pass is implemented; final validation status and evidence are recorded below.

Priority order:

1. Rework face and crest: tapered head profile, smaller eyes with precise surrounding markings, a pointed beak replacing the curved ivory tube, and delicate crest feathers replacing chunky tips.
2. Replace rounded shoulder/covert paddles and coarse body scales with thin, tapered, curved plumage. Add directional feather detail and much finer neck/breast coverage. Preserve attachment and reversible covert folding.
3. Refine neck curve/taper, chest transitions and wing structure. Review close front, three-quarter and side views; keep head tracking, blinking and bow articulation coherent.
4. Tune roughness, fine feather shading and restrained rim lighting after the shape changes. Retain sapphire/turquoise/emerald and antique gold; reduce plastic highlights.
5. Produce a clean, approximately 10-second shareable video: strong three-quarter opening composition, gentle unfolding, one ripple or shake, then a settled hero. Hide UI/hints during capture and leave framing margin. A deterministic capture script or lightweight capture mode is enough; a general cinema system is outside this pass.

Use the original reference for art direction and real peacock photographic references for anatomy. Save/link useful anatomical references with source attribution. Do not render reference photographs as the bird or replace the procedural fan with image assets.

Acceptance:

- [x] Before/after body close-ups visibly improve face, beak, crest and plumage realism while preserving the fan's visual hierarchy.
- [x] Front, three-quarter and side views remain coherent, with no conspicuous neck joints, exposed roots or covert/body intersections in sampled folds and gestures.
- [ ] All three study views, orbit/zoom/reset, slider/F, reversible folding, tactile picking/effects, reduced motion and LOD remain functional.
- [ ] Browser visual iteration and relevant regression checks pass; record moving-scene benchmarks after geometry/material changes, including representative close body inspection. Freeze application source during every capture run.
- [x] Save a clean playable video and poster frame under `docs/evidence/`, with capture conditions and any export limitations. Inspect the actual export. Do not publish to X; the deliverable is ready for user review/sharing.
- [ ] Update this tracker with evidence, limitations and the next task. Stop at this pass; walking, particles, intro and cinema remain later work.

### 5 — Elegant movement

Deliver bounded WASD/arrow movement, turning, slow gait, body/head counter-motion, tail lag, and follow camera.

Acceptance:

- [ ] Walking and turning are believable with both closed and fully open fan.
- [ ] Feet maintain plausible ground contact and the tail remains attached during turns.
- [ ] Movement limits account for the fan's footprint and avoid camera/scene boundary failures.
- [ ] Input releases on focus loss; frame stalls do not cause large jumps or spring explosions.
- [ ] Follow/orbit transitions are smooth and manual camera control has predictable ownership.

### 6 — Presentation and quality

Deliver interruptible intro, cinema mode, minimal fading UI, restrained reactive particles, accessible controls, reduced-motion support, and measured quality presets/adaptation where justified.

Acceptance:

- [ ] Any intended manual scene interaction exits the intro gracefully; click/Escape exits cinema and restores controls.
- [ ] Reduced motion skips intro/camera choreography and suppresses nonessential ambient animation.
- [ ] UI remains discoverable, keyboard accessible, and usable on touch screens.
- [ ] Particle bursts and floor effects remain subtle and within rendering budget.
- [ ] All ten visual review questions in brief section 27 have recorded outcomes.
- [ ] Final build and targeted interaction checks pass; limitations are documented.

## Performance and verification

Target approximately 60fps on the specified Apple Silicon test laptop. Initial desktop benchmark uses 1440×900 CSS with DPR capped at 1.5 (2160×1350 buffer). Actual browser conditions are recorded in [benchmark JSON](evidence/field-benchmark.json). This is a headless feather-only baseline, not a claim about performance of the completed experience.

Record median and p95 frame times, draw calls, triangle counts, quality level, and device/browser. After warm-up, sample at least 30 seconds each of full-fan orbit, repeated opening/reversal, and combined walking/shake/ripple. A 60fps frame budget is roughly 16.7ms; investigate sustained misses and stutter separately. State clearly if testing uses software rendering or different hardware.

Prefer instancing, shared assets, bounded DPR, limited shadows, lightweight picking, and GPU detail. Account for shader-deformed geometry in picking and bounding volumes. Test reflection cost with the real fan. Consider detail tiers before sacrificing the primary silhouette; add adaptive quality only if measurements justify it, with hysteresis to avoid oscillation.

Use targeted tests for deterministic layout, finite fan endpoints, reversible controls, movement boundaries, and input ownership when those systems exist. Use browser interaction checks for integration and screenshots for visual judgment. Do not substitute passing unit tests for a visual review or claim performance without measurement.

## Open items and risks

- Original reference is preserved at `docs/reference/peacock.png` and available for future visual reviews.
- Target laptop/browser are recorded above; lower-device quality and manual headed-browser confirmation remain outstanding.
- Fine filigree, close-up geometry, and reflections may compete for the rendering budget: resolve in the early prototype.
- High detail remains 12,896 triangles per feather; the distance tier is 6,432 (1,543,680 for 240 feathers, about 50% less). Both retain all branches and forks. Camera-target distances below 8 use high detail and above 10 use low detail, with hysteresis between. LOD currently applies to the whole instanced mesh: close fan inspection still draws 3.10M feather triangles. Revisit per-instance tiers before adding costly reflections.
- Fan feathers use a material width of 0.48 with corrected normals; study feathers retain width 1. Milestone 4 picking bakes this width into a shared solid-vane/shaft proxy and copies the current instance transforms; translucent hairline branches are not hit targets. Conservative bounds include branch expansion.
- Milestone 3 reduces eye coverage/saturation, adds dark striated vanes and gold boundaries, covers root attachments, and removes the floor horizon. The result remains stylised: repeated eye rows and rounded covert scales are more regular than the reference, and shafts remain visible as ornament outside the shoulder coverts. Feather overlap is intentional; there is no feather-to-feather collision solver.
- Subpixel hairlines cannot be made perfectly alias-free with MSAA. The thin-detail gate covers sampled orbit/zoom at the recorded DPR and hardware, not every display/browser.
- Vite reports the initial application bundle above its 500 kB warning threshold (approximately 597 kB minified / 152 kB gzip, including Three.js). Build passes. Revisit loading/chunking when introducing further systems; do not hide the warning by merely raising its threshold.
- Folded-train trajectories may need more than endpoint interpolation to avoid collisions and preserve feather orientation.
- Procedural materials can reproduce the palette without matching the reference's density: evaluate silhouette, ornament, and material separately.
- A touch movement interface is not specified. Keep movement keyboard-first initially and decide whether touch walking is required before final acceptance.
- Optional features: direct fan dragging, L-drag light control, foot disturbances, and cinema can be deferred individually if core gates are not strong. Record deferrals explicitly; do not silently mark the full brief complete.

## Progress log

| Date | Work / evidence | Result / next action |
| --- | --- | --- |
| 2026-09-06 | Inspected workspace and attachment folder; preserved brief and wrote this plan. | No existing application or Git history. Planning only; begin milestone 0 scaffolding and milestone 1 feather prototype next. |
| 2026-09-06 | Implemented TypeScript/Vite scaffold, shared geometry/material, instanced study, input controls, reduced motion, and benchmark capture. Browser review prompted two material refinements and removal of the large caption. | Running locally on port 5174. Production build passes; browser interaction and mobile checks pass. Current evidence is listed below; final thin-detail gate remains open. |

| 2026-09-06 | Added distance tessellation, filtered branch coverage/highlights, stable mirrored fan metadata, analytic critical damping, individual lift/spread paths, slider/F/button controls, placeholder body/floor and SIDE preset. Visual iterations fixed tip clipping, eye-band overlap, floating roots and forward fan lean. | Preserved both original study layouts. Fan phase and moving-performance evidence below; milestone 3 is next. |

### Prototype evidence

- [Single feather, front](evidence/01-feather-front.png)
- [Single feather, oblique](evidence/02-feather-oblique.png)
- [Alternate light angle](evidence/03-feather-light.png)
- [Eye close-up](evidence/08-feather-detail.png)
- [240-feather stress scene, front](evidence/04-field-front.png)
- [240-feather stress scene, oblique](evidence/05-field-oblique.png)
- [Mobile feather](evidence/06-feather-mobile.png) and [mobile stress scene](evidence/07-field-mobile.png)
- [30-second stress benchmark](evidence/field-benchmark.json), with ambient motion and three camera sweeps. Reports renderer, buffer, frame intervals, and limitations.

Initial prototype validation on 2026-09-06: `npm run build` and the original three Playwright tests passed. The linked prototype captures and field benchmark have since been refreshed with the LOD implementation. The final rendering benchmark recorded 1,801 frame intervals over 30.01 seconds: median 16.7 ms, p95 16.7 ms, maximum 16.8 ms, zero intervals above 25 ms. Chrome reported the Apple M1 Pro Metal renderer. These are headless browser scheduling measurements for the feather-only prototype; confirm in a visible browser and repeat after adding each major rendering system.

Screenshots establish the current visual state, not equivalence to the [original reference](reference/peacock.png). Production build and browser tests are described in the root README.

### Thin-detail and controllable-fan evidence

The fan retains constant per-feather length throughout folding. Each metadata record has a stable ID, layer, slot, mirrored side, angle, scale and phase delay. A critically damped scalar retains velocity on retargeting; each feather maps it through separately phased lift and spread curves. A small bounded velocity-driven lag supplies secondary motion and is suppressed with reduced motion. Time steps are capped at 50 ms after stalls. The closed train extends behind the body along negative Z; the open fan leans slightly rearward, with layer-specific depth.

Visual review covered all twelve phase/view captures below. Narrow fan vanes separate the eyes while preserving the original wide study feather. Presets now include margin for the tallest tips and oblique projection. Roots enter the placeholder rump; no conspicuous floor or body penetration was found in the sampled transition. An automated sweep checks every high-detail vertex of all 240 feathers at 41 opening values, plus finite matrices, mirrored metadata and 2,000 rapid retargeting/stall steps. This is sampled clearance, not continuous collision detection.

| fanAmount | Front | Oblique | Side |
| --- | --- | --- | --- |
| 0 | [Closed](evidence/fan-0-front.png) | [Closed](evidence/fan-0-oblique.png) | [Narrow train](evidence/fan-0-side.png) |
| 0.3 | [Lifting](evidence/fan-0.3-front.png) | [Lifting](evidence/fan-0.3-oblique.png) | [Lifting](evidence/fan-0.3-side.png) |
| 0.6 | [Spreading](evidence/fan-0.6-front.png) | [Spreading](evidence/fan-0.6-oblique.png) | [Spreading](evidence/fan-0.6-side.png) |
| 1 | [Open fan](evidence/fan-1-front.png) | [Layered fan](evidence/fan-1-oblique.png) | [Rearward lean](evidence/fan-1-side.png) |

- [Mobile fan and controls](evidence/fan-mobile.png), 390×844 CSS, DPR 1.5, reduced motion.
- Thin-detail orbit samples: [0](evidence/lod-motion-0.png), [1](evidence/lod-motion-1.png), [2](evidence/lod-motion-2.png), [3](evidence/lod-motion-3.png), [4](evidence/lod-motion-4.png), [5](evidence/lod-motion-5.png). Review found stable overall branch/eye structure across small camera steps; unresolved tips fade rather than carrying bright isolated highlights. Some fine grain remains acceptable for this prototype.
- [High-detail close view](evidence/lod-close-high.png), [low-detail distant view](evidence/lod-distant-low.png), and [LOD conditions](evidence/lod-review.json). Close and distant tiers preserve shaft, vane and fork placement; changing tiers reduces curve subdivisions rather than removing whole branches.
- [Full-fan orbit benchmark](evidence/fan-orbit-benchmark.json) and [orbit scenario](evidence/fan-orbit-scenario.json).
- [Repeated opening/reversal benchmark](evidence/fan-reversal-benchmark.json) and [reversal scenario](evidence/fan-reversal-scenario.json). Fan input intentionally remains enabled during recording; study/light/ambient controls are locked.

Measurements use Chrome 152 headless, ANGLE Metal on Apple M1 Pro, 1440×900 CSS, DPR 1.5, 2160×1350 buffer. Each scenario warms up before a separate 30-second sample, with one browser worker and no competing benchmark. Fan geometry is 1,547,282 triangles including the placeholder/floor, seven draw calls (one for all feathers). The study is 1,543,680 triangles and one draw call. Reports describe initial rendering conditions; both fan scenarios remain in the low tier. These are browser frame intervals, not GPU timings or manual headed-browser confirmation. Walking/shake/ripple measurement remains deferred with those features.

Final validation on 2026-09-06: production build passes (existing bundle-size warning remains, 565.74 kB minified / 143.19 kB gzip). All eight distinct Playwright checks pass across the full run and final focused rerun: the three preserved study checks passed, then all five fan/LOD checks passed after the final rearward-lean adjustment and correction of the test zoom distance. One earlier benchmark was invalidated by a development reload and was rerun cleanly. No browser/shader errors were reported by the interaction checks.

| Scenario | Samples / duration | Median / p95 | Max | Intervals >25 ms |
| --- | --- | --- | --- | --- |
| Study orbit | 1,801 / 30.010 s | 16.7 / 16.7 ms | 16.8 ms | 0 |
| Full-fan orbit | 1,801 / 30.011 s | 16.7 / 16.7 ms | 16.8 ms | 0 |
| Fan reversal | 1,801 / 30.011 s | 16.7 / 16.7 ms | 16.8 ms | 0 |

### Milestone 3 — hero composition review

Implemented 2026-09-06. All bird surfaces are procedural geometry/shaders. The reference PNG is used only for visual art direction and is not imported into the application. `src/Hero.ts` supplies a tapered curved neck, breast/rump, head, paired eye patches and eyes, beak, nine crest stems with blue tips, layered wings, jointed legs and four toes per foot. Shared instanced scales wrap the body/neck; 168 depth-layered coverts rotate with the reversible fan amount. Static anatomy is merged by material to keep draw calls bounded.

Visual iterations corrected an overly dark scale material, patchy scale placement, a flat upright covert collar, and exposed attachment roots. The coverts now fold rearward with the train. Feather eyes occupy a smaller area inside dark vanes, with warped borders, filtered barb striations, gold outlines and mirrored length variation. Existing screen-space branch coverage, alpha-to-coverage and high/low tessellation remain intact. Warm key, cool rim and low fill distinguish the blue body from the train. A radial ground pool and analytic contact shadow fade into the background without a floor horizon, bloom or a second fan rendering pass.

| Gate | Review result |
| --- | --- |
| Front hierarchy | Pass for stylised art direction: symmetric monumental fan, blue central bird/crest, green-gold shoulders, smaller jewel eyes in darker feather surfaces. Still more regular and less intricate than the reference. |
| Oblique / side | Pass for geometric coherence: curved neck, protruding beak/eyes, solid wings, layered coverts, legs/toes and depth in the train. No photographic planes or camera-facing bird assets. |
| Framing | Pass at 1440×900, 390×844 and 320×844 CSS: whole bird and fan fit the reset frame. Narrow framing prioritises the whole silhouette, so fine anatomy is small. Deliberate user zoom can crop the fan. Far plane follows fitted distance. |
| Lighting / grounding | Pass using the shadow option: soft contact shadow and muted pool ground the toes without washing out feather detail. No physical mirror reflection, dynamic cast shadow or environment texture. |
| Camera | Pass: drag orbit, wheel zoom, presets/reset and empty-background double click. Reset test found and fixed residual damping drift by clearing it before applying the preset. Below-floor orbit is restricted in FAN. Real emulated touch events verify one-finger orbit and two-finger pinch; visible RESET works on touch. |
| Folding / regression | Pass: front/oblique/side at 0, 0.3, 0.6 and 1 reviewed, including folded/partial covert attachment and floor clearance. No conspicuous body/floor penetration in those views. Root overlap inside rump is intentional. Existing sampled all-vertex train clearance at 41 phases, deterministic mirrored layout and 2,000 reversal/stall steps pass. This is not continuous collision detection or a new body collision solver. |

| Opening | Front | Oblique | Side |
| --- | --- | --- | --- |
| 0 | [Closed](evidence/hero-0-front.png) | [Closed](evidence/hero-0-oblique.png) | [Closed train](evidence/hero-0-side.png) |
| 0.3 | [Lifting](evidence/hero-0.3-front.png) | [Lifting](evidence/hero-0.3-oblique.png) | [Covert clearance](evidence/hero-0.3-side.png) |
| 0.6 | [Spreading](evidence/hero-0.6-front.png) | [Spreading](evidence/hero-0.6-oblique.png) | [Partial train](evidence/hero-0.6-side.png) |
| 1 | [Hero](evidence/hero-1-front.png) | [Sculpture](evidence/hero-1-oblique.png) | [Depth](evidence/hero-1-side.png) |

Additional evidence: [390px reduced-motion frame](evidence/hero-mobile.png), [320px frame](evidence/hero-narrow.png), [touch orbit/pinch/reset frame](evidence/hero-touch.png), [wheel-zoom frame](evidence/hero-zoom.png). The zoom capture intentionally shows how manual zoom can approach the frame edges. M2 `fan-*` captures/benchmarks remain preserved. Study and LOD regression captures were refreshed by their existing tests.

Final checks: `npm run build` passes; the existing bundle warning remains at 588.17 kB minified / 149.69 kB gzip. Full Playwright run: 9/9 passed, followed by 3/3 focused checks after a mobile-only hint-wrapping adjustment, including the new touch check (10 distinct checks total). Slider scrubbing, F reversal/focus protection, keyboard slider input, reduced motion, all three study modes, camera presets and LOD hysteresis pass. Browser/shader error collection in the visual integration check reports none.

The source was frozen throughout all three benchmark captures, with one Chrome worker and separate warm-ups. The subsequent CSS adjustment applies only below 600px and does not change the measured desktop rendering. Apple M1 Pro / ANGLE Metal, Chrome 152 headless, 1440×900 CSS, DPR 1.5, 2160×1350 buffer. Hero: 2,064,642 triangles, eight draw calls, seven geometries, distant feather tier. Anatomy/coverts add 520,962 triangles over the feather mesh. The near feather tier remains available; close hero performance is not covered by these orbit/reversal runs.

| Scenario | Samples / duration | Median / p95 | Max | Intervals >25 ms |
| --- | --- | --- | --- | --- |
| [Hero orbit](evidence/hero-m3-orbit-benchmark.json) | 1,801 / 30.010 s | 16.7 / 16.8 ms | 16.8 ms | 0 |
| [Hero reversal](evidence/hero-m3-reversal-benchmark.json) | 1,801 / 30.011 s | 16.7 / 16.7 ms | 16.8 ms | 0 |
| [Preserved study orbit](evidence/field-benchmark.json) | 1,801 / 30.010 s | 16.7 / 16.7 ms | 16.8 ms | 0 |

Scenario procedures: [orbit](evidence/hero-m3-orbit-scenario.json), [reversal](evidence/hero-m3-reversal-scenario.json). These are browser frame intervals, not GPU timing or proof of interactive headed performance. Manual headed inspection, physical touch hardware and lower-device testing remain outstanding. Double-click background detection uses conservative CPU feather geometry; shader-width-aware tactile picking remains milestone 4. Walking/shake/ripple combined benchmarking remains deferred with those systems.

Milestone 3 stops here. No life/tactile channels, walking, intro or cinema were introduced. Future art polish can enrich the rounded covert surfaces and break up repeated eye rows further; the current acceptance does not claim the reference’s fine filigree density.

### Milestone 4 — tactile interaction and life review

Implemented and reviewed 2026-09-06. Read the plan first and inspected the original reference plus the latest front, partial-oblique and side hero captures. Picking was introduced and browser-checked at 0.3, 0.6 and 1 before adding the life channels. The initial visible-eye-count assumption was corrected: the tightly stacked train at 0.3 exposes only two sampled eye centers from either tested view; hidden centers correctly resolve to the surface in front.

`src/feather/picking.ts` uses one shared distance-tier solid vane/shaft geometry with the shader width baked in. Sphere/box rejection precedes triangle tests. It copies the actual rendered instance matrices, so fold trajectories, lag, hover, shake and ripple offsets all participate in picking. Hover repicks at most every 50 ms, including when the pointer is stationary and the fan/camera moves; clicks pick immediately. The nearest procedural body surface takes precedence over an occluded feather. Background double-click reset uses the same picker. The proxy is CPU-only and adds no rendering pass.

`src/Life.ts` composes independent channels after the base fan trajectory. Hover applies critically damped local pressure to spatial neighbours. Up to four concurrent ripple fronts propagate from clicked eye positions through the current 3D eye positions, with turquoise/emerald highlights and bounded angular displacement. Shake uses spatial phase offsets and a smoothly retargeted amplitude; repeated presses retain its continuous phase. Combined feather offsets are smoothly bounded to ±0.045 radians and fade near the folded endpoint. All shafts remain attached at their base.

Head and neck geometry now have separate small pivots; neck scales follow the neck, and eyes can blink without moving the rest of the sculpture. Pointer tracking and a body-click nod compose with fan effects. DISPLAY opens the fan, lifts the neck and triggers a shake; BOW inclines the neck then recovers; REST closes the train and relaxes the neck. Manual slider/F/button input cancels display/rest fan ownership. Breathing, blinking and correlated settling are subtle ambient channels. Reduced motion suppresses hover/shake/ripple displacement, tracking, acknowledgment nods and ambient life; eye-click highlights remain at reduced strength and the explicit bow is very small. Existing reduced-motion fan damping and camera behavior remain available.

| Acceptance gate | Result and evidence |
| --- | --- |
| Deformation-aware picking | Pass: real clicks on visible eye centers at 0.3, 0.6 and 1 in front/oblique views. [Browser hit records](evidence/life-picking.json). Independently compared proxy ray hits to the full high-detail geometry at 0°, 37° and 69° local ray angles, three opening amounts, neutral/moving offsets and center/interior/outside-width samples: 54 checks, matching hit/miss results, maximum hit-distance difference 0.00225 world units. [Geometry comparison](evidence/life-picking-oracle.json). |
| Hover and outward ripple | Pass: local pressure builds smoothly and settles below 0.001 after exit; real eye clicks create visible spreading highlights without notification UI. [Hover](evidence/life-hover.png), [early wave](evidence/life-ripple-early.png), [outward wave](evidence/life-ripple-outward.png). |
| Phased shake | Pass: independent spatial phase offsets, moving highlights and continuous phase on retrigger; no whole-fan rotation channel. Sampled sequence: [0](evidence/life-shake-0.png), [1](evidence/life-shake-1.png), [2](evidence/life-shake-2.png), [3](evidence/life-shake-3.png). |
| Composition and gestures | Pass: folding, shake and ripple coexist; body acknowledgment and tracking stay active. Manual input cancels display/rest targets. [Combined partial oblique](evidence/life-combined-oblique.png), [display](evidence/life-display-oblique.png), [bow side](evidence/life-bow-side.png), [rest side](evidence/life-rest-side.png), [state/settling checks](evidence/life-composition.json). Bow review found no exposed neck joint or displaced feet. |
| Input ownership | Pass: 6px maximum drag displacement suppresses clicks, including out-and-back drags; long presses, pointer cancellation, multitouch and releases over UI do not trigger feather actions. Canvas listeners isolate UI actions. Blur/visibility loss clears pointer state. Existing real touch orbit/pinch/reset, slider keyboard input and F focus protection pass. |
| Direct fan drag | Deliberately deferred. Orbit retains drag ownership; slider/F/button remain reliable fan controls. No ambiguous direct-drag mode was introduced. |
| Reduced motion / regression | Pass: zero tactile feather displacement under reduced motion, restrained eye highlights, all three study views, reversible controls and LOD retained. [390px reduced-motion frame](evidence/life-mobile-reduced.png). Existing 320px, mobile, fold-phase and study/LOD captures were refreshed by their regression tests. |

Picking visual captures: [0.3 front](evidence/life-picking-0.3-reset.png), [0.3 oblique](evidence/life-picking-0.3-oblique.png), [0.6 front](evidence/life-picking-0.6-reset.png), [0.6 oblique](evidence/life-picking-0.6-oblique.png), [1 front](evidence/life-picking-1-reset.png), [1 oblique](evidence/life-picking-1-oblique.png). Dense partial overlap is intentional; the picker does not select hidden feathers through visible ones.

The additional clearance check samples every distance-tier vertex at 41 fan amounts and both extreme interaction offsets, including fold lag and shader width: minimum floor height 0.9132 world units. A 1,200-step overlapping-effect/retrigger/stall run remains finite and bounded, and effects recover after input stops. [Clearance conditions](evidence/life-clearance.json). The original high-detail folding clearance and 2,000 reversal/stall checks still pass. These are sampled floor tests, not a body/feather collision solver.

Final validation: `npm run build` passes (existing bundle warning: 596.87 kB minified / 152.28 kB gzip). Full Playwright run 16/16 passed, followed by the added gesture visual sequence 1/1: **17 distinct checks passed**. Browser/shader error collection reports none. No application source was edited during any capture run. All four 30-second benchmarks ran sequentially in one Chrome worker after separate warm-ups. The final gesture-only capture also used unchanged application source. [Tested source fingerprint](evidence/life-validation.json).

Apple M1 Pro / ANGLE Metal, Chrome 152 headless, 1440×900 CSS, DPR 1.5, 2160×1350 buffer. Hero geometry remains 2,064,642 triangles; anatomical articulation increases draw calls from 8 to 18 and resident rendered geometries from 7 to 12. Fan benchmarks remain in the distant feather tier. The study remains 1,543,680 triangles and one draw call.

| Moving scenario | Samples / duration | Median / p95 | Max | Intervals >25 ms |
| --- | --- | --- | --- | --- |
| [Life-enabled hero orbit](evidence/hero-orbit-benchmark.json) | 1,801 / 30.012 s | 16.7 / 16.8 ms | 16.8 ms | 0 |
| [Life-enabled fan reversal](evidence/hero-reversal-benchmark.json) | 1,801 / 30.009 s | 16.7 / 16.7 ms | 16.8 ms | 0 |
| [Combined folding/shake/ripple/head](evidence/life-combined-benchmark.json) | 1,801 / 30.010 s | 16.7 / 16.7 ms | 16.8 ms | 0 |
| [Preserved study orbit](evidence/field-benchmark.json) | 1,801 / 30.011 s | 16.7 / 16.7 ms | 16.8 ms | 0 |

Procedures: [orbit](evidence/hero-orbit-scenario.json), [reversal](evidence/hero-reversal-scenario.json), [combined](evidence/life-combined-scenario.json). Combined capture alternates 0.6/1 opening, retriggers shake, clicks a currently projected eye, brushes the fan and clicks the breast: 31 cycles, 31 successful feather clicks and 31 acknowledgments. Diagnostic bulk ray sweeps are excluded from benchmark timing. Historical M3 hero benchmark/scenario JSON files are archived under `hero-m3-*`; shared `hero-*` screenshots now show the preserved sculpture with M4 articulation and controls.

Limitations: picking intentionally targets solid vanes and shafts, not translucent hairline barbs or individual shader-discard gaps along vane edges. Distance-tier proxy geometry also serves high LOD; the recorded comparison covers sampled rays, not pixel-perfect GPU picking at every silhouette. At tight folds or edge-on views, overlap makes individual hidden eyes inaccessible. Head/neck motion uses small rigid pivots, and bow is a neck-led gesture with planted torso/feet, not a skinned full-body performance. Rest is a closed, slightly relaxed posture, not sitting or sleeping. No feather collision solving, particles, direct fan drag, walking, intro or cinema was added. Measurements are headless browser frame intervals, not GPU timings; manual headed review, physical touch, lower-device tests and close/high-tier moving performance remain outstanding.

**Milestone 4 stops here.** Subsequent user review prioritizes the milestone 4.5 body-realism/post-capture pass before milestone 5. No locomotion or cinema framework has been started.

### Milestone 4.5 — body realism and post capture

Implemented 2026-09-06. Read this plan first, inspected the original reference and latest M3/M4 hero/life screenshots, then downloaded and inspected the attributed [real peacock head photograph](reference/peacock-head-photo.jpg). [Anatomical sources and licensing](reference/anatomy-sources.md). No reference raster is used by application source.

Changes are confined to `src/Hero.ts` and the shoulder-covert transform in `src/FeatherStudy.ts`. The main fan geometry, materials, population, trajectories, LOD and life/picking algorithms are preserved. The head is smaller and lower, with small blinking lateral eyes, separate flat pale facial markings, a pointed horn bill with nostrils and a fine mouth seam, and thirteen slender crest shafts with small pointed/barbed tips. Shared curved, tapered vanes replace spherical contour scales and shoulder paddles; fine filtered directional grooves provide feather detail. Dense crown, neck and breast plumage, wrapped wing coverts/flight feathers, higher roughness and lower metalness reduce the plastic appearance while retaining blue/green/gold.

Browser iteration found and corrected raised facial markings, buried wing feathers, a breast/neck seam, and floating shoulder coverts during partial folding. Breast and neck now share one continuous procedural anatomical profile with overlapping articulation sections. The coverts pivot around their back attachment and narrow laterally while folding; they remain reversible. All body materials remain MeshStandardMaterial, preserving body occlusion and acknowledgment picking.

| Close comparison | Before | Final |
| --- | --- | --- |
| Front | [Before](evidence/body-before-front.png) | [Final](evidence/body-final-front.png) |
| Three-quarter | [Before](evidence/body-before-oblique.png) | [Final](evidence/body-final-oblique.png) |
| Side | [Before](evidence/body-before-side.png) | [Final](evidence/body-final-side.png) |

Fold review: [closed oblique](evidence/body-fold-0-oblique.png), [closed side](evidence/body-fold-0-side.png), [0.3 oblique](evidence/body-fold-0.3-oblique.png), [0.3 side](evidence/body-fold-0.3-side.png), [0.6 oblique](evidence/body-fold-0.6-oblique.png), [0.6 side](evidence/body-fold-0.6-side.png), [open oblique](evidence/body-fold-1-oblique.png), [open side](evidence/body-fold-1-side.png). Gesture review: [bow](evidence/body-bow.png), [display](evidence/body-display.png), [rest](evidence/body-rest.png). Final sampled views show continuous chest/neck transitions and covered shoulder attachments. Feather layering intentionally overlaps; this is not collision simulation.

Deliverables: **[10-second X video](evidence/peacock-x.mp4)** and **[poster at 9.5 seconds](evidence/peacock-x-poster.png)**; [VP9 source recording](evidence/peacock-x-source.webm). The opening presents a closer three-quarter body view at 36% fan opening. After a half-second hold, a five-second eased unfold and gentle camera pullback lead to one shake at six seconds, followed by a settled hero. Controls/hints are absent and the entire silhouette has framing margin. No audio, text overlays or external publishing.

`scripts/post-capture.mjs` uses Playwright with a temporary browser-only page instantiating the same FeatherStudy class, canvas.captureStream(30)/MediaRecorder, then ffmpeg. No capture or cinema subsystem was added to the application. The source remained frozen during every capture; final export includes before/after SHA-256 fingerprints in [capture conditions](evidence/post-capture.json). Final encoding: H.264, yuv420p, faststart MP4, 1440×900, 30fps, exactly 10 seconds. [Actual MP4 playback verification](evidence/post-export-inspection.json): 300 decoded/presented frames, zero dropped frames, no media error, playback reached the end. Visually inspected frames from the actual export: [opening](evidence/post-export-0.2.png), [unfolding](evidence/post-export-3.5.png), [shake](evidence/post-export-6.5.png), [settled ending](evidence/post-export-9.5.png), and the extracted poster. Browser playback is verified locally; X's own recompression has not been tested and nothing was uploaded.

Validation status: production build passes (existing bundle warning: 600.42 kB minified / 153.64 kB gzip). An initial run passed 15 checks and all four benchmarks, then the pre-existing Vite server stopped, causing connection-refused failures for the last two tests. The server was restarted. After final breast and covert attachment corrections, a fresh full suite and close benchmark are running through `node scripts/final-validation.mjs`. Do not mistake earlier benchmark timestamps for final geometry validation. Final source fingerprint and results will be saved to `docs/evidence/body-validation.json` after success.

Limitations: this is a more anatomically grounded stylised sculpture, not photorealism. Contour feathers and shoulder rows remain regular; wings remain comparatively dark, pale face shapes simplified, and crest feathers become very thin edge-on. Existing small rigid head/neck pivots remain; no skinning or collision solver. Hairline fan barbs can shimmer or soften in video compression. Real-time capture has a repeatable timeline but is not deterministic frame stepping. Headless ANGLE Metal measurements are frame intervals, not GPU timing or manual headed-device confirmation. Physical touch, lower-powered devices and X recompression remain unverified. Walking, particles, intro and cinema remain later work.

**Milestone 4.5 scope stops here.** Once final validation is recorded, the next implementation task is milestone 5, elegant movement. Do not start it in this session.

## Continuation instructions

Read this file first and consult only relevant sections of the brief. At the end of each implementation session, update checkboxes, decisions, known issues, validation evidence, and the next action. Store useful visual captures with descriptive phase/view names and link them from the progress log. Keep this file as the single work tracker.

**Next concrete task:** Finish recording the running milestone 4.5 validation (`node scripts/final-validation.mjs`), inspect the final close benchmark/gesture captures, then mark 4.5 complete. The video and poster are already saved and actual MP4 playback inspected. After that, stop; milestone 5 (walking) is the next separately authorized implementation task. Start a fresh chat by reading this tracker. Do not publish externally.
