export class Component {
  constructor({id,type,label=id,position={x:0,y:0},rotation=270,terminals=[]}){Object.assign(this,{id,type,label,position,rotation,terminals});}
  terminal(id){return `${this.id}:${id}`;}
}
