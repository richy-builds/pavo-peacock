import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const browser=await chromium.launch({channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1.5});
page.on('pageerror',e=>console.error(e));
await page.route('**/body-review.html',r=>r.fulfill({contentType:'text/html',body:`<style>body{margin:0;background:#03090c}#scene{width:100vw;height:100vh}</style><div id="scene"></div><script type="module">import {FeatherStudy} from '/src/FeatherStudy.ts';window.app=new FeatherStudy(document.querySelector('#scene'));app.setMode('fan');</script>`}));
await page.goto('http://127.0.0.1:5174/body-review.html');await page.waitForFunction(()=>window.app);
await page.evaluate(()=>app.setMotion(false));
for(const [name,x,z] of [['front',0,6],['oblique',4,4.8],['side',6,0]]){
 await page.evaluate(({x,z})=>{app.controls.enableDamping=false;app.controls.target.set(0,2,.4);app.camera.position.set(x,2.4,z+.4);app.controls.update();},{x,z});
 await page.waitForTimeout(600);await page.screenshot({path:`docs/evidence/body-${process.argv[2]||'after'}-${name}.png`});
}
if(['final','folds'].includes(process.argv[2])) {
 await page.evaluate(()=>app.setMotion(true));
 for(const amount of [0,.3,.6,1]) for(const [name,x,z] of [['oblique',4,4.8],['side',6,0]]){
  await page.evaluate(({amount,x,z})=>{app.setFanTarget(amount);app.controls.target.set(0,2,.4);app.camera.position.set(x,2.4,z+.4);app.controls.update();},{amount,x,z});
  await page.waitForTimeout(1700);await page.screenshot({path:`docs/evidence/body-fold-${amount}-${name}.png`});
 }
 for(const [action,x,z,delay] of [['bow',6,0,600],['display',4,4.8,700],['rest',6,0,1700]]) {
  await page.evaluate(({action,x,z})=>{app.controls.target.set(0,2,.4);app.camera.position.set(x,2.4,z+.4);app.controls.update();app.action(action);},{action,x,z});
  await page.waitForTimeout(delay);await page.screenshot({path:`docs/evidence/body-${action}.png`});
 }
 if(process.argv[2]==='final') {
 await page.evaluate(()=>{app.setFanTarget(1);app.controls.target.set(0,2,.4);app.camera.position.set(4,2.4,5.2);app.controls.update();});
 await page.mouse.move(720,450);
 await page.waitForTimeout(3000);
 const result=await page.evaluate(async()=>{
  const app=window.app,initial=app.snapshot(),start=performance.now();let lastShake=-4;
  const result=app.benchmark.start(initial);
  function move(now){const t=(now-start)/1000;app.camera.position.set(Math.sin(.7+Math.sin(t*.35)*.32)*6.25,2.4,.4+Math.cos(.7+Math.sin(t*.35)*.32)*6.25);app.controls.update();app.setFanTarget(.8+.2*Math.cos(t*.6));if(t-lastShake>4){app.action('shake');app.action('bow');lastShake=t;}if(app.benchmark.recording)requestAnimationFrame(move);}
  requestAnimationFrame(move);return {benchmark:await result,final:app.snapshot(),description:'30-second close body orbit (6.25 units, high feather LOD), smoothly varying fan .6 to 1, repeated shake and bow, stationary pointer repicking the moving body. Separate 3-second warm-up. Same anatomy/render loop as application; browser-only review harness.'};
 });
 writeFileSync('docs/evidence/body-close-benchmark.json',JSON.stringify(result,null,2));
 }
}
await browser.close();
