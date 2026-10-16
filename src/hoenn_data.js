/* =====================================================================
   PACOTE HOENN — dados (carregado sob demanda: hoenn.js, depois de johto.js)
   Usa a Pokédex e as regras de Johto como base e acrescenta a Gen 3 (252-386).
   Base de poder na mesma escala: básico ~5-10, meio ~14, final ~19-24, pseudo-lendário 27, lendário 30+.
   ===================================================================== */
(function(){
"use strict";
const J = REGIONS.johto;

/* ---------- Pokédex 252-386: [nº, nome, tipo, poder, evolui_para, nível] (99 = pedra/item/troca) ---------- */
const GEN3 = [
 [252,"Treecko","grass",9,"Grovyle",16],[253,"Grovyle","grass",14,"Sceptile",36],[254,"Sceptile","grass",22,null,0],
 [255,"Torchic","fire",9,"Combusken",16],[256,"Combusken","fire",14,"Blaziken",36],[257,"Blaziken","fire",23,null,0],
 [258,"Mudkip","water",9,"Marshtomp",16],[259,"Marshtomp","water",14,"Swampert",36],[260,"Swampert","water",23,null,0],
 [261,"Poochyena","dark",5,"Mightyena",18],[262,"Mightyena","dark",13,null,0],
 [263,"Zigzagoon","normal",4,"Linoone",20],[264,"Linoone","normal",12,null,0],
 [265,"Wurmple","bug",3,"Silcoon",7],[266,"Silcoon","bug",5,"Beautifly",10],[267,"Beautifly","bug",11,null,0],
 [268,"Cascoon","bug",5,"Dustox",10],[269,"Dustox","bug",11,null,0],
 [270,"Lotad","water",5,"Lombre",14],[271,"Lombre","water",11,"Ludicolo",99],[272,"Ludicolo","water",19,null,0],
 [273,"Seedot","grass",5,"Nuzleaf",14],[274,"Nuzleaf","grass",11,"Shiftry",99],[275,"Shiftry","dark",19,null,0],
 [276,"Taillow","flying",5,"Swellow",22],[277,"Swellow","flying",15,null,0],
 [278,"Wingull","water",6,"Pelipper",25],[279,"Pelipper","flying",15,null,0],
 [280,"Ralts","psychic",6,"Kirlia",20],[281,"Kirlia","psychic",12,"Gardevoir",30],[282,"Gardevoir","psychic",21,null,0],
 [283,"Surskit","bug",6,"Masquerain",22],[284,"Masquerain","bug",14,null,0],
 [285,"Shroomish","grass",6,"Breloom",23],[286,"Breloom","fighting",18,null,0],
 [287,"Slakoth","normal",7,"Vigoroth",18],[288,"Vigoroth","normal",14,"Slaking",36],[289,"Slaking","normal",24,null,0],
 [290,"Nincada","bug",5,"Ninjask",20],[291,"Ninjask","bug",14,null,0],[292,"Shedinja","ghost",12,null,0],
 [293,"Whismur","normal",4,"Loudred",20],[294,"Loudred","normal",11,"Exploud",40],[295,"Exploud","normal",19,null,0],
 [296,"Makuhita","fighting",7,"Hariyama",24],[297,"Hariyama","fighting",19,null,0],
 [298,"Azurill","normal",4,null,0],[299,"Nosepass","rock",13,null,0],
 [300,"Skitty","normal",6,"Delcatty",99],[301,"Delcatty","normal",15,null,0],
 [302,"Sableye","dark",14,null,0],[303,"Mawile","steel",14,null,0],
 [304,"Aron","steel",7,"Lairon",32],[305,"Lairon","steel",14,"Aggron",42],[306,"Aggron","steel",22,null,0],
 [307,"Meditite","fighting",7,"Medicham",37],[308,"Medicham","fighting",17,null,0],
 [309,"Electrike","electric",7,"Manectric",26],[310,"Manectric","electric",17,null,0],
 [311,"Plusle","electric",13,null,0],[312,"Minun","electric",13,null,0],
 [313,"Volbeat","bug",13,null,0],[314,"Illumise","bug",13,null,0],[315,"Roselia","grass",14,null,0],
 [316,"Gulpin","poison",6,"Swalot",26],[317,"Swalot","poison",16,null,0],
 [318,"Carvanha","water",7,"Sharpedo",30],[319,"Sharpedo","dark",17,null,0],
 [320,"Wailmer","water",9,"Wailord",40],[321,"Wailord","water",19,null,0],
 [322,"Numel","fire",7,"Camerupt",33],[323,"Camerupt","ground",17,null,0],
 [324,"Torkoal","fire",16,null,0],
 [325,"Spoink","psychic",7,"Grumpig",32],[326,"Grumpig","psychic",16,null,0],
 [327,"Spinda","normal",10,null,0],
 [328,"Trapinch","ground",7,"Vibrava",35],[329,"Vibrava","ground",13,"Flygon",45],[330,"Flygon","dragon",21,null,0],
 [331,"Cacnea","grass",7,"Cacturne",32],[332,"Cacturne","grass",16,null,0],
 [333,"Swablu","flying",6,"Altaria",35],[334,"Altaria","dragon",18,null,0],
 [335,"Zangoose","normal",15,null,0],[336,"Seviper","poison",15,null,0],
 [337,"Lunatone","rock",16,null,0],[338,"Solrock","rock",16,null,0],
 [339,"Barboach","water",6,"Whiscash",30],[340,"Whiscash","ground",15,null,0],
 [341,"Corphish","water",7,"Crawdaunt",30],[342,"Crawdaunt","dark",16,null,0],
 [343,"Baltoy","ground",7,"Claydol",36],[344,"Claydol","psychic",17,null,0],
 [345,"Lileep","rock",9,"Cradily",40],[346,"Cradily","rock",18,null,0],
 [347,"Anorith","rock",9,"Armaldo",40],[348,"Armaldo","bug",18,null,0],
 [349,"Feebas","water",3,"Milotic",99],[350,"Milotic","water",22,null,0],
 [351,"Castform","normal",13,null,0],[352,"Kecleon","normal",14,null,0],
 [353,"Shuppet","ghost",6,"Banette",37],[354,"Banette","ghost",16,null,0],
 [355,"Duskull","ghost",6,"Dusclops",37],[356,"Dusclops","ghost",15,null,0],
 [357,"Tropius","grass",15,null,0],[358,"Chimecho","psychic",14,null,0],[359,"Absol","dark",18,null,0],
 [360,"Wynaut","psychic",4,"Wobbuffet",15],
 [361,"Snorunt","ice",6,"Glalie",42],[362,"Glalie","ice",17,null,0],
 [363,"Spheal","ice",6,"Sealeo",32],[364,"Sealeo","ice",13,"Walrein",44],[365,"Walrein","ice",20,null,0],
 [366,"Clamperl","water",7,"Huntail",99],[367,"Huntail","water",17,null,0],[368,"Gorebyss","water",17,null,0],
 [369,"Relicanth","rock",16,null,0],[370,"Luvdisc","water",8,null,0],
 [371,"Bagon","dragon",9,"Shelgon",30],[372,"Shelgon","dragon",15,"Salamence",50],[373,"Salamence","dragon",27,null,0],
 [374,"Beldum","steel",9,"Metang",20],[375,"Metang","steel",15,"Metagross",45],[376,"Metagross","steel",27,null,0],
 [377,"Regirock","rock",30,null,0],[378,"Regice","ice",30,null,0],[379,"Registeel","steel",30,null,0],
 [380,"Latias","dragon",32,null,0],[381,"Latios","dragon",32,null,0],
 [382,"Kyogre","water",38,null,0],[383,"Groudon","ground",38,null,0],[384,"Rayquaza","dragon",40,null,0],
 [385,"Jirachi","steel",32,null,0],[386,"Deoxys","psychic",34,null,0],
];
const EMO = {grass:"🌿",fire:"🔥",water:"💧",normal:"⚪",flying:"🪶",bug:"🐛",poison:"☠️",electric:"⚡",psychic:"🔮",rock:"🪨",ground:"⛰️",ghost:"👻",ice:"🧊",fighting:"🥊",dragon:"🐉",dark:"🌑",steel:"⚙️"};

const DEX = {};
for(const k in J.DEX) DEX[k] = Object.assign({}, J.DEX[k]);
GEN3.forEach(([n,name,t,base,evo,lv])=>{ DEX[name] = evo ? {t,e:EMO[t],base,evo,evoLv:lv} : {t,e:EMO[t],base,evo:null}; });
const STONE = Object.assign({}, J.STONE, {Lombre:"Pedra da Água", Nuzleaf:"Pedra da Folha", Skitty:"Pedra da Lua",
  Feebas:"Pokéblocos Azuis (beleza)", Clamperl:"troca"});
const BRANCH = Object.assign({}, J.BRANCH, {Wurmple:["Silcoon","Cascoon"], Clamperl:["Huntail","Gorebyss"]});
/* amizade (herdada de Johto) + Azurill vira Marill */
DEX.Azurill.friend = "Marill";

const TYPE_CHART = J.TYPE_CHART;   // a Gen 3 usa a mesma tabela da Gen 2

const GYMS = [
  {n:1,leader:"Roxanne",t:"rock",e:"🪨",b:"🪨",power:16},
  {n:2,leader:"Brawly",t:"fighting",e:"🥊",b:"👊",power:48},
  {n:3,leader:"Wattson",t:"electric",e:"⚡",b:"⚡",power:106},
  {n:4,leader:"Flannery",t:"fire",e:"🔥",b:"🔥",power:158},
  {n:5,leader:"Norman",t:"normal",e:"⚪",b:"⚖️",power:189},
  {n:6,leader:"Winona",t:"flying",e:"🪶",b:"🪶",power:275},
  {n:7,leader:"Tate & Liza",t:"psychic",e:"🔮",b:"🧠",power:279},
  {n:8,leader:"Juan",t:"water",e:"💧",b:"💧",power:366},
];
const ELITE = [
  {leader:"Sidney",t:"dark",e:"🌑",power:296},
  {leader:"Phoebe",t:"ghost",e:"👻",power:348},
  {leader:"Glacia",t:"ice",e:"🧊",power:474},
  {leader:"Drake",t:"dragon",e:"🐉",power:357},
  {leader:"Wallace",t:"water",e:"💧",power:604},
];
const STARTERS = ["Treecko","Torchic","Mudkip"];
const SPECIAL = new Set([...[
  "Pichu","Cleffa","Igglybuff","Togepi","Tyrogue","Smoochum","Elekid","Magby","Azurill","Wynaut",
  "Raikou","Entei","Suicune","Lugia","Ho-Oh","Celebi","Articuno","Zapdos","Moltres","Mewtwo","Mew",
  "Regirock","Regice","Registeel","Latias","Latios","Kyogre","Groudon","Rayquaza","Jirachi","Deoxys",
  "Omanyte","Kabuto","Aerodactyl","Lileep","Anorith","Beldum","Shedinja","Castform",
  "Bulbasaur","Charmander","Squirtle","Chikorita","Cyndaquil","Totodile","Treecko","Torchic","Mudkip","Ovo"]]);
const targets = new Set(); for(const k in DEX){ if(DEX[k].evo) targets.add(DEX[k].evo); } for(const k in BRANCH) BRANCH[k].forEach(x=>targets.add(x));
const DEX_LIST = J.DEX_LIST.concat(GEN3.map(r=>[r[0], r[1]]));
/* na grama: os de Hoenn aparecem 3x mais que os de Kanto/Johto (mas todos podem aparecer, pra fechar a Pokédex) */
const wildOk = s=>!targets.has(s) && !SPECIAL.has(s);
const H_WILD = GEN3.map(r=>r[1]).filter(wildOk);
const WILD_POOL = J.DEX_LIST.map(r=>r[1]).filter(wildOk).concat(H_WILD, H_WILD, H_WILD);

/* times de Emerald; os níveis são ajustados até a soma bater no poder calibrado (o Steven é o desafio pós-Liga) */
const STEVEN = {leader:"Steven", t:"steel", e:"💎", power:615};
const H_TEAMS = {
  Roxanne:[["Geodude",12],["Geodude",12],["Nosepass",15]], Brawly:[["Machop",16],["Meditite",16],["Makuhita",19]],
  Wattson:[["Voltorb",20],["Electrike",20],["Magneton",22],["Manectric",24]], Flannery:[["Numel",24],["Slugma",24],["Camerupt",26],["Torkoal",29]],
  Norman:[["Spinda",27],["Vigoroth",27],["Linoone",29],["Slaking",31]], Winona:[["Swablu",29],["Tropius",29],["Pelipper",30],["Skarmory",31],["Altaria",33]],
  "Tate & Liza":[["Claydol",39],["Xatu",41],["Lunatone",42],["Solrock",42]], Juan:[["Luvdisc",41],["Whiscash",41],["Sealeo",43],["Crawdaunt",43],["Kingdra",46]],
  Sidney:[["Mightyena",46],["Shiftry",48],["Cacturne",46],["Crawdaunt",48],["Absol",49]],
  Phoebe:[["Dusclops",48],["Banette",49],["Sableye",50],["Banette",49],["Dusclops",51]],
  Glacia:[["Sealeo",50],["Glalie",50],["Sealeo",52],["Glalie",52],["Walrein",53]],
  Drake:[["Shelgon",52],["Altaria",54],["Flygon",53],["Flygon",53],["Salamence",55]],
  Wallace:[["Wailord",57],["Tentacruel",55],["Ludicolo",56],["Whiscash",56],["Gyarados",56],["Milotic",58]],
  Steven:[["Skarmory",77],["Claydol",75],["Aggron",76],["Cradily",76],["Armaldo",76],["Metagross",78]],
};
assignFoeTeams(GYMS.concat(ELITE,[STEVEN]), H_TEAMS, DEX);

REGIONS.hoenn = Object.assign(REGIONS.hoenn, {
  ready:true, DEX, BRANCH, STONE, STARTERS, WILD_POOL, TYPE_CHART, GYMS, ELITE,
  GYM_EVENTS: HOENN_EVENTS(), CITY:["Rustboro","Dewford","Mauville","Lavaridge","Petalburg","Fortree","Mossdeep","Sootopolis"],
  BADGE_NAMES:["Insígnia Pedra","Insígnia Punho","Insígnia Dínamo","Insígnia Calor","Insígnia Equilíbrio","Insígnia Pluma","Insígnia Mente","Insígnia Chuva"],
  LEADER_LINES:[
    "Então foi assim que eu perdi... Vou estudar mais. Essa insígnia é sua.",
    "Uau, que onda! Você surfou por cima do meu time. Mereceu!",
    "Wahahahah! Tô eletrizado! Leva a insígnia, garoto!",
    "Ai, que vergonha... Mas você esquentou de verdade. Toma a insígnia!",
    "...Você cresceu. Seu pai está orgulhoso. A insígnia é sua.",
    "Você voou mais alto que todos nós. Que lindo...",
    "Nós previmos isso... juntos! A Insígnia Mente é sua.",
    "Sua batalha foi uma obra de arte. Você é digno da Insígnia Chuva.",
  ],
  BADGES: H_BADGES, DEX_LIST, WHEEL_ICON: H_WHEEL_ICON,
  REC_KEY:"kc_carreira_hoenn_v1", SAVE_KEY:"kc_carreira_hoenn_save_v1", DEX_KEY:"kc_carreira_hoenn_dex_v1",
  RED: STEVEN,
});
Object.assign(REGIONS.hoenn.RT, {
  dayNight:true, silver:true,
  stoneHint:"Pikachu, Eevee, Lombre, Nuzleaf, Skitty, Feebas (Pokéblocos), Clamperl (troca) e os de Kanto e Johto evoluem com pedra ou item.",
  champBattle:"O CAMPEÃO WALLACE quer batalhar!", champIntro:"A última porta. O Campeão Wallace te espera na sala de cristal.\n\"Deixe-me ver a elegância do seu time.\"",
  hofLine:"Wallace sorri: \"Hoenn tem um novo Campeão.\"\nSeu time entra para o Hall da Fama!",
  loseLine:"Em Hoenn não existe revanche oficial: a carreira termina aqui.",
  post:{place:"Meteor Falls", ic:"🌠", who:"o Steven", Who:"O Steven", badge:"💎",
    top:"No fundo do Meteor Falls, um treinador de terno examina uma pedra brilhante. É o Steven, o ex-Campeão.",
    road:"Meteor Falls: a caverna onde os meteoros caíram. Faltam {n} decisões até o fundo.",
    battle:"O ex-Campeão Steven quer batalhar!\n\"Vamos ver se você é tão forte quanto dizem.\"",
    win:"Steven guarda a pedra no bolso e ri.\n\"Você é o treinador mais forte que eu já enfrentei.\"\nVocê é a lenda de Hoenn!",
    lose:"O Metagross do Steven não deu chance. Ele aperta sua mão: o seu título de Campeão ninguém tira.",
    climb:"Opcional: 3 decisões na caverna e o Steven no fundo"},
});
})();
