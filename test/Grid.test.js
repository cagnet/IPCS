import test from 'node:test';
import assert from 'node:assert/strict';
import {gridExtent,referenceOf,Schematic} from '../src/model/Schematic.js';

test('la grille d’édition utilise un pas de 25 par défaut',()=>{
 const schematic=new Schematic();
 assert.equal(schematic.grid.snapGrid.stepX,25);
 assert.equal(schematic.grid.snapGrid.stepY,25);
 assert.equal(schematic.grid.referenceGrid.calculatedCellWidth,schematic.grid.referenceGrid.cellWidth);
 assert.equal(schematic.grid.referenceGrid.calculatedCellHeight,schematic.grid.referenceGrid.cellHeight);
});

test('F27 définit un canevas de 27 colonnes et 6 lignes',()=>{
 const grid={maxReference:'F27',cellWidth:10,cellHeight:20};
 assert.deepEqual(gridExtent(grid),{width:270,height:120,rows:6,columns:27,label:'F27'});
 assert.equal(referenceOf({x:1,y:119},grid),'A-1');
 assert.equal(referenceOf({x:269,y:1},grid),'F-27');
});
