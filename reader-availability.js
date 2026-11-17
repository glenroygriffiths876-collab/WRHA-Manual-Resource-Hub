/* Device-local reader availability. Only a successful real page render earns "Reader verified".
 * Probes fetch a tiny PDF header where supported, never upload or proxy documents.
 * A failed browser fetch is not proof of a permanent publisher restriction. */
(()=>{'use strict';
const D=window.WRHA_DATA,all=[...(D?.manuals||[]),...(D?.legislation||[])],key='wrha-reader-availability-2026-11-v1',ttl=7*86400000,known=new Set(['mofps-civil-establishment-2026']);
let cache={};try{cache=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(_){}
const isPdf=d=>d?.format!=='page'&&(/\.pdf(?:[?#]|$)|\/download(?:\/|$)/i.test(d?.url||'')||d?.format==='pdf');
const routeKey=d=>d.url,local=d=>{try{return new URL(d.url,location.href).origin===location.origin}catch(_){return false}};
function record(d){const r=cache[routeKey(d)];return r&&Date.now()-r.at<ttl?r:null}
function state(d){if(!isPdf(d))return 'collection';const r=record(d);if(r?.result==='verified')return 'verified';if(r?.result==='blocked')return 'blocked';if(r?.result==='reachable')return 'reachable';if(known.has(d.id))return 'blocked';if(local(d))return 'local';return 'unknown'}
const ranks={verified:0,local:1,reachable:2,collection:3,unknown:4,blocked:5};
const priority=d=>ranks[state(d)];
const labels={verified:'Reader verified on this device',local:'Same-site PDF',reachable:'PDF source reachable · reader not yet tested',collection:'In-app resource collection',unknown:'Reader availability not yet checked',blocked:'May require official-source access'};
function notify(d,result){if(!isPdf(d)||d.deviceCopy)return;const current=record(d);if(result==='reachable'&&(current?.result==='verified'||current?.result==='blocked'||known.has(d.id)))return;if(result==='blocked'&&current?.result==='verified')return;const old=state(d);cache[routeKey(d)]={result,at:Date.now()};try{localStorage.setItem(key,JSON.stringify(cache))}catch(_){}if(old!==state(d))window.dispatchEvent(new CustomEvent('wrha-reader-availability',{detail:{id:d.id,state:state(d)}}))}
function mark(d,result){if(!d||d.deviceCopy||!isPdf(d))return;if(result==='blocked'){if(navigator.onLine===false)return;delete cache[routeKey(d)]}notify(d,result)}
let active=false,queue=[],checked=new Set(),running=0;
async function check(d){const c=new AbortController(),timer=setTimeout(()=>c.abort(),8000);let reader;try{
const r=await fetch(d.url,{method:'GET',mode:'cors',credentials:'omit',headers:{Range:'bytes=0-1023'},signal:c.signal,cache:'no-store'});
if(!r.ok){if(r.status===404||r.status===410||r.status===403)notify(d,'blocked');return}
if(!r.body)return;reader=r.body.getReader();let bytes=new Uint8Array(0);while(bytes.length<1024){const x=await reader.read();if(x.done)break;const y=x.value.subarray(0,1024-bytes.length),n=new Uint8Array(bytes.length+y.length);n.set(bytes);n.set(y,bytes.length);bytes=n;if(bytes.length>=8&&new TextDecoder().decode(bytes).includes('%PDF-')){notify(d,'reachable');break}}
}catch(e){if(e?.name!=='AbortError'&&navigator.onLine!==false)notify(d,'blocked')}finally{clearTimeout(timer);try{await reader?.cancel()}catch(_){}c.abort()}}
function pump(){while(active&&running<2&&queue.length){const d=queue.shift();if(checked.has(d.url))continue;checked.add(d.url);running++;check(d).finally(()=>{running--;setTimeout(pump,120)})}}
function start(){if(active||navigator.onLine===false||navigator.connection?.saveData)return;active=true;queue=all.filter(d=>isPdf(d)&&!record(d)&&!checked.has(d.url));pump()}
function pause(){active=false}
window.WRHA_READER_AVAIL=Object.freeze({state,priority,label:d=>labels[state(d)],mark,start,pause});
})();