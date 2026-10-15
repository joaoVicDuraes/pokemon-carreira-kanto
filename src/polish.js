/* =====================================================================
   POLIMENTO v1: salvar carreira, Pokédex entre carreiras, sons 8-bit
   ===================================================================== */

/* ---------- 1) carreira salva (localStorage) ----------
   Salva a cada tela. Telas que dependem de objetos não serializáveis (Map do antes/depois)
   voltam para o ponto seguro equivalente ao recarregar. O sorteio da roleta é gravado ANTES
   do giro, então fechar a aba no meio da roda não troca o resultado. */
const SAVE_KEY = "kc_carreira_kanto_save_v1";
const SAVE_PHASES = new Set(["hub","roulette","event","battle","win","elite"]);
function saveGame(){
  if(!G || !SAVE_PHASES.has(G.phase)) return;
  try{
    const o=Object.assign({}, G); delete o.lastResult; delete o.lastWin; delete o.confirmNew;
    o.v=1; o.savedAt=Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(o));
  }catch(e){}
}
function clearSave(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} }
function loadSave(){
  try{ const o=JSON.parse(localStorage.getItem(SAVE_KEY)); return (o && o.v===1 && Array.isArray(o.team) && o.team.length) ? o : null; }
  catch(e){ return null; }
}
function resumeGame(){
  const o=loadSave(); if(!o) return false;
  G=Object.assign(newGame(), o); delete G.v; delete G.savedAt;
  if(G.phase==="event"){
    if(G.pendingRocketGameOver) G.phase="gameover";
    else if(G.pendingSwap){
      const b=snap();
      G.lastResult={kind:"event", good:true, ic:"🔄", title:"Time cheio!", highlight:null, diff:diffOf(b), before:b,
        text:`De volta à estrada: <b>${G.pendingSwap.species}</b> (Lv ${G.pendingSwap.lv}) ainda quer entrar no seu time.`};
    } else G.phase="hub";
  }
  if(G.phase==="win") G.phase = (G.battle && G.battle.isElite) ? "elite" : "hub";
  if(G.phase==="battle" && !G.battle) G.phase="hub";
  return true;
}
function saveSummary(o){
  const where = o.gymIndex>=GYMS.length ? (o.vrDone ? `Elite Four ${o.eliteIndex}/5` : "Victory Road") : `rumo a ${CITY[o.gymIndex]}`;
  return `${o.starter||"?"} · ${o.gymIndex}/8 insígnias · ${where} · dia ${o.day}`;
}
/* sorteio da roleta gravado antes do giro */
function resolveRoll(pr){
  const set=currentGymSet();
  const ev=(pr.good?set.green:set.red).find(e=>e.lb===pr.lb) || [...set.green,...set.red].find(e=>e.lb===pr.lb);
  return ev ? {ev, good:pr.good} : rollGymEvent();
}

/* ---------- 3) Pokédex entre carreiras ----------
   c = registrado (esteve no seu time), v = visto (apareceu na roleta ou recusou entrar), s = teve shiny */
const DEX_KEY = "kc_carreira_kanto_dex_v1";
function loadDexRec(){ try{ const d=JSON.parse(localStorage.getItem(DEX_KEY)); if(d && d.c) return Object.assign({c:{},v:{},s:{}}, d); }catch(e){} return {c:{},v:{},s:{}}; }
let DEXREC = loadDexRec();
function storeDex(){ try{ localStorage.setItem(DEX_KEY, JSON.stringify(DEXREC)); }catch(e){} }
function dexRegister(m){
  let nw=false, ch=false;
  if(!DEXREC.c[m.species]){ DEXREC.c[m.species]=1; nw=true; ch=true; }
  if(m.shiny && !DEXREC.s[m.species]){ DEXREC.s[m.species]=1; ch=true; }
  if(ch) storeDex();
  return nw;
}
function dexSeen(species){ if(DEX[species] && !DEXREC.v[species] && !DEXREC.c[species]){ DEXREC.v[species]=1; storeDex(); } }
function dexCounts(){
  const c=Object.keys(DEXREC.c).length;
  const v=new Set([...Object.keys(DEXREC.c), ...Object.keys(DEXREC.v)]).size;
  return {c, v, s:Object.keys(DEXREC.s).length};
}
function dexScreen(){
  const k=dexCounts();
  const cells=DEX_LIST.map(([n,s])=>{
    const got=DEXREC.c[s], seen=got||DEXREC.v[s], sh=DEXREC.s[s];
    const src=(sh && SHINY[s]) || SPRITES[s] || "";
    return `<div class="dx ${got?'got':seen?'seen':'unk'}" title="${seen?s:'???'}"><span class="dx-n">${String(n).padStart(3,'0')}</span>`
      + `<img src="${src}" alt="${seen?s:'Pokémon desconhecido'}" loading="lazy"><span class="dx-nm">${seen?s:'???'}</span>`
      + `${got?'<i class="dx-ball" title="Registrado"></i>':''}${sh?'<i class="dx-sh" title="Shiny">✨</i>':''}</div>`;
  }).join("");
  scene(`<div class="ribbon plate"><span class="pb-mini"></span>POKéDEX DE ${RT.name.toUpperCase()}</div>
    <div class="dx-count"><span>REGISTRADOS <b>${k.c}</b>/${DEX_LIST.length}</span><span>VISTOS <b>${k.v}</b></span><span>SHINIES <b>${k.s}</b></span></div>
    <div class="dx-bar"><i style="width:${k.c/DEX_LIST.length*100}%"></i></div>
    <div class="dx-help">Registrado = esteve no seu time em qualquer carreira. Visto = apareceu na roleta ou você recusou. A Pokédex nunca zera.</div>
    <div class="dx-grid">${cells}</div>${menu(btn('dexBack','VOLTAR'))}`, 'dexs');
}

/* ---------- 5) sons 8-bit (Web Audio, sintetizados: nada pra baixar) ---------- */
const SFX = (()=>{
  let ac=null, muted=false;
  try{ muted = localStorage.getItem("kc_mute")==="1"; }catch(e){}
  function ctx(){
    if(!ac){ const C=window.AudioContext||window.webkitAudioContext; if(!C) return null; try{ ac=new C(); }catch(e){ return null; } }
    if(ac.state==="suspended"){ try{ ac.resume(); }catch(e){} }
    return ac;
  }
  function tone(f, d, o){
    o=o||{}; if(muted) return; const c=ctx(); if(!c) return;
    const t=c.currentTime+(o.at||0), osc=c.createOscillator(), g=c.createGain();
    osc.type=o.type||"square"; osc.frequency.setValueAtTime(f,t);
    if(o.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40,f+o.slide), t+d);
    g.gain.setValueAtTime(o.vol||0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t+d);
    osc.connect(g); g.connect(c.destination); osc.start(t); osc.stop(t+d+0.03);
  }
  function noise(d, vol, at){
    if(muted) return; const c=ctx(); if(!c) return;
    const n=Math.floor(c.sampleRate*d), buf=c.createBuffer(1,n,c.sampleRate), ch=buf.getChannelData(0);
    for(let i=0;i<n;i++) ch[i]=(Math.random()*2-1)*(1-i/n);
    const src=c.createBufferSource(), g=c.createGain(), t=c.currentTime+(at||0);
    src.buffer=buf; g.gain.setValueAtTime(vol||0.1,t); src.connect(g); g.connect(c.destination); src.start(t);
  }
  const seq=(notes, step, type, vol)=>notes.forEach((f,i)=>{ if(f) tone(f, step*0.92, {at:i*step, type, vol}); });
  return {
    unlock: ()=>{ if(!muted) ctx(); },
    get muted(){ return muted; },
    toggle(){ muted=!muted; try{ localStorage.setItem("kc_mute", muted?"1":"0"); }catch(e){} if(!muted){ ctx(); tone(880,.06,{vol:.04}); } },
    blip:   ()=>tone(988,.035,{vol:.03}),
    tick:   ()=>tone(1500,.02,{vol:.025,type:"triangle"}),
    spin:   ()=>seq([392,523,659],.06,"square",.035),
    good:   ()=>seq([523,659,784,1047],.085),
    bad:    ()=>seq([370,311,262,208],.12,"sawtooth",.04),
    catch:  ()=>{ [0,.35,.7].forEach(a=>tone(260,.07,{at:a,vol:.05,type:"triangle"})); seq([0,0,0,0,0,0,0,0,0,0,0,784,988,1319],.085); },
    evolve: ()=>seq([392,523,659,784,659,784,1047,1319],.075),
    battle: ()=>seq([659,622,659,622,659,494,587,523,440],.07,"square",.04),
    hit:    ()=>{ noise(.16,.12); tone(200,.12,{slide:-120,vol:.05}); },
    faint:  ()=>tone(700,.55,{slide:-600,vol:.05}),
    badge:  ()=>seq([523,523,523,659,0,587,659,784,0,1047],.1),
    over:   ()=>seq([494,466,440,415,392,370,349,330],.15,"triangle",.06),
    champion:()=>seq([523,659,784,1047,0,784,1047,0,1319,1319,1319,1568],.11),
  };
})();
function setMuteBtn(){ const b=document.getElementById("mute"); if(b){ b.textContent=SFX.muted?"🔇":"🔊"; b.setAttribute("aria-label", SFX.muted?"Ligar som":"Desligar som"); b.setAttribute("aria-pressed", SFX.muted?"true":"false"); } }
let PREV_PHASE=null;
function phaseSound(){
  const p=G.phase; if(p===PREV_PHASE) return; PREV_PHASE=p;
  if(p==="event"){
    const r=G.lastResult; if(!r) return;
    if(G.pendingRocketGameOver) return SFX.over();
    if(r.diff && r.diff.evos.length) return SFX.evolve();
    if((r.diff && r.diff.caught.length) || G.pendingSwap) return SFX.catch();
    return r.good ? SFX.good() : SFX.bad();
  }
  if(p==="battle") return SFX.battle();
  if(p==="win") return SFX.badge();
  if(p==="gameover") return SFX.over();
  if(p==="champion") return SFX.champion();
}

/* ---------- gancho chamado no fim de cada render() ---------- */
function afterRender(){
  if(!G) return;
  if(G.team) G.team.forEach(dexRegister);
  if(G.phase==="gameover" || G.phase==="champion") clearSave(); else saveGame();
  try{ phaseSound(); }catch(e){}
  setMuteBtn();
}
document.addEventListener("pointerdown", ()=>SFX.unlock(), {passive:true});
