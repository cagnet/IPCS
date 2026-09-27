import {componentFromData} from '../model/components.js';
import {SvgRenderer} from '../rendering/SvgRenderer.js';

const PALETTE_NS='http://www.w3.org/2000/svg';
const previewSchematic={grid:{snapGrid:{stepX:25,stepY:25},referenceGrid:{cellWidth:200,cellHeight:150,maxReference:'G12'}}};
const previewView={selection:null,selections:new Set(),related:new Set(),simulation:null};

export class ComponentPalette{
 constructor(root,onPick){this.items=[['select','Sélection'],['powerSource','Alimentation'],['coil','Relais'],['lamp','Lampe'],['motor','Moteur'],['transformer','Transformateur'],['fuse','Fusible'],['contact','Contact'],['counter','Compteur'],['adjTip','ADJ TIP'],['remoteConnector','Connecteur distant'],['junction','Jonction']];this.root=root;this.onPick=onPick;this.selected='select';this.render()}
 render(){this.root.replaceChildren(...this.items.map(([id,label])=>{const button=document.createElement('button'),caption=document.createElement('span');button.dataset.tool=id;caption.className='palette-label';caption.textContent=label;button.append(id==='select'?selectionIcon():componentIcon(id),caption);button.classList.toggle('active',id===this.selected);button.onclick=()=>this.select(id);return button}))}
 select(id='select'){this.selected=id;this.root.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x.dataset.tool===id));this.onPick(id)}
 deselect(){this.selected=null;this.root.querySelectorAll('button').forEach(x=>x.classList.remove('active'))}
 clear(){this.select('select')}
}

function selectionIcon(){const span=document.createElement('span');span.className='palette-icon';span.textContent='↖';span.setAttribute('aria-hidden','true');return span}
function componentIcon(type){const svg=document.createElementNS(PALETTE_NS,'svg'),data={id:'PREVIEW',type,position:{x:0,y:0},rotation:0,showId:false,showLabel:false};if(type==='counter')Object.assign(data,{positions:4,heightCells:4,pinSpacingCells:2});if(type==='adjTip')Object.assign(data,{rows:2,rowSpacingCells:2,heightCells:1,lineLabels:['1','2'],tipPositions:[1]});if(type==='transformer')data.heightCells=10;if(type==='contact')Object.assign(data,{contactType:'NO',controlMode:'SW'});if(type==='remoteConnector')data.direction='out';const component=componentFromData(data),renderer=Object.create(SvgRenderer.prototype),group=renderer.componentNode(component,previewSchematic,previewView);svg.setAttribute('viewBox',iconViewBox(type));svg.setAttribute('class','palette-icon');svg.setAttribute('aria-hidden','true');svg.append(group);return svg}
function iconViewBox(type){if(type==='transformer')return'-70 -140 140 280';if(type==='counter')return'-35 -60 220 120';if(type==='adjTip')return'-55 -60 110 120';return'-65 -45 130 90'}
