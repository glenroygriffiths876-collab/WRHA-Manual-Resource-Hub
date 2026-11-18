import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
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
console.log(JSON.stringify({checkedLocalDocuments:Object.keys(library).length,errors},null,2));
if(!Object.keys(library).length)console.warn('No locally prepared documents in this build; external-only entries remain unresolved.');
if(errors.length)process.exitCode=1;
