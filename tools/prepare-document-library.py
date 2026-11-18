#!/usr/bin/env python3
"""Prepare authorized publication copies only; no scraping, no patient data, no hidden substitutes."""
import argparse, hashlib, json, os, re, shutil, subprocess, tempfile, urllib.request
from pathlib import Path
import fitz
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
REGISTER = ROOT / 'documents' / 'source-register.json'
APPROVALS = ROOT / 'documents' / 'approved-inputs.json'
MANIFEST = ROOT / 'document-library-manifest.js'
MAX = 90 * 1024 * 1024
ID = re.compile(r'^[A-Za-z0-9_-]+$')
FORMATS = {'.pdf','.doc','.docx','.odt','.rtf','.txt','.ppt','.pptx','.odp','.xls','.xlsx','.ods','.jpg','.jpeg','.png','.webp'}
def safe_id(s):
    if not isinstance(s,str) or not ID.fullmatch(s): raise ValueError('Invalid catalogue ID')
    return s
def sha(b): return hashlib.sha256(b).hexdigest()
def gitsha(b): return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
def validate_pdf(path, expected=None):
    with open(path,'rb') as f:
        if b'%PDF-' not in f.read(1024): raise ValueError('Not a PDF: '+path.name)
    with fitz.open(path) as doc:
        if doc.needs_pass or not doc.is_pdf or doc.page_count<1: raise ValueError('Encrypted or invalid PDF')
        if expected is not None and doc.page_count!=expected: raise ValueError('Unexpected page count')
        for i in sorted({0,doc.page_count//2,doc.page_count-1}):
            pix=doc[i].get_pixmap(matrix=fitz.Matrix(.5,.5),alpha=False)
            if not pix.width or not pix.height: raise ValueError('Invalid rendered page')
        return doc.page_count
def verify_source(r, target):
    # Only download exact commit-pinned JASDIS files; no untrusted URLs or credentials.
    prefix='https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/'
    url=r['source']
    if not url.startswith(prefix) or not re.fullmatch(r'[0-9a-f]{40}/[A-Za-z0-9_.-]+\.pdf',url[len(prefix):]):
        raise ValueError('Unapproved remote source')
    request=urllib.request.Request(url,headers={'User-Agent':'WRHA-publication-preflight'})
    with urllib.request.urlopen(request,timeout=50) as data:
        if data.geturl()!=url: raise ValueError('Unexpected redirect')
        content=data.read(MAX+1)
    if len(content)>MAX or gitsha(content)!=r['gitBlob']: raise ValueError('Wrong bytes, too large, or changed Git blob')
    target.write_bytes(content)
    return validate_pdf(target)
def pdf_from_input(src,target):
    suffix=src.suffix.lower()
    if suffix not in FORMATS: raise ValueError('Unsupported file type '+suffix)
    if src.stat().st_size>MAX: raise ValueError('File exceeds size limit')
    if suffix=='.pdf': shutil.copyfile(src,target)
    elif suffix in {'.jpg','.jpeg','.png','.webp'}:
        with Image.open(src) as image: image.convert('RGB').save(target,'PDF',resolution=150)
    else:
        # Fresh isolated profile; never permit embedded macros. No source file changes.
        with tempfile.TemporaryDirectory(prefix='wrha-convert-') as td:
            profile=Path(td)/'profile'; profile.mkdir()
            (profile/'user').mkdir()
            (profile/'user'/'registrymodifications.xcu').write_text(
                '<?xml version="1.0" encoding="UTF-8"?><oor:items xmlns:oor="http://openoffice.org/2001/registry"><item oor:path="/org.openoffice.Office.Common/Security/Scripting"><prop oor:name="MacroSecurityLevel" oor:op="fuse"><value>3</value></prop></item></oor:items>',encoding='utf-8')
            result=subprocess.run(['libreoffice','-env:UserInstallation='+profile.as_uri(),'--headless','--nologo','--nodefault','--norestore','--convert-to','pdf','--outdir',td,str(src.resolve())],capture_output=True,text=True,timeout=180)
            converted=Path(td)/(src.stem+'.pdf')
            if result.returncode or not converted.exists(): raise ValueError('Office conversion failed: '+src.name)
            shutil.copyfile(converted,target)
    if target.stat().st_size>MAX: raise ValueError('Output exceeds hosting limit')
    return validate_pdf(target)
def write_cover(pdf,target):
    with fitz.open(pdf) as document:
        page=document[0]
        scale=min(3,1000/page.rect.width,1400/page.rect.height)
        pix=page.get_pixmap(matrix=fitz.Matrix(scale,scale),alpha=False)
        Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(target,'WEBP',quality=93)
def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--verify-jasdis',action='store_true',help='Check exact existing public source files, without publishing copies')
    parser.add_argument('--publish-approved',action='store_true',help='Prepare explicitly approved local source files')
    args=parser.parse_args()
    report={'sourceChecks':[],'prepared':[]}
    register=json.loads(REGISTER.read_text())
    existing=json.loads(APPROVALS.read_text())
    if args.verify_jasdis:
        for row in register:
            with tempfile.TemporaryDirectory() as td:
                try:
                    pages=verify_source(row,Path(td)/'source.pdf')
                    report['sourceChecks'].append({'id':row['id'],'pages':pages,'status':'verified'})
                except Exception as ex: report['sourceChecks'].append({'id':row['id'],'status':'failed','reason':str(ex)[:250]})
    if args.publish_approved:
        manifest=json.loads(re.search(r'Object\.freeze\((\{[\s\S]*\})\);',MANIFEST.read_text()).group(1))
        with tempfile.TemporaryDirectory() as td:
            temp=Path(td)
            (ROOT/'documents'/'library').mkdir(parents=True,exist_ok=True)
            (ROOT/'covers').mkdir(exist_ok=True)
            for row in existing:
                ident=safe_id(row['id'])
                if not all(row.get(k) for k in ('recordUrl','edition','permissionRef','sha256','input')):
                    raise ValueError('Approval metadata missing: '+ident)
                src=(ROOT/row['input']).resolve()
                if not src.is_relative_to((ROOT/'documents'/'inbox').resolve()) or not src.is_file():
                    raise ValueError('Input is not an approved local file: '+ident)
                if sha(src.read_bytes())!=row['sha256']: raise ValueError('Input hash mismatch: '+ident)
                pdf=temp/(ident+'.pdf');pages=pdf_from_input(src,pdf)
                if row.get('expectedPages') and pages!=row['expectedPages']: raise ValueError('Unexpected page count: '+ident)
                # Office conversions require explicit human visual sign-off before publication.
                if src.suffix.lower()!='.pdf' and row.get('reviewedOutputSha256')!=sha(pdf.read_bytes()):
                    review=ROOT/'documents'/'review';review.mkdir(exist_ok=True)
                    shutil.copyfile(pdf,review/(ident+'.pdf'))
                    report['prepared'].append({'id':ident,'status':'conversion needs visual review','sha256':sha(pdf.read_bytes()),'pages':pages})
                    continue
                cover=temp/(ident+'.webp');write_cover(pdf,cover)
                shutil.copyfile(pdf,ROOT/'documents'/'library'/(ident+'.pdf'))
                shutil.copyfile(cover,ROOT/'covers'/(ident+'.webp'))
                manifest[ident]={'recordUrl':row['recordUrl'],'path':'documents/library/'+ident+'.pdf','edition':row['edition'],'sha256':sha(pdf.read_bytes()),'pages':pages,'legalAlternate':bool(row.get('legalAlternate'))}
                report['prepared'].append({'id':ident,'status':'verified and prepared','pages':pages})
            MANIFEST.write_text('window.WRHA_LIBRARY_MANIFEST=Object.freeze('+json.dumps(manifest,ensure_ascii=False,indent=2)+');\n')
    (ROOT/'documents'/'preflight-report.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2))
if __name__=='__main__': main()
