/* WRHA Manual & Resource Hub 2.0 — browser-only presentation.
 * Source data: data.js + catalog-extra.js. No API key or paid service.
 */
(()=>{'use strict';
const D=window.WRHA_DATA;
const $=id=>document.getElementById(id);
const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pgs=['home','manuals','legislation','facilities','training','roles','about'];
if(!D){document.querySelector('.governance-banner').textContent='Resource data could not load. Reload to try again.';return;}
const allDocs=D.manuals||[],laws=D.legislation||[];
let current='home',manualLimit=18,lawLimit=18,facLimit=36,roleLimit=36,activeCombined=false;
const dcount=D.roleGroups.reduce((sum,g)=>sum+g.roles.length,0);
const stats=[['▤',allDocs.length,'Source-linked resources'],['⚖',laws.length,'Legislation records'],['⌖',D.facilities.length,'Facility entries (partial)'],['♧',dcount,'Role/function profiles']];
$('stats').innerHTML=stats.map(x=>'<div class="stat"><span class="stat-icon">'+x[0]+'</span><div><strong>'+x[1]+'</strong><small>'+esc(x[2])+'</small></div></div>').join('');
function setView(name,scroll=true){
 current=pgs.includes(name)?name:'home';
 document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.dataset.page===current));
 document.querySelectorAll('.nav-button').forEach(btn=>{let selected=btn.dataset.view===current;btn.classList.toggle('active',selected);if(selected)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current');});
 $('sidebar').classList.remove('open');$('menuBtn').setAttribute('aria-expanded','false');
 if(location.hash!=='#'+current)history.replaceState(null,'','#'+current);
 if(scroll)window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}
document.querySelectorAll('[data-view]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();setView(a.dataset.view)}));
document.querySelectorAll('[data-go]').forEach(a=>a.addEventListener('click',()=>setView(a.dataset.go)));
$('menuBtn').addEventListener('click',()=>{const open=$('sidebar').classList.toggle('open');$('menuBtn').setAttribute('aria-expanded',String(open));$('menuBtn').setAttribute('aria-label',open?'Close navigation':'Open navigation')});
addEventListener('hashchange',()=>setView(location.hash.slice(1),false));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('sidebar').classList.remove('open');$('menuBtn').setAttribute('aria-expanded','false')}});

function isPdf(d){return d.format!=='page'&&(/\.pdf(?:\?|$)/i.test(d.url)||/\/download\//i.test(d.url)||d.format==='pdf')}
const coverCache=new Map(),coverWaiting=[],queued=new Set();let coverActive=0;
if(window.pdfjsLib){pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';}
const coverObserver=('IntersectionObserver' in window)?new IntersectionObserver(records=>{records.forEach(r=>{if(r.isIntersecting){coverObserver.unobserve(r.target);scheduleCover(r.target);}})},{rootMargin:'280px'}):null;
function observeCovers(node){node.querySelectorAll('.doc-cover[data-pdf]').forEach(el=>{
 const fallback=()=>{if(coverCache.has(el.dataset.pdf)){showCached(el);return;}if(coverObserver)coverObserver.observe(el);else scheduleCover(el);};
 const staticImg=el.querySelector('.static-cover');
 if(!staticImg){fallback();return;}
 const loaded=()=>{el.classList.add('has-preview');const canvas=el.querySelector('canvas');if(canvas)canvas.hidden=true;};
 const missing=()=>{staticImg.remove();fallback();};
 staticImg.addEventListener('load',loaded,{once:true});staticImg.addEventListener('error',missing,{once:true});
 if(staticImg.complete){if(staticImg.naturalWidth)loaded();else missing();}
 });}
function showCached(el){const img=coverCache.get(el.dataset.pdf);if(!img)return;const canvas=el.querySelector('canvas');if(canvas){const bitmap=new Image();bitmap.onload=()=>{canvas.width=bitmap.width;canvas.height=bitmap.height;canvas.getContext('2d').drawImage(bitmap,0,0);canvas.hidden=false;el.classList.add('has-preview')};bitmap.src=img;}}
function scheduleCover(el){const url=el.dataset.pdf;if(coverCache.has(url)){showCached(el);return;}if(!window.pdfjsLib||queued.has(url))return;queued.add(url);coverWaiting.push({el,url});flushCovers();}
function flushCovers(){while(coverActive<2&&coverWaiting.length){const {el,url}=coverWaiting.shift();coverActive++;el.classList.add('loading');(async()=>{let task=null,doc=null;try{
 task=pdfjsLib.getDocument({url,withCredentials:false,disableAutoFetch:true,disableStream:true});
 doc=await task.promise;const page=await doc.getPage(1);const basic=page.getViewport({scale:1});
 const scale=Math.min(2,420/basic.width,540/basic.height);
 const vp=page.getViewport({scale});const off=document.createElement('canvas');off.width=Math.max(1,Math.round(vp.width));off.height=Math.max(1,Math.round(vp.height));
 await page.render({canvasContext:off.getContext('2d',{alpha:false}),viewport:vp}).promise;
 const image=off.toDataURL('image/jpeg',.85);coverCache.set(url,image);
 const targets=document.querySelectorAll('.doc-cover[data-pdf]');
 targets.forEach(n=>{if(n.dataset.pdf===url)showCached(n)});
 }catch(e){el.classList.add('not-previewable');el.title='Cover preview unavailable from this host; open the original document';}
 finally{el.classList.remove('loading');queued.delete(url);coverActive--;if(doc)try{await doc.destroy()}catch{}flushCovers()}
 })();}}
function coverMarkup(d){const pdf=isPdf(d);const label=pdf?'FIRST-PAGE PREVIEW':'OFFICIAL SOURCE PAGE';
 const safeURL=pdf?esc(d.url):'';
 return '<div class="doc-cover '+(pdf?'':'not-previewable')+'" '+(pdf?'data-pdf="'+safeURL+'"':'')+'><div class="cover-placeholder"><span class="crest">♛</span><strong>'+esc(d.title)+'</strong><small>'+label+'</small></div>'+(pdf?'<img class="static-cover" loading="lazy" decoding="async" src="./covers/'+encodeURIComponent(d.id)+'.webp" alt="First page of '+esc(d.title)+'"><canvas aria-hidden="true" hidden></canvas>':'')+'</div>';}
function docCard(d,type){const law=type==='law',pdf=isPdf(d),title=esc(d.title),href=esc(d.url);
 const mainButton='<button type="button" class="read-btn" data-read="'+esc(type+':'+d.id)+'">'+(pdf?'Read PDF':'View resource details')+'</button>';
 const secondary='<a class="download-btn" href="'+href+'" target="_blank" rel="noopener">'+(pdf?'Open / download PDF ↗':'Official webpage ↗')+'</a>';
 return '<article class="manual-card '+(law?'manual-legal':'')+'"><div class="manual-top">'+coverMarkup(d)+'<span class="manual-year">'+esc(d.year||d.type||'Resource')+'</span></div><div class="manual-body"><span class="category-label">'+esc(d.category)+'</span><h3>'+title+'</h3><p>'+esc(d.description||'A publicly linked guidance or reference resource.')+'</p><span class="manual-status">'+esc(d.status||'Confirm edition')+'</span><div class="manual-actions">'+mainButton+secondary+'</div></div></article>';
}
function bindDocumentActions(node){node.querySelectorAll('[data-read]').forEach(btn=>btn.addEventListener('click',()=>{const [kind,id]=btn.dataset.read.split(':');openPdf((kind==='law'?laws:allDocs).find(d=>d.id===id))}));observeCovers(node)}
const featured=allDocs.filter(d=>!d.hostedLegacy&&isPdf(d)).sort((a,b)=>(b.year||0)-(a.year||0)).slice(0,3);
$('featured').innerHTML=featured.map(d=>docCard(d,'manual')).join('');bindDocumentActions($('featured'));

let activeManCat='',manItems=[],activeLawCat='';
const cats=[...new Set(allDocs.map(d=>d.category))].sort();
$('manualCategory').innerHTML='<option value="">All programme areas</option>'+cats.map(c=>'<option value="'+esc(c)+'">'+esc(c)+'</option>').join('');
function addPills(anchorId,list,onPick){const anchor=$(anchorId);const p=document.createElement('div');p.className='filter-pills';p.setAttribute('aria-label','Popular category filters');p.innerHTML=['All',...list].map(c=>'<button type="button" data-pill="'+esc(c)+'">'+esc(c)+'</button>').join('');const bar=anchor.closest('.toolbar');bar.parentNode.insertBefore(p,bar.nextSibling);p.querySelectorAll('[data-pill]').forEach(b=>b.addEventListener('click',()=>onPick(b.dataset.pill==='All'?'':b.dataset.pill)));return p;}
const manPills=addPills('manualSearch',['Communicable Diseases','Non-Communicable Diseases','Environmental Health','Maternal & Child Health','Immunisation','Nutrition & Dietetics','Administration & Governance'],cat=>{$('manualCategory').value=cat;manualLimit=18;filterManuals();});
function syncPills(container,category){container.querySelectorAll('button').forEach(b=>b.classList.toggle('active',(b.dataset.pill==='All'?'':b.dataset.pill)===category))}
function filterManuals(){
 const q=$('manualSearch').value.trim().toLowerCase(),cat=$('manualCategory').value,sort=$('manualSort').value;
 manItems=allDocs.filter(m=>(!cat||m.category===cat)&&(!q||[m.title,m.category,m.description,m.publisher,m.year].join(' ').toLowerCase().includes(q)));
 if(sort==='alpha')manItems.sort((a,b)=>a.title.localeCompare(b.title));else if(sort==='newest')manItems.sort((a,b)=>(b.year||0)-(a.year||0));else manItems.sort((a,b)=>(b.year||0)-(a.year||0)||a.title.localeCompare(b.title));
 $('manualCount').textContent=manItems.length+' source-linked manuals and resources';
 $('manualEmpty').hidden=manItems.length!==0;
 $('manualGrid').innerHTML=manItems.slice(0,manualLimit).map(d=>docCard(d,'manual')).join('');
 $('moreManuals').hidden=manItems.length<=manualLimit;
 syncPills(manPills,cat);bindDocumentActions($('manualGrid'));
}
$('manualSearch').addEventListener('input',()=>{manualLimit=18;filterManuals()});
['manualCategory','manualSort'].forEach(x=>$(x).addEventListener('change',()=>{manualLimit=18;filterManuals()}));
$('clearManuals').addEventListener('click',()=>{$('manualSearch').value='';$('manualCategory').value='';$('manualSort').value='featured';manualLimit=18;filterManuals()});
$('moreManuals').addEventListener('click',()=>{manualLimit+=18;filterManuals()});filterManuals();
const lawCats=[...new Set(laws.map(x=>x.category))].sort();
$('lawCategory').innerHTML='<option value="">All legal areas</option>'+lawCats.map(c=>'<option>'+esc(c)+'</option>').join('');
const lawPills=addPills('lawSearch',['Public Health','Nursing & Midwifery','Medicines & Pharmacy','Mental Health','Health Information','Environmental Health'],cat=>{$('lawCategory').value=cat;lawLimit=18;filterLaws()});
function filterLaws(){const q=$('lawSearch').value.trim().toLowerCase(),cat=$('lawCategory').value,type=$('lawType').value;
 const list=laws.filter(l=>(!cat||l.category===cat)&&(!type||l.type===type)&&(!q||[l.title,l.category,l.type].join(' ').toLowerCase().includes(q)));
 $('lawCount').textContent=list.length+' legislation records';
 $('lawEmpty').hidden=list.length!==0;$('lawGrid').innerHTML=list.slice(0,lawLimit).map(l=>docCard(l,'law')).join('');document.querySelector('#moreLawsHolder')?.remove();
 if(list.length>lawLimit){const b=document.createElement('button');b.id='moreLaws';b.className='btn btn-primary';b.textContent='Show more legislation ↓';b.addEventListener('click',()=>{lawLimit+=18;filterLaws()});const holder=document.createElement('div');holder.id='moreLawsHolder';holder.className='load-more-holder';holder.append(b);$('lawGrid').after(holder);}
 syncPills(lawPills,cat);bindDocumentActions($('lawGrid'));
}
['lawSearch','lawCategory','lawType'].forEach(x=>$(x).addEventListener(x==='lawSearch'?'input':'change',()=>{lawLimit=18;filterLaws()}));
$('clearLaws').addEventListener('click',()=>{$('lawSearch').value='';$('lawCategory').value='';$('lawType').value='';lawLimit=18;filterLaws()});filterLaws();

function openPdf(d){if(!d)return;if(window.WRHA_DocViewer){window.WRHA_DocViewer.open(d);return;}if(isPdf(d))window.open(d.url,'_blank','noopener');else window.open(d.sourceUrl||d.url,'_blank','noopener');}

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

const roleGroups=D.roleGroups.map(g=>g.name);
$('roleGroup').innerHTML='<option value="">All professional groups</option>'+roleGroups.map(g=>'<option value="'+esc(g)+'">'+esc(g)+'</option>').join('');
const roleRows=D.roleGroups.flatMap(g=>g.roles.map(r=>({...r,group:g.name,icon:g.icon})));
const documentedRoles=roleRows.filter(r=>r.verification==='source-backed-title');
const relatedRoles=roleRows.filter(r=>r.verification==='related-title-only');
const generalRoles=roleRows.filter(r=>r.verification==='general-overview-unverified');
$('roleSummaryStrip').innerHTML='<div><strong>'+documentedRoles.length+'</strong><span>Source-backed RHA titles</span></div><div><strong>'+relatedRoles.length+'</strong><span>Related titles only</span></div><div><strong>'+generalRoles.length+'</strong><span>General functional overviews — not verified titles</span></div>';
const roleById=new Map(roleRows.map((r,i)=>['role-'+(i+1),r]));
const verifiedLabel=r=>r.verification==='source-backed-title'?'RHA title documented':r.verification==='related-title-only'?'Related title evidence':'General overview — title not verified';
function roleBadge(r){return '<span class="role-verified '+(r.verification==='source-backed-title'?'evidenced':'general')+'">'+esc(verifiedLabel(r))+'</span>';}
function openRole(r){
 if(!r)return;
 $('roleTitle').textContent=r.title;
 const src=r.source||[];
 const rows=[['Classification',r.classification||'Not verified for this exact title'],
 ['Role overview',r.summary||'Not available'],
 ['Typical setting',r.setting||'Not independently confirmed'],
 ['Works with',r.collaborates||'Not independently confirmed'],
 ['Evidence status',verifiedLabel(r)]];
 let content='<div class="role-info-rows">'+rows.map(([label,value])=>'<div class="role-info-row"><span>'+esc(label)+'</span><p>'+esc(value)+'</p></div>').join('')+'</div>';
 if(r.documentedResponsibilities)content+='<section class="role-proof-section"><h3>Responsibilities reflected in official advertisement</h3><p>'+esc(r.documentedResponsibilities)+'</p></section>';
 if(r.verifiedQualifications)content+='<section class="role-proof-section"><h3>Qualifications cited in this advertisement</h3><p>'+esc(r.verifiedQualifications)+'</p></section>';
 if(r.verifiedReportsTo)content+='<section class="role-proof-section"><h3>Reporting relationship cited in this advertisement</h3><p>'+esc(r.verifiedReportsTo)+'</p></section>';
 if(src.length){
 content+='<section class="role-proof-section"><h3>Primary RHA documentation</h3><p class="role-source-note">The classification below is associated with the exact source-listed title, not a universal grade for all RHAs.</p>';
 content+=src.map(e=>'<a class="role-source-link" href="'+esc(e.url)+'" target="_blank" rel="noopener"><strong>'+esc(e.authority)+'</strong> · '+esc(e.sourceTitle)+' '+(e.grade?'('+esc(e.grade)+')':'')+' <span>View original '+esc(e.kind==='qualification-list'?'qualification list':'recruitment source')+' ↗</span></a>').join('')+'</section>';
 }else if(r.relatedEvidence?.length){
 content+='<section class="role-proof-section"><h3>Related title — not proof of this exact post</h3><p>A similar or related title appears in published RHA documents. This does not verify the current title or grade of this particular role.</p>'+r.relatedEvidence.map(e=>'<a class="role-source-link" href="'+esc(e.url)+'" target="_blank" rel="noopener">Related '+esc(e.authority)+' source ↗</a>').join('')+'</section>';
 }else content+='<section class="role-proof-section"><h3>Source still required</h3><p>No exact RHA vacancy or qualification-list record has yet been matched to this title. This description is an educational overview only.</p></section>';
 content+='<p class="role-disclaimer">Old advertisements may be expired. Qualifications, reporting lines and salary bands should only be used when confirmed in the exact official vacancy or establishment record. MOFPS civil-service establishment orders do not automatically establish RHA posts.</p>';
 $('roleDetailBody').innerHTML=content;
 $('roleDialog').showModal();
}
function filterRoles(){
 const q=$('roleSearch').value.trim().toLowerCase(),grp=$('roleGroup').value,auth=$('roleAuthority').value,status=$('roleVerification').value;
 let results=roleRows.filter(r=>(!grp||r.group===grp)&&(!status||r.verification===status)&&(!auth||(r.source||[]).some(e=>e.authority===auth))&&(!q||[r.title,r.summary,r.classification,r.setting,r.collaborates,r.group,...(r.source||[]).map(e=>e.authority)].join(' ').toLowerCase().includes(q)));
 const countVerified=results.filter(r=>r.verification==='source-backed-title').length;
 $('roleCount').textContent=results.length+' profiles matched · '+countVerified+' source-backed titles in these results';
 $('rolesGrid').innerHTML=results.slice(0,roleLimit).map(r=>{
  const rid='role-'+(roleRows.indexOf(r)+1);
  return '<article class="role-card"><span>'+esc(r.icon)+' '+esc(r.group)+'</span><div class="role-card-heading">'+roleBadge(r)+(r.classification?'<span class="role-grade">'+esc(r.classification)+'</span>':'')+'</div><h3>'+esc(r.title)+'</h3><p>'+esc(r.summary||'Function overview not yet available')+'</p><div class="role-detail"><b>Setting:</b> '+esc(r.setting||'Source dependent')+'</div><button type="button" data-role-id="'+esc(rid)+'" class="role-details-btn">View role & evidence ↗</button></article>';
 }).join('')||'<div class="empty-state">No roles match the current filters.</div>';
 $('rolesGrid').querySelectorAll('[data-role-id]').forEach(btn=>btn.addEventListener('click',()=>openRole(roleById.get(btn.dataset.roleId))));
 $('moreRoles').hidden=results.length<=roleLimit;
}
['roleSearch','roleGroup','roleAuthority','roleVerification'].forEach(id=>$(id).addEventListener(id==='roleSearch'?'input':'change',()=>{roleLimit=36;filterRoles()}));
$('moreRoles').addEventListener('click',()=>{roleLimit+=36;filterRoles()});
$('closeRole').addEventListener('click',()=>$('roleDialog').close());
$('roleDialog').addEventListener('click',e=>{if(e.target===$('roleDialog'))$('roleDialog').close()});
filterRoles();

setView(location.hash.slice(1)||'home',false);
})();
