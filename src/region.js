/* =====================================================================
   REGIÕES: um motor, vários pacotes de dados (Kanto embutido, Johto a seguir)
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
    name:"Kanto", edition:"EDIÇÃO KANTO · GEN 1", home:"Pallet Town", prof:"Prof. Carvalho", profIc:"👴",
    trainerPrefix:"", league:"Platô Índigo", rivalChamp:"blue",
  }}),
  johto: {id:"johto", ready:false, theme:"johto", RT:{
    name:"Johto", edition:"EDIÇÃO JOHTO · GEN 2", home:"New Bark Town", prof:"Prof. Elm", profIc:"🧑‍🔬",
    trainerPrefix:"j_", league:"Platô Índigo", rivalChamp:"lance",
  }},
};
const REGION_ORDER = ["kanto","johto"];
let REGION = "kanto";
let LOBBY = (()=>{ try{ const r=localStorage.getItem("kc_region"); return REGIONS[r] ? r : "kanto"; }catch(e){ return "kanto"; } })();
function useRegion(id){
  const r=REGIONS[id]; if(!r || !r.ready) return false;
  if(REGIONS[REGION] && REGIONS[REGION].ready) Object.assign(REGIONS[REGION], snapRegion());
  applyRegion(r); RT=r.RT; REGION=id;
  DEXREC=loadDexRec();
  return true;
}
/* pacotes de região carregados sob demanda (johto.js ao lado do index.html) */
const PACK_FILE = {johto:"johto.js"};
function loadPack(id, cb){
  const r=REGIONS[id]; if(!r || r.ready || r.loading || !PACK_FILE[id] || typeof document.createElement!=="function") return;
  r.loading=true; r.failed=false;
  const s=document.createElement("script"); s.src=PACK_FILE[id]+"?v="+(window.BUILD_ID||"");
  s.onload=()=>{ r.loading=false; cb&&cb(); };
  s.onerror=()=>{ r.loading=false; r.failed=true; cb&&cb(); };
  document.head.appendChild(s);
}
function afterPack(){
  if(REGIONS[LOBBY].ready && G && G.phase==="title"){ useRegion(LOBBY); setTheme(LOBBY); }
  if(G && G.phase==="title") render();
}
function setTheme(id){
  try{ document.body.dataset.region = REGIONS[id].theme; }catch(e){}
  try{ const t=document.querySelector(".dex-title"); if(t) t.innerHTML="CARREIRA<br>"+REGIONS[id].RT.name.toUpperCase(); }catch(e){}
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
if(!REGIONS[LOBBY].ready && typeof document.createElement==="function") loadPack(LOBBY, afterPack);
G=newGame(); render();
