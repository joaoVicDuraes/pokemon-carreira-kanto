// Testes de conquistas, coleção de shinies e ranking global (node src/test_meta.js)
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
let js=html.split('<script>')[1].split('</script>')[0];
js=js.replace(/G=newGame\(\); render\(\);\s*$/,'')+'\nthis.__x={get G(){return G;},set G(v){G=v;},get ACH(){return ACH;},get SHLOG(){return SHLOG;},ACHS};';
function el(){return {className:'',innerHTML:'',style:{},dataset:{},classList:{add(){},remove(){}},appendChild(){},setAttribute(){},isConnected:false,querySelector:()=>el(),querySelectorAll:()=>[]};}
const store={};
let toasts=[];
const ctx={console,Math,JSON,Map,Set,Array,Object,String,Number,Date,Uint8Array,
  document:{getElementById:id=>{ const e=el(); if(id==='toast'){ Object.defineProperty(e,'textContent',{set(v){toasts.push(v);}}); } return e; },
    addEventListener(){},body:{appendChild(){}},head:{appendChild(){}},createElement:()=>el(),querySelector:()=>null,querySelectorAll:()=>[],createTreeWalker:()=>({nextNode:()=>null})},
  NodeFilter:{SHOW_TEXT:4},window:{matchMedia:()=>({matches:true}),scrollTo(){}},
  localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v;},removeItem:k=>{delete store[k];}},
  requestAnimationFrame:f=>f(),setTimeout:()=>0,clearTimeout(){},clearInterval(){},setInterval:()=>0};
vm.createContext(ctx);vm.runInContext(js,ctx);
const X=ctx.__x,mon=ctx.mon;
let fails=0;const ok=(c,msg)=>{if(!c){fails++;console.log('FALHOU:',msg);}};
const got=id=>!!X.ACH[id];

// 1) primeira abertura sem histórico: nada desbloqueia além do óbvio, sem enxurrada de avisos
X.G=ctx.newGame(); ctx.render();
ok(Object.keys(X.ACH).length===0,'abrir o jogo do zero não devia desbloquear nada: '+Object.keys(X.ACH));
ok(toasts.length===0,'sem aviso na primeira abertura vazia');

// 2) carreira: inicial em desvantagem vence o 1º líder -> Primeira insígnia + Modo difícil + Primeiro passo
{const g=ctx.newGame(); g.phase='hub'; g.starter='Charmander'; g.team=[mon('Charmander',14)]; g.gymIndex=1; X.G=g; toasts=[]; ctx.afterRender();
 ok(got('jornada')&&got('badge1')&&got('underdog'),'jornada/badge1/underdog');
 ok(!got('badge4')&&!got('legend'),'não pode desbloquear o que não fez');
 ok(toasts.length>=1 && /Conquista/.test(toasts[0]),'aviso da conquista: '+toasts[0]);
 ok(g.log.some(l=>/Conquista: Primeira insígnia/.test(l.text)),'conquista vai pro diário');}
{const g=ctx.newGame(); g.phase='hub'; g.starter='Bulbasaur'; g.team=[mon('Bulbasaur',14)]; g.gymIndex=1; X.G=g;
 delete X.ACH.underdog; ctx.afterRender(); ok(!got('underdog'),'Bulbasaur tem vantagem contra o Brock: não é modo difícil');}

// 3) shinies: entra na coleção uma vez só, e conta pra conquista
{const g=ctx.newGame(); g.phase='hub'; g.starter='Squirtle'; const s=mon('Squirtle',10); s.shiny=true; g.team=[s, mon('Zapdos',50)]; X.G=g;
 const n0=X.SHLOG.length; ctx.afterRender(); ctx.afterRender();
 ok(X.SHLOG.length===n0+1 && X.SHLOG[0].sp==='Squirtle' && X.SHLOG[0].r==='kanto','shiny registrado uma vez');
 ok(got('shiny1')&&got('legend')&&!got('shiny_lend'),'shiny1 e lendário');
 const sh=JSON.parse(store.kc_shinies_v1); ok(sh.length===X.SHLOG.length,'coleção salva no navegador');
 g.phase='shinies'; ctx.render(); ok(true,'tela de shinies desenha');}

// 4) progresso numérico (time completo) e conquistas de fim de carreira
{const g=ctx.newGame(); g.phase='hub'; g.starter='Charmander'; g.team=['Charmander','Pidgey','Rattata','Oddish','Abra','Geodude'].map(s=>mon(s,10)); X.G=g;
 ctx.afterRender(); ok(got('fullteam'),'time completo com 6');}
{const g=ctx.newGame(); g.phase='hub'; g.starter='Charmander'; const e={species:'Ovo',lv:1,t:'normal',egg:true,hatch:2};
 g.team=['Charmander','Pidgey','Rattata','Oddish','Abra'].map(s=>mon(s,10)).concat([e]); X.G=g; delete X.ACH.fullteam; ctx.afterRender(); ok(!got('fullteam'),'ovo não conta no time completo');}
{const g=ctx.newGame(); g.starter='Charmander'; g.team=[mon('Charizard',60)]; g.gymIndex=8; g.eliteIndex=5; g.day=40; g.stats.trained=0; g.phase='champion'; X.G=g;
 ctx.render(); ok(got('champ_kanto')&&got('gambler')&&got('badge8')&&got('starter'),'campeão sem treinar + parceiro completo');
 const rec=JSON.parse(store.kc_carreira_kanto_v1); ok(rec.champs===1,'recorde de campeão salvo');}
{const g=ctx.newGame(); g.starter='Charmander'; g.team=[mon('Charizard',60)]; g.gymIndex=8; g.eliteIndex=5; g.stats.trained=3; g.phase='champion'; X.G=g;
 delete X.ACH.gambler; ctx.render(); ok(!got('gambler'),'quem treinou não é Apostador');}

// 5) tela de conquistas e primeira vez com histórico antigo (um aviso só)
{X.G=ctx.newGame(); X.G.phase='ach'; ctx.render(); ok(true,'tela de conquistas desenha');
 ok(ctx.achCount()===Object.keys(X.ACH).length,'contador de conquistas');}
{const keep=store.kc_conquistas_v1; delete store.kc_conquistas_v1;
 const ctx2=Object.assign({},ctx); vm.createContext(ctx2); toasts=[]; vm.runInContext(js,ctx2);
 ctx2.__x.G=ctx2.newGame(); ctx2.render();
 ok(ctx2.achCount()>=3 && toasts.length===1 && /carreiras anteriores/.test(toasts[0]),'histórico antigo vira um aviso só: '+toasts.join(' | '));
 store.kc_conquistas_v1=keep;}

// 6) entrada do ranking (o que o jogo envia) e a validação do servidor
const API=require(path.join(__dirname,'..','api','ranking.js')), T=API._t;
{const g=ctx.newGame(); g.starter='Charmander'; g.team=[mon('Charizard',60),mon('Zapdos',55)]; g.gymIndex=8; g.eliteIndex=2; g.day=31; g.phase='gameover'; X.G=g;
 const e=ctx.rankEntry(); e.pid='a'.repeat(24); e.name='Ash';
 ok(e.badges===8&&e.elite===2&&!e.legend&&e.team.length===2,'entrada do ranking');
 ok(T.validate(e)===null,'entrada válida aceita: '+T.validate(e));
 ok(T.scoreOf(e)===104,'pontuação 8*10+2*12='+T.scoreOf(e));
 ok(T.validate(Object.assign({},e,{day:10}))!==null,'dias de menos é recusado');
 ok(T.validate(Object.assign({},e,{badges:5}))!==null,'Liga sem 8 insígnias é recusado');
 ok(T.validate(Object.assign({},e,{legend:true}))!==null,'lenda sem ser campeão é recusado');
 ok(T.validate(Object.assign({},e,{badges:9}))!==null,'9 insígnias é recusado');
 ok(T.cleanName('  Ash <b>Ketchum</b> ')==='Ash bKetchum','nome sem HTML: '+T.cleanName('  Ash <b>Ketchum</b> '));
 ok(T.cleanName('x')===null && T.cleanName('merda')===null && T.cleanName('Joao Victor')==='Joao Victor','nomes');
 ok(T.rankKey({badges:8,elite:5,legend:false,day:30})>T.rankKey({badges:8,elite:5,legend:false,day:40}),'empate: menos dias vence');}

// 7) servidor com um Redis de mentira (mesmos comandos da API REST do Upstash)
(async()=>{
  const Z={},H={},K={};
  const zs=k=>Z[k]||(Z[k]=new Map()), hs=k=>H[k]||(H[k]=new Map());
  const sorted=k=>[...zs(k).entries()].sort((a,b)=>a[1]-b[1]||(a[0]<b[0]?-1:1)).map(x=>x[0]);
  const exec=([c,k,...a])=>{
    switch(c){
      case 'INCR': K[k]=(K[k]||0)+1; return K[k];
      case 'EXPIRE': return 1;
      case 'ZSCORE': return zs(k).has(a[0]) ? String(zs(k).get(a[0])) : null;
      case 'ZADD': zs(k).set(a[1], Number(a[0])); return 1;
      case 'ZCARD': return zs(k).size;
      case 'ZREVRANGE': { const s=sorted(k).reverse(); return s.slice(Number(a[0]), Number(a[1])+1); }
      case 'ZRANGE': { const s=sorted(k), stop=Number(a[1]); return s.slice(Number(a[0]), stop<0?s.length+stop+1:stop+1); }
      case 'ZREVRANK': { const i=sorted(k).reverse().indexOf(a[0]); return i<0?null:i; }
      case 'ZREM': a.forEach(m=>zs(k).delete(m)); return a.length;
      case 'HSET': hs(k).set(a[0], a[1]); return 1;
      case 'HGET': return hs(k).get(a[0])||null;
      case 'HMGET': return a.map(m=>hs(k).get(m)||null);
      case 'HDEL': a.forEach(m=>hs(k).delete(m)); return a.length;
      default: throw new Error('comando não simulado '+c);
    }
  };
  global.fetch=async(url,o)=>({ok:true, json:async()=>JSON.parse(o.body).map(cmd=>({result:exec(cmd)}))});
  process.env.KV_REST_API_URL='https://fake.upstash.io'; process.env.KV_REST_API_TOKEN='t';
  const call=async(method, body, url, ip)=>{ let out={}; const res={setHeader(){}, end(s){ out.body=JSON.parse(s); }};
    await API({method, body, url:url||'/api/ranking', headers:{'x-forwarded-for':ip||'1.1.1.1'}, socket:{}}, res); out.code=res.statusCode; return out; };
  const base={region:'kanto', name:'Ash', badges:4, elite:0, legend:false, day:14, starter:'Charmander', team:[{s:'Charmeleon',sh:false}]};
  const A='a'.repeat(24), B='b'.repeat(24);
  let r=await call('POST', Object.assign({pid:A},base));
  ok(r.code===200 && r.body.rows.length===1 && r.body.me.pos===1 && r.body.improved,'1º envio: '+JSON.stringify(r.body));
  r=await call('POST', Object.assign({pid:A},base,{badges:2,day:8}));
  ok(r.code===200 && !r.body.improved && r.body.rows[0].badges===4,'carreira pior não substitui a melhor');
  r=await call('POST', Object.assign({pid:B},base,{name:'Gary',badges:8,elite:5,day:30}));
  ok(r.body.rows[0].name==='Gary' && r.body.rows[0].score===160 && r.body.me.pos===1,'campeão passa na frente');
  r=await call('GET', null, `/api/ranking?region=kanto&pid=${A}`);
  ok(r.code===200 && r.body.total===2 && r.body.me.pos===2 && r.body.rows[1].me,'GET com sua posição');
  r=await call('POST', Object.assign({pid:A},base,{name:'<>!'}));
  ok(r.code===400,'nome inválido recusado');
  r=await call('POST', Object.assign({pid:A},base,{elite:3}));
  ok(r.code===400,'Elite Four sem 8 insígnias recusado');
  r=await call('GET', null, '/api/ranking?region=sinnoh'); ok(r.code===400,'região inexistente');
  for(let i=0;i<12;i++) await call('POST', Object.assign({pid:A},base), null, '9.9.9.9');
  r=await call('POST', Object.assign({pid:A},base), null, '9.9.9.9'); ok(r.code===429,'limite de envios por IP');
  delete process.env.KV_REST_API_URL; r=await call('GET', null, '/api/ranking?region=kanto'); ok(r.code===503 && r.body.error==='not_configured','sem banco: 503');
  console.log(fails?`${fails} FALHA(S)`:'TUDO OK');
  process.exit(fails?1:0);
})();
