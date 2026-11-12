/* Export verified catalogue PDF endpoints for one-time cover generation. */
import fs from 'node:fs';
import vm from 'node:vm';
const window={};
vm.runInNewContext(fs.readFileSync('data.js','utf8')+'\n'+fs.readFileSync('catalog-extra.js','utf8'),{window},{timeout:5000});
const D=window.WRHA_DATA;
const docs=[...D.manuals,...(D.legislation||[])].filter(d=>d.format!=='page'&&(d.url?.includes('.pdf')||d.url?.includes('/download/')||d.url?.endsWith('/download')));
fs.writeFileSync('cover-input.json',JSON.stringify(docs.map(d=>({id:d.id,title:d.title,url:d.url})),null,2));
console.log('PDF candidates:',docs.length);
