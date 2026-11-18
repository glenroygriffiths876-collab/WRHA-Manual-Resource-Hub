/* Device-local reader availability. Only a successful real page render earns "Reader verified".
 * Probes fetch a tiny PDF header where supported, never upload or proxy documents.
 * A failed browser fetch is not proof of a permanent publisher restriction. */
(()=>{'use strict';
const D=window.WRHA_DATA,all=[...(D?.manuals||[]),...(D?.legislation||[])],key='wrha-reader-availability-2026-11-v2',ttl=7*86400000,known=new Set(['mofps-civil-establishment-2026']);
let cache={};try{const previous=JSON.parse(localStorage.getItem('wrha-reader-availability-2026-11-v1')||'{}')||{};cache=JSON.parse(localStorage.getItem(key)||'null')||Object.fromEntries(Object.entries(previous).filter(([,r])=>r?.result==='verified'));}catch(_){}
const isPdf=d=>d?.format!=='page'&&d?.format!=='image'&&(/\.pdf(?:[?#]|$)|\/download(?:\/|$)/i.test(d?.url||'')||d?.format==='pdf');
const routeKey=d=>d.url,local=d=>{try{return new URL(d.url,location.href).origin===location.origin}catch(_){return false}};
function record(d){const r=cache[routeKey(d)];return r&&Date.now()-r.at<ttl?r:null}
function state(d){if(d?.format==='image')return 'image';if(!isPdf(d))return 'collection';const r=record(d);if(r?.result==='verified')return 'verified';if(r?.result==='blocked')return r.confirmed?'blocked':'unconfirmed';if(r?.result==='fallback')return 'fallback';if(r?.result==='unconfirmed')return 'unconfirmed';if(r?.result==='reachable')return 'reachable';if(known.has(d.id))return 'unconfirmed';if(local(d))return 'local';return 'unknown'}
const ranks={verified:0,local:1,reachable:2,unknown:3,collection:4,image:3,fallback:5,unconfirmed:6,blocked:7};
const priority=d=>ranks[state(d)];
const labels={verified:'Reader verified on this device',local:'Same-site PDF',reachable:'PDF source reachable · reader not yet tested',collection:'In-app resource collection',image:'Official image resource',unknown:'Reader availability not yet checked',blocked:'Document could not be loaded',fallback:'An embedded viewer is available as an attempt; rendering not verified',unconfirmed:'Direct PDF access is not yet verified; tap to open'};
function notify(d,result,confirmed=false){if(!isPdf(d)||d.deviceCopy)return;const current=record(d);if(result==='reachable'&&(current?.result==='verified'||current?.result==='fallback'||current?.confirmed))return;if(result==='unconfirmed'&&current?.result)return;const old=state(d);cache[routeKey(d)]={result,confirmed,at:Date.now()};try{localStorage.setItem(key,JSON.stringify(cache))}catch(_){}if(old!==state(d))window.dispatchEvent(new CustomEvent('wrha-reader-availability',{detail:{id:d.id,state:state(d)}}))}
function mark(d,result){if(!d||d.deviceCopy||!isPdf(d))return;if(result==='blocked'&&navigator.onLine===false)return;notify(d,result,result==='blocked')}
let active=false,queue=[],checked=new Set(),running=0,verifying=false,verifiedAttempts=0,libPromise=null;
async function probe(url,range){const c=new AbortController(),timer=setTimeout(()=>c.abort(),8000);let reader;try{
const r=await fetch(url,{method:'GET',mode:'cors',credentials:'omit',headers:range?{Range:'bytes=0-1023'}:{},signal:c.signal,cache:'no-store'});
if(!r.ok||!r.body)return false;
reader=r.body.getReader();let bytes=new Uint8Array(0);while(bytes.length<1024){const x=await reader.read();if(x.done)break;const y=x.value.subarray(0,1024-bytes.length),n=new Uint8Array(bytes.length+y.length);n.set(bytes);n.set(y,bytes.length);bytes=n;if(bytes.length>=8&&new TextDecoder().decode(bytes).includes('%PDF-'))return true}return false;
}catch(_){return false}finally{clearTimeout(timer);try{reader?.cancel().catch(()=>{})}catch(_){}c.abort()}}
async function check(d){const paths=window.WRHA_READER_SOURCES?.candidates(d)||[{url:d.url}];for(const route of paths){if(await probe(route.url,true)||await probe(route.url,false)){notify(d,'reachable');return}}if(navigator.onLine!==false)notify(d,'unconfirmed')}

const testedFeatured=new Set();
async function verifyFeatured(){
 if(verifying||navigator.onLine===false||navigator.connection?.saveData||verifiedAttempts>=8||document.querySelector('#pdfDialog')?.open||document.querySelector('.page.active')?.dataset.page!=='home')return;
 const manuals=D?.manuals||[];if(manuals.filter(d=>state(d)==='verified').length>=3)return;
 const options=manuals.filter(d=>isPdf(d)&&!d.fileSizeNote&&!testedFeatured.has(d.url)&&['local','reachable'].includes(state(d))).sort((a,b)=>priority(a)-priority(b)||(b.year||0)-(a.year||0));
 const d=options[0];if(!d)return;verifying=true;testedFeatured.add(d.url);verifiedAttempts++;
 try{
  if(!libPromise)libPromise=import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs').then(m=>{m.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';return m}).catch(e=>{libPromise=null;throw e});
  const lib=await libPromise;
  for(const route of window.WRHA_READER_SOURCES?.candidates(d)||[{url:d.url}]){
   let task,timeout,ok=false;
   try{task=lib.getDocument({url:route.url,withCredentials:false,isEvalSupported:false,enableXfa:false,disableAutoFetch:true,disableStream:true});
    const work=(async()=>{const pdf=await task.promise,page=await pdf.getPage(1),raw=page.getViewport({scale:1}),vp=page.getViewport({scale:Math.min(.5,280/raw.width,380/raw.height)}),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.ceil(vp.width));canvas.height=Math.max(1,Math.ceil(vp.height));await page.render({canvasContext:canvas.getContext('2d',{alpha:false}),viewport:vp}).promise;return true})();
    ok=await Promise.race([work,new Promise(r=>timeout=setTimeout(()=>r(false),18000))]);
   }catch(_){}finally{clearTimeout(timeout);try{await task?.destroy()}catch(_){}}
   if(ok){mark(d,'verified');break}
  }
 }catch(_){}finally{verifying=false;setTimeout(verifyFeatured,450)}
}
function pump(){while(active&&running<1&&queue.length){const d=queue.shift();if(checked.has(d.url))continue;checked.add(d.url);running++;check(d).finally(()=>{running--;setTimeout(pump,120)})}}
function start(){if(active||navigator.onLine===false||navigator.connection?.saveData)return;active=true;queue=all.filter(d=>isPdf(d)&&!record(d)&&!checked.has(d.url));pump()}
function pause(){active=false}
window.WRHA_READER_AVAIL=Object.freeze({state,priority,label:d=>labels[state(d)],mark,start,pause,verifyFeatured});
window.addEventListener('load',()=>setTimeout(verifyFeatured,700),{once:true});
window.addEventListener('online',verifyFeatured);
})();