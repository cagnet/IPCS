import test from 'node:test';
import assert from 'node:assert/strict';
import {Editor} from '../src/editor/Editor.js';
import {Schematic} from '../src/model/Schematic.js';

function editorStub(){const editor=Object.create(Editor.prototype);editor.schematic=new Schematic();editor.styleId='RED';editor.render=()=>{};editor.onStatus=()=>{};editor.snapshot=()=>{};editor.select=id=>{editor.selection=id};editor.onChange=()=>{};return editor}

test('chaque clic ajoute un point orthogonal et une borne termine le fil',()=>{const editor=editorStub();editor.wireClick('A:OUT',{x:0,y:0},false);editor.wireClick(null,{x:40,y:30},false);editor.wireClick(null,{x:60,y:80},false);editor.wireClick('B:A',{x:100,y:100},false);assert.deepEqual(editor.schematic.wires[0].points,[{x:0,y:0},{x:40,y:0},{x:40,y:80},{x:100,y:80},{x:100,y:100}]);assert.equal(editor.pendingWire,null)});

test('le clic libre avec Maj conserve les coordonnées exactes',()=>{const editor=editorStub();editor.wireClick('A:OUT',{x:0,y:0},false);editor.wireClick(null,{x:25,y:35},true);assert.deepEqual(editor.pendingWire.points,[{x:0,y:0},{x:25,y:35}])});

test('le rectangle ne retient que les éléments complètement contenus',()=>{const editor=editorStub();editor.schematic.addComponent({id:'R1',type:'coil',label:'dedans',position:{x:100,y:100},rotation:0,terminals:[]});editor.schematic.addComponent({id:'R2',type:'coil',label:'partiel',position:{x:190,y:100},rotation:0,terminals:[]});editor.schematic.addWire({id:'W1',from:'A:X',to:'B:X',points:[{x:20,y:20},{x:180,y:180}]});editor.schematic.addWire({id:'W2',from:'A:Y',to:'B:Y',points:[{x:20,y:20},{x:220,y:180}]});assert.deepEqual(editor.itemsInRect({x:0,y:0,width:200,height:200}),['R1','W1'])});
