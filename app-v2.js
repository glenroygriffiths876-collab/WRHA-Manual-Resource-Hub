/* WRHA Manual & Resource Hub 2.0 — browser-only presentation.
 * Source data: data.js + catalog-extra.js. No API key or paid service.
 */
(()=>{'use strict';
const D=window.WRHA_DATA;
const $=id=>document.getElementById(id);
const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pgs=['home','manuals','legislation','facilities','training','roles','about'];
if(!D){document.querySelector('.governance-banner').textContent='Resource data could not load. Reload to try again.';return;}
const allDocs=D.manuals||[],laws=D.legislation||[],availability=window.WRHA_READER_AVAIL;
const accessRank=d=>availability?.priority(d)??4;
const byAccess=(a,b)=>accessRank(a)-accessRank(b);
let current='home',manualLimit=18,lawLimit=18,facLimit=36,roleLimit=36,activeCombined=false;
const dcount=D.roleGroups.reduce((sum,g)=>sum+g.roles.length,0);
const stats=[['▤',allDocs.length,'Source-linked resources'],['⚖',laws.length,'Legislation records'],['⌖',D.facilities.length,'Facility entries (partial)'],['♧',dcount,'Role/function profiles']];
$('stats').innerHTML=stats.map(x=>'<div class="stat"><span class="stat-icon">'+x[0]+'</span><div><strong>'+x[1]+'</strong><small>'+esc(x[2])+'</small></div></div>').join('');
function setView(name,scroll=true){
 const previous=current;current=pgs.includes(name)?name:'home';
 document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.dataset.page===current));
 document.querySelectorAll('.nav-button').forEach(btn=>{let selected=btn.dataset.view===current;btn.classList.toggle('active',selected);if(selected)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current');});
 $('sidebar').classList.remove('open');$('menuBtn').setAttribute('aria-expanded','false');
 if(location.hash!=='#'+current)history.replaceState(null,'','#'+current);
 if(scroll)window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 if(current!==previous){if(current==='manuals')filterManuals();else if(current==='legislation')filterLaws();else if(current==='home')renderFeatured()}
 if(current==='manuals'||current==='legislation')availability?.start();else availability?.pause();if(current==='home')availability?.verifyFeatured();const visiblePage=document.querySelector('.page.active');if(visiblePage)observeCovers(visiblePage);flushCovers();
}
document.querySelectorAll('[data-view]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();setView(a.dataset.view)}));
document.querySelectorAll('[data-go]').forEach(a=>a.addEventListener('click',()=>setView(a.dataset.go)));
$('menuBtn').addEventListener('click',()=>{const open=$('sidebar').classList.toggle('open');$('menuBtn').setAttribute('aria-expanded',String(open));$('menuBtn').setAttribute('aria-label',open?'Close navigation':'Open navigation')});
addEventListener('hashchange',()=>setView(location.hash.slice(1),false));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('sidebar').classList.remove('open');$('menuBtn').setAttribute('aria-expanded','false')}});

function isPdf(d){return d.format!=='page'&&d.format!=='image'&&(/\.pdf(?:\?|$)/i.test(d.url)||/\/download\//i.test(d.url)||d.format==='pdf')}
const coverCache=new Map(),coverWaiting=[],queued=new Set(),failedCovers=new Set();let coverActive=0,lastOpened=null;
const coverVisible=el=>!!el?.isConnected&&($('pdfDialog')?.open?!!el.closest('#pdfWebResource:not([hidden])'):!!el.closest('.page.active'));
const visibleCovers=()=>[...document.querySelectorAll('.doc-cover[data-pdf]')].filter(coverVisible);
if(window.pdfjsLib){pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';}
const coverObserver=('IntersectionObserver' in window)?new IntersectionObserver(records=>{records.forEach(r=>{if(r.isIntersecting&&r.target.isConnected){coverObserver.unobserve(r.target);scheduleCover(r.target);}})},{rootMargin:'280px'}):null;
function observeCovers(node){node.querySelectorAll('.doc-cover[data-pdf],.doc-cover[data-image-cover]').forEach(el=>{if(el.dataset.coverObserved)return;el.dataset.coverObserved='1';
 const fallback=()=>{if(!el.dataset.pdf)return;if(coverCache.has(el.dataset.pdf)){showCached(el);return;}if(coverObserver)coverObserver.observe(el);else scheduleCover(el);};
 const staticImg=el.querySelector('.static-cover');
 if(!staticImg){fallback();return}
 const loaded=()=>{if(!el.isConnected||el.dataset.paintVersion)return;el.classList.add('has-preview');staticImg.hidden=false;const canvas=el.querySelector('canvas');if(canvas)canvas.hidden=true;};
 const missing=()=>{if(!el.isConnected)return;const alternate=staticImg.dataset.alternate;if(alternate){delete staticImg.dataset.alternate;staticImg.src=alternate;return}staticImg.remove();fallback()};
 staticImg.addEventListener('load',loaded);staticImg.addEventListener('error',missing);
 if(staticImg.complete){if(staticImg.naturalWidth)loaded();else missing()}
 });}
function showCached(el){const img=coverCache.get(el.dataset.pdf);if(!img||el.dataset.paintVersion)return;const canvas=el.querySelector('canvas');if(canvas){const bitmap=new Image();bitmap.onload=()=>{if(!el.isConnected||el.dataset.paintVersion)return;el.dataset.paintVersion='1';canvas.width=bitmap.width;canvas.height=bitmap.height;canvas.getContext('2d').drawImage(bitmap,0,0);const old=el.querySelector('.static-cover');if(old)old.hidden=true;canvas.hidden=false;el.classList.add('has-preview')};bitmap.src=img;}}
function scheduleCover(el){if(!el.isConnected)return;if(!coverVisible(el)){delete el.dataset.coverObserved;return}const url=el.dataset.pdf;if(coverCache.has(url)){showCached(el);return;}if(!window.pdfjsLib||queued.has(url)||failedCovers.has(url))return;queued.add(url);coverWaiting.push({el,url});flushCovers();}
function flushCovers(){if($('pdfDialog')?.open&&$('pdfWebResource')?.hidden)return;while(coverActive<1&&coverWaiting.length){const {el,url}=coverWaiting.shift();if(!coverVisible(el)){queued.delete(url);const visible=visibleCovers().find(x=>x.dataset.pdf===url);if(visible)scheduleCover(visible);else if(el.isConnected)delete el.dataset.coverObserved;continue}coverActive++;el.classList.add('loading');(async()=>{let task=null,doc=null;try{
 const sourceRecord=[...allDocs,...laws].find(d=>d.url===url);const sourceURL=sourceRecord?(window.WRHA_READER_SOURCES?.directUrl(sourceRecord)||url):url;
 task=pdfjsLib.getDocument({url:sourceURL,withCredentials:false,disableAutoFetch:true,disableStream:true,isEvalSupported:false,enableXfa:false});
 let timer;try{doc=await Promise.race([task.promise,new Promise((_,reject)=>timer=setTimeout(()=>reject(Error('Cover timeout')),12000))])}finally{clearTimeout(timer)}const page=await doc.getPage(1);const basic=page.getViewport({scale:1});
 const scale=Math.min(3,900/basic.width,1200/basic.height);
 const vp=page.getViewport({scale});const off=document.createElement('canvas');off.width=Math.max(1,Math.round(vp.width));off.height=Math.max(1,Math.round(vp.height));
 await page.render({canvasContext:off.getContext('2d',{alpha:false}),viewport:vp}).promise;
 const image=off.toDataURL('image/jpeg',.94);coverCache.set(url,image);if(coverCache.size>40)coverCache.delete(coverCache.keys().next().value);const record=[...allDocs,...laws].find(d=>d.url===url);if(record)availability?.mark(record,'reachable');
 const targets=document.querySelectorAll('.doc-cover[data-pdf]');
 targets.forEach(n=>{if(n.dataset.pdf===url)showCached(n)});
 }catch(e){failedCovers.add(url);if(!el.classList.contains('has-preview')){el.classList.add('not-previewable');el.title='Cover preview unavailable from this host; select the document to try the reader';}}
 finally{el.classList.remove('loading');queued.delete(url);coverActive--;if(task)try{await task.destroy()}catch{}flushCovers()}
 })();}}
function coverMarkup(d){const pdf=isPdf(d),image=d.format==='image',label=pdf||image?'WRHA REFERENCE COVER':'RESOURCE COLLECTION';
 const pub=d.publisher||'Public health resource';const year=d.year?'<span class="reference-cover-year">'+esc(d.year)+'</span>':'';
 const safeURL=pdf?esc(d.url):'',local='./covers/'+encodeURIComponent(d.id)+'.webp';
 let remote='';try{const x=new URL(d.coverUrl||'');if(x.protocol==='https:'&&/(^|\.)moh\.gov\.jm$/i.test(x.hostname))remote=x.href}catch(_){}
 if(image)remote=window.WRHA_READER_SOURCES?.directUrl(d)||d.url;
 const art='<div class="cover-placeholder reference-cover"><span class="reference-cover-brand">WRHA · RESOURCE HUB</span><span class="reference-cover-symbol" aria-hidden="true">'+(pdf||image?'▤':'▥')+'</span><strong>'+esc(d.title)+'</strong><span class="reference-cover-publisher">'+esc(pub)+'</span>'+year+'<small>'+label+'</small></div>';
 return '<div class="doc-cover '+(pdf||image?'':'not-previewable')+'" '+(pdf?'data-pdf="'+safeURL+'"':image?'data-image-cover="1"':'')+'>'+art+(pdf||image?'<img class="static-cover" loading="lazy" decoding="async" referrerpolicy="no-referrer" src="'+esc(remote||local)+'" '+(remote?'data-alternate="'+esc(local)+'" ':'')+'alt="Cover preview: '+esc(d.title)+'"><canvas aria-hidden="true" hidden></canvas>':'')+'</div>';}
function docCard(d,type){const law=type==='law',pdf=isPdf(d),image=d.format==='image',title=esc(d.title),href=esc(window.WRHA_READER_SOURCES?.directUrl(d)||d.url),key=esc(type+':'+d.id);
 const state=availability?.state(d)||'unknown';const accessLabel='<span class="reader-availability-label" data-state="'+esc(state)+'" title="'+esc(availability?.label(d)||'Reader availability not yet checked')+'">'+esc(shortAccess(state))+'</span>';
 const secondary='<a class="download-btn" '+(pdf?'data-download="'+key+'" download="'+esc(pdfName(d))+'" ':'')+'href="'+href+'" target="_blank" rel="noopener" aria-label="'+(pdf?'Download PDF: ':image?'Download image: ':'Open official source: ')+title+'" title="'+(pdf?'Download PDF; source restrictions may require opening the official file':'Open the publisher website')+'">'+(pdf?'Download PDF ↓':image?'Download image ↓':'Official source ↗')+'</a>';
 return '<article class="manual-card manual-tappable '+(law?'manual-legal':'')+'" data-doc-key="'+key+'"><div class="manual-top">'+coverMarkup(d)+'<span class="manual-year">'+esc(d.year||d.type||'Resource')+'</span></div><div class="manual-body"><span class="category-label">'+esc(d.category)+'</span><h3><button type="button" class="manual-open-title" data-read="'+key+'" aria-haspopup="dialog" aria-label="Open '+title+' in resource reader">'+title+'</button></h3><p>'+esc(d.description||'A publicly linked guidance or reference resource.')+'</p><span class="manual-status">'+esc(d.status||'Confirm edition')+'</span>'+accessLabel+'<div class="manual-actions">'+secondary+'</div><span class="manual-download-status" aria-live="polite" hidden></span></div></article>';
}
function pdfName(d){return (String(d.title||'WRHA document').replace(/[\\/:*?"<>|]/g,'-').trim().slice(0,120)||'WRHA document')+'.pdf'}
function resolveDoc(value){const i=value.indexOf(':'),kind=value.slice(0,i),id=value.slice(i+1);return (kind==='law'?laws:allDocs).find(d=>d.id===id)}
async function downloadFromCard(e,link,d){
 if(!d)return;
 const state=availability?.state(d);
 const routes=window.WRHA_READER_SOURCES?.readerCandidates(d)||[{url:d.url}];
 link.href=window.WRHA_READER_SOURCES?.directUrl(d)||d.url;
 const same=routes.find(r=>{try{return new URL(r.url,location.href).origin===location.origin}catch(_){return false}});
 if(same){link.href=same.url;return}
 if(link.dataset.nativeDownload==='1')return; // Publisher controls cross-origin download behaviour.
 e.preventDefault();if(link.dataset.downloading==='1')return;
 link.dataset.downloading='1';link.setAttribute('aria-busy','true');link.textContent='Preparing…';
 const note=link.closest('.manual-card')?.querySelector('.manual-download-status');
 if(note){note.hidden=true;note.textContent=''}
 let ok=false;
 try{
  for(const route of routes){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),route.delivery?110000:35000);try{
   const response=await fetch(route.url,{mode:'cors',credentials:'omit',signal:controller.signal});if(!response.ok)continue;
   const bytes=Number(response.headers.get('content-length'));if(bytes>150*1024*1024)continue;
   const blob=await response.blob();if(blob.size>150*1024*1024||!(await blob.slice(0,1024).text()).includes('%PDF-'))continue;
   const url=URL.createObjectURL(new Blob([blob],{type:'application/pdf'})),a=document.createElement('a');a.href=url;a.download=pdfName(d);document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);ok=true;break;
  }catch(_){}finally{clearTimeout(timer)}}
 }finally{
  delete link.dataset.downloading;link.removeAttribute('aria-busy');link.textContent=ok?'Download PDF ↓':'Open / download PDF ↗';
  if(!ok){link.dataset.nativeDownload='1';link.removeAttribute('download');if(note){note.textContent='Your browser could not save this source directly. Tap the download link again to open the official file.';note.hidden=false}}
 }
}
function bindDocumentActions(node,onOpen){
 node.querySelectorAll('[data-read]').forEach(btn=>btn.addEventListener('click',()=>{const entry=resolveDoc(btn.dataset.read);if(onOpen){onOpen(entry);return}lastOpened=btn.dataset.read;openPdf(entry)}));
 node.querySelectorAll('[data-download]').forEach(link=>link.addEventListener('click',e=>downloadFromCard(e,link,resolveDoc(link.dataset.download))));
 observeCovers(node)
}
// Availability events never reorder the grid or replace its children.
const accessLabels={verified:'Interactive PDF',local:'PDF document',reachable:'PDF document',collection:'Resource collection',image:'Image resource',unknown:'PDF document',blocked:'PDF document',fallback:'PDF document',unconfirmed:'PDF document'};
function shortAccess(state){return accessLabels[state]||accessLabels.unknown}
function updateCardStatus(card){const d=resolveDoc(card.dataset.docKey||'');if(!d)return;const label=card.querySelector('.reader-availability-label');if(!label)return;const state=availability?.state(d)||'unknown';if(label.dataset.state===state)return;label.dataset.state=state;label.textContent=shortAccess(state);label.title=availability?.label(d)||'Reader availability not yet checked'}
function refreshStatusLabels(id){for(const card of document.querySelectorAll('.manual-card[data-doc-key]')){const d=resolveDoc(card.dataset.docKey);if(!id||d?.id===id||d?.url===id)updateCardStatus(card)}}
// Reuse mounted cards, their loaded covers, focus, and active download controls.
function renderDocumentGrid(root,items,type,onOpen){const typeOf=d=>typeof type==='function'?type(d):type;const desired=items.map(d=>typeOf(d)+':'+d.id),wanted=new Set(desired),old=new Map();
 for(const el of [...root.children]){if(el.dataset.docKey&&wanted.has(el.dataset.docKey)){old.set(el.dataset.docKey,el)}else{coverObserver?.unobserve(el.querySelector?.('.doc-cover[data-pdf]')||el);el.remove()}}
 let cursor=root.firstElementChild;
 for(let i=0;i<items.length;i++){const key=desired[i];let card=old.get(key),created=false;
  if(!card){const template=document.createElement('template');template.innerHTML=docCard(items[i],typeOf(items[i])).trim();card=template.content.firstElementChild;created=true}
  if(card!==cursor)root.insertBefore(card,cursor);cursor=card.nextElementSibling;
  if(created)bindDocumentActions(card,onOpen);else updateCardStatus(card);
 }
}
window.WRHA_RESOURCE_CARDS=Object.freeze({mount(root,entries,onOpen){renderDocumentGrid(root,entries,d=>laws.some(x=>x.id===d.id)?'law':'manual',onOpen);observeCovers(root);flushCovers()},refresh:refreshStatusLabels});
function renderFeatured(){const items=allDocs.filter(d=>isPdf(d)&&availability?.state(d)==='verified').sort((a,b)=>byAccess(a,b)||(b.year||0)-(a.year||0)||a.title.localeCompare(b.title)).slice(0,3),root=$('featured');
 $('featuredReaderNote').textContent=items.length?'First page successfully rendered on this device.':'Browse the library; verified recommendations are refreshed when you return Home.';
 if(items.length)renderDocumentGrid(root,items,'manual');else if(!$('featuredBrowse')){root.innerHTML='<button type="button" class="btn btn-primary" id="featuredBrowse">Browse the manual library ↗</button>';$('featuredBrowse').addEventListener('click',()=>setView('manuals'))}}
renderFeatured();

let activeManCat='',manItems=[],lawItems=[],activeLawCat='';
const cats=[...new Set(allDocs.map(d=>d.category))].sort();
$('manualCategory').innerHTML='<option value="">All programme areas</option>'+cats.map(c=>'<option value="'+esc(c)+'">'+esc(c)+'</option>').join('');
function addPills(anchorId,list,onPick){const anchor=$(anchorId);const p=document.createElement('div');p.className='filter-pills';p.setAttribute('aria-label','Popular category filters');p.innerHTML=['All',...list].map(c=>'<button type="button" data-pill="'+esc(c)+'">'+esc(c)+'</button>').join('');const bar=anchor.closest('.toolbar');bar.parentNode.insertBefore(p,bar.nextSibling);p.querySelectorAll('[data-pill]').forEach(b=>b.addEventListener('click',()=>onPick(b.dataset.pill==='All'?'':b.dataset.pill)));return p;}
const manPills=addPills('manualSearch',['Communicable Diseases','Non-Communicable Diseases','Environmental Health','Maternal & Child Health','Immunisation','Nutrition & Dietetics','Administration & Governance'],cat=>{$('manualCategory').value=cat;manualLimit=18;filterManuals();});
function syncPills(container,category){container.querySelectorAll('button').forEach(b=>b.classList.toggle('active',(b.dataset.pill==='All'?'':b.dataset.pill)===category))}
function filterManuals(reorder=true){
 const q=$('manualSearch').value.trim().toLowerCase(),cat=$('manualCategory').value,sort=$('manualSort').value;
 if(reorder){manItems=allDocs.filter(m=>(!cat||m.category===cat)&&(!q||[m.title,m.category,m.description,m.publisher,m.year].join(' ').toLowerCase().includes(q)));
 if(sort==='alpha')manItems.sort((a,b)=>a.title.localeCompare(b.title));else if(sort==='newest')manItems.sort((a,b)=>(b.year||0)-(a.year||0));else manItems.sort((a,b)=>(b.year||0)-(a.year||0)||a.title.localeCompare(b.title));
 manItems.sort(byAccess);}
 $('manualCount').textContent=manItems.length+' source-linked manuals and resources · readable first';
 $('manualEmpty').hidden=manItems.length!==0;
 renderDocumentGrid($('manualGrid'),manItems.slice(0,manualLimit),'manual');
 $('moreManuals').hidden=manItems.length<=manualLimit;
 syncPills(manPills,cat);
}
$('manualSearch').addEventListener('input',()=>{manualLimit=18;filterManuals()});
['manualCategory','manualSort'].forEach(x=>$(x).addEventListener('change',()=>{manualLimit=18;filterManuals()}));
$('clearManuals').addEventListener('click',()=>{$('manualSearch').value='';$('manualCategory').value='';$('manualSort').value='featured';manualLimit=18;filterManuals()});
$('moreManuals').addEventListener('click',()=>{manualLimit+=18;filterManuals(false)});$('refreshManualOrder').addEventListener('click',()=>filterManuals());
const lawCats=[...new Set(laws.map(x=>x.category))].sort();
$('lawCategory').innerHTML='<option value="">All legal areas</option>'+lawCats.map(c=>'<option>'+esc(c)+'</option>').join('');
const lawPills=addPills('lawSearch',['Public Health','Nursing & Midwifery','Medicines & Pharmacy','Mental Health','Health Information','Environmental Health'],cat=>{$('lawCategory').value=cat;lawLimit=18;filterLaws()});
function filterLaws(reorder=true){const q=$('lawSearch').value.trim().toLowerCase(),cat=$('lawCategory').value,type=$('lawType').value;
 if(reorder)lawItems=laws.filter(l=>(!cat||l.category===cat)&&(!type||l.type===type)&&(!q||[l.title,l.category,l.type].join(' ').toLowerCase().includes(q))) .sort(byAccess);const list=lawItems;
 $('lawCount').textContent=list.length+' legislation records';
 $('lawEmpty').hidden=list.length!==0;renderDocumentGrid($('lawGrid'),list.slice(0,lawLimit),'law');$('moreLaws').hidden=list.length<=lawLimit;
 syncPills(lawPills,cat);
}
['lawSearch','lawCategory','lawType'].forEach(x=>$(x).addEventListener(x==='lawSearch'?'input':'change',()=>{lawLimit=18;filterLaws()}));
$('clearLaws').addEventListener('click',()=>{$('lawSearch').value='';$('lawCategory').value='';$('lawType').value='';lawLimit=18;filterLaws()});$('moreLaws').addEventListener('click',()=>{lawLimit+=18;filterLaws(false)});$('refreshLawOrder').addEventListener('click',()=>filterLaws());

// Coalesce status changes into one paint; never re-sort an active reading list.
let statusFrame=0;
window.addEventListener('wrha-reader-availability',()=>{if(statusFrame)return;statusFrame=requestAnimationFrame(()=>{statusFrame=0;refreshStatusLabels()})});
$('pdfDialog')?.addEventListener('close',()=>{const key=lastOpened;refreshStatusLabels();if(key){const scope=current==='manuals'?$('manualGrid'):current==='legislation'?$('lawGrid'):$('featured');const target=[...(scope?.querySelectorAll('[data-read]')||[])].find(x=>x.dataset.read===key);target?.focus({preventScroll:true})}lastOpened=null;if(current==='manuals'||current==='legislation')availability?.start();flushCovers()});

function openPdf(d){if(!d)return;if(window.WRHA_DocViewer){availability?.pause();window.WRHA_DocViewer.open(d);return;}if(isPdf(d))window.open(d.url,'_blank','noopener');else window.open(d.sourceUrl||d.url,'_blank','noopener');}

const parishes=Object.keys(D.rhaMap).sort();
$('parishFilter').innerHTML='<option value="">All 14 parishes</option>'+parishes.map(p=>'<option value="'+esc(p)+'">'+esc(p)+'</option>').join('');
const mapLocations=[
 ['Hanover','HAN',13,33],['St. James','STJ',25,31],['Trelawny','TRE',38,29],['St. Ann','ANN',55,31],['St. Mary','STM',70,36],['Portland','POR',84,42],
 ['Westmoreland','WML',15,56],['St. Elizabeth','STE',31,70],['Manchester','MAN',45,65],['Clarendon','CLA',58,64],['St. Catherine','STC',69,55],['KSA','KSA',78,65],['St. Thomas','STT',88,69]
];
function mapCount(p){return D.facilities.filter(f=>p==='KSA'?['Kingston','St. Andrew'].includes(f.parish):f.parish===p).length}
function buildMap(){const root=$('facilityMap');if(root.dataset.ready)return;root.dataset.ready='1';
 root.innerHTML='<img class="jamaica-svg" src="./jamaicaHigh.svg" onerror="this.onerror=null;this.src=\'https://amcharts.com/static/svg-maps/jamaicaHigh.svg\'" alt="Outline and parish boundaries of Jamaica" loading="lazy">'+mapLocations.map(([p,abb,x,y])=>'<button type="button" class="parish-badge '+(mapCount(p)?'':'zero')+'" data-mapparish="'+esc(p)+'" style="left:'+x+'%;top:'+y+'%" aria-label="Show '+esc(p==='KSA'?'Kingston and St Andrew':p)+' health centres"><span>'+abb+'</span><span class="count">'+mapCount(p)+'</span></button>').join('');
 root.querySelectorAll('[data-mapparish]').forEach(b=>b.addEventListener('click',()=>{const p=b.dataset.mapparish;activeCombined=p==='KSA';$('parishFilter').value=activeCombined?'':p;$('regionFilter').value='';$('facilitySearch').value='';facLimit=36;filterFacilities();root.querySelectorAll('.parish-badge').forEach(x=>x.classList.toggle('selected',x===b));$('facilityCount').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}));
}
function filterFacilities(){const q=$('facilitySearch').value.trim().toLowerCase(),region=$('regionFilter').value,parish=$('parishFilter').value;
 const items=D.facilities.filter(f=>(!region||f.rha===region)&&(!parish||f.parish===parish)&&(!activeCombined||['Kingston','St. Andrew'].includes(f.parish))&&(!q||[f.name,f.parish,f.rha,f.address].join(' ').toLowerCase().includes(q))).sort((a,b)=>a.parish.localeCompare(b.parish)||a.name.localeCompare(b.name));
 const place=activeCombined?' in Kingston & St. Andrew':parish?' in '+parish:'';
 $('facilityCount').textContent=items.length+' published facility entries'+place+' (coverage incomplete)';
 $('facilityEmpty').hidden=items.length!==0;
 $('facilityGrid').innerHTML=items.slice(0,facLimit).map(f=>'<button class="facility-card" data-facility="'+esc(f.id)+'" type="button"><span class="facility-pin">⌖</span><span><strong>'+esc(f.name)+'</strong><small>'+esc(f.parish)+' · '+esc(f.rha)+'</small><span class="facility-type">'+(f.type?'Type '+esc(f.type)+' · ':'')+'Source-linked listing</span></span></button>').join('');
 $('facilityGrid').querySelectorAll('[data-facility]').forEach(b=>b.addEventListener('click',()=>openFacility(D.facilities.find(f=>f.id===b.dataset.facility))));
 $('moreFacilities').hidden=items.length<=facLimit;
}
['facilitySearch','regionFilter','parishFilter'].forEach(x=>$(x).addEventListener(x==='facilitySearch'?'input':'change',()=>{activeCombined=false;facLimit=36;filterFacilities();$('facilityMap').querySelectorAll('.parish-badge').forEach(b=>b.classList.remove('selected'))}));
$('moreFacilities').addEventListener('click',()=>{facLimit+=36;filterFacilities()});
$('resetMap').addEventListener('click',()=>{activeCombined=false;facLimit=36;$('facilitySearch').value='';$('regionFilter').value='';$('parishFilter').value='';filterFacilities();$('facilityMap').querySelectorAll('.parish-badge').forEach(b=>b.classList.remove('selected'))});
function openFacility(f){if(!f)return;$('facilityTitle').textContent=f.name;const rows=[['Parish',f.parish],['Regional authority',f.rha],['Facility type',f.type?'Type '+f.type:'Not stated'],['Address',f.address||'Address not published in source'],['Telephone',f.phone||'Not available'],['Directory scope',f.scope],['Verified coordinates','Not available — verify before travel']];
 $('facilityDetails').innerHTML=rows.map(([name,value])=>'<div class="detail-line"><strong>'+esc(name)+'</strong>'+esc(value)+'</div>').join('');
 const maps='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(f.name+', '+f.parish+', Jamaica');
 $('facilityDetails').innerHTML+='<div class="detail-links"><a href="'+esc(f.source)+'" target="_blank" rel="noopener">Official directory ↗</a><a href="'+maps+'" target="_blank" rel="noopener">Search Maps (verify location) ↗</a></div>';
 $('facilityDialog').showModal();
}
$('closeFacility').addEventListener('click',()=>$('facilityDialog').close());$('facilityDialog').addEventListener('click',e=>{if(e.target===$('facilityDialog'))$('facilityDialog').close()});
buildMap();filterFacilities();

// VERIFIED-ONLY PUBLIC JOB DIRECTORY.
// An RHA vacancy notice is Tier B evidence of a title, NOT a current RHA establishment.
// MOFPS 2026 evidence (Tier C) proves a central civil-service post, not an RHA post.
const roleRows=(D.roleGroups||[]).flatMap(g=>(g.roles||[]).map(r=>({...r,group:g.name,icon:g.icon})))
 .filter(r=>r.verificationTier==='B'||r.verificationTier==='C');
const roleById=new Map(roleRows.map((r,i)=>['verified-role-'+(i+1),r]));
const rhaCount=roleRows.filter(r=>r.verificationTier==='B').length;
const mofpsCount=roleRows.filter(r=>r.verificationTier==='C').length;
$('roleGroup').innerHTML='<option value="">All professional categories</option>'+[...new Set(roleRows.map(r=>r.group))].sort().map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join('');
$('roleSummaryStrip').innerHTML='<div><strong>'+rhaCount+'</strong><span>RHA titles found in official documents</span></div>'+
 '<div><strong>'+mofpsCount+'</strong><span>MOHW central-government title/grade records</span></div>'+
 '<div><strong>'+D.roleEvidenceCounts.regionEvidenceCount+'</strong><span>RHA documentary evidence records reviewed</span></div>';
function verificationLabel(r){return r.verificationTier==='C'?'2026 Civil Service Order — Ministry post':'Official RHA title — document verified';}
function verificationBadge(r){return '<span class="role-verified evidenced">'+esc(verificationLabel(r))+'</span>';}
function makeSourceLink(r){
 return (r.source||[]).map(e=>{
  const meta=[e.authority,e.kind,e.grade?'Code '+e.grade:null,e.physicalPage?'PDF page '+e.physicalPage:null,e.sourceDate||null].filter(Boolean).join(' · ');
  return '<a class="role-source-link" href="'+esc(e.url)+'" target="_blank" rel="noopener"><strong>'+esc(e.sourceTitle||r.title)+'</strong><span>'+esc(meta)+' · Open primary government source ↗</span></a>';
 }).join('');
}
function openRole(r){
 if(!r)return;
 $('roleTitle').textContent=r.title;
 const fields=[
 ['Exact published title',r.title],
 ['Classification',r.classification||'Not independently verified from the source'],
 ['Verified issuing authorities',r.verificationTier==='C'?'Ministry of Health & Wellness — Central Civil Service':(r.authorities||[r.authority]).join(', ')+' — source-backed RHA records'],
 ['Evidence category',verificationLabel(r)],
 ['Verified regions',r.verificationTier==='C'?'Not an RHA post':(r.authorities||[r.authority]).join(', ')],
 ['Job purpose and duties',r.documentedResponsibilities||'Not included in the verified source record. No generic functions have been invented.'],
 ['Qualifications',r.verifiedQualifications||'Not confirmed from the individual verified job document.'],
 ['Reporting relationship',r.verifiedReportsTo||'Not confirmed in the verified job document.']
 ];
 let out='<div class="role-info-rows">'+fields.map(([label,value])=>'<div class="role-info-row"><span>'+esc(label)+'</span><p>'+esc(value)+'</p></div>').join('')+'</div>';
 if(r.verificationTier==='C'){
  out+='<section class="role-proof-section"><h3>MOFPS Establishment evidence</h3><p>The linked 2026 PDF contains this exact Ministry position. '+(r.postIds?.length?'Published post number'+(r.postIds.length>1?'s':'')+': '+esc(r.postIds.join(', '))+'. ':'')+(r.sourcePage?'PDF page '+esc(r.sourcePage)+'. ':'')+'These are <strong>central-government</strong> establishment records; they do not establish an RHA post.</p></section>';
 }else{
  out+='<section class="role-proof-section"><h3>Cross-region RHA documentary coverage</h3><p>Original official sources confirm this exact title and classification in: <strong>'+esc((r.authorities||[r.authority]).join(', '))+'</strong>. This occupational cadre may be used in other regions, but an undocumented region is not claimed as verified. Individual RHA vacancy notices and qualification lists can have differing duties and entry qualifications. Historical recruitment evidence does not prove a currently funded post or an open vacancy.</p></section>';
 }
 out+='<section class="role-proof-section"><h3>Official documents</h3>'+makeSourceLink(r)+'</section>';
 out+='<p class="role-disclaimer">'+esc(r.warning||'Verify current employment arrangements directly with the relevant RHA or Ministry.')+'</p>';
 $('roleDetailBody').innerHTML=out;
 $('roleDialog').showModal();
}
function filterRoles(){
 const q=$('roleSearch').value.trim().toLowerCase(),grp=$('roleGroup').value,auth=$('roleAuthority').value,tier=$('roleVerification').value;
 const matches=roleRows.filter(r=>(!grp||r.group===grp)&&(!auth||(r.authorities||[r.authority]).includes(auth))&&(!tier||r.verificationTier===tier)&&(!q||[r.title,r.classification,r.group,r.authority,r.verificationLabel,...(r.authorities||[])].join(' ').toLowerCase().includes(q)));
 $('roleCount').textContent=matches.length+' source-verified position records'+(q?' matching your search':'')+' · 0 speculative entries';
 $('rolesGrid').innerHTML=matches.slice(0,roleLimit).map(r=>{
  const id='verified-role-'+(roleRows.indexOf(r)+1);
  return '<article class="role-card"><span>'+esc(r.icon)+' '+esc(r.group)+'</span><div class="role-card-heading">'+verificationBadge(r)+(r.classification?'<span class="role-grade">'+esc(r.classification)+'</span>':'')+'</div><h3>'+esc(r.title)+'</h3><p>'+esc(r.verificationTier==='C'?'MOHW central civil-service title, documented in the 2026 Establishment Order. Not an RHA post.':'Exact title appears in an official '+r.authority+' source. A historical advertisement is not a current vacancy.')+'</p><div class="role-detail"><b>Authority:</b> '+esc(r.authority)+' · <b>Evidence:</b> '+esc(r.verificationTier==='C'?'MOFPS Order':((r.source||[]).length+' original reference(s)'))+'</div><button type="button" data-role-id="'+esc(id)+'" class="role-details-btn">View verified source & role ↗</button></article>';
 }).join('')||'<div class="empty-state">No verified positions match the current filters.</div>';
 $('rolesGrid').querySelectorAll('[data-role-id]').forEach(button=>button.addEventListener('click',()=>openRole(roleById.get(button.dataset.roleId))));
 $('moreRoles').hidden=matches.length<=roleLimit;
}
['roleSearch','roleGroup','roleAuthority','roleVerification'].forEach(id=>$(id).addEventListener(id==='roleSearch'?'input':'change',()=>{roleLimit=36;filterRoles()}));
$('moreRoles').addEventListener('click',()=>{roleLimit+=36;filterRoles()});
$('closeRole').addEventListener('click',()=>$('roleDialog').close());
$('roleDialog').addEventListener('click',e=>{if(e.target===$('roleDialog'))$('roleDialog').close()});
filterRoles();

/* Reset to the landing page once after each application release. */
const release='2026-11-17-legal-sources-1';let newRelease=true;try{newRelease=localStorage.getItem('wrha-home-release')!==release;localStorage.setItem('wrha-home-release',release)}catch(_){}
if(newRelease){try{history.scrollRestoration='manual'}catch(_){}setView('home',false);window.scrollTo(0,0)}else setView(location.hash.slice(1)||'home',false);
})();
