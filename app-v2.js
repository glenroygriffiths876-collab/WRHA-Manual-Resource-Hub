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

setView(location.hash.slice(1)||'home',false);
})();
