import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
const base=process.env.CUBE_TEST_URL||'http://127.0.0.1:4175/';
const out=process.env.CUBE_EVIDENCE_DIR||'D:/AIillust/CriptNinja/Games/CryptoNinjaCube/Gallery_1031/local';
fs.mkdirSync(out,{recursive:true});
const root=process.cwd(),fixture=path.join(out,'test-model.mjs');
await build({stdin:{contents:`export * from ${JSON.stringify(root+'/src/model.ts')};export * from ${JSON.stringify(root+'/src/round.ts')};export * from ${JSON.stringify(root+'/src/controls.ts')};export * from ${JSON.stringify(root+'/src/view.ts')};`,resolveDir:root,loader:'ts'},bundle:true,format:'esm',platform:'node',outfile:fixture,logLevel:'silent'});
const {prepareRound,inverse,turn,stickersOf,faces,eq,transform,captureControls,faceView,DEFAULT_YAW,VIEW_TILT}=await import(pathToFileURL(fixture));
const solution=prepareRound(3,()=>0).reverse().map(inverse);
const browser=await chromium.launch({channel:'msedge',headless:true});const errors=[],httpErrors=[],results=[];
const faceButtons=['正面','右面','上面','左面','背面','下面'];
try{
 for(const width of [1366,390]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'no-preference'});
  await context.addInitScript(()=>{Math.random=()=>0;});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)httpErrors.push(`${r.status()} ${r.url()}`);});
  const snapshot=()=>page.evaluate(()=>window.__cube.snapshot());
  async function start(difficulty,mode='one'){
   await page.goto(base);await page.locator('[data-clan="根の国"]').click();await page.locator('.difficulty-list .'+difficulty).click();
   await page.getByRole('radio',{name:mode==='six'?'6面すべて':'1面を揃えて選ぶ',exact:true}).check();await page.locator('.entry-primary').click();
   await page.waitForFunction(()=>window.__cube?.snapshot().fps>0);
  }
  async function playMove(move){
   const before=(await snapshot()).pieces,expected=turn(before,move),tiles=stickersOf(before);let played=false;
   for(let world=0;world<6&&!played;world++){
    const q=faceView(world,DEFAULT_YAW,VIEW_TILT);
    const options=tiles.filter(s=>eq(transform(before[s.pieceId].basis,s.normal),faces[world].normal)).flatMap(s=>Object.entries(captureControls(before[s.pieceId],s,q)).filter(([,m])=>m.axis===move.axis&&m.layer===move.layer&&m.dir===move.dir).map(([key])=>({s,key}))).sort((a,b)=>Math.abs(before[a.s.pieceId].pos.reduce((x,y)=>x+y,0))-Math.abs(before[b.s.pieceId].pos.reduce((x,y)=>x+y,0)));
    if(!options.length)continue;
    await page.getByRole('button',{name:faceButtons[world],exact:true}).click();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    for(const {s,key} of options){
     const index=tiles.filter(t=>t.face===s.face).findIndex(t=>t.pieceId===s.pieceId);
     const point=await page.evaluate(({face,index})=>window.__cube.tilePoint(face,index),{face:s.face,index});await page.mouse.click(point.x,point.y);
     const selected=(await snapshot()).selection;if(selected?.face!==s.face||selected?.pieceId!==s.pieceId)continue;
     await page.keyboard.press(key);await page.waitForFunction(()=>!window.__cube.snapshot().busy);
     assert.deepEqual((await snapshot()).pieces,expected,'UI move must equal the intended turn');played=true;break;
    }
   }
   assert(played,'Could not reach a move through visible face controls');
  }
  await page.goto(base);await page.getByRole('button',{name:/^ギャラリー/}).click();await page.getByText('最初の一枚を、揃えよう。',{exact:true}).waitFor();assert.equal(await page.locator('dialog video').count(),0);await page.keyboard.press('Escape');assert.equal(await page.locator('dialog').count(),0);await page.evaluate(()=>new Promise(requestAnimationFrame));assert.match(await page.evaluate(()=>document.activeElement.textContent),/ギャラリー/);
  await start('hard');
  const bgm=page.getByRole('switch',{name:'BGM',exact:true});assert(await bgm.isEnabled());
  for(let i=0;i<2&&await page.locator('audio').evaluate(a=>a.paused);i++)await bgm.click();
  await page.waitForFunction(()=>{const a=document.querySelector('audio');return !a.paused&&a.readyState>=2&&a.currentTime>0;});
  assert(Math.abs(await page.locator('audio').evaluate(a=>a.duration)-147.6)<.05);
  for(const move of solution){await playMove(move);assert.equal(await page.locator('.victory').count(),0);assert.equal(await page.evaluate(()=>localStorage.getItem('cube-gallery-v1')),null);}
  assert.equal((await snapshot()).solved.length,6);assert.equal(await page.locator('.clear-choice-list button').count(),6);
  await page.screenshot({path:path.join(out,'confirm-'+width+'.png'),fullPage:true});
  await page.getByRole('button',{name:'ヨミでクリアを確定',exact:true}).click();await page.getByText('ヨミの面、完成。',{exact:true}).waitFor();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('cube-gallery-v1')));assert.deepEqual(saved.items,[{clan:'根の国',face:5,difficulty:'hard'}]);
  const won=(await snapshot()).pieces;await page.getByRole('button',{name:'獲得した作品を見る'}).click();
  await page.waitForFunction(()=>document.querySelector('audio').paused&&[...document.querySelectorAll('.face-video-source')].every(v=>v.paused));
  await page.getByRole('button',{name:'ヨミ・難・全身アニメを開く',exact:true}).click();assert.equal(await page.locator('dialog video').count(),1);
  await page.waitForFunction(()=>{const v=document.querySelector('dialog video');return v.readyState>=2&&!v.paused&&v.currentTime>.1;});
  assert.match(await page.locator('dialog video').getAttribute('src'),/nenokuni-yomi-hard\.mp4$/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);
  assert.equal(await page.locator('dialog').evaluate(d=>d.scrollWidth-d.clientWidth),0);
  await page.screenshot({path:path.join(out,'gallery-'+width+'.png'),fullPage:true});
  await page.getByRole('button',{name:'閉じて戻る',exact:true}).click();assert.equal(await page.locator('dialog video').count(),0);assert.deepEqual((await snapshot()).pieces,won);
  await page.reload();await page.getByRole('button',{name:/^ギャラリー/}).click();assert.equal(await page.locator('.gallery-card').count(),1);await page.getByLabel('難易度',{exact:true}).selectOption('easy');assert.equal(await page.locator('.gallery-card').count(),0);await page.keyboard.press('Escape');
  await start('easy','six');for(const move of solution)await playMove(move);await page.getByText('6人の絵、完成。',{exact:true}).waitFor();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('cube-gallery-v1')).items.length),7);
  await page.getByRole('switch',{name:'ダーク表示'}).click();await page.getByRole('button',{name:/^ギャラリー/}).click();
  await page.getByRole('button',{name:'シンラ・易・静止画を開く',exact:true}).click();assert.equal(await page.locator('dialog video').count(),0);
  await page.screenshot({path:path.join(out,'gallery-dark-'+width+'.png'),fullPage:true});
  await page.keyboard.press('Escape');
  if(width===390){
   await start('medium');await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='cube-gallery-v1')throw new DOMException('Storage denied','QuotaExceededError');return original.call(this,key,value);};});
   for(const move of solution)await playMove(move);await page.getByRole('button',{name:'シンラでクリアを確定',exact:true}).click();await page.getByText('シンラの面、完成。',{exact:true}).waitFor();
   await page.getByText(/このブラウザに獲得記録を保存できませんでした/).waitFor();
   await page.getByRole('button',{name:'獲得した作品を見る'}).click();await page.getByRole('button',{name:'シンラ・中・アニメを開く',exact:true}).click();
   await page.waitForFunction(()=>{const video=document.querySelector('dialog video');return video.readyState>=2&&!video.paused;});
   assert.match(await page.locator('dialog video').getAttribute('src'),/nenokuni-shinra-medium\.mp4$/);
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('cube-gallery-v1')).items.length),7);await page.keyboard.press('Escape');
  }
  results.push({width,confirmationOnly:true,allSixCandidates:true,exactChosenCharacterSaved:true,persistedOnReload:true,filtering:true,sixFaceCollection:true,oneVideoAtATime:true,bgm147_6seconds:true,backgroundPaused:true,boardPreserved:true,darkMode:true});await context.close();
 }
 const denied=await browser.newContext();await denied.addInitScript(()=>{Math.random=()=>0;const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='cube-gallery-v1')throw new DOMException('Storage denied','QuotaExceededError');return original.call(this,key,value);};});
 const page=await denied.newPage();await page.goto(base);await page.getByRole('button',{name:/^ギャラリー/}).click();await page.keyboard.press('Escape');
 // Storage failure behavior is verified at the state boundary by collection.test.ts;
 // this fresh context also verifies that denied storage does not break the title screen.
 assert.equal(await page.locator('.clan-list').count(),1);await denied.close();
 assert.deepEqual(errors,[]);assert.deepEqual(httpErrors,[]);
 fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({base,results,errors,httpErrors},null,2));console.log(JSON.stringify({base,results,errors,httpErrors},null,2));
}finally{await browser.close();}
