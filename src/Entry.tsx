import {useEffect,useRef,useState} from 'react';
import {Scene} from './Scene';
import {useGame,difficultyLabel,type Clan} from './store';
import './entry.css';

export function Entry({onStart}:{onStart:()=>void}){
 const [step,setStep]=useState(0),[clan,setClan]=useState<Clan>('甲賀'),[count,setCount]=useState(String(useGame.getState().lastMix));
 const heading=useRef<HTMLHeadingElement>(null),game=useGame();
 useEffect(()=>{game.reset();},[]);
 useEffect(()=>{heading.current?.focus();},[step]);
 const valid=Number.isInteger(Number(count))&&Number(count)>=3&&Number(count)<=30;
 return <section className="entry" aria-label="ゲームの準備">
 <nav className="entry-progress" aria-label="開始までの手順">{['クラン','難易度','混ぜる回数'].map((label,i)=><span key={label} aria-current={step===i?'step':undefined}>{i+1} / {label}</span>)}</nav>
 {step>0&&<button className="entry-back" onClick={()=>setStep(step-1)}>← 戻る</button>}
 <h2 tabIndex={-1} ref={heading}>{['どのクランで遊ぶ？','どれに挑戦する？','何手混ぜる？'][step]}</h2>
 {step===0?<div className="clan-layout"><div><div className="entry-preview" aria-label="甲賀の完成キューブの見本"><Scene preview/></div><p className="entry-caption">甲賀の六人。ひと回しで、絵がつながる。</p></div><div className="clan-list"><button className="entry-kids" onClick={()=>{if(game.startForChildren())onStart();}}><strong>すぐ遊ぶ</strong><span>はじめての人・小さなお子さん向け。大きな4つのパネルを揃えるだけ。<small>選ばずにこのまま始める →</small></span></button>{(['甲賀','伊賀','風魔','雑賀','根の国'] as const).map(name=>{const ready=name==='甲賀'||name==='伊賀';return <button key={name} aria-pressed={clan===name} disabled={!ready} onClick={()=>{if(ready){setClan(name);game.setClan(name);setStep(1);}}}><strong>{name}</strong><span>{name==='甲賀'?'静止画・アニメ・全身アニメで遊べます':name==='伊賀'?'静止画・アニメで遊べます':'準備中'}</span></button>;})}<p className="entry-note">{clan==='甲賀'?'咲耶・シャオラン・ネム・イズナ・ウカ・オト':clan==='伊賀'?'餡音・酉花・ハヤテ・結・紫苑・石舟斎':'このクランの完成キューブは準備中です。左の見本は甲賀です。'}</p></div></div>:null}
 {step===1?<><p className="entry-caption">{clan} / 絵の動きを選ぼう</p><div className="difficulty-list">{([['易','静止した顔の絵を揃えよう。','easy'],['中','6人の表情や髪が動く絵を揃えよう。','medium'],['難','全身と背景が動く絵を揃えよう。','hard']] as const).map(([label,description,tone])=>{const ready=clan==='甲賀'||clan==='伊賀'&&(tone==='easy'||tone==='medium');return <button className={tone} key={label} disabled={!ready} onClick={()=>{game.setClan(clan);game.setDifficulty(tone);setStep(2);}}><b>{label}</b><span>{description}<small>{ready?'挑戦する →':'準備中'}</small></span></button>;})}</div><p className="entry-note">完成したステージは、クリア条件なしで自由に選べます。</p></>:null}
 {step===2?<form className="entry-count" onSubmit={e=>{e.preventDefault();if(!valid)return;game.setSize(3);if(game.start(Number(count)))onStart();}}><p className="entry-caption">{clan} / {difficultyLabel[game.difficulty]}</p><div className="count-presets">{[3,6,12,24].map(n=><button type="button" aria-pressed={Number(count)===n} key={n} onClick={()=>setCount(String(n))}>{n}手</button>)}</div><label htmlFor="entry-count">混ぜる回数 <input id="entry-count" type="number" min="3" max="30" required step="1" value={count} onChange={e=>setCount(e.target.value)} aria-describedby="count-note"/> 手</label><p id="count-note" className="entry-note">3〜30手。混ぜる回数です。クリアまでの手数ではありません。</p><fieldset><legend>クリア条件</legend>{(['one','six'] as const).map(mode=><label key={mode}><input type="radio" name="goal" checked={game.mode===mode} onChange={()=>game.setMode(mode)}/>{mode==='one'?'どれか1面':'6面すべて'}</label>)}</fieldset><button className="entry-primary" disabled={!valid}>挑戦する →</button><p className="entry-note">混ざった状態から、すぐに遊べます。</p><p role="status">{game.notice.includes('指定')||game.notice.includes('作れません')?game.notice:''}</p></form>:null}
 </section>;
}
