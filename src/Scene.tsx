import {useEffect,useRef} from 'react';
import * as T from 'three';
import {useGame} from './store';
import {captureControls,type Controls} from './controls';
import {stickers,faces,transform,solvedFaces,type Move,type Axis,type Vec} from './model';

export function Scene(){
 const host=useRef<HTMLDivElement>(null);
 useEffect(()=>{
 const el=host.current!; let renderer:T.WebGLRenderer;
 try{renderer=new T.WebGLRenderer({antialias:true,alpha:true});}catch{el.textContent='WebGLを利用できません。ChromeまたはEdgeでお試しください。';return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.outputColorSpace=T.SRGBColorSpace;
 el.appendChild(renderer.domElement);const canvas=renderer.domElement;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(37,1,.1,100); camera.position.z=9;
 const root=new T.Group();scene.add(root);
 const initial=()=>root.quaternion.setFromEuler(new T.Euler(-.30,.48,0));
 initial();
 scene.add(new T.HemisphereLight(0xffffff,0xb1a19a,2.5));
 const light=new T.DirectionalLight(0xffffff,3);light.position.set(3,5,7);scene.add(light);
 const bodyGeo=new T.BoxGeometry(.985,.985,.985);
 const bodyMat=new T.MeshStandardMaterial({color:0x514449,roughness:.75});
 const bodies=new T.InstancedMesh(bodyGeo,bodyMat,26);root.add(bodies);
 const textures:T.Texture[]=[];
 const materials:T.MeshBasicMaterial[]=[];const meshes:T.Mesh[]=[];
 const lists=faces.map((_,i)=>stickers.filter(s=>s.face===i));
 faces.forEach((f,i)=>{
 const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d')!;
 ctx.fillStyle=f.color;ctx.fillRect(0,0,512,512);
 ctx.fillStyle='#ffffff';ctx.textAlign='center';ctx.font='bold 100px serif';ctx.fillText(f.name,256,285);
 ctx.font='24px sans-serif';
 for(let y=0;y<3;y++)for(let x=0;x<3;x++){ctx.fillText('↑',x*171+85,y*171+38);ctx.fillText(String(y*3+x+1),x*171+85,y*171+150);}
 const fallback=new T.CanvasTexture(c);fallback.colorSpace=T.SRGBColorSpace;textures.push(fallback);
 const mat=new T.MeshBasicMaterial({map:fallback});materials.push(mat);
 if(i===0)new T.TextureLoader().load('/assets/sakuya.png',tex=>{if(disposed){tex.dispose();return;}tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.push(tex);mat.map=tex;mat.needsUpdate=true;},undefined,()=>useGame.setState({notice:'咲耶の画像を読み込めません。assets/sakuya.png を確認してください。'}));
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(new Float32Array(9*12),3));
 const uv:number[]=[],ix:number[]=[];
 lists[i].forEach((s,j)=>{for(const [x,y] of [[0,0],[1,0],[1,1],[0,1]]){const u=(s.col+x)/3;uv.push(i===0?1-u:u,(s.row+y)/3);}const n=j*4;ix.push(n,n+1,n+2,n,n+2,n+3);});
 geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ix);
 // Tiles migrate to other faces; a fixed whole-cube bound prevents stale raycast bounds.
 geo.boundingSphere=new T.Sphere(new T.Vector3(),4);
 const mesh=new T.Mesh(geo,mat);mesh.frustumCulled=false;root.add(mesh);meshes.push(mesh);
 });
 const outlineGeo=new T.EdgesGeometry(new T.PlaneGeometry(1,1));
 const outlineMat=new T.LineBasicMaterial({color:'#fff4a3'});
 const outline=new T.LineSegments(outlineGeo,outlineMat);root.add(outline);
 const border=(outer:number,inner:number)=>{
 const shape=new T.Shape();shape.moveTo(-outer,-outer);shape.lineTo(outer,-outer);shape.lineTo(outer,outer);shape.lineTo(-outer,outer);shape.closePath();
 const hole=new T.Path();hole.moveTo(-inner,-inner);hole.lineTo(-inner,inner);hole.lineTo(inner,inner);hole.lineTo(inner,-inner);hole.closePath();shape.holes.push(hole);return new T.ShapeGeometry(shape);
 };
 const rimGeo=border(.505,.471),haloGeo=border(.54,.456);
 const rimMat=new T.MeshBasicMaterial({color:'#ffd44a',transparent:true,opacity:.95,depthWrite:false,side:T.DoubleSide});
 const haloMat=new T.MeshBasicMaterial({color:'#ffd44a',transparent:true,opacity:.24,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending});
 const rim=new T.Mesh(rimGeo,rimMat),halo=new T.Mesh(haloGeo,haloMat);outline.add(halo,rim);
 const ray=new T.Raycaster(),pointer=new T.Vector2(),matrix=new T.Matrix4(),dummy=new T.Object3D();
 let disposed=false,frame=0,previous=performance.now(),spacing=1.12,lastReset=0;
 let drag:null|{id:number;x:number;y:number;lastX:number;lastY:number;start:number;tile:boolean;cancel:boolean}=null;
 let vx=0,vy=0,join=0;
 const v=(a:Vec)=>new T.Vector3(...a);
 const axisVector=(axis:Axis)=>new T.Vector3(axis===0?1:0,axis===1?1:0,axis===2?1:0);
 let controls:Controls|null=null;
 const direction=(key:string):Move|null=>useGame.getState().selection&&controls&&Object.hasOwn(controls,key)?controls[key as keyof Controls]:null;
 const act=(key:string)=>{const s=useGame.getState();if(s.active||document.querySelector('[role="dialog"]'))return;const m=direction(key);if(m)s.move(m);else useGame.setState({notice:'先にキューブのマスを選んでください。'});};
 const command=(e:Event)=>act((e as CustomEvent<string>).detail);
 window.addEventListener('cube-direction',command);
 const keyboard=(e:KeyboardEvent)=>{if(e.repeat||e.ctrlKey||e.altKey||e.metaKey||/INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName))return;if('wasd'.includes(e.key.toLowerCase())&&e.key.length===1){e.preventDefault();act(e.key.toLowerCase());}};
 window.addEventListener('keydown',keyboard);
 const down=(e:PointerEvent)=>{
 if(drag){drag.cancel=true;return;}if(useGame.getState().active||useGame.getState().phase==='won')return;
 const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
 ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(meshes)[0];
 let s=null;if(hit){const fi=meshes.indexOf(hit.object as T.Mesh);s=lists[fi][Math.floor((hit.faceIndex??0)/2)];}
 controls=s?captureControls(useGame.getState().pieces[s.pieceId],s,root.quaternion):null;
 useGame.getState().select(s);vx=vy=0;canvas.setPointerCapture(e.pointerId);
 drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,start:performance.now(),tile:!!s,cancel:false};
 };
 const move=(e:PointerEvent)=>{
 if(!drag||drag.id!==e.pointerId||drag.cancel)return;
 const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
 if(drag.tile){
 if(e.pointerType==='mouse')return;
 if(Math.hypot(dx,dy)<24)return;
 if(performance.now()-drag.start<200){drag.cancel=true;useGame.setState({notice:'マスを少し長押ししてから、縦か横にスワイプしてください。'});return;}
 act(Math.abs(dx)>Math.abs(dy)?dx>0?'d':'a':dy>0?'s':'w');drag.cancel=true;
 }else{
 vx=(e.clientX-drag.lastX)*.005;vy=(e.clientY-drag.lastY)*.005;
 root.quaternion.premultiply(new T.Quaternion().setFromEuler(new T.Euler(vy,vx,0)));
 drag.lastX=e.clientX;drag.lastY=e.clientY;
 }};
 const up=(e:PointerEvent)=>{if(drag?.id===e.pointerId)drag=null;};
 const cancel=()=>{drag=null;vx=vy=0;};
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);
 canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',cancel);canvas.addEventListener('lostpointercapture',up);
 window.addEventListener('blur',cancel);document.addEventListener('visibilitychange',cancel);
 const resize=()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=camera.aspect<.8?10.8:9;camera.updateProjectionMatrix();};
 const observer=new ResizeObserver(resize);observer.observe(el);resize();
 let sample=0,frames=0,sampleStart=performance.now();
 const tick=(now:number)=>{
 frame=requestAnimationFrame(tick);const dt=Math.min((now-previous)/1000,.04);previous=now;
 const state=useGame.getState();
 if(state.resetView!==lastReset){lastReset=state.resetView;initial();cancel();controls=null;state.select(null);}
 if(!drag&&!state.selection&&!state.reduced&&state.phase!=='won'){root.quaternion.premultiply(new T.Quaternion().setFromEuler(new T.Euler(vy*dt*60,vx*dt*60,0)));vx*=Math.exp(-6*dt);vy*=Math.exp(-6*dt);}
 const victory=state.victory;
 join= victory?Math.min(1,join+dt*(state.reduced?12:2.5)):0;
 if(victory){cancel();matrix.makeBasis(v(victory.right),v(victory.up),v(victory.normal));const target=new T.Quaternion().setFromRotationMatrix(matrix).invert();root.quaternion.slerp(target,Math.min(1,dt*(state.reduced?30:5)));}
 const done=state.mode==='six'&&state.moved&&!state.active&&solvedFaces(state.pieces).length===6;
 spacing+=( (done?1:1+state.gap)-spacing)*Math.min(1,dt*9);
 root.position.y=state.reduced||drag||victory?0:Math.sin(now*.0007)*.045;
 const animation=state.active,progress=animation?Math.min(1,(now-animation.started)/(state.reduced?70:220)):0;
 const rotation=animation?new T.Quaternion().setFromAxisAngle(axisVector(animation.move.axis),animation.move.dir*Math.PI/2*(progress*progress*(3-2*progress))):new T.Quaternion();
 const positions:T.Vector3[]=[],orientations:T.Quaternion[]=[];
 const preview=state.preview?direction(state.preview):null;
 state.pieces.forEach((p,i)=>{
 const pos=v(p.pos).multiplyScalar(spacing);matrix.makeBasis(v(p.basis[0]),v(p.basis[1]),v(p.basis[2]));
 if(victory&&victory.pieceIds.includes(p.id))for(const axis of [0,1,2])if(victory.normal[axis]===0)pos.setComponent(axis,p.pos[axis]*(spacing-(spacing-1)*join));
 const q=new T.Quaternion().setFromRotationMatrix(matrix);
 if(animation&&p.pos[animation.move.axis]===animation.move.layer){pos.applyQuaternion(rotation);q.premultiply(rotation);}
 positions.push(pos);orientations.push(q);dummy.position.copy(pos);dummy.quaternion.copy(q);dummy.updateMatrix();bodies.setMatrixAt(i,dummy.matrix);
 bodies.setColorAt(i,new T.Color(preview&&p.pos[preview.axis]===preview.layer?(state.preview==='w'||state.preview==='s'?'#f65765':'#24cf98'):'#514449'));
 });
 bodies.instanceMatrix.needsUpdate=true;if(bodies.instanceColor)bodies.instanceColor.needsUpdate=true;
 const size=1-Math.min(1,(spacing-1)/.12)*.04;
 lists.forEach((list,i)=>{const attr=meshes[i].geometry.getAttribute('position') as T.BufferAttribute;
 list.forEach((s,j)=>{const q=orientations[s.pieceId],pos=positions[s.pieceId];
 [[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].forEach(([x,y],k)=>{
 const tileSize=victory&&s.face===victory.face?size+(1.001-size)*join:size;
 const point=v(s.normal).multiplyScalar(.5).addScaledVector(v(s.right),x*tileSize).addScaledVector(v(s.up),y*tileSize).applyQuaternion(q).add(pos);
 attr.setXYZ(j*4+k,point.x,point.y,point.z);});});attr.needsUpdate=true;});
 outline.visible=!!state.selection;
 haloMat.opacity=state.reduced?.24:.22+Math.sin(now*.003)*.08;
 if(state.selection){const s=state.selection,q=orientations[s.pieceId];matrix.makeBasis(v(s.right),v(s.up),v(s.normal));outline.quaternion.setFromRotationMatrix(matrix).premultiply(q);
 outline.position.copy(v(s.normal).multiplyScalar(.506).applyQuaternion(q).add(positions[s.pieceId]));}
 // Fit every animated cubie corner inside the dedicated canvas even at large size.
 camera.zoom=1;camera.updateProjectionMatrix();root.updateMatrixWorld(true);camera.updateMatrixWorld(true);
 let extent=0;
 for(let i=0;i<positions.length;i++)for(const x of [-.55,.55])for(const y of [-.55,.55])for(const z of [-.55,.55]){
 const point=new T.Vector3(x,y,z).applyQuaternion(orientations[i]).add(positions[i]);root.localToWorld(point);point.project(camera);extent=Math.max(extent,Math.abs(point.x),Math.abs(point.y));
 }
 const requested={small:1,medium:1.25,large:1.5}[state.displaySize];
 const occupancy={small:.70,medium:.82,large:.95}[state.displaySize];
 camera.zoom=Math.min(requested,occupancy/Math.max(extent,.001));camera.updateProjectionMatrix();
 renderer.render(scene,camera);
 frames++;if(now-sampleStart>1000){sample=Math.round(frames*1000/(now-sampleStart));frames=0;sampleStart=now;
 const info=document.getElementById('render-info');if(info)info.textContent=sample+' fps · '+renderer.info.render.calls+' draw calls';}
 if(animation&&progress===1)state.finish();
 };
 frame=requestAnimationFrame(tick);
 // Read-only diagnostics: tests still operate through pointer and keyboard events.
 (window as any).__cube={snapshot:()=>{const s=useGame.getState();return {pieces:s.pieces,solved:solvedFaces(s.pieces),busy:!!s.active,history:s.history.length,selection:s.selection,spacing,fps:sample};},
 tilePoint:(face:number,index:number)=>{const s=lists[face][index],p=useGame.getState().pieces[s.pieceId];const pt=v(p.pos).multiplyScalar(spacing).add(v(transform(p.basis,s.normal)).multiplyScalar(.51));root.localToWorld(pt);pt.project(camera);const r=canvas.getBoundingClientRect();return {x:r.left+(pt.x+1)*r.width/2,y:r.top+(1-pt.y)*r.height/2};}};
 return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('keydown',keyboard);window.removeEventListener('cube-direction',command);window.removeEventListener('blur',cancel);document.removeEventListener('visibilitychange',cancel);renderer.dispose();bodyGeo.dispose();bodyMat.dispose();outlineGeo.dispose();outlineMat.dispose();meshes.forEach(m=>m.geometry.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());canvas.remove();delete (window as any).__cube;};
 },[]);
 return <div className="scene" ref={host} aria-label="3Dキューブ。マスを選びWASD、または長押しスワイプで回転" />;
}
