import {Component} from './Component.js';
export class PowerSource extends Component{constructor(d={}){super({...d,type:'powerSource',terminals:d.terminals||[{id:'OUT',kind:'output'},{id:'RETURN',kind:'return'}]});this.outputs=d.outputs||[{id:'OUT',label:'24 VAC',voltage:24,enabled:true}];}}
export class Coil extends Component{constructor(d={}){super({...d,type:'coil',terminals:d.terminals||[{id:'A'},{id:'B'}]});this.relayType=d.relayType||'';}}
export class Contact extends Component{constructor(d={}){super({...d,type:'contact',terminals:[{id:'A'},{id:'B'},{id:'COM'},{id:'NC'},{id:'NO'}]});this.contactType=d.contactType||'NO';this.controllerId=d.controllerId||null;this.manualActivated=!!d.manualActivated;this.mirrored=!!d.mirrored;}}
export class Lamp extends Component{constructor(d={}){super({...d,type:'lamp',terminals:d.terminals||[{id:'A'},{id:'B'}]});this.number=d.number||'';}}
export class Motor extends Component{constructor(d={}){super({...d,type:'motor',terminals:d.terminals||[{id:'A'},{id:'B'}]});}}
export class Transformer extends Component{constructor(d={}){super({...d,type:'transformer',terminals:[{id:'P1',kind:'primary'},{id:'P2',kind:'primary'},{id:'S1',kind:'phase'},{id:'S2',kind:'neutral'},{id:'S3',kind:'phase'}]});this.heightCells=Math.max(10,d.heightCells||10);}}
export class Fuse extends Component{constructor(d={}){super({...d,type:'fuse',terminals:d.terminals||[{id:'A'},{id:'B'}]});this.rating=d.rating||'10 A';this.blown=!!d.blown;}}
export class Junction extends Component{constructor(d={}){super({...d,type:'junction',terminals:d.terminals||[{id:'J'}]});}}
export const componentFromData=d=>({powerSource:PowerSource,coil:Coil,contact:Contact,lamp:Lamp,motor:Motor,transformer:Transformer,fuse:Fuse,junction:Junction}[d.type]||Component)===Component?new Component(d):new ({powerSource:PowerSource,coil:Coil,contact:Contact,lamp:Lamp,motor:Motor,transformer:Transformer,fuse:Fuse,junction:Junction}[d.type])(d);
