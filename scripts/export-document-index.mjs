/* Export final effective catalogue, including manually verified direct PDF overrides. */
import fs from 'node:fs';
import vm from 'node:vm';
const scripts=['data.js','catalog-extra.js','document-overrides.js','establishment-resource.js','deep-manual-sources.js'];
const window={};
vm.runInNewContext(scripts.map(p=>fs.readFileSync(p,'utf8')).join('\n'),{window},{timeout:10000});
if(!window.WRHA_DATA)throw Error('Catalogue did not initialise');
const entries=[
...window.WRHA_DATA.manuals.map(d=>({...d,kind:'manual'})),
...window.WRHA_DATA.legislation.map(d=>({...d,kind:'legislation'}))
].map(d=>({id:d.id,kind:d.kind,title:d.title,format:d.format,category:d.category,
url:d.url,sourceUrl:d.sourceUrl||d.url,publisher:d.publisher||'Publisher not stated'}));
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/document-index.json',JSON.stringify(entries,null,2)+'\n');
console.log('Exported',entries.length,'source-linked entries; PDFs:',entries.filter(d=>d.format==='pdf').length);
