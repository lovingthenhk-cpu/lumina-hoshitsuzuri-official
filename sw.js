/* Versioned same-origin cache. No messages or personally entered text is stored. */
const CACHE_NAME="lumina-offline-v4";
const CORE=[
  "./","./index.html","./styles.css?v=20261103-1","./extras.css?v=20261103-2",
  "./script.js?v=20261103-1","./extras.js?v=20261103-2",
  "./meteor.js?v=20261103-1","./assets/lumina-generated.png","./assets/star-companion.png",
  "./assets/star-lantern.png","./assets/favicon.svg",
  "./assets/app-icon-192.png","./assets/app-icon-512.png"
];
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("lumina-offline-")&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET" || new URL(req.url).origin!==self.location.origin)return;
  if(req.mode==="navigate") {
    event.respondWith(fetch(req).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(c=>c.put("./index.html",copy));}
      return response;
    }).catch(()=>caches.match("./index.html")));
    return;
  }
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(response=>{
    if(response.ok && response.type==="basic"){const copy=response.clone();caches.open(CACHE_NAME).then(c=>c.put(req,copy));}
    return response;
  })));
});
