/* =====================================================================
   PACOTE JOHTO — dados (carregado sob demanda: johto.js)
   Base de poder segue a escala de Kanto: básico ~6-10, meio ~14, final ~19-23, lendário 30+.
   ===================================================================== */
(function(){
"use strict";
const K = REGIONS.kanto;

/* ---------- Pokédex 152-251: [nº, nome, tipo, poder, evolui_para, nível] ----------
   nível 99 = pedra/item de troca (evento 💎). Amizade fica em FRIEND, abaixo. */
const GEN2 = [
 [152,"Chikorita","grass",9,"Bayleef",16],[153,"Bayleef","grass",14,"Meganium",32],[154,"Meganium","grass",21,null,0],
 [155,"Cyndaquil","fire",9,"Quilava",14],[156,"Quilava","fire",14,"Typhlosion",36],[157,"Typhlosion","fire",23,null,0],
 [158,"Totodile","water",9,"Croconaw",18],[159,"Croconaw","water",14,"Feraligatr",30],[160,"Feraligatr","water",22,null,0],
 [161,"Sentret","normal",5,"Furret",15],[162,"Furret","normal",12,null,0],
 [163,"Hoothoot","flying",6,"Noctowl",20],[164,"Noctowl","flying",15,null,0],
 [165,"Ledyba","bug",5,"Ledian",18],[166,"Ledian","bug",12,null,0],
 [167,"Spinarak","bug",6,"Ariados",22],[168,"Ariados","bug",14,null,0],
 [169,"Crobat","poison",21,null,0],
 [170,"Chinchou","water",8,"Lanturn",27],[171,"Lanturn","water",18,null,0],
 [172,"Pichu","electric",6,null,0],[173,"Cleffa","normal",5,null,0],[174,"Igglybuff","normal",4,null,0],
 [175,"Togepi","normal",6,null,0],[176,"Togetic","flying",17,null,0],
 [177,"Natu","psychic",7,"Xatu",25],[178,"Xatu","psychic",17,null,0],
 [179,"Mareep","electric",7,"Flaaffy",15],[180,"Flaaffy","electric",13,"Ampharos",30],[181,"Ampharos","electric",21,null,0],
 [182,"Bellossom","grass",20,null,0],
 [183,"Marill","water",7,"Azumarill",18],[184,"Azumarill","water",16,null,0],
 [185,"Sudowoodo","rock",16,null,0],[186,"Politoed","water",22,null,0],
 [187,"Hoppip","grass",5,"Skiploom",18],[188,"Skiploom","grass",11,"Jumpluff",27],[189,"Jumpluff","grass",17,null,0],
 [190,"Aipom","normal",11,null,0],
 [191,"Sunkern","grass",4,"Sunflora",99],[192,"Sunflora","grass",16,null,0],
 [193,"Yanma","bug",12,null,0],
 [194,"Wooper","water",6,"Quagsire",20],[195,"Quagsire","ground",17,null,0],
 [196,"Espeon","psychic",23,null,0],[197,"Umbreon","dark",22,null,0],
 [198,"Murkrow","dark",12,null,0],[199,"Slowking","water",21,null,0],[200,"Misdreavus","ghost",14,null,0],
 [201,"Unown","psychic",8,null,0],[202,"Wobbuffet","psychic",16,null,0],[203,"Girafarig","normal",15,null,0],
 [204,"Pineco","bug",7,"Forretress",31],[205,"Forretress","steel",19,null,0],
 [206,"Dunsparce","normal",13,null,0],[207,"Gligar","ground",14,null,0],[208,"Steelix","steel",22,null,0],
 [209,"Snubbull","normal",8,"Granbull",23],[210,"Granbull","normal",17,null,0],
 [211,"Qwilfish","water",14,null,0],[212,"Scizor","steel",23,null,0],[213,"Shuckle","bug",13,null,0],
 [214,"Heracross","bug",20,null,0],[215,"Sneasel","dark",15,null,0],
 [216,"Teddiursa","normal",8,"Ursaring",30],[217,"Ursaring","normal",21,null,0],
 [218,"Slugma","fire",7,"Magcargo",38],[219,"Magcargo","fire",16,null,0],
 [220,"Swinub","ice",6,"Piloswine",33],[221,"Piloswine","ice",18,null,0],
 [222,"Corsola","water",13,null,0],
 [223,"Remoraid","water",7,"Octillery",25],[224,"Octillery","water",17,null,0],
 [225,"Delibird","ice",12,null,0],[226,"Mantine","water",17,null,0],[227,"Skarmory","steel",18,null,0],
 [228,"Houndour","dark",9,"Houndoom",24],[229,"Houndoom","dark",21,null,0],
 [230,"Kingdra","dragon",23,null,0],
 [231,"Phanpy","ground",8,"Donphan",25],[232,"Donphan","ground",20,null,0],
 [233,"Porygon2","normal",21,null,0],[234,"Stantler","normal",15,null,0],[235,"Smeargle","normal",9,null,0],
 [236,"Tyrogue","fighting",7,"Hitmonlee",20],[237,"Hitmontop","fighting",18,null,0],
 [238,"Smoochum","ice",6,"Jynx",30],[239,"Elekid","electric",7,"Electabuzz",30],[240,"Magby","fire",7,"Magmar",30],
 [241,"Miltank","normal",18,null,0],[242,"Blissey","normal",22,null,0],
 [243,"Raikou","electric",30,null,0],[244,"Entei","fire",30,null,0],[245,"Suicune","water",30,null,0],
 [246,"Larvitar","rock",9,"Pupitar",30],[247,"Pupitar","rock",15,"Tyranitar",55],[248,"Tyranitar","dark",27,null,0],
 [249,"Lugia","psychic",38,null,0],[250,"Ho-Oh","fire",38,null,0],[251,"Celebi","grass",32,null,0],
];
const EMO = {grass:"🌿",fire:"🔥",water:"💧",normal:"⚪",flying:"🪶",bug:"🐛",poison:"☠️",electric:"⚡",psychic:"🔮",rock:"🪨",ground:"⛰️",ghost:"👻",ice:"🧊",fighting:"🥊",dragon:"🐉",dark:"🌑",steel:"⚙️"};

const DEX = {};
for(const k in K.DEX) DEX[k] = Object.assign({}, K.DEX[k]);
GEN2.forEach(([n,name,t,base,evo,lv])=>{ DEX[name] = evo ? {t,e:EMO[t],base,evo,evoLv:lv} : {t,e:EMO[t],base,evo:null}; });
/* Gen 1 que ganham evolução em Johto (itens de troca / pedra do sol) */
const ITEM = (sp,to,how)=>{ DEX[sp].evo=to; DEX[sp].evoLv=99; STONE[sp]=how; };
const STONE = Object.assign({}, K.STONE, {Sunkern:"Pedra do Sol", Gloom:"Pedra da Folha ou do Sol", Poliwhirl:"Pedra da Água ou King's Rock"});
ITEM("Onix","Steelix","Metal Coat"); ITEM("Scyther","Scizor","Metal Coat");
ITEM("Seadra","Kingdra","Dragon Scale"); ITEM("Porygon","Porygon2","Up-Grade");
const BRANCH = Object.assign({}, K.BRANCH, {
  Gloom:["Vileplume","Bellossom"], Poliwhirl:["Poliwrath","Politoed"], Slowpoke:["Slowbro","Slowking"],
  Tyrogue:["Hitmonlee","Hitmonchan","Hitmontop"],
});
/* amizade: ao encher o coração, evolui (Eevee depende da hora) */
const FRIEND = {Golbat:"Crobat", Chansey:"Blissey", Pichu:"Pikachu", Cleffa:"Clefairy", Igglybuff:"Jigglypuff", Togepi:"Togetic", Eevee:"Espeon|Umbreon"};
for(const sp in FRIEND) DEX[sp].friend = FRIEND[sp];
DEX["Ovo"] = {t:"normal", e:"🥚", base:0, evo:null};

/* ---------- tabela de tipos da Gen 2 (Sombrio e Aço; Inseto x Veneno corrigido) ---------- */
const TYPE_CHART = {
  fire:    {grass:2, ice:2, bug:2, steel:2, water:.5, rock:.5, fire:.5, dragon:.5},
  water:   {fire:2, ground:2, rock:2, water:.5, grass:.5, dragon:.5},
  grass:   {water:2, ground:2, rock:2, fire:.5, grass:.5, poison:.5, flying:.5, bug:.5, dragon:.5, steel:.5},
  electric:{water:2, flying:2, electric:.5, grass:.5, dragon:.5, ground:0},
  ice:     {grass:2, ground:2, flying:2, dragon:2, water:.5, ice:.5, fire:.5, steel:.5},
  fighting:{normal:2, rock:2, ice:2, dark:2, steel:2, poison:.5, flying:.5, psychic:.5, bug:.5, ghost:0},
  poison:  {grass:2, poison:.5, ground:.5, rock:.5, ghost:.5, steel:0},
  ground:  {fire:2, electric:2, poison:2, rock:2, steel:2, grass:.5, bug:.5, flying:0},
  flying:  {grass:2, fighting:2, bug:2, electric:.5, rock:.5, steel:.5},
  psychic: {fighting:2, poison:2, psychic:.5, steel:.5, dark:0},
  bug:     {grass:2, psychic:2, dark:2, fire:.5, fighting:.5, flying:.5, ghost:.5, poison:.5, steel:.5},
  rock:    {fire:2, ice:2, flying:2, bug:2, fighting:.5, ground:.5, steel:.5},
  ghost:   {ghost:2, psychic:2, normal:0, dark:.5, steel:.5},
  dragon:  {dragon:2, steel:.5},
  normal:  {rock:.5, ghost:0, steel:.5},
  dark:    {psychic:2, ghost:2, fighting:.5, dark:.5, steel:.5},
  steel:   {ice:2, rock:2, fire:.5, water:.5, electric:.5, steel:.5},
};

const GYMS = [
  {n:1,leader:"Falkner",t:"flying",e:"🪶",b:"🪶",power:9},
  {n:2,leader:"Bugsy",t:"bug",e:"🐛",b:"🐞",power:55},
  {n:3,leader:"Whitney",t:"normal",e:"🐄",b:"⚪",power:87},
  {n:4,leader:"Morty",t:"ghost",e:"👻",b:"🌫️",power:121},
  {n:5,leader:"Chuck",t:"fighting",e:"🥊",b:"🌊",power:152},
  {n:6,leader:"Jasmine",t:"steel",e:"⚙️",b:"🔩",power:210},
  {n:7,leader:"Pryce",t:"ice",e:"🧊",b:"❄️",power:317},
  {n:8,leader:"Clair",t:"dragon",e:"🐉",b:"🐲",power:321},
];
const ELITE = [
  {leader:"Will",t:"psychic",e:"🔮",power:365},
  {leader:"Koga",t:"poison",e:"☠️",power:369},
  {leader:"Bruno",t:"fighting",e:"🥊",power:413},
  {leader:"Karen",t:"dark",e:"🌑",power:477},
  {leader:"Lance",t:"dragon",e:"🐉",power:481},
];
const STARTERS = ["Chikorita","Cyndaquil","Totodile"];
const SPECIAL = new Set(["Pichu","Cleffa","Igglybuff","Togepi","Tyrogue","Smoochum","Elekid","Magby",
  "Raikou","Entei","Suicune","Lugia","Ho-Oh","Celebi","Articuno","Zapdos","Moltres","Mewtwo","Mew",
  "Omanyte","Kabuto","Aerodactyl","Bulbasaur","Charmander","Squirtle","Chikorita","Cyndaquil","Totodile","Ovo"]);
const targets = new Set(); for(const k in DEX){ if(DEX[k].evo) targets.add(DEX[k].evo); } for(const k in BRANCH) BRANCH[k].forEach(x=>targets.add(x));
const DEX_LIST = K.DEX_LIST.concat(GEN2.map(r=>[r[0], r[1]]));
const WILD_POOL = DEX_LIST.map(r=>r[1]).filter(s=>!targets.has(s) && !SPECIAL.has(s));
/* times dos líderes de Johto (HeartGold/SoulSilver) e do Red; níveis ajustados até a soma bater no poder calibrado */
const RED = {leader:"Red", t:"electric", e:"🧢", power:814};
const J_TEAMS = {
  Falkner:[["Pidgey",9],["Pidgeotto",13]], Bugsy:[["Metapod",15],["Kakuna",15],["Scyther",17]],
  Whitney:[["Clefairy",17],["Miltank",19]], Morty:[["Gastly",21],["Haunter",21],["Gengar",25],["Haunter",23]],
  Chuck:[["Primeape",27],["Poliwrath",30]], Jasmine:[["Magnemite",30],["Magnemite",30],["Steelix",35]],
  Pryce:[["Seel",30],["Dewgong",32],["Piloswine",34]], Clair:[["Dragonair",38],["Dragonair",38],["Dragonair",38],["Kingdra",41]],
  Will:[["Xatu",40],["Jynx",41],["Exeggutor",41],["Slowbro",41],["Xatu",42]],
  Koga:[["Ariados",40],["Venomoth",41],["Forretress",43],["Muk",42],["Crobat",44]],
  Bruno:[["Hitmontop",42],["Hitmonlee",42],["Hitmonchan",42],["Onix",43],["Machamp",46]],
  Karen:[["Umbreon",42],["Vileplume",42],["Gengar",45],["Murkrow",44],["Houndoom",47]],
  Lance:[["Gyarados",44],["Dragonite",47],["Dragonite",47],["Aerodactyl",46],["Charizard",46],["Dragonite",50]],
  Red:[["Pikachu",88],["Espeon",73],["Snorlax",75],["Venusaur",77],["Charizard",77],["Blastoise",77]],
};
assignFoeTeams(GYMS.concat(ELITE,[RED]), J_TEAMS, DEX);

REGIONS.johto = Object.assign(REGIONS.johto, {
  ready:true, DEX, BRANCH, STONE, STARTERS, WILD_POOL, TYPE_CHART, GYMS, ELITE,
  GYM_EVENTS: JOHTO_EVENTS(), CITY:["Violet","Azalea","Goldenrod","Ecruteak","Cianwood","Olivine","Mahogany","Blackthorn"],
  BADGE_NAMES:["Insígnia Zéfiro","Insígnia Colmeia","Insígnia Planície","Insígnia Névoa","Insígnia Tempestade","Insígnia Mineral","Insígnia Glacial","Insígnia Ascensão"],
  LEADER_LINES:[
    "Hmph... os Pokémon voadores ainda vão dominar o céu. Leva essa insígnia.",
    "Uau, você estudou meus insetos! Essa insígnia é sua.",
    "Buááá! Isso não é justo... tá bom, toma a insígnia. *funga*",
    "Eu vi o seu futuro... e nele você é campeão. Fique com a insígnia.",
    "Uau! Você tem a força de uma cachoeira! Mereceu!",
    "Seu time é mais duro que aço... Parabéns, de verdade.",
    "Você esquentou até um velho coração de gelo. Siga em frente.",
    "Eu... perdi? Tudo bem. Você é digno da Insígnia Ascensão.",
  ],
  BADGES: J_BADGES, DEX_LIST, WHEEL_ICON: J_WHEEL_ICON,
  REC_KEY:"kc_carreira_johto_v1", SAVE_KEY:"kc_carreira_johto_save_v1", DEX_KEY:"kc_carreira_johto_dex_v1",
  RED,
});
Object.assign(REGIONS.johto.RT, {
  dayNight:true, silver:true, redGyarados:true,
  stoneHint:"Pikachu, Eevee, Sunkern, Gloom, Onix (Metal Coat), Scyther (Metal Coat), Seadra (Dragon Scale) e Porygon (Up-Grade) evoluem com pedra ou item.",
  champBattle:"O CAMPEÃO LANCE quer batalhar!", champIntro:"A última porta. O Campeão Lance te espera com seus dragões.\n\"Mostre do que é feito o novo talento de Johto.\"",
  hofLine:"Lance aperta sua mão: \"Johto tem um novo Campeão.\"\nSeu time entra para o Hall da Fama!",
  loseLine:"Em Johto não existe revanche oficial: a carreira termina aqui.",
  vrHint:"3 decisões na Cachoeira Tohjo (Ho-Oh desce da Torre do Sino)",
});
})();
