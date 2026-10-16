/* =====================================================================
   META: conquistas, coleção de shinies e ranking global.
   Tudo aqui vale para TODAS as regiões (as chaves não dependem da região ativa).
   ===================================================================== */
const META_REGIONS = ["kanto","johto","hoenn"];
const LEGENDS = new Set(["Articuno","Zapdos","Moltres","Mewtwo","Mew","Raikou","Entei","Suicune","Lugia","Ho-Oh","Celebi",
  "Regirock","Regice","Registeel","Latias","Latios","Kyogre","Groudon","Rayquaza","Jirachi","Deoxys"]);
const lsGet=(k,d)=>{ try{ const v=JSON.parse(localStorage.getItem(k)); return v==null?d:v; }catch(e){ return d; } };
const lsSet=(k,v)=>{ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} };
const escH=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const RNAME={kanto:"Kanto", johto:"Johto", hoenn:"Hoenn"};
function recOf(r){ return lsGet(`kc_carreira_${r}_v1`, {}) || {}; }
function dexOf(r){ const d=lsGet(`kc_carreira_${r}_dex_v1`, null); return d && d.c ? d : {c:{},v:{},s:{}}; }

/* ---------- coleção de shinies ----------
   Cada shiny que entra no seu time vai para a coleção (com região, nível e data).
   Shinies de antes desta versão vêm da Pokédex, sem data. */
const SHINY_KEY="kc_shinies_v1";
let SHLOG = lsGet(SHINY_KEY, null);
if(!Array.isArray(SHLOG)){
  SHLOG=[];
  META_REGIONS.forEach(r=>Object.keys(dexOf(r).s||{}).forEach(sp=>SHLOG.push({sp, r, lv:0, d:0})));
  lsSet(SHINY_KEY, SHLOG);
}
function logShinies(){
  if(!G || !G.team) return;
  G.team.forEach(m=>{
    if(!m.shiny || m.egg || m.shLog) return;
    m.shLog=1; SHLOG.unshift({sp:m.species, r:REGION, lv:m.lv, d:Date.now()}); lsSet(SHINY_KEY, SHLOG);
  });
}
function shinySrc(sp){ return (typeof SHINY!=='undefined' && SHINY[sp]) || SPRITES[sp] || ""; }
function shiniesScreen(){
  /* sprites shiny de outras regiões só existem depois que o pacote delas baixa */
  const need=[...new Set(SHLOG.map(x=>x.r))].filter(r=>REGIONS[r] && !REGIONS[r].ready && !REGIONS[r].loading && !REGIONS[r].failed);
  need.forEach(r=>loadPack(r, ()=>{ if(G.phase==='shinies') render(); }));
  const f=G.shF||'all', list=SHLOG.filter(x=>f==='all'||x.r===f);
  const regs=[...new Set(SHLOG.map(x=>x.r))];
  const fb=(v,l)=>`<button class="seg ${f===v?'on':''}" data-act="shF" data-arg="${v}" aria-pressed="${f===v}">${l}</button>`;
  const cells=list.map(x=>{
    const src=shinySrc(x.sp), real=typeof SHINY!=='undefined' && SHINY[x.sp];
    const when=x.d ? new Date(x.d).toLocaleDateString('pt-BR') : 'antes da coleção';
    return `<div class="shc"><span class="shc-r r-${x.r}">${(RNAME[x.r]||x.r).toUpperCase()}</span>`
      + (src?`<img src="${src}" alt="${escH(x.sp)} shiny" class="${real?'':'wait'}" loading="lazy">`:`<div class="shc-q">?</div>`)
      + `<span class="shc-n">${escH(x.sp)}</span><span class="shc-d">${x.lv?`Lv ${x.lv} · `:''}${when}</span></div>`;
  }).join('') || `<div class="dx-empty">Nenhum shiny ainda. 1 em cada 40 Pokémon nasce brilhando: continue tentando! ✨</div>`;
  scene(`<div class="ribbon plate"><span class="spk">✦</span>✨ COLEÇÃO DE SHINIES<span class="spk">✦</span></div>
    <div class="dx-count"><span>NA COLEÇÃO <b>${SHLOG.length}</b></span><span>ESPÉCIES <b>${new Set(SHLOG.map(x=>x.sp)).size}</b></span></div>
    ${regs.length>1?`<div class="segs dx-fs">${fb('all','TODAS')}${regs.map(r=>fb(r,(RNAME[r]||r).toUpperCase())).join('')}</div>`:''}
    <div class="sh-grid">${cells}</div>${menu(btn('title','VOLTAR'))}`, 'dexs');
}

/* ---------- conquistas ---------- */
const ACH_KEY="kc_conquistas_v1";
let ACH = lsGet(ACH_KEY, null);
/* primeira vez com conquistas: o que já foi feito em carreiras antigas desbloqueia de uma vez, com um aviso só */
let ACH_FIRST = !ACH; if(!ACH) ACH={};
function metaCtx(){
  const recs={}, dexs={}; META_REGIONS.forEach(r=>{ recs[r]=recOf(r); dexs[r]=dexOf(r); });
  const sum=k=>META_REGIONS.reduce((a,r)=>a+(recs[r][k]||0),0);
  const union=new Set(); META_REGIONS.forEach(r=>Object.keys(dexs[r].c).forEach(s=>union.add(s)));
  const g=G||{}, team=(g.team||[]).filter(m=>!m.egg), live=!!(g.team && g.team.length && g.phase!=='title');
  const has=f=>live && team.some(f);
  return {recs, dexs, sum, union, g, team, live, has, maxDex:Math.max(...META_REGIONS.map(r=>Object.keys(dexs[r].c).length))};
}
const DEX_TOTAL={kanto:151, johto:251, hoenn:386};
/* [id, ícone, nome, como conseguir, teste(ctx) -> true | número de progresso, meta (para a barra)] */
const ACHS = [
  ["jornada","🎒","Primeiro passo","Escolha seu primeiro parceiro.", c=>c.live||c.sum('runs')>0],
  ["badge1","🥇","Primeira insígnia","Vença o primeiro líder de ginásio.", c=>c.live&&c.g.gymIndex>=1 || c.sum('runs')>0&&META_REGIONS.some(r=>(c.recs[r].bestBadges||0)>=1)],
  ["badge4","🗺️","Meio caminho","Tenha 4 insígnias numa mesma carreira.", c=>c.live&&c.g.gymIndex>=4 || META_REGIONS.some(r=>(c.recs[r].bestBadges||0)>=4)],
  ["badge8","🎖️","Oito insígnias","Junte as 8 insígnias de uma região.", c=>c.live&&c.g.gymIndex>=8 || META_REGIONS.some(r=>(c.recs[r].bestBadges||0)>=8)],
  ["champ_kanto","👑","Campeão de Kanto","Vença a Liga no Platô Índigo.", c=>(c.recs.kanto.champs||0)>0],
  ["champ_johto","🔔","Campeão de Johto","Vença o Lance e vire campeão de Johto.", c=>(c.recs.johto.champs||0)>0],
  ["champ_hoenn","🌊","Campeão de Hoenn","Vença o Wallace em Ever Grande.", c=>(c.recs.hoenn.champs||0)>0],
  ["champ_all","🌎","Mestre de três regiões","Seja campeão em Kanto, Johto e Hoenn.", c=>META_REGIONS.filter(r=>(c.recs[r].champs||0)>0).length, 3],
  ["red","🏔️","Lenda do Mt. Silver","Vença o Red no topo do Mt. Silver.", c=>(c.recs.johto.legends||0)>0 || c.live&&REGION==='johto'&&c.g.phase==='legend'],
  ["steven","☄️","Lenda do Meteor Falls","Vença o Steven no Meteor Falls.", c=>(c.recs.hoenn.legends||0)>0 || c.live&&REGION==='hoenn'&&c.g.phase==='legend'],
  ["shiny1","✨","Brilho raro","Tenha um Pokémon shiny no time.", c=>SHLOG.length>0 || c.has(m=>m.shiny)],
  ["shiny5","🌟","Caçador de shinies","Junte 5 shinies na coleção.", c=>SHLOG.length, 5],
  ["shiny_lend","💫","Lenda brilhante","Tenha um lendário shiny no time.", c=>SHLOG.some(x=>LEGENDS.has(x.sp)) || c.has(m=>m.shiny&&LEGENDS.has(m.species))],
  ["dex50","📕","Pesquisador","Registre 50 Pokémon na Pokédex de uma região.", c=>c.maxDex, 50],
  ["dex150","📚","Professor Pokémon","Registre 150 espécies diferentes somando as regiões.", c=>c.union.size, 150],
  ["dex_kanto","📗","Pokédex de Kanto completa","Registre os 151 de Kanto.", c=>Object.keys(c.dexs.kanto.c).length, 151],
  ["legend","🐉","Encontro lendário","Tenha um Pokémon lendário no time.", c=>c.has(m=>LEGENDS.has(m.species))],
  ["legend3","⚡","Trio lendário","Tenha 3 lendários no time ao mesmo tempo.", c=>c.live?c.team.filter(m=>LEGENDS.has(m.species)).length:0, 3],
  ["fullteam","👥","Time completo","Tenha 6 Pokémon no time (ovo não conta).", c=>c.live?c.team.length:0, 6],
  ["egg","🥚","Chocadeira","Choque um ovo.", c=>c.live && (c.g.log||[]).some(l=>/O ovo chocou/.test(l.text))],
  ["gyarados","🔴","Lago da Fúria","Tenha o Gyarados Vermelho no time.", c=>c.has(m=>m.species==='Gyarados'&&m.shiny)],
  ["dogs","🐾","Caçador de errantes","Capture Raikou, Entei ou Suicune.", c=>c.has(m=>['Raikou','Entei','Suicune'].includes(m.species))],
  ["eon","💞","Asas de Hoenn","Capture Latias ou Latios.", c=>c.has(m=>['Latias','Latios'].includes(m.species))],
  ["starter","⭐","Parceiro completo","Leve seu inicial até a forma final.", c=>c.live&&c.g.starter&&c.team[0]&&c.g.team[0]===c.team[0]&&c.team[0].species!==c.g.starter&&DEX[c.team[0].species]&&!DEX[c.team[0].species].evo],
  ["evo5","🧬","Evolucionista","Faça 5 evoluções numa carreira.", c=>c.live?(c.g.stats.evolved||0):0, 5],
  ["lucky","🍀","Trevo de quatro folhas","Tire 10 eventos de sorte numa carreira.", c=>c.live?(c.g.stats.eventsGood||0):0, 10],
  ["underdog","💪","Modo difícil","Vença o 1º líder com um inicial em desvantagem contra ele.", c=>c.live&&c.g.gymIndex>=1&&c.g.starter&&typeMult(DEX[c.g.starter].t, GYMS[0].t)<1],
  ["zebra","🦓","Zebra","Vença uma batalha oficial com menos de 35% de chance.", c=>c.live&&c.g.battle&&c.g.battle.win&&c.g.battle.ch<0.35&&['win','champion','legend'].includes(c.g.phase)],
  ["gambler","🎲","Apostador","Seja campeão sem usar TREINAR nenhuma vez.", c=>c.live&&['champion','legend'].includes(c.g.phase)&&!(c.g.stats.trained||0)],
  ["comeback","💔","Seguiu em frente","Perca um Pokémon pelo caminho e vire campeão mesmo assim.", c=>c.live&&['champion','legend'].includes(c.g.phase)&&((c.g.stats.stolen||0)+(c.g.stats.fled||0))>0],
  ["persist","🔁","Persistente","Termine 10 carreiras.", c=>c.sum('runs'), 10],
  ["veteran","🏅","Veterano","Termine 50 carreiras.", c=>c.sum('runs'), 50],
];
function achProg(a, c){ const v=a[4](c); return a[5] ? {v:Math.min(a[5], Number(v)||0), max:a[5], ok:(Number(v)||0)>=a[5]} : {v:v?1:0, max:1, ok:!!v}; }
let ACH_Q=[], ACH_T=null;
function achToast(){
  if(ACH_T || !ACH_Q.length) return;
  const a=ACH_Q.shift(); toast(`🏆 Conquista: ${a[1]} ${a[2]}`);
  try{ SFX.good(); }catch(e){}
  ACH_T=setTimeout(()=>{ ACH_T=null; achToast(); }, 2900);
}
function checkAch(){
  let c; try{ c=metaCtx(); }catch(e){ return; }
  let changed=false, n=0;
  ACHS.forEach(a=>{
    if(ACH[a[0]]) return;
    let ok=false; try{ ok=achProg(a,c).ok; }catch(e){}
    if(!ok) return;
    ACH[a[0]]=Date.now(); changed=true; n++;
    if(ACH_FIRST) return;
    ACH_Q.push(a); if(G && G.log && G.phase!=='title') logAdd('gym','🏆',`Conquista: ${a[2]}`);
  });
  if(ACH_FIRST){ ACH_FIRST=false; lsSet(ACH_KEY, ACH); if(n) toast(`🏆 ${n} conquista${n>1?'s':''} pelas suas carreiras anteriores!`); return; }
  if(changed){ lsSet(ACH_KEY, ACH); achToast(); }
}
function achCount(){ return ACHS.filter(a=>ACH[a[0]]).length; }
function achScreen(){
  let c; try{ c=metaCtx(); }catch(e){ c=null; }
  const n=achCount();
  const rows=ACHS.map(a=>{
    const got=ACH[a[0]], p=c && !got && a[5] ? achProg(a,c) : null;
    const bar=p ? `<div class="evobar"><i style="width:${p.v/p.max*100}%"></i></div><span class="ach-p">${p.v}/${p.max}</span>` : '';
    return `<div class="ach ${got?'got':''}"><div class="ach-ic" aria-hidden="true">${got?a[1]:'🔒'}</div>
      <div><div class="ach-n">${a[2]}</div><div class="ach-d">${a[3]}</div>${bar}${got?`<div class="ach-w">${new Date(got).toLocaleDateString('pt-BR')}</div>`:''}</div></div>`;
  }).join('');
  scene(`<div class="ribbon plate"><span class="spk">✦</span>🏆 CONQUISTAS<span class="spk">✦</span></div>
    <div class="dx-count"><span>DESBLOQUEADAS <b>${n}</b>/${ACHS.length}</span></div>
    <div class="dx-bar"><i style="width:${n/ACHS.length*100}%"></i></div>
    <div class="ach-list">${rows}</div>${menu(btn('title','VOLTAR'))}`, 'dexs');
}

/* ---------- ranking global ---------- */
const RANK_API="api/ranking";
function player(){
  let p=lsGet("kc_player", null);
  if(!p || !/^[a-f0-9]{16,32}$/.test(p.pid||'')){
    let id=""; try{ const a=new Uint8Array(12); crypto.getRandomValues(a); id=[...a].map(x=>x.toString(16).padStart(2,'0')).join(''); }
    catch(e){ for(let i=0;i<24;i++) id+=Math.floor(Math.random()*16).toString(16); }
    p={pid:id, name:""}; lsSet("kc_player", p);
  }
  return p;
}
function rankEntry(){
  if(!G || !G.team) return null;
  return {region:REGION, badges:G.gymIndex, elite:G.eliteIndex, legend:G.phase==='legend', day:G.day, starter:G.starter||'',
    team:G.team.filter(m=>!m.egg).slice(0,6).map(m=>({s:m.species, sh:!!m.shiny})), reached:careerReached()};
}
function rankScore(e){ return e.badges*10 + e.elite*12 + (e.elite>=5?20:0) + (e.legend?30:0); }
function rankBtn(){ return btn('rankFrom','🌍 ENVIAR PRO RANKING','Sua carreira no ranking global de '+RT.name); }
const RK={};   /* cache por região: {state:'loading'|'ok'|'off'|'err', data, msg} */
function rankLoad(region, force){
  if(RK[region] && RK[region].state==='loading') return;
  if(RK[region] && RK[region].state==='ok' && !force) return;
  if(typeof fetch!=='function' || (typeof location!=='undefined' && !/^https?:$/.test(location.protocol))){ RK[region]={state:'off', msg:'O ranking só funciona no site (abrindo o arquivo direto não tem servidor).'}; return; }
  RK[region]={state:'loading'};
  fetch(`${RANK_API}?region=${region}&pid=${player().pid}`, {cache:'no-store'})
    .then(r=>r.json().then(j=>({ok:r.ok, s:r.status, j})))
    .then(({ok,s,j})=>{ RK[region] = ok ? {state:'ok', data:j} : s===503 ? {state:'off', msg:'O ranking global ainda não foi ativado neste site.'} : {state:'err', msg:j.error||'Erro no ranking.'}; })
    .catch(()=>{ RK[region]={state:'err', msg:'Sem conexão com o ranking. Confira a internet.'}; })
    .then(()=>{ if(G.phase==='rank') render(); });
}
function rankSend(){
  const e=G.rankEntry; if(!e || G.rankSending) return;
  const inp=document.getElementById('rk-name'), name=(inp && inp.value || '').trim();
  if(name.length<2){ toast('Escreva um nome com pelo menos 2 letras.'); return; }
  const p=player(); p.name=name.slice(0,12); lsSet("kc_player", p);
  if(typeof fetch!=='function' || !/^https?:$/.test(location.protocol)){ toast('O ranking só funciona no site.'); return; }
  G.rankSending=true; render();
  fetch(RANK_API, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(Object.assign({pid:p.pid, name:p.name}, e))})
    .then(r=>r.json().then(j=>({ok:r.ok, s:r.status, j})))
    .then(({ok,s,j})=>{
      if(ok){ G.rankSent=true; G.rankImproved=j.improved; RK[e.region]={state:'ok', data:j}; toast(j.improved?`Enviado! Você está em ${j.me?j.me.pos+'º':'—'} lugar.`:'Enviado! Sua melhor carreira continua valendo.'); }
      else toast(s===503?'O ranking global ainda não foi ativado neste site.':(j.error||'Não deu pra enviar.'));
    })
    .catch(()=>toast('Sem conexão com o ranking. Tente de novo.'))
    .then(()=>{ G.rankSending=false; if(G.phase==='rank') render(); });
}
function rankScreen(){
  const reg=G.rankR || (G.rankEntry && G.rankEntry.region) || (REGIONS[LOBBY].ready?LOBBY:'kanto');
  rankLoad(reg);
  const st=RK[reg]||{state:'loading'}, e=G.rankEntry, p=player();
  const tabs=META_REGIONS.map(r=>`<button class="seg ${r===reg?'on':''}" data-act="rankR" data-arg="${r}" aria-pressed="${r===reg}">${RNAME[r].toUpperCase()}</button>`).join('');
  let form='';
  if(e && !G.rankSent){
    form=`<div class="rec-card rk-form"><div class="rec-h">📤 SUA CARREIRA EM ${RNAME[e.region].toUpperCase()}</div>
      <div class="rk-sum">${escH(e.reached)} · ${e.badges}/8 insígnias · ${e.day} dias · <b>${rankScore(e)} pts</b></div>
      <label class="rk-l" for="rk-name">NOME DE TREINADOR</label>
      <div class="rk-in"><input id="rk-name" maxlength="12" autocomplete="nickname" enterkeyhint="send" value="${escH(p.name)}" placeholder="Ex.: Ash">
      <button class="seg on" data-act="rankSend" ${G.rankSending?'disabled':''}>${G.rankSending?'ENVIANDO...':'ENVIAR'}</button></div>
      <div class="rk-tip">Fica no ranking só a sua melhor carreira de cada região.</div></div>`;
  } else if(e && G.rankSent) form=`<div class="rk-ok">✔ Carreira enviada${G.rankImproved?'':' (a sua melhor anterior era maior e continua valendo)'}.</div>`;
  let body;
  if(st.state==='loading') body=`<div class="dx-empty">⏳ Carregando o ranking...</div>`;
  else if(st.state!=='ok') body=`<div class="dx-empty">${escH(st.msg)}</div>${st.state==='err'?menu(btn('rankRetry','TENTAR DE NOVO')):''}`;
  else {
    const d=st.data, mine=d.me && !d.rows.some(r=>r.me) ? d.me : null;
    const row=r=>`<div class="rk-row ${r.me?'me':''} ${r.pos<=3?'p'+r.pos:''}"><span class="rk-pos">${r.pos<=3?['🥇','🥈','🥉'][r.pos-1]:r.pos+'º'}</span>
      <span class="rk-team">${(r.team||[]).slice(0,6).map(m=>{ const s=(m.sh&&typeof SHINY!=='undefined'&&SHINY[m.s])||SPRITES[m.s]; return s?`<img src="${s}" alt="${escH(m.s)}" title="${escH(m.s)}${m.sh?' ✨':''}">`:''; }).join('')}</span>
      <span class="rk-nm">${escH(r.name)}<small>${r.legend?'Lenda':r.elite>=5?'Campeão':r.elite>0?`Elite Four ${r.elite}/5`:`${r.badges}/8 insígnias`} · ${r.day} dias</small></span>
      <b class="rk-sc">${r.score}</b></div>`;
    body = d.rows.length ? `<div class="rk-list">${d.rows.map(row).join('')}${mine?`<div class="rk-gap">⋯</div>${row(mine)}`:''}</div>
      <div class="rk-tip">${d.total} treinador${d.total===1?'':'es'} em ${RNAME[reg]} · 10 pts por insígnia, 12 por vitória na Liga, +20 campeão, +30 lenda. Empate: menos dias.</div>`
      : `<div class="dx-empty">Ninguém no ranking de ${RNAME[reg]} ainda. Seja o primeiro!</div>`;
  }
  scene(`<div class="ribbon plate"><span class="spk">✦</span>🌍 RANKING GLOBAL<span class="spk">✦</span></div>${form}
    <div class="segs dx-fs">${tabs}</div>${body}${menu(e?btn('rankBack','VOLTAR PRO FIM DA CARREIRA'):'', btn('title','🏠 TELA INICIAL'))}`, 'dexs');
}

/* ---------- botões da tela inicial ---------- */
function metaRow(){
  try{ checkAch(); }catch(e){}   /* o contador já mostra o que acabou de desbloquear */
  return `<div class="meta-row"><button class="btn mini" data-act="ach">🏆<small>CONQUISTAS ${achCount()}/${ACHS.length}</small></button>`
    + `<button class="btn mini" data-act="shinies">✨<small>SHINIES ${SHLOG.length}</small></button>`
    + `<button class="btn mini" data-act="rank">🌍<small>RANKING</small></button></div>`;
}
/* ações (chamadas pelo act() da UI); true = redesenhar */
function metaAct(id, arg){
  switch(id){
    case 'ach': G.phase='ach'; return true;
    case 'shinies': G.shF='all'; G.phase='shinies'; return true;
    case 'shF': G.shF=arg; return true;
    case 'rank': G.rankEntry=null; G.rankR=null; G.phase='rank'; return true;
    case 'rankFrom': G.rankBackTo=G.phase; G.rankEntry=rankEntry(); G.rankR=REGION; G.phase='rank'; return true;
    case 'rankBack': G.phase=G.rankBackTo||'title'; G.recorded=true; G.legendRecorded=true; return true;
    case 'rankR': G.rankR=arg; return true;
    case 'rankRetry': delete RK[G.rankR||REGION]; return true;
    case 'rankSend': rankSend(); return false;
  }
  return false;
}
Object.assign(SCREENS, {ach:achScreen, shinies:shiniesScreen, rank:rankScreen});
document.addEventListener('keydown', e=>{ if(e.key==='Enter' && e.target && e.target.id==='rk-name'){ e.preventDefault(); rankSend(); } });
