// Testes headless de Johto (node src/test_johto.js) — carrega index.html + johto.js no mesmo contexto
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
let js=fs.readFileSync(path.join(ROOT,'index.html'),'utf8').split('<script>')[1].split('</script>')[0];
js=js.replace(/G=newGame\(\); render\(\);\s*$/,'');
function el(){return {className:'',innerHTML:'',style:{},dataset:{},classList:{add(){},remove(){},toggle(){},contains(){return false;}},appendChild(){},setAttribute(){},isConnected:false,querySelector:()=>el(),querySelectorAll:()=>[]};}
const store={};
const ctx={console,Math,JSON,Map,Set,Array,Object,String,Number,
  document:{getElementById:()=>el(),addEventListener(){},body:{dataset:{}},querySelector:()=>null,createTreeWalker:()=>({nextNode:()=>null})},
  NodeFilter:{SHOW_TEXT:4},window:{matchMedia:()=>({matches:true}),scrollTo(){}},
  localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v;},removeItem:k=>{delete store[k];}},
  requestAnimationFrame:f=>f(),setTimeout:f=>{f();return 0;},clearInterval(){},setInterval:()=>0};
vm.createContext(ctx);
vm.runInContext(js,ctx); vm.runInContext(fs.readFileSync(path.join(ROOT,'johto.js'),'utf8'),ctx);
const R=c=>vm.runInContext(c,ctx);
let fails=0;const ok=(c,msg)=>{if(!c){fails++;console.log('FALHOU:',msg);}};
const act=(a,b)=>ctx.act(a,b), mon=(s,l)=>ctx.mon(s,l);

ok(R('REGIONS.johto.ready'),'pacote Johto carregou');
ok(R('useRegion("johto")') && R('REGION')==='johto','useRegion johto');
ok(R('DEX_LIST.length')===251 && R('DEX_LIST[250][1]')==='Celebi','Pokédex de Johto 1..251');
ok(R('DEX_LIST.every(r=>DEX[r[1]])'),'toda espécie da lista existe no DEX');
ok(R('DEX_LIST.every(r=>SPRITES[r[1]]&&SHINY[r[1]]&&BACKS[r[1]])'),'sprites frente/shiny/costas dos 251');
ok(R('Object.keys(DEX).every(k=>!DEX[k].evo||DEX[DEX[k].evo])'),'toda evolução aponta pra espécie existente');
ok(R('[...GYMS,...ELITE,REGIONS.johto.RED].every(f=>TRAINERS[trainerKey(f.leader)])'),'sprite HGSS de todo líder');
ok(R('typeMult("fighting","dark")')===2 && R('typeMult("psychic","dark")')===0 && R('typeMult("fire","steel")')===2 && R('typeMult("bug","poison")')===0.5,'tabela de tipos Gen 2');
ok(R('GYM_EVENTS.length')===10,'8 ginásios + Victory Road + Mt. Silver');
ok(R('REGIONS.kanto.DEX_LIST.length')===151 && R('REGIONS.kanto.DEX.Golbat.friend')===undefined,'Kanto intacto');

// 1) todo evento roda
let ran=0;
R('GYM_EVENTS').forEach((set,gi)=>{[...set.green,...set.red].forEach(ev=>{
  for(const team of [()=>[mon('Cyndaquil',20)],()=>[mon('Totodile',30),mon('Onix',28),mon('Seadra',30),mon('Porygon',25),mon('Eevee',20)]]){
    const g=ctx.newGame();g.team=team();g.gymIndex=Math.min(gi,8);g.silver=gi===9;g.roamFree=true;R('G=null');ctx.__setG=g;R('G=__setG');
    try{const r=ev.fn(g);ran++;ok(r&&r.title&&r.text,'resultado vazio: '+ev.lb);}catch(e){fails++;console.log('ERRO',gi+1,ev.lb,e.message);}
  }});});
console.log('eventos de Johto executados:',ran);

// 2) alcance: toda espécie de Johto pode ser obtida
{const src=R('GYM_EVENTS').flatMap(s=>[...s.green,...s.red]).map(e=>e.fn.toString()).join(' ')+' '+R('J_BABIES.join(" ")')+' Gyarados Raikou Entei Suicune';
 const got=new Set([...R('WILD_POOL'),...R('STARTERS')]);
 R('DEX_LIST').forEach(([n,s])=>{ if(src.includes('"'+s+'"')||src.includes(' '+s+' ')||src.endsWith(' '+s)) got.add(s); });
 let grew=true; while(grew){grew=false; for(const s of [...got]){ const d=R(`DEX[${JSON.stringify(s)}]`); const outs=[].concat(d.evo||[], R(`BRANCH[${JSON.stringify(s)}]||[]`), d.friend?d.friend.split('|'):[]); outs.forEach(o=>{ if(!got.has(o)){got.add(o);grew=true;} }); } }
 const miss=R('DEX_LIST').map(r=>r[1]).filter(s=>!got.has(s));
 ok(miss.length===0,'espécies impossíveis de obter: '+miss.join(', '));}

// 3) mecânicas
{const g=ctx.newGame();ctx.__setG=g;R('G=__setG');g.team=[mon('Chikorita',20)];R('giveEgg(["Togepi"])');
 ok(g.team[1].egg && R('monPower(G.team[1])')===0,'ovo entra com poder 0');
 for(let i=0;i<3;i++) R('decisionTick(false,false)');
 ok(!g.team[1].egg && g.team[1].species==='Togepi' && g.team[1].lv>5,'ovo choca em 3 decisões');
 g.team.push(mon('Golbat',30)); for(let i=0;i<5;i++) R('decisionTick(false,false)');
 ok(g.team[2].species==='Crobat','amizade: Golbat -> Crobat');
 ok(g.team[1].species==='Togetic','amizade: Togepi -> Togetic');
 g.team.push(mon('Eevee',20)); for(let i=0;i<3;i++) R('decisionTick(true,true)');
 ok(g.team[3].species==='Umbreon','Eevee + amizade à noite = Umbreon');
 g.gymIndex=1; g.step=0; let lbs=R('wheelSectors().map(s=>s.ev.lb)'); ok(!lbs.includes('Wooper na Union Cave'),'evento 🌙 fora da roda de manhã');
 g.step=2; lbs=R('wheelSectors().map(s=>s.ev.lb)'); ok(lbs.includes('Wooper na Union Cave'),'evento 🌙 entra à noite');
 g.gymIndex=3; ok(!R('wheelSectors()').some(s=>s.ev.lb==='Cão lendário'),'cães só depois do 4º ginásio');
 g.gymIndex=4; ok(R('wheelSectors()').some(s=>s.ev.lb==='Cão lendário'),'cães aparecem no 5º ginásio');
 g.team=[mon('Totodile',40)]; for(let i=0;i<9;i++) R('roamEvent()');
 ok(['Raikou','Entei','Suicune'].every(s=>g.team.some(m=>m.species===s)),'3 avistamentos capturam cada cão');
 ok(!R('wheelSectors()').some(s=>s.ev.lb==='Cão lendário'),'sem cães livres, a fatia some');
 const g2=ctx.newGame();ctx.__setG=g2;R('G=__setG');g2.team=[mon('Totodile',35)];g2.gymIndex=6;g2.phase='hub';R('render()');
 ok(g2.phase==='event' && g2.redGyarados && g2.team.some(m=>m.species==='Gyarados'&&m.shiny),'Gyarados Vermelho garantido no 7º ginásio');
 ok(g2.step===0,'cena do Gyarados não gasta decisão');
 act('back'); ok(g2.phase==='hub','depois da cena volta pro hub');}

// 4) carreiras completas em Johto (com Mt. Silver)
const POL={roleta:()=>'roll',esperto:()=>{const G=R('G');if(G.team.filter(m=>!m.egg).length<4)return 'search';return R('greenRatio()')>=0.5?'roll':'train';}};
for(const pol of Object.keys(POL)){
  const dead={};const N=2500;let liga=0,champ=0,legend=0,err=0,eggs=0,fr=0;const seen=new Set();
  for(let i=0;i<N;i++){try{
    R('clearSave()'); R('G=newGame()'); act('new'); act('choose',['Chikorita','Cyndaquil','Totodile'][i%3]);
    for(let s=0;s<700;s++){const G=R('G'),p=G.phase;G.team.forEach(m=>{seen.add(m.species);if(m.hatched)eggs++;if(m.friendEvo)fr++;});
      if(p==='gameover'){if(G.gymIndex>=8)liga++; if(G.silver)champ++; const k=G.silver?'Red':G.gymIndex>=8?'E4-'+G.eliteIndex:'G'+(G.gymIndex+1); dead[k]=(dead[k]||0)+1; break;}
      if(p==='legend'){liga++;champ++;legend++;break;}
      if(p==='champion'){act('silver');continue;}
      if(p==='hub'){if(G.step>=3)act(G.silver?'fightRed':G.gymIndex>=8?'league':'challenge');else{let a=POL[pol]();if(a==='search'&&G.team.length>=6)a='roll';act(a);}}
      else if(p==='event'){
        if(G.pendingSwap){const nw=G.pendingSwap;let wi=-1,wp=1e9;G.team.forEach((m,k)=>{if(k>0&&ctx.monPower(m)<wp&&!m.egg){wp=ctx.monPower(m);wi=k;}});
          const third=G.team.map(ctx.monPower).sort((a,b)=>b-a)[2]||0;
          if(wi>0&&(nw.egg||ctx.monPower(nw)>third))act('swapIn',String(wi));else act('swapSkip');}
        act(G.pendingRocketGameOver?'gameover':'back');}
      else if(p==='battle')act(G.battle.win?'battleWin':'gameover');
      else if(p==='win')act(G.battle.isElite?'elite':'back');
      else if(p==='elite')act('fight');}
  }catch(e){err++;if(err<3)console.log('ERRO carreira',e.stack.split('\n').slice(0,3).join(' | '));}}
  ok(err===0,'erros em carreiras: '+err);
  console.log(pol.padEnd(8),'| Liga',(liga/N*100).toFixed(1)+'%','| campeão',(champ/N*100).toFixed(1)+'%','| venceu o Red',(legend/N*100).toFixed(1)+'%','| espécies',seen.size,'/ 251','| ovos chocados',eggs>0,'| amizade',fr>0); console.log('   mortes:',JSON.stringify(dead));
}
console.log(fails?`${fails} FALHA(S)`:'TUDO OK');
process.exit(fails?1:0);
