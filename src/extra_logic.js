/* ============ EXTRAS: pedra em toda roleta, Eevee, lendários, soltar ============ */

/* próximo oponente (ginásio, ou Liga depois das 8 insígnias) */
function nextFoeType(){ return G.gymIndex<GYMS.length ? GYMS[G.gymIndex].t : ELITE[Math.min(G.eliteIndex,ELITE.length-1)].t; }

/* evolução com ramificação: Eevee vira a forma com melhor vantagem contra o próximo oponente */
function doEvolve(m){
  const d=DEX[m.species]; let n=d.evo; if(!n) return;
  const br=BRANCH[m.species];
  if(br){ const ft=nextFoeType(); n=br.slice().sort((a,b)=>typeMult(DEX[b].t,ft)-typeMult(DEX[a].t,ft) || Math.random()-0.5)[0]; }
  m.species=n; m.t=DEX[n].t; m.e=DEX[n].e;
}

/* Pedra Evolutiva: verde presente em TODAS as roletas */
function stoneCandidates(){ return G.team.filter(m=>DEX[m.species].evo && DEX[m.species].evoLv>=99); }
function stoneEvent(){
  const c=stoneCandidates();
  if(!c.length){
    lvlAll(5);
    return {title:"Pedra Evolutiva", text:`Você acha uma Pedra Evolutiva, mas ninguém do time evolui com ela. A energia da pedra fortalece a equipe: <span class="reward">+5 níveis no time</span>.\nDica: Pikachu, Eevee, Vulpix, Growlithe, Staryu, Gloom e outros evoluem com pedra.`, highlight:null};
  }
  const m=c.sort((a,b)=>monPower(b)-monPower(a))[0];
  const old=m.species, how=STONE[old]||"Pedra Evolutiva";
  doEvolve(m); G.stats.evolved++;
  const text = how==="troca"
    ? `Um treinador na rota propõe uma troca amigável. Quando ${old} volta pra você... <span class="reward">evoluiu para ${m.species}!</span>`
    : `Brilhando no meio da rota: uma <b>${how.startsWith("Pedra (")?"Pedra Evolutiva":how}</b>! Você a encosta em ${old}... <span class="reward">evoluiu para ${m.species}!</span>`;
  return {title:"Pedra Evolutiva!", text, highlight:m};
}
GYM_EVENTS.forEach(set=>{
  if(!set.green.some(ev=>ev.lb==="Pedra evolutiva")) set.green.push({ic:"💎",lb:"Pedra evolutiva",fn:stoneEvent});
});

/* Encontro lendário (reta final): única forma de ter Moltres, Mewtwo e Mew */
function legendEvent(){
  const r=Math.random(), s = r<0.55 ? "Moltres" : r<0.85 ? "Mewtwo" : "Mew";
  const m=addMon(s, s==="Mewtwo"?44:40);
  const where = {Moltres:"No topo da Victory Road, chamas iluminam a caverna",Mewtwo:"No fundo da Caverna Cerulean, um olhar frio te encara",Mew:"Uma pequena silhueta rosa brinca entre as árvores e decide te seguir"}[s];
  return {title:"Encontro Lendário!", text:`${where}... <span class="reward">${s} (Lv ${m.lv}) entrou para o time!</span>`, highlight:m};
}
GYM_EVENTS[7].green.push({ic:"🌟",lb:"Lendário",fn:legendEvent});

/* Victory Road: conjunto próprio (índice 8). Os valores aqui já são os reais (sem escala do assemble). */
function vrCaveMon(){
  const pool=["Machoke","Graveler","Marowak","Onix","Golbat","Rhyhorn"], s=pool[Math.floor(Math.random()*pool.length)];
  const m=addMon(s,36);
  return {title:"Morador da Victory Road", text:`No fundo da caverna, um <b>${s}</b> selvagem (Lv ${m.lv}) testa sua força... e decide te acompanhar até a Liga!`, highlight:m};
}
GYM_EVENTS.push({
  green:[
    {ic:"🔥",lb:"Chama de Moltres",fn:()=>{const m=addMon("Moltres",42);return{title:"A Chama da Victory Road",text:`Labaredas iluminam a caverna: é <b>Moltres</b>! Depois de uma batalha feroz, <span class="reward">Moltres (Lv ${m.lv}) entrou para o time!</span>`,highlight:m};}},
    {ic:"🎓",lb:"Ás da Victory Road",fn:()=>{lvlAll(7);return{title:"Duelo com o Ás",text:`Um Treinador Ás desafia você na entrada da caverna. Vitória suada! <span class="reward">Time +7 níveis</span>.`,highlight:null};}},
    {ic:"🍬",lb:"Rare Candy escondido",fn:()=>{const t=strongest();lvlOne(t,10);return{title:"Rare Candy escondido",text:`Atrás de uma pedra empurrada com Strength: um saco de Rare Candies! <span class="reward">${t.species} +10 níveis</span>.`,highlight:t};}},
    {ic:"🪨",lb:"Morador da caverna",fn:vrCaveMon},
    {ic:"🌟",lb:"Lendário",fn:legendEvent},
  ],
  red:[
    {ic:"🪨",lb:"Enigma das pedras",fn:()=>{dropLvAll(2);return{title:"Enigma das Pedras",text:`Horas empurrando pedregulhos com Strength até achar o caminho. O time chega cansado: <b>-2 níveis</b> em todos.`,highlight:null};}},
    {ic:"🦇",lb:"Golbats na escuridão",fn:()=>{const t=strongest();dropLvOne(t,4);return{title:"Golbats na Escuridão",text:`Um bando de Golbat ataca no breu. <b>${t.species}</b> protege o time e se fere: <b>-4 níveis</b>.`,highlight:t};}},
    {ic:"⛏️",lb:"Desmoronamento",loss:true,fn:()=>{const g=loseWeakest();if(!g)return{title:"Desmoronamento",text:`O teto da caverna cede! Você e seu inicial escapam por pouco — ninguém se perdeu.`,highlight:null};return{title:"Desmoronamento",text:`O teto da caverna cede e separa o time. <b>${g.species}</b> fica do outro lado dos escombros: perdeu ${g.species}.`,highlight:null};}},
  ]
});
GYM_EVENTS[8].green.splice(4,0,{ic:"💎",lb:"Pedra evolutiva",fn:stoneEvent});

/* Fóssil do Mt. Moon (roleta rumo a Cerulean): Omanyte ou Kabuto */
function fossilEvent(){
  const helix=Math.random()<0.5, s=helix?"Omanyte":"Kabuto";
  const m=addMon(s,14);
  return {title:"Fóssil do Mt. Moon", text:`No fundo do Mt. Moon você escolhe o <b>${helix?"Fóssil Hélix":"Fóssil Domo"}</b>. Um cientista do Museu de Pewter o revive na hora: <span class="reward">${s} (Lv ${m.lv}) entrou para o time!</span>`, highlight:m};
}
GYM_EVENTS[1].green.push({ic:"🐚",lb:"Fóssil",fn:fossilEvent});

/* Soltar um Pokémon (não gasta decisão; o inicial fica) */
function releaseMon(i){
  if(i<=0 || i>=G.team.length) return null;
  const m=G.team.splice(i,1)[0];
  G.stats.released=(G.stats.released||0)+1;
  return m;
}

/* Troca com time cheio: o recém-chegado entra no lugar de quem você escolher */
function swapIn(i){
  const nw=G.pendingSwap;
  if(!nw || i<=0 || i>=G.team.length) return null;
  const out=G.team[i];
  G.team[i]=nw; G.pendingSwap=null;
  G.stats.caught++; G.stats.released=(G.stats.released||0)+1;
  return {in:nw, out};
}
function skipSwap(){ const nw=G.pendingSwap; G.pendingSwap=null; if(nw) lvlAll(5); return nw; }


/* ============ Roleta sem repetição dentro do mesmo ginásio ============
   O evento que saiu sai da roda até o próximo ginásio (ou até sair da Victory Road).
   A fatia removida é dividida entre as fatias da MESMA cor que não tiram Pokémon,
   então a proporção sorte/perigo da fase fica igual e a perda de Pokémon continua rara. */
function usedLabels(){
  const key = G.gymIndex>=GYMS.length ? "vr" : "g"+G.gymIndex;
  if(!G.used || G.used.key!==key) G.used={key, lb:[]};
  return G.used.lb;
}
function markUsed(ev){ const u=usedLabels(); if(!u.includes(ev.lb)) u.push(ev.lb); }
function wheelSectors(){
  const set=currentGymSet(), gr=greenRatio(), used=usedLabels();
  const redW=set.red.map(ev=>ev.loss?0.1:1), totR=redW.reduce((a,b)=>a+b,0);
  const all=[];
  set.green.forEach((ev,i)=>all.push({ev, good:true, i, frac:gr/set.green.length}));
  set.red.forEach((ev,i)=>all.push({ev, good:false, i, frac:(1-gr)*redW[i]/totR}));
  const keep=all.filter(s=>!used.includes(s.ev.lb));
  if(!keep.length) return all;                      // segurança: nunca roda vazia
  all.filter(s=>used.includes(s.ev.lb)).forEach(gone=>{
    let to=keep.filter(s=>s.good===gone.good && !s.ev.loss);
    if(!to.length) to=keep.filter(s=>!s.ev.loss);
    if(!to.length) to=keep;
    const tot=to.reduce((a,s)=>a+s.frac,0);
    to.forEach(s=>{ s.frac+=gone.frac*s.frac/tot; });
  });
  return keep;
}
function rollGymEvent(){
  const sec=wheelSectors(); let r=Math.random()*sec.reduce((a,s)=>a+s.frac,0);
  for(const s of sec){ r-=s.frac; if(r<=0) return {ev:s.ev, good:s.good}; }
  const s=sec[sec.length-1]; return {ev:s.ev, good:s.good};
}
