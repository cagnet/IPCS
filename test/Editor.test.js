import test from 'node:test';
import assert from 'node:assert/strict';
import {Editor} from '../src/editor/Editor.js';
import {Schematic} from '../src/model/Schematic.js';

function editorStub(){const editor=Object.create(Editor.prototype);editor.schematic=new Schematic();editor.styleId='RED';editor.render=()=>{};editor.onStatus=()=>{};editor.snapshot=()=>{};editor.select=id=>{editor.selection=id};editor.onChange=()=>{};return editor}

test('chaque clic ajoute un point orthogonal et une borne termine le fil',()=>{const editor=editorStub();editor.wireClick('A:OUT',{x:0,y:0},false);editor.wireClick(null,{x:40,y:30},false);editor.wireClick(null,{x:60,y:80},false);editor.wireClick('B:A',{x:100,y:100},false);assert.deepEqual(editor.schematic.wires[0].points,[{x:0,y:0},{x:40,y:0},{x:40,y:80},{x:100,y:80},{x:100,y:100}]);assert.equal(editor.pendingWire,null)});

test('le clic libre avec Maj conserve les coordonnées exactes',()=>{const editor=editorStub();editor.wireClick('A:OUT',{x:0,y:0},false);editor.wireClick(null,{x:25,y:35},true);assert.deepEqual(editor.pendingWire.points,[{x:0,y:0},{x:25,y:35}])});
