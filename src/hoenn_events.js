/* =====================================================================
   PACOTE HOENN — eventos da roleta (Gen 3, roteiro de Emerald)
   Reaproveita os ajudantes de johto_events.js (capT, pick, giveEgg, itemOrLv, lossEv), que já estão
   carregados porque o hoenn.js sempre vem depois do johto.js.
   night:true = só na 3ª decisão (noite) · cond = só entra se a condição valer · w = peso da fatia
   ===================================================================== */
const H_BABIES = ["Azurill","Wynaut","Pichu","Cleffa","Igglybuff","Togepi","Tyrogue","Smoochum","Elekid","Magby"];
/* Latias e Latios cruzam Hoenn depois do 6º ginásio: na 3ª vez que o mesmo aparece, você captura */
const H_ROAMERS = ["Latias","Latios"];
function hRoamLeft(){ G.roamCaught=G.roamCaught||{}; return H_ROAMERS.filter(s=>!G.roamCaught[s]); }
function hRoamEvent(){
  const s=pick(hRoamLeft()); G.roamSeen=G.roamSeen||{};
  const n=(G.roamSeen[s]||0)+1; G.roamSeen[s]=n;
  if(n>=3){ const m=addMon(s,42); G.roamCaught[s]=1;
    return capT(`${s} capturado!`, `Pela terceira vez ${s} rasga o céu da rota... e desta vez a Poké Bola segura! <span class="reward">${s} (Lv ${m.lv}) entrou para o time!</span>`, m); }
  lvlAll(4);
  return capT(`${s} à vista!`, `Um vulto ${s==="Latias"?"vermelho":"azul"} passa voando baixo: é <b>${s}</b>! Some antes que você jogue a Poké Bola (${n}/3 avistamentos; na 3ª dá pra capturar).\nSó de correr atrás: <span class="reward">time +4 níveis</span>.`, null);
}
const LATI_SLICE = {ic:"🌀", lb:"Dragão errante", cond:()=>G.gymIndex>=6 && hRoamLeft().length>0, fn:hRoamEvent};
/* Equipe Aqua / Magma: leva um Pokémon (o inicial nunca) */
function gangEv(title, txt){ return ()=>{ const st=stealOne(true); if(!st) return capT(title, `Eles tentam levar seu parceiro, mas seu inicial não larga você.`, null); return capT(title, txt.replace("{s}", st.species), null); }; }

function HOENN_EVENTS(){ return [
  /* 1 — Rustboro (Roxanne, Pedra) */
  { green:[
      {ic:"🎒",lb:"Resgate do Prof. Birch",fn:()=>{lvlAll(5);return capT("Resgate do Prof. Birch",`Um Poochyena encurrala o Prof. Birch na Rota 101 e você salva o dia. Ele te deixa ficar com o Pokémon e ainda te treina. <span class="reward">Time +5 níveis</span>.`,null);}},
      {ic:"💗",lb:"Ralts da Rota 102",fn:()=>{const m=addMon("Ralts",8);return capT("Ralts da Rota 102",`Igual ao Wally, você encontra um <b>Ralts</b> (Lv ${m.lv}) tímido na grama. Ele decide vir com você.`,m);}},
      {ic:"🍄",lb:"Shroomish da Floresta",fn:()=>{const m=addMon("Shroomish",8);return capT("Shroomish da Floresta Petalburg",`Um <b>Shroomish</b> (Lv ${m.lv}) cai de um tronco. Planta é ótimo contra a Roxanne!`,m);}},
      {ic:"🪷",lb:"Lotad do lago",night:true,fn:()=>{const m=addMon("Lotad",8);return capT("🌙 Lotad do lago",`À noite, um <b>Lotad</b> (Lv ${m.lv}) boia até a margem. Água contra Pedra: perfeito.`,m);}},
    ], red:[
      {ic:"🐺",lb:"Poochyena da Rota 101",fn:()=>{const t=G.team[0];dropLvOne(t,2);return capT("Poochyena da Rota 101",`Uma matilha de Poochyena te persegue até Oldale. <b>${t.species}</b> sai mordido: <b>-2 níveis</b>.`,t);}},
      {ic:"🌊",lb:"Capanga Aqua na floresta",fn:()=>{dropLvAll(1);return capT("Capanga Aqua na floresta",`Um capanga da Equipe Aqua tenta roubar as peças da Devon na Floresta Petalburg. A briga cansa o time: <b>-1 nível</b> em todos.`,null);}},
      {ic:"🕳️",lb:"Túnel Rusturf",loss:true,fn:lossEv("Túnel Rusturf","O túnel desaba pela metade e <b>{s}</b> fica do outro lado.","O túnel treme, mas você e seu inicial passam juntos.")},
  ]},
  /* 2 — Dewford (Brawly, Lutador) */
  { green:[
      {ic:"✉️",lb:"Carta para o Steven",fn:()=>{lvlAll(5);return capT("Carta para o Steven",`Você entrega a carta da Devon ao Steven no fundo da Granite Cave. Ele te ensina a treinar melhor. <span class="reward">Time +5 níveis</span>.`,null);}},
      {ic:"🐦",lb:"Wingull do Mr. Briney",fn:()=>{const m=addMon("Wingull",12);return capT("Wingull do Mr. Briney",`O Peeko do Mr. Briney chama um amigo: um <b>Wingull</b> (Lv ${m.lv}) entra no barco e no seu time. Voador vence Lutador!`,m);}},
      {ic:"💎",lb:"Sableye da Granite Cave",fn:()=>{const m=addMon("Sableye",12);return capT("Sableye da Granite Cave",`Olhos de cristal brilham no escuro: um <b>Sableye</b> (Lv ${m.lv}) se junta ao time.`,m);}},
      {ic:"⛓️",lb:"Aron da caverna",fn:()=>{const m=addMon("Aron",12);return capT("Aron da Granite Cave",`Um <b>Aron</b> (Lv ${m.lv}) mastigava uma pedra de ferro. Agora mastiga do seu lado.`,m);}},
    ], red:[
      {ic:"🌑",lb:"Escuridão na Granite Cave",fn:()=>{dropLvAll(1);return capT("Escuridão na Granite Cave",`Sem Flash, o time anda horas no escuro. <b>-1 nível</b> em todos.`,null);}},
      {ic:"🥊",lb:"Aquecimento do Brawly",fn:()=>{const t=strongest();dropLvOne(t,3);return capT("Aquecimento do Brawly",`Os alunos do Brawly pegam pesado no treino da praia. <b>${t.species}</b>: <b>-3 níveis</b>.`,t);}},
      {ic:"⛵",lb:"Mar agitado",loss:true,fn:lossEv("Mar agitado","Uma onda gigante varre o barco e <b>{s}</b> cai no mar.","O barco balança, mas o seu inicial fica firme no convés.")},
  ]},
  /* 3 — Mauville (Wattson, Elétrico) */
  { green:[
      {ic:"🚲",lb:"Bicicleta do Rydel",fn:()=>{lvlAll(6);return capT("A bicicleta do Rydel",`O Rydel te dá uma bicicleta e você treina na Cycling Road. <span class="reward">Time +6 níveis</span>.`,null);}},
      {ic:"⚡",lb:"Electrike da Rota 110",fn:()=>{const m=addMon("Electrike",16);return capT("Electrike da Rota 110",`Um <b>Electrike</b> (Lv ${m.lv}) cheio de faíscas corre até você.`,m);}},
      {ic:"➕",lb:"Plusle e Minun",fn:()=>{const s=pick(["Plusle","Minun"]);const m=addMon(s,16);return capT(`${s} da Rota 110`,`Uma dupla de Plusle e Minun torce por você. <b>${s}</b> (Lv ${m.lv}) entra pro time.`,m);}},
      {ic:"🦎",lb:"Barragem de Mauville",fn:()=>{const s=pick(["Trapinch","Barboach","Marill"]);const m=addMon(s,16);return capT("Perto da barragem",`Perto de New Mauville um <b>${s}</b> (Lv ${m.lv}) te segue. Terra contra elétrico é ouro!`,m);}},
    ], red:[
      {ic:"🌊",lb:"Aqua no Museu Oceânico",fn:()=>{dropLvAll(1);return capT("Aqua no Museu Oceânico",`A Equipe Aqua invade o museu de Slateport atrás das peças da Devon. <b>-1 nível</b> em todos.`,null);}},
      {ic:"🔌",lb:"Pane em New Mauville",fn:()=>{const a=randMember(false),b=randMember(false);dropLvOne(a,3);if(b&&b!==a)dropLvOne(b,3);return capT("Pane em New Mauville",`O gerador subterrâneo explode em choques. <b>${a.species}</b>${b&&b!==a?` e <b>${b.species}</b>`:''}: <b>-3 níveis</b>.`,a);}},
      {ic:"🎭",lb:"Capanga Aqua em Slateport",loss:true,fn:gangEv("Capanga Aqua em Slateport","No tumulto do porto, um capanga da Aqua some com <b>{s}</b>.")},
  ]},
  /* 4 — Lavaridge (Flannery, Fogo) */
  { green:[
      {ic:"🥚",lb:"Ovo das termas",fn:()=>{const e=giveEgg(["Wynaut"]);return capT("O ovo das termas",`A senhora das águas termais de Lavaridge te dá um ovo quentinho. <span class="reward">Choca em 3 decisões!</span>`,e);}},
      {ic:"🌋",lb:"Herói do Monte Chimney",fn:()=>{lvlAll(6);return capT("Herói do Monte Chimney",`Você impede o Maxie e a Equipe Magma de despertar o vulcão. <span class="reward">Time +6 níveis</span>.`,null);}},
      {ic:"🏜️",lb:"Trapinch do deserto",fn:()=>{const s=pick(["Trapinch","Baltoy","Cacnea"]);const m=addMon(s,20);return capT("O deserto da Rota 111",`Com os Go-Goggles, você atravessa a tempestade de areia e encontra um <b>${s}</b> (Lv ${m.lv}).`,m);}},
      {ic:"♨️",lb:"Águas termais",fn:()=>{G.team.forEach(m=>{m.fr=(m.fr||0)+2;});const t=strongest();lvlOne(t,6);return capT("Águas termais de Lavaridge",`Um banho de areia quente relaxa o time. <span class="reward">${t.species} +6 níveis</span> e todo mundo mais amigo.`,t);}},
    ], red:[
      {ic:"🌫️",lb:"Cinzas da Rota 113",fn:()=>{dropLvAll(1);return capT("Cinzas da Rota 113",`As cinzas do vulcão cobrem tudo e o time anda tossindo. <b>-1 nível</b> em todos.`,null);}},
      {ic:"🔥",lb:"Fiery Path",fn:()=>{const t=strongest();dropLvOne(t,3);return capT("O Fiery Path",`O calor do caminho de fogo derruba <b>${t.species}</b>: <b>-3 níveis</b>.`,t);}},
      {ic:"🔴",lb:"Emboscada Magma",loss:true,fn:gangEv("Emboscada Magma","No Jagged Pass, capangas da Magma te cercam e levam <b>{s}</b>.")},
  ]},
  /* 5 — Petalburg (Norman, Normal: o seu pai) */
  { green:[
      {ic:"🥚",lb:"Ovo da Creche",fn:()=>{const e=giveEgg(H_BABIES);return capT("Ovo da Creche da Rota 117",`O velhinho da Creche acha um ovo no quintal e te entrega. <span class="reward">Choca em 3 decisões!</span>`,e);}},
      {ic:"👨",lb:"Conselho do pai",fn:()=>{lvlAll(6);return capT("Conselho do pai",`Antes da batalha, o Norman treina com você como nos velhos tempos. <span class="reward">Time +6 níveis</span>.`,null);}},
      {ic:"⚔️",lb:"Zangoose ou Seviper",fn:()=>{const s=pick(["Zangoose","Seviper"]);const m=addMon(s,24);return capT("A rixa da Rota 114",`Você separa uma briga eterna e o <b>${s}</b> (Lv ${m.lv}) decide te seguir.`,m);}},
      {ic:"🥋",lb:"Makuhita do Wally",fn:()=>{const s=pick(["Makuhita","Meditite","Breloom"]);const m=addMon(s,24);return capT("Treino com o Wally",`O Wally te mostra onde treinar em Verdanturf e você encontra um <b>${s}</b> (Lv ${m.lv}). Lutador contra Normal!`,m);}},
    ], red:[
      {ic:"🦥",lb:"O Slaking do pai",fn:()=>{const t=strongest();dropLvOne(t,4);return capT("O Slaking do pai",`O Norman te mostra o Slaking dele num treino... e <b>${t.species}</b> leva um Facade: <b>-4 níveis</b>.`,t);}},
      {ic:"☄️",lb:"Magma no Meteor Falls",fn:()=>{dropLvAll(2);return capT("Magma no Meteor Falls",`A Equipe Magma rouba um meteorito do Prof. Cosmo e você corre atrás deles. <b>-2 níveis</b> em todos.`,null);}},
      {ic:"💨",lb:"Fuga na Rota 104",loss:true,fn:lossEv("Fuga na Rota 104","Um bando de Taillow passa rasante e <b>{s}</b> foge assustado.","Os Taillow passam rasante, mas seu inicial nem se mexe.")},
  ]},
  /* 6 — Fortree (Winona, Voador) */
  { green:[
      {ic:"⛅",lb:"Instituto do Clima",fn:()=>{const m=addMon("Castform",28);return capT("Herói do Instituto do Clima",`Você expulsa a Aqua do Instituto e os cientistas te dão um <b>Castform</b> (Lv ${m.lv}), o Pokémon do tempo.`,m);}},
      {ic:"🐟",lb:"Feebas da Rota 119",fn:()=>{const m=addMon("Feebas",20,true);return capT("Feebas da Rota 119",`Depois de horas pescando no ponto certo do rio, um <b>Feebas</b> (Lv ${m.lv}) morde a isca. Feio agora, mas com Pokéblocos ele vira Milotic!`,m);}},
      {ic:"🌴",lb:"Tropius da Rota 119",fn:()=>{const m=addMon("Tropius",28);return capT("Tropius da Rota 119",`Um <b>Tropius</b> (Lv ${m.lv}) com frutas no pescoço pousa na sua frente.`,m);}},
      {ic:"🦴",lb:"Fósseis do deserto",fn:()=>{const s=pick(["Lileep","Anorith","Lileep","Anorith","Omanyte","Kabuto","Aerodactyl"]);const m=addMon(s,26);return capT("Fóssil revivido",`O cientista da Devon revive o fóssil que você achou no deserto: <span class="reward">${s} (Lv ${m.lv}) entrou para o time!</span>`,m);}},
      {ic:"⚡",lb:"Elétrico contra a Winona",fn:()=>{const s=pick(["Manectric","Magneton","Electabuzz"]);const m=addMon(s,28);return capT("Reforço elétrico",`Um treinador de New Mauville te troca um <b>${s}</b> (Lv ${m.lv}). Elétrico derruba os voadores da Winona!`,m);}},
      LATI_SLICE,
    ], red:[
      {ic:"🌧️",lb:"Chuva sem fim",fn:()=>{dropLvAll(2);return capT("Chuva sem fim da Rota 119",`Chove dias seguidos na mata alta. <b>-2 níveis</b> em todos.`,null);}},
      {ic:"🦎",lb:"Kecleon invisível",fn:()=>{const a=randMember(false),b=randMember(false);dropLvOne(a,3);if(b&&b!==a)dropLvOne(b,3);return capT("Kecleon invisível",`Sem o Devon Scope, um Kecleon invisível te ataca na ponte de Fortree. <b>${a.species}</b>${b&&b!==a?` e <b>${b.species}</b>`:''}: <b>-3 níveis</b>.`,a);}},
      {ic:"🌊",lb:"Correnteza da Rota 119",loss:true,fn:lossEv("Correnteza da Rota 119","Surfando contra a correnteza, <b>{s}</b> é arrastado rio abaixo.","A correnteza é forte, mas você segura seu inicial.")},
  ]},
  /* 7 — Mossdeep (Tate & Liza, Psíquico) */
  { green:[
      {ic:"⚙️",lb:"Beldum do Steven",fn:()=>{const m=addMon("Beldum",30);return capT("O presente do Steven",`Na casa do Steven em Mossdeep tem um bilhete: "Cuide bem dele". É um <b>Beldum</b> (Lv ${m.lv})!`,m);}},
      {ic:"🎀",lb:"Concurso Master",fn:()=>{const r=itemOrLv("Feebas","Pokéblocos Azuis",7);return capT("Concurso Master de Lilycove",`Você vence o Concurso Master e ganha uma caixa de Pokéblocos. ${r.text}`,r.m);}},
      {ic:"🕯️",lb:"Monte Pyre",night:true,fn:()=>{const s=pick(["Duskull","Shuppet","Chimecho"]);const m=addMon(s,30);return capT("🌙 Monte Pyre",`À noite, entre os túmulos do Monte Pyre, um <b>${s}</b> (Lv ${m.lv}) te segue.`,m);}},
      {ic:"🌑",lb:"Absol do aviso",fn:()=>{const m=addMon("Absol",30);return capT("O aviso do Absol",`Um <b>Absol</b> (Lv ${m.lv}) aparece pra avisar de um desastre... e fica pra te proteger. Sombrio vence Psíquico!`,m);}},
      LATI_SLICE,
    ], red:[
      {ic:"🌊",lb:"Esconderijo da Aqua",fn:()=>{dropLvAll(2);return capT("O esconderijo da Aqua",`Você invade a base da Aqua em Lilycove e se perde nos teleportes. <b>-2 níveis</b> em todos.`,null);}},
      {ic:"🚀",lb:"Ataque ao Centro Espacial",fn:()=>{const t=strongest();dropLvOne(t,4);return capT("Ataque ao Centro Espacial",`A Magma invade o Centro Espacial e <b>${t.species}</b> segura a linha de frente: <b>-4 níveis</b>.`,t);}},
      {ic:"🔴",lb:"Orbes roubadas",loss:true,fn:gangEv("As Orbes roubadas","No topo do Monte Pyre, a Magma rouba a Orbe Vermelha e leva <b>{s}</b> junto.")},
  ]},
  /* 8 — Sootopolis (Juan, Água) */
  { green:[
      {ic:"🌊",lb:"Kyogre ou Groudon",w:0.5,fn:()=>{const s=pick(["Kyogre","Groudon"]);const m=addMon(s,44);return capT(`O despertar de ${s}`,`${s==="Kyogre"?"Na Caverna Submarina, a chuva não para":"Na Caverna Terra, o sol queima tudo"}... e você acalma o lendário. <span class="reward">${s} (Lv ${m.lv}) entrou para o time!</span>`,m);}},
      {ic:"🐟",lb:"Relicanth do fundo",fn:()=>{const s=pick(["Relicanth","Clamperl","Chinchou"]);const m=addMon(s,34);return capT("Mergulho na Rota 128",`Com Dive você desce até o fundo do mar e encontra um <b>${s}</b> (Lv ${m.lv}).`,m);}},
      {ic:"🌿",lb:"Planta contra o Juan",fn:()=>{const s=pick(["Ludicolo","Breloom","Cacturne","Sceptile"]);const m=addMon(s,34);return capT("Reforço de planta",`O Steven te apresenta a um treinador que te troca um <b>${s}</b> (Lv ${m.lv}). Planta contra a água do Juan!`,m);}},
      {ic:"🐚",lb:"Escama do fundo do mar",fn:()=>{const r=itemOrLv("Clamperl","Dente do Mar Profundo",7);return capT("Tesouro do fundo do mar",`Um mergulhador te dá um tesouro do fundo do mar. ${r.text}`,r.m);}},
      LATI_SLICE,
    ], red:[
      {ic:"⛈️",lb:"Clima enlouquecido",fn:()=>{dropLvAll(2);return capT("Clima enlouquecido",`Sol escaldante de um lado, tempestade do outro: Hoenn está em crise. <b>-2 níveis</b> em todos.`,null);}},
      {ic:"⚔️",lb:"Archie e Maxie",fn:()=>{const t=strongest();dropLvOne(t,4);return capT("Archie e Maxie",`Os dois líderes das equipes te desafiam na Caverna Submarina. <b>${t.species}</b> sai exausto: <b>-4 níveis</b>.`,t);}},
      {ic:"🌀",lb:"Corrente submarina",loss:true,fn:lossEv("Corrente submarina","Uma corrente puxa <b>{s}</b> para o fundo do mar.","A corrente puxa forte, mas você segura seu inicial.")},
  ]},
  /* 9 — Victory Road (Ever Grande) */
  { green:[
      {ic:"🐉",lb:"Rayquaza do Pilar do Céu",w:0.5,fn:()=>{const m=addMon("Rayquaza",46);return capT("O Pilar do Céu",`No topo da torre antiga, <b>Rayquaza</b> desce das nuvens e acalma Kyogre e Groudon. <span class="reward">Rayquaza (Lv ${m.lv}) entrou para o time!</span>`,m);}},
      {ic:"🎓",lb:"Último duelo com o Wally",fn:()=>{lvlAll(7);return capT("O último duelo com o Wally",`O garoto doente do começo virou um grande treinador. Vitória linda! <span class="reward">Time +7 níveis</span>.`,null);}},
      {ic:"🍬",lb:"Rare Candy na Victory Road",fn:()=>{const t=strongest();lvlOne(t,10);return capT("Rare Candy escondido",`Atrás de uma pedra empurrada com Strength: Rare Candies! <span class="reward">${t.species} +10 níveis</span>.`,t);}},
      {ic:"🐲",lb:"Bagon do Meteor Falls",fn:()=>{const s=pick(["Bagon","Hariyama","Lairon"]);const m=addMon(s,36);return capT("Morador da caverna",`No fundo da caverna, um <b>${s}</b> (Lv ${m.lv}) testa sua força e decide te acompanhar.`,m);}},
      LATI_SLICE,
    ], red:[
      {ic:"🪨",lb:"Labirinto da Victory Road",fn:()=>{dropLvAll(2);return capT("O labirinto da Victory Road",`Escadas, cachoeiras e becos sem saída. <b>-2 níveis</b> em todos.`,null);}},
      {ic:"💪",lb:"Hariyama selvagem",fn:()=>{const t=strongest();dropLvOne(t,4);return capT("Hariyama selvagem",`Um Hariyama bloqueia a ponte e <b>${t.species}</b> te defende: <b>-4 níveis</b>.`,t);}},
      {ic:"⛏️",lb:"Desmoronamento",loss:true,fn:lossEv("Desmoronamento","O teto da caverna cede e <b>{s}</b> fica do outro lado dos escombros.","O teto cede, mas você e seu inicial escapam por pouco.")},
  ]},
  /* 10 — Meteor Falls (pós-Liga, 3 decisões antes do Steven) */
  { green:[
      {ic:"🗿",lb:"Os três Regis",w:0.6,fn:()=>{const s=pick(["Regirock","Regice","Registeel"]);const m=addMon(s,44);return capT("A câmara selada",`Você decifra o braile da câmara antiga e a porta se abre. <span class="reward">${s} (Lv ${m.lv}) entrou para o time!</span>`,m);}},
      {ic:"⭐",lb:"Jirachi do desejo",w:0.3,fn:()=>{const m=addMon("Jirachi",44);return capT("O desejo de mil anos",`Uma estrela cai perto de você e acorda <b>Jirachi</b>, o Pokémon dos desejos. <span class="reward">Jirachi (Lv ${m.lv}) entrou para o time!</span>`,m);}},
      {ic:"🧬",lb:"Deoxys da Birth Island",w:0.3,fn:()=>{const m=addMon("Deoxys",44);return capT("Birth Island",`Um triângulo de pedra brilha numa ilha esquecida... e um vírus do espaço toma forma. <span class="reward">Deoxys (Lv ${m.lv}) entrou para o time!</span>`,m);}},
      {ic:"🏯",lb:"Battle Frontier",fn:()=>{lvlAll(7);return capT("Battle Frontier",`Você enfrenta os Cérebros da Fronteira um por um. <span class="reward">Time +7 níveis</span>.`,null);}},
      {ic:"🎁",lb:"Presente dos professores",fn:()=>{const s=pick(["Bulbasaur","Charmander","Squirtle","Chikorita","Cyndaquil","Totodile"]);const m=addMon(s,40);return capT("Presente dos professores",`O Prof. Carvalho e o Prof. Elm mandam um presente pro novo Campeão: <b>${s}</b> (Lv ${m.lv}).`,m);}},
      {ic:"✨",lb:"Lendas de outras regiões",w:0.5,fn:()=>{const s=pick(["Articuno","Zapdos","Moltres","Raikou","Entei","Suicune","Lugia","Ho-Oh","Mewtwo","Mew","Celebi"]);const m=addMon(s,44);return capT("Lendas de outras regiões",`Notícias de Kanto e Johto chegam pelo PokéNav... e você vai atrás. <span class="reward">${s} (Lv ${m.lv}) entrou para o time!</span>`,m);}},
      LATI_SLICE,
    ], red:[
      {ic:"💧",lb:"Cachoeiras do Meteor Falls",fn:()=>{dropLvAll(2);return capT("As cachoeiras",`Subir as cachoeiras com Waterfall cansa todo mundo. <b>-2 níveis</b> no time.`,null);}},
      {ic:"🐉",lb:"Salamence furioso",fn:()=>{const t=strongest();dropLvOne(t,4);return capT("Salamence furioso",`Um Salamence selvagem desce rugindo e <b>${t.species}</b> te defende: <b>-4 níveis</b>.`,t);}},
      {ic:"☄️",lb:"Queda de meteoro",loss:true,fn:lossEv("Queda de meteoro","Um meteorito despenca na caverna e <b>{s}</b> some na poeira.","Um meteorito cai perto, mas você e seu inicial escapam.")},
  ]},
].map(set=>{ set.green.splice(Math.min(3,set.green.length),0,{ic:"💎",lb:"Pedra evolutiva",fn:stoneEvent}); return set; }); }

const H_WHEEL_ICON = {
  "Resgate do Prof. Birch":"T:h_birch","Ralts da Rota 102":"P:Ralts","Shroomish da Floresta":"P:Shroomish","Lotad do lago":"P:Lotad",
  "Poochyena da Rota 101":"P:Poochyena","Capanga Aqua na floresta":"T:h_aquagrunt","Túnel Rusturf":"P:Whismur",
  "Carta para o Steven":"T:h_steven","Wingull do Mr. Briney":"P:Wingull","Sableye da Granite Cave":"P:Sableye","Aron da caverna":"P:Aron",
  "Escuridão na Granite Cave":"P:Zubat","Aquecimento do Brawly":"T:h_brawly","Mar agitado":"T:h_sailor",
  "Bicicleta do Rydel":"T:h_acetrainer","Electrike da Rota 110":"P:Electrike","Plusle e Minun":"P:Plusle","Barragem de Mauville":"P:Trapinch",
  "Aqua no Museu Oceânico":"T:h_aquagrunt","Pane em New Mauville":"P:Voltorb","Capanga Aqua em Slateport":"T:h_aquagrunt",
  "Ovo das termas":"P:Wynaut","Herói do Monte Chimney":"T:h_maxie","Trapinch do deserto":"P:Baltoy","Águas termais":"T:h_beauty",
  "Cinzas da Rota 113":"P:Skarmory","Fiery Path":"P:Torkoal","Emboscada Magma":"T:h_magmagrunt",
  "Ovo da Creche":"P:Azurill","Conselho do pai":"T:h_norman","Zangoose ou Seviper":"P:Zangoose","Makuhita do Wally":"T:h_wally",
  "O Slaking do pai":"P:Slaking","Magma no Meteor Falls":"T:h_magmagrunt","Fuga na Rota 104":"P:Taillow",
  "Instituto do Clima":"P:Castform","Feebas da Rota 119":"P:Feebas","Tropius da Rota 119":"P:Tropius","Fósseis do deserto":"P:Lileep","Elétrico contra a Winona":"P:Manectric",
  "Chuva sem fim":"P:Pelipper","Kecleon invisível":"P:Kecleon","Correnteza da Rota 119":"T:h_fisherman",
  "Beldum do Steven":"P:Beldum","Concurso Master":"P:Milotic","Monte Pyre":"P:Duskull","Absol do aviso":"P:Absol",
  "Esconderijo da Aqua":"T:h_archie","Ataque ao Centro Espacial":"T:h_magmagrunt","Orbes roubadas":"T:h_maxie",
  "Kyogre ou Groudon":"P:Kyogre","Relicanth do fundo":"P:Relicanth","Planta contra o Juan":"P:Ludicolo","Escama do fundo do mar":"P:Clamperl",
  "Clima enlouquecido":"P:Groudon","Archie e Maxie":"T:h_archie","Corrente submarina":"P:Wailord",
  "Rayquaza do Pilar do Céu":"P:Rayquaza","Último duelo com o Wally":"T:h_wally","Rare Candy na Victory Road":"P:Chansey","Bagon do Meteor Falls":"P:Bagon",
  "Labirinto da Victory Road":"T:h_hiker","Hariyama selvagem":"P:Hariyama","Desmoronamento":"P:Onix",
  "Os três Regis":"P:Regirock","Jirachi do desejo":"P:Jirachi","Deoxys da Birth Island":"P:Deoxys","Battle Frontier":"T:h_expert",
  "Presente dos professores":"P:Treecko","Lendas de outras regiões":"P:Lugia",
  "Cachoeiras do Meteor Falls":"P:Golbat","Salamence furioso":"P:Salamence","Queda de meteoro":"P:Solrock",
  "Dragão errante":"P:Latias",
};
