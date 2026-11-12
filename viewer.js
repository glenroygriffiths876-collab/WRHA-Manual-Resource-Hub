/* WRHA Universal Document Reader v1 — purely client-side PDF.js, graceful native fallback.
   We do not proxy or copy copyright-protected MOHW PDFs.
 */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const modal=$('pdfDialog');if(!modal)return;
const elements={
 frame:$('pdfFrame'),scroller:$('pdfCanvasScroll'),surface:$('pdfPageSurface'),canvas:$('pdfCanvas'),
 text:$('pdfTextLayer'),loading:$('pdfLoading'),status:$('pdfStatus'),
 web:$('pdfWebResource'),webLink:$('pdfWebLink'),blocked:$('pdfBlocked'),blockedCover:$('pdfBlockedCover'),blockedOpen:$('pdfBlockedOpen'),blockedPublisher:$('pdfBlockedPublisher'),page:$('pdfPage'),
 total:$('pdfTotal'),zoom:$('pdfZoom'),search:$('pdfSearch'),
 prev:$('pdfPrevious'),next:$('pdfNext'),find:$('pdfFindButton'),
 fullscreen:$('pdfFullScreen'),source:$('pdfSource'),download:$('pdfDownload'),legalAlt:$('pdfLegalAlt')
};
let current=null,pdf=null,task=null,renderTask=null,currentPage=1,session=0,finding=false,mode='closed',pageCount=0;
const pdfFileName=(d)=>((d.title||'document').replace(/[^a-z0-9\s_-]+/gi,'').trim().replace(/\s+/g,'_').slice(0,85)||'document')+'.pdf';
function setStatus(message){elements.status.textContent=message;}
function setMode(value){mode=value;elements.scroller.hidden=value!=='pdfjs';elements.frame.hidden=value!=='native';elements.web.hidden=value!=='web';elements.blocked.hidden=value!=='blocked';elements.loading.hidden=value!=='loading';const advanced=value==='pdfjs';const navigable=value==='pdfjs';elements.search.disabled=!advanced;elements.find.disabled=!advanced;elements.prev.disabled=!navigable;elements.next.disabled=!navigable;elements.page.disabled=!navigable;elements.zoom.disabled=!navigable;}
function fragment(){return '#page='+currentPage+'&zoom='+encodeURIComponent(elements.zoom.value);}
function destroy(){session++;if(renderTask)try{renderTask.cancel()}catch{}renderTask=null;if(task)try{task.destroy()}catch{}task=null;if(pdf)try{pdf.destroy()}catch{}pdf=null;current=null;pageCount=0;mode='closed';finding=false;elements.frame.src='about:blank';elements.scroller.hidden=true;elements.web.hidden=true;elements.blocked.hidden=true;elements.loading.hidden=true;elements.blockedCover.removeAttribute('src');elements.canvas.width=1;elements.canvas.height=1;elements.text.textContent='';}
function updateControls(){elements.page.value=String(currentPage);elements.total.textContent=pageCount?'/ '+pageCount:'/ —';elements.prev.disabled=mode!=='pdfjs'||currentPage<=1;elements.next.disabled=mode!=='pdfjs'||(pageCount>0&&currentPage>=pageCount);}
async function render(pageNumber){
 if(!pdf||!current)return;
 const version=session;
 currentPage=Math.max(1,Math.min(pageCount,Number(pageNumber)||1));
 updateControls();
 if(renderTask){try{renderTask.cancel()}catch{}renderTask=null;}
 try{
  const page=await pdf.getPage(currentPage);
  if(session!==version||!current)return;
  const raw=page.getViewport({scale:1});
  const w=Math.max(230,elements.scroller.clientWidth-40);
  const h=Math.max(290,elements.scroller.clientHeight-42);
  let scale;
  const option=elements.zoom.value;
  if(option==='page-width')scale=w/raw.width;
  else if(option==='auto')scale=Math.min(w/raw.width,h/raw.height,1.8);
  else scale=(Number(option)||100)/100*1.35;
  scale=Math.max(.25,Math.min(scale,3));
  const viewport=page.getViewport({scale});
  const dpr=Math.min(2,window.devicePixelRatio||1);
  const canvas=elements.canvas,ctx=canvas.getContext('2d',{alpha:false});
  canvas.width=Math.max(1,Math.floor(viewport.width*dpr));
  canvas.height=Math.max(1,Math.floor(viewport.height*dpr));
  canvas.style.width=Math.round(viewport.width)+'px';
  canvas.style.height=Math.round(viewport.height)+'px';
  elements.surface.style.width=Math.round(viewport.width)+'px';
  elements.surface.style.height=Math.round(viewport.height)+'px';
  elements.text.replaceChildren();
  elements.text.style.width=canvas.style.width;elements.text.style.height=canvas.style.height;
  renderTask=page.render({canvasContext:ctx,viewport,transform:dpr===1?null:[dpr,0,0,dpr,0,0]});
  await renderTask.promise;
  renderTask=null;
  if(session!==version)return;
  // PDF.js text layer gives selectable text where the original PDF contains text.
  if(typeof window.pdfjsLib.renderTextLayer==='function'){
    try{
      const content=await page.getTextContent();
      if(session!==version)return;
      const layerTask=window.pdfjsLib.renderTextLayer({textContentSource:content,container:elements.text,viewport,textDivs:[]});
      if(layerTask?.promise)await layerTask.promise;
    }catch(e){/* Some scanned PDFs have no selectable text. Canvas remains readable. */}
  }
  setStatus('Reading '+currentPage+' of '+pageCount+'. Select text where available, or use Find to locate terms.');
 }catch(e){
  if(session!==version)return;
  if(e?.name!=='RenderingCancelledException')setStatus('This page could not be rendered. Try a different page or open the original PDF.');
 }
}
function restrictedFallback(url,reason){
 if(!current)return;
 // A cross-origin browser iframe can remain blank or trigger Content-Disposition: attachment.
 // Never load one automatically. Only show a real first-page thumbnail where available.
 setMode('blocked');elements.blockedOpen.href=url;elements.blockedPublisher.href=current.sourceUrl||url;
 const img=elements.blockedCover;
 img.alt='First page of '+(current.title||'the requested PDF');
 img.hidden=false;
 img.onerror=()=>{img.hidden=true;const label=img.closest('.reader-blocked-visual')?.querySelector('.reader-preview-label');if(label)label.textContent='First-page preview unavailable';};
 img.onload=()=>{const label=img.closest('.reader-blocked-visual')?.querySelector('.reader-preview-label');if(label)label.textContent='Verified first-page thumbnail — not the full PDF';};
 img.src='./covers/'+encodeURIComponent(current.id)+'.webp';
 setStatus(reason||'Full in-page reading is not available from this publisher. The cover preview and original PDF link are available.');
 updateControls();
}
async function loadPdf(d){
 const version=session,url=d.url;
 if(!window.pdfjsLib){restrictedFallback(url,'PDF.js is not available in this browser. Open the original PDF using the separate publisher link.');return;}
 try{
  setStatus('Loading the original PDF into the WRHA reader…');
  task=window.pdfjsLib.getDocument({url,withCredentials:false,disableAutoFetch:false,disableStream:false});
  const handle=await task.promise;
  if(version!==session){try{handle.destroy()}catch{}return;}
  pdf=handle;pageCount=pdf.numPages;setMode('pdfjs');currentPage=1;
  elements.page.max=String(pageCount);updateControls();await render(1);
 }catch(err){
  if(version!==session)return;
  const problem=String(err?.name||'')+' '+String(err?.message||err);
  if(/InvalidPDFException|Invalid PDF structure|MissingPDFException|404|not a PDF/i.test(problem)){
    setMode('web');elements.web.querySelector('h3').textContent='PDF not available';
    elements.web.querySelector('p').textContent='This source did not provide a readable PDF. Use the publisher link or request a corrected official document link.';
    elements.webLink.href=current.sourceUrl||url;elements.download.hidden=true;
    setStatus('A PDF could not be verified; no HTML webpage is being presented as a PDF.');return;
  }
  const reason=/cors|network|fetch|failed to/i.test(problem)?
   'The publisher restricts cross-origin PDF access. We will not open a blank viewer or force an automatic download; use the original PDF link when ready.':
   'This PDF could not be rendered in the WRHA reader. A first-page preview and original publisher PDF link are available.';
  restrictedFallback(url,reason);
 }
}
function navigate(num){
 if(!current||mode!=='pdfjs')return;
 const p=Math.max(1,Math.min(pageCount||99999,Number(num)||1));
 currentPage=p;
 if(mode==='pdfjs')render(p);
}
function open(d){
 if(!d||!d.url)return;
 if(modal.open)modal.close();
 destroy();session++;const version=session;
 current=d;currentPage=1;pageCount=0;elements.page.value='1';elements.page.removeAttribute('max');
 elements.zoom.value='auto';elements.search.value='';
 $('pdfTitle').textContent=d.title||'Document';
 $('pdfMeta').textContent=[d.publisher,d.year,d.status].filter(Boolean).join(' · ');
 const source=d.sourceUrl||d.url;elements.source.href=source;
 const isLaw=(window.WRHA_DATA?.legislation||[]).some(l=>l.id===d.id);
 elements.legalAlt.hidden=!isLaw;
 if(isLaw)elements.legalAlt.href='https://lipj.gov.jm/';elements.source.textContent='Publisher / official source ↗';
 elements.download.href=d.url;
 let sameOrigin=false;try{sameOrigin=new URL(d.url,location.href).origin===location.origin}catch{}
 const isPDF=d.format!=='page'&&(/\.pdf(?:[?#]|$)/i.test(d.url)||/\/download\/?(?:[?#]|$)/i.test(d.url)||d.format==='pdf');
 elements.download.hidden=!isPDF;
 if(isPDF){
  if(sameOrigin){elements.download.setAttribute('download',pdfFileName(d));elements.download.textContent='Download PDF ↓';}
  else{elements.download.removeAttribute('download');elements.download.textContent='Open / download PDF ↗';elements.download.title='The publisher controls whether your browser opens or downloads this PDF.';}
 }else{elements.download.removeAttribute('download');}
 if(!modal.open)modal.showModal();
 $('closePdf').focus();
 if(!isPDF){
  elements.web.querySelector('h3').textContent='Official web resource';elements.web.querySelector('p').textContent='This entry is a webpage or collection of links, not a verified downloadable PDF. We will not present it as a PDF or invent a download.';
  setMode('web');elements.webLink.href=d.url;setStatus('This record is an official webpage or index, not a verified PDF. No PDF download is shown.');
  updateControls();
 }else if(d.fileSizeNote){
   // Do not attempt to stream and render 25–85MB public files in the small modal:
   // publisher may block cross-origin streaming or use attachment disposition.
   // Show real first-page preview if one was previously generated and explicit
   // access to the complete official PDF; preserve native reading for normal PDFs.
   restrictedFallback(d.url,'This is a large external PDF ('+d.fileSizeNote+'). To avoid an unresponsive reader or automatic download, the original publisher PDF link is provided.');
 }else{setMode('loading');loadPdf(d);}
}
async function search(){
 if(!pdf||finding)return;const q=elements.search.value.trim().toLocaleLowerCase();
 if(!q){setStatus('Type a word or phrase to search this document.');return;}
 const version=session;finding=true;elements.find.disabled=true;setStatus('Searching document text…');
 try{
  const start=currentPage,order=[...Array(pageCount)].map((_,i)=>(start+i)%pageCount+1);
  for(const n of order){
   const page=await pdf.getPage(n);
   const text=await page.getTextContent();
   if(session!==version)return;
   const body=text.items.map(x=>x.str||'').join(' ').toLocaleLowerCase();
   if(body.includes(q)){await render(n);setStatus('Found “'+q+'” on page '+n+' of '+pageCount+'.');return;}
  }
  setStatus('No matching selectable text found. Scanned pages may not be searchable.');
 }catch(e){setStatus('Text search is unavailable for this document.');}
 finally{finding=false;elements.find.disabled=mode!=='pdfjs'}
}
$('closePdf').addEventListener('click',()=>modal.close());
modal.addEventListener('close',destroy);
modal.addEventListener('click',e=>{if(e.target===modal)modal.close()});
elements.prev.addEventListener('click',()=>navigate(currentPage-1));
elements.next.addEventListener('click',()=>navigate(currentPage+1));
$('goPdfPage').addEventListener('click',()=>navigate(elements.page.value));
elements.page.addEventListener('keydown',e=>{if(e.key==='Enter')navigate(elements.page.value)});
elements.zoom.addEventListener('change',()=>{if(mode==='pdfjs')render(currentPage);else if(mode==='blocked')setStatus('Zoom is only available for PDFs rendered within the reader.')});
elements.find.addEventListener('click',search);
elements.search.addEventListener('keydown',e=>{if(e.key==='Enter')search()});
elements.fullscreen.addEventListener('click',async()=>{
 try{if(document.fullscreenElement){await document.exitFullscreen();return;}await modal.requestFullscreen();}catch(e){setStatus('Fullscreen is unavailable. You can still enlarge your browser window.')}
});
window.addEventListener('resize',()=>{if(pdf&&mode==='pdfjs'&&['auto','page-width'].includes(elements.zoom.value))render(currentPage)});
window.WRHA_DocViewer={open,close:()=>modal.close()};
})();
