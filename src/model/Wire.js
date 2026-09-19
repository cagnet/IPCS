export class Wire{constructor({id,styleId='RED',description='',points=[],from,to}){Object.assign(this,{id,styleId,description,points,from,to});}}
export class WireStyle{constructor({id,name=id,colors=['#d33']}){Object.assign(this,{id,name,colors});}}
