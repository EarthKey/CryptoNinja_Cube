import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 for(const width of [390,1366]){
  const page=await browser.newPage({viewport:{width,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForFunction(()=>window.__cube?.snapshot().fps>0);
  await page.getByRole('button',{name:'6面完成',exact:true}).click();
  const initial=await page.evaluate(()=>window.__cube.snapshot());
  for(const [face,label] of [[0,'正面'],[4,'背面'],[3,'左面'],[1,'右面'],[2,'上面'],[5,'下面']]){
   await page.getByRole('button',{name:label,exact:true}).click();
   await page.waitForTimeout(150);
   assert.equal(await page.getByRole('button',{name:label,exact:true}).getAttribute('aria-pressed'),'true');
   const state=await page.evaluate(()=>window.__cube.snapshot());
   assert.deepEqual(state.pieces,initial.pieces);assert.equal(state.history,0);assert.equal(state.selection,null);
   await page.locator('.stage').scrollIntoViewIfNeeded();
   const point=await page.evaluate(f=>window.__cube.tilePoint(f,4),face);
   await page.mouse.click(point.x,point.y);
   const selected=await page.evaluate(()=>window.__cube.snapshot().selection);
   assert.equal(selected?.face,face,'chosen face is visible and selectable');
   await page.keyboard.press('w');await page.waitForTimeout(400);
   await page.keyboard.press('s');await page.waitForTimeout(400);
   assert.deepEqual((await page.evaluate(()=>window.__cube.snapshot())).pieces,initial.pieces);
   await page.getByRole('button',{name:'最初に戻す',exact:true}).click();
  }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.getByRole('switch',{name:'ダーク表示'}).click();
  await page.getByRole('button',{name:'上面',exact:true}).click();
  await page.screenshot({path:`face-view-${width}-check.png`,fullPage:true});
  assert.deepEqual(errors,[]);console.log(`PASS ${width}px: six face switches, selection, W/S, unchanged puzzle, dark theme, no overflow`);
  await page.close();
 }
}finally{await browser.close();}
