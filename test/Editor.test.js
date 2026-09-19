import test from 'node:test';
import assert from 'node:assert/strict';
import {Editor} from '../src/editor/Editor.js';
import {Schematic} from '../src/model/Schematic.js';

function editorStub(){const editor=Object.create(Editor.prototype);editor.schematic=new Schematic();editor.styleId='RED';editor.wireDescription='';editor.selections=new Set();editor.selectedWirePoint=null;editor.render=()=>{};editor.onStatus=()=>{};editor.snapshot=()=>{};editor.onSelect=()=>{};editor.onChange=()=>{};return editor}
const isOrthogonal=wire=>wire.points.slice(1).every((point,index)=>point.x===wire.points[index].x||point.y===wire.points[index].y);

test('chaque clic ajoute un point orthogonal et une borne termine le fil',()=>{const editor=editorStub();editor.wireClick('A:OUT',{x:0,y:0},false);editor.wireClick(null,{x:40,y:30},false);editor.wireClick(null,{x:60,y:80},false);editor.wireClick('B:A',{x:100,y:100},false);assert.deepEqual(editor.schematic.wires[0].points,[{x:0,y:0},{x:40,y:0},{x:40,y:80},{x:100,y:80},{x:100,y:100}]);assert.equal(editor.pendingWire,null)});

test('la description saisie est enregistrée sur le nouveau fil',()=>{const editor=editorStub();editor.wireDescription='Alimentation bobine gauche';editor.wireClick('A:OUT',{x:0,y:0},false);editor.wireClick('B:A',{x:100,y:0},false);assert.equal(editor.schematic.wires[0].description,'Alimentation bobine gauche')});

test('le clic libre avec Maj conserve les coordonnées exactes',()=>{const editor=editorStub();editor.wireClick('A:OUT',{x:0,y:0},false);editor.wireClick(null,{x:25,y:35},true);assert.deepEqual(editor.pendingWire.points,[{x:0,y:0},{x:25,y:35}])});

test('le rectangle ne retient que les éléments complètement contenus',()=>{const editor=editorStub();editor.schematic.addComponent({id:'R1',type:'coil',label:'dedans',position:{x:100,y:100},rotation:0,terminals:[]});editor.schematic.addComponent({id:'R2',type:'coil',label:'partiel',position:{x:190,y:100},rotation:0,terminals:[]});editor.schematic.addWire({id:'W1',from:'A:X',to:'B:X',points:[{x:20,y:20},{x:180,y:180}]});editor.schematic.addWire({id:'W2',from:'A:Y',to:'B:Y',points:[{x:20,y:20},{x:220,y:180}]});assert.deepEqual(editor.itemsInRect({x:0,y:0,width:200,height:200}),['R1','W1'])});

test('les extrémités suivent le composant en restant orthogonales',()=>{const editor=editorStub();const coil=editor.schematic.addComponent({id:'R1',type:'coil',label:'relais',position:{x:100,y:100},rotation:0});editor.schematic.addWire({id:'W1',from:'R1:A',to:'X:A',points:[{x:50,y:100},{x:0,y:100}]});editor.schematic.addWire({id:'W2',from:'X:B',to:'R1:B',points:[{x:0,y:120},{x:150,y:100}]});coil.position={x:200,y:150};editor.syncConnectedWires(coil);assert.deepEqual(editor.schematic.getWire('W1').points[0],{x:150,y:150});assert.deepEqual(editor.schematic.getWire('W2').points.at(-1),{x:250,y:150});assert.ok(editor.schematic.wires.every(isOrthogonal));coil.rotation=90;editor.syncConnectedWires(coil);assert.deepEqual(editor.schematic.getWire('W1').points[0],{x:200,y:100});assert.deepEqual(editor.schematic.getWire('W2').points.at(-1),{x:200,y:200});assert.ok(editor.schematic.wires.every(isOrthogonal))});

test('un fil peut être sélectionné directement',()=>{const editor=editorStub();editor.select('W1');assert.equal(editor.selection,'W1');assert.deepEqual([...editor.selections],['W1'])});

test('déplacer puis supprimer un sommet garde les extrémités et les segments orthogonaux',()=>{const editor=editorStub();const wire=editor.schematic.addWire({id:'W1',from:'A:X',to:'B:X',points:[{x:0,y:0},{x:100,y:0},{x:100,y:100}]});const drag={wireId:'W1',index:1,originalPoints:wire.points.map(p=>({...p})),previousOrientation:'H',nextOrientation:'V'};editor.moveWirePoint(drag,{x:60,y:40});assert.deepEqual(wire.points[0],{x:0,y:0});assert.deepEqual(wire.points.at(-1),{x:100,y:100});assert.ok(isOrthogonal(wire));editor.selection='W1';editor.selectedWirePoint=2;assert.equal(editor.deleteSelectedWirePoint(),true);assert.ok(isOrthogonal(wire))});

test('supprimer un sommet diagonal recrée le coude nécessaire',()=>{const editor=editorStub();const wire=editor.schematic.addWire({id:'W1',from:'A:X',to:'B:X',points:[{x:0,y:0},{x:100,y:0},{x:100,y:100},{x:200,y:100}]});editor.selection='W1';editor.selectedWirePoint=1;editor.deleteSelectedWirePoint();assert.ok(isOrthogonal(wire));assert.deepEqual(wire.points[0],{x:0,y:0});assert.deepEqual(wire.points.at(-1),{x:200,y:100})});

test('les cinq bornes du transformateur sont sur la grille et suivent sa rotation',()=>{const editor=editorStub();editor.schematic.addComponent({id:'T1',type:'transformer',position:{x:100,y:100},rotation:0});assert.deepEqual(editor.terminalPosition('T1:P1'),{x:50,y:-25});assert.deepEqual(editor.terminalPosition('T1:S2'),{x:150,y:100});editor.schematic.getComponent('T1').rotation=90;assert.deepEqual(editor.terminalPosition('T1:P1'),{x:225,y:50});assert.deepEqual(editor.terminalPosition('T1:S2'),{x:100,y:150})});

test('un inverseur miroir échange physiquement les bornes ON et OFF',()=>{const editor=editorStub();const contact=editor.schematic.addComponent({id:'SW1',type:'contact',contactType:'CHANGEOVER',position:{x:100,y:100},rotation:0});assert.deepEqual(editor.terminalPosition('SW1:NC'),{x:150,y:86});assert.deepEqual(editor.terminalPosition('SW1:NO'),{x:150,y:114});contact.mirrored=true;assert.deepEqual(editor.terminalPosition('SW1:NC'),{x:150,y:114});assert.deepEqual(editor.terminalPosition('SW1:NO'),{x:150,y:86})});

test('les nouveaux composants sont orientés de bas vers le haut',()=>{const editor=editorStub();editor.add('lamp',{x:100,y:100});assert.equal(editor.schematic.getComponent('L1').rotation,270);assert.deepEqual(editor.terminalPosition('L1:A'),{x:100,y:150});assert.deepEqual(editor.terminalPosition('L1:B'),{x:100,y:50})});
