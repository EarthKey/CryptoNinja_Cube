import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'msedge'});const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
try{for(const width of [390,1366]){
 await p.setViewportSize({width,height:1000});await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>window.__cube?.snapshot().fps>0);
 await p.getByRole('button',{name:'3手だけ混ぜる'}).click();await p.waitForFunction(()=>!window.__cube.snapshot().busy);
 assert.equal((await p.evaluate(()=>window.__cube.snapshot())).solved.length,0);
 let moves=0;while(!(await p.getByRole('button',{name:'もう一度遊ぶ'}).count())&&moves<2){await p.getByRole('button',{name:'1手戻す'}).click();await p.waitForFunction(()=>!window.__cube.snapshot().busy);moves++;}
 await p.getByRole('button',{name:'もう一度遊ぶ'}).waitFor();await p.waitForTimeout(900);
 const before=await p.evaluate(()=>window.__cube.snapshot().pieces);await p.keyboard.press('w');await p.waitForTimeout(300);assert.deepEqual(await p.evaluate(()=>window.__cube.snapshot().pieces),before);
 assert.equal(await p.getByRole('button',{name:'1手戻す'}).isEnabled(),false);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);
 await p.screenshot({path:'oneface-'+width+'.png',fullPage:true});
 await p.getByRole('button',{name:'もう一度遊ぶ'}).click();await p.waitForFunction(()=>!window.__cube.snapshot().busy);assert.equal((await p.evaluate(()=>window.__cube.snapshot())).solved.length,0);
 console.log({width,earlyWinMoves:moves});
}assert.deepEqual(errors,[]);}finally{await b.close();}
