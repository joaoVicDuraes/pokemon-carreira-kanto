/* gerado por assemble.py — cache offline. Rede primeiro (deploy novo aparece na hora), cache se estiver sem internet. */
const V="755c2bc3", CACHE="kc-"+V;
const CORE=["./","./kanto_extra.js?v="+V,"./johto.js?v="+V,"./hoenn.js?v="+V,"./manifest.webmanifest","./icon-192.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>{ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{}))))); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET" || new URL(r.url).origin!==location.origin) return;
  e.respondWith(fetch(r).then(res=>{ if(res && res.ok){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)); } return res; })
    .catch(()=>caches.match(r,{ignoreSearch:false}).then(m=>m || (r.mode==="navigate" ? caches.match("./") : Response.error()))));
});
