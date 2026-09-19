import {Schematic} from '../model/Schematic.js';
const PROJECT_PICKER_ID='ipcs-projects',PROJECT_FILE_TYPES=[{description:'Projet IPCS',accept:{'application/json':['.ipcs','.json']}}];
export class SchematicSerializer{
 static stringify(s){return JSON.stringify(s.toJSON(),null,2)}
 static parse(text){const d=JSON.parse(text);if(d.formatVersion!==1)throw new Error(`Version IPCS non supportée : ${d.formatVersion}`);return new Schematic(d)}
 static fileName(s){return `${s.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase()||'projet'}.ipcs`}
 static async save(s,existingHandle=null){const contents=this.stringify(s);if('showSaveFilePicker'in window){const handle=existingHandle||await window.showSaveFilePicker({id:PROJECT_PICKER_ID,startIn:'documents',suggestedName:this.fileName(s),types:PROJECT_FILE_TYPES});const writable=await handle.createWritable();await writable.write(contents);await writable.close();return handle}this.download(s);return null}
 static async open(){if('showOpenFilePicker'in window){const [handle]=await window.showOpenFilePicker({id:PROJECT_PICKER_ID,startIn:'documents',multiple:false,types:PROJECT_FILE_TYPES});const file=await handle.getFile();return {schematic:this.parse(await file.text()),handle}}return null}
 static download(s){const a=document.createElement('a');const url=URL.createObjectURL(new Blob([this.stringify(s)],{type:'application/json'}));a.href=url;a.download=this.fileName(s);a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
}
