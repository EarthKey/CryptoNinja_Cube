import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const base=process.env.CUBE_TEST_URL||'http://127.0.0.1:4175/';
const browser=await chromium.launch({channel:'msedge',headless:true});
const errors=[],httpErrors=[],results=[];
try{
 const page=await browser.newPage({viewport:{width:1366,height:1000},reducedMotion:'no-preference'});
 page.on('pageerror',error=>errors.push(error.message));
 page.on('response',response=>{if(response.status()>=400)httpErrors.push(`${response.status()} ${response.url()}`);});
 const snapshot=()=>page.evaluate(()=>window.__cube.snapshot());
 async function start(clan,tone){
  await page.goto(base);
  await page.locator(`[data-clan="${clan}"]`).click();
  await page.locator(`.difficulty-list .${tone}`).click();
  await page.locator('.entry-primary').click();
  await page.waitForFunction(()=>window.__cube?.snapshot().fps>0);
 }
 for(const width of [1366,390]){
  await page.setViewportSize({width,height:1000});
  await start('風魔','hard');
  assert.equal(await page.getByText(/全身アニメを先行収録/).count(),0);
  await page.waitForFunction(()=>window.__cube.snapshot().media.length===6&&window.__cube.snapshot().media.every(v=>v.readyState>=2&&!v.paused&&v.currentTime>.2));
  const media=(await snapshot()).media;
  assert.deepEqual(media.map(v=>v.file),['fuma-rotten-hard.mp4','fuma-atoza-hard.mp4','fuma-janome-hard.mp4','fuma-karma-hard.mp4','fuma-aum-hard.mp4','fuma-ibuki-hard.mp4']);
  const clips=await page.evaluate(()=>[...document.querySelectorAll('.face-video-source')].map(v=>({width:v.videoWidth,height:v.videoHeight,duration:v.duration,loop:v.loop,muted:v.muted})));
  assert.equal(clips.length,6);
  for(const clip of clips){assert.equal(clip.width,640);assert.equal(clip.height,640);assert.ok(Math.abs(clip.duration-15.083333)<.01);assert.equal(clip.loop,true);assert.equal(clip.muted,true);}
  if(width===1366){
   // Observe an entire unmodified-speed playback, including the loop boundary.
   await page.waitForFunction(()=>window.__cube.snapshot().media[0].currentTime>14.8,{},{timeout:20000});
   await page.waitForFunction(()=>window.__cube.snapshot().media[0].currentTime<2&&!window.__cube.snapshot().media[0].paused,{},{timeout:5000});
  }
  await page.getByText('表示を調整',{exact:true}).click();
  const reduced=page.getByRole('checkbox',{name:'浮遊を止める・動きを抑える'});
  await reduced.check();await page.waitForFunction(()=>window.__cube.snapshot().media.every(v=>v.paused));
  await reduced.uncheck();await page.waitForFunction(()=>window.__cube.snapshot().media.every(v=>!v.paused));
  await page.getByText('表示を調整',{exact:true}).click();
  await page.getByRole('button',{name:'正面',exact:true}).click();
  await page.locator('.stage').scrollIntoViewIfNeeded();
  const before=(await snapshot()).history;
  const tile=await page.evaluate(()=>window.__cube.tilePoint(0,4));
  await page.mouse.click(tile.x,tile.y);
  await page.waitForFunction(()=>window.__cube.snapshot().selection?.face===0);
  await page.keyboard.press('w');
  await page.waitForFunction(()=>window.__cube.snapshot().history===1&&!window.__cube.snapshot().busy);
  assert.equal((await snapshot()).history,before+1);
  console.error('PASS Fuma hard playback/loop/reducedMotion/rotation',width);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  results.push({width,media:media.map(v=>v.file),clips,rotation:true,reducedMotion:true});
 }
 await start('風魔','medium');
 await page.waitForFunction(()=>window.__cube.snapshot().media.length===6&&window.__cube.snapshot().media.every(v=>v.readyState>=2));
 assert.ok((await snapshot()).media.every(v=>v.file.endsWith('-medium.mp4')));
 await start('風魔','easy');
 assert.equal((await snapshot()).media.length,0);
 await start('甲賀','hard');
 await page.waitForFunction(()=>window.__cube.snapshot().media.length===6&&window.__cube.snapshot().media.every(v=>v.readyState>=2));
 assert.ok((await snapshot()).media.every(v=>v.file.endsWith('-hard.mp4')));
 assert.equal(await page.getByText(/全身アニメを先行収録/).count(),0);
 for(const clan of ['雑賀']){
  await page.goto(base);await page.locator(`[data-clan="${clan}"]`).click();
  assert.equal(await page.locator('.difficulty-list .hard').isDisabled(),true);
 }
 assert.deepEqual(errors,[]);assert.deepEqual(httpErrors,[]);
 console.log(JSON.stringify({base,results,regressions:{fumaMedium:true,fumaEasy:true,kogaHard:true,unmadeStagesLocked:true},errors,httpErrors},null,2));
}finally{await browser.close();}
