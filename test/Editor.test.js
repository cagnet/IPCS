import test from 'node:test';
import assert from 'node:assert/strict';
import {Editor} from '../src/editor/Editor.js';
import {Schematic} from '../src/model/Schematic.js';

function editorStub(){const editor=Object.create(Editor.prototype);editor.schematic=new Schematic();editor.styleId='RED';editor.selections=new Set();editor.render=()=>{};editor.onStatus=()=>{};editor.snapshot=()=>{};editor.onSelect=()=>{};editor.onChange=()=>{};return editor}

test('chaque clic ajoute un point orthogonal et une borne termine le fil',()=>{const editor=editorStub();editor.wireClick('A:OUT',{x:0,y:0},false);editor.wireClick(null,{x:40,y:30},false);editor.wireClick(null,{x:60,y:80},false);editor.wireClick('B:A',{x:100,y:100},false);assert.deepEqual(editor.schematic.wires[0].points,[{x:0,y:0},{x:40,y:0},{x:40,y:80},{x:100,y:80},{x:100,y:100}]);assert.equal(editor.pendingWire,null)});

test('le clic libre avec Maj conserve les coordonnées exactes',()=>{const editor=editorStub();editor.wireClick('A:OUT',{x:0,y:0},false);editor.wireClick(null,{x:25,y:35},true);assert.deepEqual(editor.pendingWire.points,[{x:0,y:0},{x:25,y:35}])});

test('le rectangle ne retient que les éléments complètement contenus',()=>{const editor=editorStub();editor.schematic.addComponent({id:'R1',type:'coil',label:'dedans',position:{x:100,y:100},rotation:0,terminals:[]});editor.schematic.addComponent({id:'R2',type:'coil',label:'partiel',position:{x:190,y:100},rotation:0,terminals:[]});editor.schematic.addWire({id:'W1',from:'A:X',to:'B:X',points:[{x:20,y:20},{x:180,y:180}]});editor.schematic.addWire({id:'W2',from:'A:Y',to:'B:Y',points:[{x:20,y:20},{x:220,y:180}]});assert.deepEqual(editor.itemsInRect({x:0,y:0,width:200,height:200}),['R1','W1'])});

test('les extrémités des fils suivent le déplacement et la rotation du composant',()=>{const editor=editorStub();const coil=editor.schematic.addComponent({id:'R1',type:'coil',label:'relais',position:{x:100,y:100},rotation:0});editor.schematic.addWire({id:'W1',from:'R1:A',to:'X:A',points:[{x:50,y:100},{x:0,y:100}]});editor.schematic.addWire({id:'W2',from:'X:B',to:'R1:B',points:[{x:0,y:120},{x:150,y:100}]});coil.position={x:200,y:150};editor.syncConnectedWires(coil);assert.deepEqual(editor.schematic.getWire('W1').points[0],{x:150,y:150});assert.deepEqual(editor.schematic.getWire('W2').points.at(-1),{x:250,y:150});coil.rotation=90;editor.syncConnectedWires(coil);assert.deepEqual(editor.schematic.getWire('W1').points[0],{x:200,y:100});assert.deepEqual(editor.schematic.getWire('W2').points.at(-1),{x:200,y:200})});

test('un fil peut être sélectionné directement',()=>{const editor=editorStub();editor.select('W1');assert.equal(editor.selection,'W1');assert.deepEqual([...editor.selections],['W1'])});
