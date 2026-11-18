/* WRHA Interactive Document Reader v2 — adapted from MOHW Social Support. Client-side PDF.js; explicit publisher fallback.
   We do not proxy or copy copyright-protected MOHW PDFs.
 */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const modal=$('pdfDialog');if(!modal)return;
const elements={
 frame:$('pdfFrame'),scroller:$('pdfCanvasScroll'),surface:$('pdfPageSurface'),loading:$('pdfLoading'),status:$('pdfStatus'),
 web:$('pdfWebResource'),webLink:$('pdfWebLink'),blocked:$('pdfBlocked'),page:$('pdfPage'),
 total:$('pdfTotal'),zoom:$('pdfZoom'),search:$('pdfSearch'),
 prev:$('pdfPrevious'),next:$('pdfNext'),find:$('pdfFindButton'),
 fullscreen:$('pdfFullScreen'),source:$('pdfSource'),download:$('pdfDownload'),legalAlt:$('pdfLegalAlt')
};
let current=null,pdf=null,task=null,currentPage=1,session=0,finding=false,mode='closed',pageCount=0,collectionTrail=[],ownedBlob=null,directFetch=null,initialPaint=false,embedRoutes=[],embedIndex=0,embedTimer=null,embedToken=0;
const pdfFileName=(d)=>((d.title||'document').replace(/[^a-z0-9\s_-]+/gi,'').trim().replace(/\s+/g,'_').slice(0,85)||'document')+'.pdf';
function setStatus(message){elements.status.textContent=message;}
const scroll=elements.scroller,book=elements.surface,tools=$('pdfTools'),synth=window.speechSynthesis;
const prefsKey='wrha-reader-prefs-v1';let prefs={sound:true,spread:true,rate:1,voice:'',contrast:false,motion:false,size:'normal'};
try{prefs={...prefs,...JSON.parse(localStorage.getItem(prefsKey)||'{}')}}catch(_){}
const save=()=>{try{localStorage.setItem(prefsKey,JSON.stringify(prefs))}catch(_){}};
const persistKey=()=>current?'wrha-reader-page:'+new URL(current.url,location.href).href:'';
let activeLegalAlternate=false;
function legalEdition(text=''){const box=$('pdfLegalEdition');box.hidden=!text;$('pdfLegalEditionText').textContent=text}
function remember(){try{if(current&&!current.deviceCopy&&!activeLegalAlternate&&pageCount&&book.querySelector('.reader-page-surface'))localStorage.setItem(persistKey(),String(currentPage))}catch(_){}}
function restore(){try{if(current?.deviceCopy)return 1;return Number(localStorage.getItem(persistKey()))||1}catch(_){return 1}}
let libPromise,lib,renderEpoch=0,jobs=[],busy=false,reading=false,speechEpoch=0,settleSpeech=null,audio=null,paperBuffer=null,sound=prefs.sound!==false,outline=[],lastSearch='',lastMatch=0,resizeTimer,layoutKey='',suppressClick=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const full=()=>document.fullscreenElement===modal||modal.classList.contains('wrha-reader-full');
const canSpread=()=>scroll.clientWidth>=760&&scroll.clientHeight>=330;
const spread=()=>prefs.spread&&canSpread();
const clamp=n=>Math.max(1,Math.min(pageCount||1,Math.trunc(Number(n))||1));
function align(n){n=clamp(n);return spread()&&n>1?n-n%2:n}
function targets(n=currentPage){return spread()&&n>1&&n<pageCount?[n,n+1]:[n]}
function closeTools(focus=false){tools.open=false;if(focus)tools.querySelector('summary')?.focus()}
function measurePanel(){const a=modal.getBoundingClientRect(),b=$('pdfToolbar').getBoundingClientRect();modal.style.setProperty('--wrha-tools-space',Math.max(72,Math.floor(a.bottom-b.bottom-8))+'px')}
tools.addEventListener('toggle',measurePanel);
function syncFull(){const b=elements.fullscreen;b.textContent=full()?'Exit full screen':'Full screen';b.setAttribute('aria-pressed',String(full()))}
function syncPrefs(){sound=prefs.sound!==false;$('pdfSound').textContent=sound?'Sound on':'Sound off';$('pdfSound').setAttribute('aria-pressed',String(sound));$('pdfContrast').checked=!!prefs.contrast;$('pdfMotion').checked=!!prefs.motion;$('pdfTextSize').value=prefs.size;$('pdfRate').value=String(prefs.rate);modal.classList.toggle('wrha-reader-contrast',!!prefs.contrast);modal.classList.toggle('wrha-reader-motion',!!prefs.motion);modal.dataset.readerSize=prefs.size}
syncPrefs();
function unlockPaperAudio(){if(!sound)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio=audio||new AC();if(audio.state!=='running')audio.resume().catch(()=>{})}catch(_){}}
function paperTexture(ctx){
 const length=Math.floor(ctx.sampleRate*.56),buffer=ctx.createBuffer(1,length,ctx.sampleRate),out=buffer.getChannelData(0);
 let low=0,fast=0,slow=0;
 const grains=[[.09,.018,.17],[.17,.032,.20],[.27,.024,.12],[.35,.020,.14],[.44,.014,.16]];
 for(let i=0;i<length;i++){
  const t=i/ctx.sampleRate,x=Math.random()*2-1,y=Math.random()*2-1;
  low=.94*low+.06*x;fast=.48*fast+.52*y;slow=.84*slow+.16*fast;
  const broad=Math.pow(Math.sin(Math.PI*Math.min(1,t/.56)),1.7);
  const sweep=(.65+.35*Math.min(1,t/.20))*(1-.45*Math.max(0,(t-.26)/.30));
  let fibre=0;for(const [at,width,weight] of grains)fibre+=weight*Math.exp(-Math.pow((t-at)/width,2));
  out[i]=(low*.64+(fast-slow)*(.33+fibre))*broad*sweep;
 }
 return buffer;
}
function rustle(direction){
 if(!sound||!audio||audio.state!=='running'||reading||synth?.speaking)return;
 try{
  const t=audio.currentTime,src=audio.createBufferSource(),hp=audio.createBiquadFilter(),lp=audio.createBiquadFilter(),gain=audio.createGain();
  if(!paperBuffer)paperBuffer=paperTexture(audio);src.buffer=paperBuffer;
  hp.type='highpass';hp.frequency.value=310;hp.Q.value=.55;
  lp.type='lowpass';lp.Q.value=.55;lp.frequency.setValueAtTime(1500,t);lp.frequency.linearRampToValueAtTime(3600,t+.21);lp.frequency.linearRampToValueAtTime(1300,t+.56);
  gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.43,t+.06);gain.gain.linearRampToValueAtTime(.36,t+.28);gain.gain.linearRampToValueAtTime(0,t+.56);
  src.connect(hp);hp.connect(lp);lp.connect(gain);
  let pan=null;
  if(typeof audio.createStereoPanner==='function'){
   pan=audio.createStereoPanner();const side=direction<0?1:-1;
   pan.pan.setValueAtTime(side*.72,t);pan.pan.linearRampToValueAtTime(-side*.72,t+.52);gain.connect(pan);pan.connect(audio.destination);
  }else gain.connect(audio.destination);
  src.onended=()=>{for(const node of [src,hp,lp,gain,pan])node?.disconnect()};src.start(t);
 }catch(_){}
}

function getLibrary(){if(!libPromise)libPromise=import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs').then(m=>{m.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';return m}).catch(e=>{libPromise=null;throw e});return libPromise}
function cancelJobs(){for(const j of jobs){try{j.cancel()}catch(_){}}jobs=[]}
function setMode(value){mode=value;$('pdfImagePane').hidden=value!=='image';$('pdfRetry').disabled=!!current?.deviceCopy;scroll.hidden=value!=='pdfjs';elements.frame.hidden=value!=='native';$('pdfEmbeddedBar').hidden=value!=='native';elements.web.hidden=value!=='web';elements.blocked.hidden=value!=='blocked';elements.loading.hidden=value!=='loading';$('pdfRetry').hidden=value!=='blocked'&&value!=='native';modal.classList.toggle('wrha-native-mode',value==='native'||value==='image');updateControls()}
function stopReading(message='Audio stopped.'){speechEpoch++;reading=false;const done=settleSpeech;settleSpeech=null;try{synth?.cancel()}catch(_){}done?.(false);$('pdfAudioStatus').textContent=message;updateAudioButtons()}
function destroy(){remember();activeLegalAlternate=false;legalEdition();session++;renderEpoch++;const image=$('pdfSourceImage');image.onload=null;image.onerror=null;image.removeAttribute('src');$('pdfImagePane').hidden=true;clearTimeout(embedTimer);embedToken++;embedRoutes=[];embedIndex=0;elements.frame.onload=null;elements.frame.onerror=null;directFetch?.abort();directFetch=null;initialPaint=false;cancelJobs();stopReading('');busy=false;clearTimeout(resizeTimer);const oldTask=task;task=null;pdf=null;if(oldTask)try{Promise.resolve(oldTask.destroy()).catch(()=>{})}catch(_){}if(ownedBlob){URL.revokeObjectURL(ownedBlob);ownedBlob=null}current=null;pageCount=0;mode='closed';finding=false;lastSearch='';lastMatch=0;outline=[];elements.frame.src='about:blank';elements.frame.hidden=true;$('pdfEmbeddedBar').hidden=true;modal.classList.remove('wrha-native-mode');scroll.hidden=true;elements.web.hidden=true;elements.blocked.hidden=true;elements.loading.hidden=true;book.replaceChildren();$('pdfTranscript').textContent='';$('pdfTranscript').hidden=true;$('pdfTranscriptToggle').textContent='Show page text';$('pdfTranscriptToggle').setAttribute('aria-expanded','false');$('pdfOutline').replaceChildren(new Option('No bookmarks available',''));closeTools();layoutKey='';updateControls()}
function updateAudioButtons(){const available=mode==='pdfjs'&&!!synth&&!!window.SpeechSynthesisUtterance;$('pdfListen').disabled=!available||busy&&!reading;$('pdfReadAll').disabled=!available||busy;$('pdfPause').disabled=!available||!reading;$('pdfStop').disabled=!available||!reading;$('pdfPause').textContent=synth?.paused?'Resume':'Pause';$('pdfListen').textContent=reading?'Stop':'Listen';$('pdfListen').title=reading?'Stop narration':'Listen to the visible page(s). More audio options are under Tools.';$('pdfListen').setAttribute('aria-label',reading?'Stop narration':'Listen to the current page')}
function updateControls(){const advanced=mode==='pdfjs';const nums=targets();elements.page.value=String(currentPage);elements.total.textContent=pageCount?'/ '+pageCount:'/ —';$('pdfCount').textContent=mode==='native'?'Embedded document':pageCount?'Page '+currentPage+(nums.length===2?'–'+nums[1]:'')+' / '+pageCount:'Page —';elements.prev.disabled=!advanced||busy||currentPage<=1;elements.next.disabled=!advanced||busy||(nums.at(-1)>=pageCount);for(const e of [elements.page,elements.zoom,elements.search,$('goPdfPage'),$('pdfZoomIn'),$('pdfZoomOut'),$('pdfTranscriptToggle')])e.disabled=!advanced;elements.find.disabled=!advanced||finding;$('pdfLayout').disabled=!advanced||busy||!canSpread();$('pdfLayout').textContent=spread()?'One page':canSpread()?'Two pages':'Two pages (wide)';$('pdfLayout').setAttribute('aria-pressed',String(spread()));$('pdfOutline').disabled=!advanced||!outline.length;$('pdfPrint').disabled=!current||!advanced&&elements.download.hidden;updateAudioButtons()}
function getText(content){return content.items.map(i=>(i.str||'')+(i.hasEOL?'\n':' ')).join('').trim()}
async function pageText(n,ref){const p=await ref.getPage(n);return getText(await p.getTextContent())}
async function transcript(){if(!pdf||$('pdfTranscript').hidden)return;const version=session,at=currentPage,ref=pdf;try{const t=await Promise.all(targets().map(async n=>'Page '+n+'\n'+(await pageText(n,ref)||'No extractable text; an accessible text layer is required.')));if(version===session&&at===currentPage)$('pdfTranscript').textContent=t.join('\n\n')}catch(_){if(version===session)$('pdfTranscript').textContent='Page text could not be extracted.'}}
async function render(n,direction=0,{narrating=false}={}){if(!pdf||!current||mode!=='pdfjs')return false;
 const version=session,stamp=++renderEpoch,ref=pdf;cancelJobs();currentPage=align(n);busy=true;updateControls();
 const stay=()=>version===session&&stamp===renderEpoch&&ref===pdf;
 let overlay=null;const old=direction?Array.from(book.querySelectorAll('.reader-page-surface')).at(direction>0?-1:0):null;
 if(old&&!reduced.matches&&!prefs.motion){const orig=old.querySelector('canvas');if(orig){overlay=document.createElement('canvas');overlay.width=orig.width;overlay.height=orig.height;overlay.getContext('2d').drawImage(orig,0,0);overlay.className='wrha-reader-turn'+(direction<0?' back':'');overlay.style.width=old.offsetWidth+'px';overlay.style.height=old.offsetHeight+'px';overlay.style.left=old.offsetLeft+'px';overlay.style.transformOrigin=direction>0?'left center':'right center'}}
 try{const nums=targets(),pages=await Promise.all(nums.map(x=>ref.getPage(x)));if(!stay())return false;const cs=getComputedStyle(scroll),px=k=>parseFloat(cs[k])||0,w=Math.max(1,scroll.clientWidth-px('paddingLeft')-px('paddingRight')-6),h=Math.max(1,scroll.clientHeight-px('paddingTop')-px('paddingBottom')-4);const raw=pages.map(p=>p.getViewport({scale:1})),sum=raw.reduce((a,b)=>a+b.width,0),maxH=Math.max(...raw.map(v=>v.height)),fitW=Math.max(.01,(w-4*(nums.length-1))/sum),fit=Math.min(fitW,h/maxH),choice=elements.zoom.value,scale=choice==='page-width'?fitW:choice==='auto'?fit:fit*(Number(choice)||100)/100;
 const boxes=await Promise.all(pages.map(async(p,i)=>{const viewport=p.getViewport({scale}),dpr=Math.min(3,devicePixelRatio||1,Math.sqrt(12000000/Math.max(1,viewport.width*viewport.height))),box=document.createElement('div'),canvas=document.createElement('canvas'),layer=document.createElement('div');box.className='reader-page-surface';box.style.width=Math.floor(viewport.width)+'px';box.style.height=Math.floor(viewport.height)+'px';box.setAttribute('role','group');box.setAttribute('aria-label','Page '+nums[i]);canvas.setAttribute('aria-label','Visual PDF page '+nums[i]);canvas.setAttribute('role','img');canvas.width=Math.max(1,Math.ceil(viewport.width*dpr));canvas.height=Math.max(1,Math.ceil(viewport.height*dpr));canvas.style.width='100%';canvas.style.height='100%';layer.className='textLayer';layer.style.setProperty('--scale-factor',String(scale));box.append(canvas,layer);if(!stay())return null;const job=p.render({canvasContext:canvas.getContext('2d',{alpha:false}),viewport,transform:[dpr,0,0,dpr,0,0]});jobs.push(job);await job.promise;if(!stay())return null;
 try{const text=await p.getTextContent();if(!stay())return null;const tl=new lib.TextLayer({textContentSource:text,container:layer,viewport});jobs.push(tl);await tl.render()}catch(_){layer.replaceChildren()}return box}));
 if(!stay())return false;book.replaceChildren(...boxes.filter(Boolean));remember();if(overlay){book.append(overlay);overlay.addEventListener('animationend',()=>overlay.remove(),{once:true});setTimeout(()=>overlay.remove(),800)}if(direction){scroll.scrollTop=0;scroll.scrollLeft=0;if(!narrating)rustle(direction)}setStatus('');transcript();return true;
 }catch(e){if(stay()&&e?.name!=='RenderingCancelledException'){book.replaceChildren();setStatus('Page '+currentPage+' could not be rendered. Try another page, change zoom to retry, or open the original PDF.');}return false}finally{if(stay()){busy=false;jobs=[];updateControls()}}}
function navigate(num,dir=0){if(!pdf||mode!=='pdfjs'||busy||finding)return;const n=align(num);if(n===currentPage)return;stopReading('');unlockPaperAudio();render(n,dir||Math.sign(n-currentPage))}
function step(dir){if(dir>0&&targets().at(-1)>=pageCount||dir<0&&currentPage<=1)return;const target=dir>0?targets().at(-1)+1:currentPage-1;navigate(target,dir)}
function fillVoices(){const sel=$('pdfVoice'),voices=synth?.getVoices()||[];sel.replaceChildren(new Option('Device default',''));for(const voice of [...voices].sort((a,b)=>Number(/^en-JM/i.test(b.lang))-Number(/^en-JM/i.test(a.lang))||Number(/^en/i.test(b.lang))-Number(/^en/i.test(a.lang))))sel.add(new Option(voice.name+' ('+voice.lang+')',voice.voiceURI));sel.value=voices.some(v=>v.voiceURI===prefs.voice)?prefs.voice:''}
fillVoices();synth?.addEventListener?.('voiceschanged',fillVoices);
function speak(text,token){return new Promise(resolve=>{if(token!==speechEpoch){resolve(false);return}const u=new SpeechSynthesisUtterance(text);const voices=synth.getVoices(),voice=voices.find(x=>x.voiceURI===prefs.voice)||voices.find(x=>/^en-JM/i.test(x.lang))||voices.find(x=>/^en/i.test(x.lang));if(voice){u.voice=voice;u.lang=voice.lang}else u.lang='en';u.rate=Number(prefs.rate)||1;const done=ok=>{if(settleSpeech===done)settleSpeech=null;resolve(ok)};settleSpeech=done;u.onend=()=>done(true);u.onerror=()=>done(false);try{synth.speak(u)}catch(_){done(false)}})}
async function read(all){if(!pdf||busy||!synth||!window.SpeechSynthesisUtterance){$('pdfAudioStatus').textContent='Narration is unavailable in this browser.';return}stopReading('');const token=speechEpoch,ref=pdf,start=currentPage,end=all?pageCount:targets().at(-1);reading=true;updateAudioButtons();let spoken=false,skipped=0;
 try{for(let n=start;n<=end;n++){if(token!==speechEpoch||ref!==pdf)return;const t=await pageText(n,ref);if(token!==speechEpoch||ref!==pdf)return;if(!t){skipped++;$('pdfAudioStatus').textContent='Page '+n+' has no extractable text.';continue}if(!targets().includes(n))await render(n,1,{narrating:true});if(token!==speechEpoch||ref!==pdf)return;$('pdfAudioStatus').textContent='Reading page '+n+' of '+pageCount;if(!$('pdfTranscript').hidden)$('pdfTranscript').textContent='Page '+n+'\n'+t;const words=t.split(/\s+/);let chunk='';const chunks=[];for(const word of words){if(chunk.length+word.length>800&&chunk){chunks.push(chunk);chunk=''}chunk+=(chunk?' ':'')+word}if(chunk)chunks.push(chunk);for(const part of chunks){if(token!==speechEpoch)return;if(!await speak(part,token)){if(token===speechEpoch)$('pdfAudioStatus').textContent='Narration interrupted or unavailable. Try Listen again.';return}spoken=true}}
 if(token===speechEpoch)$('pdfAudioStatus').textContent=spoken?'Reading finished.'+(skipped?' '+skipped+' page(s) had no extractable text.':''):'No extractable text on selected pages. An accessible text layer is needed.';
 }catch(_){if(token===speechEpoch)$('pdfAudioStatus').textContent='Page text could not be read.'}finally{if(token===speechEpoch){reading=false;updateAudioButtons()}}}
async function loadOutline(ref,version){try{const nodes=await ref.getOutline();if(session!==version||ref!==pdf)return;outline=[];function collect(list,depth=0){for(const x of list||[]){if(x.dest)outline.push({title:'  '.repeat(Math.min(depth,5))+(x.title||'Chapter'),dest:x.dest});collect(x.items,depth+1)}}collect(nodes);const el=$('pdfOutline');el.replaceChildren(new Option(outline.length?'Select a chapter':'No bookmarks available',''));outline.forEach((x,i)=>el.add(new Option(x.title,String(i))));updateControls()}catch(_){}}

// Only public, existing catalogue URLs are eligible for remote embedding.
function publicEmbedURL(d,url){if(d?.deviceCopy||!d?.url)return null;
 const listed=[...(window.WRHA_DATA?.manuals||[]),...(window.WRHA_DATA?.legislation||[])].some(x=>x.id===d.id&&x.url===d.url);
 if(!listed)return null;
 try{const u=new URL(url,location.href);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash)return null;return u.href}catch(_){return null}
}
function embeddedOptions(d,url){const safe=publicEmbedURL(d,url);if(!safe)return [];
 // Google previews cannot establish that the actual publication was retrieved.
 // Only attempt a native browser viewer for an explicit PDF on a supporting device.
 const mobile=matchMedia('(pointer: coarse)').matches||/Android|iPhone|iPad/i.test(navigator.userAgent||'');
 if(mobile||navigator.pdfViewerEnabled!==true||!/\.pdf$/i.test(new URL(safe).pathname))return [];
 return [{kind:'native',url:safe+'#view=FitH',label:'Browser PDF viewer'}];
}
function openEmbedded(index=0){if(!current||!embedRoutes.length)return;clearTimeout(embedTimer);const version=session,token=++embedToken;embedIndex=index%embedRoutes.length;const route=embedRoutes[embedIndex];const active=()=>version===session&&token===embedToken&&mode==='native';
 setMode('native');$('pdfEmbeddedMode').textContent='Opening '+route.label+'…';$('pdfAlternateEmbed').hidden=embedRoutes.length<2;$('pdfRetryEmbed').hidden=true;setStatus('');
 // Never redirect the parent or intentionally start a download. Browser-native PDF
 // plugins may themselves refuse sandboxed embedding; the alternate viewer remains available.
 elements.frame.setAttribute('sandbox','allow-scripts allow-same-origin');
 elements.frame.title='Official document — '+route.label;
 elements.frame.onload=()=>{if(!active())return;clearTimeout(embedTimer);$('pdfEmbeddedMode').textContent=route.label;$('pdfRetryEmbed').hidden=false;setStatus('')};
 elements.frame.onerror=()=>{if(!active())return;clearTimeout(embedTimer);if(embedIndex===0&&embedRoutes.length>1)openEmbedded(1);else{$('pdfEmbeddedMode').textContent='Embedded viewer unavailable';$('pdfRetryEmbed').hidden=false;setStatus('You can switch viewers or use Download PDF under Tools.')}};
 embedTimer=setTimeout(()=>{if(!active())return;$('pdfRetryEmbed').hidden=false;if(embedIndex===0&&embedRoutes.length>1)openEmbedded(1);else{$('pdfEmbeddedMode').textContent=route.label;setStatus('If the document does not appear, switch viewers or use Download PDF under Tools.')}},18000);
 elements.frame.src=route.url;
}
function restrictedFallback(url,reason){if(!current)return;
 busy=false;pageCount=0;initialPaint=false;book.replaceChildren();embedRoutes=embeddedOptions(current,url);
 if(embedRoutes.length){window.WRHA_READER_AVAIL?.mark(current,'fallback');openEmbedded(0);return}
 window.WRHA_READER_AVAIL?.mark(current,'blocked');setMode('blocked');$('pdfRetryInline').hidden=!!current.deviceCopy;setStatus(current.deviceCopy?'The selected file could not be opened. Choose another PDF in Tools.':'This source could not be loaded. Retry or use Download PDF in Tools.');
}
function showCollection(d){
 const info=window.WRHA_READER_SOURCES?.collection(d.id),items=$('pdfCollectionItems'),source=window.WRHA_READER_SOURCES;
 items.replaceChildren();elements.web.querySelector('h3').textContent=d.title||'Official resource';
 elements.web.querySelector('p').textContent=info?.intro||'This official source is a web resource rather than a downloadable PDF.';
 const entries=[...new Set(info?.ids||[])].map(id=>source?.get(id)).filter(entry=>entry&&entry.id!==d.id).sort((a,b)=>(window.WRHA_READER_AVAIL?.priority(a)??0)-(window.WRHA_READER_AVAIL?.priority(b)??0));
 elements.webLink.href=d.sourceUrl||d.url;elements.webLink.textContent='Official source ↗';$('pdfCollectionBack').hidden=!collectionTrail.length;setMode('web');setStatus('');
 if(entries.length&&window.WRHA_RESOURCE_CARDS){window.WRHA_RESOURCE_CARDS.mount(items,entries,entry=>{if(!entry)return;collectionTrail.push(d);open(entry,true)})}
 if(info?.note){const note=document.createElement('p');note.className='wrha-collection-note';note.textContent=info.note;items.prepend(note)}
 if(!entries.length){const note=document.createElement('p');note.className='wrha-collection-note';note.textContent='This is a web resource; the publisher has not supplied an individual PDF for this entry.';items.append(note)}
}
function backToCollection(){const previous=collectionTrail.pop();if(previous)open(previous,true)}
/* Some public servers reject PDF.js range requests but permit an ordinary CORS GET.
 * Try a bounded full transfer without range headers, then render the exact returned bytes.
 * No credentials, no third-party proxy; CORS and real access restrictions still apply. */
async function fetchPdfBytes(url,version){const abort=new AbortController();directFetch=abort;const timer=setTimeout(()=>abort.abort(),current?.fileSizeNote?35000:18000),max=150*1024*1024;let reader;
try{const response=await fetch(url,{mode:'cors',credentials:'omit',signal:abort.signal});if(!response.ok)throw Error('HTTP '+response.status);const size=Number(response.headers.get('content-length'));if(size>max)throw Error('Document exceeds device reader limit');const chunks=[];let length=0;
if(response.body){reader=response.body.getReader();while(true){if(session!==version)throw Error('Cancelled');const x=await reader.read();if(x.done)break;length+=x.value.byteLength;if(length>max)throw Error('Document exceeds device reader limit');chunks.push(x.value)}const data=new Uint8Array(length);let offset=0;for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.byteLength}if(!new TextDecoder().decode(data.subarray(0,1024)).includes('%PDF-'))throw Error('Not a PDF');return data}
const data=new Uint8Array(await response.arrayBuffer());if(data.length>max||!new TextDecoder().decode(data.subarray(0,1024)).includes('%PDF-'))throw Error('Not a supported PDF');return data
}finally{clearTimeout(timer);abort.abort();try{await reader?.cancel()}catch(_){}if(directFetch===abort)directFetch=null}}
async function loadPdf(d){const version=session,original=d.url;
 try{lib=await getLibrary()}catch(_){if(version===session)restrictedFallback(original,'The reader could not load.');return}
 if(version!==session)return;
 const routes=window.WRHA_READER_SOURCES?.readerCandidates(d)||[{url:original,label:'Original publisher document'}];let lastError;
 for(const route of routes){
  const downloadEndpoint=/ncdip\.moh\.gov\.jm\/download\//i.test(route.url)||route.legalAlternate||!!d.alternateLegalSources?.length;
  for(const method of route.delivery?['stream']:(downloadEndpoint?['stream','bytes']:['url','stream','bytes'])){
   if(version!==session)return;
   try{
    setStatus(method==='bytes'?'Trying a direct document transfer…':'Opening '+route.label.toLowerCase()+' in the WRHA reader…');
    const opts={isEvalSupported:false,enableXfa:false};
    if(method==='url')Object.assign(opts,{url:route.url,withCredentials:false,disableAutoFetch:true,disableStream:true});
    else if(method==='stream')Object.assign(opts,{url:route.url,withCredentials:false,disableRange:true,disableAutoFetch:false,disableStream:false});
    else opts.data=await fetchPdfBytes(route.url,version);
    if(version!==session)return;
    const loading=lib.getDocument(opts);task=loading;let timer;let handle;try{handle=await Promise.race([loading.promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('PDF loading timed out')),route.delivery?110000:d.fileSizeNote?45000:d.alternateLegalSources?.length?12000:20000)})])}finally{clearTimeout(timer)}
    if(version!==session){try{await loading.destroy()}catch(_){}return}
    pdf=handle;pageCount=pdf.numPages;if(route.pages&&pageCount!==route.pages)throw Error('Alternate publication page count changed');activeLegalAlternate=!!route.legalAlternate;currentPage=route.legalAlternate?1:clamp(restore());initialPaint=true;setMode('pdfjs');
    const same=new URL(route.url,location.href).origin===location.origin;
    elements.download.href=route.url;if(same)elements.download.setAttribute('download',pdfFileName(d));else elements.download.removeAttribute('download');
    elements.download.textContent='Download PDF ↓';elements.download.title='Download the PDF currently displayed.';
    $('pdfMeta').textContent=[d.publisher,d.year,d.status,route.label!=='Original publisher document'?route.label:null].filter(Boolean).join(' · ');if(route.legalAlternate){$('pdfOriginal').href=route.url;elements.download.title='Download this alternate legal edition; check amendments.';legalEdition('Alternate publication: '+route.label);}else legalEdition(d.id==='audit-law-domestic-violence'?'2004-amended copy. Read with the Domestic Violence (Amendment) Act, 2023.':'');
    elements.page.max=String(pageCount);updateControls();let rendered=await render(currentPage);if(version!==session)return;if(rendered===false&&currentPage!==1)rendered=await render(1);if(version!==session)return;initialPaint=false;if(rendered!==true)throw Error('Page could not be rendered');
    window.WRHA_READER_AVAIL?.mark(d,'verified');window.WRHA_READER_SOURCES?.rememberLegalRoute?.(d,route);loadOutline(handle,version);redraw();return;
   }catch(err){if(version!==session)return;lastError=err;initialPaint=false;activeLegalAlternate=false;legalEdition();const failed=task;task=null;pdf=null;try{await failed?.destroy()}catch(_){}if(version!==session)return;setMode('loading');if(/MissingPDFException|HTTP (?:403|404)|Unexpected server response \((?:403|404)\)|Alternate publication page count changed/i.test(String(err?.name)+' '+String(err?.message)))break}
  }
 }
 if(version!==session)return;
 const message=String(lastError?.name||'')+' '+String(lastError?.message||lastError||'');
 restrictedFallback(original,/InvalidPDFException|MissingPDFException|404|not a PDF/i.test(message)?'A readable PDF could not be verified at the source.':'The source did not deliver readable PDF bytes.');
}
function loadImage(d){const version=session,img=$('pdfSourceImage'),origin=window.WRHA_READER_SOURCES?.directUrl(d)||d.url,delivery=window.WRHA_READER_SOURCES?.deliveryUrl(d);const routes=[origin,...(delivery?[delivery]:[])];let i=0;
 const attempt=()=>{if(version!==session)return;if(i>=routes.length){setMode('blocked');setStatus('Image could not be retrieved.');return}
 img.alt=d.title||'Official resource image';img.onload=()=>{if(version!==session)return;setMode('image');setStatus('')};img.onerror=()=>{if(version!==session)return;i++;attempt()};img.src=routes[i]};
 setMode('loading');attempt();
}
function open(d,keepTrail=false){
 if(!d||!d.url)return;
 if(!keepTrail)collectionTrail=[];
 destroy();session++;const version=session;
 if(d.deviceCopy)ownedBlob=d.url;
 $('pdfReturnCollection').hidden=!collectionTrail.length;
 $('pdfCollectionItems').replaceChildren();
 current=d;currentPage=1;pageCount=0;elements.page.value='1';elements.page.removeAttribute('max');
 elements.zoom.value='auto';elements.search.value='';
 $('pdfTitle').textContent=d.title||'Document';
 $('pdfMeta').textContent=[d.publisher,d.year,d.status].filter(Boolean).join(' · ');
 const source=d.sourceUrl||d.url;elements.source.href=source;elements.source.hidden=!!d.deviceCopy;
 const isLaw=(window.WRHA_DATA?.legislation||[]).some(l=>l.id===d.id);
 elements.legalAlt.hidden=!isLaw;
 if(isLaw)elements.legalAlt.href='https://lipj.gov.jm/library';elements.source.textContent='Publisher / official source ↗';
 const direct=window.WRHA_READER_SOURCES?.directUrl(d)||d.url;elements.download.href=direct;elements.download.removeAttribute('title');$('pdfOriginal').href=direct;
 let sameOrigin=false;try{sameOrigin=new URL(d.url,location.href).origin===location.origin}catch{}
 const isImage=d.format==='image';const isPDF=d.format!=='page'&&!isImage&&(/\.pdf(?:[?#]|$)/i.test(d.url)||/\/download\/?(?:[?#]|$)/i.test(d.url)||d.format==='pdf');
 elements.download.hidden=!isPDF&&!isImage;$('pdfOriginal').hidden=(!isPDF&&!isImage)||!!d.deviceCopy;$('pdfPrint').hidden=!isPDF;
 if(isPDF){
  if(sameOrigin){elements.download.setAttribute('download',pdfFileName(d));elements.download.textContent='Download PDF ↓';}
  else{elements.download.removeAttribute('download');elements.download.textContent='Open / download PDF ↗';elements.download.title='The publisher controls whether your browser opens or downloads this PDF.';}
 }else{elements.download.removeAttribute('download');if(isImage)elements.download.textContent='Download image ↓';}
 if(!modal.open)modal.showModal();
 syncFull();measurePanel();unlockPaperAudio();$('closePdf').focus();
 if(isImage)loadImage(d);else if(!isPDF)showCollection(d);else{setMode('loading');loadPdf(d);}
}
async function search(){if(!pdf||finding||busy)return;const q=elements.search.value.trim().toLocaleLowerCase();if(!q){setStatus('Type a word or phrase to search.');return}stopReading('');const version=session,ref=pdf;finding=true;updateControls();setStatus('Searching document text…');try{const start=q===lastSearch&&lastMatch?lastMatch+1:currentPage;for(let i=0;i<pageCount;i++){if(version!==session)return;const n=(start-1+i)%pageCount+1;const t=await pageText(n,ref);if(version!==session)return;if(t.toLocaleLowerCase().replace(/\s+/g,' ').includes(q.replace(/\s+/g,' '))){lastSearch=q;lastMatch=n;closeTools();await render(n,Math.sign(n-currentPage));if(version===session){setStatus('Found “'+q+'” on page '+n+' of '+pageCount+'.');scroll.focus()}return}}if(version===session)setStatus('No matching selectable text found. Scanned pages may not be searchable.')}catch(_){if(version===session)setStatus('Text search is unavailable.')}finally{if(version===session){finding=false;updateControls()}}}
$('pdfReturnCollection').onclick=backToCollection;
$('pdfCollectionBack').onclick=backToCollection;
$('pdfLocalOpen').onclick=()=>{$('pdfLocalFile').value='';$('pdfLocalFile').click()};
$('pdfLocalFile').onchange=async e=>{
 const file=e.target.files?.[0],version=session;if(!file)return;if(file.size>150*1024*1024){setStatus('This device copy exceeds the 150 MB reader limit.');return}
 try{if(!(await file.slice(0,1024).text()).includes('%PDF-')){setStatus('Select a valid PDF file.');return}if(version!==session)return;
 const url=URL.createObjectURL(file);open({id:'device-copy',title:file.name,format:'pdf',url,publisher:'Device copy — not verified as an official edition',deviceCopy:true},true);
 }catch(_){if(version===session)setStatus('The selected PDF could not be opened.')}
};
$('closePdf').addEventListener('click',()=>modal.close());
modal.addEventListener('close',()=>{if(modal.open)return;if(document.fullscreenElement===modal)document.exitFullscreen?.().catch(()=>{});modal.classList.remove('wrha-reader-full');collectionTrail=[];destroy();syncFull()});
modal.addEventListener('cancel',e=>{if(tools.open){e.preventDefault();closeTools(true)}else if(full()){e.preventDefault();elements.fullscreen.click()}});
modal.addEventListener('click',e=>{if(e.target===modal&&!full())modal.close();else if(tools.open&&!tools.contains(e.target)&&e.target!==$('pdfListen'))closeTools()});
for(const type of ['pointerdown','keydown'])modal.addEventListener(type,unlockPaperAudio,{capture:true,passive:true});
elements.prev.onclick=()=>step(-1);elements.next.onclick=()=>step(1);
const jump=()=>{const n=elements.page.value;navigate(n);closeTools(true)};$('goPdfPage').onclick=jump;elements.page.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();jump()}};
elements.zoom.onchange=()=>{if(pdf){scroll.scrollLeft=0;scroll.scrollTop=0;render(currentPage)}};
const zoomSteps=['75','100','125','150','200','250'];function zoomBy(dir){const i=Math.max(0,zoomSteps.indexOf(elements.zoom.value==='auto'||elements.zoom.value==='page-width'?'100':elements.zoom.value));elements.zoom.value=zoomSteps[Math.max(0,Math.min(zoomSteps.length-1,i+dir))];elements.zoom.onchange()}
$('pdfZoomIn').onclick=()=>zoomBy(1);$('pdfZoomOut').onclick=()=>zoomBy(-1);
$('pdfSound').onclick=()=>{prefs.sound=!sound;save();syncPrefs();unlockPaperAudio()};
$('pdfLayout').onclick=()=>{if(!pdf||!canSpread())return;prefs.spread=!prefs.spread;save();render(currentPage)};
$('pdfToolsClose').onclick=()=>closeTools(true);$('pdfRetry').onclick=()=>{if(current&&!current.deviceCopy){const d=current;open(d,true)}};$('pdfRetryInline').onclick=$('pdfRetry').onclick;$('pdfAlternateEmbed').onclick=()=>openEmbedded(embedIndex+1);$('pdfRetryEmbed').onclick=()=>openEmbedded(embedIndex);
elements.find.onclick=search;elements.search.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();search()}};
$('pdfOutline').onchange=async()=>{const val=$('pdfOutline').value,ref=pdf,version=session;if(val===''||!ref)return;try{const dest=outline[Number(val)].dest,ary=typeof dest==='string'?await ref.getDestination(dest):dest;if(!ary)return;const i=typeof ary[0]==='number'?ary[0]:await ref.getPageIndex(ary[0]);if(version!==session)return;closeTools(true);navigate(i+1)}catch(_){if(version===session)setStatus('This bookmark could not be opened.')}};
$('pdfVoice').onchange=e=>{prefs.voice=e.target.value;save()};$('pdfRate').onchange=e=>{prefs.rate=Number(e.target.value);save()};
$('pdfContrast').onchange=e=>{prefs.contrast=e.target.checked;save();syncPrefs()};$('pdfMotion').onchange=e=>{prefs.motion=e.target.checked;save();syncPrefs()};$('pdfTextSize').onchange=e=>{prefs.size=e.target.value;save();syncPrefs();redraw(true)};
$('pdfTranscriptToggle').onclick=()=>{const el=$('pdfTranscript');el.hidden=!el.hidden;$('pdfTranscriptToggle').setAttribute('aria-expanded',String(!el.hidden));$('pdfTranscriptToggle').textContent=el.hidden?'Show page text':'Hide page text';transcript()};
$('pdfListen').onclick=()=>{if(reading)stopReading();else read(false)};$('pdfReadAll').onclick=()=>read(true);$('pdfPause').onclick=()=>{if(!reading)return;if(synth.paused){synth.resume();$('pdfAudioStatus').textContent='Reading aloud.'}else{synth.pause();$('pdfAudioStatus').textContent='Paused.'}updateAudioButtons()};$('pdfStop').onclick=()=>stopReading();
$('pdfPrint').onclick=()=>{if(current){window.open(window.WRHA_READER_SOURCES?.directUrl(current)||new URL(current.url,location.href).href,'_blank','noopener');setStatus('Use the original PDF viewer’s Print command.')}};
elements.download.addEventListener('click',async e=>{if(!pdf||!current||elements.download.hasAttribute('download'))return;e.preventDefault();const ref=pdf,version=session,name=pdfFileName(current);setStatus('Preparing PDF download…');try{const data=await ref.getData();if(version!==session)return;const url=URL.createObjectURL(new Blob([data],{type:'application/pdf'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);setStatus('PDF download requested.')}catch(_){if(version===session)setStatus('Download could not be prepared. Use Open original PDF.')}});
elements.fullscreen.onclick=async()=>{closeTools();if(document.fullscreenElement===modal){try{await document.exitFullscreen()}catch(_){}return}if(modal.classList.contains('wrha-reader-full')){modal.classList.remove('wrha-reader-full');syncFull();redraw(true);return}try{if(!modal.requestFullscreen)throw Error();await modal.requestFullscreen()}catch(_){modal.classList.add('wrha-reader-full');syncFull();redraw(true)}};
document.addEventListener('fullscreenchange',()=>{syncFull();redraw(true)});
modal.addEventListener('keydown',e=>{if(e.key==='Escape'&&tools.open){e.preventDefault();e.stopPropagation();closeTools(true);return}if(e.target.closest('input,select,button,summary,a,[contenteditable],#pdfTranscript')||mode!=='pdfjs')return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();step(e.key==='ArrowRight'?1:-1)}else if(e.key==='Home'||e.key==='End'){e.preventDefault();navigate(e.key==='Home'?1:pageCount)}});
let touch=null;book.addEventListener('touchstart',e=>{touch=e.touches.length===1&&elements.zoom.value==='auto'?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null},{passive:true});book.addEventListener('touchcancel',()=>touch=null,{passive:true});book.addEventListener('touchend',e=>{if(!touch)return;const t=e.changedTouches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y;touch=null;if(Math.abs(dx)>55&&Math.abs(dx)>1.5*Math.abs(dy)){suppressClick=Date.now()+500;step(dx<0?1:-1)}},{passive:true});book.addEventListener('click',e=>{if(Date.now()<suppressClick||elements.zoom.value!=='auto'||String(getSelection()).length)return;const r=book.getBoundingClientRect(),x=e.clientX-r.left;if(x<r.width*.15)step(-1);else if(x>r.width*.85)step(1)});
function redraw(force=false){if(modal.open)measurePanel();if(initialPaint)return;const key=[scroll.clientWidth,scroll.clientHeight,spread()].join('|');if(force!==true&&key===layoutKey)return;layoutKey=key;clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(!initialPaint&&pdf&&modal.open&&mode==='pdfjs'&&scroll.clientWidth&&scroll.clientHeight)render(currentPage)},120)}
window.addEventListener('resize',()=>redraw());window.visualViewport?.addEventListener('resize',()=>redraw());if(window.ResizeObserver)new ResizeObserver(()=>redraw()).observe(scroll);
window.addEventListener('pagehide',()=>{remember();stopReading('')});syncFull();

window.WRHA_DocViewer={open,close:()=>modal.close()};
})();
