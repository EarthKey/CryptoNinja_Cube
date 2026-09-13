import {useEffect,useRef,useState} from 'react';
import {Scene} from './Scene';
import {useGame} from './store';
import './entry.css';

export function Entry({onStart}:{onStart:()=>void}){
 const [step,setStep]=useState(0),[clan,setClan]=useState('甲賀'),[count,setCount]=useState(String(useGame.getState().lastMix));
 const heading=useRef<HTMLHeadingElement>(null),game=useGame();
 useEffect(()=>{game.reset();},[]);
 useEffect(()=>{heading.current?.focus();},[step]);
 const valid=Number.isInteger(Number(count))&&Number(count)>=3&&Number(count)<=30;
 return <section className="entry" aria-label="ゲームの準備">
 <nav className="entry-progress" aria-label="開始までの手順">{['クラン','難易度','混ぜる回数'].map((label,i)=><span key={label} aria-current={step===i?'step':undefined}>{i+1} / {label}</span>)}</nav>
 {step>0&&<button className="entry-back" onClick={()=>setStep(step-1)}>← 戻る</button>}
 <h2 tabIndex={-1} ref={heading}>{['どのクランで遊ぶ？','どれに挑戦する？','何手混ぜる？'][step]}</h2>
 {step===0?<div className="clan-layout"><div><div className="entry-preview" aria-label="甲賀の完成キューブの見本"><Scene/></div><p className="entry-caption">甲賀の六人。ひと回しで、絵がつながる。</p></div><div className="clan-list">{['甲賀','伊賀','風魔','雑賀','根の国'].map(name=><button key={name} aria-pressed={clan===name} onClick={()=>setClan(name)}><strong>{name}</strong><span>{name==='甲賀'?'静止画で遊べます':'準備中'}</span></button>)}<p className="entry-note">{clan==='甲賀'?'咲耶・シャオラン・ネム・イズナ・ウカ・オト':'このクランの完成キューブは準備中です。左の見本は甲賀です。'}</p><button className="entry-primary" onClick={()=>setStep(1)}>{clan}を選ぶ →</button></div></div>:null}
 {step===1?<><p className="entry-caption">{clan} / 絵の動きを選ぼう</p><div className="difficulty-list">{[['易','静止した顔の絵を揃えよう。','easy'],['中','瞬きや髪の揺れを見ながら揃えよう。','medium'],['難','全身と背景が動く絵を揃えよう。','hard']].map(([label,description,tone],i)=><button className={tone} key={label} disabled={clan!=='甲賀'||i!==0} onClick={()=>setStep(2)}><b>{label}</b><span>{description}<small>{clan!=='甲賀'||i!==0?'準備中':'挑戦する →'}</small></span></button>)}</div><p className="entry-note">完成したステージは、クリア条件なしで自由に選べます。</p></>:null}
 {step===2?<form className="entry-count" onSubmit={e=>{e.preventDefault();if(valid&&game.start(Number(count)))onStart();}}><p className="entry-caption">{clan} / 易・静止画</p><div className="count-presets">{[3,6,12,24].map(n=><button type="button" aria-pressed={Number(count)===n} key={n} onClick={()=>setCount(String(n))}>{n}手</button>)}</div><label htmlFor="entry-count">混ぜる回数 <input id="entry-count" type="number" min="3" max="30" required step="1" value={count} onChange={e=>setCount(e.target.value)} aria-describedby="count-note"/> 手</label><p id="count-note" className="entry-note">3〜30手。混ぜる回数です。クリアまでの手数ではありません。</p><fieldset><legend>クリア条件</legend>{(['one','six'] as const).map(mode=><label key={mode}><input type="radio" name="goal" checked={game.mode===mode} onChange={()=>game.setMode(mode)}/>{mode==='one'?'どれか1面':'6面すべて'}</label>)}</fieldset><button className="entry-primary" disabled={!valid}>挑戦する →</button><p className="entry-note">混ざった状態から、すぐに遊べます。</p><p role="status">{game.notice.includes('指定')||game.notice.includes('作れません')?game.notice:''}</p></form>:null}
 </section>;
}
