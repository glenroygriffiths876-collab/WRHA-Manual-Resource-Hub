#!/usr/bin/env python3
"""Recoverability audit from the live catalogue; no permanent publication without approval."""
import concurrent.futures, hashlib, ipaddress, json, socket, urllib.request, urllib.parse, urllib.error, tempfile
from pathlib import Path
import fitz
MAX=90*1024*1024
REPORT=Path('document-recovery-report.json')
def validate_url(url):
    p=urllib.parse.urlsplit(url)
    if p.scheme!='https' or not p.hostname or p.username or p.password or p.port not in (443,None):
        raise ValueError('Not an approved public HTTPS URL')
    for addr in socket.getaddrinfo(p.hostname,443,type=socket.SOCK_STREAM):
        if not ipaddress.ip_address(addr[4][0]).is_global:
            raise ValueError('Non-public network destination')
    return url
class Redirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,req,fp,code,msg,headers,newurl):
        validate_url(newurl)
        return super().redirect_request(req,fp,code,msg,headers,newurl)
def try_url(d,route):
    url=route['url'];validate_url(url)
    opener=urllib.request.build_opener(Redirect())
    req=urllib.request.Request(url,headers={'User-Agent':'WRHA-Public-Document-Recovery/1.0','Accept':'application/pdf,application/octet-stream,*/*'})
    with opener.open(req,timeout=25) as rsp:
        target=validate_url(rsp.geturl())
        size=rsp.headers.get('Content-Length')
        if size and int(size)>MAX: raise ValueError('Document exceeds 90 MiB review limit')
        with tempfile.TemporaryDirectory() as td:
            f=Path(td)/'document'; h=hashlib.sha256(); n=0
            with f.open('wb') as out:
                while True:
                    b=rsp.read(1024*1024)
                    if not b:break
                    n+=len(b)
                    if n>MAX:raise ValueError('Document exceeds 90 MiB review limit')
                    h.update(b);out.write(b)
            with f.open('rb') as inp: prefix=inp.read(1024)
            result={'url':url,'resolvedUrl':target,'bytes':n,'sha256':h.hexdigest(),'cors':rsp.headers.get('Access-Control-Allow-Origin'),'type':rsp.headers.get('Content-Type'),'alternate':route.get('alternate',False)}
            if b'%PDF-' in prefix:
                with fitz.open(f,filetype='pdf') as pdf:
                    if pdf.needs_pass or pdf.page_count<1:raise ValueError('Encrypted/empty PDF')
                    expected=route.get('pages') or (3 if 'Peer Approval Signature Form' in d['title'] else None)
                    if expected and expected!=pdf.page_count:raise ValueError('Unexpected page count')
                    for i in sorted({0,pdf.page_count//2,pdf.page_count-1}):
                        pm=pdf[i].get_pixmap(matrix=fitz.Matrix(.25,.25),alpha=False)
                        if not pm.width or not pm.height:raise ValueError('Invalid render')
                    result.update(state='rendered_pdf_candidate',pages=pdf.page_count,textAvailable=bool(pdf[0].get_text().strip()))
            elif d.get('format')=='office' and (prefix.startswith(b'\xd0\xcf\x11\xe0') or prefix.startswith(b'PK\x03\x04')):
                result.update(state='office_candidate_requires_conversion')
            elif d.get('format')=='image' and prefix.startswith((b'\xff\xd8\xff',b'\x89PNG',b'RIFF')):
                result.update(state='image_candidate_requires_conversion')
            else:raise ValueError('Response was not a matching document file')
    return result
def audit(d):
    result={'id':d['id'],'title':d['title'],'format':d.get('format'),'kind':d.get('kind'),'attempts':[]}
    if d.get('format')=='page':
        result['state']='web_collection_requires_separate_source_review';return result
    routes=d.get('routes') or [{'url':d['document']}]
    for route in routes:
        try:
            v=try_url(d,route);result['attempts'].append(v);result['state']=v['state'];return result
        except Exception as e:
            result['attempts'].append({'url':route.get('url'),'error':str(e)[:220]})
    result['state']='recovery_failed'
    return result
def main():
    rows=json.loads(REPORT.read_text())['records']
    workers=4
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        results=list(pool.map(audit,rows))
    counts={}
    for row in results:counts[row['state']]=counts.get(row['state'],0)+1
    output={'counts':counts,'total':len(results),'note':'Technical candidates only: identity, edition and public redistribution authority must be reviewed. No PDFs were published by this audit.','records':results}
    Path('source-recovery-results.json').write_text(json.dumps(output,indent=2)+'\n')
    print(json.dumps({'total':len(results),'counts':counts},indent=2))
if __name__=='__main__':main()
