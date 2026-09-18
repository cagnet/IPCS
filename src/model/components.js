import {Component} from './Component.js';
export class PowerSource extends Component{constructor(d={}){super({...d,type:'powerSource',terminals:d.terminals||[{id:'OUT',kind:'output'},{id:'RETURN',kind:'return'}]});this.outputs=d.outputs||[{id:'OUT',label:'24 VAC',voltage:24,enabled:true}];}}
export class Coil extends Component{constructor(d={}){super({...d,type:'coil',terminals:d.terminals||[{id:'A'},{id:'B'}]});}}
export class Contact extends Component{constructor(d={}){super({...d,type:'contact',terminals:d.terminals||[{id:'A'},{id:'B'}]});this.contactType=d.contactType||'NO';this.controlType=d.controlType||'manual';this.controllerId=d.controllerId||null;this.manualActivated=!!d.manualActivated;}}
export class Junction extends Component{constructor(d={}){super({...d,type:'junction',terminals:d.terminals||[{id:'J'}]});}}
export const componentFromData=d=>({powerSource:PowerSource,coil:Coil,contact:Contact,junction:Junction}[d.type]||Component)===Component?new Component(d):new ({powerSource:PowerSource,coil:Coil,contact:Contact,junction:Junction}[d.type])(d);
