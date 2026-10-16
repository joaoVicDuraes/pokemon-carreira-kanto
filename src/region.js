/* =====================================================================
   REGIÕES: um motor, vários pacotes de dados.
   Kanto vem embutido no index.html; as outras regiões são pacotes <id>.js baixados quando o
   jogador escolhe a região no lobby.

   COMO ADICIONAR UMA REGIÃO (ex.: Hoenn / Gen 3):
     1. src/<id>_data.js   -> DEX, BRANCH, STONE, STARTERS, TYPE_CHART, GYMS, ELITE e
                              REGIONS.<id> = Object.assign(REGIONS.<id>, {ready:true, ...})
        src/<id>_events.js -> roletas por ginásio (mesmo formato de johto_events.js)
     2. sprites: src/sprites/trainers_<id>/ e src/sprites/badges_<id>/ (1..8.png).
        Os Pokémon 252-386 já existem na mesma pasta firered-leafgreen do PokeAPI.
     3. assemble.py: uma chamada build_pack("<id>", range(...), ...) gera o <id>.js.
     4. Aqui: tire o `soon:true`, ponha o arquivo em PACK_FILE e as cores no CSS
        (body[data-region=<id>]).
   O save, os recordes e a Pokédex já ficam separados por região (chaves *_KEY).
   ===================================================================== */
function snapRegion(){
  return {BADGES, DEX_LIST, DEX, BRANCH, STONE, STARTERS, WILD_POOL, TYPE_CHART, GYMS, ELITE,
          GYM_EVENTS, CITY, BADGE_NAMES, LEADER_LINES, WHEEL_ICON, REC_KEY, SAVE_KEY, DEX_KEY};
}
function applyRegion(r){
  ({BADGES, DEX_LIST, DEX, BRANCH, STONE, STARTERS, WILD_POOL, TYPE_CHART, GYMS, ELITE,
    GYM_EVENTS, CITY, BADGE_NAMES, LEADER_LINES, WHEEL_ICON, REC_KEY, SAVE_KEY, DEX_KEY} = r);
}
/* textos que dependem da região */
let RT = null;
const REGIONS = {
  kanto: Object.assign(snapRegion(), {id:"kanto", ready:true, theme:"kanto", RT:{
    name:"Kanto", edition:"EDIÇÃO KANTO · GEN 1", home:"Pallet Town", prof:"Prof. Carvalho", profIc:"👴", profKey:"oak",
    trainerPrefix:"", league:"Platô Índigo", rivalChamp:"blue", starters:["Bulbasaur","Charmander","Squirtle"],
  }}),
  johto: {id:"johto", ready:false, theme:"johto", RT:{
    name:"Johto", edition:"EDIÇÃO JOHTO · GEN 2", home:"New Bark Town", prof:"Prof. Elm", profIc:"🧑‍🔬", profKey:"j_elm",
    trainerPrefix:"j_", league:"Platô Índigo", rivalChamp:"lance", starters:["Chikorita","Cyndaquil","Totodile"], dexTotal:251,
  }},
  /* Gen 3: aparece no lobby como prévia, sem pacote ainda */
  hoenn: {id:"hoenn", ready:false, soon:true, theme:"hoenn", RT:{
    name:"Hoenn", edition:"EDIÇÃO HOENN · GEN 3", home:"Littleroot Town", prof:"Prof. Birch", profIc:"🧑‍🔬", profKey:"h_birch",
    trainerPrefix:"h_", league:"Ever Grande", rivalChamp:"steven", starters:["Treecko","Torchic","Mudkip"], dexTotal:386,
    soonText:"A Gen 3 chega numa próxima atualização. Treecko, Torchic e Mudkip já estão te esperando.",
  }},
};
const REGION_ORDER = ["kanto","johto","hoenn"];
let REGION = "kanto";
let LOBBY = (()=>{ try{ const r=localStorage.getItem("kc_region"); return REGIONS[r] ? r : "kanto"; }catch(e){ return "kanto"; } })();
function useRegion(id){
  const r=REGIONS[id]; if(!r || !r.ready) return false;
  if(REGIONS[REGION] && REGIONS[REGION].ready) Object.assign(REGIONS[REGION], snapRegion());
  applyRegion(r); RT=r.RT; REGION=id;
  DEXREC=loadDexRec();
  return true;
}
/* pacotes carregados sob demanda (arquivos ao lado do index.html) */
const PACK_FILE = {johto:"johto.js"};
function loadScript(src, ok, fail){
  if(typeof document.createElement!=="function") return;
  const s=document.createElement("script"); s.src=src+"?v="+(window.BUILD_ID||"");
  s.onload=()=>ok&&ok(); s.onerror=()=>fail&&fail();
  document.head.appendChild(s);
}
function loadPack(id, cb){
  const r=REGIONS[id]; if(!r || r.ready || r.loading || !PACK_FILE[id]) return;
  r.loading=true; r.failed=false;
  loadScript(PACK_FILE[id], ()=>{ r.loading=false; cb&&cb(); }, ()=>{ r.loading=false; r.failed=true; cb&&cb(); });
}
function afterPack(){
  if(REGIONS[LOBBY].ready && G && G.phase==="title"){ useRegion(LOBBY); setTheme(LOBBY); }
  if(G && G.phase==="title") render();
}
function setTheme(id){
  try{ document.body.dataset.region = REGIONS[id].theme; }catch(e){}
  try{ const t=document.querySelector(".dex-title"); if(t) t.innerHTML="CARREIRA<br>"+REGIONS[id].RT.name.toUpperCase(); }catch(e){}
  try{ applyTheme(); }catch(e){}
}
function lobbyGo(dir){
  const i=REGION_ORDER.indexOf(LOBBY), n=REGION_ORDER.length;
  LOBBY=REGION_ORDER[(i+dir+n)%n];
  try{ localStorage.setItem("kc_region", LOBBY); }catch(e){}
  if(REGIONS[LOBBY].ready) useRegion(LOBBY); else loadPack(LOBBY, afterPack);
  setTheme(LOBBY);
}
/* arrastar o dedo na tela inicial troca a região */
(()=>{
  let x0=null, y0=0;
  document.addEventListener("touchstart", e=>{ if(G && G.phase==="title" && e.touches.length===1){ x0=e.touches[0].clientX; y0=e.touches[0].clientY; } }, {passive:true});
  document.addEventListener("touchend", e=>{
    if(x0===null || !G || G.phase!=="title") return;
    const t=e.changedTouches[0], dx=t.clientX-x0, dy=t.clientY-y0; x0=null;
    if(Math.abs(dx)>60 && Math.abs(dx)>Math.abs(dy)*1.5){ lobbyGo(dx<0?1:-1); try{ SFX.blip(); }catch(err){} render(); }
  }, {passive:true});
})();

/* ---------- boot ---------- */
useRegion("kanto"); setTheme(LOBBY);
if(!REGIONS[LOBBY].ready) loadPack(LOBBY, afterPack);
/* sprites de costas e shiny de Kanto: baixam logo depois da abertura (a 1ª tela não precisa deles) */
loadScript("kanto_extra.js");
/* funciona offline e como app na tela de início (só em http/https; abrir o arquivo direto não usa) */
try{
  if(typeof navigator!=="undefined" && "serviceWorker" in navigator && /^https?:$/.test(location.protocol) && !/^(localhost|127\.)/.test(location.hostname))
    window.addEventListener("load", ()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}catch(e){}
G=newGame(); render();
