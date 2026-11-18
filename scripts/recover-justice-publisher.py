#!/usr/bin/env python3
"""Recover verified official Justice PDFs, never bypass TLS or substitute different instruments."""
import concurrent.futures, json, os, re, shutil, ssl, socket, tempfile, urllib.request, urllib.parse, ipaddress, subprocess
from pathlib import Path
from importlib.util import spec_from_file_location,module_from_spec
from cryptography import x509
from cryptography.x509.oid import AuthorityInformationAccessOID
from cryptography.hazmat.primitives import serialization
import certifi, fitz
ROOT=Path.cwd()
def module(n,p):
    spec=spec_from_file_location(n,p);m=module_from_spec(spec);spec.loader.exec_module(m);return m
rec=module('rec',ROOT/'scripts/recover-public-sources.py')
prep=module('prep',ROOT/'tools/prepare-document-library.py')
host='laws.moj.gov.jm'
# Certificate inspection is separate from downloading. Only root-validated TLS is used for documents.
def public_host(url):
    u=urllib.parse.urlsplit(url)
    if u.scheme not in ('https','http') or u.username or u.password or not u.hostname or u.port not in (None,80,443):raise ValueError('Invalid certificate issuer URL')
    if not all(ipaddress.ip_address(i[4][0]).is_global for i in socket.getaddrinfo(u.hostname,u.port or (443 if u.scheme=='https' else 80),type=socket.SOCK_STREAM)):raise ValueError('Non-public issuer destination')
    return url
class IssuerRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,req,fp,code,msg,headers,newurl):
        public_host(newurl);return super().redirect_request(req,fp,code,msg,headers,newurl)
def trusted_context():
    ctx=ssl.create_default_context(cafile=certifi.where())
    if hasattr(ssl,'VERIFY_X509_PARTIAL_CHAIN'):ctx.verify_flags &= ~ssl.VERIFY_X509_PARTIAL_CHAIN
    try:
        with socket.create_connection((host,443), timeout=15) as s:
            with ctx.wrap_socket(s,server_hostname=host):pass
        print('Justice TLS validates using current trusted roots');return ctx
    except ssl.SSLCertVerificationError as e:
        if 'issuer' not in str(e).lower():raise
    # Retrieve public certificate only (no HTTP request, cookies or other application data).
    leaf=x509.load_pem_x509_certificate(ssl.get_server_certificate((host,443),timeout=15).encode())
    chain=[];cert=leaf
    for _ in range(3):
        if cert.issuer==cert.subject:break
        try:aia=cert.extensions.get_extension_for_class(x509.AuthorityInformationAccess).value
        except x509.ExtensionNotFound:break
        urls=[x.access_location.value for x in aia if x.access_method==AuthorityInformationAccessOID.CA_ISSUERS and isinstance(x.access_location,x509.UniformResourceIdentifier)]
        if not urls:break
        url=public_host(urls[0]);op=urllib.request.build_opener(IssuerRedirect())
        with op.open(urllib.request.Request(url,headers={'User-Agent':'WRHA-certificate-chain-verification'}),timeout=15) as rsp:data=rsp.read(1024*1024+1)
        if len(data)>1024*1024:raise ValueError('Issuer certificate too large')
        issuer=x509.load_pem_x509_certificate(data) if b'BEGIN CERTIFICATE' in data[:100] else x509.load_der_x509_certificate(data)
        if issuer.subject!=cert.issuer:raise ValueError('Issuer name mismatch')
        if issuer.issuer==issuer.subject:break # Never add a downloaded root as trusted.
        chain.append(issuer.public_bytes(serialization.Encoding.PEM));cert=issuer
    if not chain:raise ValueError('No missing intermediates recovered')
    with tempfile.TemporaryDirectory() as td:
        l=Path(td)/'leaf.pem';i=Path(td)/'intermediate.pem'
        l.write_bytes(leaf.public_bytes(serialization.Encoding.PEM));i.write_bytes(b''.join(chain))
        verdict=subprocess.run(['openssl','verify','-CAfile',certifi.where(),'-untrusted',str(i),'-purpose','sslserver','-verify_hostname',host,str(l)],capture_output=True,text=True,timeout=15)
        if verdict.returncode:raise ValueError('Certificate not rooted in trusted CA: '+verdict.stderr[:300])
    ctx.load_verify_locations(cadata=b''.join(chain).decode())
    with socket.create_connection((host,443),timeout=15) as s:
        with ctx.wrap_socket(s,server_hostname=host):pass
    print('Justice TLS validates with recovered intermediate chain');return ctx

def main():
    mp=ROOT/'document-library-manifest.js';manifest=json.loads(re.search(r'Object\.freeze\((\{[\s\S]*\})\);',mp.read_text()).group(1))
    rows=json.loads((ROOT/'document-recovery-report.json').read_text())['records']
    # Only accept exact publisher PDF endpoints and explicit official download routes from the catalogue.
    candidates=[]
    for d in rows:
        if d['kind']!='legislation':continue
        urls=[]
        for r in d.get('routes',[]):
            u=r.get('url','');p=urllib.parse.urlsplit(u)
            if p.hostname==host and (p.path.lower().endswith('.pdf') or p.path.endswith('/download')):urls.append(u)
        for u in (d.get('document'),d.get('source')):
            if u and urllib.parse.urlsplit(u).hostname==host and urllib.parse.urlsplit(u).path.lower().endswith('.pdf'):urls.append(u)
        # The legacy official record links have a downloadable PDF endpoint.
        for u in (d.get('document'),d.get('source')):
            if u and urllib.parse.urlsplit(u).hostname==host and '/library/' in u and not u.endswith('/download'):urls.append(u.rstrip('/')+'/download')
        if urls:candidates.append((d,list(dict.fromkeys(urls))))
    report={'manifestCountBefore':len(manifest),'remaining':len(rows),'retrieved':[],'unresolved':[]}
    try:ctx=trusted_context()
    except Exception as e:
        report['tlsFailure']=str(e);(ROOT/'reports'/'justice-publisher-recovery.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report));return
    class LocalRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self,req,fp,code,msg,headers,newurl):
            rec.validate_url(newurl)
            if urllib.parse.urlsplit(newurl).hostname!=host:raise ValueError('Unexpected publisher redirect')
            return super().redirect_request(req,fp,code,msg,headers,newurl)
    def get(entry):
        d,urls=entry;out={'id':d['id'],'title':d['title'],'attempts':[]}
        for u in urls:
            try:
                rec.validate_url(u);op=urllib.request.build_opener(LocalRedirect(),urllib.request.HTTPSHandler(context=ctx))
                with op.open(urllib.request.Request(u,headers={'User-Agent':'WRHA-public-document-recovery/1.0'}),timeout=20) as r:
                    if urllib.parse.urlsplit(r.geturl()).hostname!=host:raise ValueError('Unexpected host')
                    b=r.read(rec.MAX+1)
                    if len(b)>rec.MAX or b'%PDF-' not in b[:1024]:raise ValueError('Not a PDF or exceeds limit')
                with tempfile.TemporaryDirectory() as td:
                    src=Path(td)/'source.pdf';src.write_bytes(b);pages=prep.validate_pdf(src)
                    with fitz.open(src) as pdf:
                        first=' '.join(pdf[i].get_text() for i in range(min(3,pdf.page_count))).lower()
                        def norm(s):return re.sub(r'[^a-z0-9]+','',s.lower())
                        title=d['title'].replace('The ','',1).split('—')[0]
                        title=re.sub(r'\s*,\s*\d{4}.*$','',title).strip()
                        if norm(title) not in norm(first):
                            raise ValueError('Exact title not extractable; needs manual scan review')
                        if 'subsidiary' in d['title'].lower() or 'regulations' in d['title'].lower():
                            if not re.search(r'regulation|order|rule',first):raise ValueError('Subsidiary-instrument identity not shown')
                    dest=ROOT/'documents/library'/(d['id']+'.pdf');shutil.copyfile(src,dest);prep.write_cover(dest,ROOT/'covers'/(d['id']+'.webp'))
                    out['manifest']={'recordUrl':d['document'],'path':'documents/library/'+d['id']+'.pdf','edition':'Official Ministry of Justice reference copy; check amendments and commencement','sha256':prep.sha(b),'pages':pages,'legalAlternate':False,'sourceUrl':u,'permissionRef':'documents/publication-authorization.json','verifiedOn':'2026-11-17'}
                    return out
            except Exception as e:out['attempts'].append({'url':u,'error':str(e)[:240]})
        return out
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for result in pool.map(get,candidates):
            if result.get('manifest'):
                manifest[result['id']]=result.pop('manifest');report['retrieved'].append(result)
            else:report['unresolved'].append(result)
    mp.write_text('window.WRHA_LIBRARY_MANIFEST=Object.freeze('+json.dumps(manifest,ensure_ascii=False,indent=2)+');\n')
    report['manifestCount']=len(manifest)
    (ROOT/'reports'/'justice-publisher-recovery.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
if __name__=='__main__':main()
