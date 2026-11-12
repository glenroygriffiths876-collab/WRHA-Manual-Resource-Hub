/* WRHA Hub progressive web app service worker.
 * Caches this site's PUBLIC application shell only: no patient data, no user
 * feedback, and no MOHW/MOFPS-hosted PDFs. External documents need internet.
 */
'use strict';
const VERSION='wrha-public-shell-2026-11-12-v1';
const CORE=[
 './','./index.html',
 './styles.css','./enhance.css','./viewer.css','./roles-evidence.css',
 './hub-utilities.css','./pwa-install.css',
 './data.js','./catalog-extra.js','./document-overrides.js',
 './establishment-resource.js','./verified-role-public.js',
 './app-v2.js','./viewer.js','./hub-utilities.js','./pwa-install.js',
 './wrha-logo.webp','./jamaicaHigh.svg',
 './manifest.webmanifest',
 './assets/mohw-logo.png','./assets/wrha-hub-share-qr.svg',
 './assets/app-icons/wrha-icon-192.png','./assets/app-icons/wrha-icon-512.png',
 './assets/app-icons/wrha-maskable-192.png','./assets/app-icons/wrha-maskable-512.png',
 './assets/app-icons/apple-touch-icon.png','./assets/app-icons/wrha-icon-32.png'
];
const allowed=new Set(CORE.map(item=>new URL(item,self.registration.scope).pathname));
function withinScope(url){
 const scope=new URL(self.registration.scope);
 return url.origin===scope.origin&&url.pathname.startsWith(scope.pathname);
}
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(VERSION)
  .then(cache=>cache.addAll(CORE))
  .then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
   const keys=await caches.keys();
   await Promise.all(keys.filter(key=>key.startsWith('wrha-public-shell-')&&key!==VERSION).map(key=>caches.delete(key)));
   await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||req.cache==='only-if-cached'&&req.mode!=='same-origin')return;
 const url=new URL(req.url);
 if(!withinScope(url))return; // Never proxy/cache external government PDF servers.
 const navigation=req.mode==='navigate';
 if(!navigation&&!allowed.has(url.pathname))return; // Only known public shell files.
 event.respondWith((async()=>{
  const cache=await caches.open(VERSION);
  try{
   const response=await fetch(req); // Fresh content wins; stale shell used only offline.
   if(response.ok&&response.type==='basic')await cache.put(req,response.clone());
   return response;
  }catch(error){
   const hit=await cache.match(req,{ignoreSearch:true});
   if(hit)return hit;
   if(navigation){
    const fallback=await cache.match(new URL('./index.html',self.registration.scope));
    if(fallback)return fallback;
   }
   throw error;
  }
 })());
});
