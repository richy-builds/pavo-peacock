Build a visually extraordinary interactive Three.js experience based on the attached peacock reference image.

This should NOT be a static 3D model viewer.

Create a living, controllable digital sculpture where the user can directly manipulate the peacock, control its tail fan, trigger behaviours, move around the environment, interact with feathers, lighting and particles, and discover subtle responses throughout the world.

The experience should feel somewhere between:

* an interactive digital artwork
* a luxury museum installation
* a living 3D sculpture
* a tiny exploratory game

The attached image is the primary art-direction reference.

Preserve its:

* monumental symmetrical composition
* jewel-like peacock colours
* incredibly ornate feathers
* eye-spot patterns
* dark cinematic environment
* metallic gold detailing
* iridescent blue / turquoise / emerald body
* sense of overwhelming visual intricacy

The guiding idea is:

**The peacock itself is the architecture, ornament and spectacle.**

---

# 1. BUILD A TRUE INTERACTIVE PEACOCK

Do not place the reference image on planes.

Create the peacock procedurally from actual 3D elements.

The tail should consist of many reusable feather objects arranged into layered radial rows.

Create a Peacock system with independently controllable components:

* body
* neck
* head
* crest
* wings
* tail base
* individual tail-feather groups
* legs
* feet

The model can be stylised rather than anatomically exact.

Visual quality and expressive motion matter more than biological simulation.

---

# 2. THE MOST IMPORTANT FEATURE: USER-CONTROLLED FANNING

Build the tail so the user can smoothly control how open it is.

Create a central parameter:

`fanAmount`

Range:

`0.0` = tail closed behind the peacock

`1.0` = enormous fully opened fan matching the reference image

Values between these states should smoothly interpolate every feather's:

* rotation
* position
* spread
* elevation
* curvature
* overlap

This must NOT simply scale the entire tail.

Each feather should physically travel along a believable opening trajectory.

At fanAmount 0:

The feathers form a relatively narrow folded train behind the bird.

At fanAmount 0.3:

The tail begins separating into visible radial groups.

At fanAmount 0.6:

A broad semicircular structure emerges.

At fanAmount 1:

The full magnificent ornate fan is revealed.

Use easing and slight temporal offsets so the opening resembles a physical cascade rather than all feathers moving identically.

Outer feathers can lag slightly behind inner ones.

The opening motion should feel majestic.

---

# 3. DIRECT USER CONTROL

Give the user several ways to interact.

## Mouse / trackpad

Drag empty space:
rotate camera around the peacock.

Scroll:
zoom.

Move pointer across tail:
nearby feathers should subtly respond.

Click an individual feather:
trigger a tiny local ripple through surrounding feathers.

Click the peacock:
make it acknowledge the viewer by turning its head toward the camera.

Double-click the background:
return camera to hero view.

---

# 4. FAN CONTROL

Create an elegant minimal interaction control.

Use a small slider labelled:

TAIL

Allow the user to continuously drag between CLOSED and OPEN.

Also allow:

`F`

Toggle between fully open and closed.

Animate rather than instantly switching.

If the user repeatedly taps F while the tail is moving, handle state transitions gracefully.

---

# 5. DRAG THE PEACOCK'S FAN

Experiment with allowing the user to directly grab the outer area of the fan and drag sideways/upward to control its opening.

If this interaction can be made intuitive:

drag outward → fan opens

drag inward → fan closes

Provide smooth inertia.

This should feel almost like manipulating a physical mechanism.

Keep the slider as an accessible fallback.

---

# 6. PEACOCK BEHAVIOURS

Give the peacock a small behavioural system.

Create states such as:

IDLE

CURIOUS

DISPLAY

SHAKE

BOW

WALK

REST

The user should be able to trigger some directly.

### DISPLAY

Fully fan the tail.

Raise posture.

Lift head slightly.

Subtle feather vibration.

Increase iridescent intensity.

### SHAKE

Create the characteristic shimmering vibration of many tail feathers.

Do NOT simply rotate the whole fan.

Each feather should oscillate slightly with phase offsets.

The result should create thousands of tiny specular flashes moving across the fan.

Keep it sophisticated rather than cartoonish.

### CURIOUS

Peacock tilts and turns its head toward the pointer/camera.

### BOW

A small graceful forward movement followed by recovery.

### WALK

Allow several slow elegant steps.

Tail behaviour should adapt depending on how open it currently is.

---

# 7. USER-CONTROLLED MOVEMENT

Allow the user to move the peacock around a limited area.

Keyboard:

W / ↑ = forward

S / ↓ = backward

A / ← = turn left

D / → = turn right

Movement should be slow and elegant.

Do not make it control like a videogame character sprinting around.

Animate:

* body bob
* leg steps
* head counter-motion
* feather inertia
* tail lag

Movement should subtly affect the entire feather system.

When the peacock turns, the enormous tail should have noticeable inertia.

---

# 8. OPTIONAL FOLLOW MODE

Add a small control:

FOLLOW

When enabled, the camera gently tracks behind or beside the peacock while the user moves it.

When disabled, return to normal OrbitControls exploration.

Transition smoothly between camera modes.

---

# 9. FEATHER PHYSICS

The feathers should feel connected but not rigid.

Implement lightweight procedural secondary motion.

Each feather can respond to:

* body movement
* tail opening
* turning
* user pointer proximity
* shake behaviour
* ambient airflow

Do not run expensive full cloth physics on hundreds of feathers.

Instead create an efficient spring / damped oscillation system.

Use variables such as:

velocity
targetRotation
springStrength
damping

Nearby feathers should have correlated motion rather than completely independent noise.

The result should feel organic.

---

# 10. POINTER INTERACTION WITH FEATHERS

The fan should react to the user's cursor.

Use raycasting or an efficient proximity approximation.

As the pointer moves across feathers:

* nearby feathers move backwards slightly
* highlights intensify
* eye-spots subtly orient toward the viewer
* tiny particles may lift away
* surrounding feathers gently ripple

The effect should be subtle.

It should feel like disturbing an impossibly delicate living surface.

On pointer exit, feathers smoothly settle back.

---

# 11. CLICKABLE PEACOCK EYES

The eye-spots in the tail can become hidden interactive elements.

Clicking one should send a wave through the fan.

For example:

the selected eye flashes briefly

then a circular ripple propagates outward through neighbouring feathers

the iridescence moves with the wave

finally the fan settles back into equilibrium

No UI notification is required.

The interaction itself should communicate what happened.

---

# 12. IRIDESCENT MATERIAL

Create a custom shader for the peacock feathers.

Colour should change based on:

* view direction
* surface normal
* Fresnel
* light direction
* subtle procedural variation

Colour family:

deep sapphire
electric cobalt
turquoise
teal
emerald
malachite
subtle violet
antique gold

Avoid rainbow chrome.

The shader should evoke real structural peacock iridescence.

Camera movement should cause huge sections of the bird to gently shift colour.

This should be one of the strongest visual effects in the experience.

---

# 13. FEATHER EYE MATERIAL

Build the eye-spots procedurally.

Each eye should have concentric teardrop / elliptical regions inspired by the reference.

Use:

gold outer detail

emerald ring

turquoise

deep blue

violet / near-black centre

Allow tiny variations.

Add subtle depth to the pattern rather than making it completely flat.

At close range, additional ornamental details should appear:

* fine filigree
* etched lines
* tiny jewel-like dots
* delicate branching feather structures

---

# 14. FEATHER LAYERS

The full tail should contain many layers.

Do not distribute feathers on one flat semicircle.

Create approximately:

rear structural layer

large outer feather layer

mid-length eye-feather layer

dense inner fan

small decorative centre feathers

Transition the geometry gradually through depth.

From the front:

near-perfect glorious symmetry.

From 30–45 degrees:

hundreds of individual overlapping layers become visible.

From the side:

the peacock should look like a massive organic architectural sculpture.

---

# 15. INTERACTIVE ENVIRONMENT

Place the bird in a minimal dark environment.

Think:

infinite black museum
+
subtle reflective floor
+
atmospheric particles
+
cinematic lighting

Do not create a traditional room.

The darkness should make the animal feel almost supernatural.

---

# 16. USER-CONTROLLED LIGHT

Allow the user to subtly influence the lighting.

Pointer movement across empty background can shift the key light slightly.

As the light moves:

different feather layers should ignite with iridescent colour.

This should encourage the user to deliberately search for beautiful reflections.

Optionally allow:

hold `L`

then drag

to manually rotate the main light around the peacock.

When released, keep its position.

---

# 17. PARTICLE INTERACTION

Add a restrained field of microscopic floating particles.

They should resemble:

dust
tiny feather fragments
golden specks
iridescent motes

Particles should respond to:

* peacock movement
* tail shaking
* fan opening
* pointer interaction

When the peacock performs a large tail shake, a small burst of particles should leave the feathers and slowly drift through space.

Keep density low.

---

# 18. FLOOR INTERACTION

Use a glossy near-black reflective ground plane.

The bird should cast:

soft shadow
subtle reflection
coloured reflected highlights

As the peacock moves, faint concentric light disturbances could appear beneath its feet.

Very restrained.

No obvious videogame glowing circles.

---

# 19. CINEMATIC INTRO

On first load:

Start in darkness.

Show only tiny fragments of blue and gold catching light.

Camera is relatively close to the peacock's face.

The peacock looks toward camera.

Then slowly begin opening the tail.

As feathers spread, pull the camera backwards.

The enormous fan gradually fills the screen.

Lighting slowly reveals more detail.

Finish in the perfectly centred composition inspired by the reference image.

The entire intro should take approximately 5–7 seconds.

Afterwards:

give the user complete control.

If the user interacts during the intro, immediately transition gracefully into manual control.

Respect prefers-reduced-motion.

---

# 20. IDLE LIFE

If the user does nothing, the artwork should continue living.

Add subtle:

head movement

blinking

breathing

neck motion

feather settling

ambient feather movement

light variation

particle drift

Occasionally the peacock might slightly turn its head or reposition itself.

Do not automatically perform large behaviours too frequently.

Stillness is part of the luxury feeling.

---

# 21. MINIMAL UI

Keep visible interface extremely restrained.

The artwork should occupy virtually the entire screen.

Small controls along the bottom could be:

TAIL
SHAKE
MOVE
FOLLOW

TAIL should be a slider.

Others can be small buttons.

Hide or fade controls when inactive.

Show a very small first-time hint:

Drag to explore · Scroll to zoom · F to fan

Fade it away after interaction.

No:

navigation
cards
dashboard
hero text
marketing content
large menus

This is an interactive artwork.

---

# 22. OPTIONAL CINEMATIC MODE

Add a small unobtrusive control:

CINEMA

When activated:

hide UI

disable manual movement temporarily

slowly orbit the peacock

move lighting

occasionally trigger subtle feather motion

frame beautiful compositions automatically

This should make the experience suitable for leaving running as digital art.

Click or press Escape to exit.

---

# 23. TECHNICAL ARCHITECTURE

Use modern Three.js.

Organise the project cleanly.

Suggested architecture:

`Experience`

* renderer
* scene
* time
* resize
* input

`Peacock`

* body
* head
* legs
* wings
* tail
* behavioural state

`Tail`

* feather generation
* fan interpolation
* spring movement
* ripple effects

`Feather`

* reusable geometry
* shader state
* eye pattern

`PeacockController`

* user movement
* behaviour transitions
* fan control

`InteractionManager`

* raycasting
* hover
* clicks
* pointer forces

`CameraController`

* orbit mode
* follow mode
* cinematic mode

`Environment`

* lighting
* floor
* particles

`Audio`

* optional later, keep architecture ready but do not require audio for V1

Use TypeScript if practical.

---

# 24. PERFORMANCE

This must remain smooth.

Do NOT create hundreds of complex individual high-poly objects with unique materials.

Use:

InstancedMesh

shared BufferGeometry

shared shader materials

GPU instancing

LOD

texture atlases where useful

limited dynamic shadows

reasonable DPR

frustum culling

efficient raycasting

GPU-friendly procedural detail

Aim for approximately 60fps on a modern Apple Silicon laptop.

Gracefully reduce quality on lower-powered devices.

Create a simple adaptive quality system if useful.

Prioritise the visual prominence of feathers near the viewer.

---

# 25. IMPORTANT IMPLEMENTATION DETAIL

Do not make feather placement random.

Build mathematically coherent radial layers.

Each feather should have metadata such as:

```ts
{
  ring,
  radialIndex,
  normalizedAngle,
  normalizedRadius,
  closedTransform,
  openTransform,
  phase,
  variation,
  rippleValue
}
```

The current transform should be derived from:

fanAmount

*

secondary spring motion

*

user interaction

*

behaviour animation

This architecture is important because I want the peacock to feel truly controllable rather than playing predefined animations.

---

# 26. INTERACTION STATE

Expose useful live parameters centrally, for example:

```ts
state = {
  fanAmount: 1,
  fanTarget: 1,
  shakeAmount: 0,
  movementSpeed: 0,
  headTarget: new THREE.Vector3(),
  followCamera: false,
  cinematicMode: false,
  pointerInfluence: 0,
  lightAngle: 0
}
```

Keep animation behaviours composable.

Opening the tail should not prevent:

walking
head tracking
pointer interactions
iridescence
secondary feather motion

The user should be able to combine behaviours.

---

# 27. POLISH LOOP

Do not stop when it technically works.

Run the project and visually inspect it repeatedly.

Pay particular attention to:

1. Does the fully opened composition retain the majesty of the attached image?

2. Does opening the tail look physically beautiful?

3. Does the tail have obvious dimensional depth when viewed from an angle?

4. Do the feathers look like feathers rather than cards?

5. Does the iridescence react beautifully to camera movement?

6. Does interacting with the feathers feel tactile?

7. Is movement slow, elegant and believable?

8. Does the peacock remain the visual focus?

9. Does the experience feel like premium interactive art rather than a videogame demo?

10. Is performance consistently smooth?

Iterate until these are strong.

---

# FINAL EXPERIENCE

I should be able to open the page and initially see the magnificent reference composition.

Then I discover I can:

drag around it

zoom into individual feathers

move the peacock

open and close its enormous fan

control exactly how far the fan is opened

trigger a shimmering tail shake

move the light across the feathers

touch feathers with the pointer

click individual eye-spots and create ripples

watch the bird react to me

follow it with the camera

leave it running in cinematic mode

The key emotional progression should be:

**“That is a beautiful 3D peacock.”**

then

**“Wait — I can control it.”**

then

**“Wait — almost everything reacts to me.”**

Make it visually exceptional.
