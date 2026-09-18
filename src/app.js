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
let renderedPdfSource=null,pdfRenderToken=0;
const $=selector=>document.querySelector(selector);
const svg=$('#schematic'),renderer=new SvgRenderer(svg),solver=new CircuitSolver();
if(window.pdfjsLib)window.pdfjsLib.GlobalWorkerOptions.workerSrc='vendor/pdfjs/pdf.worker.min.js';
const toast=message=>{const node=$('#toast');node.textContent=message;node.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.classList.remove('show'),2400)};

const editor=new Editor({svg,schematic,renderer,
 onViewportChange:syncPdfViewport,
 onCancel:()=>palette.select('select'),
 onChange:(reason,replacement)=>{if(replacement){schematic=replacement;editor.schematic=schematic}markDirty();editor.mode==='SIMULATION'?runSimulation():refresh()},
 onSelect:(id,ids=[])=>{const item=ids.length===1?(schematic.getComponent(id)||schematic.getWire(id)):null;properties.render(item,schematic);$('#statusSelection').textContent=ids.length>1?`${ids.length} éléments sélectionnés`:item?`${item.id}${item.type?' · '+item.type:''}`:'Aucune sélection'},
 onStatus:(point,message)=>{if(point)$('#statusPosition').textContent=`x ${Math.round(point.x)} · y ${Math.round(point.y)}`;if(message)$('#statusMessage').textContent=message}
});
const palette=new ComponentPalette($('#palette'),tool=>{editor.tool=tool==='select'?null:tool;$('#canvasEmpty').classList.toggle('hidden',tool!=='select');if(tool!=='wire'){editor.pendingWire=null;editor.preview=null}editor.render()});
const properties=new PropertyPanel($('#properties'),(property,value)=>{const item=schematic.getComponent(editor.selection)||schematic.getWire(editor.selection);if(!item)return;editor.snapshot();if(property==='x'||property==='y')item.position[property]=value;else item[property]=value;if(item.type&&['x','y','rotation'].includes(property))editor.syncConnectedWires(item);markDirty();refresh()},()=>editor.remove(),updateProjectProperty);

function projectCaption(){return [schematic.brand,schematic.year].filter(Boolean).length?`${schematic.name} · ${[schematic.brand,schematic.year].filter(Boolean).join(' ')}`:schematic.name}
function markDirty(value=true){dirty=value;document.title=`${value?'• ':''}${schematic.name} — IPCS`;$('#projectTitle').textContent=`${projectCaption()}${value?' — non sauvegardé':''}`}
function refresh(){editor.render(simulation);renderStyles();renderBackground();const item=schematic.getComponent(editor.selection)||schematic.getWire(editor.selection);properties.render(item,schematic)}
function syncPdfViewport(view={pan:editor?.pan||{x:0,y:0},scale:editor?.scale||1}){const layer=$('#pdfViewport');if(layer)layer.style.transform=`translate(${view.pan.x}px,${view.pan.y}px) scale(${view.scale})`}
function renderBackground(){const layer=$('#pdfViewport'),canvas=$('#pdfBackground'),bg=schematic.background,active=bg?.visible&&bg?.dataUrl;if(active){canvas.style.left=`${bg.x??0}px`;canvas.style.top=`${1800-(bg.y??0)-(bg.height??900)}px`;canvas.style.width=`${bg.width??1200}px`;canvas.style.height=`${bg.height??900}px`;canvas.style.opacity=String((bg.opacity??50)/100);layer.hidden=false;syncPdfViewport();renderPdfPage(bg.dataUrl)}else layer.hidden=true;$('#canvasWrap').classList.toggle('has-background',!!active)}
function pdfBytes(dataUrl){const base64=dataUrl.slice(dataUrl.indexOf(',')+1),binary=atob(base64),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes}
async function pdfSize(dataUrl){if(!window.pdfjsLib)throw new Error('La bibliothèque PDF.js est indisponible');const document=await window.pdfjsLib.getDocument({data:pdfBytes(dataUrl)}).promise,page=await document.getPage(1),viewport=page.getViewport({scale:1});return{width:Math.round(viewport.width),height:Math.round(viewport.height)}}
async function backgroundFromFile(file){const dataUrl=await fileToDataUrl(file),size=await pdfSize(dataUrl);return{name:file.name,mimeType:file.type||'application/pdf',dataUrl,visible:true,opacity:50,x:0,y:0,...size}}
async function renderPdfPage(dataUrl){if(renderedPdfSource===dataUrl)return;const token=++pdfRenderToken;try{if(!window.pdfjsLib)throw new Error('La bibliothèque PDF.js est indisponible');const document=await window.pdfjsLib.getDocument({data:pdfBytes(dataUrl)}).promise,page=await document.getPage(1),initial=page.getViewport({scale:1}),scale=Math.min(3,2000/initial.width),viewport=page.getViewport({scale}),canvas=$('#pdfBackground'),context=canvas.getContext('2d',{alpha:false});if(token!==pdfRenderToken)return;canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);await page.render({canvasContext:context,viewport}).promise;if(token===pdfRenderToken)renderedPdfSource=dataUrl}catch(error){if(token===pdfRenderToken){renderedPdfSource=null;toast(`Affichage du PDF impossible : ${error.message}`)}}}
function runSimulation(){simulation=solver.solve(schematic);editor.render(simulation);$('#statusMessage').textContent=simulation.converged?`${simulation.poweredCoils.length} bobine(s) alimentée(s) · ${simulation.iterations} passe(s)`:simulation.diagnostic}
function renderStyles(){const root=$('#wireStyles');root.replaceChildren(...schematic.wireStyles.map(style=>{const button=document.createElement('button');button.className=`wire-style ${editor.styleId===style.id?'active':''}`;button.innerHTML=`<span class="wire-swatch" style="background:linear-gradient(135deg,${style.colors.map((color,index)=>`${color} ${index/style.colors.length*100}%,${color} ${(index+1)/style.colors.length*100}%`).join(',')})"></span><span>${style.name}</span>`;button.onclick=()=>{editor.styleId=style.id;renderStyles()};return button}))}
function setMode(mode){editor.setMode(mode);simulation=mode==='SIMULATION'?solver.solve(schematic):null;$('#editMode').classList.toggle('active',mode==='EDIT');$('#simMode').classList.toggle('active',mode==='SIMULATION');$('#statusMode').textContent=mode==='EDIT'?'ÉDITION':'SIMULATION';palette.clear();editor.tool=null;mode==='SIMULATION'?runSimulation():refresh()}
function loadProject(project,handle=null){schematic=project;fileHandle=handle;simulation=null;editor.setSchematic(schematic);setMode('EDIT');markDirty(false);refresh();toast(`Projet « ${schematic.name} » ouvert`)}
function fileToDataUrl(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file)})}
function numberValue(selector,fallback){const value=Number($(selector).value);return Number.isFinite(value)?value:fallback}
async function updateProjectProperty(path,value){try{const [section,key]=path.split('.');if(path==='background.file'){schematic.background=await backgroundFromFile(value);renderedPdfSource=null}else if(path==='background.remove'){schematic.background=null;renderedPdfSource=null}else if(section==='background'){if(!schematic.background)return;schematic.background[key]=value}else if(key)schematic.grid[section][key]=value;else schematic[section]=value;markDirty();editor.render(simulation);renderBackground();if(path==='background.file'||path==='background.remove')properties.render(null,schematic)}catch(error){toast(`Modification du projet impossible : ${error.message}`)}}

async function saveProject(){try{fileHandle=await SchematicSerializer.save(schematic,fileHandle);markDirty(false);toast(fileHandle?'Projet sauvegardé dans le fichier local':'Projet téléchargé dans votre dossier Téléchargements')}catch(error){if(error.name!=='AbortError')toast(`Échec de la sauvegarde : ${error.message}`)}}
async function openProject(){try{const result=await SchematicSerializer.open();if(result)loadProject(result.schematic,result.handle);else $('#fileInput').click()}catch(error){if(error.name!=='AbortError')toast(`Impossible d’ouvrir ce projet : ${error.message}`)}}
function fillDialog(project){const bg=project?.background;$('#projectName').value=project?.name||'Nouveau projet';$('#projectBrand').value=project?.brand||'';$('#projectYear').value=project?.year||'';$('#backgroundPdfInput').value='';$('#pdfFileName').textContent=bg?.name||'Aucun fichier sélectionné'}
function openProjectDialog(){$('#projectDialogTitle').textContent='Nouveau projet';$('#projectDialogHelp').textContent='Créez un espace de travail vide. Un plan PDF peut être placé en arrière-plan pour servir de guide.';$('#projectSubmitBtn').textContent='Créer le projet';fillDialog(null);$('#newProjectDialog').showModal();setTimeout(()=>$('#projectName').select())}

$('#newProjectForm').onsubmit=async event=>{event.preventDefault();const name=$('#projectName').value.trim();if(!name)return;const selectedPdf=$('#backgroundPdfInput').files[0];try{const background=selectedPdf?await backgroundFromFile(selectedPdf):null,data={name,brand:$('#projectBrand').value.trim(),year:$('#projectYear').value?numberValue('#projectYear',null):null,background};$('#newProjectDialog').close();loadProject(new Schematic(data));fileHandle=null;markDirty(true);toast(`Projet « ${name} » créé`)}catch(error){toast(`Lecture du PDF impossible : ${error.message}`)}};
$('#backgroundPdfInput').onchange=event=>{$('#pdfFileName').textContent=event.target.files[0]?.name||schematic.background?.name||'Aucun fichier sélectionné'};
$('#newBtn').onclick=openProjectDialog;$('#projectSettingsBtn').onclick=()=>{palette.select('select');editor.select(null);properties.render(null,schematic);$('#statusMessage').textContent='Propriétés du projet'};$('#closeNewDialog').onclick=()=>$('#newProjectDialog').close();$('#cancelNewProject').onclick=()=>$('#newProjectDialog').close();
$('#saveBtn').onclick=saveProject;$('#openBtn').onclick=openProject;
$('#fileInput').onchange=async event=>{const file=event.target.files[0];if(!file)return;try{loadProject(SchematicSerializer.parse(await file.text()))}catch(error){toast(`Fichier IPCS invalide : ${error.message}`)}finally{event.target.value=''}};
$('#editMode').onclick=()=>setMode('EDIT');$('#simMode').onclick=()=>setMode('SIMULATION');$('#undoBtn').onclick=()=>editor.undo();$('#redoBtn').onclick=()=>editor.redo();$('#zoomIn').onclick=()=>editor.zoom(1.2);$('#zoomOut').onclick=()=>editor.zoom(.8);$('#zoomReset').onclick=()=>editor.zoom(0);
$('#addStyleBtn').onclick=()=>{const colors=prompt('Couleurs CSS séparées par des virgules (1 à 3)','#2d7bd8,#ffffff');if(!colors)return;const list=colors.split(',').map(value=>value.trim()).filter(Boolean).slice(0,3);const id=`STYLE-${Date.now()}`;schematic.wireStyles.push(new WireStyle({id,name:list.join(' / '),colors:list}));editor.styleId=id;markDirty();refresh()};
window.addEventListener('keydown',event=>{if(event.ctrlKey&&event.key.toLowerCase()==='s'){event.preventDefault();saveProject()}if(event.ctrlKey&&event.key.toLowerCase()==='o'){event.preventDefault();openProject()}if(event.ctrlKey&&event.key.toLowerCase()==='n'){event.preventDefault();openProjectDialog()}});
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue=''}});
markDirty(false);refresh();
