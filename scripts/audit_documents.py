"""Audit every catalogued manual and law using source HTTP responses.
No PDFs are copied or mirrored; only metadata and link status are stored.
Run in GitHub Actions (network access required):
  node scripts/export-document-index.mjs
  python -m pip install requests beautifulsoup4
  python scripts/audit_documents.py
"""
from __future__ import annotations
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from urllib.parse import urljoin, urlparse
import json, pathlib, re, requests
from bs4 import BeautifulSoup

ROOT=pathlib.Path('reports')
ITEMS=json.loads((ROOT/'document-index.json').read_text())
ALLOWED={
 'www.moh.gov.jm','moh.gov.jm','ncdip.moh.gov.jm','hstu.moh.gov.jm',
 'glenroygriffiths876-collab.github.io','laws.moj.gov.jm',
 'www.jamaicatradeportal.gov.jm','jamaicatradeportal.gov.jm'
}
UA='Mozilla/5.0 (compatible; WRHA-Manual-Resource-Hub/1.0; public document link verification)'
HEADERS={'User-Agent':UA,'Accept':'application/pdf,text/html;q=0.8,*/*;q=0.5'}
MAX_HTML=1_200_000
def safe_host(url):
 try:
  p=urlparse(url)
  return p.scheme=='https' and p.hostname in ALLOWED
 except ValueError:return False

def classify(url,include_html=False):
 if not safe_host(url):return {'state':'unsupported_host','url':url,'error':'Host not in approved official-source set'}
 try:
  with requests.get(url,headers=HEADERS,stream=True,allow_redirects=True,timeout=(8,20)) as resp:
   end=resp.url
   if not safe_host(end):return {'state':'redirect_outside_allowed_hosts','url':url,'finalUrl':end,'http':resp.status_code}
   http=resp.status_code
   ct=(resp.headers.get('Content-Type') or '').lower()
   xfo=resp.headers.get('X-Frame-Options','')
   csp=resp.headers.get('Content-Security-Policy','')
   cors=resp.headers.get('Access-Control-Allow-Origin','')
   chunks=bytearray()
   limit=MAX_HTML if include_html else 4096
   for chunk in resp.iter_content(chunk_size=16384):
    if not chunk:continue
    chunks.extend(chunk)
    if len(chunks)>=limit:break
   first=bytes(chunks).lstrip(b'\xef\xbb\xbf\x00\r\n\t ')
   pdf=first.startswith(b'%PDF-')
   if pdf and http<400:state='verified_pdf'
   elif http>=400:state='http_error'
   elif first[:120].lower().startswith((b'<!doctype html',b'<html',b'<?xml')) or 'text/html' in ct:state='html_page'
   else:state='unknown_response'
   return {'state':state,'http':http,'url':url,'finalUrl':end,'contentType':ct,'pdfSignature':pdf,
           'cors':cors,'xFrameOptions':xfo,'frameAncestorsRestricted':"frame-ancestors 'none'" in csp or "frame-ancestors 'self'" in csp,
           'byteCountHeader':resp.headers.get('Content-Length',''),
           'pageHtml':bytes(chunks).decode('utf-8',errors='replace') if state=='html_page' and include_html else ''}
 except requests.RequestException as e:
  return {'state':'network_error','url':url,'error':str(e)[:240]}

def candidates_for_html(page_url,markup):
 if not markup:return []
 soup=BeautifulSoup(markup,'html.parser')
 out=[]
 for a in soup.find_all('a',href=True):
  href=urljoin(page_url,a['href'])
  if not safe_host(href):continue
  label=a.get_text(' ',strip=True)[:140]
  if '.pdf' not in href.lower() and '/download' not in href.lower() and not re.search(r'download.*pdf|full pdf|download document',label,re.I):continue
  if href not in [x['url'] for x in out]:out.append({'url':href,'label':label})
 return out[:24]

def run(entry):
 doc=classify(entry['url'],True)
 extra=[]
 if doc['state']=='html_page':
  extra=candidates_for_html(doc.get('finalUrl',entry['url']),doc.get('pageHtml',''))
  if extra and len(extra)<=4:
   for c in extra:
    candidate=classify(c['url'],False)
    c.update({k:v for k,v in candidate.items() if k!='pageHtml'})
 doc.pop('pageHtml',None)
 return {'id':entry['id'],'kind':entry['kind'],'title':entry['title'],'declaredFormat':entry['format'],
         'sourceUrl':entry['sourceUrl'],'result':doc,'discoveredCandidates':extra}

# Deterministic ordering even when network requests complete asynchronously.
results=[None]*len(ITEMS)
with ThreadPoolExecutor(max_workers=6) as pool:
 futures={pool.submit(run,entry):i for i,entry in enumerate(ITEMS)}
 for fut in as_completed(futures):
  i=futures[fut]
  try:results[i]=fut.result()
  except Exception as e:results[i]={'id':ITEMS[i]['id'],'kind':ITEMS[i]['kind'],'title':ITEMS[i]['title'],'result':{'state':'audit_error','error':str(e)[:180]}}
  print(f"{i+1}/{len(ITEMS)} {ITEMS[i]['id']}: {results[i]['result']['state']}",flush=True)

states={}
for r in results:
 k=r['result']['state'];states[k]=states.get(k,0)+1
mismatches=[r for r in results if r['declaredFormat']=='pdf' and r['result']['state']!='verified_pdf']
resolvedPageCandidates=[r for r in results if r['declaredFormat']=='page' and any(c.get('state')=='verified_pdf' for c in r.get('discoveredCandidates',[]))]
report={'auditDateUTC':datetime.now(timezone.utc).isoformat(),'scope':'All publicly indexed manuals and legislation; remote responses from GitHub Actions',
        'records':len(results),'summary':dict(sorted(states.items())),'declaredPdfWithoutVerifiedPdf':[r['id'] for r in mismatches],
        'webPagesWithDiscoveredPdf':[r['id'] for r in resolvedPageCandidates],
        'limitations':['Verified PDF signature confirms reachable PDF content from audit runner, not CORS, browser iframe permission, legal permission to mirror or latest edition status.','Network or transient failures may differ by user location.','Generic indexes may contain multiple PDFs and require manual selection.'],
        'entries':results}
ROOT.mkdir(parents=True,exist_ok=True)
(ROOT/'document-audit.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
summary={'auditDateUTC':report['auditDateUTC'],'records':report['records'],'states':report['summary'],'incorrectPdfEntries':[{'id':r['id'],'title':r['title'],'status':r['result']['state'],'url':r['result'].get('url'),'http':r['result'].get('http')} for r in mismatches],
         'webPagesWithPossiblePdfs':[{'id':r['id'],'title':r['title'],'candidates':r['discoveredCandidates']} for r in resolvedPageCandidates]}
(ROOT/'document-audit-summary.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print('SUMMARY',json.dumps(summary['states']),flush=True)
print('Unverified PDF links:',len(mismatches),'HTML pages offering PDF:',len(resolvedPageCandidates),flush=True)
