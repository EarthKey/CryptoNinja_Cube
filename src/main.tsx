import React,{useState,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {Scene} from './Scene';
import {Entry} from './Entry';
import {useGame} from './store';
import {solvedFaces,faces} from './model';
import './style.css';
import './selection.css';
import './layout.css';
import './play-layout.css';
import './size.css';
import './round.css';
import './theme.css';
import './face-view.css';
const faceRoman:Partial<Record<number,string>>={0:'SAKUYA',1:'XIAOLAN',2:'NEMU',3:'IZUNA',4:'UKA',5:'OTO'};
function App(){
 const s=useGame();
 const [playing,setPlaying]=useState(false);
 const [dark,setDark]=useState(()=>{try{return localStorage.getItem('cube-theme')==='dark';}catch{return false;}});
 useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'cream';try{localStorage.setItem('cube-theme',dark?'dark':'cream');}catch{}},[dark]);
 const complete=s.mode==='one'?Math.min(1,solvedFaces(s.pieces).length):solvedFaces(s.pieces).length;
 const direction=(key:string)=>window.dispatchEvent(new CustomEvent('cube-direction',{detail:key}));
 return <main>
 <header><a className="brand" href="https://earthkey.me/" target="_blank" rel="noreferrer">EARTHKEY / PLAY</a><span className="badge">CRYPTONINJA / CUBE</span></header>
 <section className="intro"><span className="eyebrow">ひと回しで、絵がつながる。</span><h1>CryptoNinja <em>Cube</em></h1><p>浮かぶピースを回して、6つの絵をひとつに。</p></section>
 {!playing?<Entry onStart={()=>{setPlaying(true);window.scrollTo(0,0);}}/>:<>
 <div className="game-menu"><span>甲賀 / 易 · {s.lastMix}手でスタート</span><button onClick={()=>{setPlaying(false);window.scrollTo(0,0);}}>← 条件を選び直す</button></div>
 <section className="play-area">
 <div className="theme-row"><span>画面の明るさ</span><div className="theme-choice"><span className={!dark?'theme-current':''}>クリーム</span><button className="theme-toggle" type="button" role="switch" aria-label="ダーク表示" aria-checked={dark} onClick={()=>setDark(!dark)}><span className="theme-thumb"/></button><span className={dark?'theme-current':''}>ダーク</span></div></div>
 <div className={'stage size-'+s.displaySize+(s.reduced?' motion-off':'')}><div className="stage-label">{faces[s.viewFace].name} <span>{faceRoman[s.viewFace]??'PLACEHOLDER'}</span></div>
 <div className="play-stats" aria-label="進行状況"><span>{s.mode==='one'?'操作':'回転'} <strong>{s.mode==='one'?s.playMoves:s.history.length}</strong></span><span>完成 <strong>{s.mode==='one'&&s.phase!=='playing'&&s.phase!=='won'?'—':complete}<small> / {s.mode==='one'?1:6}面</small></strong></span></div><Scene/><div className="shadow"/>
 {s.victory&&<div className="victory" role="status"><strong>{faces[s.victory.face].name}の面、完成。</strong><span>{s.playMoves}手でクリア · 位置と向きが揃いました</span><button onClick={()=>s.start(s.lastMix)}>もう一度遊ぶ</button></div>}
 {s.selection&&<div className="turn-guide" role="group" aria-label="選んだ列を回す">
 {([['w','↑','上へ'],['s','↓','下へ'],['a','←','左へ'],['d','→','右へ']] as const).map(([key,arrow,label])=><button key={key} className={'turn-cue cue-'+key} aria-label={'キューブを'+label} disabled={!!s.active} onPointerEnter={()=>useGame.setState({preview:key})} onPointerLeave={()=>useGame.setState({preview:null})} onFocus={()=>useGame.setState({preview:key})} onBlur={()=>useGame.setState({preview:null})} onClick={()=>direction(key)}><span className="cue-arrow">{arrow}</span><span className="cue-key">{key.toUpperCase()} <span>{label}</span></span></button>)}
 <span className="guide-caption">どちらへ回す？</span></div>}
 <div className="stage-bottom"><span>{s.victory?'完成した面だけを接合しています':s.mode==='one'&&s.phase==='ready'?'「3手だけ混ぜる」でスタート':s.moved&&complete===6&&!s.active?'完成 — ぴたり、とひとつに。':s.selection?'上下は赤・左右は緑':'マスを選ぶと、回転ボタンが現れます'}</span></div></div>
 <aside><div className="size-control" role="group" aria-label="キューブの表示サイズ"><span>キューブの大きさ</span><div>{([['small','小'],['medium','中'],['large','大']] as const).map(([value,label])=><button key={value} aria-pressed={s.displaySize===value} onClick={()=>useGame.setState({displaySize:value})}>{label}</button>)}</div></div>
 <div className="face-view" role="group" aria-label="見る面"><span>見る面</span><div>{([[0,'正面'],[4,'背面'],[3,'左面'],[1,'右面'],[2,'上面'],[5,'下面']] as const).map(([face,label])=><button key={face} aria-pressed={s.viewFace===face} disabled={!!s.active||s.phase==='won'} onClick={()=>s.setViewFace(face)}>{label}</button>)}</div><small>視点だけを変更します。配置・手数は変わりません。</small></div>
 <p className="notice" role="status">{s.notice}</p>
 <div className="actions"><button disabled={!!s.active||!s.history.length||s.phase==='won'} onClick={s.undo}>↶ 1手戻す</button><button disabled={!!s.active} onClick={()=>s.start(s.lastMix)}>同じ条件でやり直す</button></div>
 <details className="help"><summary>遊び方・操作のヒント</summary><div className="help-body"><h3>{s.selection?faces[s.selection.face].name+'のマスを選択中':'まずはマスを選択'}</h3><p>PC：マスをクリックして W A S D。<br/>スマホ：マスの少し外側からでも、長押ししてスワイプできます。<br/>表示された矢印ボタンでも回せます。</p><p>キューブに沿った光る外枠の内側をドラッグすると、全体を眺められます。<br/>別の列を回すときは、マスを選び直します。</p><p>{s.mode==='one'?'どの面でも、1面の位置と向きが揃えばクリア。':'位置と向きが6面とも揃うと完成。'}<br/>まずは3手だけ混ぜて、1手ずつ戻してみてください。</p></div></details>
 <details><summary>表示を調整</summary><label>ピースの隙間<input aria-label="ピースの隙間" type="range" min=".04" max=".22" step=".01" value={s.gap} onChange={e=>useGame.setState({gap:Number(e.target.value)})}/></label><label><input type="checkbox" checked={s.reduced} onChange={e=>useGame.setState({reduced:e.target.checked})}/> 浮遊を止める・動きを抑える</label><button onClick={()=>useGame.setState({resetView:s.resetView+1})}>見る角度を戻す</button></details>
 </aside></section></>}
 <footer className="site-footer"><span>CryptoNinja Cube <small>制作：アースキー</small></span><nav aria-label="関連サイト"><a href="https://www.ninja-dao.com/" target="_blank" rel="noopener noreferrer">NinjaDAO 公式サイト ↗</a><a href="https://earthkey.me/" target="_blank" rel="noopener noreferrer">アースキーのLP ↗</a></nav></footer>
 </main>;
}
createRoot(document.getElementById('root')!).render(<App/>);
