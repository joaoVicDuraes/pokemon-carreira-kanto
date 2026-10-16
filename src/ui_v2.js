/* =====================================================================
   INTERFACE v2 — visual estilo GBA (FireRed/LeafGreen)
   ===================================================================== */
const SHINY_RATE = 1/40;
const CITY = ["Pewter","Cerulean","Vermilion","Celadon","Fuchsia","Saffron","Cinnabar","Viridian"];
const BADGE_NAMES = ["Insígnia Rocha","Insígnia Cascata","Insígnia Trovão","Insígnia Arco-Íris","Insígnia Alma","Insígnia Pântano","Insígnia Vulcão","Insígnia Terra"];
const LEADER_LINES = [
  "Sua determinação é dura como pedra. Essa insígnia é sua.",
  "Tá bom, tá bom... você venceu! Leva logo essa insígnia.",
  "Você me deu um choque, garoto! Mereceu.",
  "Que batalha linda... você floresceu como treinador.",
  "Um ninja sabe reconhecer a derrota. Siga seu caminho.",
  "Eu previ minha derrota... e mesmo assim não acreditei.",
  "Hah! Você apagou meu fogo! Que calor de batalha!",
  "Hmph... a Equipe Rocket vai lembrar do seu nome."
];
const TYPE_PT = {fire:"Fogo",water:"Água",grass:"Planta",electric:"Elétrico",normal:"Normal",poison:"Veneno",rock:"Pedra",psychic:"Psíquico",ghost:"Fantasma",fighting:"Lutador",ground:"Terra",bug:"Inseto",flying:"Voador",ice:"Gelo",dragon:"Dragão",dark:"Sombrio",steel:"Aço"};
const REDUCE = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

/* ---------- opções do jogador: tema (auto/claro/escuro) e velocidade do texto ---------- */
const OPTS = (()=>{ try{ return Object.assign({theme:'auto', txt:'normal'}, JSON.parse(localStorage.getItem('kc_opts'))||{}); }catch(e){ return {theme:'auto', txt:'normal'}; } })();
function saveOpts(){ try{ localStorage.setItem('kc_opts', JSON.stringify(OPTS)); }catch(e){} }
/* caracteres por quadro do texto letra-por-letra (0 = instantâneo) e fator das pausas da batalha */
const TXT_STEP = {normal:2, fast:6, instant:0}, TXT_PACE = {normal:1, fast:0.65, instant:0.45};
function isDark(){
  if(OPTS.theme==='dark') return true;
  if(OPTS.theme==='light') return false;
  return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}
function applyTheme(){
  const dk=isDark();
  try{ document.body.dataset.theme = dk ? 'dark' : 'light'; }catch(e){}
  try{ const m=document.querySelector('meta[name="theme-color"]'); if(m) m.setAttribute('content', dk ? '#0B1022' : (THEME_COLOR[document.body.dataset.region]||'#E3350D')); }catch(e){}
}
const THEME_COLOR = {kanto:'#E3350D', johto:'#2F6FD6', hoenn:'#2E9E5B'};
try{ const mq=window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)'); if(mq && mq.addEventListener) mq.addEventListener('change', ()=>{ if(OPTS.theme==='auto') applyTheme(); }); }catch(e){}

/* ícones de item em pixel art (PokeAPI) no lugar dos emojis dos botões */
function ico(name){ const s=typeof ITEMS!=='undefined' && ITEMS[name]; return s ? `<img class="ic-px" src="${s}" alt="" aria-hidden="true">` : ''; }

/* ---------- sprites ---------- */
function frontSrc(sp, shiny){ return (shiny && SHINY[sp]) || SPRITES[sp] || ""; }
function backSrc(m){ return (m.shiny && SHINY_BACKS[m.species]) || BACKS[m.species] || frontSrc(m.species, m.shiny); }
function front(m, cls){
  const src = frontSrc(m.species, m.shiny);
  return src ? `<img${cls ? ` class="${cls}"` : ""} src="${src}" alt="${m.species}">` : `<span class="emo">${m.e || "❔"}</span>`;
}
/* líderes e treinadores (sprites FRLG) e insígnias de Kanto */
const FEM = f => ["Misty","Erika","Sabrina","Lorelei","Agatha","Whitney","Jasmine","Clair","Karen"].includes(f.leader);
function trainerKey(name){
  const k = /Rival|Champion/.test(name) ? RT.rivalChamp : name.toLowerCase().replace(/[^a-z]/g,'');
  return TRAINERS[RT.trainerPrefix+k] ? RT.trainerPrefix+k : k;
}
function leaderImg(foe, cls){
  const src = TRAINERS[trainerKey(foe.leader)];
  return src ? `<img class="tr-img ${cls||''}" src="${src}" alt="${foe.leader}">` : `<span class="emo">${foe.e}</span>`;
}
function badgeImg(i, cls){ return `<img class="bd-img ${cls||''}" src="${BADGES[i]}" alt="${BADGE_NAMES[i]}">`; }
/* ícone de cada fatia da roleta: P:<Pokémon> usa o sprite, T:<treinador> usa o treinador, senão o emoji */
const WHEEL_ICON = {
  "Pikachu raro":"P:Pikachu","Reforço R22":"P:Mankey","Casulo acelerado":"P:Butterfree","Caçador de Insetos":"T:bugcatcher",
  "Enxame Beedrill":"P:Beedrill","Veneno de Weedle":"P:Weedle","Susto na grama":"P:Pidgeotto","Moon Stone":"P:Clefairy",
  "Resgate em Cerulean":"P:Eevee","Magikarp honesto":"P:Gyarados","Emboscada Rocket":"T:rocketgrunt","Golpe do Magikarp":"P:Magikarp",
  "Confusão de Zubats":"P:Zubat","Caverna Diglett":"P:Diglett","Banquete S.S. Anne":"T:sailor","Presente do Capitão":"P:Abra",
  "Lixeiras eletrificadas":"P:Voltorb","Saqueadores no porto":"T:rocketgrunt","Jackpot Game Corner":"P:Porygon","Fogo contra Erika":"P:Growlithe",
  "Vício no cassino":"T:gamer","Assombração":"P:Gastly","Rock Tunnel escuro":"P:Geodude","Snorlax":"P:Snorlax","Safari Zone":"P:Kangaskhan",
  "Dojo de Saffron":"P:Hitmonlee","Gangue de motoqueiros":"T:biker","Armadilha ninja":"P:Koffing","Herói da Silph":"P:Lapras",
  "Protótipo do Presidente":"T:scientist","Sombra de Lavender":"P:Gengar","Emboscada Giovanni":"T:giovanni","Controle mental":"P:Hypno",
  "Ressurreição":"P:Aerodactyl","Lenda Seafoam":"P:Articuno","Ladrão na Mansão":"T:burglar","Quiz errado":"T:blaine","Correnteza Seafoam":"P:Tentacruel",
  "Usina Elétrica":"P:Zapdos","Duelo com o Rival":"T:blue","Deserção Rocket":"P:Dragonite","Ultimato Rocket":"T:rocketgrunt","Fissure":"P:Dugtrio",
  "Labirinto teleporte":"P:Kadabra","Lendário":"P:Mewtwo","Fóssil":"P:Omanyte","Frustração Safari":"P:Tauros",
  "Chama de Moltres":"P:Moltres","Ás da Victory Road":"T:acetrainer","Morador da caverna":"T:hiker","Enigma das pedras":"T:blackbelt",
  "Golbats na escuridão":"P:Golbat","Desmoronamento":"P:Onix"
};
function wheelIconSrc(ev){
  const k=WHEEL_ICON[ev.lb]; if(!k) return null;
  return k[0]==='P' ? (SPRITES[k.slice(2)]||null) : (TRAINERS[k.slice(2)]||null);
}
function typeTag(t){ const n=(TYPE_PT[t]||t).normalize('NFD').replace(/[\u0300-\u036f]/g,''); return `<span class="type t-${t}">${n}</span>`; }
function chain(sp){ const a=[sp]; let c=sp; while(DEX[c] && DEX[c].evo){ c=DEX[c].evo; a.push(c); } return a; }
function prevEvoLv(sp){ for(const k in DEX){ if(DEX[k].evo===sp && DEX[k].evoLv<99) return DEX[k].evoLv; } return 5; }
function topThree(){ return G.team.slice().sort((a,b)=>monPower(b)-monPower(a)).slice(0,3); }
function bestAttacker(t){ return topThree().sort((a,b)=>typeMult(b.t,t)-typeMult(a.t,t) || monPower(b)-monPower(a))[0]; }
function strongestMon(){ return G.team.slice().sort((a,b)=>monPower(b)-monPower(a))[0] || null; }

/* ---------- regras de chance: curva logística (preparo pesa, mas nunca é 0% ou 100%) ---------- */
function curve(e,f,lo,hi){ if(e<=0) return lo; const p=1/(1+Math.pow(f/e,3.5)); return Math.min(hi,Math.max(lo,p)); }
function gymChance(eff, foe){ return curve(eff,foe,0.03,0.97); }
function eliteChance(eff, foe){ return curve(eff,foe,0.03,0.95); }

/* ---------- antes/depois: níveis, capturas, evoluções, perdas ---------- */
function snap(){ const m=new Map(); G.team.forEach(x=>m.set(x,{lv:x.lv, sp:x.species})); return m; }
function diffOf(before){
  const out={per:new Map(), evos:[], lost:[], caught:[]};
  G.team.forEach(x=>{
    const b=before.get(x);
    if(!b){ out.per.set(x,{isNew:true}); out.caught.push(x); return; }
    const r={dl:x.lv-b.lv};
    if(b.sp!==x.species){ r.evo=b.sp; out.evos.push([b.sp, x.species]); }
    out.per.set(x, r);
  });
  before.forEach((b,x)=>{ if(!G.team.includes(x)) out.lost.push({species:b.sp, lv:b.lv, shiny:x.shiny, e:(DEX[b.sp]||{}).e}); });
  return out;
}
function logAdd(kind, ic, text){ G.log.push({day:G.day, kind, ic, text}); }
function postProcess(diff){
  diff.caught.forEach(m=>{ if(m.shiny) G.stats.shinies++; logAdd('catch','🟣',`Capturou ${m.species}${m.shiny?' ✨ SHINY':''} (Lv ${m.lv})`); });
  diff.evos.forEach(([a,b])=>logAdd(a==='Ovo'?'catch':'evo', a==='Ovo'?'🥚':'✨', a==='Ovo'?`O ovo chocou: ${b}`:`${a} evoluiu para ${b}`));
  diff.lost.forEach(l=>logAdd('bad','💔',`Perdeu ${l.species} (Lv ${l.lv})`));
  diff.newDex=[]; G.team.forEach(m=>{ if(dexRegister(m)) diff.newDex.push(m.species); });
  if(diff.newDex.length) logAdd('catch','📕',`Novo na Pokédex: ${diff.newDex.join(', ')}`);
}

/* ---------- estado novo ---------- */
function pickWild(){ const s=WILD_POOL[Math.floor(Math.random()*WILD_POOL.length)]; return mon(s, 4+Math.floor(Math.random()*6)+G.gymIndex*2); }

/* ---------- recordes (localStorage) ---------- */
const REC_KEY = "kc_carreira_kanto_v1";
function loadRec(){ try{ return JSON.parse(localStorage.getItem(REC_KEY)) || {}; }catch(e){ return {}; } }
function saveRec(r){ try{ localStorage.setItem(REC_KEY, JSON.stringify(r)); }catch(e){} }
function commitRecord(won){
  const r=loadRec(); r.runs=(r.runs||0)+1; if(won) r.champs=(r.champs||0)+1;
  r.shinies=(r.shinies||0)+G.stats.shinies;
  const score=G.gymIndex*10 + G.eliteIndex*12 + (won?20:0);
  const isNew = score > (r.bestScore||0);
  if(isNew){ r.bestScore=score; r.bestBadges=G.gymIndex; r.bestElite=G.eliteIndex; }
  saveRec(r);
  return isNew && r.runs>1;
}

/* ---------- typewriter (diálogo estilo GBA) ---------- */
let TW=null;
function typewrite(el, html){
  if(TW){ clearInterval(TW.t); TW=null; }
  el.classList.remove('done');
  if(REDUCE() || !html || !TXT_STEP[OPTS.txt]){ el.innerHTML=html||""; el.classList.add('done'); return; }
  const toks=[]; let i=0;
  while(i<html.length){
    const c=html[i];
    if(c==='<'){ const j=html.indexOf('>',i); if(j<0){ toks.push(c); i++; continue; } toks.push(html.slice(i,j+1)); i=j+1; }
    else if(c==='&'){ const j=html.indexOf(';',i); if(j<0||j-i>8){ toks.push(c); i++; continue; } toks.push(html.slice(i,j+1)); i=j+1; }
    else { const s=String.fromCodePoint(html.codePointAt(i)); toks.push(s); i+=s.length; }
  }
  let n=0; el.innerHTML="";
  const st={el};
  st.finish=()=>{ clearInterval(st.t); el.innerHTML=html; el.classList.add('done'); if(TW===st) TW=null; };
  st.t=setInterval(()=>{
    let added=0; const per=TXT_STEP[OPTS.txt]||2; while(n<toks.length && added<per){ if(toks[n++][0]!=='<') added++; }
    el.innerHTML=toks.slice(0,n).join("");
    if(n>=toks.length) st.finish();
  },16);
  el.onclick=()=>st.finish();
  TW=st;
}

/* ---------- moldura de tela ---------- */
const $scene=document.getElementById('scene'), $hud=document.getElementById('hud');
/* a fonte pixel não tem maiúsculas acentuadas (Á, Í, Ó...): troca só nos rótulos em PS2P */
const PX_SEL='.ribbon,.ev-title,.reward-line,.btn,.lc-name,.lc-top,.type,.chip,.m-name,.m-lv,.press,.rec-h,.foot,.party-h,.pips,.legend,.vs-row,.chance,.mtag,.hp-name,.hp-num,.tc-head,.log-h,.over-title,.hof-title,.logo-sub,.logo-ed,.vsb,.e4 small,.lc-badge small,.how-card h4,.rec-grid span,.newrec,.speaker,.d,.m-pow,.nm,.seg,.opt-row>span,.ps b,.dx-f,.dxd-h';
const ACC={'Á':'A','À':'A','Â':'A','Ã':'A','É':'E','Ê':'E','Í':'I','Ó':'O','Ô':'O','Õ':'O','Ú':'U'};
function fixPx(root){
  if(!root || !root.querySelectorAll) return;
  root.querySelectorAll(PX_SEL).forEach(el=>{
    const w=document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n; while((n=w.nextNode())){
      if(n.parentElement && n.parentElement.closest('small')) continue;
      const t=n.nodeValue.replace(/[ÁÀÂÃÉÊÍÓÔÕÚ]/g, c=>ACC[c]);
      if(t!==n.nodeValue) n.nodeValue=t;
    }
  });
}
function scene(html, cls, tw){
  if(TW){ clearInterval(TW.t); TW=null; }
  $scene.className='scene '+(cls||'');
  $scene.innerHTML=html;
  renderHUD();
  try{ fixPx($scene); }catch(e){}
  const el=$scene.querySelector('#tw');
  if(el && tw!=null) typewrite(el, tw);
}
function renderHUD(){
  if(["title","how","pick","dex"].includes(G.phase)){ $hud.innerHTML=""; return; }
  const badges=GYMS.map((g,i)=>`<span class="hb ${i<G.gymIndex?'on':''}" title="${BADGE_NAMES[i]} — ${g.leader}">${badgeImg(i)}</span>`).join("")
    + `<span class="hb trophy ${G.phase==='champion'?'on':''}" title="Campeão da Liga">🏆</span>`;
  $hud.innerHTML=`<div class="hud-badges" role="img" aria-label="${G.gymIndex} de 8 insígnias">${badges}</div>
    <div class="hud-chips"><div class="chip">PODER<b>${teamPower()}</b></div><div class="chip">TIME<b>${G.team.length}/6</b></div><div class="chip">DIA<b>${G.day}${RT && RT.dayNight ? ' '+TIME_IC[timeIdx()] : ''}</b></div></div>`;
}
function btn(id, label, sub, opt){ opt=opt||{};
  return `<button class="btn ${opt.primary?'primary':''}" ${opt.disabled?'disabled':''} data-act="${id}"${opt.arg?` data-arg="${opt.arg}"`:''}>${label}${sub?`<small>${sub}</small>`:''}</button>`; }
function menu(){ return `<div class="menu">${Array.prototype.join.call(arguments,"")}</div>`; }
function leaderCard(av, top, name, sub, badge){
  return `<div class="leader"><div class="avatar">${av}</div><div><div class="lc-top">${top}</div><div class="lc-name">${name}</div><div class="lc-sub">${sub}</div></div><div class="lc-badge">${badge}</div></div>`; }
function matchTag(mult){
  if(mult>1) return `<span class="mtag adv">VANTAGEM ×${mult}</span>`;
  if(mult<1) return `<span class="mtag dis">DESVANTAGEM ×${mult}</span>`;
  return `<span class="mtag neu">NEUTRO ×1</span>`; }
function vsBox(foe, ftype, kind){
  const mine=teamPower(), mult=bestMatchup(ftype), eff=Math.round(mine*mult);
  const ch = kind==='elite' ? eliteChance(eff,foe) : gymChance(eff,foe);
  const mx=Math.max(eff,foe,1)*1.08, cls=ch>=0.6?'good':ch>=0.4?'mid':'low';
  const who=mult!==1 && G.team.length ? ` · ${bestAttacker(ftype).species}` : '';
  return `<div class="vsbox">
    <div class="vs-row"><span>VOCÊ</span><div class="bar"><i class="me" style="width:${eff/mx*100}%"></i></div><b>${eff}</b></div>
    <div class="vs-row"><span>${kind==='elite'?'LIGA':'LÍDER'}</span><div class="bar"><i class="foe" style="width:${foe/mx*100}%"></i></div><b>${foe}</b></div>
    <div class="chance"><span>${matchTag(mult)}${who}</span><span>CHANCE <b class="${cls}">${Math.round(ch*100)}%</b></span></div></div>`; }
function pips(){
  let h='<div class="pips">';
  for(let i=0;i<STEPS_PER_GYM;i++) h+=`<span class="mini-ball ${i<G.step?'used':''}"></span>`;
  return h+`<span>DECISÕES RESTANTES: ${Math.max(0,STEPS_PER_GYM-G.step)}</span></div>`; }
/* líder + barras de poder num bloco só (o hub cabe na tela do celular) */
function foeBlock(av, top, name, sub, badge, power, t, kind){
  return `<div class="foe-card">${leaderCard(av, top, name, sub, badge)}${vsBox(power, t, kind)}</div>`; }
/* faixa com os 6 espaços do time: o time fica visível sem rolar a tela; tocar leva à lista completa */
function partyStrip(){
  if(!G.team.length) return '';
  const top=new Set(topThree());
  let h='';
  for(let i=0;i<6;i++){
    const m=G.team[i];
    h += m ? `<span class="ps ${i===0?'lead':''} ${top.has(m)&&G.team.length>3?'top':''}">${front(m)}<b>${m.egg?'OVO':'Lv'+m.lv}</b></span>`
           : `<span class="ps empty"></span>`;
  }
  return `<button class="pstrip" data-act="seeTeam" aria-label="Ver o time completo (${G.team.length} de 6)">${h}</button>`;
}

/* ---------- time (estilo menu de party) ---------- */
function partyHTML(diff, opts){
  opts=opts||{};
  if(!G.team.length && !(diff && diff.lost.length)) return "";
  const top=new Set(topThree());
  const rows=G.team.map((m,i)=>{
    const d=DEX[m.species], per=diff && diff.per.get(m);
    let tags="";
    if(per){
      if(per.isNew) tags+=`<i class="d d-new">NOVO</i>`;
      else { if(per.evo) tags+=`<i class="d d-evo">EVOLUIU</i>`;
             if(per.dl>0) tags+=`<i class="d d-up">▲${per.dl}</i>`; else if(per.dl<0) tags+=`<i class="d d-dn">▼${-per.dl}</i>`; }
    }
    let evo;
    if(m.egg) evo=`<span class="evo-lbl">🥚 choca em ${m.hatch} ${m.hatch===1?'decisão':'decisões'} · não luta ainda</span>`;
    else if(d.friend){
      const pct=Math.min(100,(m.fr||0)/FR_MAX*100), lab=d.friend.includes('|')?d.friend.split('|').map((x,k)=>x+(k?' (noite)':' (dia)')).join(' / '):d.friend;
      evo=`<div class="evobar fr"><i style="width:${pct}%"></i></div><span class="evo-lbl">💛 amizade → ${lab}${d.evo&&d.evoLv>=99?' · ou 💎 pedra na roleta':''}</span>`;
    }
    else if(d.evo && d.evoLv<99){
      const prev=prevEvoLv(m.species), pct=Math.max(0,Math.min(100,(m.lv-prev)/(d.evoLv-prev)*100));
      evo=`<div class="evobar"><i style="width:${pct}%"></i></div><span class="evo-lbl">${m.lv>=d.evoLv?`→ ${d.evo}: evolui no próximo ganho de nível!`:`→ ${d.evo} no Lv ${d.evoLv}`}</span>`;
    } else if(d.evo){
      const how=STONE[m.species];
      const to=BRANCH[m.species]?BRANCH[m.species].join('/'):d.evo;
      evo=`<span class="evo-lbl">💎 → ${to} ${how==='troca'?'por troca':'com '+(how||'Pedra Evolutiva')} (evento da roleta)</span>`;
    }
    else evo=`<span class="evo-lbl">★ forma final</span>`;
    let rel="";
    if(opts.manage && i>0){
      rel = G.releaseAsk===i
        ? `<div class="rel-ask">Soltar ${m.species}? <button class="rel yes" data-act="releaseYes" data-arg="${i}">SIM, SOLTAR</button><button class="rel" data-act="releaseNo">NÃO</button></div>`
        : `<button class="rel" data-act="release" data-arg="${i}" aria-label="Soltar ${m.species}">SOLTAR</button>`;
    }
    return `<div class="mon ${i===0?'lead':''} ${top.has(m)&&G.team.length>3?'top':''}">
      <div class="sp">${front(m)}</div>
      <div><div class="m-name">${i===0?'<span class="star">★</span> ':''}${m.species}${m.shiny?' <span class="shiny">✨</span>':''}</div>
        <div class="m-sub">${typeTag(m.t)}<span class="m-lv">Lv${m.lv}</span>${tags}</div>${evo}${rel}</div>
      <div class="m-pow">PODER<b>${monPower(m)}</b></div></div>`;
  }).join("");
  const lost=diff ? diff.lost.map(l=>`<div class="mon lost"><div class="sp">${front(l)}</div><div><div class="m-name">${l.species}</div><div class="m-sub"><i class="d d-dn">PERDIDO</i></div></div><div></div></div>`).join("") : "";
  const hint = opts.manage && G.team.length>1 ? ' Solte quem não ajuda pra liberar espaço (não gasta decisão; o inicial fica).' : '';
  return `<div class="party-h" id="party">SEU TIME (${G.team.length}/6)<small>O poder vem dos 3 mais fortes${G.team.length>3?' — marcados com TOP3':''}. ★ = seu inicial.${hint}</small></div><div class="party">${rows}${lost}</div>`;
}

/* =====================================================================
   TELAS
   ===================================================================== */
function optionsCard(){
  const seg=(act, cur, list)=>list.map(([v,l])=>`<button class="seg ${cur===v?'on':''}" data-act="${act}" data-arg="${v}" aria-pressed="${cur===v}">${l}</button>`).join('');
  return `<div class="rec-card opts"><div class="rec-h">⚙️ OPÇÕES</div>
    <div class="opt-row"><span>TEMA</span><div class="segs">${seg('optTheme', OPTS.theme, [['auto','AUTO'],['light','CLARO'],['dark','ESCURO']])}</div></div>
    <div class="opt-row"><span>TEXTO</span><div class="segs">${seg('optTxt', OPTS.txt, [['normal','NORMAL'],['fast','RÁPIDO'],['instant','JÁ']])}</div></div></div>`;
}
function title(){
  const LR=REGIONS[LOBBY], ready=LR.ready, soon=!!LR.soon;
  const srcs = ready ? STARTERS.map(s=>[s,SPRITES[s]]) : (LOBBY_PREVIEW[LOBBY]||[]).map((u,i)=>[(LR.RT.starters||[])[i]||'',u]);
  const st=srcs.map(([s,u],i)=>`<img class="t-spr hop" style="animation-delay:${i*0.25}s" src="${u}" alt="${s}">`).join("");
  const r=ready?loadRec():{};
  const rec = r.runs
    ? `<div class="rec-grid"><div><span>CARREIRAS</span><b>${r.runs}</b></div><div><span>RECORDE</span><b>${r.bestBadges||0}/8</b></div><div><span>CAMPEÃO</span><b>${r.champs||0}×</b></div><div><span>SHINIES</span><b>${r.shinies||0}</b></div></div>`
    : `<div class="rec-empty">Nenhuma carreira ainda. Sua lenda começa agora.</div>`;
  const sv=ready?loadSave():null, dk=ready?dexCounts():{c:0}, tot=ready?DEX_LIST.length:(LR.RT.dexTotal||251);
  const dexBtn=btn('dex',`<span class="ic-dex" aria-hidden="true"></span>POKéDEX ${dk.c}/${tot}`,`Tudo que você já registrou em ${LR.RT.name}`);
  const howBtn=btn('how',`${ico('teachy-tv')}COMO JOGAR`,'Estrada, roleta, tipos e a Liga');
  const main = soon
    ? menu(btn('noop',`🔒 ${LR.RT.name.toUpperCase()} · EM BREVE`, LR.RT.soonText||'Essa região chega numa próxima atualização.',{disabled:true}))
    : !ready
    ? menu(btn('noop', LR.failed?`⚠️ NÃO DEU PRA CARREGAR ${LR.RT.name.toUpperCase()}`:`⏳ CARREGANDO ${LR.RT.name.toUpperCase()}...`, LR.failed?'Confira a internet e toque em ▶ de novo.':'Baixando os Pokémon da região, só um instante.',{disabled:true}))
    : G.confirmNew
    ? menu(btn('new','SIM, COMEÇAR DO ZERO','A carreira salva será apagada',{primary:true}), btn('newNo','NÃO, VOLTAR'))
    : sv ? menu(btn('continue',`${ico('town-map')}CONTINUAR CARREIRA`, saveSummary(sv), {primary:true}), btn('new','NOVO JOGO','Apaga a carreira salva'), dexBtn, howBtn)
    : menu(btn('new',`${ico('poke-ball')}NOVO JOGO`,`Comece em ${LR.RT.home} com seu primeiro parceiro`,{primary:true}), dexBtn, howBtn);
  const dots=REGION_ORDER.map(id=>`<i class="${id===LOBBY?'on':''}"></i>`).join("");
  scene(`<div class="title-sky"><div class="stars"></div><div class="cloud c1"></div><div class="cloud c2"></div><div class="cloud c3"></div>
      <div class="logo"><div class="logo-main">POKéMON</div><div class="logo-sub">CARREIRA DE TREINADOR</div><div class="logo-ed">${LR.RT.edition}</div></div>
      <div class="region-sw"><button class="rg-arrow" data-act="regPrev" aria-label="Região anterior">◀</button>
        <div class="rg-name"><b>${LR.RT.name.toUpperCase()}</b><span class="rg-dots">${dots}</span></div>
        <button class="rg-arrow" data-act="regNext" aria-label="Próxima região">▶</button></div>
      <div class="pokeball title-ball"><i></i></div><div class="starters ${soon?'soon':''}">${st}</div><div class="grass"></div></div>
    <div class="title-menu"><div class="press">— PRESSIONE START —</div>
      ${main}
      ${soon?'':`<div class="rec-card"><div class="rec-h">🏆 SEUS RECORDES</div>${rec}</div>`}
      ${optionsCard()}
      <div class="foot">${tot} POKéMON · 8 GINÁSIOS · ELITE FOUR<br>FAN GAME · SPRITES GBA<span class="kb"> · TECLAS 1-6 ESCOLHEM · ← → TROCAM A REGIÃO</span><span class="tch"> · ARRASTE PRO LADO PRA TROCAR A REGIÃO</span></div></div>`, 'title');
}

function how(){
  const cards=[
    ['🗺️','A ESTRADA','Antes de cada líder você tem 3 decisões. Depois delas, é hora do ginásio.'],
    ['🎲','ROLETA','Eventos temáticos de cada região. Verde é sorte, vermelho é perigo. A sorte cai de 70% no começo para 35% na reta final.'],
    ['🏋️','TREINAR','+2 níveis no time inteiro. Seguro, mas rende menos que a roleta na média.'],
    ['🔎','PROCURAR','Captura garantida de um Pokémon selvagem. Ótimo para cobrir tipos.'],
    ['⚔️','TIPOS','Seu melhor atacante contra o tipo do líder define o multiplicador: ×2 com vantagem, ×0.5 com desvantagem.'],
    ['🛤️','VICTORY ROAD','Depois das 8 insígnias, mais 3 decisões com eventos próprios da caverna (Moltres mora lá) antes de 5 batalhas seguidas na Liga.'],
    ['🎰','RODA SEM REPETIÇÃO','O evento que sai some da roda até o próximo ginásio. A chance de perder Pokémon continua rara.'],
    ['💾','SALVA SOZINHO','A carreira é salva a cada passo. Fechou a aba? É só tocar em CONTINUAR.'],
    ['📕','POKéDEX','Todo Pokémon que passa pelo seu time fica registrado para sempre, em todas as carreiras.'],
    ['💀','PERMADEATH','Perdeu para um líder ou para a Elite Four? Fim da carreira. Se a Rocket levar seu último Pokémon, também.'],
    ['✨','SHINY','1 em cada 40 Pokémon nasce shiny. Raro, brilhante e vai para os seus recordes.'],
  ].map(c=>`<div class="how-card"><div class="ic">${c[0]}</div><div><h4>${c[1]}</h4><p>${c[2]}</p></div></div>`).join("");
  scene(`<div class="ribbon info">📖 COMO JOGAR</div><div class="how">${cards}</div>${menu(btn('new','NOVO JOGO','',{primary:true}), btn('title','VOLTAR'))}`, '');
}

function pickScreen(){
  const cards=STARTERS.map(s=>{
    const d=DEX[s], mu=typeMult(d.t, GYMS[0].t);
    const L=GYMS[0].leader.toUpperCase();
    const v = mu>1 ? ['adv',`BOM CONTRA ${L}`] : mu<1 ? ['dis',`MODO DIFÍCIL: ${L}`] : ['neu',`NEUTRO VS ${L}`];
    const ch=chain(s).map((c,i)=>(i?'<span>›</span>':'')+`<img src="${SPRITES[c]}" alt="${c}">`).join("");
    return `<button class="scard" data-act="choose" data-arg="${s}"><img class="big" src="${SPRITES[s]}" alt="${s}"><div class="nm">${s.toUpperCase()}</div>${typeTag(d.t)}<div class="chain">${ch}</div><div class="vsb ${v[0]}">${v[1]}</div></button>`;
  }).join("");
  const profSrc = RT.profKey && TRAINERS[RT.profKey];
  const prof = profSrc ? `<img class="prof-img" src="${profSrc}" alt="${RT.prof}">` : RT.profIc;
  scene(`<div class="lab"><div class="prof">${prof}</div><div class="lab-ball-row"><div class="pokeball sm"><i></i></div><div class="pokeball sm"><i></i></div><div class="pokeball sm"><i></i></div></div></div>
    <span class="speaker">${RT.prof.toUpperCase()}</span><div class="dialog" id="tw"></div><div class="starters-pick">${cards}</div>`, '',
    'Olá! Bem-vindo ao mundo POKéMON!\nO caminho até a Liga é duro: 8 ginásios, a Elite Four e nenhuma segunda chance. Escolha seu primeiro parceiro com sabedoria!');
}
function chooseStarter(s){
  if(!DEX[s]) return;
  const m=mon(s,5); m.shiny=Math.random()<SHINY_RATE; if(m.shiny) G.stats.shinies++;
  G.team.push(m); G.starter=s;
  logAdd('catch','🎒',`Recebeu ${s}${m.shiny?' ✨ SHINY':''} do ${RT.prof}`);
  G.phase='hub'; render();
}

function decisionMenu(){
  return `<div class="menu split">${
    btn('roll',`${ico('coin-case')}GIRAR A ROLETA`,`${Math.round(greenRatio()*100)}% de sorte nesta fase · rende mais na média, mas arrisca`,{primary:true})
  }${btn('train',`${ico('protein')}TREINAR`,'+2 níveis no time · seguro')
  }${btn('search',`${ico('poke-ball')}PROCURAR`, G.team.length>=6?'Time cheio: você escolhe quem sai':'Captura garantida')}</div>`;
}
function hub(){
  if(G.silver) return hubSilver();
  if(redGyaradosDue()) return redGyaradosScene();
  if(G.gymIndex>=GYMS.length){ if(!G.vrDone) return hubVR(); G.phase='elite'; return render(); }
  const g=GYMS[G.gymIndex], can=G.step>=STEPS_PER_GYM, city=CITY[g.n-1];
  const tw = can ? `Suas 3 decisões acabaram. ${g.leader} te espera no Ginásio de ${city}!`
                 : `Rumo a ${city}. Faltam ${STEPS_PER_GYM-G.step} decisões antes de enfrentar ${g.leader}. O que você faz?`;
  scene(`<div class="ribbon info">ROTA → ${city.toUpperCase()} · GINÁSIO ${g.n}/8</div>
    ${foeBlock(leaderImg(g),'LÍDER DE GINÁSIO',g.leader,`${typeTag(g.t)} Poder ${g.power}`,`${badgeImg(g.n-1)}<small>${BADGE_NAMES[g.n-1].replace('Insígnia ','').toUpperCase()}</small>`, g.power, g.t, 'gym')}
    ${pips()}${partyStrip()}<div class="dialog" id="tw"></div>
    ${can ? menu(btn('challenge',`⚔️ DESAFIAR ${g.leader.toUpperCase()}`,'Perdeu, acabou a carreira',{primary:true})) : decisionMenu()}
    ${partyHTML(null,{manage:true})}`, 'hubs', tw);
}
function hubVR(){
  const e=ELITE[0], can=G.step>=STEPS_PER_GYM;
  const tw = can ? 'A Victory Road ficou para trás. As portas do Platô Índigo se abrem...'
                 : `Victory Road: a última estrada antes da Liga. Depois daqui são 5 batalhas seguidas, sem voltar. Faltam ${STEPS_PER_GYM-G.step} decisões.`;
  scene(`<div class="ribbon info">🛤️ VICTORY ROAD → PLATÔ ÍNDIGO</div>
    ${foeBlock(leaderImg(e),'PRIMEIRA DA ELITE FOUR',e.leader,`${typeTag(e.t)} Poder ${e.power}`,`🏛️<small>LIGA</small>`, e.power, e.t, 'elite')}
    ${pips()}${partyStrip()}<div class="dialog" id="tw"></div>
    ${can ? menu(btn('league','🏛️ ENTRAR NO PLATÔ ÍNDIGO','Sem volta a partir daqui',{primary:true})) : decisionMenu()}
    ${partyHTML(null,{manage:true})}`, 'hubs', tw);
}

/* ---------- roleta circular ---------- */
let SPIN=0;
function rouletteScreen(){
  if(!G.pendingRoll){ const p=rollGymEvent(); G.pendingRoll={lb:p.ev.lb, good:p.good}; saveGame(); }
  const tok=++SPIN, picked=resolveRoll(G.pendingRoll), live=wheelSectors();
  const gr=live.filter(s=>s.good).reduce((a,s)=>a+s.frac,0);   // chance real de sorte nesta roda
  const sectors=live.map(s=>({ev:s.ev, frac:s.frac,
    col: s.good ? (s.i%2?'url(#gG1)':'url(#gG2)') : s.ev.loss ? 'url(#gL)' : (s.i%2?'url(#gR1)':'url(#gR2)')}));
  const gone=usedLabels().length;
  const R=112, C=135, pol=(r,deg)=>{ const a=deg*Math.PI/180; return [C+r*Math.cos(a), C+r*Math.sin(a)]; };
  sectors.forEach(s=>{ if(s.ev.lb==='Pedra evolutiva') s.col='url(#gS)'; });
  let ang=-90, tStart=-90, tSweep=10, paths="", icons="", hitIdx=0; const starts=[];
  sectors.forEach((s,idx)=>{
    const sw=s.frac*360, st=ang; ang+=sw; starts.push(st);
    { const k=WHEEL_ICON[s.ev.lb]; if(k && k[0]==='P') dexSeen(k.slice(2)); }
    if(s.ev===picked.ev){ tStart=st; tSweep=sw; hitIdx=idx; }
    const p1=pol(R,st), p2=pol(R,st+sw);
    paths+=`<path class="sec" data-i="${idx}" d="M${C},${C} L${p1[0].toFixed(1)},${p1[1].toFixed(1)} A${R},${R} 0 ${sw>180?1:0} 1 ${p2[0].toFixed(1)},${p2[1].toFixed(1)} Z" fill="${s.col}" stroke="#3a1f10" stroke-width="2" stroke-linejoin="round"/>`;
    const sz = sw>=40?58 : sw>=26?46 : sw>=16?32 : 0;
    if(sz){
      const l=pol(R*0.64, st+sw/2), src=wheelIconSrc(s.ev);
      icons += src
        ? `<image href="${src}" x="${(l[0]-sz/2).toFixed(1)}" y="${(l[1]-sz/2).toFixed(1)}" width="${sz}" height="${sz}" filter="url(#ol)" image-rendering="optimizeSpeed" style="image-rendering:pixelated"/>`
        : `<text x="${l[0].toFixed(1)}" y="${l[1].toFixed(1)}" font-size="${Math.round(sz*0.55)}" text-anchor="middle" dominant-baseline="central" filter="url(#ol)">${s.ev.ic}</text>`;
    } else if(s.ev.loss && sw>=3){
      const l=pol(R-14, st+sw/2);
      icons+=`<text x="${l[0].toFixed(1)}" y="${l[1].toFixed(1)}" font-size="9" font-weight="bold" fill="#ffd84a" text-anchor="middle" dominant-baseline="central">!</text>`;
    }
  });
  const rg=(id,a,b)=>`<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${C}" cy="${C}" r="${R}"><stop offset="0.15" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;
  const defs=`<defs>${rg('gG1','#c9f59a','#2f9a3a')}${rg('gG2','#e4f7a6','#5fae2c')}${rg('gR1','#ffb27a','#d8401a')}${rg('gR2','#ffd27a','#ee7a1e')}${rg('gL','#c0392b','#3e0800')}${rg('gS','#d2f0ff','#2a75bb')}
    <filter id="ol" x="-30%" y="-30%" width="160%" height="160%"><feMorphology in="SourceAlpha" operator="dilate" radius="1" result="d"/><feFlood flood-color="#fff"/><feComposite in2="d" operator="in" result="w"/>
      <feDropShadow in="w" dx="0" dy="1.5" stdDeviation="0.6" flood-color="#000" flood-opacity=".45" result="s"/><feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
  const mg=`<defs><linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbfbfb"/><stop offset=".35" stop-color="#9da3ab"/><stop offset=".55" stop-color="#eef0f2"/><stop offset=".8" stop-color="#7d838b"/><stop offset="1" stop-color="#d9dde1"/></linearGradient></defs>`;
  const BULB=['#fff6c8','#7fd4ff','#fff6c8','#ff8a7a'];
  let bulbs=""; for(let i=0;i<20;i++){ const p=pol(123,i*18-90); bulbs+=`<circle class="bulb b${i%2}" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.6" fill="${BULB[i%4]}" style="color:${BULB[i%4]}"/>`; }
  const where = G.gymIndex>=GYMS.length ? '<em>VICTORY ROAD</em>' : `ROTA → <em>${CITY[G.gymIndex].toUpperCase()}</em>`;
  scene(`<div class="ribbon plate"><span class="spk">✦</span><span class="pb-mini"></span>ROLETA · ${where}<span class="spk">✦</span></div>
    <div class="wheel-wrap" id="wwrap"><div class="wheel-ptr"></div>
      <svg class="wheel" id="wheel" viewBox="0 0 270 270" role="img" aria-label="Roleta da estrada girando">${defs}${paths}${icons}</svg>
      <svg class="wheel-rim" viewBox="0 0 270 270" aria-hidden="true">${mg}<circle cx="${C}" cy="${C}" r="123" fill="none" stroke="url(#metal)" stroke-width="22"/>
        <circle cx="${C}" cy="${C}" r="133.5" fill="none" stroke="#2b2b2b" stroke-width="3"/><circle cx="${C}" cy="${C}" r="112" fill="none" stroke="#2b2b2b" stroke-width="3"/>${bulbs}</svg>
      <div class="wheel-hub"><div class="hub-glow"></div><div class="pokeball"><i></i></div></div></div>
    <div class="legend"><span class="lg g">🍀 SORTE ${Math.round(gr*100)}%</span><span class="lg r">💀 PERIGO ${Math.round((1-gr)*100)}%</span></div>
    <div class="legend"><span class="lg k">❗ PERDA DE POKéMON (RARO)</span>${gone?`<span class="lg n">${gone} EVENTO${gone>1?'S':''} JÁ SAIU${gone>1?'RAM':''} DA RODA</span>`:''}</div>
    <div class="dialog" id="tw"></div>`, '', 'A roleta gira... o que a estrada reserva pra você?');
  const wheel=document.getElementById('wheel'), wrap=document.getElementById('wwrap');
  const land=tStart+tSweep*(0.25+Math.random()*0.5);
  const final=6*360+(((-90-land)%360)+360)%360;
  const hit=()=>{ wrap.classList.remove('spinning'); wrap.classList.add('landed'); const p=wheel.querySelector(`.sec[data-i="${hitIdx}"]`); if(p){ p.classList.add('hit'); wheel.appendChild(p); wheel.querySelectorAll('image,text').forEach(n=>wheel.appendChild(n)); } };
  const go=()=>{ if(tok===SPIN && G.phase==='roulette') applyPicked(picked); };
  if(REDUCE()){ wheel.style.transform=`rotate(${final%360}deg)`; hit(); setTimeout(go,700); return; }
  wheel.style.transition='none'; wheel.style.transform='rotate(0deg)';
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ wrap.classList.add('spinning'); wheel.style.transition='transform 4.2s cubic-bezier(.1,.7,.1,1)'; wheel.style.transform=`rotate(${final}deg)`; try{ SFX.spin(); spinTicks(wheel, starts, tok); }catch(e){} }));
  setTimeout(()=>{ if(tok===SPIN) hit(); }, 4250);
  setTimeout(go,5200);
}
/* "tec-tec" da roleta: um tique cada vez que uma divisória passa pelo ponteiro */
function spinTicks(wheel, starts, tok){
  if(typeof getComputedStyle!=='function' || starts.length<2) return;
  let last=null;
  const at=rot=>{ const a=((-90-rot-(-90))%360+360)%360; let i=0; starts.forEach((s,k)=>{ if(((s+90)%360+360)%360<=a) i=k; }); return i; };
  const step=()=>{
    if(tok!==SPIN || !wheel.isConnected || G.phase!=='roulette') return;
    const m=getComputedStyle(wheel).transform;
    if(m && m!=='none'){ const v=m.slice(m.indexOf('(')+1,-1).split(','); const rot=Math.atan2(+v[1],+v[0])*180/Math.PI; const i=at(rot); if(last!==null && i!==last) SFX.tick(); last=i; }
    if(wheel.parentNode && wheel.parentNode.classList.contains('spinning')) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function applyPicked(picked){
  G.pendingRoll=null;
  const nt=isNight(), before=snap(); G.day++; G.step++; markUsed(picked.ev);
  const res=picked.ev.fn(G);
  if(G.pendingRocketGameOver && G.team.length) G.team.pop();   // a Rocket leva o último parceiro
  if(picked.good) G.stats.eventsGood++; else G.stats.eventsBad++;
  decisionTick(picked.good, nt);
  const diff=diffOf(before);
  logAdd(picked.good?'good':'bad', picked.ev.ic, res.title);
  postProcess(diff);
  G.lastResult={kind:'event', lb:picked.ev.lb, good:picked.good, ic:picked.ev.ic, title:res.title, text:res.text, highlight:res.highlight, diff, before};
  G.phase='event'; render();
}
function doTrain(){
  const nt=isNight(), before=snap();
  G.team.forEach(m=>{ m.lv+=2; tryEvolveSilent(m); });
  G.step++; G.day++; decisionTick(false, nt);
  const diff=diffOf(before); postProcess(diff);
  G.lastResult={kind:'train', good:true, ic:'🏋️', title:'Treino puxado',
    text:`Um dia inteiro de treino na rota. <span class="reward">Todo o time subiu 2 níveis.</span>\nSeguro e previsível. A roleta rende mais na média, mas pode punir.`, highlight:strongestMon(), diff};
  G.phase='event'; render();
}
function doSearch(){
  const nt=isNight(), before=snap(), w=pickWild(), m=addMon(w.species, w.lv);
  G.step++; G.day++; decisionTick(false, nt);
  const diff=diffOf(before); postProcess(diff);
  G.lastResult={kind:'search', good:true, ic:'🔎', title:'Captura garantida!',
    text:`Você vasculha a grama alta com calma... um <b>${m.species}</b> selvagem (Lv ${m.lv}) aparece!\nA Poké Bola balança... uma... duas... três... <span class="reward">Capturado!</span>`, highlight:m, diff, before};
  G.phase='event'; render();
}
function swapPanel(nw){
  const np=monPower(nw);
  const rows=G.team.map((m,i)=>{
    const p=monPower(m), dlt=np-p;
    const cmp = dlt>0 ? `<i class="d d-up">${nw.species} +${dlt}</i>` : dlt<0 ? `<i class="d d-dn">${nw.species} ${dlt}</i>` : `<i class="d">igual</i>`;
    return `<div class="mon ${i===0?'lead':''}"><div class="sp">${front(m)}</div>
      <div><div class="m-name">${i===0?'<span class="star">★</span> ':''}${m.species}${m.shiny?' <span class="shiny">✨</span>':''}</div>
      <div class="m-sub">${typeTag(m.t)}<span class="m-lv">Lv${m.lv}</span>${i>0?cmp:''}</div>
      ${i>0?`<button class="rel yes" data-act="swapIn" data-arg="${i}">TROCAR POR ${nw.species.toUpperCase()}</button>`:'<span class="evo-lbl">seu inicial não sai do time</span>'}</div>
      <div class="m-pow">PODER<b>${p}</b></div></div>`;
  }).join("");
  return `<div class="swap-box"><div class="ribbon bad">TIME CHEIO!</div>
    <div class="swap-new"><div class="sp">${front(nw)}</div><div><div class="m-name">${nw.species}${nw.shiny?' <span class="shiny">✨</span>':''} quer entrar</div>
      <div class="m-sub">${typeTag(nw.t)}<span class="m-lv">Lv${nw.lv}</span><span class="m-lv">PODER ${np}</span></div></div></div>
    <div class="party-h">QUEM SAI PRA ELE ENTRAR?<small>Quem sair é solto na natureza. Escolher não gasta decisão.</small></div>
    <div class="party">${rows}</div>
    ${menu(btn('swapSkip',`DEIXAR ${nw.species.toUpperCase()} IR`,'Time fica igual, mas ganha +5 níveis pela experiência'))}</div>`;
}
function eventScreen(){
  const r=G.lastResult, over=G.pendingRocketGameOver, can=G.step>=STEPS_PER_GYM, nw=G.pendingSwap;
  const h = nw || (r.highlight && G.team.includes(r.highlight) ? r.highlight : null);
  const per = h && r.diff.per.get(h);
  /* o ícone do evento (ex.: o Weedle do "Veneno de Weedle") é o protagonista da cena; o Pokémon afetado
     aparece pequeno ao lado. Quando o evento te DÁ ou EVOLUI um Pokémon, ele é que fica grande. */
  const evSrc = r.lb ? wheelIconSrc({lb:r.lb}) : null, wk=r.lb && WHEEL_ICON[r.lb];
  const rewardIsMon = h && (nw || (per && (per.isNew || per.evo)) || (wk && wk.slice(2)===h.species));
  let spot;
  if(evSrc && !rewardIsMon){
    spot = `<div class="spot"><img class="${wk[0]==='T'?'ev-tr':''}" src="${evSrc}" alt="">${h?`<div class="spot-sub">${front(h)}</div>`:''}</div>`;
  } else spot = h ? `<div class="spot ${per&&per.evo?'evo':''} ${h.shiny?'shiny':''}">${front(h)}</div>` : `<div class="spot"><span class="emo">${r.ic}</span></div>`;
  let extra="";
  r.diff.evos.forEach(([a,b])=>{ if(a==='Ovo') extra+=`\n🥚 <span class="reward">O ovo chocou: é um ${b}!</span>`; else if(!r.text.includes(b)) extra+=`\n✨ <span class="reward">${a} evoluiu para ${b}!</span>`; });
  r.diff.caught.forEach(m=>{ if(m.shiny) extra+=`\n✨ <span class="reward">${m.species} é SHINY! Que sorte rara!</span>`; });
  if(r.diff.newDex && r.diff.newDex.length) extra+=`\n📕 <span class="reward">Novo na Pokédex: ${r.diff.newDex.join(', ')}!</span>`;
  if(nw) extra+=`\n<span class="bad">Mas seu time está cheio!</span> Escolha abaixo quem sai pra ${nw.species} entrar, ou deixe-o ir.`;
  if(r.swapNote) extra+=`\n${r.swapNote}`;
  const rib = r.kind==='train' ? ['info','🏋️ DIA DE TREINO'] : r.kind==='search' ? ['good','🔎 CAPTURA!'] : r.good ? ['good','★ SORTE NA ESTRADA ★'] : ['bad','⚠ PERIGO NA ESTRADA ⚠'];
  const next = over ? btn('gameover','💀 VER FIM DA CARREIRA','',{primary:true})
    : btn('back', can?'⚔️ IR PARA O DESAFIO':`${ico('bicycle')}CONTINUAR NA ESTRADA`, can?'Suas 3 decisões acabaram':`Decisões restantes: ${STEPS_PER_GYM-G.step}`, {primary:true});
  scene(`<div class="ribbon ${rib[0]}">${rib[1]}</div>${spot}<div class="ev-title">${r.title}</div>
    <div class="dialog" id="tw"></div>${nw ? swapPanel(nw) : menu(next)+partyHTML(r.diff)}`, 'event '+(r.good?'good':'bad'), r.text+extra);
}

/* ---------- batalha estilo GBA ---------- */
let BT=0;
function challenge(isElite){
  const foe = isElite ? ELITE[G.eliteIndex] : GYMS[G.gymIndex];
  const mult=bestMatchup(foe.t), mine=teamPower(), eff=Math.round(mine*mult);
  const ch = isElite ? eliteChance(eff,foe.power) : gymChance(eff,foe.power);
  G.battle={isElite, foe, mult, mine, eff, ch, win:Math.random()<ch};
  G.phase='battle'; render();
}
function setBar(el,pct){ if(!el) return; el.style.width=pct+'%'; el.style.background=pct>50?'#58D080':pct>20?'#F8D030':'#F05838'; }
function battleScreen(){
  const b=G.battle, f=b.foe, me=bestAttacker(f.t);
  const intro = b.isRed ? `...\nO Red quer batalhar!` : b.isElite ? (G.eliteIndex===ELITE.length-1 ? (RT.champBattle||`O CAMPEÃO, seu antigo Rival, quer batalhar!`) : `${f.leader}, da Elite Four, quer batalhar!`) : `${FEM(f)?'A Líder':'O Líder'} ${f.leader} quer batalhar!`;
  scene(`<div class="field">
      <div class="hpbox foe"><div class="hp-name"><span>${f.leader.toUpperCase()}</span>${typeTag(f.t)}</div><div class="hpbar"><span>PD</span><div class="track"><i id="hpF"></i></div></div><div class="hp-num">PODER ${f.power}</div></div>
      <div class="plat f"></div><div class="foe-av" id="avF">${leaderImg(f,'foe-tr')}</div>
      <div class="plat m"></div><div class="me-av" id="avM"><img class="back-img" src="${backSrc(me)}" alt="${me.species}"></div>
      <div class="hpbox me"><div class="hp-name"><span>${me.species.toUpperCase()}${me.shiny?' ✨':''}</span><span>Lv${me.lv}</span></div><div class="hpbar"><span>PD</span><div class="track"><i id="hpM"></i></div></div><div class="hp-num">PODER DO TIME ${b.eff}${b.mult!==1?` (×${b.mult})`:''}</div></div>
    </div><div class="dialog" id="tw"></div><div id="bmenu"></div>`, 'battle', `${intro}\nVai, ${me.species}!`);
  runBattle(me);
}
/* golpe-assinatura de cada tipo (nomes da dublagem brasileira) para as falas da batalha */
const TYPE_MOVE = {fire:"Lança-Chamas",water:"Surf",grass:"Folha Navalha",electric:"Choque do Trovão",normal:"Golpe Corpo",poison:"Bomba de Lodo",
  rock:"Deslizamento de Pedras",psychic:"Psíquico",ghost:"Bola Sombria",fighting:"Submissão",ground:"Terremoto",bug:"Tesoura X",flying:"Ataque de Asa",
  ice:"Raio de Gelo",dragon:"Fúria do Dragão",dark:"Triturar",steel:"Cauda de Ferro"};
function runBattle(me){
  const tok=++BT, b=G.battle, red=REDUCE(), pace=TXT_PACE[OPTS.txt]||1;
  const T=(ms,fn)=>setTimeout(()=>{ if(tok===BT && G.phase==='battle') fn(); }, red?0:Math.round(ms*pace));
  const avM=document.getElementById('avM'), say=t=>typewrite(document.getElementById('tw'), t);
  requestAnimationFrame(()=>requestAnimationFrame(()=>avM && avM.classList.add('enter')));
  const close=Math.min(b.eff,b.foe.power)/Math.max(b.eff,b.foe.power,1);
  const left=Math.round(Math.max(12, Math.min(85, 100-close*80)));
  const shake=id=>{ const el=document.getElementById(id); if(el){ el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); } };
  const myMult=typeMult(me.t, b.foe.t), foeMult=typeMult(b.foe.t, me.t);
  const eff=m=> m>1 ? ' É super eficaz!' : m<1 ? ' Não é muito eficaz...' : '';
  /* 1) seu golpe */
  T(1700,()=>{
    say(`${me.species} usou ${TYPE_MOVE[me.t]||'Investida'}!${eff(myMult)}`);
    setBar(document.getElementById('hpF'), b.win ? Math.max(30,left+10) : Math.min(90,left+25));
    shake('avF'); try{ SFX.hit(); }catch(e){}
  });
  /* 2) o contra-ataque */
  T(3300,()=>{
    say(`${b.foe.leader} contra-ataca com ${TYPE_MOVE[b.foe.t]||'Investida'}!${eff(foeMult)}`);
    setBar(document.getElementById('hpM'), b.win ? left : Math.max(8,left-30));
    shake('avM'); try{ SFX.hit(); }catch(e){}
  });
  /* 3) o golpe final */
  T(4900,()=>{
    say(b.win ? `${me.species} e o time atacam com tudo!` : `${b.foe.leader} não dá chance de reação!`);
    setBar(document.getElementById(b.win?'hpF':'hpM'), 0);
    shake(b.win?'avF':'avM'); try{ SFX.hit(); }catch(e){}
  });
  T(6300,()=>{
    try{ SFX.faint(); }catch(e){}
    const loser=document.getElementById(b.win?'avF':'avM'); if(loser){ loser.classList.remove('shake'); loser.classList.add('faint'); }
    say(b.win ? `${b.foe.leader} foi derrotad${FEM(b.foe)?'a':'o'}!\n<span class="reward">Vitória!</span>` : `${me.species} não aguentou...\n<span class="bad">Você perdeu para ${b.foe.leader}.</span>`);
  });
  T(7000,()=>{ const bm=document.getElementById('bmenu'); bm.innerHTML = menu(b.win ? btn('battleWin','CONTINUAR','',{primary:true}) : btn('gameover','💀 FIM DA CARREIRA','',{primary:true})); try{ fixPx(bm); }catch(e){} });
}
function applyWin(){
  const b=G.battle, before=snap();
  if(b.isRed){ G.silverDone=true; G.phase='legend'; render(); return; }
  if(b.isElite){
    G.eliteIndex++; G.stats.wins++;
    G.team.forEach(m=>{ m.lv+=1; tryEvolveSilent(m); });
    logAdd('gym', leaderImg(b.foe,'log-img'), `Venceu ${b.foe.leader} na Liga`);
  } else {
    const g=b.foe; G.gymIndex++; G.step=0; G.stats.wins++;
    G.team.forEach(m=>{ m.lv+=2; tryEvolveSilent(m); });
    logAdd('gym', badgeImg(g.n-1,'log-img'), `${BADGE_NAMES[g.n-1]}: venceu ${g.leader}`);
  }
  const diff=diffOf(before); postProcess(diff);
  G.lastWin={b, diff};
  G.phase = (b.isElite && G.eliteIndex>=ELITE.length) ? 'champion' : 'win';
  render();
}
function e4Strip(){
  return `<div class="e4-strip">${ELITE.map((e,i)=>`<div class="e4 ${i<G.eliteIndex?'beaten':''} ${i===G.eliteIndex?'now':''}"><span>${leaderImg(e)}</span><small>${i===ELITE.length-1?'CAMPEÃO':e.leader.toUpperCase()}</small></div>`).join("")}</div>`;
}
function winScreen(){
  const {b, diff}=G.lastWin;
  if(b.isElite){
    const nx=ELITE[G.eliteIndex];
    scene(`<div class="ribbon good">VITÓRIA NA LIGA!</div><div class="badge-pop tr">${leaderImg(b.foe)}</div><div class="ev-title">${b.foe.leader} derrotad${FEM(b.foe)?'a':'o'}!</div>
      <div class="reward-line">TIME +1 NÍVEL · SEM DESCANSO</div>${e4Strip()}<div class="dialog" id="tw"></div>
      ${menu(btn('elite',`➡️ ENFRENTAR ${nx.leader.toUpperCase()}`,'',{primary:true}))}${partyHTML(diff)}`, 'event good',
      `${b.foe.leader}: "Impressionante... mas o próximo não vai ser tão gentil."\nPróximo: ${nx.leader}, poder ${nx.power}.`);
    return;
  }
  const g=b.foe, done=G.gymIndex>=GYMS.length;
  scene(`<div class="ribbon gold">GINÁSIO DE ${CITY[g.n-1].toUpperCase()}: VITÓRIA!</div><div class="badge-pop">${badgeImg(g.n-1,'big')}</div>
    <div class="ev-title">${BADGE_NAMES[g.n-1].toUpperCase()}!</div><div class="reward-line">TIME INTEIRO +2 NÍVEIS · ${G.gymIndex}/8 INSÍGNIAS</div>
    <div class="dialog" id="tw"></div>
    ${menu(btn('back', done?'🛤️ SEGUIR PARA A VICTORY ROAD':`🗺️ SEGUIR PARA ${CITY[G.gymIndex].toUpperCase()}`, done?'A última estrada antes da Liga':`Próximo: ${GYMS[G.gymIndex].leader}`, {primary:true}))}
    ${partyHTML(diff)}`, 'event good', `${g.leader}: "${LEADER_LINES[g.n-1]}"\nVocê recebeu a ${BADGE_NAMES[g.n-1]}!`);
}
function eliteScreen(){
  const e=ELITE[G.eliteIndex], champ=G.eliteIndex===ELITE.length-1;
  scene(`<div class="ribbon ${champ?'gold':'info'}">${champ?'🏆 SALA DO CAMPEÃO':'🏛️ PLATÔ ÍNDIGO · ELITE FOUR'}</div>${e4Strip()}
    ${foeBlock(leaderImg(e), champ?'CAMPEÃO DA LIGA':`ELITE FOUR · ${G.eliteIndex+1}/4`, e.leader, `${typeTag(e.t)} Poder ${e.power}`, `${G.eliteIndex+1}<small>DE 5</small>`, e.power, e.t, 'elite')}
    ${partyStrip()}<div class="dialog" id="tw"></div>
    ${menu(btn('fight',`⚔️ ENFRENTAR ${e.leader.toUpperCase()}`,'Derrota aqui encerra a carreira',{primary:true}))}${partyHTML()}`, 'hubs',
    champ ? (RT.champIntro||'A última porta. Do outro lado, seu antigo Rival, agora Campeão, sorri.\n"Sabia que você viria."') : `${e.leader} te espera. Cinco batalhas seguidas, sem voltar para a estrada.`);
}

/* ---------- fim de carreira ---------- */
function trainerCard(won){
  const s=G.stats;
  const reached = won ? 'CAMPEÃO 👑' : G.gymIndex>=GYMS.length ? (G.vrDone?`Elite Four (${G.eliteIndex}/5)`:'Victory Road') : `Ginásio ${G.gymIndex+1}: ${GYMS[G.gymIndex].leader}`;
  const badges=GYMS.map((g,i)=>`<span class="hb ${i<G.gymIndex?'on':''}">${badgeImg(i)}</span>`).join("");
  const team=G.team.map(m=>front(m,'tc-img')).join("") || '<span>sem Pokémon</span>';
  return `<div class="tcard"><div class="tc-head"><span>CARTÃO DE TREINADOR</span><span>${(G.starter||'').toUpperCase()}</span></div>
    <div class="tc-badges">${badges}</div>
    <div class="tc-grid"><span>Chegou até</span><b>${reached}</b><span>Dias na estrada</span><b>${G.day}</b><span>Capturas</span><b>${s.caught}</b><span>Evoluções</span><b>${s.evolved}</b><span>Vitórias oficiais</span><b>${s.wins}</b><span>Sorte / perigo</span><b>${s.eventsGood} / ${s.eventsBad}</b><span>Roubados / fugiram / soltos</span><b>${s.stolen} / ${s.fled} / ${s.released||0}</b><span>Shinies</span><b>${s.shinies}</b></div>
    <div class="tc-team">${team}</div></div>`;
}
function logHTML(){
  if(!G.log.length) return "";
  return `<div class="log"><div class="log-h">📜 DIÁRIO DA CARREIRA</div>${G.log.map(l=>`<div class="log-row ${l.kind}"><span class="d">DIA ${l.day}</span><span>${l.ic}</span><span>${l.text}</span></div>`).join("")}</div>`;
}
function gameOverScreen(){
  if(!G.recorded){ G.recorded=true; G.newRecord=commitRecord(false); }
  const cause = G.pendingRocketGameOver ? 'A Equipe Rocket levou seu último Pokémon. Sem parceiros, não há jornada.'
    : (G.battle && G.battle.isRed) ? `O Red venceu sem dizer uma palavra. A lenda do Mt. Silver continua invicta, mas o seu título de Campeão ninguém tira.`
    : `Você perdeu para ${G.battle?G.battle.foe.leader:'o desafio'}. ${(RT&&RT.loseLine)||'Em Kanto não existe revanche oficial: a carreira termina aqui.'}`;
  scene(`<div class="over-title">${G.battle&&G.battle.isRed?'O RED VENCEU':'FIM DA CARREIRA'}</div>${G.newRecord?'<div class="newrec">★ NOVO RECORDE! ★</div>':''}
    <div class="dialog" id="tw"></div>${trainerCard(false)}${logHTML()}
    ${menu(btn('restart','🔁 COMEÇAR DO ZERO','Nova carreira, novo inicial',{primary:true}), shareBtn(), btn('dex','📕 VER POKéDEX'), btn('title','🏠 TELA INICIAL'))}`, 'over',
    cause+'\nToda lenda também já perdeu. Levante e tente de novo.');
}
function hofScreen(){
  if(!G.recorded){ G.recorded=true; G.newRecord=commitRecord(true); logAdd('gym','👑',`Tornou-se Campeão de ${RT.name}!`); }
  const slots=G.team.map(m=>`<div class="hof-slot">${front(m,'hof-img')}<div class="m-name" style="font-size:7px">${m.species}${m.shiny?' ✨':''}</div><div class="m-lv">Lv${m.lv}</div></div>`).join("");
  const conf=Array.from({length:24},(_,i)=>`<i class="conf" style="left:${(i*41)%100}%;background:${['#E3350D','#2A75BB','#FFCB05','#3BB54A'][i%4]};animation-delay:${(i%8)*0.35}s;pointer-events:none"></i>`).join("");
  const silverBtn = RT.silver && REGIONS[REGION].RED ? btn('silver','🏔️ SUBIR O MT. SILVER','Opcional: 3 decisões na montanha e o Red no topo',{primary:true}) : '';
  scene(`${conf}<div class="hof-title">HALL DA FAMA</div><div class="ribbon gold">CAMPEÃO DE ${RT.name.toUpperCase()}!</div>${G.newRecord?'<div class="newrec">★ NOVO RECORDE! ★</div>':''}
    <div class="hof-grid">${slots}</div><div class="dialog" id="tw"></div>${trainerCard(true)}${logHTML()}
    ${menu(silverBtn, btn('restart','🔁 NOVA CARREIRA','',{primary:!silverBtn}), shareBtn(), btn('dex','📕 VER POKéDEX'), btn('title','🏠 TELA INICIAL'))}`, 'hof',
    RT.hofLine||'Seu Rival estende a mão: "Me enganei sobre você. Kanto tem um novo Campeão."\nSeu time entra para o Hall da Fama!');
}

/* =====================================================================
   ROTEADOR + ENTRADA
   ===================================================================== */
const SCREENS={title, how, pick:pickScreen, hub, roulette:rouletteScreen, event:eventScreen, battle:battleScreen, win:winScreen, elite:eliteScreen, champion:hofScreen, gameover:gameOverScreen, dex:dexScreen, legend:legendScreen};
function render(){ (SCREENS[G.phase]||title)(); try{ window.scrollTo(0,0); }catch(e){} afterRender(); }
function act(id, arg){
  switch(id){
    case 'regPrev': lobbyGo(-1); G.confirmNew=false; break;
    case 'regNext': lobbyGo(1); G.confirmNew=false; break;
    case 'new':
      if(!REGIONS[LOBBY].ready) return;
      if(loadSave() && !G.confirmNew){ G.confirmNew=true; G.phase='title'; break; }
      clearSave(); G=newGame(); G.phase='pick'; break;
    case 'newNo': G.confirmNew=false; break;
    case 'continue': if(!resumeGame()) G=newGame(); break;
    case 'dex': G.phase='dex'; break;
    case 'dexBack': G=newGame(); break;
    case 'mute': SFX.toggle(); setMuteBtn(); return;
    case 'how': G.phase='how'; break;
    case 'title': G=newGame(); break;
    case 'restart': G=newGame(); G.phase='pick'; break;
    case 'choose': chooseStarter(arg); return;
    case 'roll': G.phase='roulette'; break;
    case 'train': doTrain(); return;
    case 'search': doSearch(); return;
    case 'back': G.phase='hub'; break;
    case 'challenge': challenge(false); return;
    case 'league': G.vrDone=true; G.step=0; logAdd('gym','🏛️','Chegou ao Platô Índigo'); G.phase='elite'; break;
    case 'fight': challenge(true); return;
    case 'silver': G.silver=true; G.step=0; G.phase='hub'; logAdd('gym','🏔️','Subiu o Mt. Silver'); break;
    case 'fightRed': challengeRed(); return;
    case 'battleWin': applyWin(); return;
    case 'elite': G.phase='elite'; break;
    case 'gameover': G.phase='gameover'; break;
    case 'release': G.releaseAsk=Number(arg); break;
    case 'releaseNo': G.releaseAsk=null; break;
    case 'releaseYes': {
      const m=releaseMon(Number(arg)); G.releaseAsk=null;
      if(m) logAdd('bad','👋',`Soltou ${m.species} (Lv ${m.lv}) na natureza`);
      break;
    }
    case 'swapIn': {
      const r=G.lastResult, s=swapIn(Number(arg));
      if(!s) return;
      if(s.in.shiny) G.stats.shinies++;
      logAdd('catch','🔄',`${s.in.species}${s.in.shiny?' ✨':''} (Lv ${s.in.lv}) entrou no lugar de ${s.out.species} (Lv ${s.out.lv})`);
      const isNewDex=dexRegister(s.in); if(isNewDex) logAdd('catch','📕',`Novo na Pokédex: ${s.in.species}`);
      r.diff=diffOf(r.before||new Map()); r.highlight=s.in;
      r.swapNote=`🔄 <span class="reward">${s.in.species} entrou no time!</span> ${s.out.species} foi solto na natureza.${isNewDex?`\n📕 <span class="reward">Novo na Pokédex: ${s.in.species}!</span>`:''}`;
      break;
    }
    case 'swapSkip': {
      const r=G.lastResult, nw=skipSwap(); if(nw) dexSeen(nw.species);
      if(nw){ r.diff=diffOf(r.before||new Map()); r.swapNote=`Você deixa ${nw.species} seguir livre, mas a tentativa de captura rendeu experiência: <span class="reward">+5 níveis no time</span>.`; r.highlight=null; logAdd('bad','🍃',`Deixou ${nw.species} (Lv ${nw.lv}) ir e o time ganhou +5 níveis`); }
      break;
    }
    case 'seeTeam': { const p=document.getElementById('party'); if(p && p.scrollIntoView) p.scrollIntoView({behavior:REDUCE()?'auto':'smooth', block:'start'}); return; }
    case 'optTheme': case 'optTxt': {
      OPTS[id==='optTheme'?'theme':'txt']=arg; saveOpts(); applyTheme();
      try{ document.querySelectorAll(`.seg[data-act="${id}"]`).forEach(b=>{ const on=b.dataset.arg===arg; b.classList.toggle('on',on); b.setAttribute('aria-pressed', on); }); }catch(e){}
      return;
    }
    case 'share': shareCareer(); return;
    case 'dexF': G.dexF=arg; break;
    case 'dexSel': dexShow(arg); return;
    default: return;
  }
  if(id!=='release' && id!=='releaseNo' && id!=='releaseYes') G.releaseAsk=null;
  render();
}
document.addEventListener('click', e=>{
  const b=e.target.closest && e.target.closest('[data-act]');
  if(b && !b.disabled){ try{ SFX.blip(); }catch(err){} act(b.dataset.act, b.dataset.arg); }
});
document.addEventListener('keydown', e=>{
  if(e.ctrlKey||e.metaKey||e.altKey) return;
  if(G && G.phase==='title' && (e.key==='ArrowLeft'||e.key==='ArrowRight')){ e.preventDefault(); act(e.key==='ArrowLeft'?'regPrev':'regNext'); return; }
  if(e.key>='1' && e.key<='6'){
    const list=[...$scene.querySelectorAll('.menu .btn:not(:disabled), .starters-pick .scard')];
    const b=list[Number(e.key)-1]; if(b){ e.preventDefault(); b.click(); }
  } else if((e.key==='Enter'||e.key===' ') && TW && document.activeElement===document.body){ e.preventDefault(); TW.finish(); }
});

