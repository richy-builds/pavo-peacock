import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

test('deformed feather picking at partial opening and oblique angles', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/'); await page.locator('#fan').click();
  const evidence=[];
  for (const amount of [.3,.6,1]) for(const view of ['reset','oblique']) {
    await page.locator('#fan-amount').fill(String(amount));
    await page.locator('#'+view).click(); await page.waitForTimeout(1000);
    const points=await page.evaluate(()=>(window as any).__featherStudy.pickingEvidence());
    const visible=points.filter((p:any)=>p.hit.kind==='feather'&&p.hit.id===p.id);
    expect(visible.length).toBeGreaterThan(0);
    const eye=visible[0];
    const before=await page.evaluate(()=>(window as any).__featherStudy.lifeState().clicks);
    await page.mouse.click(eye.x,eye.y);
    expect(await page.evaluate(()=>(window as any).__featherStudy.lifeState().clicks)).toBe(before+1);
    await page.mouse.move(1350,100);
    evidence.push({amount,view,visibleEyes:visible.length,points});
    await page.screenshot({path:`docs/evidence/life-picking-${amount}-${view}.png`});
  }
  await writeFile('docs/evidence/life-picking.json',JSON.stringify(evidence,null,2));
});

const state = (page:any) => page.evaluate(()=>(window as any).__featherStudy.lifeState());
async function visibleEye(page:any) {
  return page.evaluate(()=>{
    const points=(window as any).__featherStudy.pickingEvidence();
    return points.find((p:any)=>p.hit.kind==='feather'&&p.hit.id===p.id&&p.x>300&&p.x<650&&p.y>220&&p.y<650)
      ?? points.find((p:any)=>p.hit.kind==='feather'&&p.hit.id===p.id);
  });
}

test('hover settles, ripple and phased shake compose with folding and head response',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('/');await page.locator('#fan').click();await page.waitForTimeout(300);
  const eye=await visibleEye(page);expect(eye).toBeTruthy();
  await page.mouse.move(eye.x,eye.y);await page.waitForTimeout(450);
  expect((await state(page)).hoverMax).toBeGreaterThan(.2);
  await page.screenshot({path:'docs/evidence/life-hover.png'});
  await page.mouse.click(eye.x,eye.y);
  expect((await state(page)).clicks).toBe(1);
  await page.mouse.move(1350,100);await page.waitForTimeout(300);
  await page.screenshot({path:'docs/evidence/life-ripple-early.png'});
  await page.waitForTimeout(450);await page.screenshot({path:'docs/evidence/life-ripple-outward.png'});
  await page.locator('#shake').click();await page.locator('#fan-amount').fill('0.6');
  await page.waitForTimeout(500);
  const combined=await state(page);
  expect(combined.ripples).toBeGreaterThan(0);
  expect(new Set(combined.offsets.map((n:number)=>n.toFixed(4))).size).toBeGreaterThan(30);
  expect(combined.offsets.every((n:number)=>Number.isFinite(n)&&Math.abs(n)<.06)).toBe(true);
  await page.locator('#oblique').click();await page.waitForTimeout(250);
  await page.screenshot({path:'docs/evidence/life-combined-oblique.png'});
  await page.locator('#display').click();await page.waitForTimeout(300);
  expect((await state(page)).posture).toBe('display');
  await page.locator('#fan-amount').fill('0.4');expect((await state(page)).posture).toBe('neutral');
  await page.locator('#rest').click();expect((await state(page)).posture).toBe('rest');
  await page.locator('#fan-amount').fill('1');await page.locator('#reset').click();await page.waitForTimeout(1200);
  // The breast is in front of the fan and owns this click.
  await page.mouse.click(720,620);expect((await state(page)).acknowledgments).toBe(1);
  await page.mouse.move(1000,400);await page.waitForTimeout(350);
  expect((await state(page)).yaw).toBeGreaterThan(.04);
  await page.locator('#bow').click();await page.locator('#side').click();await page.waitForTimeout(1000);
  await page.screenshot({path:'docs/evidence/life-bow-side.png'});
  await page.mouse.move(50,50);await page.waitForTimeout(3800);
  const settled=await state(page);expect(settled.hoverMax).toBeLessThan(.001);expect(settled.ripples).toBe(0);
  expect(errors).toEqual([]);
  await writeFile('docs/evidence/life-composition.json',JSON.stringify({combined,settled,errors},null,2));
});

test('drag, cancellation, multitouch and UI own their input; reduced motion stays restrained',async({page})=>{
  await page.goto('/');await page.locator('#fan').click();const eye=await visibleEye(page);
  await page.mouse.move(eye.x,eye.y);await page.mouse.down();await page.mouse.move(eye.x+50,eye.y,{steps:5});await page.mouse.move(eye.x,eye.y,{steps:5});await page.mouse.up();
  expect((await state(page)).clicks).toBe(0);
  await page.locator('canvas').dispatchEvent('pointerdown',{pointerId:71,clientX:eye.x,clientY:eye.y,button:0});
  await page.locator('canvas').dispatchEvent('pointercancel',{pointerId:71});
  await page.locator('canvas').dispatchEvent('pointerup',{pointerId:71,clientX:eye.x,clientY:eye.y,button:0});
  expect((await state(page)).clicks).toBe(0);
  await page.locator('#reset').click();
  for(const id of [81,82])await page.locator('canvas').dispatchEvent('pointerdown',{pointerId:id,clientX:eye.x,clientY:eye.y,button:0,pointerType:'touch'});
  for(const id of [82,81])await page.locator('canvas').dispatchEvent('pointerup',{pointerId:id,clientX:eye.x,clientY:eye.y,button:0,pointerType:'touch'});
  await page.locator('#shake').click();await page.locator('#bow').click();await page.locator('#fan-amount').fill('0.3');
  expect((await state(page)).clicks).toBe(0);expect((await state(page)).acknowledgments).toBe(0);
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#fan-amount').fill('1');await page.waitForTimeout(1000);
  const reducedEye=await visibleEye(page);await page.mouse.click(reducedEye.x,reducedEye.y);await page.locator('#shake').click();await page.waitForTimeout(400);
  const reduced=await state(page);expect(reduced.offsets.every((n:number)=>n===0)).toBe(true);expect(Math.max(...reduced.highlights)).toBeLessThanOrEqual(.25);
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'docs/evidence/life-mobile-reduced.png'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
});

test('picking matches solid high-detail geometry with width, oblique rays and moving offsets',async()=>{
  const {FeatherPicker}=await import('../src/feather/picking');
  const {createFeatherGeometry}=await import('../src/feather/geometry');
  const {createFanLayout,poseFanFeather}=await import('../src/feather/fan');
  const {InstancedMesh,MeshBasicMaterial,DoubleSide,Raycaster,Vector3,Object3D,Sphere}=await import('three');
  const geometry=createFeatherGeometry();
  const material=new MeshBasicMaterial({side:DoubleSide});
  const source=new InstancedMesh(geometry,material,1);source.boundingSphere=new Sphere(new Vector3(0,2,0),12);
  const reference=geometry.clone();reference.scale(.48,1,1);
  const oracle=new InstancedMesh(reference,material,1);oracle.boundingSphere=source.boundingSphere;
  const picker=new FeatherPicker(),out=new Object3D(),p=createFanLayout()[30];
  const records=[];
  for(const amount of [.3,.6,1])for(const angle of [0,.65,1.2])for(const offset of [0,.03]) {
    poseFanFeather(p,amount,1,true,out);out.rotation.x-=offset;out.rotation.y+=offset*.45;out.updateMatrix();
    source.setMatrixAt(0,out.matrix);oracle.setMatrixAt(0,out.matrix);picker.sync(source,.48);
    const dir=new Vector3(Math.sin(angle),0,Math.cos(angle));
    for(const x of [0,.08,.4]) {
      const target=new Vector3(x,3.64,.342).applyMatrix4(out.matrix);
      const origin=new Vector3(x,3.64,.342).addScaledVector(dir,4).applyMatrix4(out.matrix);
      const ray=new Raycaster(origin,target.clone().sub(origin).normalize());
      const expected=ray.intersectObject(oracle,false)[0],actual=picker.pick(ray);
      expect(Boolean(actual)).toBe(Boolean(expected));
      if(actual&&expected) expect(Math.abs(actual.distance-expected.distance)).toBeLessThan(.012);
      records.push({amount,angle,offset,x,hit:!!actual,error:actual&&expected?Math.abs(actual.distance-expected.distance):null});
    }
  }
  await writeFile('docs/evidence/life-picking-oracle.json',JSON.stringify(records,null,2));
  picker.dispose();geometry.dispose();reference.dispose();material.dispose();source.dispose();oracle.dispose();
});

test('bounded composable life channels retain floor clearance and recover after stalls',async()=>{
  const {Life}=await import('../src/Life');
  const {createFanLayout,poseFanFeather}=await import('../src/feather/fan');
  const {createFeatherGeometry}=await import('../src/feather/geometry');
  const {Object3D,Vector3}=await import('three');
  const layout=createFanLayout(),life=new Life(240),out=new Object3D(),point=new Vector3();
  const geometry=createFeatherGeometry('low'),positions=geometry.getAttribute('position');
  let minimumY=Infinity;
  for(let step=0;step<=40;step++)for(const p of layout)for(const sign of [-1,1]) {
    const opening=step/40,offset=sign*.045*Math.min(1,opening*4);
    poseFanFeather(p,opening,2,true,out);out.rotation.x-=offset;out.rotation.y+=offset*.45;out.updateMatrix();
    for(let i=0;i<positions.count;i++) {
      point.fromBufferAttribute(positions,i);point.x*=.48;point.applyMatrix4(out.matrix);minimumY=Math.min(minimumY,point.y);
    }
    life.eyes[p.id].set(0,3.64,.342).applyMatrix4(out.matrix);
  }
  expect(minimumY).toBeGreaterThan(0);
  for(let step=0;step<1200;step++) {
    if(step%7===0) {life.click(step%240);life.action('shake');life.action('bow');}
    life.hover=step%240;life.step(step%90===0?20:1/60,layout,true,false,.6);
    expect(life.ripples.length).toBeLessThanOrEqual(4);
    expect(life.offsets.every(n=>Number.isFinite(n)&&Math.abs(n)<=.045)).toBe(true);
  }
  life.clearPointer();for(let i=0;i<400;i++)life.step(1/60,layout,false,false,1);
  expect(life.ripples.length).toBe(0);expect(Math.max(...life.offsets.map(Math.abs))).toBeLessThan(.0001);
  await writeFile('docs/evidence/life-clearance.json',JSON.stringify({minimumY,phases:41,offsetExtremes:[-.045,.045],note:'Distance-tier vertices, shader width .48, both extremal offsets and secondary fold lag. Sampled floor clearance, not feather/body collision solving.'},null,2));
  geometry.dispose();
});

test('30-second combined folding, shake, ripple and head benchmark',async({page})=>{
  await page.goto('/');await page.locator('#fan').click();
  const eye=await visibleEye(page);
  await page.locator('#inspect').click();await page.waitForTimeout(2500);
  await page.locator('#benchmark').click();
  const start=Date.now();let cycles=0;
  while(Date.now()-start<30100) {
    await page.locator('#fan-amount').fill(cycles%2?'1':'0.6');
    await page.locator('#shake').click();
    const point=await page.evaluate(id=>(window as any).__featherStudy.eyeScreen(id),eye.id);
    await page.mouse.click(point.x,point.y);await page.mouse.move(point.x+30,point.y+15,{steps:10});
    await page.mouse.click(720,620);await page.waitForTimeout(750);cycles++;
  }
  await expect(page.locator('#benchmark-status')).toContainText('Complete.');
  const final=await state(page);expect(final.clicks).toBeGreaterThan(10);expect(final.acknowledgments).toBeGreaterThan(10);
  const pending=page.waitForEvent('download');await page.locator('#download').click();
  await (await pending).saveAs('docs/evidence/life-combined-benchmark.json');
  await writeFile('docs/evidence/life-combined-scenario.json',JSON.stringify({cycles,durationMs:Date.now()-start,clicks:final.clicks,acknowledgments:final.acknowledgments,description:'Alternate fan targets .6/1, retrigger phased shake, click currently projected feather eye, brush 30px, and click breast every cycle. All mutations use visible controls or pointer events. Only a single eye projection is read per cycle; no diagnostic ray sweep during timing.',limitations:'No walking (milestone 5), no camera motion in this combined scenario. Headless frame scheduling, not GPU timings.'},null,2));
});

test('gesture visual sequence preserves attachment and settles',async({page})=>{
  await page.goto('/');await page.locator('#fan').click();await page.locator('#oblique').click();
  await page.locator('#display').click();await page.waitForTimeout(700);
  await page.screenshot({path:'docs/evidence/life-display-oblique.png'});
  await page.locator('#reset').click();await page.locator('#shake').click();
  for(let frame=0;frame<4;frame++) {
    await page.waitForTimeout(120);await page.screenshot({path:`docs/evidence/life-shake-${frame}.png`});
  }
  await page.locator('#rest').click();await page.locator('#side').click();await page.waitForTimeout(1500);
  await page.screenshot({path:'docs/evidence/life-rest-side.png'});
  await page.waitForTimeout(2000);
  expect((await state(page)).pose.bow).toBeCloseTo(.045,3);
});
