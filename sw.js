/* Paper Stock offline support — v224: NETWORK-FIRST. Pehle cache-first tha:
   phone par purani copy jam jati thi aur naya code kabhi nahi pohnchta tha —
   isi se app bar bar atki/reload hoti thi. Ab online hamesha naya code aaye
   ga; cache sirf tab istemal hogi jab network na ho (offline fallback). */
const CACHE='paper-stock-v224';
const ASSETS=['./','./index.html','./app.js','./auth.js?v=1','./lib/jspdf.umd.min.js','./style.css','./manifest.json','./icon.svg'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  let same=false;
  try{ same=new URL(e.request.url).origin===self.location.origin; }catch(_){}
  if(!same) return;
  e.respondWith(
    fetch(e.request).then(res=>{
      if(res.ok){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); }
      return res;
    }).catch(()=>caches.match(e.request).then(hit=>hit||caches.match('./index.html')))
  );
});
