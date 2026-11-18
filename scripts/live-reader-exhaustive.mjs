import { chromium } from 'playwright';
import fs from 'node:fs';
import crypto from 'node:crypto';
const base='https://glenroygriffiths876-collab.github.io/WRHA-Manual-Resource-Hub/';
const manifest=JSON.parse(fs.readFileSync('document-library-manifest.js','utf8').match(/Object\.freeze\((\{[\s\S]*\})\);/)[1]);
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
fs.mkdirSync('artifacts/live-reader',{recursive:true});
const results=[];const shard=Number(process.env.SHARD_INDEX||0),shards=Number(process.env.SHARD_COUNT||1);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let seed;
try{
 // Poll the real production manifest until the expected publication is available.
 for(let i=0;i<30;i++){
  try{const r=await fetch(base+'document-library-manifest.js?verify='+Date.now(),{cache:'no-store'});const m=JSON.parse((await r.text()).match(/Object\.freeze\((\{[\s\S]*\})\);/)[1]);
   if(Object.entries(manifest).every(([id,v])=>m[id]?.sha256===v.sha256)){seed=true;break;}
  }catch{}
  await sleep(10000);
 }
 if(!seed)throw Error('Production has not yet deployed expected local manifest');
 const ctx=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});
 const p=await ctx.newPage();await p.goto(base+'?liveaudit='+Date.now(),{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>window.WRHA_DATA&&window.WRHA_DocViewer&&window.WRHA_LIBRARY_MANIFEST);
 const all=await p.evaluate(()=>[...window.WRHA_DATA.manuals.map(d=>({id:d.id,title:d.title,kind:'manual',format:d.format,collectionReady:!!window.WRHA_READER_SOURCES?.localCollection?.(d)})),...window.WRHA_DATA.legislation.map(d=>({id:d.id,title:d.title,kind:'law',format:d.format,collectionReady:!!window.WRHA_READER_SOURCES?.localCollection?.(d)}))]);
 await ctx.close();
 const work=all.filter(d=>manifest[d.id]);
 const unresolved=all.filter(d=>!manifest[d.id]&&!d.collectionReady);
 const collections=all.filter(d=>!manifest[d.id]&&d.collectionReady);
 const first=work.find(d=>d.id==='audit-peer-signature');
 const todo=[...(first?[first]:[]),...work.filter(d=>d!==first),...collections].filter((_,i)=>i%shards===shard);
 async function check(d,viewport,extra=false){
  const ctx=await browser.newContext({viewport,serviceWorkers:'block',acceptDownloads:true});
  // Only block publisher hosts for local PDFs; allow the application and PDF.js runtime.
  if(manifest[d.id])await ctx.route('**/*',route=>{const u=new URL(route.request().url());return u.origin===new URL(base).origin||['cdnjs.cloudflare.com','fonts.googleapis.com','fonts.gstatic.com'].includes(u.hostname)||u.protocol==='data:'||u.protocol==='blob:'?route.continue():route.abort();});
  const p=await ctx.newPage();p.setDefaultTimeout(18000);
  const rec={id:d.id,title:d.title,kind:d.kind,viewport:viewport.width,checks:{},errors:[]};
  try{
   await p.goto(base+'?liveaudit='+Date.now(),{waitUntil:'domcontentloaded'});
   await p.waitForFunction(()=>window.WRHA_DocViewer&&window.WRHA_LIBRARY_MANIFEST);
   if(await p.locator('#menuBtn').isVisible())await p.locator('#menuBtn').click();
   await p.locator('[data-view="'+(d.kind==='law'?'legislation':'manuals')+'"]').first().click();
   await p.locator(d.kind==='law'?'#lawSearch':'#manualSearch').fill(d.title);
   const card=p.locator('[data-read="'+d.kind+':'+d.id+'"]').first();await card.click();
   await p.locator('#pdfDialog[open]').waitFor();if((await p.locator('#pdfTitle').textContent())!==d.title)throw Error('Wrong reader title');rec.checks.title=true;
   if(!manifest[d.id]){
    await p.locator('#pdfWebResource:visible').waitFor();
    rec.checks.collection=true;rec.children=await p.locator('#pdfCollectionItems [data-read]').count();
    if(!rec.children)throw Error('Empty collection; needs faithful source content');
    rec.state='collection_opened';return rec;
   }
   const m=manifest[d.id];const surface=p.locator('#pdfPageSurface .reader-page-surface canvas').first();
   await surface.waitFor({timeout:45000});
   await p.waitForFunction(n=>document.querySelector('#pdfTotal').textContent.trim()==='/ '+n,m.pages);
   const painted=()=>p.evaluate(()=>{const c=document.querySelector('#pdfPageSurface .reader-page-surface canvas');return !!c&&c.width>10&&c.height>10;});
   if(!await painted())throw Error('Canvas not rendered');rec.checks.firstPage=true;rec.checks.pageCount=m.pages;
   const count=()=>p.locator('#pdfCount').textContent();
   if(m.pages>1){
    await p.locator('#pdfNext').click();
    await p.waitForFunction(()=>document.querySelector('#pdfPageSurface .reader-page-surface')?.getAttribute('aria-label')!=='Page 1');
    rec.checks.next=true;
   }
   const tools=p.locator('#pdfTools');const openTools=async()=>{if(!await tools.evaluate(e=>e.open))await tools.locator('summary').click()};await openTools();
   const go=async n=>{await openTools();await p.locator('#pdfPage').fill(String(n));await p.locator('#goPdfPage').click();await p.waitForFunction(n=>Array.from(document.querySelectorAll('#pdfPageSurface .reader-page-surface')).some(x=>x.getAttribute('aria-label')==='Page '+n),n);};
   if(m.pages>2){await go(Math.ceil(m.pages/2));rec.checks.middle=true;}
   await go(m.pages);rec.checks.last=true;
   const download=await p.locator('#pdfDownload').getAttribute('href');
   const url=new URL(download,base);
   if(url.href!==new URL(m.path,base).href)throw Error('Download does not point to same-site manifest file');
   const response=await ctx.request.get(url.href,{timeout:60000});if(!response.ok())throw Error('Download HTTP '+response.status());
   const hash=crypto.createHash('sha256').update(await response.body()).digest('hex');
   if(hash!==m.sha256)throw Error('Download checksum mismatch');
   rec.checks.download=true;
   await openTools();await p.locator('#pdfZoom').selectOption('125');rec.checks.zoomControl=true;
   if(extra){await p.locator('#pdfSound').click();if(await p.locator('#pdfSound').getAttribute('aria-pressed')!=='false')throw Error('Sound toggle failed');await p.locator('#pdfSound').click();rec.checks.soundToggle=true;}
   await p.locator('#pdfToolsClose').click();
   await p.locator('#pdfFullScreen').click();
   await p.waitForFunction(()=>document.querySelector('#pdfFullScreen').getAttribute('aria-pressed')==='true');
   rec.checks.fullscreen=true;await p.locator('#pdfFullScreen').click();
   if(extra){await openTools();await p.locator('#pdfTranscriptToggle').click();rec.checks.transcriptControl=true;await p.locator('#pdfToolsClose').click();await p.screenshot({path:'artifacts/live-reader/'+d.id+'-'+viewport.width+'.png'});}
   await p.locator('#closePdf').click();await p.locator('#pdfDialog[open]').waitFor({state:'detached'});rec.checks.close=true;
   rec.state='passed';
  }catch(e){rec.state='failed';rec.errors.push(String(e.message).slice(0,700));try{await p.screenshot({path:'artifacts/live-reader/fail-'+d.id+'-'+viewport.width+'.png'});}catch{}}
  finally{await ctx.close();}
  return rec;
 }
 let index=0;
 await Promise.all(Array.from({length:2},async()=>{while(index<todo.length){const d=todo[index++];const rec=await check(d,{width:1280,height:900},d.id==='audit-peer-signature');results.push(rec);console.log(JSON.stringify(rec));}}));
 if(shard===0)for(const d of unresolved)results.push({...d,state:'unresolved_no_local_file'});
 for(const width of [390,768,1440])if(first&&shard===0){const rec=await check(first,{width,height:width===390?844:900},true);results.push(rec);console.log(JSON.stringify(rec));}
 const primary=results.filter(r=>r.viewport===1280||!r.viewport);
 const counts=primary.reduce((o,r)=>(o[r.state]=(o[r.state]||0)+1,o),{});
 const report={shard,shards,production:base,expectedLocalFiles:Object.keys(manifest).length,totalCatalogue:all.length,counts,results};
 fs.writeFileSync('artifacts/live-reader-results.json',JSON.stringify(report,null,2));console.log('LIVE_READER_SUMMARY '+JSON.stringify({total:all.length,local:Object.keys(manifest).length,counts,deviceFailures:results.filter(r=>r.viewport!==1280&&r.viewport&&r.state==='failed').length}));
 if(results.some(r=>r.state==='failed'))process.exitCode=1;
}finally{await browser.close();}
