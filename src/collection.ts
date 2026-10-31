import {create} from 'zustand';
import {faceMediaByClan,getFaceMedia} from './media';
import type {Clan,Difficulty} from './store';
export type CollectedFace={clan:Clan;face:number;difficulty:Difficulty};
export const COLLECTION_KEY='cube-gallery-v1';
export const collectionId=(item:CollectedFace)=>`${item.clan}:${item.difficulty}:${item.face}`;
export function parseCollection(raw:string|null):CollectedFace[]{
 try{
  const data=JSON.parse(raw||'null');if(data?.version!==1||!Array.isArray(data.items))return [];
  const found=new Map<string,CollectedFace>();
  for(const item of data.items.slice(0,1000)){
   if(!item||!Object.hasOwn(faceMediaByClan,item.clan)||!Number.isInteger(item.face)||item.face<0||item.face>5||!['easy','medium','hard'].includes(item.difficulty))continue;
   if(!getFaceMedia(item.clan,item.face,item.difficulty))continue;
   const clean:CollectedFace={clan:item.clan,face:item.face,difficulty:item.difficulty};found.set(collectionId(clean),clean);
  }
  return [...found.values()];
 }catch{return [];}
}
function readSaved(){try{return parseCollection(localStorage.getItem(COLLECTION_KEY));}catch{return [];}}
const merge=(...groups:CollectedFace[][])=>[...new Map(groups.flat().map(item=>[collectionId(item),item])).values()];
type CollectionState={items:CollectedFace[];warning:string;unlock:(items:CollectedFace[])=>void;refresh:()=>void};
export const useCollection=create<CollectionState>((set,get)=>({
 items:readSaved(),warning:'',
 unlock:items=>{
  const valid=parseCollection(JSON.stringify({version:1,items}));
  const next=merge(readSaved(),get().items,valid);let warning='';
  try{localStorage.setItem(COLLECTION_KEY,JSON.stringify({version:1,items:next}));}
  catch{warning='このブラウザに獲得記録を保存できませんでした。この画面を閉じると失われる場合があります。';}
  set({items:next,warning});
 },
 refresh:()=>set({items:merge(get().items,readSaved())}),
}));
