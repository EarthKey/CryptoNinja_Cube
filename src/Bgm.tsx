import {useCallback,useEffect,useRef,useState} from 'react';
import {scheduleBgmReplay} from './bgm-loop';
import {useGame,type Clan} from './store';

const bgmByClan:Partial<Record<Clan,string>>={甲賀:'koga',伊賀:'iga',風魔:'fuma',雑賀:'saika'};

export function Bgm(){
 const clan=useGame(state=>state.clan);
 const source=bgmByClan[clan];
 const available=!!source;
 const audio=useRef<HTMLAudioElement>(null);
 const timer=useRef<number|null>(null);
 const [enabled,setEnabled]=useState(()=>{try{return localStorage.getItem('cube-bgm')!=='off';}catch{return true;}});
 const [waiting,setWaiting]=useState(false);
 const [needsStart,setNeedsStart]=useState(false);
 const clearTimer=useCallback(()=>{if(timer.current!==null){window.clearTimeout(timer.current);timer.current=null;}setWaiting(false);},[]);
 const playNow=useCallback(()=>{const el=audio.current;if(!el)return;if(el.ended)el.currentTime=0;void el.play().then(()=>setNeedsStart(false)).catch(()=>setNeedsStart(true));},[]);
 useEffect(()=>{
  const el=audio.current;if(!el)return;
  el.volume=.32;
  if(enabled&&available)playNow();else{clearTimer();el.pause();}
  try{localStorage.setItem('cube-bgm',enabled?'on':'off');}catch{}
  return ()=>clearTimer();
 },[enabled,available,source,playNow,clearTimer]);
 useEffect(()=>()=>{clearTimer();audio.current?.pause();},[clearTimer]);
 const ended=()=>{if(!enabled)return;setWaiting(true);timer.current=scheduleBgmReplay(()=>{timer.current=null;setWaiting(false);if(audio.current)audio.current.currentTime=0;playNow();},window.setTimeout);};
 const toggle=()=>{if(!available)return;if(needsStart){playNow();return;}setEnabled(value=>!value);};
 const label=!available?'BGM準備中':needsStart?'BGMを再生':enabled?'BGM ON':'BGM OFF';
 return <div className="bgm-choice">
  <audio key={clan} ref={audio} preload="auto" onEnded={ended}>
   {source&&<source src={`/assets/${source}-bgm.m4a`} type="audio/mp4"/>}
   {source&&<source src={`/assets/${source}-bgm.ogg`} type="audio/ogg"/>}
  </audio>
  <span>音楽</span><button type="button" role="switch" aria-label="BGM" aria-checked={available&&enabled&&!needsStart} disabled={!available} onClick={toggle}>{label}</button>
  <small>{available?(waiting?'3秒休止中':'曲間3秒'):'このクランのBGMは準備中'}</small>
 </div>;
}
