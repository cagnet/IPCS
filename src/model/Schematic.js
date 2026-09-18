import {componentFromData} from './components.js';import {Wire,WireStyle} from './Wire.js';
export class Schematic{
 constructor(data={}){this.formatVersion=1;this.name=data.name||'Nouveau projet';this.background=data.background||null;this.grid=data.grid||{snapGrid:{enabled:true,stepX:10,stepY:10,visible:true},referenceGrid:{enabled:true,visible:true,cellWidth:200,cellHeight:150}};this.components=(data.components||[]).map(componentFromData);this.wires=(data.wires||[]).map(w=>new Wire(w));this.wireStyles=(data.wireStyles||defaultStyles()).map(s=>new WireStyle(s));this.relations=data.relations||[];}
 getComponent(id){return this.components.find(c=>c.id===id)} getWire(id){return this.wires.find(w=>w.id===id)}
 addComponent(c){this.components.push(componentFromData(c));return this.components.at(-1)} addWire(w){this.wires.push(new Wire(w));return this.wires.at(-1)}
 remove(id){this.components=this.components.filter(c=>c.id!==id);this.wires=this.wires.filter(w=>w.id!==id&&!w.from?.startsWith(id+':')&&!w.to?.startsWith(id+':'));this.components.filter(c=>c.controllerId===id).forEach(c=>c.controllerId=null);}
 nextId(prefix){let n=1;const ids=new Set([...this.components,...this.wires].map(x=>x.id));while(ids.has(`${prefix}${n}`))n++;return `${prefix}${n}`;}
 toJSON(){return {formatVersion:this.formatVersion,name:this.name,background:this.background,grid:this.grid,wireStyles:this.wireStyles,components:this.components,wires:this.wires,relations:this.components.filter(c=>c.type==='contact'&&c.controllerId).map(c=>({type:'coilControlsContact',from:c.controllerId,to:c.id}))};}
}
export const defaultStyles=()=>[{id:'RED',name:'Rouge',colors:['#d83232']},{id:'RED-WHITE',name:'Rouge / Blanc',colors:['#d83232','#fff']},{id:'RED-WHITE-BLUE',name:'Rouge / Blanc / Bleu',colors:['#d83232','#fff','#2879bf']}];
export function referenceOf(position,grid,height=1200){const col=Math.max(1,Math.floor(position.x/grid.cellWidth)+1);const row=Math.max(0,Math.floor((height-position.y)/grid.cellHeight));return `${letters(row)}-${col}`;}function letters(n){let s='';do{s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26)-1}while(n>=0);return s;}
