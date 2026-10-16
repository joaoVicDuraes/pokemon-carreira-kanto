// Testes headless de Hoenn (node src/test_hoenn.js) — carrega index.html + kanto_extra.js + johto.js + hoenn.js
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
let js=fs.readFileSync(path.join(ROOT,'index.html'),'utf8').split('<script>')[1].split('</script>')[0];
js=js.replace(/G=newGame\(\); render\(\);\s*$/,'');
function el(){return {className:'',innerHTML:'',style:{},dataset:{},classList:{add(){},remove(){},toggle(){},contains(){return false;}},appendChild(){},setAttribute(){},isConnected:false,querySelector:()=>el(),querySelectorAll:()=>[]};}
const store={};
const ctx={console,Math,JSON,Map,Set,Array,Object,String,Number,
  document:{getElementById:()=>el(),addEventListener(){},body:{dataset:{}},querySelector:()=>null,querySelectorAll:()=>[],createTreeWalker:()=>({nextNode:()=>null})},
  NodeFilter:{SHOW_TEXT:4},window:{matchMedia:()=>({matches:true}),scrollTo(){}},
  localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v;},removeItem:k=>{delete store[k];}},
  requestAnimationFrame:f=>f(),setTimeout:f=>{f();return 0;},clearInterval(){},setInterval:()=>0,clearTimeout(){}};
vm.createContext(ctx);
vm.runInContext(js,ctx);
for(const f of ['kanto_extra.js','johto.js','hoenn.js']) vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx);
const R=c=>vm.runInContext(c,ctx);
let fails=0;const ok=(c,msg)=>{if(!c){fails++;console.log('FALHOU:',msg);}};
const act=(a,b)=>ctx.act(a,b), mon=(s,l)=>ctx.mon(s,l);
const setG=g=>{ctx.__setG=g;R('G=__setG');};

ok(R('REGIONS.hoenn.ready') && !R('REGIONS.hoenn.soon'),'pacote Hoenn carregou');
ok(R('useRegion("hoenn")') && R('REGION')==='hoenn','useRegion hoenn');
ok(R('DEX_LIST.length')===386 && R('DEX_LIST[385][1]')==='Deoxys' && R('DEX_LIST[251][1]')==='Treecko','Pokédex de Hoenn 1..386');
ok(R('DEX_LIST.every(r=>DEX[r[1]])'),'toda espécie da lista existe no DEX');
ok(R('DEX_LIST.every(r=>SPRITES[r[1]]&&SHINY[r[1]]&&BACKS[r[1]])'),'sprites frente/shiny/costas dos 386');
ok(R('Object.keys(DEX).every(k=>!DEX[k].evo||DEX[DEX[k].evo])') && R('Object.keys(BRANCH).every(k=>BRANCH[k].every(x=>DEX[x]))'),'toda evolução aponta pra espécie existente');
ok(R('[...GYMS,...ELITE,REGIONS.hoenn.RED].every(f=>TRAINERS[trainerKey(f.leader)])'),'sprite de todo líder de Hoenn');
ok(R('TRAINERS[RT.profKey]'),'sprite do Prof. Birch');
ok(R('BADGES.length')===8 && R('BADGES.every(b=>/^data:image/.test(b))'),'8 insígnias de Hoenn');
ok(R('Object.values(WHEEL_ICON).every(k=>k[0]==="P"?SPRITES[k.slice(2)]:TRAINERS[k.slice(2)])'),'todo ícone da roleta tem sprite');
ok(R('GYM_EVENTS.length')===10,'8 ginásios + Victory Road + Meteor Falls');
ok(R('[...GYMS,...ELITE,REGIONS.hoenn.RED].every(f=>f.team&&f.team.length&&f.team.every(m=>DEX[m.species]))'),'times dos líderes com espécies válidas');
ok(R('REGIONS.johto.DEX_LIST.length')===251 && R('REGIONS.kanto.DEX_LIST.length')===151,'Johto e Kanto intactos');

// 1) todo evento roda
let ran=0;
R('GYM_EVENTS').forEach((set,gi)=>{[...set.green,...set.red].forEach(ev=>{
  for(const team of [()=>[mon('Mudkip',20)],()=>[mon('Torchic',30),mon('Feebas',28),mon('Clamperl',30),mon('Lombre',25),mon('Nincada',19)]]){
    const g=ctx.newGame();g.team=team();g.gymIndex=Math.min(gi,8);g.silver=gi===9;setG(g);
    try{const r=ev.fn(g);ran++;ok(r&&r.title&&r.text,'resultado vazio: '+ev.lb);}catch(e){fails++;console.log('ERRO',gi+1,ev.lb,e.message);}
  }});});
console.log('eventos de Hoenn executados:',ran);

// 2) alcance: toda espécie dos 386 pode ser obtida
{const src=R('GYM_EVENTS').flatMap(s=>[...s.green,...s.red]).map(e=>e.fn.toString()).join(' ')+' '+R('H_BABIES.join(" ")')+' Latias Latios Shedinja Gyarados';
 const got=new Set([...R('WILD_POOL'),...R('STARTERS')]);
 R('DEX_LIST').forEach(([n,s])=>{ if(src.includes('"'+s+'"')||src.includes(' '+s+' ')||src.endsWith(' '+s)) got.add(s); });
 let grew=true; while(grew){grew=false; for(const s of [...got]){ const d=R(`DEX[${JSON.stringify(s)}]`); const outs=[].concat(d.evo||[], R(`BRANCH[${JSON.stringify(s)}]||[]`), d.friend?d.friend.split('|'):[]); outs.forEach(o=>{ if(!got.has(o)){got.add(o);grew=true;} }); } }
 const miss=R('DEX_LIST').map(r=>r[1]).filter(s=>!got.has(s));
 ok(miss.length===0,'espécies impossíveis de obter: '+miss.join(', '));
 const gen3=R('WILD_POOL').filter(s=>R(`DEX_LIST.find(r=>r[1]===${JSON.stringify(s)})[0]`)>251).length;
 ok(gen3/R('WILD_POOL.length')>0.5,'na grama de Hoenn a maioria é da Gen 3');}

// 3) mecânicas da Gen 3
{let g=ctx.newGame();setG(g);g.team=[mon('Mudkip',20),mon('Nincada',19)];
 g.team[1].lv=20; R('tryEvolveSilent(G.team[1])');
 ok(g.team[1].species==='Ninjask' && g.team.some(m=>m.species==='Shedinja'),'Nincada vira Ninjask e deixa Shedinja');
 g=ctx.newGame();setG(g);g.team=[mon('Mudkip',20),mon('Feebas',20)];R('stoneEvent()');
 ok(g.team[1].species==='Milotic','Feebas + Pokéblocos = Milotic');
 g=ctx.newGame();setG(g);g.team=[mon('Mudkip',20),mon('Wurmple',6)];g.team[1].lv=7;R('tryEvolveSilent(G.team[1])');
 ok(['Silcoon','Cascoon','Beautifly','Dustox'].includes(g.team[1].species),'Wurmple evolui por um dos dois caminhos: '+g.team[1].species);
 g=ctx.newGame();setG(g);g.team=[mon('Mudkip',20),mon('Azurill',10)];for(let i=0;i<5;i++)R('decisionTick(false,false)');
 ok(g.team[1].species==='Marill','amizade: Azurill -> Marill');
 g=ctx.newGame();setG(g);g.team=[mon('Mudkip',30)];g.gymIndex=5;
 ok(!R('wheelSectors()').some(s=>s.ev.lb==='Dragão errante'),'Latias/Latios só depois do 6º ginásio');
 g.gymIndex=6; ok(R('wheelSectors()').some(s=>s.ev.lb==='Dragão errante'),'Latias/Latios aparecem no 7º ginásio');
 for(let i=0;i<6;i++) R('hRoamEvent()');
 ok(['Latias','Latios'].every(s=>g.team.some(m=>m.species===s)),'3 avistamentos capturam Latias e Latios');
 ok(!R('redGyaradosDue()'),'Gyarados Vermelho é só de Johto');
 ok(R('POST().place')==='Meteor Falls' && R('REGIONS.hoenn.RED.leader')==='Steven','desafio pós-Liga: Steven no Meteor Falls');
 ok(R('PLURAL(GYMS[6])') && R('DONE(GYMS[6])')==='os','Tate & Liza no plural');
 R('useRegion("johto")'); ok(R('POST().place')==='Mt. Silver' && R('redGyaradosDue')!==undefined,'Johto continua com Mt. Silver'); R('useRegion("hoenn")');}

// 4) carreiras completas em Hoenn (com Meteor Falls)
const POL={roleta:()=>'roll',esperto:()=>{const G=R('G');if(G.team.filter(m=>!m.egg).length<4)return 'search';return R('greenRatio()')>=0.5?'roll':'train';}};
for(const pol of Object.keys(POL)){
  const dead={};const N=2500;let liga=0,champ=0,legend=0,err=0,eggs=0,shed=0;const seen=new Set();
  for(let i=0;i<N;i++){try{
    R('clearSave()'); R('G=newGame()'); act('new'); act('choose',['Treecko','Torchic','Mudkip'][i%3]);
    for(let s=0;s<700;s++){const G=R('G'),p=G.phase;G.team.forEach(m=>{seen.add(m.species);if(m.hatched)eggs++;if(m.species==='Shedinja')shed++;});
      if(p==='gameover'){if(G.gymIndex>=8)liga++; if(G.silver)champ++; const k=G.silver?'Steven':G.gymIndex>=8?'E4-'+G.eliteIndex:'G'+(G.gymIndex+1); dead[k]=(dead[k]||0)+1; break;}
      if(p==='legend'){liga++;champ++;legend++;break;}
      if(p==='champion'){act('silver');continue;}
      if(p==='hub'){if(G.step>=3)act(G.silver?'fightRed':G.gymIndex>=8?'league':'challenge');else{let a=POL[pol]();if(a==='search'&&G.team.length>=6)a='roll';act(a);}}
      else if(p==='event'){
        if(G.pendingSwap){const nw=G.pendingSwap;let wi=-1,wp=1e9;G.team.forEach((m,k)=>{if(k>0&&ctx.monPower(m)<wp&&!m.egg){wp=ctx.monPower(m);wi=k;}});
          if(wi>0&&(nw.egg||ctx.monPower(nw)>wp))act('swapIn',String(wi));else act('swapSkip');}
        act(G.pendingRocketGameOver?'gameover':'back');}
      else if(p==='battle')act(G.battle.win?'battleWin':'gameover');
      else if(p==='win')act(G.battle.isElite?'elite':'back');
      else if(p==='elite')act('fight');}
  }catch(e){err++;if(err<3)console.log('ERRO carreira',e.stack.split('\n').slice(0,3).join(' | '));}}
  ok(err===0,'erros em carreiras: '+err);
  console.log(pol.padEnd(8),'| Liga',(liga/N*100).toFixed(1)+'%','| campeão',(champ/N*100).toFixed(1)+'%','| venceu o Steven',(legend/N*100).toFixed(1)+'%','| espécies',seen.size,'/ 386','| ovos',eggs>0,'| Shedinja',shed>0); console.log('   mortes:',JSON.stringify(dead));
}
console.log(fails?`${fails} FALHA(S)`:'TUDO OK');
process.exit(fails?1:0);
