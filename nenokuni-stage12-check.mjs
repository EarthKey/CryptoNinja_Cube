import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const base=process.env.CUBE_TEST_URL||'http://127.0.0.1:4175/';
const browser=await chromium.launch({channel:'msedge',headless:true});
const names=['sasagane','gokou','shinra','sasura','yami','yomi'];
const expected=names.map(name=>`nenokuni-${name}-medium.mp4`);
const errors=[],httpErrors=[],results=[],imageRequests=new Set();
try{
 const page=await browser.newPage({viewport:{width:1366,height:1000},reducedMotion:'no-preference'});
 page.on('pageerror',error=>errors.push(error.message));
 page.on('response',response=>{if(response.status()>=400)httpErrors.push(`${response.status()} ${response.url()}`);if(/nenokuni-.*\.webp/.test(response.url()))imageRequests.add(new URL(response.url()).pathname.split('/').at(-1));});
 const snapshot=()=>page.evaluate(()=>window.__cube.snapshot());
 async function start(clan,tone){
  await page.goto(base);
  const choice=page.locator(`[data-clan="${clan}"]`);assert.equal(await choice.isEnabled(),true);await choice.click();
  if(clan==='根の国')assert.equal(await page.locator('.difficulty-list .hard').isDisabled(),false);
  await page.locator(`.difficulty-list .${tone}`).click();
  await page.getByRole('radio',{name:'6面すべて',exact:true}).check();
  await page.locator('.entry-primary').click();
  await page.waitForFunction(()=>window.__cube?.snapshot().fps>0);
 }
 for(const width of [1366,390]){
  await page.setViewportSize({width,height:1000});
  await start('根の国','medium');
  await page.waitForFunction(()=>window.__cube.snapshot().media.length===6&&window.__cube.snapshot().media.every(v=>v.readyState>=2&&!v.paused&&v.currentTime>.2));
  const media=(await snapshot()).media;assert.deepEqual(media.map(v=>v.file),expected);
  const clips=await page.evaluate(()=>[...document.querySelectorAll('.face-video-source')].map(v=>({width:v.videoWidth,height:v.videoHeight,duration:v.duration,loop:v.loop,muted:v.muted,rate:v.playbackRate})));
  for(const clip of clips){assert.equal(clip.width,480);assert.equal(clip.height,480);assert.ok(Math.abs(clip.duration-31/6)<.01);assert.equal(clip.loop,true);assert.equal(clip.muted,true);assert.equal(clip.rate,1);}
  assert.equal(await page.getByRole('switch',{name:'BGM',exact:true}).isDisabled(),false);
  if(width===1366){
   await page.waitForFunction(()=>window.__cube.snapshot().media[0].currentTime>4.9,{},{timeout:10000});
   await page.waitForFunction(()=>window.__cube.snapshot().media[0].currentTime<2&&!window.__cube.snapshot().media[0].paused,{},{timeout:5000});
  }
  await page.getByText('表示を調整',{exact:true}).click();
  const reduced=page.getByRole('checkbox',{name:'浮遊を止める・動きを抑える'});
  await reduced.check();await page.waitForFunction(()=>window.__cube.snapshot().media.every(v=>v.paused));
  await reduced.uncheck();await page.waitForFunction(()=>window.__cube.snapshot().media.every(v=>!v.paused));
  await page.getByText('表示を調整',{exact:true}).click();
  await page.getByRole('button',{name:'正面',exact:true}).click();await page.locator('.stage').scrollIntoViewIfNeeded();
  const tile=await page.evaluate(()=>window.__cube.tilePoint(0,4));await page.mouse.click(tile.x,tile.y);
  await page.waitForFunction(()=>window.__cube.snapshot().selection?.face===0);await page.keyboard.press('w');
  await page.waitForFunction(()=>window.__cube.snapshot().history===1&&!window.__cube.snapshot().busy);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  results.push({width,media:media.map(v=>v.file),clips,rotation:true,reducedMotion:true,hardDisabled:false,bgmUnassigned:false});
  console.error('PASS Ne no Kuni medium playback/loop/reducedMotion/rotation',width);
 }
 for(const name of names)assert(imageRequests.has(`nenokuni-${name}-medium.webp`),'Missing dedicated medium poster: '+name);
 await start('根の国','easy');assert.equal((await snapshot()).media.length,0);
 await page.waitForFunction(()=>performance.getEntriesByType('resource').filter(r=>/\/assets\/nenokuni-[a-z]+\.webp/.test(r.name)).length===6);
 for(const [clan,tone,prefix] of [['甲賀','medium','sakuya-medium.mp4'],['伊賀','hard','iga-anne-hard.mp4'],['風魔','hard','fuma-rotten-hard.mp4'],['雑賀','hard','saika-shiba-hard.mp4']]){
  await start(clan,tone);await page.waitForFunction(()=>window.__cube.snapshot().media.length===6&&window.__cube.snapshot().media.every(v=>v.readyState>=2));
  assert.equal((await snapshot()).media[0].file,prefix);
 }
 assert.deepEqual(errors,[]);assert.deepEqual(httpErrors,[]);
 console.log(JSON.stringify({base,results,easyHasNoVideos:true,dedicatedMediumPosters:true,existingClanRegressions:true,errors,httpErrors},null,2));
}finally{await browser.close();}
