import {useEffect,useRef,useState} from 'react';
import {clanFaceNames,clanRoman,difficultyLabel,type Clan,type Difficulty} from './store';
import {useCollection,collectionId,type CollectedFace} from './collection';
import {getFaceMedia} from './media';
import './gallery.css';
export function Gallery({onClose,reduced}:{onClose:()=>void;reduced:boolean}){
 const dialog=useRef<HTMLDialogElement>(null),video=useRef<HTMLVideoElement>(null);
 const {items,warning}=useCollection();
 const [clan,setClan]=useState<Clan|'all'>('all'),[difficulty,setDifficulty]=useState<Difficulty|'all'>('all');
 const [selected,setSelected]=useState<CollectedFace|null>(null),[mediaError,setMediaError]=useState(false),[videoPlaying,setVideoPlaying]=useState(false);
 useEffect(()=>{const el=dialog.current!;el.showModal();const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{el.close();document.body.style.overflow=old;};},[]);
 useEffect(()=>{const current=video.current;return()=>{if(current){current.pause();current.removeAttribute('src');current.load();}};},[selected]);
 const visible=items.filter(item=>(clan==='all'||item.clan===clan)&&(difficulty==='all'||item.difficulty===difficulty)).sort((a,b)=>Object.keys(clanFaceNames).indexOf(a.clan)-Object.keys(clanFaceNames).indexOf(b.clan)||a.face-b.face||['easy','medium','hard'].indexOf(a.difficulty)-['easy','medium','hard'].indexOf(b.difficulty));
 const media=selected?getFaceMedia(selected.clan,selected.face,selected.difficulty):null;
 const select=(item:CollectedFace)=>{setMediaError(false);if(selected&&collectionId(selected)===collectionId(item)&&video.current){video.current.load();if(!reduced)void video.current.play().catch(()=>{});}setSelected(item);};
 const total=Object.values(clanFaceNames).reduce((sum,names)=>sum+names.length*3,0);
 return <dialog className="gallery-dialog" ref={dialog} onCancel={event=>{event.preventDefault();onClose();}} aria-labelledby="gallery-title">
 <div className="gallery-heading"><div><span className="gallery-eyebrow">COLLECTION / 絵の記録</span><h2 id="gallery-title">ギャラリー <small>{items.length} / {total}</small></h2></div><button autoFocus onClick={onClose}>閉じて戻る</button></div>
 <p className="gallery-lead">揃えた一枚を、好きなときに。クリアを確定したキャラの画像と動画が並びます。</p>
 <p className="gallery-storage">獲得記録はこの端末・ブラウザに保存されます。ブラウザの保存データを消すと記録も消えます。</p>
 {warning&&<p className="collection-warning" role="alert">{warning}</p>}
 <div className="gallery-filters"><label>クラン<select aria-label="クラン" value={clan} onChange={event=>{setClan(event.target.value as Clan|'all');setSelected(null);}}><option value="all">すべてのクラン</option>{(Object.keys(clanFaceNames) as Clan[]).map(name=><option key={name}>{name}</option>)}</select></label><label>難易度<select aria-label="難易度" value={difficulty} onChange={event=>{setDifficulty(event.target.value as Difficulty|'all');setSelected(null);}}><option value="all">すべての難易度</option>{(['easy','medium','hard'] as const).map(value=><option key={value} value={value}>{difficultyLabel[value]}</option>)}</select></label><span aria-live="polite">{visible.length}点</span></div>
 {selected&&media&&<section className="gallery-viewer" aria-label={clanFaceNames[selected.clan][selected.face]+'の鑑賞'}>
 <div className="gallery-art">{media.video?<video key={collectionId(selected)} ref={video} src={media.video} poster={media.image} controls={!media.flipX} onPlay={()=>setVideoPlaying(true)} onPause={()=>setVideoPlaying(false)} muted loop={!media.once} playsInline preload="none" autoPlay={!reduced} style={media.flipX?{transform:'scaleX(-1)'}:undefined} onError={()=>setMediaError(true)}/>:<img src={media.image} alt={clanFaceNames[selected.clan][selected.face]} style={media.flipX?{transform:'scaleX(-1)'}:undefined} onError={()=>setMediaError(true)}/>}</div>
 <div className="gallery-caption"><span className="gallery-eyebrow">{clanRoman[selected.clan]}</span><h3>{clanFaceNames[selected.clan][selected.face]}</h3><p>{selected.clan} / {difficultyLabel[selected.difficulty]}</p>{media.video&&media.flipX&&<button onClick={()=>{const el=video.current;if(el){if(el.paused)void el.play().catch(()=>setMediaError(true));else el.pause();}}}>{videoPlaying?'動画を一時停止':'動画を再生'}</button>}<button onClick={()=>setSelected(null)}>拡大を閉じる</button>{mediaError&&<p role="alert">画像・動画を読み込めませんでした。接続を確認して、もう一度選んでください。</p>}</div></section>}
 {visible.length?<div className="gallery-grid">{visible.map(item=>{const image=getFaceMedia(item.clan,item.face,item.difficulty)!;const name=clanFaceNames[item.clan][item.face];return <button className="gallery-card" key={collectionId(item)} aria-label={name+'・'+difficultyLabel[item.difficulty]+'を開く'} aria-pressed={!!selected&&collectionId(selected)===collectionId(item)} onClick={()=>select(item)}><span className="gallery-thumbnail"><img src={image.image} alt="" loading="lazy" width="320" height="320" style={image.flipX?{transform:'scaleX(-1)'}:undefined}/>{image.video&&<span className="gallery-motion">動画</span>}</span><span className="gallery-card-text"><strong>{name}</strong><small>{item.clan} / {difficultyLabel[item.difficulty]}</small></span></button>;})}</div>:<div className="gallery-empty"><span aria-hidden="true">◇</span><h3>{items.length?'この条件の作品はまだありません':'最初の一枚を、揃えよう。'}</h3><p>1面を揃えて「このキャラでクリア」を押すと、ここに追加されます。<br/>6面すべてを揃えると、その難易度の6人が追加されます。</p><button onClick={onClose}>ゲームに戻る</button></div>}
 </dialog>;
}
