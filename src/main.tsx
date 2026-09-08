import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Scene} from './Scene';
import {useGame} from './store';
import {solvedFaces,faces} from './model';
import './style.css';
import './selection.css';
import './layout.css';
import './play-layout.css';
import './size.css';
import './round.css';
function App(){
 const s=useGame(),[image,setImage]=useState(false);
 const complete=s.mode==='one'?Math.min(1,solvedFaces(s.pieces).length):solvedFaces(s.pieces).length;
 const direction=(key:string)=>window.dispatchEvent(new CustomEvent('cube-direction',{detail:key}));
 return <main>
 <header><a className="brand" href="https://earthkey.me/" target="_blank" rel="noreferrer">EARTHKEY / PLAY</a><span className="badge">LOCAL PROTOTYPE · 01</span></header>
 <section className="intro"><span className="eyebrow">ひと回しで、絵がつながる。</span><h1>CryptoNinja <em>Cube</em></h1><p>浮かぶピースを回して、咲耶をひとつに。</p></section>
 <section className="play-area">
 <div className="mode-switch" role="group" aria-label="クリア条件"><span>クリア条件</span><button aria-pressed={s.mode==='one'} onClick={()=>s.setMode('one')}>1面完成</button><button aria-pressed={s.mode==='six'} onClick={()=>s.setMode('six')}>6面完成</button></div>
 <div className={'stage size-'+s.displaySize+(s.reduced?' motion-off':'')}><div className="stage-label">咲耶 <span>SAKUYA</span></div>
 <div className="play-stats" aria-label="進行状況"><span>{s.mode==='one'?'操作':'回転'} <strong>{s.mode==='one'?s.playMoves:s.history.length}</strong></span><span>完成 <strong>{s.mode==='one'&&s.phase!=='playing'&&s.phase!=='won'?'—':complete}<small> / {s.mode==='one'?1:6}面</small></strong></span></div><Scene/><div className="shadow"/>
 {s.victory&&<div className="victory" role="status"><strong>{faces[s.victory.face].name}の面、完成。</strong><span>{s.playMoves}手でクリア · 位置と向きが揃いました</span><button onClick={()=>s.mix(s.lastMix)}>もう一度遊ぶ</button></div>}
 {s.selection&&<div className="turn-guide" role="group" aria-label="選んだ列を回す">
 {([['w','↑','上へ'],['s','↓','下へ'],['a','←','左へ'],['d','→','右へ']] as const).map(([key,arrow,label])=><button key={key} className={'turn-cue cue-'+key} aria-label={'キューブを'+label} disabled={!!s.active} onPointerEnter={()=>useGame.setState({preview:key})} onPointerLeave={()=>useGame.setState({preview:null})} onFocus={()=>useGame.setState({preview:key})} onBlur={()=>useGame.setState({preview:null})} onClick={()=>direction(key)}><span className="cue-arrow">{arrow}</span><span className="cue-key">{key.toUpperCase()} <span>{label}</span></span></button>)}
 <span className="guide-caption">どちらへ回す？</span></div>}
 <div className="stage-bottom"><span>{s.victory?'完成した面だけを接合しています':s.mode==='one'&&s.phase==='ready'?'「3手だけ混ぜる」でスタート':s.moved&&complete===6&&!s.active?'完成 — ぴたり、とひとつに。':s.selection?'上下は赤・左右は緑':'マスを選ぶと、回転ボタンが現れます'}</span></div></div>
 <aside><div className="size-control" role="group" aria-label="キューブの表示サイズ"><span>キューブの大きさ</span><div>{([['small','小'],['medium','中'],['large','大']] as const).map(([value,label])=><button key={value} aria-pressed={s.displaySize===value} onClick={()=>useGame.setState({displaySize:value})}>{label}</button>)}</div></div><div className="chapter">PLAY / まずは3手から</div>
 <p className="notice" role="status">{s.notice}</p>
 <div className="mix"><button className="primary" disabled={!!s.active} onClick={()=>s.mix(3)}>3手だけ混ぜる <span>↗</span></button><button disabled={!!s.active} onClick={()=>s.mix(12)}>12手</button></div>
 <div className="actions"><button disabled={!!s.active||!s.history.length||s.phase==='won'} onClick={s.undo}>↶ 1手戻す</button><button onClick={s.reset}>最初に戻す</button></div>
 <details className="help"><summary>遊び方・操作のヒント</summary><div className="help-body"><h3>{s.selection?faces[s.selection.face].name+'のマスを選択中':'まずはマスを選択'}</h3><p>PC：マスをクリックして W A S D。<br/>スマホ：マスを長押ししてスワイプ。<br/>表示された矢印ボタンでも回せます。</p><p>余白ドラッグで全体を眺められます。<br/>別の列を回すときは、マスを選び直します。</p><p>{s.mode==='one'?'どの面でも、1面の位置と向きが揃えばクリア。':'位置と向きが6面とも揃うと完成。'}<br/>まずは3手だけ混ぜて、1手ずつ戻してみてください。</p></div></details>
 <details><summary>表示を調整</summary><label>ピースの隙間<input aria-label="ピースの隙間" type="range" min=".04" max=".22" step=".01" value={s.gap} onChange={e=>useGame.setState({gap:Number(e.target.value)})}/></label><label><input type="checkbox" checked={s.reduced} onChange={e=>useGame.setState({reduced:e.target.checked})}/> 浮遊を止める・動きを抑える</label><button onClick={()=>useGame.setState({resetView:s.resetView+1})}>見る角度を戻す</button></details>
 <button className="portrait-link" onClick={()=>setImage(true)}>採用イラストを見る ↗</button>
 <details className="diagnostics"><summary>試作について・開発情報</summary><p>咲耶1面＋仮タイル5面。ギャラリー・ランキング・動画は未実装です。</p><span id="render-info"/></details>
 </aside></section>
 <footer><span>咲耶の採用原画を左右反転して使用</span><span>ギャラリー・ランキング・動画は次の工程</span></footer>
 {image&&<div className="modal" role="dialog" aria-modal="true" aria-label="咲耶の採用イラスト" onClick={()=>setImage(false)} onKeyDown={e=>{if(e.key==='Escape')setImage(false);}}><button autoFocus onClick={()=>setImage(false)}>閉じる ×</button><img src="/assets/sakuya.png" alt="左右反転した咲耶の採用イラスト" style={{transform:'scaleX(-1)'}}/></div>}
 </main>;
}
createRoot(document.getElementById('root')!).render(<App/>);
