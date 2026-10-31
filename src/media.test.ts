import {it,expect} from 'vitest';
import {faceMediaByClan,getFaceMedia} from './media';
import {clanFaceNames,type Clan} from './store';
it('resolves all ninety difficulty-specific assets for the cube and collection',()=>{
 for(const clan of Object.keys(clanFaceNames) as Clan[])for(let face=0;face<6;face++)for(const difficulty of ['easy','medium','hard'] as const){
  const media=getFaceMedia(clan,face,difficulty)!;expect(media).toBeDefined();expect(media.image).toMatch(/^\/assets\/.+\.(png|webp)$/);
  if(difficulty==='easy')expect(media.video).toBeUndefined();else{expect(media.video).toBeTruthy();expect(media.video).toMatch(/^\/assets\/.+\.mp4$/);if(difficulty==='hard')expect(media.video).not.toBe(getFaceMedia(clan,face,'medium')?.video);}
 }
});
it('uses medium-specific posters and keeps stage-one mirroring out of hard videos',()=>{
 expect(getFaceMedia('根の国',0,'medium')?.image).toBe(faceMediaByClan['根の国'][0]?.mediumImage);
 expect(getFaceMedia('甲賀',0,'easy')?.flipX).toBe(true);expect(getFaceMedia('甲賀',0,'hard')?.flipX).not.toBe(true);
});
