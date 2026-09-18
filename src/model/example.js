import {Schematic} from './Schematic.js';
export function createExample(){return new Schematic({name:'Démonstration relais en cascade',components:[
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
