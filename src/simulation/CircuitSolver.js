export class CircuitSolver{
 constructor(maxIterations=100){this.maxIterations=maxIterations;}
 solve(schematic){let coils=new Set(),state=null,converged=false;for(let i=0;i<this.maxIterations;i++){state=this.pass(schematic,coils);const next=new Set(state.poweredCoils);if(equal(coils,next)){converged=true;state.iterations=i+1;break}coils=next}return {...state,converged,diagnostic:converged?'':`Le circuit ne converge pas après ${this.maxIterations} itérations.`};}
 pass(s,coilState){const graph=new Map(),edgeWire=new Map();const add=(a,b,w=null)=>{if(!graph.has(a))graph.set(a,[]);if(!graph.has(b))graph.set(b,[]);graph.get(a).push(b);graph.get(b).push(a);if(w){edgeWire.set(`${a}|${b}`,w);edgeWire.set(`${b}|${a}`,w)}};
  for(const w of s.wires)if(w.from&&w.to)add(w.from,w.to,w.id);
  for(const c of s.components){const a=`${c.id}:A`,b=`${c.id}:B`;if(c.type==='coil')add(a,b);if(c.type==='contact'){const active=c.controlType==='manual'?c.manualActivated:coilState.has(c.controllerId);const closed=c.contactType==='NO'?active:!active;if(closed)add(a,b)} }
  const sources=[],returns=[];for(const p of s.components.filter(c=>c.type==='powerSource')){for(const o of p.outputs.filter(o=>o.enabled))sources.push(`${p.id}:${o.id}`);returns.push(`${p.id}:RETURN`)}
  const fromSource=walk(graph,sources),toReturn=walk(graph,returns);const poweredCoils=s.components.filter(c=>c.type==='coil'&&fromSource.has(`${c.id}:A`)&&toReturn.has(`${c.id}:B`)||c.type==='coil'&&fromSource.has(`${c.id}:B`)&&toReturn.has(`${c.id}:A`)).map(c=>c.id);
  const poweredWires=s.wires.filter(w=>fromSource.has(w.from)||fromSource.has(w.to)).map(w=>w.id);const flowingWires=s.wires.filter(w=>(fromSource.has(w.from)&&toReturn.has(w.to))||(fromSource.has(w.to)&&toReturn.has(w.from))||(fromSource.has(w.from)&&toReturn.has(w.from)&&fromSource.has(w.to))).map(w=>w.id);
  const poweredComponents=s.components.filter(c=>c.terminals.some(t=>fromSource.has(`${c.id}:${t.id}`))).map(c=>c.id);return {poweredCoils,poweredWires,flowingWires,poweredComponents,fromSource,toReturn};}
}
function walk(g,seeds){const seen=new Set(seeds),q=[...seeds];while(q.length){const n=q.shift();for(const v of g.get(n)||[])if(!seen.has(v)){seen.add(v);q.push(v)}}return seen}function equal(a,b){return a.size===b.size&&[...a].every(x=>b.has(x))}
