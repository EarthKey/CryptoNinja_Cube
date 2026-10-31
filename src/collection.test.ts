import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {COLLECTION_KEY,parseCollection,useCollection} from './collection';
const item={clan:'根の国' as const,face:2,difficulty:'hard' as const};
let saved:Map<string,string>;
beforeEach(()=>{saved=new Map();vi.stubGlobal('localStorage',{getItem:(key:string)=>saved.get(key)||null,setItem:(key:string,value:string)=>saved.set(key,value)});useCollection.setState({items:[],warning:''});});
afterEach(()=>vi.unstubAllGlobals());
it('saves only collection identities, restores them, and never duplicates a win',()=>{
 useCollection.getState().unlock([item,item]);useCollection.getState().unlock([item]);expect(useCollection.getState().items).toEqual([item]);
 const raw=saved.get(COLLECTION_KEY)!;expect(raw).not.toContain('/assets/');useCollection.setState({items:[]});useCollection.getState().refresh();expect(useCollection.getState().items).toEqual([item]);
});
it('keeps difficulties and characters separate and merges progress written by another tab',()=>{
 useCollection.getState().unlock([item]);saved.set(COLLECTION_KEY,JSON.stringify({version:1,items:[{...item,difficulty:'easy'}]}));
 useCollection.getState().unlock([{...item,face:3}]);expect(useCollection.getState().items).toHaveLength(3);
});
it('ignores corrupt, unknown-version, and invalid records without accepting injected media',()=>{
 for(const raw of [null,'{','{}','{"version":2,"items":[]}'])expect(parseCollection(raw)).toEqual([]);
 const items=[null,{...item,clan:'__proto__'},{...item,face:1.5},{...item,face:6},{...item,difficulty:'evil'}, {...item,video:'https://example.invalid/secret'}];
 expect(parseCollection(JSON.stringify({version:1,items}))).toEqual([item]);
});
it('still completes a win in memory when browser storage is denied',()=>{
 vi.stubGlobal('localStorage',{getItem:()=>{throw Error('denied');},setItem:()=>{throw Error('quota');}});
 expect(()=>useCollection.getState().unlock([item])).not.toThrow();expect(useCollection.getState().items).toEqual([item]);expect(useCollection.getState().warning).toContain('保存できません');
});
