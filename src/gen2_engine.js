/* =====================================================================
   MOTOR GEN 2: ovos, amizade, hora do dia, Gyarados Vermelho, Mt. Silver/Red.
   Tudo é guiado pelos dados da região: em Kanto nada disso dispara.
   ===================================================================== */
const FR_MAX = 5;   // decisões (bons eventos contam em dobro) para a amizade evoluir
function monPower(m){ if(m.egg) return 0; const d=DEX[m.species]; return Math.round(d.base+(m.lv-5)*1.6); }

/* ---------- PODER = SOMA DO TIME INTEIRO ----------
   Cada Pokémon entra com o próprio poder × a vantagem de tipo DELE contra o líder
   (imunidade conta como ×0.5: ainda há golpes de cobertura). O líder também é a soma do time dele. */
function monEff(m, t){ if(m.egg) return 0; const v=typeMult(m.t, t); return monPower(m)*(v<0.5?0.5:v); }
function teamPower(){ return G.team.reduce((a,m)=>a+monPower(m), 0); }
function teamEff(t){ return Math.round(G.team.reduce((a,m)=>a+monEff(m,t), 0)); }
/* multiplicador médio do time contra o tipo (mantém o nome antigo: o resto do jogo usa poder × mult) */
function bestMatchup(t){ const p=teamPower(); return p ? Math.round(teamEff(t)/p*100)/100 : 1; }
/* quem mais contribui contra esse tipo: vai à frente na batalha */
function bestAttacker(t){ return G.team.filter(m=>!m.egg).sort((a,b)=>monEff(b,t)-monEff(a,t))[0] || G.team[0]; }
/* times dos líderes: os Pokémon dos jogos originais. Os níveis sobem ou descem juntos até a soma
   chegar no poder calibrado por simulação (o `power` do dado é o alvo; depois vira a soma real). */
function assignFoeTeams(foes, teams, dex){
  dex=dex||DEX;
  const pw=(s,lv)=>Math.round(dex[s].base+(lv-5)*1.6);   // mesma conta do monPower, com a Pokédex da região
  foes.forEach(f=>{
    let roster=teams[f.leader]; if(!roster) return;
    const target=f.power;
    /* 1º líder: se nem no Lv 5 o time cabe no poder-alvo, ele usa só os mais fortes (o Falkner fica só com o Pidgeotto) */
    while(roster.length>1 && roster.reduce((a,[s])=>a+pw(s,5),0)>target) roster=roster.slice(1);
    const base=roster.reduce((a,[s,lv])=>a+pw(s,lv), 0);
    const shift=Math.round((target-base)/(1.6*roster.length));
    f.roster=roster;
    f.team=roster.map(([s,lv])=>({species:s, lv:Math.max(5, lv+shift), t:dex[s].t}));
    f.power=f.team.reduce((a,m)=>a+pw(m.species,m.lv), 0);
  });
}
function foeAce(f){ return f.team && f.team.length ? f.team.slice().sort((a,b)=>monPower(b)-monPower(a))[0] : null; }
const TIME_IC = ["☀️","🌇","🌙"], TIME_PT = ["MANHÃ","TARDE","NOITE"];
function timeIdx(){ return Math.min(G.step, 2); }

/* chamado em toda decisão, depois do efeito e antes do antes/depois */
function decisionTick(good, night){
  G.team.forEach(m=>{
    if(m.egg){
      m.hatch=(m.hatch||1)-1;
      if(m.hatch<=0){
        const pool=m.pool||["Togepi"], sp=pool[Math.floor(Math.random()*pool.length)];
        const top=G.team.filter(x=>!x.egg).sort((a,b)=>b.lv-a.lv)[0];
        m.species=sp; m.t=DEX[sp].t; m.e=DEX[sp].e; m.egg=false; delete m.pool; delete m.hatch;
        m.lv=Math.max(5, Math.round((top?top.lv:10)*0.75)); m.shiny=Math.random()<1/20; m.hatched=true;
        G.stats.caught++;
      }
      return;
    }
    const d=DEX[m.species]; if(!d || !d.friend) return;
    m.fr=(m.fr||0)+1+(good?1:0);
    if(m.fr>=FR_MAX){
      let to=d.friend; if(to.includes("|")){ const p=to.split("|"); to=night?p[1]:p[0]; }
      if(DEX[to]){ m.species=to; m.t=DEX[to].t; m.e=DEX[to].e; m.fr=0; G.stats.evolved++; m.friendEvo=true; }
    }
  });
}

/* cena fixa do Lago da Fúria (Johto, a caminho do 7º ginásio) */
function redGyaradosDue(){ return !!(RT && RT.dayNight) && !G.silver && G.gymIndex===6 && !G.redGyarados; }
function redGyaradosScene(){
  G.redGyarados=true;
  const before=snap(), m=addMon("Gyarados",30); m.shiny=true;
  const diff=diffOf(before); postProcess(diff);
  G.lastResult={kind:"event", good:true, ic:"🐟", title:"O Gyarados Vermelho!", highlight:m, diff, before,
    text:`O sinal da Rocket forçou os Magikarp do Lago da Fúria a evoluir... e um deles ficou <b>vermelho</b>! Depois de uma batalha furiosa, <span class="reward">o Gyarados Vermelho (Lv ${m.lv}) ✨ entrou para o time!</span>\nEsta cena não gastou nenhuma decisão.`};
  logAdd("catch","🐟","Gyarados Vermelho no Lago da Fúria");
  G.phase="event"; render();
}

/* Mt. Silver e o Red (opcional, depois de ser campeão) */
function hubSilver(){
  const R=REGIONS[REGION].RED, can=G.step>=STEPS_PER_GYM;
  const tw = can ? "O topo do Mt. Silver. Um treinador de boné vermelho está parado na neve. Ele não diz nada."
                 : `Mt. Silver: a montanha mais perigosa do mundo. Faltam ${STEPS_PER_GYM-G.step} decisões até o topo.`;
  scene(`<div class="ribbon plate"><span class="spk">✦</span>🏔️ MT. SILVER<span class="spk">✦</span></div>
    ${foeBlock(leaderImg(R),"A LENDA DO MT. SILVER",R.leader,`${typeTag(R.t)} Poder ${R.power}`,"🧢<small>LENDA</small>", R.power, R.t, "elite", R)}
    ${pips()}${partyStrip()}<div class="dialog" id="tw"></div>
    ${can ? menu(btn("fightRed","⚔️ ENFRENTAR O RED","Perder não tira seu título de Campeão",{primary:true})) : decisionMenu()}
    ${partyHTML(null,{manage:true})}`, "hubs", tw);
}
function challengeRed(){
  const foe=REGIONS[REGION].RED, mult=bestMatchup(foe.t), mine=teamPower(), eff=Math.round(mine*mult);
  const ch=eliteChance(eff,foe.power);
  G.battle={isElite:true, isRed:true, foe, mult, mine, eff, ch, win:Math.random()<ch};
  G.phase="battle"; render();
}
function legendScreen(){
  if(!G.legendRecorded){ G.legendRecorded=true; const r=loadRec(); r.legends=(r.legends||0)+1; saveRec(r); logAdd("gym","🧢","Venceu o Red no Mt. Silver"); }
  const slots=G.team.map(m=>`<div class="hof-slot">${front(m,'hof-img')}<div class="m-name" style="font-size:7px">${m.species}${m.shiny?' ✨':''}</div><div class="m-lv">Lv${m.lv}</div></div>`).join("");
  scene(`<div class="hof-title">LENDA DE ${RT.name.toUpperCase()}</div><div class="ribbon gold">VOCÊ VENCEU O RED!</div>
    <div class="hof-grid">${slots}</div><div class="dialog" id="tw"></div>${trainerCard(true)}${logHTML()}
    ${menu(btn('restart','🔁 NOVA CARREIRA','',{primary:true}), shareBtn(), btn('dex','📕 VER POKéDEX'), btn('title','🏠 TELA INICIAL'))}`, 'hof',
    '...\nO Red abaixa o boné, sorri pela primeira vez e desaparece na neve.\nVocê é a nova lenda do Mt. Silver!');
}
