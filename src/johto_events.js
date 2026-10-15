/* =====================================================================
   PACOTE JOHTO — eventos da roleta (rascunho aprovado: docs/johto-eventos-rascunho.md)
   Valores já são os reais (não passam pela escala do assemble de Kanto).
   night:true = só na 3ª decisão (noite) · cond = só entra se a condição valer · w = peso da fatia
   ===================================================================== */
const J_BABIES = ["Pichu","Cleffa","Igglybuff","Togepi","Tyrogue","Smoochum","Elekid","Magby"];
function giveEgg(pool){
  const e={species:"Ovo", lv:5, t:"normal", e:"🥚", egg:true, hatch:3, pool:pool||J_BABIES};
  if(G.team.length>=6){ G.pendingSwap=e; return e; }
  G.team.push(e); return e;
}
function capT(title, text, m){ return {title, text, highlight:m}; }
const pick = a => a[Math.floor(Math.random()*a.length)];
const ROAMERS = ["Raikou","Entei","Suicune"];
function roamLeft(){ G.roamCaught=G.roamCaught||{}; return ROAMERS.filter(s=>!G.roamCaught[s]); }
function roamEvent(){
  const s=pick(roamLeft()); G.roamSeen=G.roamSeen||{};
  const n=(G.roamSeen[s]||0)+1; G.roamSeen[s]=n;
  if(n>=3){ const m=addMon(s,40); G.roamCaught[s]=1;
    return capT(`${s} capturado!`, `Pela terceira vez ${s} cruza seu caminho... e desta vez a Poké Bola segura! <span class="reward">${s} (Lv ${m.lv}) entrou para o time!</span>`, m); }
  lvlAll(4);
  return capT(`${s} à vista!`, `Um rugido corta a rota: é <b>${s}</b>! Ele te encara e some num piscar de olhos (${n}/3 avistamentos — na 3ª vez dá pra capturar).\nSó de correr atrás dele: <span class="reward">time +4 níveis</span>.`, null);
}
const ROAM_SLICE = {ic:"🐾", lb:"Cão lendário", cond:()=>G.gymIndex>=4 && roamLeft().length>0, fn:roamEvent};
function itemOrLv(sp, item, n){
  const m=G.team.find(x=>x.species===sp || (Array.isArray(sp) && sp.includes(x.species)));
  if(m){ const old=m.species; doEvolve(m); G.stats.evolved++; return {m, text:`Você usa a <b>${item}</b> em ${old} numa troca amigável... <span class="reward">evoluiu para ${m.species}!</span>`}; }
  lvlAll(n); return {m:null, text:`Ninguém do time usa a <b>${item}</b>, então você a troca por Rare Candies: <span class="reward">time +${n} níveis</span>.`};
}
function lossEv(title, flee, none){ return ()=>{ const g=loseWeakest(); if(!g) return capT(title, none, null); return capT(title, flee.replace("{s}", g.species), null); }; }
function rocketEv(title, txt){ return ()=>{ const st=stealOne(true); if(!st) return capT(title, `A Rocket leva seu único parceiro...`, null); return capT(title, txt.replace("{s}", st.species), null); }; }

function JOHTO_EVENTS(){ return [
  /* 1 — Violet (Falkner, Voador) */
  { green:[
      {ic:"🥚",lb:"Ovo do Mr. Pokémon",fn:()=>{const e=giveEgg(["Togepi"]);return capT("O Ovo Misterioso",`O Prof. Elm te confia o Ovo Misterioso do Mr. Pokémon. <span class="reward">Ele choca em 3 decisões!</span>`,e);}},
      {ic:"🏯",lb:"Sábios da Torre Sprout",fn:()=>{lvlAll(5);return capT("Sábios da Torre Sprout",`Você vence os monges que treinam com Bellsprout na torre que balança. <span class="reward">Time +5 níveis</span>.`,null);}},
      {ic:"🪨",lb:"Geodude na Dark Cave",fn:()=>{const m=addMon("Geodude",8);return capT("Geodude na Dark Cave",`Um <b>Geodude</b> (Lv ${m.lv}) bloqueia a caverna e decide te seguir — Pedra é ótimo contra o Falkner!`,m);}},
      {ic:"🦉",lb:"Hoothoot da Rota 29",night:true,fn:()=>{const m=addMon("Hoothoot",8);return capT("🌙 Hoothoot da Rota 29",`À noite, um <b>Hoothoot</b> (Lv ${m.lv}) pousa no seu ombro e não sai mais.`,m);}},
    ], red:[
      {ic:"😠",lb:"Emboscada do Silver",fn:()=>{const t=G.team[0];dropLvOne(t,2);return capT("Emboscada do Silver",`O rival ruivo que roubou um Pokémon do Prof. Elm te desafia em Cherrygrove. <b>${t.species}</b> sai ferido: <b>-2 níveis</b>.`,t);}},
      {ic:"🐦",lb:"Bando de Spearow",fn:()=>{dropLvAll(1);return capT("Bando de Spearow",`A Rota 31 vira uma tempestade de bicos. <b>-1 nível</b> em todo o time.`,null);}},
      {ic:"🦇",lb:"Pânico na Dark Cave",loss:true,fn:lossEv("Pânico na Dark Cave","Sem Flash, seu Pokémon mais fraco se assusta com os Zubat e <b>foge</b>: perdeu {s}.","Os Zubat assustam o time, mas seu inicial fica firme — ninguém fugiu.")},
  ]},
  /* 2 — Azalea (Bugsy, Inseto) */
  { green:[
      {ic:"🐚",lb:"Herói do Poço Slowpoke",fn:()=>{const m=addMon("Slowpoke",12);m.kingsRock=true;return capT("Herói do Poço Slowpoke",`Você expulsa a Rocket do poço e o Kurt te dá um <b>Slowpoke</b> (Lv ${m.lv}) com uma King's Rock: ele pode virar Slowking ao evoluir.`,m);}},
      {ic:"🐑",lb:"Mareep da Rota 32",fn:()=>{const m=addMon("Mareep",10);return capT("Mareep da Rota 32",`Um <b>Mareep</b> (Lv ${m.lv}) fofinho entra pro time, cheio de eletricidade estática.`,m);}},
      {ic:"🌳",lb:"Árvore de Headbutt",fn:()=>{const m=addMon("Heracross",14);return capT("Árvore de Headbutt",`Você balança uma árvore da Floresta Ilex e cai um <b>Heracross</b> raro (Lv ${m.lv})!`,m);}},
      {ic:"🗿",lb:"Ruínas de Alph",fn:()=>{const s=pick(["Unown","Unown","Omanyte","Kabuto","Aerodactyl"]);const m=addMon(s,12);return capT("Ruínas de Alph",`Resolvendo o painel de pedra das ruínas, você encontra <b>${s}</b> (Lv ${m.lv})!`,m);}},
      {ic:"💧",lb:"Wooper na Union Cave",night:true,fn:()=>{const m=addMon("Wooper",10);return capT("🌙 Wooper na Union Cave",`À noite, os Wooper saem da água. Um deles (Lv ${m.lv}) gostou de você.`,m);}},
    ], red:[
      {ic:"🦆",lb:"Farfetch'd fugitivo",fn:()=>{dropLvAll(1);return capT("Farfetch'd fugitivo",`Horas correndo atrás do Farfetch'd do carvoeiro na Floresta Ilex. <b>-1 nível</b> em todo o time.`,null);}},
      {ic:"🕷️",lb:"Picada de Spinarak",fn:()=>{const t=strongest();dropLvOne(t,3);return capT("Picada de Spinarak",`<b>${t.species}</b> é envenenado no caminho: <b>-3 níveis</b>.`,t);}},
      {ic:"🚀",lb:"Sequestro no Poço",loss:true,fn:rocketEv("Sequestro no Poço","Um capanga Rocket some no escuro do poço levando <b>{s}</b>.")},
  ]},
  /* 3 — Goldenrod (Whitney, Normal) */
  { green:[
      {ic:"🦊",lb:"Eevee do Bill",fn:()=>{const m=addMon("Eevee",15);return capT("Eevee do Bill",`O Bill está visitando Goldenrod e te dá um <b>Eevee</b> (Lv ${m.lv}). Com amizade, ele vira Espeon (de dia) ou Umbreon (à noite).`,m);}},
      {ic:"🥚",lb:"Ovo da Creche",fn:()=>{const e=giveEgg();return capT("Ovo da Creche",`O casal da Creche da Rota 34 achou um ovo no quintal e te entrega. <span class="reward">Choca em 3 decisões!</span>`,e);}},
      {ic:"🎰",lb:"Prêmio do Game Corner",fn:()=>{const s=pick(["Abra","Cubone","Wobbuffet"]);const m=addMon(s,15);return capT("Prêmio do Game Corner",`A sorte vira nas máquinas e você troca as fichas por um <b>${s}</b> (Lv ${m.lv})!`,m);}},
      {ic:"📻",lb:"Lucky Channel",fn:()=>{lvlAll(6);return capT("Lucky Channel",`Seu ID bate com o número da sorte da Rádio de Goldenrod! <span class="reward">Time +6 níveis</span>.`,null);}},
    ], red:[
      {ic:"🐄",lb:"Trauma do Miltank",fn:()=>{const a=strongest(),b=randMember(false);dropLvOne(a,3);if(b&&b!==a)dropLvOne(b,3);return capT("Trauma do Miltank",`No treino do ginásio, um Rollout da Miltank atropela <b>${a.species}</b>${b&&b!==a?` e <b>${b.species}</b>`:''}: <b>-3 níveis</b>.`,a);}},
      {ic:"👊",lb:"Briga no Subsolo",fn:()=>{dropLvAll(2);return capT("Briga no Subsolo",`Você se mete numa disputa de rua no Subsolo de Goldenrod. <b>-2 níveis</b> em todo o time.`,null);}},
      {ic:"🎭",lb:"Batedor no Subsolo",loss:true,fn:lossEv("Batedor no Subsolo","Na confusão, alguém leva uma Poké Bola da sua cintura: perdeu {s}.","Um batedor tenta a sorte, mas só acha a Poké Bola do seu inicial — e ela não sai. Ufa!")},
  ]},
  /* 4 — Ecruteak (Morty, Fantasma) */
  { green:[
      {ic:"🦗",lb:"Concurso de Insetos",fn:()=>{const s=pick(["Scyther","Pinsir"]);const m=addMon(s,20);return capT("Campeão do Concurso de Insetos",`Você vence o concurso do Parque Nacional com um <b>${s}</b> (Lv ${m.lv})!`,m);}},
      {ic:"🔥",lb:"Torre Queimada",fn:()=>{G.roamFree=true;lvlAll(6);return capT("O despertar da Torre Queimada",`No porão da torre, <b>Raikou, Entei e Suicune</b> despertam e fogem pelo mundo! A partir de agora eles podem cruzar a sua roleta.\nSó de sobreviver ao susto: <span class="reward">time +6 níveis</span>.`,null);}},
      {ic:"🌲",lb:"Sudowoodo da Rota 36",fn:()=>{const m=addMon("Sudowoodo",20);return capT("Sudowoodo da Rota 36",`A "árvore" que bloqueava a rota era um <b>Sudowoodo</b> (Lv ${m.lv})!`,m);}},
      {ic:"👻",lb:"Gastly na Torre do Sino",night:true,fn:()=>{const m=addMon("Gastly",18);return capT("🌙 Gastly na Torre do Sino",`À noite, um <b>Gastly</b> (Lv ${m.lv}) te segue até o Centro Pokémon.`,m);}},
    ], red:[
      {ic:"🕳️",lb:"Chão podre",fn:()=>{const t=strongest();dropLvOne(t,3);return capT("Chão podre da Torre Queimada",`O piso cede e você cai no porão. <b>${t.species}</b> te protege na queda: <b>-3 níveis</b>.`,t);}},
      {ic:"🌫️",lb:"Maldição de Ecruteak",fn:()=>{const a=randMember(false),b=randMember(false);dropLvOne(a,3);if(b!==a)dropLvOne(b,3);return capT("Maldição de Ecruteak",`Um fantasma assombra <b>${a.species}</b>${b!==a?` e <b>${b.species}</b>`:''}: <b>-3 níveis</b>.`,a);}},
      {ic:"😱",lb:"Assombração de Ecruteak",loss:true,fn:lossEv("Assombração","Um vulto atravessa o time e <b>{s}</b> foge apavorado.","Os fantasmas cercam o time, mas seu inicial não arreda pé.")},
  ]},
  /* 5 — Cianwood (Chuck, Lutador) */
  { green:[
      {ic:"🐢",lb:"Shuckle emprestado",fn:()=>{const m=addMon("Shuckle",24);return capT("Shuckle emprestado",`O homem de Cianwood te pede pra cuidar do Shuckle dele... e o <b>Shuckle</b> (Lv ${m.lv}) não quer mais voltar.`,m);}},
      {ic:"💊",lb:"Remédio Secreto",fn:()=>{const t=strongest();lvlOne(t,9);t.fr=(t.fr||0)+3;return capT("Remédio Secreto",`Você leva o remédio de Cianwood para a Ampharos do farol. <span class="reward">${t.species} +9 níveis</span> e muito mais amizade.`,t);}},
      {ic:"🐟",lb:"Mantine da Rota 41",fn:()=>{const m=addMon("Mantine",24);return capT("Mantine da Rota 41",`Surfando entre as ilhas, um <b>Mantine</b> (Lv ${m.lv}) nada ao seu lado.`,m);}},
      {ic:"🌊",lb:"Treino na cachoeira",fn:()=>{lvlAll(6);return capT("Treino na cachoeira",`Você treina com o Chuck segurando a cachoeira. <span class="reward">Time +6 níveis</span>.`,null);}},
      ROAM_SLICE,
    ], red:[
      {ic:"⛈️",lb:"Tempestade no mar",fn:()=>{dropLvAll(2);return capT("Tempestade no mar",`A travessia vira um pesadelo. <b>-2 níveis</b> em todo o time.`,null);}},
      {ic:"🥋",lb:"Mão pesada do Chuck",fn:()=>{const t=randMember(false);dropLvOne(t,3);return capT("Mão pesada do Chuck",`O aquecimento do ginásio deixa <b>${t.species}</b> machucado: <b>-3 níveis</b>.`,t);}},
      {ic:"🌀",lb:"Correnteza das Ilhas",loss:true,fn:lossEv("Correnteza das Ilhas Redemoinho","Um redemoinho arrasta <b>{s}</b> para o fundo do mar.","O redemoinho puxa forte, mas você segura seu inicial.")},
  ]},
  /* 6 — Olivine (Jasmine, Aço) */
  { green:[
      {ic:"🛡️",lb:"Metal Coat no S.S. Aqua",fn:()=>{const r=itemOrLv(["Onix","Scyther"],"Metal Coat",7);return capT("Metal Coat no S.S. Aqua",`Um marinheiro do S.S. Aqua te dá uma Metal Coat. ${r.text}`,r.m);}},
      {ic:"🥛",lb:"Leite da Fazenda Moomoo",fn:()=>{lvlAll(7);return capT("Leite da Fazenda Moomoo",`Você cura a Miltank doente e ganha garrafas de MooMoo Milk. <span class="reward">Time +7 níveis</span>.`,null);}},
      {ic:"🧲",lb:"Magnemite da Rota 38",fn:()=>{const m=addMon("Magnemite",28);return capT("Magnemite da Rota 38",`Um <b>Magnemite</b> (Lv ${m.lv}) gruda na sua bicicleta e não solta.`,m);}},
      {ic:"⚓",lb:"Duelo no farol",fn:()=>{lvlAll(7);return capT("Duelo no farol",`Você vence todos os marinheiros do farol de Olivine. <span class="reward">Time +7 níveis</span>.`,null);}},
      ROAM_SLICE,
    ], red:[
      {ic:"🪜",lb:"Escada sem fim",fn:()=>{dropLvAll(2);return capT("Escada sem fim",`O elevador do farol quebrou. <b>-2 níveis</b> em todo o time.`,null);}},
      {ic:"🍼",lb:"Leite estragado",fn:()=>{const t=strongest();dropLvOne(t,4);return capT("Leite estragado",`Nem todo MooMoo Milk estava bom... <b>${t.species}</b> passa mal: <b>-4 níveis</b>.`,t);}},
      {ic:"🎭",lb:"Ladrão no porto",loss:true,fn:lossEv("Ladrão no porto","Na confusão do embarque, alguém leva <b>{s}</b>.","Um ladrão tenta, mas seu inicial não larga de você.")},
  ]},
  /* 7 — Mahogany (Pryce, Gelo) — Gyarados Vermelho é cena fixa (motor) */
  { green:[
      {ic:"🥋",lb:"Rei do Karatê",fn:()=>{const m=addMon("Tyrogue",22);return capT("Rei do Karatê do Mt. Mortar",`Depois de meses treinando na caverna, ele te dá um <b>Tyrogue</b> (Lv ${m.lv}). No Lv 20 ele vira Hitmonlee, Hitmonchan ou Hitmontop.`,m);}},
      {ic:"🐉",lb:"Ataque ao QG da Rocket",fn:()=>{lvlAll(7);return capT("Ataque ao QG da Rocket",`O Lance aparece com o Dragonite e vocês invadem o QG juntos. <span class="reward">Time +7 níveis</span>.`,null);}},
      {ic:"🦒",lb:"Girafarig da Rota 43",fn:()=>{const m=addMon("Girafarig",30);return capT("Girafarig da Rota 43",`Um <b>Girafarig</b> (Lv ${m.lv}) atravessa o pedágio da Rocket e decide ficar com você.`,m);}},
      {ic:"🐾",lb:"Sneasel no escuro",night:true,fn:()=>{const m=addMon("Sneasel",30);return capT("🌙 Sneasel no escuro",`À noite, um <b>Sneasel</b> (Lv ${m.lv}) rouba sua comida... e decide ficar.`,m);}},
      ROAM_SLICE,
    ], red:[
      {ic:"📡",lb:"O sinal da Rocket",fn:()=>{dropLvAll(2);return capT("O sinal da Rocket",`A onda de rádio do QG enlouquece o seu time. <b>-2 níveis</b> em todos.`,null);}},
      {ic:"💥",lb:"Armadilha de Electrode",fn:()=>{const a=randMember(false),b=randMember(false);dropLvOne(a,4);if(b!==a)dropLvOne(b,4);return capT("Armadilha de Electrode",`As estátuas de Persian do QG eram Electrode! <b>${a.species}</b>${b!==a?` e <b>${b.species}</b>`:''}: <b>-4 níveis</b>.`,a);}},
      {ic:"🚀",lb:"Executivo da Rocket",loss:true,fn:rocketEv("Executivo da Rocket","Um executivo da Rocket confisca <b>{s}</b>.")},
  ]},
  /* 8 — Blackthorn (Clair, Dragão) */
  { green:[
      {ic:"🪽",lb:"Asa Prateada",w:0.5,fn:()=>{const m=addMon("Lugia",44);return capT("Herói da Torre de Rádio",`Você liberta a Torre de Rádio e o diretor te dá a <b>Asa Prateada</b>. Nas Ilhas Redemoinho, <span class="reward">Lugia (Lv ${m.lv}) entrou para o time!</span>`,m);}},
      {ic:"🐲",lb:"Prova da Toca do Dragão",fn:()=>{const m=addMon("Dratini",30);return capT("Prova da Toca do Dragão",`O Ancião aprova suas respostas e te dá um <b>Dratini</b> (Lv ${m.lv}).`,m);}},
      {ic:"🐉",lb:"Dragon Scale",fn:()=>{const r=itemOrLv("Seadra","Dragon Scale",7);return capT("Dragon Scale no Ice Path",`Escondida no gelo, uma Dragon Scale. ${r.text}`,r.m);}},
      {ic:"❄️",lb:"Morador do Ice Path",fn:()=>{const s=pick(["Swinub","Delibird","Jynx"]);const m=addMon(s,32);return capT("Morador do Ice Path",`Um <b>${s}</b> (Lv ${m.lv}) desliza até você pelo gelo.`,m);}},
      ROAM_SLICE,
    ], red:[
      {ic:"🧊",lb:"Gelo escorregadio",fn:()=>{dropLvAll(2);return capT("Gelo escorregadio",`O Ice Path cobra o preço de cada escorregão. <b>-2 níveis</b> em todo o time.`,null);}},
      {ic:"😤",lb:"A Clair não aceita",fn:()=>{const t=strongest();dropLvOne(t,4);return capT("A Clair não aceita",`Ela te manda à Toca do Dragão, e o teste do Ancião é duro. <b>${t.species}</b>: <b>-4 níveis</b>.`,t);}},
      {ic:"🏔️",lb:"Avalanche no Ice Path",loss:true,fn:lossEv("Avalanche no Ice Path","O teto de gelo desaba entre você e <b>{s}</b>.","O gelo desaba, mas você e seu inicial escapam juntos.")},
  ]},
  /* 9 — Victory Road (Rotas 26-27, Cachoeira Tohjo) */
  { green:[
      {ic:"🌈",lb:"Asa Arco-Íris",w:0.5,fn:()=>{const m=addMon("Ho-Oh",46);return capT("A Asa Arco-Íris",`Você sobe a Torre do Sino e <b>Ho-Oh</b> desce entre as chamas. <span class="reward">Ho-Oh (Lv ${m.lv}) entrou para o time!</span>`,m);}},
      {ic:"🎓",lb:"Ás da Rota 27",fn:()=>{lvlAll(7);return capT("Treinador Ás da Rota 27",`Uma vitória suada contra um Treinador Ás. <span class="reward">Time +7 níveis</span>.`,null);}},
      {ic:"🍬",lb:"Rare Candy na cachoeira",fn:()=>{const t=strongest();lvlOne(t,10);return capT("Rare Candy na cachoeira",`Atrás da Cachoeira Tohjo, um saco de Rare Candies! <span class="reward">${t.species} +10 níveis</span>.`,t);}},
      {ic:"💾",lb:"Up-Grade do cientista",fn:()=>{const r=itemOrLv("Porygon","Up-Grade",7);return capT("Up-Grade do cientista",`Um cientista da Silph te dá um Up-Grade. ${r.text}`,r.m);}},
      ROAM_SLICE,
    ], red:[
      {ic:"😠",lb:"Último duelo com o Silver",fn:()=>{const t=strongest();dropLvOne(t,4);return capT("Último duelo com o Silver",`Ele nunca teve tanta raiva. <b>${t.species}</b> sai do duelo exausto: <b>-4 níveis</b>.`,t);}},
      {ic:"💦",lb:"Cachoeira Tohjo",fn:()=>{dropLvAll(2);return capT("Cachoeira Tohjo",`Subir a cachoeira com Waterfall cansa todo mundo. <b>-2 níveis</b> no time.`,null);}},
      {ic:"⛏️",lb:"Desmoronamento",loss:true,fn:lossEv("Desmoronamento","O teto da caverna cede e <b>{s}</b> fica do outro lado dos escombros.","O teto cede, mas você e seu inicial escapam por pouco.")},
  ]},
  /* 10 — Mt. Silver (pós-Liga, 3 decisões antes do Red) */
  { green:[
      {ic:"🦖",lb:"Larvitar do pico",fn:()=>{const m=addMon("Larvitar",40);return capT("Larvitar do pico",`Entre as rochas do Mt. Silver, um <b>Larvitar</b> (Lv ${m.lv}) te desafia e se junta ao time.`,m);}},
      {ic:"👻",lb:"Misdreavus da caverna",night:true,fn:()=>{const m=addMon("Misdreavus",40);return capT("🌙 Misdreavus da caverna",`Um choro estranho ecoa à noite: é um <b>Misdreavus</b> (Lv ${m.lv}), que decide te seguir.`,m);}},
      {ic:"🏔️",lb:"Treino na neve eterna",fn:()=>{lvlAll(7);return capT("Treino na neve eterna",`Dias de treino no frio do Mt. Silver. <span class="reward">Time +7 níveis</span>.`,null);}},
      {ic:"🌸",lb:"GS Ball",w:0.3,fn:()=>{const m=addMon("Celebi",44);return capT("A GS Ball",`O Kurt abre a misteriosa GS Ball no santuário da Floresta Ilex... <span class="reward">Celebi (Lv ${m.lv}) atravessou o tempo para te encontrar!</span>`,m);}},
      {ic:"🎁",lb:"Presente do Prof. Carvalho",fn:()=>{const s=pick(["Bulbasaur","Charmander","Squirtle"]);const m=addMon(s,40);return capT("Presente do Prof. Carvalho",`O Prof. Carvalho ouviu falar de você e manda de Kanto um <b>${s}</b> (Lv ${m.lv}).`,m);}},
      {ic:"✨",lb:"Lendas de Kanto",w:0.4,fn:()=>{const s=pick(["Articuno","Zapdos","Moltres","Articuno","Zapdos","Moltres","Mewtwo","Mew"]);const m=addMon(s,44);return capT("Lendas de Kanto",`Do outro lado da montanha, já em Kanto, <span class="reward">${s} (Lv ${m.lv}) entrou para o time!</span>`,m);}},
      ROAM_SLICE,
    ], red:[
      {ic:"🌨️",lb:"Nevasca",fn:()=>{dropLvAll(2);return capT("Nevasca",`Uma nevasca prende o time na caverna. <b>-2 níveis</b> em todos.`,null);}},
      {ic:"🐻",lb:"Ursaring furioso",fn:()=>{const t=strongest();dropLvOne(t,4);return capT("Ursaring furioso",`Um Ursaring selvagem ataca e <b>${t.species}</b> te defende: <b>-4 níveis</b>.`,t);}},
      {ic:"🪨",lb:"Queda na encosta",loss:true,fn:lossEv("Queda na encosta","Uma pedra rola e <b>{s}</b> despenca encosta abaixo.","Você escorrega, mas seu inicial te segura.")},
  ]},
].map(set=>{ set.green.splice(Math.min(3,set.green.length),0,{ic:"💎",lb:"Pedra evolutiva",fn:stoneEvent}); return set; }); }

const J_WHEEL_ICON = {
  "Ovo do Mr. Pokémon":"P:Togepi","Sábios da Torre Sprout":"P:Bellsprout","Geodude na Dark Cave":"P:Geodude","Hoothoot da Rota 29":"P:Hoothoot",
  "Emboscada do Silver":"T:j_silver","Bando de Spearow":"P:Spearow","Pânico na Dark Cave":"P:Zubat",
  "Herói do Poço Slowpoke":"P:Slowpoke","Mareep da Rota 32":"P:Mareep","Árvore de Headbutt":"P:Heracross","Ruínas de Alph":"P:Unown","Wooper na Union Cave":"P:Wooper",
  "Farfetch'd fugitivo":"P:Farfetch'd","Picada de Spinarak":"P:Spinarak","Sequestro no Poço":"T:rocketgrunt",
  "Eevee do Bill":"P:Eevee","Ovo da Creche":"P:Pichu","Prêmio do Game Corner":"P:Wobbuffet","Lucky Channel":"P:Aipom",
  "Trauma do Miltank":"P:Miltank","Briga no Subsolo":"T:biker","Batedor no Subsolo":"T:burglar",
  "Concurso de Insetos":"P:Scyther","Torre Queimada":"P:Entei","Sudowoodo da Rota 36":"P:Sudowoodo","Gastly na Torre do Sino":"P:Gastly",
  "Chão podre":"P:Koffing","Maldição de Ecruteak":"P:Haunter","Assombração de Ecruteak":"P:Gengar",
  "Shuckle emprestado":"P:Shuckle","Remédio Secreto":"P:Ampharos","Mantine da Rota 41":"P:Mantine","Treino na cachoeira":"T:j_chuck",
  "Tempestade no mar":"P:Tentacruel","Mão pesada do Chuck":"P:Poliwrath","Correnteza das Ilhas":"P:Lugia",
  "Metal Coat no S.S. Aqua":"P:Steelix","Leite da Fazenda Moomoo":"P:Miltank","Magnemite da Rota 38":"P:Magnemite","Duelo no farol":"T:sailor",
  "Escada sem fim":"P:Ampharos","Leite estragado":"P:Grimer","Ladrão no porto":"T:burglar",
  "Rei do Karatê":"P:Tyrogue","Ataque ao QG da Rocket":"P:Dragonite","Girafarig da Rota 43":"P:Girafarig","Sneasel no escuro":"P:Sneasel",
  "O sinal da Rocket":"P:Magikarp","Armadilha de Electrode":"P:Electrode","Executivo da Rocket":"T:rocketgrunt",
  "Asa Prateada":"P:Lugia","Prova da Toca do Dragão":"P:Dratini","Dragon Scale":"P:Kingdra","Morador do Ice Path":"P:Swinub",
  "Gelo escorregadio":"P:Piloswine","A Clair não aceita":"T:j_clair","Avalanche no Ice Path":"P:Delibird",
  "Asa Arco-Íris":"P:Ho-Oh","Ás da Rota 27":"T:acetrainer","Rare Candy na cachoeira":"P:Chansey","Up-Grade do cientista":"P:Porygon2",
  "Último duelo com o Silver":"T:j_silver","Cachoeira Tohjo":"P:Gyarados","Desmoronamento":"P:Onix",
  "Larvitar do pico":"P:Larvitar","Misdreavus da caverna":"P:Misdreavus","Treino na neve eterna":"T:j_red","GS Ball":"P:Celebi",
  "Presente do Prof. Carvalho":"P:Bulbasaur","Lendas de Kanto":"P:Mewtwo","Nevasca":"P:Swinub","Ursaring furioso":"P:Ursaring","Queda na encosta":"P:Graveler",
  "Cão lendário":"P:Suicune",
};
