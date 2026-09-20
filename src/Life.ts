import { Vector2, Vector3 } from 'three';
import { FanMotion, type FanFeather } from './feather/fan';

export type LifeAction = 'shake' | 'display' | 'bow' | 'rest';
interface Ripple { origin: Vector3; age: number }
/** Independent bounded channels. Nothing here owns the camera or locomotion. */
export class Life {
  time = 0;
  hover = -1;
  readonly pointer = new Vector2();
  tracking = false;
  readonly forces: FanMotion[];
  readonly offsets: Float32Array;
  readonly highlights: Float32Array;
  readonly eyes: Vector3[];
  ripples: Ripple[] = [];
  private readonly shake = new FanMotion();
  shakeAge = 10;
  bowAge = 10;
  acknowledgeAge = 10;
  posture: 'neutral' | 'display' | 'rest' = 'neutral';
  postureAmount = 0;
  yaw = 0;
  pitch = 0;
  clicks = 0;
  acknowledgments = 0;
  constructor(count: number) {
    this.shake.amount=this.shake.target=0;
    this.forces = Array.from({length:count}, () => {const f=new FanMotion();f.amount=f.target=0;return f;});
    this.offsets = new Float32Array(count); this.highlights = new Float32Array(count);
    this.eyes = Array.from({length:count},()=>new Vector3());
  }
  action(action: LifeAction) {
    if (action==='shake') this.shakeAge=0;
    if (action==='bow') this.bowAge=0;
    if (action==='display') { this.posture='display'; this.shakeAge=0; }
    if (action==='rest') this.posture='rest';
  }
  manual() { this.posture='neutral'; }
  click(id: number) {
    this.clicks++;
    this.ripples.push({origin:this.eyes[id].clone(),age:0});
    if(this.ripples.length>4) this.ripples.shift();
  }
  acknowledge() { this.acknowledgeAge=0; this.acknowledgments++; }
  clearPointer() { this.hover=-1;this.tracking=false; }
  reset() { this.clearPointer();this.ripples=[];this.shakeAge=this.bowAge=this.acknowledgeAge=10;this.posture='neutral'; }
  step(dt: number, layout: readonly FanFeather[], ambient: boolean, reduced: boolean, opening: number) {
    dt=Math.max(0,Math.min(.05,dt));this.time+=dt;
    this.shakeAge+=dt;this.bowAge+=dt;this.acknowledgeAge+=dt;
    this.ripples.forEach(r=>r.age+=dt);this.ripples=this.ripples.filter(r=>r.age<3.6);
    this.shake.setTarget(this.shakeAge<1.35?1:0);this.shake.step(dt);
    const ease=1-Math.exp(-dt*6);
    this.postureAmount+=((this.posture==='display'?1:this.posture==='rest'?-1:0)-this.postureAmount)*ease;
    this.yaw+=((this.tracking ? this.pointer.x*.35 : ambient ? Math.sin(this.time*.29)*.035 : 0)-this.yaw)*ease;
    this.pitch+=((this.tracking ? -this.pointer.y*.09 : 0)-this.pitch)*ease;
    for(const p of layout) {
      const distance=this.hover<0?Infinity:this.eyes[p.id].distanceTo(this.eyes[this.hover]);
      const f=this.forces[p.id];f.setTarget(Math.exp(-distance*distance/ .32));f.step(dt);
      let wave=0,glow=0;
      for(const r of this.ripples) {
        const d=this.eyes[p.id].distanceTo(r.origin);
        const ring=(d-r.age*3.6)/.48;
        const envelope=Math.exp(-ring*ring)*Math.exp(-r.age*.65);
        wave+=envelope*Math.sin(r.age*12-d*3);glow+=envelope;
      }
      const shake=this.shake.amount*Math.sin(this.time*36+p.angle*4+p.layer*.8);
      const idle=ambient?Math.sin(this.time*.8+p.angle*2+p.layer*.4)*.0015:0;
      // Fade angular offsets as the train approaches the floor; roots stay fixed.
      this.offsets[p.id]=reduced?0:.045*Math.tanh((.022*f.amount+.014*wave+.018*shake+idle)/.045)*Math.min(1,opening*4);
      this.highlights[p.id]=Math.min(1,(reduced?.22:1)*(f.amount*.25+glow*.85+Math.abs(shake)*.3));
    }
  }
  pose(reduced: boolean, ambient: boolean) {
    const pulse=(age:number,duration:number)=>age<duration?Math.sin(Math.PI*age/duration)**2:0;
    const blinkPhase=this.time%5.3;
    return {
      yaw:reduced?0:this.yaw,
      headPitch:reduced?0:this.pitch+pulse(this.acknowledgeAge,1.15)*.17,
      bow:(reduced?.035:.23)*pulse(this.bowAge,2.5)-this.postureAmount*.045,
      breath:ambient&&!reduced?Math.sin(this.time*1.6)*.003:0,
      blink:ambient&&!reduced?Math.max(.08,1-pulse(blinkPhase,.19)):1,
    };
  }
  snapshot() {return {hover:this.hover,hoverMax:Math.max(...this.forces.map(f=>f.amount)),ripples:this.ripples.length,
    shakeAge:this.shakeAge,posture:this.posture,clicks:this.clicks,acknowledgments:this.acknowledgments,
    yaw:this.yaw,offsets:[...this.offsets],highlights:[...this.highlights],pose:this.pose(false,true)};}
}
