import {it,expect,beforeEach,vi} from 'vitest';
import {useCollection} from './collection';
import {prepareRound,firstVictory,completedVictories} from './round';
import {useGame} from './store';
import {fresh,turn,inverse,solvedFaces} from './model';
it('3 and 12 moves start with no completed face, even constant random',()=>{
 for(const n of [3,12])for(let i=0;i<20;i++){const moves=prepareRound(n,i===0?()=>0:Math.random);expect(moves).toHaveLength(n);expect(solvedFaces(moves.reduce(turn,fresh()))).toHaveLength(0);}
});
beforeEach(()=>{const saved=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>saved.get(k)||null,setItem:(k:string,v:string)=>saved.set(k,v)});useCollection.setState({items:[],warning:''});useGame.setState({suspended:false});useGame.getState().setSize(3);useGame.getState().setDifficulty('easy');useGame.getState().setClan('甲賀');});
it('keeps playing after an incidental completed face, then confirms the chosen character',()=>{
 const g=useGame;g.getState().setMode('one');g.getState().mix(3);while(g.getState().active)g.getState().finish();
 for(let i=0;i<2;i++){g.getState().undo();g.getState().finish();}
 expect(completedVictories(g.getState().pieces).length).toBeGreaterThan(0);
 expect(g.getState().phase).toBe('playing');expect(g.getState().victory).toBeNull();expect(useCollection.getState().items).toEqual([]);
 // Continuing to undo is still possible, even after a face has been completed.
 g.getState().undo();expect(g.getState().active).not.toBeNull();g.getState().finish();
 expect(completedVictories(g.getState().pieces)).toHaveLength(6);
 const chosen=completedVictories(g.getState().pieces).at(-1)!.face;
 expect(g.getState().confirmVictory(chosen)).toBe(true);expect(g.getState().victory?.face).toBe(chosen);expect(g.getState().phase).toBe('won');
 expect(useCollection.getState().items).toEqual([{clan:'甲賀',face:chosen,difficulty:'easy'}]);
 g.getState().move({axis:0,layer:1,dir:1});g.getState().undo();expect(g.getState().active).toBeNull();
 expect(g.getState().confirmVictory(chosen)).toBe(false);expect(useCollection.getState().items).toHaveLength(1);
});
it('rejects confirmation during turns, after a face is broken, and while the gallery is open',()=>{
 const g=useGame;g.getState().setMode('one');g.setState({phase:'playing',pieces:fresh()});
 g.setState({suspended:true});expect(g.getState().confirmVictory(0)).toBe(false);g.setState({suspended:false});
 g.getState().move({axis:0,layer:1,dir:1});expect(g.getState().confirmVictory(0)).toBe(false);g.getState().finish();
 expect(completedVictories(g.getState().pieces).some(v=>v.face===0)).toBe(false);expect(g.getState().confirmVictory(0)).toBe(false);
 expect(g.getState().confirmVictory(NaN)).toBe(false);expect(useCollection.getState().items).toEqual([]);
});
it('collects all six only after a started six-face round is fully solved',()=>{
 const g=useGame,m={axis:0 as const,layer:1,dir:1 as const};g.getState().setMode('six');
 g.setState({phase:'playing',pieces:turn(fresh(),m),history:[m],playMoves:1});
 g.getState().undo();g.getState().finish();expect(g.getState().phase).toBe('won');expect(useCollection.getState().items).toHaveLength(6);
 expect(new Set(useCollection.getState().items.map(item=>item.face)).size).toBe(6);
 g.getState().reset();expect(useCollection.getState().items).toHaveLength(6);
});
it('all moves can be manually inverted and firstVictory agrees with exact solved faces',()=>{
 const moves=prepareRound(3);let p=moves.reduce(turn,fresh());expect(firstVictory(p)).toBeNull();for(const m of [...moves].reverse()){p=turn(p,inverse(m));expect(!!firstVictory(p)).toBe(solvedFaces(p).length>0);}
});
it('six-face free manipulation remains available',()=>{
 useGame.getState().setMode('six');useGame.getState().move({axis:0,layer:1,dir:1});useGame.getState().finish();expect(useGame.getState().victory).toBeNull();useGame.getState().undo();useGame.getState().finish();expect(solvedFaces(useGame.getState().pieces)).toHaveLength(6);
});
