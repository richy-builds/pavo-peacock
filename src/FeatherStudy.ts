import {
  ACESFilmicToneMapping, Color, InstancedBufferAttribute, DynamicDrawUsage, Group, InstancedMesh,
  Mesh, MeshStandardMaterial, HemisphereLight, DirectionalLight, Raycaster, ShaderMaterial,
  Object3D, PerspectiveCamera, Scene, Sphere, Vector2, Vector3, WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createFeatherGeometry } from './feather/geometry';
import { createFeatherMaterial } from './feather/material';
import { createFanLayout, FanMotion, poseFanFeather } from './feather/fan';
import { createHero } from './Hero';
import { Life, type LifeAction } from './Life';
import { FeatherPicker } from './feather/picking';
import { Benchmark, type RenderSnapshot } from './Benchmark';

type Mode = 'single' | 'field' | 'fan';
interface FeatherPlacement { x: number; y: number; z: number; angle: number; scale: number; phase: number }

export class FeatherStudy {
  readonly renderer: WebGLRenderer;
  readonly benchmark = new Benchmark();
  readonly camera = new PerspectiveCamera(37, 1, 0.1, 100);
  readonly controls: OrbitControls;
  private readonly scene = new Scene();
  private readonly group = new Group();
  private readonly geometry = createFeatherGeometry();
  private readonly lowGeometry = createFeatherGeometry('low');
  private quality: 'high' | 'low' = 'high';
  readonly fan = new FanMotion();
  private readonly fanLayout = createFanLayout();
  private readonly body = createHero();
  private readonly material = createFeatherMaterial();
  private readonly feathers = new InstancedMesh(this.geometry, this.material, 240);
  readonly life = new Life(240);
  private readonly lifeAttribute = new InstancedBufferAttribute(this.life.highlights, 1).setUsage(DynamicDrawUsage);
  private pointerInside = false;
  private pointerDown: { id: number; x: number; y: number; moved: boolean; time: number } | null = null;
  private activePointers = new Set<number>();
  private lastPick = 0;
  private readonly picker = new FeatherPicker();
  private readonly dummy = new Object3D();
  private readonly bufferSize = new Vector2();
  private readonly abort = new AbortController();
  private readonly reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  private placements: FeatherPlacement[] = [];
  private previousTime = 0;
  private motionTime = 0;
  private lastMetricsTime = 0;
  private gpu = 'Not reported';
  private disposed = false;
  mode: Mode = 'single';
  motion: boolean;
  onMetrics: ((snapshot: RenderSnapshot) => void) | null = null;

  constructor(private readonly container: HTMLElement) {
    this.renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.scene.background = new Color('#03090c');
    this.container.append(this.renderer.domElement);
    this.renderer.domElement.setAttribute('aria-label', 'Procedural feather sculpture');
    const gl = this.renderer.getContext();
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    if (debug) this.gpu = String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL));
    this.motion = !this.reducedMotion.matches;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.reducedMotion.matches;
    this.controls.dampingFactor = 0.07;
    this.controls.enablePan = false;
    this.controls.minDistance = 1.2;
    this.controls.maxDistance = 35;
    this.controls.rotateSpeed = 0.65;
    this.controls.minPolarAngle = 0.1;
    this.controls.maxPolarAngle = Math.PI - 0.1;
    this.geometry.setAttribute('lifeHighlight',this.lifeAttribute);
    this.lowGeometry.setAttribute('lifeHighlight',this.lifeAttribute);
    this.bindInteractions();
    this.feathers.instanceMatrix.setUsage(DynamicDrawUsage);
    // Conservative envelope includes all CPU-driven ambient rotations.
    this.feathers.boundingSphere = new Sphere(new Vector3(0, 2, 0), 12);
    this.group.add(this.feathers);
    this.scene.add(this.group);
    this.scene.add(this.body, new HemisphereLight('#9dcbd7', '#080e18', 1.6));
    const key = new DirectionalLight('#f2dfb8', 3.5);
    key.position.set(-3, 7, 5); this.scene.add(key);
    const rim = new DirectionalLight('#399baa', 2.5);
    rim.position.set(3, 5, -3); this.scene.add(rim);
    this.renderer.domElement.addEventListener('dblclick', event => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      const pointer = new Vector2((event.clientX-rect.left)/rect.width*2-1, 1-(event.clientY-rect.top)/rect.height*2);
      if (!this.pick(pointer).kind) this.resetCamera();
    }, { signal: this.abort.signal });
    this.setMode('single');
    this.resize();
    this.light(25);
    window.addEventListener('resize', () => this.resize(), { signal: this.abort.signal });
    document.addEventListener('visibilitychange', () => {
      this.previousTime = 0;
      this.clearPointer();
      if (document.hidden) this.benchmark.cancel();
    }, { signal: this.abort.signal });
    this.reducedMotion.addEventListener('change', event => {
      this.benchmark.cancel();
      this.motion = !event.matches;
      this.controls.enableDamping = !event.matches;
      const input = document.querySelector<HTMLInputElement>('#motion');
      if (input) input.checked = this.motion;
      this.updateFeathers();
    }, { signal: this.abort.signal });
    this.renderer.domElement.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      this.renderer.setAnimationLoop(null);
      this.benchmark.cancel();
      const error = document.querySelector<HTMLElement>('#error')!;
      error.textContent = 'The graphics connection was interrupted. Reload the page to resume the feather study.';
      error.hidden = false;
    }, { signal: this.abort.signal });
    this.renderer.setAnimationLoop(time => this.frame(time));
  }

  setMode(mode: Mode) {
    if (this.benchmark.recording) return;
    this.life.reset(); this.life.highlights.fill(0);this.lifeAttribute.needsUpdate=true;
    this.clearPointer();
    this.mode = mode;
    this.body.visible = mode === 'fan';
    this.controls.maxPolarAngle = mode === 'fan' ? Math.PI / 2 : Math.PI - .1;
    this.material.uniforms.uWidth.value = mode === 'fan' ? 0.48 : 1;
    this.placements = mode === 'single'
      ? [{ x: 0, y: 0, z: 0, angle: -0.13, scale: 1, phase: 0 }]
      : createStudyField();
    this.feathers.count = this.placements.length;
    this.group.position.set(mode === 'single' && innerWidth > 900 ? 1.35 : 0, 0, 0);
    this.updateFeathers();
    this.resetCamera();
  }

  resetCamera(oblique = false) {
    if (this.benchmark.recording) return;
    const damping = this.controls.enableDamping;
    this.controls.enableDamping = false;
    this.controls.update();
    const field = this.mode !== 'single';
    const target = new Vector3(field ? 0 : this.group.position.x + 0.25, this.mode === 'fan' ? 4.2 : field ? 2.6 : 2.55, 0);
    // Fit by vertical and horizontal field of view, including narrow phones.
    const height = this.mode === 'fan' ? 15.0 : field ? 12.0 : 7.4;
    const width = this.mode === 'fan' ? 23.0 : field ? 19.5 : 3.1;
    const distance = Math.max(height, width / this.camera.aspect) / (2 * Math.tan(this.camera.fov * Math.PI / 360));
    this.controls.target.copy(target);
    this.camera.position.copy(target).add(new Vector3(oblique ? distance * 0.75 : 0, oblique ? distance * 0.10 : 0, oblique ? distance * 0.72 : distance));
    this.controls.maxDistance = Math.max(35, distance * 1.5);
    this.camera.far = Math.max(100, distance * 2 + 30);
    this.camera.updateProjectionMatrix();
    // Residual orbit was cleared before assigning the preset.
    this.controls.update();
    this.controls.enableDamping = damping;
    this.controls.saveState();
  }

  sideCamera() {
    this.resetCamera();
    if (this.benchmark.recording) return;
    const distance = this.camera.position.distanceTo(this.controls.target);
    this.camera.position.copy(this.controls.target).add(new Vector3(distance, distance * 0.06, 0));
    this.controls.update();
  }

  pick(pointer: Vector2) {
    this.scene.updateMatrixWorld(true);
    this.picker.sync(this.feathers, this.material.uniforms.uWidth.value);
    const ray = new Raycaster(); ray.setFromCamera(pointer, this.camera);
    const feather = this.picker.pick(ray);
    const parts: Object3D[] = [];
    if (this.mode === 'fan') this.body.traverse(o => {
      if (o instanceof Mesh && !(o.material instanceof ShaderMaterial)) parts.push(o);
    });
    const body = ray.intersectObjects(parts, false)[0];
    if (body && (!feather || body.distance < feather.distance)) return { kind: 'body', id: -1 };
    return feather ? { kind: 'feather', id: feather.instanceId! } : { kind: null, id: -1 };
  }

  eyeScreen(id: number) {
    const v=this.picker.eye(this.feathers,id).project(this.camera);
    return {x:(v.x+1)*innerWidth/2,y:(1-v.y)*innerHeight/2};
  }

  pickingEvidence() {
    this.scene.updateMatrixWorld(true);
    return this.fanLayout.map(p => {
      const v = this.picker.eye(this.feathers, p.id).project(this.camera);
      return { id: p.id, x: (v.x+1)*innerWidth/2, y: (1-v.y)*innerHeight/2,
        hit: this.pick(new Vector2(v.x,v.y)) };
    });
  }

  setFanTarget(value: number) { this.life.manual(); this.fan.setTarget(value); }

  action(action: LifeAction) {
    if(this.mode!=='fan') return;
    this.life.action(action);
    if(action==='display'||action==='rest') this.fan.setTarget(action==='display'?1:0);
  }

  private clearPointer() {
    this.pointerInside=false;this.pointerDown=null;this.activePointers.clear();this.life.clearPointer();
    this.renderer.domElement.style.cursor='';
  }

  private bindInteractions() {
    const canvas=this.renderer.domElement, options={signal:this.abort.signal};
    const position=(event:PointerEvent)=>{
      const r=canvas.getBoundingClientRect();
      this.life.pointer.set((event.clientX-r.left)/r.width*2-1,1-(event.clientY-r.top)/r.height*2);
    };
    canvas.addEventListener('pointermove',event=>{
      position(event);
      this.pointerInside=event.pointerType!=='touch' && document.elementFromPoint(event.clientX,event.clientY)===canvas;
      const down=this.pointerDown;
      if(down && Math.hypot(event.clientX-down.x,event.clientY-down.y)>6) down.moved=true;
    },options);
    canvas.addEventListener('pointerdown',event=>{
      position(event);this.activePointers.add(event.pointerId);
      if(this.activePointers.size>1) {if(this.pointerDown)this.pointerDown.moved=true;return;}
      if(event.button!==0)return;
      this.pointerDown={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false,time:performance.now()};
      this.life.hover=-1;
    },options);
    canvas.addEventListener('pointerup',event=>{
      const down=this.pointerDown;this.activePointers.delete(event.pointerId);
      if(down?.id!==event.pointerId)return;
      this.pointerDown=null;
      if(this.mode!=='fan'||down.moved||performance.now()-down.time>650||
        Math.hypot(event.clientX-down.x,event.clientY-down.y)>6||document.elementFromPoint(event.clientX,event.clientY)!==canvas)return;
      position(event);const hit=this.pick(this.life.pointer);
      if(hit.kind==='feather')this.life.click(hit.id);
      if(hit.kind==='body')this.life.acknowledge();
      if(event.pointerType==='touch')this.pointerInside=false;
    },options);
    canvas.addEventListener('pointercancel',()=>this.clearPointer(),options);
    canvas.addEventListener('lostpointercapture',()=>{
      if(this.activePointers.size) this.clearPointer();
    },options);
    canvas.addEventListener('pointerleave',()=>{this.pointerInside=false;this.life.clearPointer();},options);
    window.addEventListener('blur',()=>this.clearPointer(),options);
  }

  detailCamera() {
    if (this.benchmark.recording) return;
    // Inspect the central feather in either study, using its actual current transform.
    const index = this.mode === 'single' ? 0 : 224;
    this.feathers.getMatrixAt(index, this.dummy.matrix);
    this.group.updateMatrixWorld(true);
    const target = new Vector3(0, 3.65, 0.35)
      .applyMatrix4(this.dummy.matrix).applyMatrix4(this.feathers.matrixWorld);
    this.controls.target.copy(target);
    this.camera.position.copy(target).add(new Vector3(0.35, 0.1, 3.4));
    const damping = this.controls.enableDamping;
    this.controls.enableDamping = false;
    this.controls.update();
    this.controls.enableDamping = damping;
  }

  light(degrees: number) {
    if (this.benchmark.recording) return;
    const angle = degrees * Math.PI / 180;
    this.material.uniforms.uLight.value.set(Math.sin(angle) * 8, 7, Math.cos(angle) * 8);
  }

  setMotion(enabled: boolean) {
    if (this.benchmark.recording) return;
    this.motion = enabled;
    this.updateFeathers();
  }

  snapshot(): RenderSnapshot {
    this.renderer.getDrawingBufferSize(this.bufferSize);
    return {
      mode: this.mode,
      quality: this.quality,
      fanAmount: this.fan.amount,
      fanTarget: this.fan.target,
      feathers: this.feathers.count,
      drawCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      geometries: this.renderer.info.memory.geometries,
      viewport: `${this.container.clientWidth} × ${this.container.clientHeight}`,
      drawingBuffer: `${this.bufferSize.x} × ${this.bufferSize.y}`,
      dpr: this.renderer.getPixelRatio(),
      motion: this.motion,
      renderer: this.gpu,
    };
  }

  private resize() {
    this.benchmark.cancel();
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.material.uniforms.uPixelHeight.value = this.container.clientHeight * this.renderer.getPixelRatio();
    this.group.position.x = this.mode === 'single' && innerWidth > 900 ? 1.35 : 0;
    this.resetCamera();
  }

  private updateFeathers() {
    if (this.mode === 'fan') {
      this.body.userData.coverts.rotation.x = -1.5 * (1 - this.fan.amount);
      this.body.userData.coverts.scale.x = .35 + .65 * this.fan.amount;
      for (const p of this.fanLayout) {
        poseFanFeather(p, this.fan.amount, this.fan.velocity, this.motion, this.dummy);
        this.dummy.rotation.x-=this.life.offsets[p.id];
        this.dummy.rotation.y+=this.life.offsets[p.id]*.45;
        this.dummy.updateMatrix();
        this.feathers.setMatrixAt(p.id, this.dummy.matrix);
        this.life.eyes[p.id].set(0,3.64,.342).applyMatrix4(this.dummy.matrix);

      }
      this.feathers.instanceMatrix.needsUpdate = true;
      return;
    }
    for (let i = 0; i < this.placements.length; i++) {
      const p = this.placements[i];
      const sway = this.motion ? Math.sin(this.motionTime * 0.65 + p.phase) * 0.012 : 0;
      this.dummy.position.set(p.x, p.y, p.z);
      this.dummy.rotation.set(sway * 0.6, sway * 1.7, p.angle + sway);
      this.dummy.scale.setScalar(p.scale);
      this.dummy.updateMatrix();
      this.feathers.setMatrixAt(i, this.dummy.matrix);
    }
    this.feathers.instanceMatrix.needsUpdate = true;
  }

  private frame(now: number) {
    if (this.disposed || document.hidden) return;
    const elapsed = this.previousTime ? now - this.previousTime : 0;
    this.previousTime = now;
    this.motionTime += Math.min(elapsed / 1000, 0.05);
    this.fan.step(elapsed / 1000, this.reducedMotion.matches);
    if(this.mode==='fan') {
      this.life.tracking=this.pointerInside&&!this.pointerDown;
      if(this.life.tracking && now-this.lastPick>50) {
        const hit=this.pick(this.life.pointer);this.life.hover=hit.kind==='feather'?hit.id:-1;
        this.renderer.domElement.style.cursor=hit.kind?'pointer':'';this.lastPick=now;
      } else if(!this.life.tracking) this.life.hover=-1;
      this.life.step(elapsed/1000,this.fanLayout,this.motion,this.reducedMotion.matches,this.fan.amount);
      this.lifeAttribute.needsUpdate=true;
      const pose=this.life.pose(this.reducedMotion.matches,this.motion);
      this.body.userData.neckPivot.rotation.x=pose.bow;
      this.body.userData.headPivot.rotation.set(pose.headPitch,pose.yaw,0);
      this.body.userData.breastScales.scale.set(1+pose.breath,1,1+pose.breath);
      for(const eye of this.body.userData.eyes) eye.scale.y=eye.userData.height*pose.blink;
    }
    if (this.motion || this.mode === 'fan') this.updateFeathers();
    this.controls.update();
    // Hysteresis prevents tier thrashing while orbiting or gently zooming.
    const distance = this.camera.position.distanceTo(this.controls.target);
    const next = distance < 8 ? 'high' : distance > 10 ? 'low' : this.quality;
    if (next !== this.quality) {
      this.quality = next;
      this.feathers.geometry = next === 'high' ? this.geometry : this.lowGeometry;
    }
    this.renderer.render(this.scene, this.camera);
    this.benchmark.frame(elapsed, now);
    if (now - this.lastMetricsTime > 300) {
      this.lastMetricsTime = now;
      this.onMetrics?.(this.snapshot());
    }
  }

  dispose() {
    this.disposed = true;
    this.benchmark.cancel();
    this.abort.abort();
    this.renderer.setAnimationLoop(null);
    this.controls.dispose();
    this.picker.dispose();
    this.feathers.dispose();
    this.geometry.dispose();
    this.lowGeometry.dispose();
    this.body.traverse(object => {
      if (object instanceof Mesh) { object.geometry.dispose(); (object.material as MeshStandardMaterial).dispose(); }
    });
    this.material.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

/** Static radial study only. This is not the future controllable tail mechanism. */
function createStudyField(): FeatherPlacement[] {
  const placements: FeatherPlacement[] = [];
  for (let ring = 0; ring < 6; ring++) {
    const count = 50 - ring * 4;
    for (let index = 0; index < count; index++) {
      const normalized = index / (count - 1) * 2 - 1;
      const angle = normalized * 1.48;
      const radius = 2.9 - ring * 0.38;
      placements.push({
        x: -Math.sin(angle) * radius,
        y: Math.cos(angle) * radius - 1.5,
        z: ring * 0.22 - 0.6,
        angle,
        scale: 1.03 - ring * 0.095,
        phase: ring * 0.6 + Math.abs(normalized) * 2.3,
      });
    }
  }
  return placements;
}
