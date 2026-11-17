/* WRHA document availability: measured in this browser, not inferred from a cover image. */
(()=>{'use strict';
const D=window.WRHA_DATA;if(!D)return;
const key='wrha-availability-v2',ttl=7*86400000,seed=new Set(['mofps-civil-establishment-2026']);
let cache={};try{cache=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(_){}
const all=[...(D.manuals||[]),...(D.legislation||[])],lookup=new Map(all.map(d=>[d.id,d]));
const isPdf=d=>d&&d.format!=='page'&&(d.format==='pdf'||/\.pdf(?:[?#]|$)|\/download\/?(?:[?#]|$)/i.test(d.url));
const get=d=>{const r=cache[d.id];return r&&r.url===d.url&&Date.now()-r.at<ttl?r:null};
function state(d){if(!isPdf(d))return 'collection';const r=get(d);return r?r.state:seed.has(d.id)?'limited':'unknown'}
function rank(d){const st=state(d);return st==='ready'?0:st==='reachable'?1:st==='unknown'?2:st==='collection'?3:4}
function set(d,status){if(!d||!lookup.has(d.id)||lookup.get(d.id).url!==d.url)return;const old=state(d),r=get(d);
 if(status==='reachable'&&r?.state==='ready')return;
 if(status==='limited'&&navigator.onLine===false)return;
 cache[d.id]={url:d.url,state:status,at:Date.now()};try{localStorage.setItem(key,JSON.stringify(cache))}catch(_){}
 if(old!==status)window.dispatchEvent(new CustomEvent('wrha-reader-availability',{detail:{id:d.id,state:status}}));
}
function label(d){switch(state(d)){case'ready':return 'Reader tested on this device';case'reachable':return 'PDF source reachable';case'limited':return 'Reader access limited';case'collection':return 'In-app resource collection';default:return 'Reader access not yet tested'}}
const ordered=list=>list.slice().sort((a,b)=>rank(a)-rank(b));
const candidate=d=>(window.WRHA_READER_SOURCES?.candidates(d)||[{url:d.url}]).filter(x=>{try{return ['http:','https:'].includes(new URL(x.url,location.href).protocol)}catch(_){return false}});
async function probeRoute(route){const ac=new AbortController();const t=setTimeout(()=>ac.abort(),12000);let body;
 try{const r=await fetch(route.url,{method:'GET',mode:'cors',credentials:'omit',headers:{Range:'bytes=0-1023'},signal:ac.signal,cache:'no-store'});if(!r.ok)return false;
 if(!r.body)return false;body=r.body.getReader();let found='',total=0;while(total<1024){const {value,done}=await body.read();if(done)break;total+=value.length;found+=new TextDecoder('latin1').decode(value.slice(0,1024));if(found.includes('%PDF-'))return true}return found.includes('%PDF-');
 }catch(_){return false}finally{clearTimeout(t);try{body?.cancel().catch(()=>{})}catch(_){}ac.abort()}}
let running=false;
async function audit(){if(running||navigator.onLine===false)return;running=true;
 const pending=all.filter(d=>isPdf(d)&&!get(d));
 // Prioritize existing same-origin publications and the first catalogue entries, not large downloads.
 pending.sort((a,b)=>{const local=d=>{try{return new URL(d.url,location.href).origin===location.origin?0:1}catch(_){return 1}};return local(a)-local(b)||(b.year||0)-(a.year||0)});
 let next=0;
 async function worker(){while(next<pending.length&&navigator.onLine!==false){const d=pending[next++];if(get(d))continue;let ok=false;for(const route of candidate(d)){if(await probeRoute(route)){ok=true;break}}if(!get(d))set(d,ok?'reachable':'limited');await new Promise(r=>setTimeout(r,180));}}
 try{await Promise.all([worker(),worker(),worker()])}finally{running=false}
}
window.WRHA_AVAILABILITY={state,rank,label,set,ordered,audit};
window.addEventListener('online',()=>audit());window.addEventListener('load',()=>setTimeout(audit,850),{once:true});
})();