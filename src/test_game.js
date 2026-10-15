// Testes headless do jogo (node src/test_game.js)
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
let js=html.split('<script>')[1].split('</script>')[0];
js=js.replace(/G=newGame\(\); render\(\);\s*$/,'')+'\nthis.__x={get G(){return G;},set G(v){G=v;},greenRatio,GYM_EVENTS,DEX,WILD_POOL};';
function el(){return {className:'',innerHTML:'',style:{},dataset:{},classList:{add(){},remove(){}},appendChild(){},querySelector:()=>el(),querySelectorAll:()=>[]};}
const store={};
const ctx={console,Math,JSON,Map,Set,Array,Object,String,Number,
  document:{getElementById:()=>el(),addEventListener(){},body:{},createTreeWalker:()=>({nextNode:()=>null})},
  NodeFilter:{SHOW_TEXT:4},window:{matchMedia:()=>({matches:true}),scrollTo(){}},
  localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v;}},
  requestAnimationFrame:f=>f(),setTimeout:f=>{f();return 0;},clearInterval(){},setInterval:()=>0};
vm.createContext(ctx);vm.runInContext(js,ctx);
const X=ctx.__x,act=ctx.act,mon=ctx.mon;
let fails=0;const ok=(c,msg)=>{if(!c){fails++;console.log('FALHOU:',msg);}};

// 1) todo evento de toda roleta roda sem erro
let ran=0;
X.GYM_EVENTS.forEach((set,gi)=>{
  ok(set.green.some(e=>e.lb==='Pedra evolutiva'),'pedra evolutiva ausente no ginásio '+(gi+1));
  [...set.green,...set.red].forEach(ev=>{
    for(const team of [[mon('Charmander',20)],[mon('Charmander',20),mon('Pikachu',18),mon('Eevee',18),mon('Kadabra',22)]]){
      const g=ctx.newGame();g.team=team.map(m=>Object.assign({},m));g.gymIndex=gi;X.G=g;
      try{const r=ev.fn(g);ran++;ok(r&&r.title&&r.text,'resultado vazio: '+ev.lb);}catch(e){fails++;console.log('ERRO',gi+1,ev.lb,e.message);}
    }
  });
});
console.log('eventos executados:',ran);

// 2) pedra: Eevee escolhe a melhor forma contra o próximo líder; troca evolui Kadabra
{const g=ctx.newGame();g.gymIndex=6;g.team=[mon('Eevee',30)];X.G=g;ctx.stoneEvent();ok(g.team[0].species==='Vaporeon','Eevee vs Blaine (fogo) devia virar Vaporeon, virou '+g.team[0].species);}
{const g=ctx.newGame();g.gymIndex=1;g.team=[mon('Eevee',30)];X.G=g;ctx.stoneEvent();ok(['Jolteon'].includes(g.team[0].species),'Eevee vs Misty (água) devia virar Jolteon, virou '+g.team[0].species);}
{const g=ctx.newGame();g.team=[mon('Kadabra',30)];X.G=g;ctx.stoneEvent();ok(g.team[0].species==='Alakazam','Kadabra por troca');}
{const g=ctx.newGame();g.team=[mon('Squirtle',10)];X.G=g;const b=g.team[0].lv;ctx.stoneEvent();ok(g.team[0].lv===b+5,'fallback sem candidato devia dar +5');}

// 3) soltar: pede confirmação, não gasta decisão, inicial protegido
{X.G=ctx.newGame();act('new');act('choose','Bulbasaur');const G=X.G;G.team.push(mon('Magikarp',5),mon('Magikarp',5));G.step=1;
 act('release','1');ok(G.team.length===3&&G.releaseAsk===1,'release deve só pedir confirmação');
 act('releaseNo');ok(G.team.length===3&&G.releaseAsk==null,'cancelar não solta');
 act('release','2');act('releaseYes','2');ok(G.team.length===2&&G.step===1,'soltar remove 1 e não gasta decisão');
 act('releaseYes','0');ok(G.team[0].species==='Bulbasaur','inicial não pode ser solto');
 ok(G.log.some(l=>l.text.startsWith('Soltou')),'soltar vai pro diário');}

// 3b) troca com time cheio
{X.G=ctx.newGame();act('new');act('choose','Charmander');const G=X.G;
 for(let i=0;i<5;i++)G.team.push(mon('Magikarp',5));
 const step0=G.step; act('search');
 ok(G.team.length===6 && G.pendingSwap,'time cheio deve gerar troca pendente');
 ok(G.step===step0+1,'procurar com time cheio gasta 1 decisão (como sempre)');
 const nw=G.pendingSwap; act('swapIn','0'); ok(G.pendingSwap===nw && G.team[0].species==='Charmander','inicial não pode ser trocado');
 act('swapIn','3'); ok(G.team[3]===nw && !G.pendingSwap && G.team.length===6,'troca coloca o novo no lugar escolhido');
 ok(G.log.some(l=>l.text.includes('entrou no lugar de Magikarp')),'troca vai pro diário');
 act('search'); ok(G.pendingSwap,'segunda captura também oferece troca');
 const lvB=G.team[0].lv; act('swapSkip'); ok(!G.pendingSwap && G.team.length===6 && G.team[0].lv===lvB+5,'deixar ir mantém o time e dá +5 níveis');
 const g=ctx.newGame();g.gymIndex=7;g.team=[mon('Charmander',40),...Array.from({length:5},()=>mon('Magikarp',5))];X.G=g;
 ctx.legendEvent(); ok(g.pendingSwap && ['Moltres','Mewtwo','Mew'].includes(g.pendingSwap.species),'lendário com time cheio vira troca, não some');}

// 3c) roleta sem repetição no mesmo ginásio: fatias somam 1, sorte/perigo e perda rara preservadas
for(let gi=0;gi<=8;gi++){
  const g=ctx.newGame();g.gymIndex=gi;g.team=[mon('Charmander',20)];X.G=g;
  const sum=s=>s.reduce((a,x)=>a+x.frac,0), lossOf=s=>sum(s.filter(x=>x.ev.loss)), greenOf=s=>sum(s.filter(x=>x.good));
  const base=ctx.wheelSectors(), gr=X.greenRatio(), loss0=lossOf(base);
  for(let k=0;k<500;k++){                       // 500 sequências de 3 giros
    g.used=null; const seen=[];
    for(let t=0;t<3;t++){
      const p=ctx.rollGymEvent(); ok(!seen.includes(p.ev.lb),`ginásio ${gi+1}: "${p.ev.lb}" repetiu`); seen.push(p.ev.lb); ctx.markUsed(p.ev);
      const s=ctx.wheelSectors();
      const both=s.some(x=>x.good)&&s.some(x=>!x.good&&!x.ev.loss);   // ainda há verde e vermelho "leve"
      if(Math.abs(sum(s)-1)>1e-9 || (both && Math.abs(greenOf(s)-gr)>1e-9)) { ok(false,`ginásio ${gi+1}: proporções quebradas`); break; }
      if(lossOf(s)>loss0+1e-9 && s.some(x=>!x.ev.loss)) { ok(false,`ginásio ${gi+1}: perda de Pokémon ficou mais provável (${lossOf(s).toFixed(3)} > ${loss0.toFixed(3)})`); break; }
    }
  }
  if(gi<8){ g.gymIndex=gi+1; ok(ctx.usedLabels().length===0,'lista de eventos usados deve zerar no próximo ginásio'); }
}

// 4) carreiras completas
const POL={roleta:()=> 'roll',esperto:()=>{const G=X.G;if(G.team.length<4)return 'search';return X.greenRatio()>=0.5?'roll':'train';}};
for(const pol of Object.keys(POL)){
  const N=3000;let liga=0,champ=0,err=0;const seen=new Set();
  for(let i=0;i<N;i++){try{
    X.G=ctx.newGame();act('new');act('choose',['Bulbasaur','Charmander','Squirtle'][i%3]);
    for(let s=0;s<500;s++){const G=X.G,p=G.phase;G.team.forEach(m=>seen.add(m.species));
      if(p==='gameover'){if(G.gymIndex>=8)liga++;break;} if(p==='champion'){liga++;champ++;break;}
      if(p==='hub'){if(G.step>=3)act(G.gymIndex>=8?'league':'challenge');else{let a=POL[pol]();if(a==='search'&&G.team.length>=6)a='roll';act(a);}}
      else if(p==='event'){
        if(G.pendingSwap){const nw=G.pendingSwap;let wi=-1,wp=1e9;G.team.forEach((m,i)=>{if(i>0&&ctx.monPower(m)<wp){wp=ctx.monPower(m);wi=i;}});
          const third=G.team.map(ctx.monPower).sort((a,b)=>b-a)[2]||0;
          if(wi>0&&ctx.monPower(nw)>third)act('swapIn',String(wi));else act('swapSkip');
          ok(!G.pendingSwap,'troca pendente não resolvida');}
        act(G.pendingRocketGameOver?'gameover':'back');}
      else if(p==='battle')act(G.battle.win?'battleWin':'gameover');
      else if(p==='win')act(G.battle.isElite?'elite':'back');
      else if(p==='elite')act('fight');}
  }catch(e){err++;if(err<3)console.log('ERRO carreira',e.message);}}
  ok(err===0,'erros em carreiras: '+err);
  console.log(pol.padEnd(8),'| chegou na Liga',(liga/N*100).toFixed(1)+'%','| campeão',(champ/N*100).toFixed(1)+'%','| espécies vistas',seen.size,'/ 151');
}
console.log(fails?`${fails} FALHA(S)`:'TUDO OK');
process.exit(fails?1:0);
