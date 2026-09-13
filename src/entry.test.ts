import {it,expect} from 'vitest';
import {useGame} from './store';
import {solvedFaces} from './model';
it('starts scrambled immediately with no queued animation or undoable shuffle',()=>{
 for(const mode of ['one','six'] as const){useGame.getState().setMode(mode);expect(useGame.getState().start(12)).toBe(true);const s=useGame.getState();expect(s.phase).toBe('playing');expect(s.active).toBeNull();expect(s.pending).toEqual([]);expect(s.history).toEqual([]);expect(s.playMoves).toBe(0);expect(solvedFaces(s.pieces)).toEqual([]);expect(s.lastMix).toBe(12);}
});
it('rejects invalid counts without replacing the board',()=>{const before=useGame.getState().pieces;expect(useGame.getState().start(2)).toBe(false);expect(useGame.getState().pieces).toBe(before);});
