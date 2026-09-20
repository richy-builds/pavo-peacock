import {test,expect} from '@playwright/test';

test('hero camera orbit, zoom, background reset and narrow framing',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'FAN',exact:true}).click();
  const camera=()=>page.evaluate(()=>(window as any).__featherStudy.camera());
  const initial=await camera();
  await page.mouse.move(700,420);await page.mouse.down();await page.mouse.move(850,450,{steps:20});await page.mouse.up();
  await page.waitForTimeout(700);
  expect((await camera())[0]).not.toBeCloseTo(initial[0]);
  await page.mouse.wheel(0,-300);await page.waitForTimeout(600);
  expect((await camera())[2]).toBeLessThan(initial[2]);
  await page.mouse.dblclick(1350,150);await page.waitForTimeout(500);
  const reset=await camera();reset.forEach((n:number,i:number)=>expect(n).toBeCloseTo(initial[i],3));
  // Detail image of anatomy, using real wheel input.
  await page.mouse.move(720,500);await page.mouse.wheel(0,-700);await page.waitForTimeout(600);
  await page.screenshot({path:'docs/evidence/hero-zoom.png'});
  await page.setViewportSize({width:320,height:844});
  await page.getByRole('button',{name:'RESET',exact:true}).click();
  expect((await camera()).every(Number.isFinite)).toBe(true);
  await page.screenshot({path:'docs/evidence/hero-narrow.png'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(320);
});

test('touch orbit and pinch retain usable fan controls',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1.5,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const page=await context.newPage();await page.goto('/');
  await page.getByRole('button',{name:'FAN',exact:true}).tap();
  const camera=()=>page.evaluate(()=>(window as any).__featherStudy.camera());
  const initial=await camera();const cdp=await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:170,y:420}]});
  for(let i=1;i<=12;i++) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:170+i*5,y:420}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  expect(Math.abs((await camera())[0]-initial[0])).toBeGreaterThan(1);
  await page.getByRole('button',{name:'RESET',exact:true}).tap();
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:150,y:420,id:0},{x:240,y:420,id:1}]});
  for(let i=1;i<=10;i++) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:150-i*3,y:420,id:0},{x:240+i*3,y:420,id:1}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  expect((await camera())[2]).toBeLessThan(initial[2]);
  await page.getByRole('button',{name:'RESET',exact:true}).tap();
  await page.screenshot({path:'docs/evidence/hero-touch.png'});
  await context.close();
});
