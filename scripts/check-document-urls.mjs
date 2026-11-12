/* Conservative static check. Live source response validation runs in the monthly audit workflow. */
import fs from 'node:fs';
const entries=JSON.parse(fs.readFileSync('reports/document-index.json','utf8'));
const pdf=entries.filter(x=>x.format==='pdf');
const looksLikeDocument=url=>/\.pdf(?:[?#]|$)/i.test(url)||/\/download(?:\/|$)/i.test(url);
const bad=pdf.filter(x=>!x.url.startsWith('https://')||!looksLikeDocument(x.url));
const nutrition=entries.find(x=>x.id==='expanded-18');
if(!nutrition||!nutrition.url.endsWith('/Nutrition-at-a-Glance-2024.pdf'))bad.push({id:'expanded-18',reason:'Nutrition still points to HTML publication page'});
if(bad.length){console.error('Incorrect PDF link classifications:',bad);process.exit(1)}
console.log('Static URL check passed for',pdf.length,'declared PDF records. HTTP magic-byte audit is separate.');
