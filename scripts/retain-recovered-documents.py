#!/usr/bin/env python3
"""Retain exact recovered bytes privately, publish only the individually cleared Parliament copies."""
import os,json,shutil,subprocess,sys,zipfile,tempfile,hashlib,re
from pathlib import Path
from importlib.util import spec_from_file_location,module_from_spec
from cryptography.hazmat.primitives import hashes,serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.ciphers import Cipher,algorithms,modes
import fitz
ROOT=Path.cwd()
def load(name,path):
    spec=spec_from_file_location(name,path);m=module_from_spec(spec);spec.loader.exec_module(m);return m
recover=load('recover',ROOT/'scripts/recover-public-sources.py')
prepare=load('prepare',ROOT/'tools/prepare-document-library.py')
terms='https://japarliament.gov.jm/index.php?Itemid=13&id=51&option=com_content&view=article'
# Exact signed Acts reviewed against the publisher's official index and first-page scans.
allow={
'law-9':('https://www.japarliament.gov.jm/attachments/article/341/The%20Data%20Protection%20Act,%202020%20No.%207.pdf',118,'2020 Act No. 7, as enacted'),
'audit-law-domestic-amendment':('https://japarliament.gov.jm/attachments/article/339/The-Domestic-Violence---Amendment--Act--2023-No.-20---_.pdf',6,'2023 Act No. 20, as enacted'),
'audit-law-disaster':('https://japarliament.gov.jm/attachments/341_The%20Disater%20and%20Preparedness%20and%20Emergency%20Management%20Act%2C%202015%20No.1.pdf',None,'2015 Act No. 1, as enacted')
}
def encrypt(src,dst):
    public=serialization.load_pem_public_key((ROOT/'documents/recovery-public-key.pem').read_bytes())
    key=os.urandom(32); nonce=os.urandom(12)
    wrapped=public.encrypt(key,padding.OAEP(mgf=padding.MGF1(hashes.SHA256()),algorithm=hashes.SHA256(),label=None))
    encryptor=Cipher(algorithms.AES(key),modes.GCM(nonce)).encryptor()
    header=b'WRHA1'+len(wrapped).to_bytes(2,'big')+wrapped+nonce
    encryptor.authenticate_additional_data(header)
    with src.open('rb') as f,dst.open('wb') as out:
        out.write(header)
        while True:
            block=f.read(1024*1024)
            if not block:break
            out.write(encryptor.update(block))
        out.write(encryptor.finalize());out.write(encryptor.tag)
def main():
    tmp=Path(tempfile.mkdtemp(prefix='wrha-recovery-',dir=os.environ.get('RUNNER_TEMP')))
    originals=tmp/'originals';originals.mkdir()
    os.environ['WRHA_RECOVERY_DIRECTORY']=str(originals)
    recover.main()
    report=json.loads((ROOT/'source-recovery-results.json').read_text())
    rows=json.loads((ROOT/'document-recovery-report.json').read_text())['records']
    byid={r['id']:r for r in rows}
    converted=tmp/'converted';converted.mkdir()
    for row in report['records']:
        for a in row['attempts']:
            if a.get('state','').endswith('requires_conversion') and a.get('recoveredFile'):
                try:
                    out=converted/(row['id']+'.pdf')
                    pages=prepare.pdf_from_input(originals/a['recoveredFile'],out)
                    row['conversion']={'file':out.name,'pages':pages,'status':'prepared, visual review required'}
                except Exception as e:row['conversion']={'error':str(e)[:250]}
    manifest_path=ROOT/'document-library-manifest.js'
    raw=manifest_path.read_text()
    match=re.search(r'Object\.freeze\((\{[\s\S]*\})\);',raw)
    if not match:raise ValueError('Unknown existing manifest syntax')
    manifest=json.loads(match.group(1))
    approved=[]
    lib=ROOT/'documents/library';lib.mkdir(exist_ok=True,parents=True)
    for ident,(url,pages,edition) in allow.items():
        d=byid.get(ident)
        if not d:continue
        try:
            temp=tmp/'approved';temp.mkdir(exist_ok=True)
            os.environ['WRHA_RECOVERY_DIRECTORY']=str(temp)
            v=recover.try_url(d,{'url':url,'pages':pages,'alternate':True})
            if v['state']!='rendered_pdf_candidate' or not v.get('recoveredFile'):raise ValueError('Not a PDF')
            if recover.urllib.parse.urlsplit(v['resolvedUrl']).hostname not in ('japarliament.gov.jm','www.japarliament.gov.jm'):raise ValueError('Source outside permission scope')
            f=temp/v['recoveredFile']
            dest=lib/(ident+'.pdf');shutil.copyfile(f,dest)
            prepare.write_cover(dest,ROOT/'covers'/(ident+'.webp'))
            manifest[ident]={'recordUrl':d['document'],'path':'documents/library/'+ident+'.pdf','edition':'Houses of Parliament reference reproduction; '+edition+'; check subsequent amendments; not an official WRHA or HOP edition or endorsement','sha256':v['sha256'],'pages':v['pages'],'legalAlternate':True,'sourceUrl':url,'permissionRef':terms,'verifiedOn':'2026-11-17'}
            approved.append({'id':ident,'pages':v['pages'],'sha256':v['sha256'],'source':url})
        except Exception as e:
            approved.append({'id':ident,'error':str(e)[:250]})
    if any('pages' in a for a in approved):
        manifest_path.write_text('window.WRHA_LIBRARY_MANIFEST=Object.freeze('+json.dumps(manifest,ensure_ascii=False,indent=2)+');\n')
    report['approvedPublicCopies']=approved
    report['note']='Technical candidate copies preserved in encrypted archive; no blanket redistribution approval. Public Parliament copies credited and edition-labelled.'
    (ROOT/'source-recovery-results.json').write_text(json.dumps(report,indent=2)+'\n')
    (ROOT/'reports'/'local-recovery-published.json').write_text(json.dumps({'published':approved,'sourceTerms':terms},indent=2)+'\n')
    # Never upload clear recovery files to a public repository or its artifacts.
    zip_path=tmp/'recovered.zip'
    with zipfile.ZipFile(zip_path,'w',compression=zipfile.ZIP_STORED,allowZip64=True) as z:
        for d in (originals,converted):
            for f in d.iterdir():z.write(f,d.name+'/'+f.name)
        z.write(ROOT/'source-recovery-results.json','source-recovery-results.json')
        z.write(ROOT/'document-recovery-report.json','document-recovery-report.json')
    encrypt(zip_path,ROOT/'wrha-recovered-documents.wrha')
    print(json.dumps({'actual_originals':len(list(originals.iterdir())),'converted_for_review':len(list(converted.iterdir())),'public_copies':approved,'encrypted_archive_bytes':(ROOT/'wrha-recovered-documents.wrha').stat().st_size},indent=2))
    shutil.rmtree(tmp)
if __name__=='__main__':main()
