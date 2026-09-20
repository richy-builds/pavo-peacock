// Bounded M4.5 capture. Uses the production sculpture class in a temporary browser-only
// page; no source edits, runtime recording controls, or application cinema framework.
import { chromium } from '@playwright/test';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
function fingerprint(dir='src'){return readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e=>e.isDirectory()?fingerprint(`${dir}/${e.name}`):[[`${dir}/${e.name}`,createHash('sha256').update(readFileSync(`${dir}/${e.name}`)).digest('hex')]]);}
const before=fingerprint(),browser=await chromium.launch({channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1.5});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.route('**/post-capture.html',r=>r.fulfill({contentType:'text/html',body:`<style>body{margin:0;background:#03090c}#scene{width:100vw;height:100vh}</style><div id="scene"></div><script type="module">import {FeatherStudy} from '/src/FeatherStudy.ts';window.app=new FeatherStudy(document.querySelector('#scene'));app.setMode('fan');</script>`}));
await page.goto('http://127.0.0.1:5174/post-capture.html');await page.waitForFunction(()=>window.app);
await page.evaluate(()=>{app.controls.enableDamping=false;app.controls.target.set(0,2.9,0);app.camera.position.set(Math.sin(.55)*13.5,4.1,Math.cos(.55)*13.5);app.controls.update();app.setFanTarget(.36);});
await page.waitForTimeout(3000);
const conditions=await page.evaluate(()=>app.snapshot());
await page.screenshot({path:'docs/evidence/post-opening.png'});
const recording=await page.evaluate(async()=>{
 const stream=document.querySelector('canvas').captureStream(30),chunks=[];
 const mimeType='video/webm;codecs=vp9';if(!MediaRecorder.isTypeSupported(mimeType))throw Error('VP9 unavailable');
 const recorder=new MediaRecorder(stream,{mimeType,videoBitsPerSecond:18000000});
 recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
 const done=new Promise(resolve=>recorder.onstop=async()=>{const bytes=new Uint8Array(await new Blob(chunks).arrayBuffer());let s='';for(let i=0;i<bytes.length;i+=32768)s+=String.fromCharCode(...bytes.subarray(i,i+32768));resolve(btoa(s));});
 let start,shaken=false;const samples=[];recorder.start();
 await new Promise(resolve=>{function step(now){start??=now;const t=(now-start)/1000,u=Math.max(0,Math.min(1,(t-.5)/5));const ease=u*u*(3-2*u),distance=13.5+8.24*ease,yaw=.55-.10*ease,target=2.9+1.35*ease;app.controls.target.set(0,target,0);app.camera.position.set(Math.sin(yaw)*distance,target+distance*.089,Math.cos(yaw)*distance);app.controls.update();app.setFanTarget(.36+.64*ease);if(t>=6&&!shaken){app.action('shake');shaken=true;}if(samples.length===0||t-samples.at(-1).t>.5)samples.push({t,amount:app.fan.amount});if(t<10)requestAnimationFrame(step);else resolve();}requestAnimationFrame(step);});
 recorder.stop();const base64=await done;stream.getTracks().forEach(t=>t.stop());return {base64,samples,final:app.life.snapshot()};
});
writeFileSync('docs/evidence/peacock-x-source.webm',Buffer.from(recording.base64,'base64'));
await browser.close();
if(JSON.stringify(before)!==JSON.stringify(fingerprint()))throw Error('Source changed during capture');
if(errors.length)throw Error(errors.join('\n'));
execFileSync('ffmpeg',['-y','-i','docs/evidence/peacock-x-source.webm','-t','10','-vf','scale=1440:900:flags=lanczos,fps=30','-c:v','libx264','-preset','slow','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart','-an','docs/evidence/peacock-x.mp4'],{stdio:'ignore'});
execFileSync('ffmpeg',['-y','-ss','9.5','-i','docs/evidence/peacock-x.mp4','-frames:v','1','docs/evidence/peacock-x-poster.png'],{stdio:'ignore'});
const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json','docs/evidence/peacock-x.mp4']));
writeFileSync('docs/evidence/post-capture.json',JSON.stringify({conditions,source:before,sourceUnchanged:true,errors,samples:recording.samples,final:recording.final,probe,description:'10s real-time canvas capture, three-quarter camera gently pulling back from 13.5 to 21.74 units. 0.5s hold, 5s smooth target ramp .36 to 1, one shake at 6s, settled ending. No UI, audio, or application source mutation; VP9 master transcoded to H264 yuv420p faststart 1440x900 30fps.'},null,2));
console.log('Saved MP4, VP9 master, poster and capture record.');
// Inspect the actual H264 deliverable in Chrome, including real playback and seeking.
const playbackBrowser=await chromium.launch({channel:'chrome'}),playback=await playbackBrowser.newPage({viewport:{width:1440,height:900}});
await playback.route('**/export-review.html',r=>r.fulfill({contentType:'text/html',body:'<style>body{margin:0;background:#03090c}video{width:100vw;height:100vh;object-fit:contain}</style><video src="/docs/evidence/peacock-x.mp4" muted playsinline></video>'}));
await playback.goto('http://127.0.0.1:5174/export-review.html');
await playback.evaluate(async()=>{const v=document.querySelector('video');await v.play();});
await playback.waitForFunction(()=>document.querySelector('video').ended,{},{timeout:20000});
const inspection=await playback.evaluate(()=>{const v=document.querySelector('video'),q=v.getVideoPlaybackQuality();return {duration:v.duration,width:v.videoWidth,height:v.videoHeight,ended:v.ended,error:v.error,totalVideoFrames:q.totalVideoFrames,droppedVideoFrames:q.droppedVideoFrames};});
for(const t of [.2,3.5,6.5,9.5]) {
 await playback.evaluate(t=>new Promise(resolve=>{const v=document.querySelector('video');v.onseeked=()=>resolve();v.currentTime=t;}),t);
 await playback.screenshot({path:`docs/evidence/post-export-${t}.png`});
}
await playbackBrowser.close();
if(!inspection.ended||inspection.error||inspection.totalVideoFrames<280)throw Error(JSON.stringify(inspection));
writeFileSync('docs/evidence/post-export-inspection.json',JSON.stringify(inspection,null,2));
console.log('Actual MP4 playback and sampled export frames verified.',inspection);
