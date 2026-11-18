import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=path.resolve(process.argv[2]||'_site');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const errors=[];
const check=(p)=>{const q=path.resolve(root,p);if(!q.startsWith(root+path.sep)||!fs.existsSync(q)||!fs.statSync(q).isFile()){errors.push('Missing public asset: '+p);return null;}return q;};
for(const m of html.matchAll(/(?:src|href)=["']\.\/([^"'?#]+)(?:[?#][^"']*)?["']/g)){const p=m[1];if(/\.(?:js|css|svg|png|webp|webmanifest|ico|jpg|jpeg)$/i.test(p))check(p);}
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const core=sw.match(/const CORE=\[([\s\S]*?)\];/);
if(!core)errors.push('Service worker shell list missing');
else for(const m of core[1].matchAll(/['"]\.\/([^'"]+)['"]/g))check(m[1]);
const win={};
const file=check('document-library-manifest.js');
if(file)vm.runInNewContext(fs.readFileSync(file,'utf8'),{window:win});
const library=win.WRHA_LIBRARY_MANIFEST||{};
for(const [id,entry] of Object.entries(library)){
 if(!/^[A-Za-z0-9_-]+$/.test(id)||entry.path!=='documents/library/'+id+'.pdf'||!entry.recordUrl||!entry.edition||!Number.isInteger(entry.pages)||entry.pages<1||!(/^[0-9a-f]{64}$/.test(entry.sha256||''))){errors.push('Invalid local entry: '+id);continue;}
 const p=check(entry.path);if(!p)continue;
 const b=fs.readFileSync(p);if(!b.subarray(0,1024).includes(Buffer.from('%PDF-'))||crypto.createHash('sha256').update(b).digest('hex')!==entry.sha256)errors.push('Invalid PDF or checksum mismatch: '+id);
}

const runtimeScripts=['data.js','catalog-extra.js','document-overrides.js','establishment-resource.js','deep-manual-sources.js','reader-sources.js','catalog-deep-audit-20261117.js','legal-source-routes.js','document-library-manifest.js','stable-document-routes.js'];
const runtime={};
const ctx=vm.createContext({window:runtime,URL,location:new URL('https://glenroygriffiths876-collab.github.io/WRHA-Manual-Resource-Hub/')});
for(const f of runtimeScripts){const p=check(f);if(p)vm.runInContext(fs.readFileSync(p,'utf8'),ctx,{filename:f,timeout:15000});}
const catalogue=[...(runtime.WRHA_DATA?.manuals||[]).map(d=>({...d,kind:'manual'})),...(runtime.WRHA_DATA?.legislation||[]).map(d=>({...d,kind:'legislation'}))];
const pending=catalogue.map(d=>({id:d.id,title:d.title,kind:d.kind,format:d.format,source:d.sourceUrl||d.url,document:d.url,local:!!runtime.WRHA_READER_SOURCES?.localRoute(d),routes:(runtime.WRHA_READER_SOURCES?.recoveryCandidates?.(d)||runtime.WRHA_READER_SOURCES?.readerCandidates(d)||[]).filter(r=>!r.delivery).map(r=>({url:r.url,label:r.label,pages:r.pages||null,alternate:!!r.legalAlternate}))})).filter(d=>!d.local);
for(const d of catalogue){const route=runtime.WRHA_READER_SOURCES?.localRoute(d);const routes=runtime.WRHA_READER_SOURCES?.readerCandidates(d)||[];if(routes.some(r=>!r.localLibrary)||route&&routes[0]?.url!==route.url)errors.push('External or mismatched production reader route: '+d.id)}
const peer=catalogue.find(d=>/Peer Approval Signature Form/.test(d.title));
if(!peer||peer.url!=='https://www.moh.gov.jm/wp-content/uploads/2026/03/Peer-Approval-Signature-Form-Medical-Staff.pdf')errors.push('Official peer signature source missing or changed');
const report={total:catalogue.length,manuals:catalogue.filter(d=>d.kind==='manual').length,legislation:catalogue.filter(d=>d.kind==='legislation').length,manifestRecords:Object.keys(library).length,unresolved:pending.length,records:pending};
fs.writeFileSync('document-recovery-report.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,records:undefined},null,2));
if(process.env.CHECK_NEW_LOCAL_LIBRARY==='1'){
 const baseline='41821b3a251e0133677e69683c5edd5920c8ba82', baseWin={};
 const bctx=vm.createContext({window:baseWin,URL,location:new URL('https://glenroygriffiths876-collab.github.io/WRHA-Manual-Resource-Hub/')});
 for(const f of runtimeScripts){vm.runInContext(execFileSync('git',['show',baseline+':'+f],{encoding:'utf8',maxBuffer:10*1024*1024}),bctx,{filename:f,timeout:15000});}
 const historical=new Set([...(baseWin.WRHA_DATA?.manuals||[]),...(baseWin.WRHA_DATA?.legislation||[])].map(d=>d.id));
 for(const d of pending)if(!historical.has(d.id))errors.push('New resource has no validated local copy: '+d.id);
}
if(process.env.REQUIRE_COMPLETE_LOCAL_LIBRARY==='1'&&pending.length)errors.push('Complete local library required; unresolved: '+pending.length);

console.log(JSON.stringify({checkedLocalDocuments:Object.keys(library).length,errors},null,2));
if(!Object.keys(library).length)console.warn('No locally prepared documents in this build; external-only entries remain unresolved.');
if(errors.length)process.exitCode=1;
