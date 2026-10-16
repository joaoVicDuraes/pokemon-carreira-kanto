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
  if(m.egg || !DEX[m.species]) return false;
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
  const k=dexCounts(), f=G.dexF||'all';
  const list=DEX_LIST.filter(([n,s])=> f==='all' ? true : f==='got' ? DEXREC.c[s] : !DEXREC.c[s]);
  const cells=list.map(([n,s])=>{
    const got=DEXREC.c[s], seen=got||DEXREC.v[s], sh=DEXREC.s[s];
    const src=(sh && SHINY[s]) || SPRITES[s] || "";
    const tag=seen?'button':'div', at=seen?` data-act="dexSel" data-arg="${s}" aria-label="${s}"`:'';
    return `<${tag} class="dx ${got?'got':seen?'seen':'unk'}"${at}><span class="dx-n">${String(n).padStart(3,'0')}</span>`
      + `<img src="${src}" alt="${seen?s:'Pokémon desconhecido'}" loading="lazy"><span class="dx-nm">${seen?s:'???'}</span>`
      + `${got?'<i class="dx-ball" title="Registrado"></i>':''}${sh?'<i class="dx-sh" title="Shiny">✨</i>':''}</${tag}>`;
  }).join("") || `<div class="dx-empty">${f==='got'?'Nenhum registrado ainda. Bora pra estrada!':'Você registrou todos! 🎉'}</div>`;
  const fb=(v,l)=>`<button class="seg dx-f ${f===v?'on':''}" data-act="dexF" data-arg="${v}" aria-pressed="${f===v}">${l}</button>`;
  scene(`<div class="ribbon plate"><span class="pb-mini"></span>POKéDEX DE ${RT.name.toUpperCase()}</div>
    <div class="dx-count"><span>REGISTRADOS <b>${k.c}</b>/${DEX_LIST.length}</span><span>VISTOS <b>${k.v}</b></span><span>SHINIES <b>${k.s}</b></span></div>
    <div class="dx-bar"><i style="width:${k.c/DEX_LIST.length*100}%"></i></div>
    <div class="segs dx-fs">${fb('all','TODOS')}${fb('got','REGISTRADOS')}${fb('miss','FALTANDO')}</div>
    <div class="dx-detail" id="dxd"><span class="dx-hint">Toque num Pokémon visto ou registrado para ver a ficha. Registrado = esteve no seu time; visto = apareceu na roleta.</span></div>
    <div class="dx-grid">${cells}</div>${menu(btn('dexBack','VOLTAR'))}`, 'dexs');
}
/* ficha do Pokémon, trocada no lugar (sem re-render, a grade não perde a rolagem) */
function dexShow(s){
  const el=document.getElementById('dxd'); if(!el || !DEX[s]) return;
  const row=DEX_LIST.find(r=>r[1]===s), d=DEX[s], got=DEXREC.c[s], sh=DEXREC.s[s];
  const ch=chain(s); let first=s; for(let i=0;i<4;i++){ const p=Object.keys(DEX).find(x=>DEX[x].evo===first || (BRANCH[x]||[]).includes(first)); if(!p) break; first=p; }
  const line=chain(first).map((c,i)=>(i?'<span>›</span>':'')+`<img class="${c===s?'cur':''}" src="${SPRITES[c]||''}" alt="${c}" title="${c}">`).join('');
  const br=BRANCH[s] ? `<div class="dxd-br">Evolui em: ${BRANCH[s].join(', ')}</div>` : '';
  el.innerHTML=`<img class="dxd-img" src="${(sh&&SHINY[s])||SPRITES[s]}" alt="${s}">
    <div><div class="dxd-h">Nº ${String(row?row[0]:0).padStart(3,'0')} · ${s.toUpperCase()}</div>
      <div class="m-sub">${typeTag(d.t)}<span class="dxd-st ${got?'got':''}">${got?'REGISTRADO':'VISTO'}${sh?' · ✨ SHINY':''}</span></div>
      <div class="dxd-chain">${line}</div>${br}</div>`;
  try{ fixPx(el); }catch(e){}
  document.querySelectorAll('.dx.sel').forEach(x=>x.classList.remove('sel'));
  const me=document.querySelector(`.dx[data-arg="${s}"]`); if(me) me.classList.add('sel');
  if(el.scrollIntoView) el.scrollIntoView({block:'nearest', behavior:REDUCE()?'auto':'smooth'});
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
  /* vibração: só onde o navegador suporta (Android/Chrome). O Safari do iPhone ignora. O mudo desliga as duas. */
  const vib=p=>{ if(muted) return; try{ if(typeof navigator!=="undefined" && navigator.vibrate) navigator.vibrate(p); }catch(e){} };
  return {
    unlock: ()=>{ if(!muted) ctx(); },
    get muted(){ return muted; },
    toggle(){ muted=!muted; try{ localStorage.setItem("kc_mute", muted?"1":"0"); }catch(e){} if(!muted){ ctx(); tone(880,.06,{vol:.04}); vib(20); } },
    blip:   ()=>tone(988,.035,{vol:.03}),
    tick:   ()=>{ tone(1500,.02,{vol:.025,type:"triangle"}); vib(6); },
    spin:   ()=>seq([392,523,659],.06,"square",.035),
    good:   ()=>{ seq([523,659,784,1047],.085); vib([25,40,25]); },
    bad:    ()=>{ seq([370,311,262,208],.12,"sawtooth",.04); vib(160); },
    catch:  ()=>{ [0,.35,.7].forEach(a=>tone(260,.07,{at:a,vol:.05,type:"triangle"})); seq([0,0,0,0,0,0,0,0,0,0,0,784,988,1319],.085); vib([30,320,30,320,30,320,60]); },
    evolve: ()=>{ seq([392,523,659,784,659,784,1047,1319],.075); vib([20,60,20,60,80]); },
    battle: ()=>seq([659,622,659,622,659,494,587,523,440],.07,"square",.04),
    hit:    ()=>{ noise(.16,.12); tone(200,.12,{slide:-120,vol:.05}); vib(45); },
    faint:  ()=>{ tone(700,.55,{slide:-600,vol:.05}); vib([80,60,200]); },
    badge:  ()=>{ seq([523,523,523,659,0,587,659,784,0,1047],.1); vib([40,80,40,80,120]); },
    over:   ()=>{ seq([494,466,440,415,392,370,349,330],.15,"triangle",.06); vib(400); },
    champion:()=>{ seq([523,659,784,1047,0,784,1047,0,1319,1319,1319,1568],.11); vib([60,60,60,60,60,60,300]); },
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
  if(p==="champion" || p==="legend") return SFX.champion();
}

/* ---------- gancho chamado no fim de cada render() ---------- */
function afterRender(){
  if(!G) return;
  if(G.team) G.team.forEach(dexRegister);
  if(G.phase==="gameover" || G.phase==="champion" || G.phase==="legend"){ clearSave(); try{ prepShare(); }catch(e){} } else saveGame();
  try{ phaseSound(); }catch(e){}
  setMuteBtn();
}

/* ---------- 9) card de fim de carreira para compartilhar (WhatsApp, Instagram...) ----------
   A imagem é desenhada num <canvas> assim que a tela final abre, para o botão poder chamar o
   compartilhamento nativo na hora do toque (o iPhone exige que seja dentro do gesto). */
let SHARE=null;
const SITE_URL = "https://pokemon-carreira-kanto.vercel.app/";
function shareBtn(){ return btn('share','📤 COMPARTILHAR CARREIRA','Imagem com seu time e insígnias'); }
function toast(msg){
  try{ let t=document.getElementById('toast'); if(!t){ t=document.createElement('div'); t.id='toast'; t.setAttribute('role','status'); document.body.appendChild(t); }
    t.textContent=msg; t.classList.add('on'); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('on'), 2600); }catch(e){}
}
function loadImg(src){ return new Promise(r=>{ if(!src) return r(null); const i=new Image(); i.onload=()=>r(i); i.onerror=()=>r(null); i.src=src; }); }
function careerReached(){
  if(G.phase==='legend') return 'Venceu o Red no Mt. Silver';
  if(G.phase==='champion') return `Campeão de ${RT.name}`;
  if(G.battle && G.battle.isRed) return `Campeão de ${RT.name} · o Red venceu`;
  if(G.gymIndex>=GYMS.length) return G.vrDone ? `Caiu na Elite Four (${G.eliteIndex}/5)` : 'Caiu na Victory Road';
  return `Caiu no ginásio ${G.gymIndex+1}: ${GYMS[G.gymIndex].leader}`;
}
async function buildShareCard(){
  const W=720, H=1000, c=document.createElement('canvas'); c.width=W; c.height=H;
  const x=c.getContext('2d'); if(!x) return null;
  try{ await Promise.all([document.fonts.load('20px PS2P'), document.fonts.load('30px VT323')]); }catch(e){}
  const col=({johto:['#2F6FD6','#0F2E78']})[REGION] || ['#E3350D','#7A1500'];
  const rr=(X,Y,w,h,r)=>{ x.beginPath(); x.moveTo(X+r,Y); x.arcTo(X+w,Y,X+w,Y+h,r); x.arcTo(X+w,Y+h,X,Y+h,r); x.arcTo(X,Y+h,X,Y,r); x.arcTo(X,Y,X+w,Y,r); x.closePath(); };
  const txt=(s,X,Y,font,fill,al)=>{ x.font=font; x.fillStyle=fill; x.textAlign=al||'center'; x.fillText(s,X,Y); };
  const px=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();   // a fonte pixel não tem acento
  x.imageSmoothingEnabled=false;
  x.fillStyle=col[1]; x.fillRect(0,0,W,H); rr(10,10,W-20,H-20,34); x.fillStyle=col[0]; x.fill();
  txt('POKéMON', W/2, 78, '40px PS2P', '#FFCB05'); txt(px('Carreira de Treinador · '+RT.name), W/2, 118, '16px PS2P', '#fff');
  rr(34,144,W-68,H-232,20); x.fillStyle='#FFFBEA'; x.fill(); x.lineWidth=6; x.strokeStyle='#1a1a1a'; x.stroke();
  const won=G.phase!=='gameover' || !!(G.battle && G.battle.isRed);
  rr(W/2-250,170,500,58,10); x.fillStyle=won?'#FFCB05':'#E3350D'; x.fill(); x.lineWidth=4; x.stroke();
  txt(won?(G.phase==='legend'?'LENDA DO MT. SILVER':'CAMPEAO DA LIGA!'):'FIM DA CARREIRA', W/2, 210, '20px PS2P', won?'#3a2a00':'#fff');
  txt(careerReached(), W/2, 268, '34px VT323', '#2B2B2B');
  const bi=await Promise.all(BADGES.map(loadImg)), bs=58, bx=W/2-(8*bs+7*12)/2;
  bi.forEach((im,i)=>{ if(!im) return; x.globalAlpha=i<G.gymIndex?1:0.18; x.drawImage(im, bx+i*(bs+12), 292, bs, bs); });
  x.globalAlpha=1;
  const team=G.team.filter(m=>!m.egg).slice(0,6), ti=await Promise.all(team.map(m=>loadImg(frontSrc(m.species,m.shiny))));
  team.forEach((m,i)=>{
    const cx=70+(i%3)*200, cy=380+Math.floor(i/3)*200;
    rr(cx,cy,180,180,14); x.fillStyle=i===0?'#FFE8DC':'#E9F1FF'; x.fill(); x.lineWidth=4; x.strokeStyle='#283A6E'; x.stroke();
    if(ti[i]) x.drawImage(ti[i], cx+30, cy+8, 120, 120);
    txt(px(m.species)+(m.shiny?' *':''), cx+90, cy+152, '12px PS2P', '#2B2B2B'); txt('Lv '+m.lv, cx+90, cy+172, '22px VT323', '#2A75BB');
  });
  const s=G.stats, line=`${G.day} dias · ${s.caught} capturas · ${s.evolved} evoluções · ${s.wins} vitórias${s.shinies?` · ${s.shinies} shiny`:''}`;
  txt(line, W/2, 820, '28px VT323', '#555');
  txt(px('Até onde você chega?'), W/2, 868, '14px PS2P', col[1]);
  txt(SITE_URL.replace(/^https?:\/\//,'').replace(/\/$/,''), W/2, H-42, '16px PS2P', '#fff');
  return await new Promise(r=>c.toBlob(r,'image/png'));
}
function prepShare(){
  if(typeof document.createElement!=='function') return;
  const key=[REGION,G.phase,G.day,G.team.length,G.gymIndex,G.eliteIndex].join('|');
  if(SHARE && SHARE.key===key) return;
  const me={key, blob:null}; SHARE=me;
  buildShareCard().then(b=>{ me.blob=b; }).catch(()=>{});
}
function shareCareer(){
  const b=SHARE && SHARE.blob;
  if(!b){ toast('Gerando a imagem... toque de novo em um instante.'); prepShare(); return; }
  const name=`carreira-${REGION}.png`, text=`${careerReached()} na Pokémon Carreira de Treinador! Até onde você chega? ${SITE_URL}`;
  let file=null; try{ file=new File([b], name, {type:'image/png'}); }catch(e){}
  if(file && navigator.canShare && navigator.canShare({files:[file]})){ navigator.share({files:[file], title:'Minha carreira Pokémon', text}).catch(()=>{}); return; }
  try{ const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name; document.body.appendChild(a); a.click();
    setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1500); toast('Imagem salva nos downloads.'); }catch(e){ toast('Não deu pra gerar a imagem neste navegador.'); }
}
document.addEventListener("pointerdown", ()=>SFX.unlock(), {passive:true});
