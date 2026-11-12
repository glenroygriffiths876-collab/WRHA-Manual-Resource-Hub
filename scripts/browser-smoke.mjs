/* Real Chromium smoke test for PDF document modal on the static GitHub Pages build. */
import {chromium} from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const ROOT=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.pdf':'application/pdf','.json':'application/json'};
const server=http.createServer((req,res)=>{
 let file;
 try{
  const pathname=decodeURIComponent((req.url||'/').split('?')[0]);
  file=path.resolve(ROOT,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(ROOT+path.sep)&&file!==ROOT)throw Error('out of root');
  const bytes=fs.readFileSync(file);
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(bytes);
 }catch{res.writeHead(404);res.end('Not found')}
});
await new Promise(resolve=>server.listen(8765,'127.0.0.1',resolve));
fs.mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1365,height:850},deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
 await page.locator('[data-view="manuals"]').click();
 await page.locator('#manualSearch').fill('Nutrition at a Glance');
 await page.locator('[data-read="manual:expanded-18"]').click();
 await page.locator('#pdfDialog[open]').waitFor();
 const source=await page.locator('#pdfSource').getAttribute('href');
 const pdf=await page.locator('#pdfDownload').getAttribute('href');
 assert(source?.includes('/data/nutrition-at-a-glance-2024/'),'Wrong source page link');
 assert(pdf?.endsWith('/Nutrition-at-a-Glance-2024.pdf'),'Nutrition reader must use genuine PDF');
 const title=await page.locator('#pdfTitle').textContent();
 assert(/Nutrition at a Glance/i.test(title));
 await page.screenshot({path:'artifacts/desktop-document-reader.png',fullPage:false});
 await page.locator('#closePdf').click();
 await page.locator('[data-view="legislation"]').click();
 await page.locator('#lawSearch').fill('Medical Act');
 const read=page.locator('#lawGrid [data-read]').first();await read.click();
 await page.locator('#pdfDialog[open]').waitFor();
 assert((await page.locator('#pdfDownload').getAttribute('href')).includes('Medical%20Act_1.pdf'),'Medical Act must link to official legal PDF');
 assert(await page.locator('#pdfLegalAlt').isVisible(),'Alternative legal portal link missing');
 await page.screenshot({path:'artifacts/legislation-reader.png',fullPage:false});
 await page.locator('#closePdf').click();
 await page.locator('[data-view="roles"]').click();
 await page.locator('#roleSearch').fill('Dental Nurse');
 assert((await page.locator('#rolesGrid').textContent()).includes('Dental Nurse'));
 const phone=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 await phone.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
 await phone.locator('#menuBtn').click();await phone.locator('[data-view="manuals"]').click();
 await phone.locator('#manualSearch').fill('Nutrition at a Glance');
 await phone.locator('[data-read="manual:expanded-18"]').click();
 await phone.locator('#pdfDialog[open]').waitFor();
 const overflow=await phone.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);
 assert(!overflow,'Mobile horizontal overflow detected');
 await phone.screenshot({path:'artifacts/mobile-document-reader.png',fullPage:false});
 console.log('CHROMIUM E2E PASS: direct PDF, modal, legal alternative, roles, mobile layout');
}finally{await browser.close();server.close()}
