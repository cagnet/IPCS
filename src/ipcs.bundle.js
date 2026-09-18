/* IPCS browser bundle - generated from ES6 source modules. */
(() => {
'use strict';

/* src\model\Component.js */
class Component {
  constructor({id,type,label=id,position={x:0,y:0},rotation=0,terminals=[]}){Object.assign(this,{id,type,label,position,rotation,terminals});}
  terminal(id){return `${this.id}:${id}`;}
}


/* src\model\components.js */

class PowerSource extends Component{constructor(d={}){super({...d,type:'powerSource',terminals:d.terminals||[{id:'OUT',kind:'output'},{id:'RETURN',kind:'return'}]});this.outputs=d.outputs||[{id:'OUT',label:'24 VAC',voltage:24,enabled:true}];}}
class Coil extends Component{constructor(d={}){super({...d,type:'coil',terminals:d.terminals||[{id:'A'},{id:'B'}]});}}
class Contact extends Component{constructor(d={}){super({...d,type:'contact',terminals:d.terminals||[{id:'A'},{id:'B'}]});this.contactType=d.contactType||'NO';this.controlType=d.controlType||'manual';this.controllerId=d.controllerId||null;this.manualActivated=!!d.manualActivated;}}
class Junction extends Component{constructor(d={}){super({...d,type:'junction',terminals:d.terminals||[{id:'J'}]});}}
const componentFromData=d=>({powerSource:PowerSource,coil:Coil,contact:Contact,junction:Junction}[d.type]||Component)===Component?new Component(d):new ({powerSource:PowerSource,coil:Coil,contact:Contact,junction:Junction}[d.type])(d);


/* src\model\Wire.js */
class Wire{constructor({id,styleId='RED',points=[],from,to}){Object.assign(this,{id,styleId,points,from,to});}}
class WireStyle{constructor({id,name=id,colors=['#d33']}){Object.assign(this,{id,name,colors});}}


/* src\model\Schematic.js */

class Schematic{
 constructor(data={}){this.formatVersion=1;this.name=data.name||'Nouveau projet';this.brand=data.brand||'';this.year=data.year||null;this.background=data.background||null;this.grid=data.grid||{snapGrid:{enabled:true,stepX:10,stepY:10,visible:true},referenceGrid:{enabled:true,visible:true,cellWidth:200,cellHeight:150}};this.components=(data.components||[]).map(componentFromData);this.wires=(data.wires||[]).map(w=>new Wire(w));this.wireStyles=(data.wireStyles||defaultStyles()).map(s=>new WireStyle(s));this.relations=data.relations||[];}
 getComponent(id){return this.components.find(c=>c.id===id)} getWire(id){return this.wires.find(w=>w.id===id)}
 addComponent(c){this.components.push(componentFromData(c));return this.components.at(-1)} addWire(w){this.wires.push(new Wire(w));return this.wires.at(-1)}
 remove(id){this.components=this.components.filter(c=>c.id!==id);this.wires=this.wires.filter(w=>w.id!==id&&!w.from?.startsWith(id+':')&&!w.to?.startsWith(id+':'));this.components.filter(c=>c.controllerId===id).forEach(c=>c.controllerId=null);}
 nextId(prefix){let n=1;const ids=new Set([...this.components,...this.wires].map(x=>x.id));while(ids.has(`${prefix}${n}`))n++;return `${prefix}${n}`;}
 toJSON(){return {formatVersion:this.formatVersion,name:this.name,brand:this.brand,year:this.year,background:this.background,grid:this.grid,wireStyles:this.wireStyles,components:this.components,wires:this.wires,relations:this.components.filter(c=>c.type==='contact'&&c.controllerId).map(c=>({type:'coilControlsContact',from:c.controllerId,to:c.id}))};}
}
const defaultStyles=()=>[{id:'RED',name:'Rouge',colors:['#d83232']},{id:'RED-WHITE',name:'Rouge / Blanc',colors:['#d83232','#fff']},{id:'RED-WHITE-BLUE',name:'Rouge / Blanc / Bleu',colors:['#d83232','#fff','#2879bf']}];
function referenceOf(position,grid,height=1200){const col=Math.max(1,Math.floor(position.x/grid.cellWidth)+1);const row=Math.max(0,Math.floor((height-position.y)/grid.cellHeight));return `${letters(row)}-${col}`;}function letters(n){let s='';do{s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26)-1}while(n>=0);return s;}


/* src\model\example.js */

function createExample(){return new Schematic({name:'Démonstration relais en cascade',components:[
 {id:'PS1',type:'powerSource',label:'24 VAC',position:{x:150,y:360},rotation:90,outputs:[{id:'OUT',label:'24 VAC',voltage:24,enabled:true}]},
 {id:'START',type:'contact',contactType:'NO',controlType:'manual',label:'START SWITCH',position:{x:420,y:250},rotation:0},
 {id:'R1',type:'coil',label:'RELAY 1',position:{x:700,y:250},rotation:0},
 {id:'R1.1',type:'contact',contactType:'NO',controlType:'coil',controllerId:'R1',label:'CONTACT R1',position:{x:420,y:500},rotation:0},
 {id:'R2',type:'coil',label:'SECOND RELAY',position:{x:700,y:500},rotation:0},
 {id:'J1',type:'junction',label:'',position:{x:260,y:310},rotation:0},
 {id:'J2',type:'junction',label:'',position:{x:840,y:375},rotation:0}
],wires:[
 {id:'W1',styleId:'RED-WHITE',from:'PS1:OUT',to:'J1:J',points:[{x:150,y:310},{x:260,y:310}]},
 {id:'W2',styleId:'RED-WHITE',from:'J1:J',to:'START:A',points:[{x:260,y:310},{x:260,y:250},{x:370,y:250}]},
 {id:'W3',styleId:'RED',from:'START:B',to:'R1:A',points:[{x:470,y:250},{x:650,y:250}]},
 {id:'W4',styleId:'RED',from:'R1:B',to:'J2:J',points:[{x:750,y:250},{x:840,y:250},{x:840,y:375}]},
 {id:'W5',styleId:'RED-WHITE-BLUE',from:'J1:J',to:'R1.1:A',points:[{x:260,y:310},{x:260,y:500},{x:370,y:500}]},
 {id:'W6',styleId:'RED-WHITE-BLUE',from:'R1.1:B',to:'R2:A',points:[{x:470,y:500},{x:650,y:500}]},
 {id:'W7',styleId:'RED-WHITE-BLUE',from:'R2:B',to:'J2:J',points:[{x:750,y:500},{x:840,y:500},{x:840,y:375}]},
 {id:'W8',styleId:'RED-WHITE',from:'J2:J',to:'PS1:RETURN',points:[{x:840,y:375},{x:200,y:375},{x:200,y:410},{x:150,y:410}]}
]})}


/* src\simulation\CircuitSolver.js */
class CircuitSolver{
 constructor(maxIterations=100){this.maxIterations=maxIterations;}
 solve(schematic){let coils=new Set(),state=null,converged=false;for(let i=0;i<this.maxIterations;i++){state=this.pass(schematic,coils);const next=new Set(state.poweredCoils);if(equal(coils,next)){converged=true;state.iterations=i+1;break}coils=next}return {...state,converged,diagnostic:converged?'':`Le circuit ne converge pas après ${this.maxIterations} itérations.`};}
 pass(s,coilState){const graph=new Map(),edgeWire=new Map();const add=(a,b,w=null)=>{if(!graph.has(a))graph.set(a,[]);if(!graph.has(b))graph.set(b,[]);graph.get(a).push(b);graph.get(b).push(a);if(w){edgeWire.set(`${a}|${b}`,w);edgeWire.set(`${b}|${a}`,w)}};
  for(const w of s.wires)if(w.from&&w.to)add(w.from,w.to,w.id);
  for(const c of s.components){const a=`${c.id}:A`,b=`${c.id}:B`;if(c.type==='coil')add(a,b);if(c.type==='contact'){const active=c.controlType==='manual'?c.manualActivated:coilState.has(c.controllerId);const closed=c.contactType==='NO'?active:!active;if(closed)add(a,b)} }
  const sources=[],returns=[];for(const p of s.components.filter(c=>c.type==='powerSource')){for(const o of p.outputs.filter(o=>o.enabled))sources.push(`${p.id}:${o.id}`);returns.push(`${p.id}:RETURN`)}
  const fromSource=walk(graph,sources),toReturn=walk(graph,returns);const poweredCoils=s.components.filter(c=>c.type==='coil'&&fromSource.has(`${c.id}:A`)&&toReturn.has(`${c.id}:B`)||c.type==='coil'&&fromSource.has(`${c.id}:B`)&&toReturn.has(`${c.id}:A`)).map(c=>c.id);
  const poweredWires=s.wires.filter(w=>fromSource.has(w.from)||fromSource.has(w.to)).map(w=>w.id);const flowingWires=s.wires.filter(w=>(fromSource.has(w.from)&&toReturn.has(w.to))||(fromSource.has(w.to)&&toReturn.has(w.from))||(fromSource.has(w.from)&&toReturn.has(w.from)&&fromSource.has(w.to))).map(w=>w.id);
  const poweredComponents=s.components.filter(c=>c.terminals.some(t=>fromSource.has(`${c.id}:${t.id}`))).map(c=>c.id);return {poweredCoils,poweredWires,flowingWires,poweredComponents,fromSource,toReturn};}
}
function walk(g,seeds){const seen=new Set(seeds),q=[...seeds];while(q.length){const n=q.shift();for(const v of g.get(n)||[])if(!seen.has(v)){seen.add(v);q.push(v)}}return seen}function equal(a,b){return a.size===b.size&&[...a].every(x=>b.has(x))}


/* src\persistence\SchematicSerializer.js */

class SchematicSerializer{
 static stringify(s){return JSON.stringify(s.toJSON(),null,2)}
 static parse(text){const d=JSON.parse(text);if(d.formatVersion!==1)throw new Error(`Version IPCS non supportée : ${d.formatVersion}`);return new Schematic(d)}
 static fileName(s){return `${s.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase()||'projet'}.ipcs`}
 static async save(s,existingHandle=null){const contents=this.stringify(s);if('showSaveFilePicker'in window){const handle=existingHandle||await window.showSaveFilePicker({suggestedName:this.fileName(s),types:[{description:'Projet IPCS',accept:{'application/json':['.ipcs']}}]});const writable=await handle.createWritable();await writable.write(contents);await writable.close();return handle}this.download(s);return null}
 static async open(){if('showOpenFilePicker'in window){const [handle]=await window.showOpenFilePicker({multiple:false,types:[{description:'Projet IPCS',accept:{'application/json':['.ipcs','.json']}}]});const file=await handle.getFile();return {schematic:this.parse(await file.text()),handle}}return null}
 static download(s){const a=document.createElement('a');const url=URL.createObjectURL(new Blob([this.stringify(s)],{type:'application/json'}));a.href=url;a.download=this.fileName(s);a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
}


/* src\rendering\SvgRenderer.js */

const NS='http://www.w3.org/2000/svg';const el=(tag,a={})=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(a))n.setAttribute(k,v);return n};
class SvgRenderer{
 constructor(svg){this.svg=svg;this.layers={grid:svg.querySelector('#gridLayer'),wire:svg.querySelector('#wireLayer'),component:svg.querySelector('#componentLayer'),overlay:svg.querySelector('#overlayLayer')};this.defs=svg.querySelector('#svgDefs');}
 render(s,view={selection:null,related:new Set(),simulation:null,wirePreview:null}){this.renderDefs(s);this.renderGrid(s);this.layers.wire.replaceChildren(...s.wires.flatMap(w=>this.wireNodes(w,s,view)));this.layers.component.replaceChildren(...s.components.map(c=>this.componentNode(c,s,view)));this.layers.overlay.replaceChildren(...this.overlayNodes(s,view));}
 renderDefs(s){this.defs.replaceChildren();for(const st of s.wireStyles){const p=el('pattern',{id:`style-${safe(st.id)}`,patternUnits:'userSpaceOnUse',width:12,height:12,patternTransform:'rotate(45)'});st.colors.forEach((c,i)=>p.append(el('rect',{x:i*12/st.colors.length,y:0,width:12/st.colors.length+1,height:12,fill:c})));this.defs.append(p)}}
 renderGrid(s){const g=this.layers.grid;g.replaceChildren();const snap=s.grid.snapGrid,ref=s.grid.referenceGrid,W=3000,H=1800;if(snap.visible){for(let x=0;x<=W;x+=snap.stepX)g.append(el('line',{x1:x,y1:0,x2:x,y2:H,class:'snap-grid'}));for(let y=0;y<=H;y+=snap.stepY)g.append(el('line',{x1:0,y1:y,x2:W,y2:y,class:'snap-grid'}))}if(ref.visible){for(let x=0;x<=W;x+=ref.cellWidth)g.append(el('line',{x1:x,y1:0,x2:x,y2:H,class:'reference-grid'}));for(let y=0;y<=H;y+=ref.cellHeight)g.append(el('line',{x1:0,y1:y,x2:W,y2:y,class:'reference-grid'}));for(let x=ref.cellWidth/2,n=1;x<W;x+=ref.cellWidth,n++){const t=el('text',{x,y:22,class:'grid-label'});t.textContent=n;g.append(t)}for(let y=H-ref.cellHeight/2,n=0;y>0;y-=ref.cellHeight,n++){const t=el('text',{x:18,y:y+5,class:'grid-label'});t.textContent=gridLetters(n);g.append(t)}}}
 wireNodes(w,s,v){const d=`M ${w.points.map(p=>`${p.x} ${p.y}`).join(' L ')}`,st=s.wireStyles.find(x=>x.id===w.styleId)||s.wireStyles[0],powered=v.simulation?.poweredWires.includes(w.id);const group=el('g',{'data-id':w.id,class:`wire ${v.selection===w.id?'selected':''}`});if(powered)group.append(el('path',{d,class:'wire-glow'}));group.append(el('path',{d,class:'wire-base',stroke:`url(#style-${safe(st.id)})`}),el('path',{d,class:'wire-hit'}));return [group]}
 componentNode(c,s,v){const classes=['component',v.selection===c.id?'selected':'',v.related.has(c.id)?'related':'',v.simulation?.poweredComponents.includes(c.id)?'powered':''].join(' ');const g=el('g',{class:classes,'data-id':c.id,transform:`translate(${c.position.x} ${c.position.y}) rotate(${c.rotation})`});g.append(el('rect',{x:-55,y:-32,width:110,height:64,rx:5,class:'selection-box'}));const symbol=this.symbol(c,v);symbol.forEach(n=>g.append(n));const id=el('text',{x:0,y:-19,class:'component-id'});id.textContent=c.id;const label=el('text',{x:0,y:42,class:'label'});label.textContent=c.label;g.append(id,label);if(c.type==='powerSource')g.append(this.terminal(-50,0,c,'OUT'),this.terminal(50,0,c,'RETURN'));else if(c.type!=='junction')g.append(this.terminal(-50,0,c,'A'),this.terminal(50,0,c,'B'));else g.append(this.terminal(0,0,c,'J'));g.dataset.reference=referenceOf(c.position,s.grid.referenceGrid,1800);return g}
 terminal(x,y,c,id){return el('circle',{cx:x,cy:y,r:6,class:'terminal','data-terminal':`${c.id}:${id}`})}
 symbol(c,v){if(c.type==='powerSource'){const q=el('circle',{cx:0,cy:0,r:20,class:'symbol-line'}),t=el('text',{x:0,y:7,class:'label',style:'font-size:22px'});t.textContent='~';return [el('line',{x1:-50,y1:0,x2:-20,y2:0,class:'symbol-line'}),q,t,el('line',{x1:20,y1:0,x2:50,y2:0,class:'symbol-line'})]}if(c.type==='coil'){return [el('line',{x1:-50,y1:0,x2:-28,y2:0,class:'symbol-line'}),el('rect',{x:-28,y:-14,width:56,height:28,rx:14,class:'symbol-line coil-fill',fill:'#fff'}),el('path',{d:'M-19 8 Q-12 -8 -5 8 T9 8 T23 8',class:'symbol-line',style:'stroke-width:2'}),el('line',{x1:28,y1:0,x2:50,y2:0,class:'symbol-line'})]}if(c.type==='contact'){const active=c.controlType==='manual'?c.manualActivated:v.simulation?.poweredCoils.includes(c.controllerId),closed=c.contactType==='NO'?active:!active;return [el('line',{x1:-50,y1:0,x2:-18,y2:0,class:'symbol-line'}),el('circle',{cx:-16,cy:0,r:3,class:'symbol-line'}),el('circle',{cx:16,cy:0,r:3,class:'symbol-line'}),el('line',{x1:18,y1:0,x2:50,y2:0,class:'symbol-line'}),el('line',{x1:-13,y1:closed?0:-2,x2:13,y2:closed?0:-14,class:'symbol-line'})]}return [el('circle',{cx:0,cy:0,r:7,class:'junction-dot'})]}
 overlayNodes(s,v){const out=[];if(v.selection){const c=s.getComponent(v.selection);if(c&&(c.type==='coil'||c.type==='contact'&&c.controllerId)){const coil=c.type==='coil'?c:s.getComponent(c.controllerId);for(const ct of s.components.filter(x=>x.type==='contact'&&x.controllerId===coil?.id))out.push(el('line',{x1:coil.position.x,y1:coil.position.y,x2:ct.position.x,y2:ct.position.y,class:'relation-line'}))}}if(v.wirePreview?.length)out.push(el('polyline',{points:v.wirePreview.map(p=>`${p.x},${p.y}`).join(' '),class:'symbol-line',style:'stroke:#168bc1;stroke-dasharray:6 4'}));return out}
}
function gridLetters(n){let s='';do{s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26)-1}while(n>=0);return s}function safe(s){return String(s).replace(/[^a-z0-9_-]/gi,'-')}


/* src\ui\ComponentPalette.js */
class ComponentPalette{constructor(root,onPick){this.items=[['powerSource','◯','Alimentation'],['coil','⌁','Bobine'],['contactNO','╱','Contact NO'],['contactNC','—','Contact NC'],['wire','⌁','Fil'],['junction','●','Jonction']];this.root=root;this.onPick=onPick;this.selected=null;this.render()}render(){this.root.replaceChildren(...this.items.map(([id,icon,label])=>{const b=document.createElement('button');b.dataset.tool=id;b.innerHTML=`<span>${icon}</span>${label}`;b.onclick=()=>{this.selected=this.selected===id?null:id;this.root.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x.dataset.tool===this.selected));this.onPick(this.selected)};return b}))}clear(){this.selected=null;this.root.querySelectorAll('button').forEach(x=>x.classList.remove('active'))}}


/* src\ui\PropertyPanel.js */

class PropertyPanel{constructor(root,onChange,onDelete){Object.assign(this,{root,onChange,onDelete})}render(item,s){if(!item){this.root.innerHTML='<p class="empty-state">Sélectionnez un élément du schéma.</p>';return}const isWire='points'in item;this.root.innerHTML=`<div class="prop-group"><label>Identifiant</label><input value="${esc(item.id)}" disabled></div>${!isWire?`<div class="prop-group"><label>Libellé</label><input data-p="label" value="${esc(item.label)}"></div><div class="prop-row"><div class="prop-group"><label>X</label><input data-p="x" type="number" value="${item.position.x}"></div><div class="prop-group"><label>Y</label><input data-p="y" type="number" value="${item.position.y}"></div></div><div class="prop-group"><label>Rotation</label><select data-p="rotation">${[0,90,180,270].map(x=>`<option ${item.rotation===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="prop-group"><label>Repère calculé</label><input value="${referenceOf(item.position,s.grid.referenceGrid,1800)}" disabled></div>`:`<div class="prop-group"><label>Style</label><select data-p="styleId">${s.wireStyles.map(x=>`<option value="${x.id}" ${item.styleId===x.id?'selected':''}>${x.name}</option>`).join('')}</select></div>`}${item.type==='contact'?`<div class="prop-group"><label>Type</label><select data-p="contactType"><option ${item.contactType==='NO'?'selected':''}>NO</option><option ${item.contactType==='NC'?'selected':''}>NC</option></select></div><div class="prop-group"><label>Commande</label><select data-p="controlType"><option value="manual" ${item.controlType==='manual'?'selected':''}>Manuelle</option><option value="coil" ${item.controlType==='coil'?'selected':''}>Bobine</option></select></div><div class="prop-group"><label>Bobine associée</label><select data-p="controllerId"><option value="">—</option>${s.components.filter(x=>x.type==='coil').map(x=>`<option ${item.controllerId===x.id?'selected':''}>${x.id}</option>`).join('')}</select></div>`:''}<button id="deleteProp" class="wide danger">Supprimer</button>`;this.root.querySelectorAll('[data-p]').forEach(i=>i.onchange=()=>{let v=i.value;if(['x','y','rotation'].includes(i.dataset.p))v=Number(v);this.onChange(i.dataset.p,v)});this.root.querySelector('#deleteProp').onclick=this.onDelete}}
function esc(s=''){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}


/* src\editor\Editor.js */

class Editor{
 constructor({svg,schematic,renderer,onChange,onSelect,onStatus}){Object.assign(this,{svg,schematic,renderer,onChange,onSelect,onStatus});this.mode='EDIT';this.tool=null;this.styleId='RED';this.selection=null;this.scale=1;this.pan={x:0,y:0};this.history=[];this.future=[];this.space=false;this.bind();this.applyTransform()}
 setSchematic(s){this.schematic=s;this.selection=null;this.history=[];this.future=[];this.render()}
 bind(){this.svg.addEventListener('pointerdown',e=>this.down(e));this.svg.addEventListener('pointermove',e=>this.move(e));this.svg.addEventListener('pointerup',e=>this.up(e));this.svg.addEventListener('wheel',e=>this.wheel(e),{passive:false});window.addEventListener('keydown',e=>this.key(e,true));window.addEventListener('keyup',e=>this.key(e,false))}
 point(e){const r=this.svg.getBoundingClientRect();return {x:(e.clientX-r.left-this.pan.x)/this.scale,y:(e.clientY-r.top-this.pan.y)/this.scale}}
 snap(p){const g=this.schematic.grid.snapGrid;if(!g.enabled)return p;return{x:Math.round(p.x/g.stepX)*g.stepX,y:Math.round(p.y/g.stepY)*g.stepY}}
 down(e){this.svg.focus();const p=this.snap(this.point(e)),terminal=e.target.dataset.terminal,id=e.target.closest('[data-id]')?.dataset.id;if(e.button===1||this.space){this.drag={kind:'pan',start:{x:e.clientX,y:e.clientY},origin:{...this.pan}};this.svg.setPointerCapture(e.pointerId);return}if(this.mode==='SIMULATION'){const c=this.schematic.getComponent(id);if(c?.type==='contact'&&c.controlType==='manual'){c.manualActivated=!c.manualActivated;this.onChange('simulation')}return}if(this.tool==='wire'){if(terminal)this.wireClick(terminal,p,e.shiftKey);return}if(this.tool&&!id){this.snapshot();this.add(this.tool,p);return}if(id){this.select(id);const c=this.schematic.getComponent(id);if(c){this.snapshot();this.drag={kind:'component',id,offset:{x:p.x-c.position.x,y:p.y-c.position.y}};this.svg.setPointerCapture(e.pointerId)}}else this.select(null)}
 move(e){const p=this.point(e);this.onStatus(this.snap(p));if(this.drag?.kind==='pan'){this.pan={x:this.drag.origin.x+e.clientX-this.drag.start.x,y:this.drag.origin.y+e.clientY-this.drag.start.y};this.applyTransform()}if(this.drag?.kind==='component'){const c=this.schematic.getComponent(this.drag.id),q=this.snap({x:p.x-this.drag.offset.x,y:p.y-this.drag.offset.y});c.position=q;this.render()}if(this.pendingWire){const q=this.snap(p),a=this.pendingWire.point;this.preview=e.shiftKey?[a,q]:[a,{x:q.x,y:a.y},q];this.render()}}
 up(){if(this.drag?.kind==='component')this.onChange('move');this.drag=null}
 add(tool,p){let c;if(tool==='powerSource')c=new PowerSource({id:this.schematic.nextId('PS'),label:'Alimentation 24 VAC',position:p});if(tool==='coil')c=new Coil({id:this.schematic.nextId('R'),label:'RELAY',position:p});if(tool==='contactNO'||tool==='contactNC')c=new Contact({id:this.schematic.nextId('SW'),label:tool==='contactNO'?'CONTACT NO':'CONTACT NC',position:p,contactType:tool==='contactNO'?'NO':'NC'});if(tool==='junction')c=new Junction({id:this.schematic.nextId('J'),label:'',position:p});if(c){this.schematic.components.push(c);this.select(c.id);this.onChange('add')}}
 wireClick(terminal,p,free){if(!this.pendingWire){this.pendingWire={terminal,point:p};this.preview=[p,p];this.onStatus(p,'Cliquez sur la borne d’arrivée')}else if(terminal!==this.pendingWire.terminal){this.snapshot();const points=free?[this.pendingWire.point,p]:[this.pendingWire.point,{x:p.x,y:this.pendingWire.point.y},p];const w={id:this.schematic.nextId('W'),styleId:this.styleId,from:this.pendingWire.terminal,to:terminal,points};this.schematic.addWire(w);this.pendingWire=null;this.preview=null;this.select(w.id);this.onChange('wire')}}
 select(id){this.selection=id;this.onSelect(id);this.render()}
 related(){const set=new Set(),c=this.schematic.getComponent(this.selection);if(c?.type==='coil'){set.add(c.id);this.schematic.components.filter(x=>x.controllerId===c.id).forEach(x=>set.add(x.id))}if(c?.type==='contact'&&c.controllerId){set.add(c.id);set.add(c.controllerId);this.schematic.components.filter(x=>x.controllerId===c.controllerId).forEach(x=>set.add(x.id))}return set}
 render(simulation=this.simulation){this.simulation=simulation;this.renderer.render(this.schematic,{selection:this.selection,related:this.related(),simulation,wirePreview:this.preview})}
 setMode(m){this.mode=m;this.pendingWire=null;this.preview=null;this.render()}
 wheel(e){e.preventDefault();const before=this.point(e),factor=e.deltaY<0?1.12:.89;this.scale=Math.min(3,Math.max(.25,this.scale*factor));const r=this.svg.getBoundingClientRect();this.pan.x=e.clientX-r.left-before.x*this.scale;this.pan.y=e.clientY-r.top-before.y*this.scale;this.applyTransform();this.onStatus(null,`${Math.round(this.scale*100)} %`)}
 zoom(f){if(f===0){this.scale=1;this.pan={x:0,y:0}}else this.scale=Math.min(3,Math.max(.25,this.scale*f));this.applyTransform()}
 applyTransform(){this.svg.querySelector('#viewport').setAttribute('transform',`translate(${this.pan.x} ${this.pan.y}) scale(${this.scale})`);this.onViewportChange?.({pan:{...this.pan},scale:this.scale})}
 key(e,down){if(e.code==='Space'){this.space=down;if(down)e.preventDefault()}if(!down||['INPUT','SELECT'].includes(document.activeElement?.tagName))return;if(e.key==='Delete'&&this.selection)this.remove();if(e.key.toLowerCase()==='r'&&this.selection)this.rotate();if(e.ctrlKey&&e.key.toLowerCase()==='z'){e.preventDefault();this.undo()}if(e.ctrlKey&&(e.key.toLowerCase()==='y'||e.shiftKey&&e.key.toLowerCase()==='z')){e.preventDefault();this.redo()}if(e.ctrlKey&&e.key.toLowerCase()==='d'){e.preventDefault();this.duplicate()}}
 snapshot(){this.history.push(JSON.stringify(this.schematic.toJSON()));if(this.history.length>60)this.history.shift();this.future=[]}
 restore(raw){import('../model/Schematic.js').then(({Schematic})=>{this.schematic=new Schematic(JSON.parse(raw));this.selection=null;this.onChange('restore',this.schematic)})}
 undo(){if(!this.history.length)return;this.future.push(JSON.stringify(this.schematic.toJSON()));this.restore(this.history.pop())}redo(){if(!this.future.length)return;this.history.push(JSON.stringify(this.schematic.toJSON()));this.restore(this.future.pop())}
 remove(){this.snapshot();this.schematic.remove(this.selection);this.select(null);this.onChange('delete')}
 rotate(){const c=this.schematic.getComponent(this.selection);if(c){this.snapshot();c.rotation=(c.rotation+90)%360;this.onChange('rotate')}}
 duplicate(){const c=this.schematic.getComponent(this.selection);if(!c)return;this.snapshot();const d=JSON.parse(JSON.stringify(c));d.id=this.schematic.nextId(c.type==='coil'?'R':c.type==='contact'?'SW':c.type==='powerSource'?'PS':'J');d.position={x:c.position.x+30,y:c.position.y+30};this.schematic.addComponent(d);this.select(d.id);this.onChange('duplicate')}
}


/* src\app.js */










let schematic=createExample(),simulation=null,fileHandle=null,dirty=false,dialogMode='new',removeBackground=false;
const $=selector=>document.querySelector(selector);
const svg=$('#schematic'),renderer=new SvgRenderer(svg),solver=new CircuitSolver();
const toast=message=>{const node=$('#toast');node.textContent=message;node.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.classList.remove('show'),2400)};

const editor=new Editor({svg,schematic,renderer,
 onViewportChange:syncPdfViewport,
 onChange:(reason,replacement)=>{if(replacement){schematic=replacement;editor.schematic=schematic}markDirty();editor.mode==='SIMULATION'?runSimulation():refresh()},
 onSelect:id=>{const item=schematic.getComponent(id)||schematic.getWire(id);properties.render(item,schematic);$('#statusSelection').textContent=item?`${item.id}${item.type?' · '+item.type:''}`:'Aucune sélection'},
 onStatus:(point,message)=>{if(point)$('#statusPosition').textContent=`x ${Math.round(point.x)} · y ${Math.round(point.y)}`;if(message)$('#statusMessage').textContent=message}
});
const palette=new ComponentPalette($('#palette'),tool=>{editor.tool=tool;$('#canvasEmpty').classList.toggle('hidden',!!tool);if(tool!=='wire'){editor.pendingWire=null;editor.preview=null}editor.render()});
const properties=new PropertyPanel($('#properties'),(property,value)=>{const item=schematic.getComponent(editor.selection)||schematic.getWire(editor.selection);if(!item)return;editor.snapshot();if(property==='x'||property==='y')item.position[property]=value;else item[property]=value;markDirty();refresh()},()=>editor.remove());

function projectCaption(){return [schematic.brand,schematic.year].filter(Boolean).length?`${schematic.name} · ${[schematic.brand,schematic.year].filter(Boolean).join(' ')}`:schematic.name}
function markDirty(value=true){dirty=value;document.title=`${value?'• ':''}${schematic.name} — IPCS`;$('#projectTitle').textContent=`${projectCaption()}${value?' — non sauvegardé':''}`}
function refresh(){editor.render(simulation);renderStyles();renderBackground();const item=schematic.getComponent(editor.selection)||schematic.getWire(editor.selection);properties.render(item,schematic)}
function syncPdfViewport(view={pan:editor?.pan||{x:0,y:0},scale:editor?.scale||1}){const layer=$('#pdfViewport');if(layer)layer.style.transform=`translate(${view.pan.x}px,${view.pan.y}px) scale(${view.scale})`}
function renderBackground(){const layer=$('#pdfViewport'),pdf=$('#pdfBackground'),bg=schematic.background,active=bg?.visible&&bg?.dataUrl;if(active){if(pdf.src!==bg.dataUrl)pdf.src=bg.dataUrl;pdf.style.left=`${bg.x??0}px`;pdf.style.top=`${bg.y??0}px`;pdf.style.width=`${bg.width??1200}px`;pdf.style.height=`${bg.height??900}px`;pdf.style.opacity=String((bg.opacity??50)/100);layer.hidden=false;syncPdfViewport()}else{layer.hidden=true;pdf.removeAttribute('src')}$('#canvasWrap').classList.toggle('has-background',!!active)}
function runSimulation(){simulation=solver.solve(schematic);editor.render(simulation);$('#statusMessage').textContent=simulation.converged?`${simulation.poweredCoils.length} bobine(s) alimentée(s) · ${simulation.iterations} passe(s)`:simulation.diagnostic}
function renderStyles(){const root=$('#wireStyles');root.replaceChildren(...schematic.wireStyles.map(style=>{const button=document.createElement('button');button.className=`wire-style ${editor.styleId===style.id?'active':''}`;button.innerHTML=`<span class="wire-swatch" style="background:linear-gradient(135deg,${style.colors.map((color,index)=>`${color} ${index/style.colors.length*100}%,${color} ${(index+1)/style.colors.length*100}%`).join(',')})"></span><span>${style.name}</span>`;button.onclick=()=>{editor.styleId=style.id;renderStyles()};return button}))}
function setMode(mode){editor.setMode(mode);simulation=mode==='SIMULATION'?solver.solve(schematic):null;$('#editMode').classList.toggle('active',mode==='EDIT');$('#simMode').classList.toggle('active',mode==='SIMULATION');$('#statusMode').textContent=mode==='EDIT'?'ÉDITION':'SIMULATION';palette.clear();editor.tool=null;mode==='SIMULATION'?runSimulation():refresh()}
function loadProject(project,handle=null){schematic=project;fileHandle=handle;simulation=null;editor.setSchematic(schematic);setMode('EDIT');markDirty(false);refresh();toast(`Projet « ${schematic.name} » ouvert`)}
function fileToDataUrl(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file)})}
function numberValue(selector,fallback){const value=Number($(selector).value);return Number.isFinite(value)?value:fallback}

async function saveProject(){try{fileHandle=await SchematicSerializer.save(schematic,fileHandle);markDirty(false);toast(fileHandle?'Projet sauvegardé dans le fichier local':'Projet téléchargé dans votre dossier Téléchargements')}catch(error){if(error.name!=='AbortError')toast(`Échec de la sauvegarde : ${error.message}`)}}
async function openProject(){try{const result=await SchematicSerializer.open();if(result)loadProject(result.schematic,result.handle);else $('#fileInput').click()}catch(error){if(error.name!=='AbortError')toast(`Impossible d’ouvrir ce projet : ${error.message}`)}}
function fillDialog(project){const bg=project?.background;$('#projectName').value=project?.name||'Nouveau projet';$('#projectBrand').value=project?.brand||'';$('#projectYear').value=project?.year||'';$('#backgroundPdfInput').value='';$('#pdfFileName').textContent=bg?.name||'Aucun fichier sélectionné';$('#showBackground').checked=bg?.visible??true;$('#backgroundOpacity').value=bg?.opacity??50;$('#backgroundOpacityValue').textContent=`${bg?.opacity??50} %`;$('#backgroundX').value=bg?.x??0;$('#backgroundY').value=bg?.y??0;$('#backgroundWidth').value=bg?.width??1200;$('#backgroundHeight').value=bg?.height??900;$('#backgroundSettings').hidden=!bg;$('#snapStepX').value=project?.grid.snapGrid.stepX??10;$('#snapStepY').value=project?.grid.snapGrid.stepY??10;$('#referenceCellWidth').value=project?.grid.referenceGrid.cellWidth??200;$('#referenceCellHeight').value=project?.grid.referenceGrid.cellHeight??150;removeBackground=false}
function openProjectDialog(mode){dialogMode=mode;const editing=mode==='edit';$('#projectDialogTitle').textContent=editing?'Propriétés du projet':'Nouveau projet';$('#projectDialogHelp').textContent=editing?'Modifiez les informations, le calque PDF et les grilles du projet.':'Créez un espace de travail vide. Un plan PDF peut être placé en arrière-plan pour servir de guide.';$('#projectSubmitBtn').textContent=editing?'Appliquer':'Créer le projet';fillDialog(editing?schematic:null);$('#newProjectDialog').showModal();setTimeout(()=>$('#projectName').select())}

$('#newProjectForm').onsubmit=async event=>{event.preventDefault();const name=$('#projectName').value.trim();if(!name)return;const selectedPdf=$('#backgroundPdfInput').files[0];try{let background=dialogMode==='edit'&&!removeBackground?schematic.background:null;if(selectedPdf)background={name:selectedPdf.name,mimeType:selectedPdf.type||'application/pdf',dataUrl:await fileToDataUrl(selectedPdf)};if(background)Object.assign(background,{visible:$('#showBackground').checked,opacity:numberValue('#backgroundOpacity',50),x:numberValue('#backgroundX',0),y:numberValue('#backgroundY',0),width:Math.max(100,numberValue('#backgroundWidth',1200)),height:Math.max(100,numberValue('#backgroundHeight',900))});const data={name,brand:$('#projectBrand').value.trim(),year:$('#projectYear').value?numberValue('#projectYear',null):null,background,grid:{snapGrid:{enabled:true,visible:true,stepX:Math.max(1,numberValue('#snapStepX',10)),stepY:Math.max(1,numberValue('#snapStepY',10))},referenceGrid:{enabled:true,visible:true,cellWidth:Math.max(20,numberValue('#referenceCellWidth',200)),cellHeight:Math.max(20,numberValue('#referenceCellHeight',150))}}};$('#newProjectDialog').close();if(dialogMode==='new'){loadProject(new Schematic(data));fileHandle=null}else{Object.assign(schematic,data);refresh()}markDirty(true);toast(dialogMode==='new'?`Projet « ${name} » créé`:'Propriétés du projet mises à jour')}catch(error){toast(`Lecture du PDF impossible : ${error.message}`)}};
$('#backgroundPdfInput').onchange=event=>{const file=event.target.files[0];$('#pdfFileName').textContent=file?.name||schematic.background?.name||'Aucun fichier sélectionné';if(file){removeBackground=false;$('#backgroundSettings').hidden=false}};
$('#backgroundOpacity').oninput=event=>{$('#backgroundOpacityValue').textContent=`${event.target.value} %`};
$('#removeBackgroundBtn').onclick=()=>{removeBackground=true;$('#backgroundPdfInput').value='';$('#pdfFileName').textContent='Aucun fichier sélectionné';$('#backgroundSettings').hidden=true};
$('#newBtn').onclick=()=>openProjectDialog('new');$('#projectSettingsBtn').onclick=()=>openProjectDialog('edit');$('#closeNewDialog').onclick=()=>$('#newProjectDialog').close();$('#cancelNewProject').onclick=()=>$('#newProjectDialog').close();
$('#saveBtn').onclick=saveProject;$('#openBtn').onclick=openProject;
$('#fileInput').onchange=async event=>{const file=event.target.files[0];if(!file)return;try{loadProject(SchematicSerializer.parse(await file.text()))}catch(error){toast(`Fichier IPCS invalide : ${error.message}`)}finally{event.target.value=''}};
$('#editMode').onclick=()=>setMode('EDIT');$('#simMode').onclick=()=>setMode('SIMULATION');$('#undoBtn').onclick=()=>editor.undo();$('#redoBtn').onclick=()=>editor.redo();$('#zoomIn').onclick=()=>editor.zoom(1.2);$('#zoomOut').onclick=()=>editor.zoom(.8);$('#zoomReset').onclick=()=>editor.zoom(0);
$('#addStyleBtn').onclick=()=>{const colors=prompt('Couleurs CSS séparées par des virgules (1 à 3)','#2d7bd8,#ffffff');if(!colors)return;const list=colors.split(',').map(value=>value.trim()).filter(Boolean).slice(0,3);const id=`STYLE-${Date.now()}`;schematic.wireStyles.push(new WireStyle({id,name:list.join(' / '),colors:list}));editor.styleId=id;markDirty();refresh()};
window.addEventListener('keydown',event=>{if(event.ctrlKey&&event.key.toLowerCase()==='s'){event.preventDefault();saveProject()}if(event.ctrlKey&&event.key.toLowerCase()==='o'){event.preventDefault();openProject()}if(event.ctrlKey&&event.key.toLowerCase()==='n'){event.preventDefault();openProjectDialog('new')}});
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue=''}});
markDirty(false);refresh();

})();
