export class Component {
  constructor({id,type,label=id,position={x:0,y:0},rotation=270,terminals=[],showId,showLabel}){Object.assign(this,{id,type,label,position,rotation,terminals,showId:showId??false,showLabel:showLabel??true});}
  terminal(id){return `${this.id}:${id}`;}
}
