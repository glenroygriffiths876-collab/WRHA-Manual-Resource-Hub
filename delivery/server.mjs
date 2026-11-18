// WRHA public publication delivery. No arbitrary destinations, credentials, disk cache or private uploads.
import http from 'node:http';
import https from 'node:https';
import {lookup} from 'node:dns/promises';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {once} from 'node:events';
const ROOT=fileURLToPath(new URL('../',import.meta.url));
const sandbox={window:{},URL}; 
for(const path of ['data.js','catalog-extra.js','document-overrides.js','establishment-resource.js','deep-manual-sources.js','reader-sources.js','catalog-deep-audit-20261117.js','legal-source-routes.js','stable-document-routes.js'])runInNewContext(readFileSync(join(ROOT,path),'utf8'),sandbox,{filename:path,timeout:3000});
const D=sandbox.window.WRHA_DATA,docs=[...D.manuals,...D.legislation];
const approvedHosts=new Set(['www.moh.gov.jm','moh.gov.jm','ncdip.moh.gov.jm','hstu.moh.gov.jm','dashboard.moh.gov.jm','www.mof.gov.jm','mof.gov.jm','moey.gov.jm','www.moey.gov.jm','new.moa.gov.jm','www.nhf.org.jm','nhf.org.jm','www.caribpesticides.net','caribpesticides.net','laws.moj.gov.jm','www.fspid.gov.jm','fspid.gov.jm','jcpd.gov.jm','www.jcpd.gov.jm','japarliament.gov.jm','www.japarliament.gov.jm','extranet.who.int','jeijamaica.gov.jm','www.jamaicatradeportal.gov.jm','jamaicatradeportal.gov.jm','cac.gov.jm','www.cac.gov.jm','dentalcouncilofjamaica.org','www.dentalcouncilofjamaica.org','dcj.gov.jm','www.dcj.gov.jm','www.srha.gov.jm','srha.gov.jm','jamaicamedicalcouncil.org','www.jamaicamedicalcouncil.org']);
const catalogue=new Map();
function safeURL(value){const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port||u.hash||!approvedHosts.has(u.hostname))throw Error('Destination not approved');return u}
for(const doc of docs){if(doc.format==='page'||doc.format==='office'||!doc.id)continue;try{const u=safeURL(doc.url);if(!u.search)catalogue.set(doc.id,{url:u.href,type:doc.format==='image'?'image':'pdf'})}catch(_){}
 for(const [i,route] of (doc.alternateLegalSources||[]).entries()){try{const u=safeURL(route.url);catalogue.set(doc.id+'/'+i,{url:u.href,type:'pdf'})}catch(_){}}
}
const origins=new Set(['https://glenroygriffiths876-collab.github.io']);
for(const origin of (process.env.WRHA_ALLOWED_ORIGINS||'').split(',').filter(Boolean)){const u=new URL(origin.trim());if(u.protocol==='https:'&&u.origin===origin.trim())origins.add(u.origin)}
const MAX=150*1024*1024,MAX_ACTIVE=4;let active=0,windowStart=Date.now(),requests=0;
function publicIPv4(ip){const a=ip.split('.').map(Number);if(a.length!==4||a.some(x=>!Number.isInteger(x)||x<0||x>255))return false;
 const [x,y,z]=a;return !(x===0||x===10||x===127||x>=224||x===169&&y===254||x===172&&y>=16&&y<=31||x===192&&(y===168||y===0||y===88&&z===99)||x===100&&y>=64&&y<=127||x===198&&(y===18||y===19||y===51&&z===100)||x===203&&y===0&&z===113)}
function sourceURL(record){const u=safeURL(record.url);if(u.hostname==='ncdip.moh.gov.jm'&&/^\/download\/\d+\/?$/.test(u.pathname))u.searchParams.set('tmstv',String(Math.floor(Date.now()/1000)));return u}
function signature(buf,type){
 if(type==='pdf')return buf.subarray(0,1024).includes(Buffer.from('%PDF-'))?'application/pdf':null;
 if(buf.length>=3&&buf[0]===255&&buf[1]===216&&buf[2]===255)return 'image/jpeg';
 if(buf.length>=8&&buf.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'image/png';
 if(buf.length>=12&&buf.subarray(0,4).toString()==='RIFF'&&buf.subarray(8,12).toString()==='WEBP')return 'image/webp';
 return null;
}
async function getPublic(url,signal,depth=0){
 if(depth>4)throw Error('Too many publisher redirects');
 const u=safeURL(url),answers=await lookup(u.hostname,{all:true,family:4});
 if(!answers.length||answers.some(a=>!publicIPv4(a.address)))throw Error('Non-public destination refused');
 const address=answers[0].address;
 const response=await new Promise((resolve,reject)=>{
  const r=https.request(u,{method:'GET',agent:false,family:4,signal,
    lookup:(_hostname,opts,callback)=>{if(typeof opts==='function'){callback=opts;opts={}};if(opts?.all)callback(null,[{address,family:4}]);else callback(null,address,4)},
    headers:{'User-Agent':'WRHA-Resource-Hub/1.0 (public publication reader)','Accept':'application/pdf,image/jpeg,image/png,image/webp;q=0.9,*/*;q=0.1','Accept-Encoding':'identity'}},resolve);
  r.setTimeout(25000,()=>r.destroy(Error('Publisher timeout')));r.on('error',reject);r.end();
 });
 const status=response.statusCode||0;
 if([301,302,303,307,308].includes(status)){const target=response.headers.location;response.destroy();if(!target)throw Error('Invalid redirect');return getPublic(new URL(target,u).href,signal,depth+1)}
 if(status!==200){response.destroy();const e=Error('Publisher returned HTTP '+status);e.upstreamStatus=status;throw e}
 if(response.headers['content-encoding']&&!/^identity$/i.test(response.headers['content-encoding'])){response.destroy();throw Error('Unsupported publisher content encoding')}
 return response;
}
function json(res,code,obj){if(res.destroyed||res.writableEnded)return;res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(obj))}
const server=http.createServer(async(req,res)=>{
 const origin=req.headers.origin;
 if(origin&&!origins.has(origin))return json(res,403,{error:'Origin not approved'});
 if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin')}
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');
 if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Methods':'GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Range','Access-Control-Max-Age':'600'});return res.end()}
 if(req.method!=='GET')return json(res,405,{error:'GET only'});
 const path=new URL(req.url,'http://localhost');
 if(path.pathname==='/health')return json(res,200,{service:'WRHA public publication delivery',catalogue:catalogue.size,storage:'none',status:'ready'});
 const match=/^\/(document|check)\/([a-zA-Z0-9_-]+)(?:\/(\d{1,2}))?$/.exec(path.pathname);
 if(!match||path.search)return json(res,404,{error:'Unknown catalogue route'});
 const doc=catalogue.get(match[2]+(match[3]!==undefined?'/'+match[3]:''));if(!doc)return json(res,404,{error:'Document not in approved catalogue'});
 if(Date.now()-windowStart>=60000){windowStart=Date.now();requests=0}
 if(active>=MAX_ACTIVE||requests>=60){res.setHeader('Retry-After','15');return json(res,429,{error:'Document service busy; retry shortly'})}
 active++;requests++;
 const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),90000);
 let upstream;
 res.on('close',()=>{if(!res.writableEnded){abort.abort();upstream?.destroy()}});
 try{
  upstream=await getPublic(sourceURL(doc).href,abort.signal);
  const size=Number(upstream.headers['content-length']);if(size>MAX)throw Error('Publication exceeds delivery size limit');
  const iterator=upstream[Symbol.asyncIterator](),chunks=[];let total=0;
  while(total<1024){const r=await iterator.next();if(r.done)break;const chunk=Buffer.from(r.value);total+=chunk.length;if(total>MAX)throw Error('Publication exceeds delivery size limit');chunks.push(chunk)}
  const prefix=Buffer.concat(chunks),mime=signature(prefix,doc.type);
  if(!mime)throw Error('Publisher returned a different file type');
  if(match[1]==='check'){upstream.destroy();return json(res,200,{id:match[2],mime,sourceResponded:true,contentLength:Number.isFinite(size)?size:null})}
  res.setHeader('Content-Type',mime);res.setHeader('Content-Disposition','inline');res.setHeader('Access-Control-Expose-Headers','Content-Length, Content-Type');
  if(Number.isSafeInteger(size)&&size>0)res.setHeader('Content-Length',String(size));
  res.writeHead(200);
  async function write(chunk){if(res.destroyed||abort.signal.aborted)throw Error('Cancelled');if(!res.write(chunk))await once(res,'drain',{signal:abort.signal})}
  await write(prefix);
  for(;;){const r=await iterator.next();if(r.done)break;total+=r.value.length;if(total>MAX)throw Error('Publication exceeds delivery size limit');await write(r.value)}
  if(Number.isSafeInteger(size)&&size>0&&total!==size)throw Error('Incomplete publisher response');
  res.end();
 }catch(e){if(!res.headersSent&&!res.destroyed)json(res,[401,403].includes(e.upstreamStatus)?403:e.upstreamStatus===404?404:502,{error:'Publisher document not available',upstreamStatus:e.upstreamStatus||null});else if(!res.writableEnded)res.destroy()}
 finally{clearTimeout(timer);upstream?.destroy();active--}
});
server.requestTimeout=100000;server.headersTimeout=10000;
server.listen(Number(process.env.PORT||10000),'0.0.0.0',()=>console.log('WRHA delivery ready: '+catalogue.size+' eligible public publications'));
