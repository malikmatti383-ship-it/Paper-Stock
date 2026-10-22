/* Paper Stock offline support — v176: first-launch Gmail login screen (one-time login, then fully offline) + subscription (manual payment) + payment QR codes + new prices (300/1566/2664) + instant open (serve cache first, refresh in background) */
const CACHE='paper-stock-v181';
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
    caches.match(e.request).then(hit=>{
      const net=fetch(e.request).then(res=>{
        if(res.ok){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); }
        return res;
      }).catch(()=>hit);
      return hit||net.then(r=>r||caches.match('./index.html'));
    })
  );
});
