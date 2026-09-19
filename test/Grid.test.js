import test from 'node:test';
import assert from 'node:assert/strict';
import {gridExtent,referenceOf} from '../src/model/Schematic.js';

test('F27 définit un canevas de 27 colonnes et 6 lignes',()=>{
 const grid={maxReference:'F27',cellWidth:10,cellHeight:20};
 assert.deepEqual(gridExtent(grid),{width:270,height:120,rows:6,columns:27,label:'F27'});
 assert.equal(referenceOf({x:1,y:119},grid),'A-1');
 assert.equal(referenceOf({x:269,y:1},grid),'F-27');
});
