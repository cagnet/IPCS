import {Schematic} from './model/Schematic.js';
import {createExample} from './model/example.js';
import {SvgRenderer} from './rendering/SvgRenderer.js';
import {Editor} from './editor/Editor.js';
import {CircuitSolver} from './simulation/CircuitSolver.js';
import {SchematicSerializer} from './persistence/SchematicSerializer.js';
import {ComponentPalette} from './ui/ComponentPalette.js';
import {PropertyPanel} from './ui/PropertyPanel.js';
import {WireStyle} from './model/Wire.js';

let schematic=createExample(),simulation=null,fileHandle=null,dirty=false;
const $=selector=>document.querySelector(selector);
const svg=$('#schematic'),renderer=new SvgRenderer(svg),solver=new CircuitSolver();
const toast=message=>{const node=$('#toast');node.textContent=message;node.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.classList.remove('show'),2400)};

const editor=new Editor({svg,schematic,renderer,
 onChange:(reason,replacement)=>{if(replacement){schematic=replacement;editor.schematic=schematic}markDirty();editor.mode==='SIMULATION'?runSimulation():refresh()},
 onSelect:id=>{const item=schematic.getComponent(id)||schematic.getWire(id);properties.render(item,schematic);$('#statusSelection').textContent=item?`${item.id}${item.type?' · '+item.type:''}`:'Aucune sélection'},
 onStatus:(point,message)=>{if(point)$('#statusPosition').textContent=`x ${Math.round(point.x)} · y ${Math.round(point.y)}`;if(message)$('#statusMessage').textContent=message}
});
const palette=new ComponentPalette($('#palette'),tool=>{editor.tool=tool;$('#canvasEmpty').classList.toggle('hidden',!!tool);if(tool!=='wire'){editor.pendingWire=null;editor.preview=null}editor.render()});
const properties=new PropertyPanel($('#properties'),(property,value)=>{const item=schematic.getComponent(editor.selection)||schematic.getWire(editor.selection);if(!item)return;editor.snapshot();if(property==='x'||property==='y')item.position[property]=value;else item[property]=value;markDirty();refresh()},()=>editor.remove());

function markDirty(value=true){dirty=value;document.title=`${value?'• ':''}${schematic.name} — IPCS`;$('#projectTitle').textContent=`${schematic.name}${value?' — non sauvegardé':''}`}
function refresh(){editor.render(simulation);renderStyles();renderBackground();const item=schematic.getComponent(editor.selection)||schematic.getWire(editor.selection);properties.render(item,schematic)}
function renderBackground(){const pdf=$('#pdfBackground'),active=schematic.background?.visible&&schematic.background?.dataUrl;if(active){if(pdf.src!==schematic.background.dataUrl)pdf.src=schematic.background.dataUrl;pdf.hidden=false}else{pdf.hidden=true;pdf.removeAttribute('src')}$('#canvasWrap').classList.toggle('has-background',!!active)}
function runSimulation(){simulation=solver.solve(schematic);editor.render(simulation);$('#statusMessage').textContent=simulation.converged?`${simulation.poweredCoils.length} bobine(s) alimentée(s) · ${simulation.iterations} passe(s)`:simulation.diagnostic}
function renderStyles(){const root=$('#wireStyles');root.replaceChildren(...schematic.wireStyles.map(style=>{const button=document.createElement('button');button.className=`wire-style ${editor.styleId===style.id?'active':''}`;button.innerHTML=`<span class="wire-swatch" style="background:linear-gradient(135deg,${style.colors.map((color,index)=>`${color} ${index/style.colors.length*100}%,${color} ${(index+1)/style.colors.length*100}%`).join(',')})"></span><span>${style.name}</span>`;button.onclick=()=>{editor.styleId=style.id;renderStyles()};return button}))}
function setMode(mode){editor.setMode(mode);simulation=mode==='SIMULATION'?solver.solve(schematic):null;$('#editMode').classList.toggle('active',mode==='EDIT');$('#simMode').classList.toggle('active',mode==='SIMULATION');$('#statusMode').textContent=mode==='EDIT'?'ÉDITION':'SIMULATION';palette.clear();editor.tool=null;mode==='SIMULATION'?runSimulation():refresh()}
function loadProject(project,handle=null){schematic=project;fileHandle=handle;simulation=null;editor.setSchematic(schematic);setMode('EDIT');markDirty(false);refresh();toast(`Projet « ${schematic.name} » ouvert`)}
function fileToDataUrl(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file)})}

async function saveProject(){try{fileHandle=await SchematicSerializer.save(schematic,fileHandle);markDirty(false);toast(fileHandle?'Projet sauvegardé dans le fichier local':'Projet téléchargé dans votre dossier Téléchargements')}catch(error){if(error.name!=='AbortError')toast(`Échec de la sauvegarde : ${error.message}`)}}
async function openProject(){try{const result=await SchematicSerializer.open();if(result)loadProject(result.schematic,result.handle);else $('#fileInput').click()}catch(error){if(error.name!=='AbortError')toast(`Impossible d’ouvrir ce projet : ${error.message}`)}}
function openNewDialog(){const dialog=$('#newProjectDialog');$('#newProjectForm').reset();$('#projectName').value='Nouveau projet';$('#pdfFileName').textContent='Aucun fichier sélectionné';dialog.showModal();setTimeout(()=>$('#projectName').select())}

$('#newProjectForm').onsubmit=async event=>{event.preventDefault();const name=$('#projectName').value.trim();if(!name)return;const pdf=$('#backgroundPdfInput').files[0];try{const background=pdf?{name:pdf.name,mimeType:pdf.type||'application/pdf',dataUrl:await fileToDataUrl(pdf),visible:$('#showBackground').checked}:null;$('#newProjectDialog').close();loadProject(new Schematic({name,background}));fileHandle=null;markDirty(true);toast(`Projet « ${name} » créé`)}catch(error){toast(`Lecture du PDF impossible : ${error.message}`)}};
$('#backgroundPdfInput').onchange=event=>{$('#pdfFileName').textContent=event.target.files[0]?.name||'Aucun fichier sélectionné'};
$('#newBtn').onclick=openNewDialog;$('#closeNewDialog').onclick=()=>$('#newProjectDialog').close();$('#cancelNewProject').onclick=()=>$('#newProjectDialog').close();
$('#saveBtn').onclick=saveProject;$('#openBtn').onclick=openProject;
$('#fileInput').onchange=async event=>{const file=event.target.files[0];if(!file)return;try{loadProject(SchematicSerializer.parse(await file.text()))}catch(error){toast(`Fichier IPCS invalide : ${error.message}`)}finally{event.target.value=''}};
$('#editMode').onclick=()=>setMode('EDIT');$('#simMode').onclick=()=>setMode('SIMULATION');$('#undoBtn').onclick=()=>editor.undo();$('#redoBtn').onclick=()=>editor.redo();$('#zoomIn').onclick=()=>editor.zoom(1.2);$('#zoomOut').onclick=()=>editor.zoom(.8);$('#zoomReset').onclick=()=>editor.zoom(0);
$('#addStyleBtn').onclick=()=>{const colors=prompt('Couleurs CSS séparées par des virgules (1 à 3)','#2d7bd8,#ffffff');if(!colors)return;const list=colors.split(',').map(value=>value.trim()).filter(Boolean).slice(0,3);const id=`STYLE-${Date.now()}`;schematic.wireStyles.push(new WireStyle({id,name:list.join(' / '),colors:list}));editor.styleId=id;markDirty();refresh()};
window.addEventListener('keydown',event=>{if(event.ctrlKey&&event.key.toLowerCase()==='s'){event.preventDefault();saveProject()}if(event.ctrlKey&&event.key.toLowerCase()==='o'){event.preventDefault();openProject()}if(event.ctrlKey&&event.key.toLowerCase()==='n'){event.preventDefault();openNewDialog()}});
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue=''}});
markDirty(false);refresh();
